'use server';

import { processOrder, ProcessOrderInput } from '@/ai/flows/process-order-flow';
import { buildInvoiceHtml } from '@/lib/invoice-email';
import { sendMail } from '@/lib/mailer';
import { placeConfirmationCall, toE164, sendWhatsAppMessage, toWhatsAppE164 } from '@/lib/twilio';
import { createCheckoutSession } from '@/lib/stripe';

export async function createOrderAction(formData: ProcessOrderInput) {
  try {
    const result = await processOrder(formData);
    let checkoutUrl: string | undefined;
    // Create Stripe Checkout session (notifications will be sent after payment)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      const successUrl = baseUrl ? `${baseUrl}/stripe/success` : 'http://localhost:9002/stripe/success';
      const cancelUrl = baseUrl ? `${baseUrl}/order` : 'http://localhost:9002/order';
      
      const session = await createCheckoutSession({
        orderId: result.confirmationId,
        customerEmail: formData.customerEmail,
        items: formData.items,
        currency: 'inr',
        successUrl,
        cancelUrl,
      });
      checkoutUrl = session.url || '';
    } catch (e) {
      console.warn('Stripe session creation failed:', e);
    }
    return { success: true, data: result, checkoutUrl };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
