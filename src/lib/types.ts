import { z } from 'zod';

export const formSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters."),
  customerEmail: z.string().email("Invalid email address."),
  customerPhone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in international format (e.g., +911234567890)."),
  items: z.array(z.object({
    name: z.string().min(1, "Item name is required."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
    price: z.coerce.number().min(0, "Price cannot be negative."),
  })).min(1, "Please add at least one item."),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative.").max(100, "Tax rate cannot exceed 100."),
});

export type OrderFormValues = z.infer<typeof formSchema>;

export type Order = {
  _id?: string;
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items?: { name: string; quantity: number; price: number }[];
  taxRate?: number;
  subtotal?: number;
  taxAmount?: number;
  date: string;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Cancelled';
};
