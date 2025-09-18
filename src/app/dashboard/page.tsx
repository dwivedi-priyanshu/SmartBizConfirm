'use client';

import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { OrdersTable } from '@/components/dashboard/orders-table';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { StatusPie } from '@/components/dashboard/status-pie';
import { StatusProgress } from '@/components/dashboard/status-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getOrders } from '@/lib/order-service';
import type { Order } from '@/lib/types';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

function getSalesData(orders: Order[]) {
  const salesByDate: { [key: string]: number } = {};

  orders.forEach(order => {
    if (order.status !== 'Cancelled') {
      const date = new Date(order.date).toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = 0;
      }
      salesByDate[date] += order.total;
    }
  });

  const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const last7Days = sortedDates.slice(-7);

  return last7Days.map(date => ({
    date,
    sales: salesByDate[date]
  }));
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<{ date: string, sales: number }[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<Order['status'], number>>({
    Confirmed: 0,
    Shipped: 0,
    Pending: 0,
    Cancelled: 0,
  });

  useEffect(() => {
    async function fetchOrders() {
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
      setSalesData(getSalesData(fetchedOrders));
      setStatusCounts({
        Confirmed: fetchedOrders.filter(o => o.status === 'Confirmed').length,
        Shipped: fetchedOrders.filter(o => o.status === 'Shipped').length,
        Pending: fetchedOrders.filter(o => o.status === 'Pending').length,
        Cancelled: fetchedOrders.filter(o => o.status === 'Cancelled').length,
      });
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


  // compute top customers by spend
  const spendByCustomer = orders.reduce<Record<string, number>>((acc, o) => {
    if (o.status !== 'Cancelled') acc[o.customerName] = (acc[o.customerName] || 0) + o.total;
    return acc;
  }, {});
  const topCustomers = Object.entries(spendByCustomer)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="container mx-auto py-8 space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download as CSV
        </Button>
      </div>

      <DashboardCards orders={orders} />

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>An overview of the most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersTable orders={orders.slice(0, 7)} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Daily Sales</CardTitle>
            <CardDescription>Performance over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Distribution of orders by status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <StatusPie data={[
                { name: 'Confirmed', value: statusCounts.Confirmed },
                { name: 'Shipped', value: statusCounts.Shipped },
                { name: 'Pending', value: statusCounts.Pending },
                { name: 'Cancelled', value: statusCounts.Cancelled },
              ]} />
              <div className="flex items-center">
                <StatusProgress
                  total={orders.length}
                  data={[
                    { name: 'Confirmed', value: statusCounts.Confirmed, colorClass: 'bg-emerald-500' },
                    { name: 'Shipped', value: statusCounts.Shipped, colorClass: 'bg-blue-500' },
                    { name: 'Pending', value: statusCounts.Pending, colorClass: 'bg-amber-500' },
                    { name: 'Cancelled', value: statusCounts.Cancelled, colorClass: 'bg-red-500' },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>By total spend</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map(([name, spend]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell className="text-right">{spend.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
