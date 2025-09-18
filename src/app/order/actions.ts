'use server';

import { processOrder, ProcessOrderInput } from '@/ai/flows/process-order-flow';
import { buildInvoiceHtml } from '@/lib/invoice-email';
import { sendMail } from '@/lib/mailer';
import { placeConfirmationCall, toE164 } from '@/lib/twilio';

export async function createOrderAction(formData: ProcessOrderInput) {
  try {
    const result = await processOrder(formData);
    // Attempt to send invoice email; do not fail the order if email fails
    try {
      const html = buildInvoiceHtml({ ...formData, confirmationId: result.confirmationId });
      await sendMail({
        to: formData.customerEmail,
        subject: `Your Invoice - Order ${result.confirmationId}`,
        html,
      });
    } catch (mailError) {
      console.error('Failed to send invoice email:', mailError);
    }
    // Attempt a Twilio voice confirmation; do not fail the order if call fails
    try {
      const formatted = toE164(formData.customerPhone);
      if (!formatted) {
        console.warn('Skipping call: unable to format phone to E.164', formData.customerPhone);
      } else {
        await placeConfirmationCall({
          toPhoneE164: formatted,
          confirmationId: result.confirmationId,
          customerName: formData.customerName,
        });
      }
    } catch (callError) {
      console.error('Failed to place confirmation call:', callError);
    }
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
