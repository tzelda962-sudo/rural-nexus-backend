import IORedis, { Redis } from "ioredis";
import { Env } from "../config/env";

export function createRedisClient(env: Env): Redis {
  const client = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required for BullMQ compatibility
    enableReadyCheck: true,
    lazyConnect: false,
    reconnectOnError(err) {
      const target = "READONLY";
      return err.message.includes(target);
    },
  });

  client.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("[redis] connection error", err);
  });

  return client;
}

export type { Redis } from "ioredis";
