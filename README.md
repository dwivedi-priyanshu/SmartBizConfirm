<div align="center">

# 🚀 Receptio — Smart Business Ordering & Invoicing

Modern Next.js app for creating orders, generating invoices, taking payments, and sending omni‑channel notifications — beautifully visualized with a stunning dashboard.

</div>

## ✨ Highlights

- 🧾 Order creation with dynamic line items, live subtotal/tax/total
- 🧠 AI-backed confirmation id and message generation (fallback safe)
- 💳 Stripe Checkout (INR) with success/cancel pages and webhook handling
- 📧 Resend email invoices (PDF)
- 📞 Twilio voice confirmation calls
- 💬 WhatsApp order confirmation (with PDF invoice)
- 📊 Beautiful dashboard with KPI cards, gradient sales chart, donut status pie, and progress bars
- 📁 MongoDB for persistent orders storage
- 🔐 Environment-driven configuration
- 🖥️ Fully responsive UI with polished navbar and mobile sheet menu

---

## 📧 Email (Resend) Setup

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

## 📞 Voice Call & 💬 WhatsApp (Twilio) Setup

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

### 🔗 Public Invoice Links

Set your deployment base URL so WhatsApp messages can include a clickable invoice link:

```
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

The invoice page is available at `/invoice/[id]`, for example:
`https://your-domain.com/invoice/ORD-ABCDEFGH`.

## 💳 Payments (Stripe)

Enable Stripe Checkout to accept payments in INR. Add these variables to `.env.local`:

```
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Get from Stripe Dashboard > Webhooks
```

### 🔔 Webhook Setup
1. In Stripe Dashboard, go to Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

Notes:
- Checkout sessions are created in `src/app/order/actions.ts` using `src/lib/stripe.ts`.
- Email, call, and WhatsApp notifications are sent AFTER successful payment via webhook.
- Success/Cancel pages: `/stripe/success` and `/stripe/cancel`.
- Make sure `NEXT_PUBLIC_BASE_URL` is set to your deployed domain so generated links are correct.

---

## 🗄️ Database (MongoDB)

Orders are stored in MongoDB using a shared client in `src/lib/mongodb.ts` and collection helpers in `src/lib/order-service.ts`.

- Database: `Cluster0` (change in `getOrdersCollection()` if needed)
- Collection: `orders`
- Stored shape (`src/lib/types.ts` `Order`):

```ts
type Order = {
  _id?: string;
  id: string; // human readable confirmation (e.g. ORD-XXXXXXX)
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items?: { name: string; quantity: number; price: number }[];
  taxRate?: number;
  subtotal?: number;
  taxAmount?: number;
  date: string; // ISO
  total: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Cancelled';
};
```

---

## 🧠 AI Order Processing

Defined in `src/ai/flows/process-order-flow.ts`:

- Generates `confirmationId` and friendly message via a prompt
- Safe fallback if AI fails (still generates an ID/message)
- Computes `subtotal`, `taxAmount`, `total` and inserts into DB
- Generates invoice PDF buffer and sends WhatsApp in the background

Use via server action `createOrderAction` (`src/app/order/actions.ts`).

---

## 🧾 Invoice PDF & Email

- PDF generation: `src/lib/pdf-generator.ts` (Buffer + download helper)
- Email HTML: `src/lib/invoice-email.ts`
- Mailer: `src/lib/mailer.ts`

---

## 🖼️ User Interface

- Navbar with blur, gradient accent, active pill, mobile sheet menu (`src/components/layout/header.tsx`)
- Order form with dynamic items and preview (`src/components/order/*`)
- Dashboard (`/dashboard`):
  - KPI cards: Total Sales, Number of Orders, Average Order Value, Cancellation Rate
  - Gradient Area Sales Chart (7-day) — `SalesChart`
  - Donut Status Pie — `StatusPie`
  - Status Progress Bars — `StatusProgress`
  - Recent Orders table — `OrdersTable`
  - Top Customers table

---

## ⚙️ Environment Variables

Create `.env.local` with:

```bash
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Resend
RESEND_API_KEY=...
MAIL_FROM="SmartBiz Confirm <invoices@yourdomain.com>"

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Twilio / WhatsApp
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1XXXXXXXXXX
TWILIO_WHATSAPP_FROM=whatsapp:+1XXXXXXXXXX
# OPTIONAL
# DEFAULT_COUNTRY_CODE=+91
```

---

## 🧪 Local Development

```bash
pnpm install
pnpm dev
```

If using Stripe webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 📦 Project Structure

```
src/
  ai/                 # Genkit + flow for order processing
  app/                # Next.js App Router
    order/            # Order form & actions
    dashboard/        # Data-rich dashboard
  components/         # UI components (shadcn + custom)
  lib/                # DB, PDF, email, payments, telephony
```

---

## ✅ Feature Checklist

- [x] Create orders with items, validation, live totals
- [x] AI confirmation id + message with safe fallback
- [x] Save orders to MongoDB with full snapshot (items, subtotal, tax, total)
- [x] Generate invoice PDF and send via email (Resend)
- [x] Optional voice call + WhatsApp with PDF
- [x] Stripe Checkout and webhook fulfillment
- [x] Rich dashboard: KPIs, sales chart, status pie, progress bars, tables
- [x] Modern navbar with mobile menu

---

## 📜 License

MIT — feel free to use and adapt. PRs welcome!
