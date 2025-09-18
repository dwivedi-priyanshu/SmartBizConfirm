import { getOrderById } from '@/lib/order-service';
import { Separator } from '@/components/ui/separator';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Invoice not found</h1>
        <p className="text-muted-foreground">No order with ID {id}.</p>
      </div>
    );
  }

  const subtotal = (order.items || []).reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxRate = order.taxRate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = order.total;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">SmartBiz Confirm</h1>
          <p className="text-sm text-muted-foreground">Invoice for Order {order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">Date: {new Date(order.date).toLocaleDateString()}</p>
          <p className="text-sm">Status: {order.status}</p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Bill To:</p>
          <p>{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
          {order.customerPhone && <p className="text-sm text-muted-foreground">{order.customerPhone}</p>}
        </div>
        <div className="text-right">
          <p className="font-semibold">Invoice Total</p>
          <p className="text-xl font-bold">{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
        </div>
      </div>
      <div className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Unit Price</th>
              <th className="py-2 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, idx) => (
              <tr key={idx} className="border-b last:border-b-0">
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{item.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                <td className="py-2 text-right">{(item.quantity * item.price).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax ({taxRate}%)</span>
            <span>{taxAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}



