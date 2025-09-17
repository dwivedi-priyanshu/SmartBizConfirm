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