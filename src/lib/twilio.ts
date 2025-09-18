import twilio, { Twilio } from 'twilio';

type PlaceCallParams = {
  toPhoneE164: string;
  confirmationId: string;
  customerName?: string;
};

let cachedClient: Twilio | null = null;

function getTwilioClient(): Twilio {
  if (cachedClient) return cachedClient;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error('Missing Twilio credentials. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
  }
  cachedClient = twilio(accountSid, authToken);
  return cachedClient;
}

export function toE164(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  // Basic heuristic: if 10 digits, assume default country code (configurable)
  const onlyDigits = digits.replace(/\D/g, '');
  const defaultCountry = (process.env.DEFAULT_COUNTRY_CODE || '+1').trim();
  if (onlyDigits.length === 10) return `${defaultCountry}${onlyDigits}`;
  // Handle Indian numbers that start with a leading 0 (e.g., 0XXXXXXXXXX)
  if (onlyDigits.length === 11 && onlyDigits.startsWith('0')) {
    return `${defaultCountry}${onlyDigits.slice(1)}`;
  }
  return null;
}

export async function placeConfirmationCall({ toPhoneE164, confirmationId, customerName }: PlaceCallParams) {
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (!fromNumber) {
    throw new Error('Missing TWILIO_FROM_NUMBER env var.');
  }

  const voice = process.env.TWILIO_VOICE || 'Polly.Joanna';
  const message = `Hello${customerName ? ` ${customerName}` : ''}. Your order ${confirmationId} has been confirmed. Thank you for choosing Smart Biz Confirm.`;

  const client = getTwilioClient();
  // Use TwiML via the 'twiml' param for a simple speak-out call (no public URL needed)
  const twiml = `<Response><Say voice="${voice}">${message}</Say></Response>`;

  return client.calls.create({
    to: toPhoneE164,
    from: fromNumber,
    twiml,
  });
}

type SendWhatsAppParams = {
  toPhoneE164: string;
  message: string;
  mediaUrl?: string;
};

export async function sendWhatsAppMessage({ toPhoneE164, message, mediaUrl }: SendWhatsAppParams) {
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
  if (!fromNumber) {
    throw new Error('Missing TWILIO_WHATSAPP_FROM env var.');
  }

  const client = getTwilioClient();
  
  const messageData: any = {
    to: `whatsapp:${toPhoneE164}`,
    from: fromNumber,
    body: message,
  };

  if (mediaUrl) {
    messageData.mediaUrl = [mediaUrl];
  }

  return client.messages.create(messageData);
}

export function toWhatsAppE164(phone: string): string | null {
  const e164 = toE164(phone);
  return e164 ? e164 : null;
}


