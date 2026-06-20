import { Worker } from "bullmq";
import { getRedis } from "../config/redis.js";

export function setupEmailWorker() {
  const worker = new Worker("email", async (job) => {
    const { to, subject, body } = job.data;
    console.log(`[Email] Sending to ${to}: ${subject}`);
    // In production, integrate with SMTP/SendGrid/SES
    // For now, just log
    return { sent: true, to };
  }, { connection: getRedis(), concurrency: 5 });

  worker.on("completed", (job) => {
    console.log(`[Email] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Email] Job ${job.id} failed:`, err.message);
  });
}
