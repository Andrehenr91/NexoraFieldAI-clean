// ============================================================
// NexoraField AI — Redis Connection (Fase 6: Cache e Filas)
// Conexão ioredis com graceful degradation quando sem Redis
// ============================================================
import IORedis from "ioredis";

let connection: IORedis | null = null;
let redisAvailable = false;

export function getRedisConnection(): IORedis | null {
  return connection;
}

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

export async function initRedis(): Promise<boolean> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[Queue] REDIS_URL não definida — filas BullMQ desativadas. Processamento inline ativo.");
    return false;
  }

  try {
    connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,   // obrigatório para BullMQ
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 5000,
      reconnectOnError: (err) => {
        console.error("[Redis] Erro de conexão:", err.message);
        return true;
      },
    });

    connection.on("error", (err) => {
      if (redisAvailable) {
        console.error("[Redis] Erro:", err.message);
      }
      redisAvailable = false;
    });

    connection.on("ready", () => {
      redisAvailable = true;
      console.log("[Redis] Conectado com sucesso.");
    });

    connection.on("close", () => {
      redisAvailable = false;
    });

    await connection.connect();
    await connection.ping();
    redisAvailable = true;
    console.log("[Redis] ✅ Conexão estabelecida e testada.");
    return true;
  } catch (err: any) {
    console.warn(`[Queue] Redis indisponível (${err.message}) — filas desativadas. Processamento inline ativo.`);
    connection = null;
    redisAvailable = false;
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (connection) {
    await connection.quit().catch(() => connection?.disconnect());
    connection = null;
    redisAvailable = false;
  }
}
