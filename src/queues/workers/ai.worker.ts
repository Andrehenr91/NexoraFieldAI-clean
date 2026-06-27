// ============================================================
// NexoraField AI — AI Queue Worker (Fase 6)
// Processamento assíncrono de classificação, match e laudos
// ============================================================
import { Worker, Job } from "bullmq";
import type {
  AIJobName,
  ClassifyTicketJobData,
  MatchTechnicianJobData,
  GenerateReportJobData,
  FraudCheckJobData,
} from "../definitions";
import { QUEUE_NAMES } from "../definitions";
import { getRedisConnection } from "../connection";
import { db } from "../../../db/index";
import { tickets, technicians, aiAuditLogs } from "../../../db/schema";
import { eq } from "drizzle-orm";

async function logAudit(ticketId: string, type: string, message: string, details?: any) {
  try {
    await db.insert(aiAuditLogs).values({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ticketId,
      type,
      message,
      details: details || null,
      timestamp: new Date(),
    });
  } catch { /* ignore audit errors */ }
}

async function processAIJob(job: Job<any, any, AIJobName>) {
  const { name, data } = job;

  switch (name) {
    // ── 1. Classificar chamado ─────────────────────────────
    case "classify-ticket": {
      const d = data as ClassifyTicketJobData;
      await job.updateProgress(10);

      // Buscar dados do ticket no banco
      const [ticket] = await db.select().from(tickets).where(eq(tickets.id, d.ticketId));
      if (!ticket) throw new Error(`Ticket ${d.ticketId} não encontrado`);

      await job.updateProgress(30);

      // Chamar API interna de classificação
      const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/ai/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: d.description }),
      });

      if (!response.ok) throw new Error(`Classificação falhou: HTTP ${response.status}`);
      const classification = await response.json();

      await job.updateProgress(70);

      // Atualizar ticket com classificação da IA
      await db.update(tickets).set({
        title:         classification.title         || ticket.title,
        category:      classification.category      || ticket.category,
        specialty:     classification.specialty     || ticket.specialty,
        urgency:       classification.urgency       || ticket.urgency,
        suggestedValue: classification.suggestedValue || ticket.suggestedValue,
        updatedAt:     new Date(),
      }).where(eq(tickets.id, d.ticketId));

      await logAudit(d.ticketId, "ai_classification", "Classificação automática concluída via fila", {
        jobId: job.id,
        result: classification,
        confidence: classification.confidence,
      });

      await job.updateProgress(100);
      return { ticketId: d.ticketId, classification };
    }

    // ── 2. Gerar laudo técnico ─────────────────────────────
    case "generate-report": {
      const d = data as GenerateReportJobData;
      await job.updateProgress(10);

      const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/ai/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: d.ticketId,
          technicianId: d.technicianId,
          checklist: d.checklist,
          evidencePhotos: d.evidencePhotos,
        }),
      });

      if (!response.ok) throw new Error(`Geração de laudo falhou: HTTP ${response.status}`);
      const { report } = await response.json();

      await job.updateProgress(80);

      await db.update(tickets).set({
        technicalReport: report,
        updatedAt: new Date(),
      }).where(eq(tickets.id, d.ticketId));

      await logAudit(d.ticketId, "ai_report", "Laudo técnico gerado automaticamente via fila", { jobId: job.id });

      await job.updateProgress(100);
      return { ticketId: d.ticketId, reportLength: report?.length };
    }

    // ── 3. Detecção de fraude ──────────────────────────────
    case "fraud-check": {
      const d = data as FraudCheckJobData;
      await job.updateProgress(10);

      const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/ai/fraud-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: d.ticketId,
          technicianId: d.technicianId,
          gpsData: d.gpsData,
          executionTimeMin: d.executionTimeMin,
        }),
      });

      if (!response.ok) throw new Error(`Fraud check falhou: HTTP ${response.status}`);
      const result = await response.json();

      await job.updateProgress(80);

      if (result.alerts?.length > 0) {
        const [current] = await db.select().from(tickets).where(eq(tickets.id, d.ticketId));
        const existingAlerts = Array.isArray(current?.fraudAlerts) ? current.fraudAlerts : [];
        await db.update(tickets).set({
          fraudAlerts: [...existingAlerts, ...result.alerts],
          updatedAt: new Date(),
        }).where(eq(tickets.id, d.ticketId));

        await logAudit(d.ticketId, "fraud_detected", `${result.alerts.length} alerta(s) de fraude detectado(s) via fila`, {
          jobId: job.id,
          alerts: result.alerts,
        });
      }

      await job.updateProgress(100);
      return { ticketId: d.ticketId, alerts: result.alerts?.length || 0 };
    }

    // ── 4. Match de técnicos ──────────────────────────────
    case "match-technician": {
      const d = data as MatchTechnicianJobData;
      await job.updateProgress(50);
      // Match já é feito sincronamente no endpoint; aqui apenas registra no audit
      await logAudit(d.ticketId, "ai_match", "Match de técnicos processado via fila", { jobId: job.id });
      await job.updateProgress(100);
      return { ticketId: d.ticketId };
    }

    default:
      throw new Error(`Tipo de job AI desconhecido: ${name}`);
  }
}

let aiWorker: Worker | null = null;

export function startAIWorker(): Worker | null {
  const conn = getRedisConnection();
  if (!conn) return null;

  aiWorker = new Worker<any, any, AIJobName>(
    QUEUE_NAMES.AI,
    processAIJob,
    {
      connection: conn,
      concurrency: 3,
      limiter: { max: 10, duration: 1000 },  // max 10 jobs/s (Gemini rate limit)
    }
  );

  aiWorker.on("completed", (job, result) => {
    console.log(`[AI Worker] ✅ Job ${job.id} (${job.name}) concluído:`, result);
  });

  aiWorker.on("failed", (job, err) => {
    console.error(`[AI Worker] ❌ Job ${job?.id} (${job?.name}) falhou (tentativa ${job?.attemptsMade}/${job?.opts.attempts}):`, err.message);
  });

  aiWorker.on("stalled", (jobId) => {
    console.warn(`[AI Worker] ⚠️ Job ${jobId} travado (stalled)`);
  });

  console.log("[AI Worker] ✅ Worker iniciado na fila:", QUEUE_NAMES.AI);
  return aiWorker;
}

export async function stopAIWorker(): Promise<void> {
  await aiWorker?.close();
  aiWorker = null;
}
