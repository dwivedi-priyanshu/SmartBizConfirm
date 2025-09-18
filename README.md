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

## Voice Call (Twilio) Setup

This project can place an automated voice confirmation call to the customer's phone after an order is processed. Create a Twilio account and set these variables (e.g., in `.env.local`):

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1XXXXXXXXXX  # Your Twilio verified/owned phone number in E.164
# Optional: pick a voice for the text-to-speech, defaults to Polly.Joanna if available
# TWILIO_VOICE=Polly.Joanna
# Optional: default country calling code used to format 10/11-digit local numbers
# For India set:
# DEFAULT_COUNTRY_CODE=+91
```

Details:
- The call is triggered in `src/app/order/actions.ts` after sending the email. Failures are logged and do not block order creation.
- The helper `src/lib/twilio.ts` uses TwiML with `<Say>` to speak the confirmation message.
- Phone numbers should be in E.164 format. A basic fallback formats 10-digit numbers using `DEFAULT_COUNTRY_CODE` (default +1). For India, set `DEFAULT_COUNTRY_CODE=+91`. The helper also trims a leading 0 for 11-digit local numbers.