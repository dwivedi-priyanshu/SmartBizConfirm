import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Percent, ShoppingCart } from 'lucide-react';

interface DashboardCardsProps {
  orders: Order[];
}

export function DashboardCards({ orders }: DashboardCardsProps) {
  const nonCancelled = orders.filter(o => o.status !== 'Cancelled');
  const totalSales = nonCancelled.reduce((sum, order) => {
    if (order.status !== 'Cancelled') {
      return sum + order.total;
    }
    return sum;
  }, 0);

  const numberOfOrders = orders.length;
  const averageOrderValue = nonCancelled.length > 0 ? totalSales / nonCancelled.length : 0;
  const cancelledRate = orders.length > 0 ? (orders.filter(o => o.status === 'Cancelled').length / orders.length) * 100 : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalSales.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
          </div>
          <p className="text-xs text-muted-foreground">Total revenue from all non-cancelled orders</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Number of Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{numberOfOrders}</div>
          <p className="text-xs text-muted-foreground">Total orders created across all statuses</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {averageOrderValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
          </div>
          <p className="text-xs text-muted-foreground">Across non-cancelled orders</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cancelledRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Cancelled orders ÷ total orders</p>
        </CardContent>
      </Card>
    </div>
  );
}
