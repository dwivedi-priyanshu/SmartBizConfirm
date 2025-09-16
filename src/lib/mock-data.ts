import { Order } from './types';

export const mockOrders: Order[] = [
  { id: 'ORD-001', customerName: 'Alice Johnson', date: '2024-07-20', total: 250.75, status: 'Confirmed' },
  { id: 'ORD-002', customerName: 'Bob Williams', date: '2024-07-19', total: 120.00, status: 'Shipped' },
  { id: 'ORD-003', customerName: 'Charlie Brown', date: '2024-07-19', total: 85.50, status: 'Confirmed' },
  { id: 'ORD-004', customerName: 'Diana Prince', date: '2024-07-18', total: 500.00, status: 'Shipped' },
  { id: 'ORD-005', customerName: 'Ethan Hunt', date: '2024-07-17', total: 320.25, status: 'Pending' },
  { id: 'ORD-006', customerName: 'Fiona Glenanne', date: '2024-07-17', total: 99.99, status: 'Cancelled' },
];

export const mockSalesData = [
  { date: '2024-07-17', sales: 420.24 },
  { date: '2024-07-18', sales: 500.00 },
  { date: '2024-07-19', sales: 205.50 },
  { date: '2024-07-20', sales: 250.75 },
  { date: '2024-07-21', sales: 780.40 },
  { date: '2024-07-22', sales: 620.90 },
  { date: '2024-07-23', sales: 950.00 },
];
