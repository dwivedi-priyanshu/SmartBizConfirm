'use server';

import { processOrder, ProcessOrderInput } from '@/ai/flows/process-order-flow';
import { buildInvoiceHtml } from '@/lib/invoice-email';
import { sendMail } from '@/lib/mailer';

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
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
