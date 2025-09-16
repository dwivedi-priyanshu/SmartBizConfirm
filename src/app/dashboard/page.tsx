import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { OrdersTable } from '@/components/dashboard/orders-table';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockOrders, mockSalesData } from '@/lib/mock-data';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <DashboardCards orders={mockOrders} />
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>An overview of the most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersTable orders={mockOrders} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Daily Sales</CardTitle>
            <CardDescription>A bar chart showing sales performance over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={mockSalesData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
