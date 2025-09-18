import Stripe from 'stripe';

let cachedStripe: Stripe | null = null;

function getStripe(): Stripe {
  if (cachedStripe) return cachedStripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  cachedStripe = new Stripe(key, { apiVersion: '2024-06-20' });
  return cachedStripe;
}

type CreateCheckoutParams = {
  orderId: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  currency?: string; // default INR
  successUrl: string;
  cancelUrl: string;
};

export async function createCheckoutSession({ orderId, customerEmail, items, currency = 'inr', successUrl, cancelUrl }: CreateCheckoutParams) {
  const stripe = getStripe();
  const line_items = items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency,
      unit_amount: Math.round(item.price * 100),
      product_data: { name: item.name },
    },
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items,
    success_url: `${successUrl}?orderId=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${cancelUrl}?orderId=${encodeURIComponent(orderId)}`,
    metadata: { orderId },
  });

  return session;
}



