import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package } from 'lucide-react';

interface DashboardCardsProps {
  orders: Order[];
}

export function DashboardCards({ orders }: DashboardCardsProps) {
  const totalSales = orders.reduce((sum, order) => {
    if (order.status !== 'Cancelled') {
      return sum + order.total;
    }
    return sum;
  }, 0);

  const numberOfOrders = orders.length;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalSales.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
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
    </div>
  );
}
