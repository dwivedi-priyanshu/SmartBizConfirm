import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { OrdersTable } from '@/components/dashboard/orders-table';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrders } from '@/lib/order-service';
import type { Order } from '@/lib/types';

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


export default async function DashboardPage() {
  const orders = await getOrders();
  const salesData = getSalesData(orders);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
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
