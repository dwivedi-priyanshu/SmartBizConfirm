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

const processOrderFlow = ai.defineFlow(
  {
    name: 'processOrderFlow',
    inputSchema: ProcessOrderInputSchema,
    outputSchema: ProcessOrderOutputSchema,
  },
  async (input) => {
    let output: ProcessOrderOutput | null = null;
    try {
      const res = await prompt(input);
      output = res.output ?? null;
    } catch (err) {
      // fall through to local fallback
    }

    if (!output) {
      const randomId = Array.from({ length: 8 })
        .map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)])
        .join('');
      const confirmationId = `ORD-${randomId}`;
      output = {
        confirmationId,
        message: `Thanks ${input.customerName}! Your order has been received. Confirmation: ${confirmationId}.`,
      };
    }

    const subtotal = input.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const taxAmount = subtotal * (input.taxRate / 100);
    const total = subtotal + taxAmount;

    await addOrder({
        id: output.confirmationId,
        customerName: input.customerName,
        date: new Date().toISOString(),
        total: total,
        status: 'Confirmed'
    });
    
    return output;
  }
);
