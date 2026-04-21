export interface SmsSender {
  send(params: { to: string; body: string }): Promise<{ messageId: string }>;
}
