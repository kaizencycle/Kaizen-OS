import { Queue, Worker, QueueScheduler, JobsOptions } from "bullmq";

const connection = () => {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL missing");
  // BullMQ accepts ioredis connection options; url is simplest
  return { connection: { url } as any };
};

export function makeQueue(name: string) {
  const q = new Queue(name, connection());
  // Ensures delayed/retry jobs are processed on time
  // (must run once per queue, worker or a separate scheduler process)
  // We embed here for simplicity.
  // In large deployments, run a standalone scheduler service.
  new QueueScheduler(name, connection());
  return q;
}

export function makeWorker(
  name: string,
  processor: Parameters<typeof Worker>[1],
  concurrency = 1
) {
  return new Worker(name, processor, { ...connection(), concurrency });
}

export const defaultJobOpts: JobsOptions = {
  attempts: 5,
  backoff: { type: "exponential", delay: 2000 }, // 2s, 4s, 8s, 16s, 32s
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 24 * 3600 }
};
