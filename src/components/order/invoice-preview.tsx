import { OrderFormValues } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

interface InvoicePreviewProps {
  data: OrderFormValues;
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const subtotal = data.items.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
  const taxAmount = subtotal * ((data.taxRate || 0) / 100);
  const total = subtotal + taxAmount;

  return (
    <Card className="shadow-none border-0 max-h-[70vh] overflow-y-auto">
      <CardHeader className="grid grid-cols-2 gap-4 bg-muted/50 p-6">
        <div>
          <h2 className="font-bold text-lg">SmartBiz Confirm</h2>
          <p className="text-sm text-muted-foreground">123 Business Rd, Suite 456<br />Businesstown, ST 12345</p>
        </div>
        <div className="text-right">
          <CardTitle>INVOICE</CardTitle>
          <p className="text-muted-foreground">#INV-{new Date().getTime().toString().slice(-6)}</p>
          <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Bill To:</h3>
          <p>{data.customerName}</p>
          <p className="text-muted-foreground">{data.customerEmail}</p>
          <p className="text-muted-foreground">{data.customerPhone}</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Item</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{item.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                <TableCell className="text-right">{(item.quantity * item.price).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator className="my-4" />
        <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({data.taxRate}%)</span>
                    <span>{taxAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
