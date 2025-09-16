'use server';

import { processOrder, ProcessOrderInput } from '@/ai/flows/process-order-flow';

export async function createOrderAction(formData: ProcessOrderInput) {
  try {
    const result = await processOrder(formData);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
