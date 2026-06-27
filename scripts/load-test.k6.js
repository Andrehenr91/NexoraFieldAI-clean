// ============================================================
// NexoraField AI — Load Test (Fase 12)
// Teste de carga com k6 — escalabilidade até 100.000 usuários
// Uso: k6 run --env BASE_URL=https://app.nexorafield.com.br scripts/load-test.k6.js
// ============================================================
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// ── Métricas customizadas ────────────────────────────────────
const errorRate      = new Rate("error_rate");
const aiLatency      = new Trend("ai_latency_ms", true);
const apiLatency     = new Trend("api_latency_ms", true);
const requestCounter = new Counter("total_requests");

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

// ── Cenários de carga progressiva ────────────────────────────
export const options = {
  scenarios: {
    // Fase 1: Smoke test (valida que tudo funciona)
    smoke: {
      executor: "constant-vus",
      vus: 5,
      duration: "30s",
      tags: { scenario: "smoke" },
    },
    // Fase 2: Carga crescente até 1.000 usuários
    ramp_up_1k: {
      executor: "ramping-vus",
      startTime: "40s",
      startVUs: 10,
      stages: [
        { duration: "2m", target: 100  },
        { duration: "3m", target: 500  },
        { duration: "5m", target: 1000 },
        { duration: "2m", target: 0    },
      ],
      tags: { scenario: "ramp_1k" },
    },
    // Fase 3: Pico de 5.000 usuários
    peak_5k: {
      executor: "ramping-vus",
      startTime: "15m",
      startVUs: 100,
      stages: [
        { duration: "3m", target: 2000 },
        { duration: "5m", target: 5000 },
        { duration: "5m", target: 5000 },
        { duration: "2m", target: 0    },
      ],
      tags: { scenario: "peak_5k" },
    },
    // Fase 4: Stress 10.000 usuários
    stress_10k: {
      executor: "ramping-vus",
      startTime: "33m",
      startVUs: 1000,
      stages: [
        { duration: "5m",  target: 10000 },
        { duration: "10m", target: 10000 },
        { duration: "3m",  target: 0     },
      ],
      tags: { scenario: "stress_10k" },
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    http_req_failed:   ["rate<0.01"],
    error_rate:        ["rate<0.01"],
    api_latency_ms:    ["p(95)<500"],
    ai_latency_ms:     ["p(95)<3000"],
  },
};

// ── JWT Token de teste ────────────────────────────────────────
function getAuthToken() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: "admin@nexorafield.com.br",
    password: "admin123",
  }), { headers: { "Content-Type": "application/json" } });

  if (loginRes.status === 200) {
    return JSON.parse(loginRes.body).token || "";
  }
  return "";
}

// ── Setup global ─────────────────────────────────────────────
export function setup() {
  const token = getAuthToken();
  return { token };
}

// ── Cenário principal ─────────────────────────────────────────
export default function (data) {
  const token   = data.token;
  const headers = {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const scenario = Math.random();

  if (scenario < 0.40) {
    // 40% — Health check
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/health`);
    apiLatency.add(Date.now() - start);
    requestCounter.add(1);
    const ok = check(res, {
      "health: status 200": (r) => r.status === 200,
      "health: uptime > 0": (r) => JSON.parse(r.body)?.uptime > 0,
    });
    errorRate.add(!ok);

  } else if (scenario < 0.65) {
    // 25% — Listar chamados (read-heavy)
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/tickets`, { headers });
    apiLatency.add(Date.now() - start);
    requestCounter.add(1);
    const ok = check(res, {
      "tickets: status 200": (r) => r.status === 200,
    });
    errorRate.add(!ok);

  } else if (scenario < 0.80) {
    // 15% — Listar técnicos
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/technicians`, { headers });
    apiLatency.add(Date.now() - start);
    requestCounter.add(1);
    const ok = check(res, {
      "technicians: status 200": (r) => r.status === 200,
    });
    errorRate.add(!ok);

  } else if (scenario < 0.92) {
    // 12% — Classificação IA (write + AI call)
    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/ai/classify`, JSON.stringify({
      description: "Instalação de câmera CFTV Intelbras em área externa com DVR 8 canais.",
    }), { headers });
    aiLatency.add(Date.now() - start);
    requestCounter.add(1);
    const ok = check(res, {
      "classify: status 200 or 200": (r) => [200, 201].includes(r.status),
    });
    errorRate.add(!ok);

  } else {
    // 8% — Métricas de infraestrutura
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/metrics`);
    apiLatency.add(Date.now() - start);
    requestCounter.add(1);
    const ok = check(res, {
      "metrics: status 200": (r) => r.status === 200,
    });
    errorRate.add(!ok);
  }

  sleep(Math.random() * 2 + 0.5); // Think time: 0.5–2.5s
}

// ── Teardown — imprime resumo ─────────────────────────────────
export function teardown(data) {
  console.log("=== NexoraField Load Test Concluído ===");
  console.log(`Total de requests: ${requestCounter.name}`);
}
