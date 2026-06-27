// ============================================================
// NexoraField AI — Webhook Queue Worker (Fase 6)
// Entrega assíncrona de webhooks com retry e DLQ
// ============================================================
import { Worker, Job } from "bullmq";
import type { WebhookJobName, WebhookDeliverJobData } from "../definitions";
import { QUEUE_NAMES } from "../definitions";
import { getRedisConnection } from "../connection";
import { db } from "../../../db/index";
import { webhooks, webhookDeliveries } from "../../../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

function signPayload(payload: string, secret: string): string {
  return "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

async function processWebhookJob(job: Job<WebhookDeliverJobData, any, WebhookJobName>) {
  const { data } = job;
  const { webhookId, url, secret, event, payload } = data;

  const bodyStr = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    attempt:   (job.attemptsMade || 0) + 1,
    data:      payload,
  });
  const signature = signPayload(bodyStr, secret);

  await job.updateProgress(10);

  const start = Date.now();
  let statusCode = 0;
  let responseBody = "";
  let errorMsg = "";
  let deliveryStatus: "success" | "error" = "error";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method:  "POST",
      headers: {
        "Content-Type":       "application/json",
        "X-Nexora-Signature": signature,
        "X-Nexora-Event":     event,
        "X-Nexora-Delivery":  job.id || crypto.randomUUID(),
        "User-Agent":         "NexoraField-Webhooks/7.0",
      },
      body:   bodyStr,
      signal: controller.signal,
    });

    clearTimeout(timer);
    statusCode    = response.status;
    responseBody  = (await response.text()).slice(0, 500);
    deliveryStatus = response.ok ? "success" : "error";
  } catch (err: any) {
    errorMsg = err.message || "Request failed";
    deliveryStatus = "error";
  }

  const duration = Date.now() - start;
  await job.updateProgress(70);

  // Persiste log de entrega
  await db.insert(webhookDeliveries).values({
    webhookId:    webhookId as any,
    event,
    payload:      payload as any,
    statusCode:   statusCode || null,
    status:       deliveryStatus,
    responseBody: responseBody || null,
    error:        errorMsg || null,
    duration,
    deliveredAt:  new Date(),
  });

  // Atualiza metadados do webhook
  await db.update(webhooks).set({
    lastStatus:      deliveryStatus,
    lastStatusCode:  statusCode || null,
    lastDeliveredAt: new Date(),
    lastError:       errorMsg || null,
    deliveryCount:   (await db.select().from(webhooks).where(eq(webhooks.id, webhookId as any)))[0]?.deliveryCount as any + 1 || 1,
    updatedAt:       new Date(),
  }).where(eq(webhooks.id, webhookId as any));

  await job.updateProgress(100);

  if (deliveryStatus === "error") {
    // Força retry pelo BullMQ ao lançar erro
    throw new Error(errorMsg || `HTTP ${statusCode} do endpoint ${url}`);
  }

  console.log(`[Webhook Worker] ✅ Entregue: ${event} → ${url} (${statusCode}) em ${duration}ms`);
  return { webhookId, event, statusCode, duration };
}

let webhookWorker: Worker | null = null;

export function startWebhookWorker(): Worker | null {
  const conn = getRedisConnection();
  if (!conn) return null;

  webhookWorker = new Worker<WebhookDeliverJobData, any, WebhookJobName>(
    QUEUE_NAMES.WEBHOOKS,
    processWebhookJob,
    {
      connection:  conn,
      concurrency: 20,
      limiter:     { max: 50, duration: 1000 },  // 50 webhooks/s
    }
  );

  webhookWorker.on("completed", (job) => {
    console.log(`[Webhook Worker] ✅ Job ${job.id} entregue`);
  });

  webhookWorker.on("failed", (job, err) => {
    const isLastAttempt = (job?.attemptsMade || 0) >= (job?.opts.attempts || 1);
    if (isLastAttempt) {
      console.error(`[Webhook Worker] 💀 DLQ: Job ${job?.id} (${job?.data.event}) → ${job?.data.url} após ${job?.attemptsMade} tentativas: ${err.message}`);
    } else {
      console.warn(`[Webhook Worker] ⚠️ Job ${job?.id} falhou (tentativa ${job?.attemptsMade}): ${err.message} — retry agendado`);
    }
  });

  console.log("[Webhook Worker] ✅ Worker iniciado na fila:", QUEUE_NAMES.WEBHOOKS);
  return webhookWorker;
}

export async function stopWebhookWorker(): Promise<void> {
  await webhookWorker?.close();
  webhookWorker = null;
}
