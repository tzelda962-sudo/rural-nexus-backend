import pino, { Logger, LoggerOptions } from "pino";
import { Env } from "../config/env";

export function createLogger(env: Env): Logger {
  const options: LoggerOptions = {
    level: env.LOG_LEVEL,
    base: { service: "ngo-api", env: env.NODE_ENV },
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "*.password",
        "*.hashedPassword",
        "*.token",
        "*.refreshToken",
        "*.accessToken",
        "*.clientSecret",
        "*.stripeSecret",
      ],
      censor: "[REDACTED]",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (env.NODE_ENV === "development") {
    return pino({
      ...options,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss.l",
          ignore: "pid,hostname,service,env",
        },
      },
    });
  }

  return pino(options);
}

export type { Logger } from "pino";
