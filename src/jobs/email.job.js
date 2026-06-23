import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import { getRedis, isRedisAvailable } from "../config/redis.js";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    console.warn("[Email] SMTP_HOST not configured — emails will be logged only");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });

  return transporter;
}

const EMAIL_TEMPLATES = {
  verify: ({ username, code }) => ({
    subject: "DevArena — Verify Your Email",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#00f0ff">Welcome to DevArena!</h2>
        <p>Hi ${username},</p>
        <p>Your verification code is:</p>
        <div style="background:#1a1a2e;color:#00f0ff;font-size:24px;padding:16px;text-align:center;border-radius:8px;letter-spacing:4px;font-weight:bold">${code}</div>
        <p style="color:#888;font-size:13px;margin-top:24px">This code expires in 15 minutes.</p>
      </div>
    `,
  }),

  resetPassword: ({ username, code }) => ({
    subject: "DevArena — Reset Your Password",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#00f0ff">Password Reset</h2>
        <p>Hi ${username},</p>
        <p>Your password reset code is:</p>
        <div style="background:#1a1a2e;color:#00f0ff;font-size:24px;padding:16px;text-align:center;border-radius:8px;letter-spacing:4px;font-weight:bold">${code}</div>
        <p style="color:#888;font-size:13px;margin-top:24px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  }),

  friendRequest: ({ fromUsername }) => ({
    subject: "DevArena — New Friend Request",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#00f0ff">New Friend Request</h2>
        <p><strong>${fromUsername}</strong> sent you a friend request on DevArena.</p>
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/friends" style="display:inline-block;background:#00f0ff;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px">View Request</a>
      </div>
    `,
  }),

  generic: ({ title, message }) => ({
    subject: `DevArena — ${title}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#00f0ff">${title}</h2>
        <p>${message}</p>
      </div>
    `,
  }),
};

export function setupEmailWorker() {
  if (!isRedisAvailable()) {
    console.warn("[Email] Redis unavailable — email worker disabled");
    return;
  }

  const transport = getTransporter();

  const worker = new Worker("email", async (job) => {
    const { to, template, data = {}, subject, body } = job.data;

    let emailContent;
    if (template && EMAIL_TEMPLATES[template]) {
      emailContent = EMAIL_TEMPLATES[template](data);
    } else {
      emailContent = { subject: subject || "DevArena Notification", html: body || "" };
    }

    if (!transport) {
      console.log(`[Email] (no SMTP) To: ${to} | Subject: ${emailContent.subject}`);
      return { sent: false, logged: true, to };
    }

    const from = process.env.SMTP_FROM || "DevArena <noreply@devarena.io>";

    await transport.sendMail({
      from,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log(`[Email] Sent to ${to}: ${emailContent.subject}`);
    return { sent: true, to };
  }, { connection: getRedis(), concurrency: 5 });

  worker.on("completed", (job) => {
    console.log(`[Email] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Email] Job ${job.id} failed:`, err.message);
  });
}
