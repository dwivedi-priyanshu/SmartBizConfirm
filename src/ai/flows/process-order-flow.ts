'use server';
/**
 * @fileOverview A flow to process a new order.
 *
 * - processOrder - A function that handles the order processing.
 * - ProcessOrderInput - The input type for the processOrder function.
 * - ProcessOrderOutput - The return type for the processOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit/zod';
import {formSchema} from '@/lib/types';

export const ProcessOrderInputSchema = formSchema;
export type ProcessOrderInput = z.infer<typeof ProcessOrderInputSchema>;

export const ProcessOrderOutputSchema = z.object({
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
    // In a real app, you would save the order to a database here.
    const {output} = await prompt(input);
    return output!;
  }
);
