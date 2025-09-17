'use client';

import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { OrdersTable } from '@/components/dashboard/orders-table';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrders } from '@/lib/order-service';
import type { Order } from '@/lib/types';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

function getSalesData(orders: Order[]) {
    const salesByDate: {[key: string]: number} = {};

    orders.forEach(order => {
        if (order.status !== 'Cancelled') {
            const date = new Date(order.date).toISOString().split('T')[0];
            if (!salesByDate[date]) {
                salesByDate[date] = 0;
            }
            salesByDate[date] += order.total;
        }
    });

    const sortedDates = Object.keys(salesByDate).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    const last7Days = sortedDates.slice(-7);

    return last7Days.map(date => ({
        date,
        sales: salesByDate[date]
    }));
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<{date: string, sales: number}[]>([]);
  
  useEffect(() => {
    async function fetchOrders() {
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
      setSalesData(getSalesData(fetchedOrders));
    }
    fetchOrders();
  }, []);

  const handleDownload = () => {
    const csvData = orders.map(order => ({
      'Invoice ID': order.id,
      'Customer': order.customerName,
      'Email': order.customerEmail,
      'Status': order.status,
      'Date': new Date(order.date).toLocaleDateString('en-IN'),
      'Amount': order.total,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'orders.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download as CSV
        </Button>
      </div>
      
      <DashboardCards orders={orders} />
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>An overview of the most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersTable orders={orders.slice(0, 6)} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Daily Sales</CardTitle>
            <CardDescription>A bar chart showing sales performance over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
