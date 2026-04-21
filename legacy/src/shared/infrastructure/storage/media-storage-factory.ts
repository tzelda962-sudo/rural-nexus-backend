import { MediaStorage } from "../../../modules/campaign/domain/ports/outbound/MediaStorage";
import { S3MediaStorage } from "../../../modules/campaign/infrastructure/adapters/external/S3MediaStorage";
import { NoopMediaStorage } from "../../../modules/campaign/infrastructure/adapters/external/NoopMediaStorage";
import { Env } from "../config/env";

export function createMediaStorage(env: Env): MediaStorage {
  if (env.S3_BUCKET && env.S3_ACCESS_KEY && env.S3_SECRET_KEY) {
    return new S3MediaStorage({
      bucket: env.S3_BUCKET,
      region: env.S3_REGION,
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY,
      endpoint: env.S3_ENDPOINT,
    });
  }
  return new NoopMediaStorage();
}
