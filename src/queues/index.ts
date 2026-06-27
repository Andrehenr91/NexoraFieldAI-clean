// ============================================================
// NexoraField AI — Queue System Entry Point (Fase 6)
// Produtores, workers e monitoramento de filas BullMQ
// ============================================================
import { Queue } from "bullmq";
import { initRedis, getRedisConnection, isRedisAvailable } from "./connection";
import { QUEUE_NAMES, RETRY_OPTIONS } from "./definitions";
import type {
  AIJobName, ClassifyTicketJobData, GenerateReportJobData, FraudCheckJobData,
  FinancialJobName, ProcessPaymentJobData, SchedulePayoutJobData, ApplyReferralCreditJobData,
  NotificationJobName, TicketNotificationJobData, PaymentNotificationJobData,
  WebhookJobName, WebhookDeliverJobData,
} from "./definitions";
import { startAIWorker, stopAIWorker } from "./workers/ai.worker";
import { startFinancialWorker, stopFinancialWorker } from "./workers/financial.worker";
import { startNotificationWorker, stopNotificationWorker } from "./workers/notification.worker";
import { startWebhookWorker, stopWebhookWorker } from "./workers/webhook.worker";

// ── Queue instances (null when Redis unavailable) ─────────────
let aiQueue:            Queue | null = null;
let financialQueue:     Queue | null = null;
let notificationQueue:  Queue | null = null;
let webhookQueue:       Queue | null = null;

// ── Initialize all queues and workers ─────────────────────────
export async function initQueues(): Promise<void> {
  const available = await initRedis();
  if (!available) return;

  const conn = getRedisConnection()!;

  aiQueue           = new Queue<any, any, AIJobName>(QUEUE_NAMES.AI,            { connection: conn });
  financialQueue    = new Queue<any, any, FinancialJobName>(QUEUE_NAMES.FINANCIAL,    { connection: conn });
  notificationQueue = new Queue<any, any, NotificationJobName>(QUEUE_NAMES.NOTIFICATIONS, { connection: conn });
  webhookQueue      = new Queue<any, any, WebhookJobName>(QUEUE_NAMES.WEBHOOKS,      { connection: conn });

  startAIWorker();
  startFinancialWorker();
  startNotificationWorker();
  startWebhookWorker();

  console.log("[Queues] ✅ Todas as filas BullMQ inicializadas com sucesso.");
}

export async function stopQueues(): Promise<void> {
  await Promise.allSettled([
    stopAIWorker(), stopFinancialWorker(),
    stopNotificationWorker(), stopWebhookWorker(),
    aiQueue?.close(), financialQueue?.close(),
    notificationQueue?.close(), webhookQueue?.close(),
  ]);
}

// ── AI Producers ──────────────────────────────────────────────
export async function enqueueClassifyTicket(data: ClassifyTicketJobData): Promise<string | null> {
  if (!aiQueue) return null;
  const job = await aiQueue.add("classify-ticket", data, {
    ...RETRY_OPTIONS.critical,
    jobId: `classify-${data.ticketId}`,  // idempotente
    delay: 500,                           // aguarda 500ms após criação
  });
  return job.id ?? null;
}

export async function enqueueGenerateReport(data: GenerateReportJobData): Promise<string | null> {
  if (!aiQueue) return null;
  const job = await aiQueue.add("generate-report", data, {
    ...RETRY_OPTIONS.critical,
    jobId: `report-${data.ticketId}`,
  });
  return job.id ?? null;
}

export async function enqueueFraudCheck(data: FraudCheckJobData): Promise<string | null> {
  if (!aiQueue) return null;
  const job = await aiQueue.add("fraud-check", data, {
    ...RETRY_OPTIONS.standard,
    jobId: `fraud-${data.ticketId}`,
    priority: 1,  // alta prioridade
  });
  return job.id ?? null;
}

// ── Financial Producers ───────────────────────────────────────
export async function enqueueProcessPayment(data: ProcessPaymentJobData): Promise<string | null> {
  if (!financialQueue) return null;
  const job = await financialQueue.add("process-payment", data, {
    ...RETRY_OPTIONS.critical,
    jobId: `payment-${data.transactionId}`,
  });
  return job.id ?? null;
}

export async function enqueueSchedulePayout(data: SchedulePayoutJobData): Promise<string | null> {
  if (!financialQueue) return null;
  const payoutDate = new Date(data.scheduledForISO);
  const delay      = Math.max(0, payoutDate.getTime() - Date.now());
  const job = await financialQueue.add("schedule-payout", data, {
    ...RETRY_OPTIONS.critical,
    jobId: `payout-${data.transactionId}`,
    delay,  // aguarda até o D+2
  });
  return job.id ?? null;
}

export async function enqueueReferralCredit(data: ApplyReferralCreditJobData): Promise<string | null> {
  if (!financialQueue) return null;
  const job = await financialQueue.add("apply-referral-credit", data, {
    ...RETRY_OPTIONS.standard,
  });
  return job.id ?? null;
}

// ── Notification Producers ────────────────────────────────────
export async function enqueueNotification(
  name: NotificationJobName,
  data: TicketNotificationJobData | PaymentNotificationJobData,
): Promise<string | null> {
  if (!notificationQueue) return null;
  const job = await notificationQueue.add(name, data, RETRY_OPTIONS.low);
  return job.id ?? null;
}

// ── Webhook Producer ──────────────────────────────────────────
export async function enqueueWebhookDelivery(data: WebhookDeliverJobData): Promise<string | null> {
  if (!webhookQueue) return null;
  const job = await webhookQueue.add("deliver", data, {
    ...RETRY_OPTIONS.critical,
    jobId: `wh-${data.webhookId}-${Date.now()}`,
  });
  return job.id ?? null;
}

// ── Queue Stats (para monitoramento /api/queues) ──────────────
export async function getQueueStats() {
  if (!isRedisAvailable()) {
    return {
      available: false,
      message:   "Redis indisponível — processamento inline ativo",
      queues:    [],
    };
  }

  const queues = [
    { name: "AI",            queue: aiQueue,            queueName: QUEUE_NAMES.AI },
    { name: "Financeiro",    queue: financialQueue,     queueName: QUEUE_NAMES.FINANCIAL },
    { name: "Notificações",  queue: notificationQueue,  queueName: QUEUE_NAMES.NOTIFICATIONS },
    { name: "Webhooks",      queue: webhookQueue,       queueName: QUEUE_NAMES.WEBHOOKS },
  ];

  const stats = await Promise.all(
    queues.map(async ({ name, queue, queueName }) => {
      if (!queue) return { name, queueName, available: false };
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);
      // DLQ: jobs que esgotaram todas as tentativas
      const dlqJobs = await queue.getFailed(0, 9);
      return {
        name, queueName, available: true,
        waiting, active, completed, failed, delayed,
        dlq: dlqJobs.map(j => ({
          id:       j.id,
          name:     j.name,
          failedAt: j.finishedOn,
          reason:   j.failedReason,
          attempts: j.attemptsMade,
        })),
      };
    })
  );

  return { available: true, queues: stats };
}
