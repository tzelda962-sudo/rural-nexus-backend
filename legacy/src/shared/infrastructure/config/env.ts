import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(10000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  // Database
  DATABASE_URL: z.string().min(1),
  DB_POOL_MIN: z.coerce.number().int().min(0).default(2),
  DB_POOL_MAX: z.coerce.number().int().min(1).default(10),

  // Redis
  REDIS_URL: z.string().min(1),

  // JWT (base64 or raw PEM strings; \n may be escaped)
  JWT_PRIVATE_KEY: z.string().min(1).optional(),
  JWT_PUBLIC_KEY: z.string().min(1).optional(),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  JWT_ISSUER: z.string().default("ngo-platform"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // SendGrid (legacy)
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_FROM_NAME: z.string().default("NGO Platform"),

  // Resend (preferred email provider)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("onboarding@resend.dev"),
  RESEND_FROM_NAME: z.string().default("NGO Platform"),

  // Frontend / CORS
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),

  // Media storage (S3/R2)
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default("auto"),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),

  // Rate limiting
  RATE_LIMIT_GLOBAL_PER_MIN: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_AUTH_PER_MIN: z.coerce.number().int().positive().default(10),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error("❌ Environment validation failed:");
    // eslint-disable-next-line no-console
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  cached = result.data;
  return cached;
}

export function getCorsOrigins(env: Env): string[] {
  return env.CORS_ORIGINS.split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}

/** Decode a PEM key that may have escaped newlines (common in cloud env vars). */
export function normalizePemKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return raw.replace(/\\n/g, "\n");
}
