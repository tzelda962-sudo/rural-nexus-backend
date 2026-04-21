export interface TransactionClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
}

export interface TransactionManager {
  run<T>(work: (client: TransactionClient) => Promise<T>): Promise<T>;
}
