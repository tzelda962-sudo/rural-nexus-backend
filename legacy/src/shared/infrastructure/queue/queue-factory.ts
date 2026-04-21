import { Queue, Worker, type ConnectionOptions, type Processor } from "bullmq";

export const NOTIFICATION_QUEUE = "notifications";
export const REPORT_QUEUE = "reports";

export function createQueue(
  name: string,
  connection: ConnectionOptions,
): Queue {
  return new Queue(name, {
    connection,
    defaultJobOptions: {
      removeOnComplete: { count: 500 },
      removeOnFail: { count: 1000 },
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    },
  });
}

export function createWorker<T>(
  name: string,
  processor: Processor<T>,
  connection: ConnectionOptions,
  concurrency = 5,
): Worker<T> {
  return new Worker<T>(name, processor, {
    connection,
    concurrency,
  });
}
