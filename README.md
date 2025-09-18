# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Email (Resend) Setup

This project sends invoices using Resend. Create a Resend API key and set the following variables (e.g., in `.env.local`):

```
RESEND_API_KEY=your_resend_api_key
# From must be a verified domain or email in Resend (e.g., on your domain)
MAIL_FROM="SmartBiz Confirm <invoices@yourdomain.com>"
# Optional: receive a blind copy of all invoices (comma-separated supported)
# MAIL_BCC=owner@yourcompany.com
```

Notes:
- Add and verify your domain or sender in the Resend dashboard, then use that in `MAIL_FROM`.
- The server action `src/app/order/actions.ts` sends the invoice after an order is processed. Email failures are logged and do not block order creation.

## Voice Call & WhatsApp (Twilio) Setup

This project can place an automated voice confirmation call and send WhatsApp messages to the customer's phone after an order is processed. Create a Twilio account and set these variables (e.g., in `.env.local`):

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1XXXXXXXXXX  # Your Twilio verified/owned phone number in E.164
TWILIO_WHATSAPP_FROM=whatsapp:+1XXXXXXXXXX  # Your Twilio WhatsApp number (starts with whatsapp:)
# Optional: pick a voice for the text-to-speech, defaults to Polly.Joanna if available
# TWILIO_VOICE=Polly.Joanna
# Optional: default country calling code used to format 10/11-digit local numbers
# For India set:
# DEFAULT_COUNTRY_CODE=+91
```

Details:
- Both voice calls and WhatsApp messages are triggered in `src/app/order/actions.ts` after sending the email. Failures are logged and do not block order creation.
- The helper `src/lib/twilio.ts` uses TwiML with `<Say>` for voice calls and the Messages API for WhatsApp.
- Phone numbers should be in E.164 format. A basic fallback formats 10-digit numbers using `DEFAULT_COUNTRY_CODE` (default +1). For India, set `DEFAULT_COUNTRY_CODE=+91`. The helper also trims a leading 0 for 11-digit local numbers.
- WhatsApp messages include formatted order details with emojis and Indian Rupee (₹) currency symbols.

### Public Invoice Links

Set your deployment base URL so WhatsApp messages can include a clickable invoice link:

```
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

The invoice page is available at `/invoice/[id]`, for example:
`https://your-domain.com/invoice/ORD-ABCDEFGH`.

## Payments (Stripe)

Enable Stripe Checkout to accept payments in INR. Add these variables to `.env.local`:

```
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Get from Stripe Dashboard > Webhooks
```

### Webhook Setup
1. In Stripe Dashboard, go to Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

Notes:
- Checkout sessions are created in `src/app/order/actions.ts` using `src/lib/stripe.ts`.
- Email, call, and WhatsApp notifications are sent AFTER successful payment via webhook.
- Success/Cancel pages: `/stripe/success` and `/stripe/cancel`.
- Make sure `NEXT_PUBLIC_BASE_URL` is set to your deployed domain so generated links are correct.