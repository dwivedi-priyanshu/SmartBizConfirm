import { Resend } from 'resend';

type MailOptions = {
  to: string | string[];
  subject: string;
  html: string;
};
let cachedResend: Resend | null = null;

function getResend(): Resend {
  if (cachedResend) return cachedResend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Email is not configured. Please set RESEND_API_KEY env var.');
  }
  cachedResend = new Resend(apiKey);
  return cachedResend;
}

export async function sendMail(options: MailOptions): Promise<string | undefined> {
  const resend = getResend();
  const from = process.env.MAIL_FROM;
  const bcc = process.env.MAIL_BCC;

  if (!from) {
    throw new Error('MAIL_FROM is required for sending emails via Resend.');
  }

  const res = await resend.emails.send({
    from,
    to: Array.isArray(options.to) ? options.to : [options.to],
    bcc: bcc ? (bcc.includes(',') ? bcc.split(',').map((s) => s.trim()) : bcc) : undefined,
    subject: options.subject,
    html: options.html,
  });

  try {
    // Log the message id for traceability in Resend dashboard
    // eslint-disable-next-line no-console
    console.log('Resend email queued:', res?.data?.id || res);
  } catch {}

  return (res as any)?.data?.id;
}

