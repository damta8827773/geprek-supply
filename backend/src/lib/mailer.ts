import nodemailer from 'nodemailer';
import { env } from '../env.js';
import { logger } from './logger.js';

// Built only when SMTP is configured; otherwise emails are skipped gracefully.
const transporter = env.smtpConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 465,
      secure: (env.SMTP_PORT ?? 465) === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

/** Sends a password-reset email. Returns false when SMTP is not configured. */
export async function sendResetEmail(to: string, resetUrl: string): Promise<boolean> {
  if (!transporter) return false;
  await transporter.sendMail({
    from: env.SMTP_FROM ?? env.SMTP_USER,
    to,
    subject: 'Reset Kata Sandi - Geprek-Supply',
    text: `Kamu meminta reset kata sandi.\nBuka link berikut (berlaku 1 jam):\n${resetUrl}\n\nAbaikan email ini jika kamu tidak meminta.`,
    html:
      `<p>Kamu meminta reset kata sandi akun toko.</p>` +
      `<p><a href="${resetUrl}">Klik di sini untuk membuat sandi baru</a> (berlaku 1 jam).</p>` +
      `<p style="color:#888">Abaikan email ini jika kamu tidak meminta.</p>`,
  });
  logger.info({ to }, 'password reset email sent');
  return true;
}
