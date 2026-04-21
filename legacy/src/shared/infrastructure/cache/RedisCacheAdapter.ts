import { Redis } from "ioredis";
import { CachePort } from "./CachePort";

export class RedisCacheAdapter implements CachePort {
  constructor(private readonly redis: Redis, private readonly prefix = "ngo:") {}

  private k(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(this.k(key));
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.redis.set(this.k(key), serialized, "EX", ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(this.k(key));
  }

  async delByPattern(pattern: string): Promise<void> {
    const fullPattern = this.k(pattern);
    const stream = this.redis.scanStream({ match: fullPattern, count: 200 });
    const pipeline = this.redis.pipeline();
    let pending = 0;

    await new Promise<void>((resolve, reject) => {
      stream.on("data", (keys: string[]) => {
        for (const key of keys) {
          pipeline.del(key);
          pending += 1;
        }
      });
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    if (pending > 0) {
      await pipeline.exec();
    }
  }
}
