export interface MediaStorage {
  upload(
    file: Buffer,
    filename: string,
    contentType: string,
  ): Promise<string>;
  delete(url: string): Promise<void>;
  generateSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
}
