'use server';

import fs from 'fs/promises';
import path from 'path';
import { Order } from './types';

const ordersFilePath = path.join(process.cwd(), 'src', 'lib', 'orders.json');

async function readOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ordersFilePath, 'utf-8');
    return JSON.parse(data) as Order[];
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
}

export async function getOrders(): Promise<Order[]> {
  const orders = await readOrders();
  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addOrder(newOrder: Order): Promise<void> {
  const orders = await readOrders();
  orders.push(newOrder);
  await writeOrders(orders);
}
