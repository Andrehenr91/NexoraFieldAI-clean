// ============================================================
// NexoraField AI — Notification Queue Worker (Fase 6)
// Notificações assíncronas: email, push, WhatsApp
// ============================================================
import { Worker, Job } from "bullmq";
import type {
  NotificationJobName,
  TicketNotificationJobData,
  PaymentNotificationJobData,
} from "../definitions";
import { QUEUE_NAMES } from "../definitions";
import { getRedisConnection } from "../connection";
import { db } from "../../../db/index";
import { technicians, companies } from "../../../db/schema";
import { eq } from "drizzle-orm";

// ── Templates de notificação ──────────────────────────────────
const TEMPLATES: Record<string, (data: any) => { subject: string; body: string }> = {
  "ticket-created": (d) => ({
    subject: `[NexoraField] Novo chamado criado: ${d.ticketTitle}`,
    body:    `Seu chamado "${d.ticketTitle}" foi criado com sucesso e está sendo processado pela IA.`,
  }),
  "ticket-assigned": (d) => ({
    subject: `[NexoraField] Chamado atribuído: ${d.ticketTitle}`,
    body:    `Você recebeu uma nova atribuição: "${d.ticketTitle}". Acesse a plataforma para aceitar.`,
  }),
  "ticket-status-changed": (d) => ({
    subject: `[NexoraField] Status atualizado: ${d.ticketTitle}`,
    body:    `O chamado "${d.ticketTitle}" mudou de "${d.previousStatus}" para "${d.status}".`,
  }),
  "payment-processed": (d) => ({
    subject: `[NexoraField] Pagamento processado: R$ ${d.amount?.toFixed(2)}`,
    body:    `Seu repasse de R$ ${d.amount?.toFixed(2)} foi processado via ${d.method} e será creditado em até 2 dias úteis.`,
  }),
  "invite-sent": (d) => ({
    subject: `[NexoraField] Convite de chamado: ${d.ticketTitle}`,
    body:    `Você foi convidado para o chamado "${d.ticketTitle}". Acesse a plataforma para aceitar ou recusar.`,
  }),
};

// ── Simulação de envio (substituir por integração real em produção) ──
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  // Em produção: integrar com SendGrid / SES / Postmark
  console.log(`[Notification] 📧 Email → ${to} | ${subject}`);
  // Simula latência de envio
  await new Promise(r => setTimeout(r, 50));
}

async function sendWhatsApp(to: string, message: string): Promise<void> {
  // Em produção: integrar com Twilio / Z-API / WPPConnect
  console.log(`[Notification] 💬 WhatsApp → ${to} | ${message.slice(0, 60)}...`);
  await new Promise(r => setTimeout(r, 30));
}

async function sendPush(userId: string, title: string, body: string): Promise<void> {
  // Em produção: integrar com FCM / APNS via Firebase Admin
  console.log(`[Notification] 🔔 Push → ${userId} | ${title}`);
  await new Promise(r => setTimeout(r, 20));
}

async function processNotificationJob(job: Job<any, any, NotificationJobName>) {
  const { name, data } = job;
  const template = TEMPLATES[name];
  if (!template) throw new Error(`Template de notificação desconhecido: ${name}`);

  const { subject, body } = template(data);
  const sent: string[] = [];

  await job.updateProgress(20);

  // ── Identifica destinatários ──────────────────────────────
  switch (name) {
    case "ticket-created":
    case "ticket-status-changed": {
      const d = data as TicketNotificationJobData;

      if (d.companyId) {
        const [comp] = await db.select().from(companies).where(eq(companies.id, d.companyId));
        if (comp?.email) {
          if (d.channels.includes("email")) {
            await sendEmail(comp.email, subject, body);
            sent.push(`email:${comp.email}`);
          }
        }
      }

      if (d.technicianId) {
        const [tech] = await db.select().from(technicians).where(eq(technicians.id, d.technicianId));
        if (tech) {
          if (d.channels.includes("email") && tech.email) {
            await sendEmail(tech.email, subject, body);
            sent.push(`email:${tech.email}`);
          }
          if (d.channels.includes("whatsapp") && tech.whatsapp) {
            await sendWhatsApp(tech.whatsapp, body);
            sent.push(`whatsapp:${tech.whatsapp}`);
          }
          if (d.channels.includes("push")) {
            await sendPush(d.technicianId, subject, body);
            sent.push(`push:${d.technicianId}`);
          }
        }
      }
      break;
    }

    case "ticket-assigned":
    case "invite-sent": {
      const d = data as TicketNotificationJobData;
      if (d.technicianId) {
        const [tech] = await db.select().from(technicians).where(eq(technicians.id, d.technicianId));
        if (tech) {
          if (d.channels.includes("email") && tech.email) {
            await sendEmail(tech.email, subject, body);
            sent.push(`email:${tech.email}`);
          }
          if (d.channels.includes("whatsapp") && tech.whatsapp) {
            await sendWhatsApp(tech.whatsapp, body);
            sent.push(`whatsapp:${tech.whatsapp}`);
          }
          if (d.channels.includes("push")) {
            await sendPush(d.technicianId, subject, body);
            sent.push(`push:${d.technicianId}`);
          }
        }
      }
      break;
    }

    case "payment-processed": {
      const d = data as PaymentNotificationJobData;
      const [tech] = await db.select().from(technicians).where(eq(technicians.id, d.technicianId));
      if (tech) {
        if (tech.email) {
          await sendEmail(tech.email, subject, body);
          sent.push(`email:${tech.email}`);
        }
        if (tech.whatsapp) {
          await sendWhatsApp(tech.whatsapp, body);
          sent.push(`whatsapp:${tech.whatsapp}`);
        }
      }
      break;
    }
  }

  await job.updateProgress(100);
  console.log(`[Notification] ✅ Job "${name}" — ${sent.length} notificações enviadas`);
  return { sent, count: sent.length };
}

let notificationWorker: Worker | null = null;

export function startNotificationWorker(): Worker | null {
  const conn = getRedisConnection();
  if (!conn) return null;

  notificationWorker = new Worker<any, any, NotificationJobName>(
    QUEUE_NAMES.NOTIFICATIONS,
    processNotificationJob,
    {
      connection: conn,
      concurrency: 10,
    }
  );

  notificationWorker.on("completed", (job, result) => {
    console.log(`[Notification Worker] ✅ ${job.name} | ${result.count} enviados`);
  });

  notificationWorker.on("failed", (job, err) => {
    console.error(`[Notification Worker] ❌ ${job?.name} falhou:`, err.message);
  });

  console.log("[Notification Worker] ✅ Worker iniciado na fila:", QUEUE_NAMES.NOTIFICATIONS);
  return notificationWorker;
}

export async function stopNotificationWorker(): Promise<void> {
  await notificationWorker?.close();
  notificationWorker = null;
}
