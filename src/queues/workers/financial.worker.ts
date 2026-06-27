// ============================================================
// NexoraField AI — Financial Queue Worker (Fase 6)
// Processamento assíncrono de pagamentos, comissões e repasses
// ============================================================
import { Worker, Job } from "bullmq";
import type {
  FinancialJobName,
  ProcessPaymentJobData,
  SchedulePayoutJobData,
  ApplyReferralCreditJobData,
} from "../definitions";
import { QUEUE_NAMES } from "../definitions";
import { getRedisConnection } from "../connection";
import { db } from "../../../db/index";
import { financialTransactions, technicians, companies, aiAuditLogs } from "../../../db/schema";
import { eq } from "drizzle-orm";

async function auditFinancial(message: string, details?: any) {
  try {
    await db.insert(aiAuditLogs).values({
      id: `fin-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ticketId: details?.ticketId || null,
      type: "financial",
      message,
      details: details || null,
      timestamp: new Date(),
    });
  } catch { /* ignore */ }
}

async function processFinancialJob(job: Job<any, any, FinancialJobName>) {
  const { name, data } = job;

  switch (name) {
    // ── 1. Processar Pagamento ─────────────────────────────
    case "process-payment": {
      const d = data as ProcessPaymentJobData;
      await job.updateProgress(10);

      // Calcula divisão: comissão da plataforma + repasse ao técnico
      const commission = d.totalAmount * (d.commissionPct / 100);
      const techPayout  = d.totalAmount - commission;

      await job.updateProgress(30);

      // Atualiza transação com valores calculados
      await db.update(financialTransactions).set({
        platformEarnings:  commission,
        techPayout:        techPayout,
        platformCommission: d.commissionPct,
        status:            "Processado",
      }).where(eq(financialTransactions.id, d.transactionId));

      await job.updateProgress(60);

      // Agenda repasse ao técnico (D+2)
      const payoutDate = new Date();
      payoutDate.setDate(payoutDate.getDate() + 2);

      await auditFinancial("Pagamento processado com sucesso", {
        transactionId: d.transactionId,
        ticketId:      d.ticketId,
        totalAmount:   d.totalAmount,
        commission:    commission.toFixed(2),
        techPayout:    techPayout.toFixed(2),
        paymentMethod: d.paymentMethod,
        payoutScheduled: payoutDate.toISOString(),
      });

      await job.updateProgress(100);
      return {
        transactionId: d.transactionId,
        commission:    +commission.toFixed(2),
        techPayout:    +techPayout.toFixed(2),
      };
    }

    // ── 2. Agendar Repasse ao Técnico ─────────────────────
    case "schedule-payout": {
      const d = data as SchedulePayoutJobData;
      await job.updateProgress(20);

      // Em produção: integração com PSP (Pagar.me, Stripe, Iugu)
      // Aqui: simula agendamento e registra na auditoria
      const simulatedTxId = `pix-${Date.now()}`;

      await auditFinancial("Repasse ao técnico agendado", {
        transactionId:  d.transactionId,
        technicianId:   d.technicianId,
        amount:         d.techPayout,
        pixKey:         d.pixKey,
        pixType:        d.pixType,
        scheduledFor:   d.scheduledForISO,
        gatewayTxId:    simulatedTxId,
      });

      // Atualiza pontos de gamificação do técnico (+10 pontos por job pago)
      const [tech] = await db.select().from(technicians).where(eq(technicians.id, d.technicianId));
      if (tech) {
        await db.update(technicians).set({
          points:             (tech.points || 0) + 10,
          completedJobsCount: (tech.completedJobsCount || 0) + 1,
          updatedAt:          new Date(),
        }).where(eq(technicians.id, d.technicianId));
      }

      await job.updateProgress(100);
      return { scheduledTxId: simulatedTxId, amount: d.techPayout };
    }

    // ── 3. Aplicar Créditos de Indicação ─────────────────
    case "apply-referral-credit": {
      const d = data as ApplyReferralCreditJobData;
      await job.updateProgress(20);

      if (d.referrerType === "technician") {
        const [tech] = await db.select().from(technicians).where(eq(technicians.id, d.referrerId));
        if (tech) {
          await db.update(technicians).set({
            referralCredits: (tech.referralCredits || 0) + d.creditAmount,
            points:          (tech.points || 0) + Math.floor(d.creditAmount),
            updatedAt:       new Date(),
          }).where(eq(technicians.id, d.referrerId));
        }
      } else {
        const [comp] = await db.select().from(companies).where(eq(companies.id, d.referrerId));
        if (comp) {
          await db.update(companies).set({
            referralCredits: (comp.referralCredits || 0) + d.creditAmount,
            updatedAt:       new Date(),
          }).where(eq(companies.id, d.referrerId));
        }
      }

      await auditFinancial("Crédito de indicação aplicado", {
        referrerId:   d.referrerId,
        referrerType: d.referrerType,
        amount:       d.creditAmount,
        event:        d.sourceEvent,
      });

      await job.updateProgress(100);
      return { applied: true, amount: d.creditAmount };
    }

    default:
      throw new Error(`Tipo de job financeiro desconhecido: ${name}`);
  }
}

let financialWorker: Worker | null = null;

export function startFinancialWorker(): Worker | null {
  const conn = getRedisConnection();
  if (!conn) return null;

  financialWorker = new Worker<any, any, FinancialJobName>(
    QUEUE_NAMES.FINANCIAL,
    processFinancialJob,
    {
      connection: conn,
      concurrency: 5,
    }
  );

  financialWorker.on("completed", (job, result) => {
    console.log(`[Financial Worker] ✅ Job ${job.id} (${job.name}) concluído:`, result);
  });

  financialWorker.on("failed", (job, err) => {
    console.error(`[Financial Worker] ❌ Job ${job?.id} falhou (${job?.attemptsMade} tentativas):`, err.message);
  });

  console.log("[Financial Worker] ✅ Worker iniciado na fila:", QUEUE_NAMES.FINANCIAL);
  return financialWorker;
}

export async function stopFinancialWorker(): Promise<void> {
  await financialWorker?.close();
  financialWorker = null;
}
