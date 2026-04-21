import { MediaStorage } from "../../../domain/ports/outbound/MediaStorage";

export class NoopMediaStorage implements MediaStorage {
  async upload(
    _file: Buffer,
    filename: string,
    _contentType: string,
  ): Promise<string> {
    return `https://placeholder.local/uploads/${Date.now()}-${filename}`;
  }

  async delete(_url: string): Promise<void> {
    // no-op
  }

  async generateSignedUrl(
    key: string,
    _expiresInSeconds: number,
  ): Promise<string> {
    return `https://placeholder.local/signed/${key}`;
  }
}
