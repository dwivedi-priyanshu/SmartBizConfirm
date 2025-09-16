'use server';

import { Order } from './types';
import clientPromise from './mongodb';
import { Collection } from 'mongodb';

async function getOrdersCollection(): Promise<Collection<Order>> {
    const client = await clientPromise;
    const db = client.db();
    return db.collection<Order>('orders');
}

export async function getOrders(): Promise<Order[]> {
  const ordersCollection = await getOrdersCollection();
  const orders = await ordersCollection.find({}).sort({ date: -1 }).toArray();

  // The _id field from MongoDB is an object and is not serializable for the client component.
  // We need to convert it to a string.
  return orders.map(order => ({
      ...order,
      // @ts-ignore
      _id: order._id.toString(),
  }));
}

export async function addOrder(newOrder: Omit<Order, '_id'>): Promise<void> {
  const ordersCollection = await getOrdersCollection();
  await ordersCollection.insertOne(newOrder as Order);
}
