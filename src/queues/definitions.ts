// ============================================================
// NexoraField AI — Queue & Job Definitions (Fase 6)
// ============================================================

// ── Queue names ──────────────────────────────────────────────
export const QUEUE_NAMES = {
  AI:            "nexora:ai",
  FINANCIAL:     "nexora:financial",
  NOTIFICATIONS: "nexora:notifications",
  WEBHOOKS:      "nexora:webhooks",
} as const;

// ── AI Queue Job Types ────────────────────────────────────────
export type AIJobName =
  | "classify-ticket"
  | "match-technician"
  | "generate-report"
  | "fraud-check";

export interface ClassifyTicketJobData {
  ticketId: string;
  description: string;
  companyId?: string;
}
export interface MatchTechnicianJobData {
  ticketId: string;
  technicianIds: string[];
}
export interface GenerateReportJobData {
  ticketId: string;
  technicianId: string;
  checklist: any[];
  evidencePhotos: string[];
}
export interface FraudCheckJobData {
  ticketId: string;
  technicianId: string;
  gpsData?: { lat: number; lng: number };
  executionTimeMin?: number;
}

// ── Financial Queue Job Types ─────────────────────────────────
export type FinancialJobName =
  | "process-payment"
  | "schedule-payout"
  | "apply-referral-credit";

export interface ProcessPaymentJobData {
  transactionId: string;
  ticketId: string;
  totalAmount: number;
  commissionPct: number;
  technicianId: string;
  companyId: string;
  paymentMethod: "pix" | "boleto" | "credito" | "debito";
}
export interface SchedulePayoutJobData {
  transactionId: string;
  technicianId: string;
  techPayout: number;
  pixKey?: string;
  pixType?: string;
  scheduledForISO: string;   // ISO date string D+2
}
export interface ApplyReferralCreditJobData {
  referrerId: string;
  referrerType: "technician" | "company";
  creditAmount: number;
  sourceEvent: string;
}

// ── Notification Queue Job Types ──────────────────────────────
export type NotificationJobName =
  | "ticket-created"
  | "ticket-assigned"
  | "ticket-status-changed"
  | "payment-processed"
  | "invite-sent";

export interface TicketNotificationJobData {
  ticketId: string;
  ticketTitle: string;
  companyId?: string;
  technicianId?: string;
  status?: string;
  previousStatus?: string;
  channels: Array<"email" | "push" | "whatsapp">;
}
export interface PaymentNotificationJobData {
  transactionId: string;
  technicianId: string;
  amount: number;
  method: string;
}

// ── Webhook Queue Job Types ────────────────────────────────────
export type WebhookJobName = "deliver";

export interface WebhookDeliverJobData {
  webhookId: string;
  url: string;
  secret: string;
  event: string;
  payload: Record<string, any>;
  attempt?: number;
}

// ── Retry Options Presets ─────────────────────────────────────
export const RETRY_OPTIONS = {
  /** Jobs críticos: 5 tentativas com backoff exponencial */
  critical: {
    attempts: 5,
    backoff: { type: "exponential" as const, delay: 2000 },
    removeOnComplete: { count: 100, age: 24 * 3600 },
    removeOnFail: false,           // mantém na DLQ para inspeção
  },
  /** Jobs normais: 3 tentativas */
  standard: {
    attempts: 3,
    backoff: { type: "exponential" as const, delay: 1000 },
    removeOnComplete: { count: 50, age: 12 * 3600 },
    removeOnFail: false,
  },
  /** Jobs de baixa prioridade: 2 tentativas */
  low: {
    attempts: 2,
    backoff: { type: "fixed" as const, delay: 5000 },
    removeOnComplete: { count: 20, age: 6 * 3600 },
    removeOnFail: { count: 100 },
  },
};
