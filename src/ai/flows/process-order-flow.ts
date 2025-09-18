'use server';
/**
 * @fileOverview A flow to process a new order.
 *
 * - processOrder - A function that handles the order processing.
 * - ProcessOrderInput - The input type for the processOrder function.
 * - ProcessOrderOutput - The return type for the processOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {formSchema} from '@/lib/types';
import { addOrder } from '@/lib/order-service';
import { generateInvoicePdf, generateInvoicePdfBuffer } from '@/lib/pdf-generator';
import fetch from 'node-fetch';
import FormData from 'form-data';

const ProcessOrderInputSchema = formSchema;
export type ProcessOrderInput = z.infer<typeof ProcessOrderInputSchema>;

const ProcessOrderOutputSchema = z.object({
  confirmationId: z.string().describe('A unique confirmation ID for the order.'),
  message: z.string().describe('A confirmation message to be shown to the user.'),
});
export type ProcessOrderOutput = z.infer<typeof ProcessOrderOutputSchema>;


export async function processOrder(input: ProcessOrderInput): Promise<ProcessOrderOutput> {
  return processOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processOrderPrompt',
  input: {schema: ProcessOrderInputSchema},
  output: {schema: ProcessOrderOutputSchema},
  prompt: `You are an order processing agent. A new order has been submitted.
Your task is to generate a unique confirmation ID and a friendly confirmation message for the user.

The confirmation ID should be in the format 'ORD-' followed by 8 random alphanumeric characters.

The confirmation message should acknowledge the order and mention the customer's name.

Order Details:
Customer: {{{customerName}}}
Email: {{{customerEmail}}}
Phone: {{{customerPhone}}}
Items:
{{#each items}}
- {{this.quantity}} x {{this.name}} @ {{this.price}}
{{/each}}
Tax Rate: {{{taxRate}}}%
`,
});

const sendWhatsappMessage = async (customerPhone: string, customerName: string, confirmationId: string, pdfBuffer: Buffer) => {
    const {
        META_ACCESS_TOKEN,
        META_PHONE_NUMBER_ID
    } = process.env;

    if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
        console.warn('WhatsApp credentials are not set. Skipping message.');
        return;
    }

    try {
        // 1. Upload the PDF
        const form = new FormData();
        form.append('file', pdfBuffer, {
            filename: `Invoice-${confirmationId}.pdf`,
            contentType: 'application/pdf',
        });
        form.append('type', 'application/pdf');
        form.append('messaging_product', 'whatsapp');

        const uploadResponse = await fetch(`https://graph.facebook.com/v20.0/${META_PHONE_NUMBER_ID}/media`, {
            method: 'POST',
            body: form,
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
            },
        });

        const uploadResult = await uploadResponse.json() as { id?: string, error?: any};

        if (uploadResult.error || !uploadResult.id) {
            console.error('Failed to upload PDF to WhatsApp:', uploadResult.error || 'No media ID returned.');
            return;
        }

        const mediaId = uploadResult.id;

        // 2. Send the message template
        const messageResponse = await fetch(`https://graph.facebook.com/v20.0/${META_PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: customerPhone,
                type: 'template',
                template: {
                    name: 'order_confirmation_pdf',
                    language: {
                        code: 'en_US'
                    },
                    components: [{
                        type: 'header',
                        parameters: [{
                            type: 'document',
                            document: {
                                id: mediaId,
                                filename: `Invoice-${confirmationId}.pdf`
                            },
                        }, ],
                    }, {
                        type: 'body',
                        parameters: [{
                            type: 'text',
                            text: customerName
                        }, {
                            type: 'text',
                            text: confirmationId
                        }, ],
                    }, ],
                },
            }),
        });

        const messageResult = await messageResponse.json();
        if (messageResult.error) {
            console.error('Failed to send WhatsApp message:', messageResult.error);
        } else {
            console.log('WhatsApp message sent successfully:', messageResult);
        }
    } catch (error) {
        console.error('An error occurred in sendWhatsappMessage:', error);
    }
}

const processOrderFlow = ai.defineFlow(
  {
    name: 'processOrderFlow',
    inputSchema: ProcessOrderInputSchema,
    outputSchema: ProcessOrderOutputSchema,
  },
  async (input) => {
    let output: ProcessOrderOutput | null = null;

    try {
      // First, try to get the confirmation from the AI service
      const llmResponse = await prompt(input);
      output = llmResponse.output;
    } catch (error) {
      console.warn('AI service failed, generating fallback confirmation.', error);
    }
    
    // If the AI service fails for any reason, create a fallback output
    if (!output) {
      const fallbackId = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      output = {
        confirmationId: fallbackId,
        message: `Order confirmed for ${input.customerName}. Your confirmation ID is ${fallbackId}.`
      };
    }

    const subtotal = input.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const taxAmount = subtotal * (input.taxRate / 100);
    const total = subtotal + taxAmount;

    await addOrder({
        id: output.confirmationId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        items: input.items,
        taxRate: input.taxRate,
        date: new Date().toISOString(),
        total: total,
        status: 'Confirmed'
    });

    const pdfBuffer = await generateInvoicePdfBuffer(input, output.confirmationId);

    // Don't wait for the WhatsApp message to be sent to return the response
    sendWhatsappMessage(input.customerPhone, input.customerName, output.confirmationId, pdfBuffer).catch(err => {
        console.error("Failed to send WhatsApp message in background:", err);
    });
    
    return output;
  }
);
