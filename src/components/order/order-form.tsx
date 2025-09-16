
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formSchema, OrderFormValues } from "@/lib/types";
import { PlusCircle, Trash2, Eye, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { InvoicePreview } from "./invoice-preview";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { createOrderAction } from "@/app/order/actions";

const defaultValues: OrderFormValues = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  items: [{ name: "", quantity: 1, price: 0 }],
  taxRate: 8,
};

export function OrderForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedTaxRate = form.watch("taxRate");

  const [subtotal, taxAmount, total] = useMemo(() => {
    const newSubtotal = watchedItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    const newTaxAmount = newSubtotal * ((watchedTaxRate || 0) / 100);
    const newTotal = newSubtotal + newTaxAmount;
    return [newSubtotal, newTaxAmount, newTotal];
  }, [watchedItems, watchedTaxRate]);


  async function onSubmit(data: OrderFormValues) {
    setIsSubmitting(true);
    const result = await createOrderAction(data);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Order Confirmed!",
        description: result.data?.message || `Your order (ID: ${result.data?.confirmationId}) has been processed.`,
      });
      form.reset(defaultValues);
    } else {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: result.error || "There was a problem submitting your order.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Order</CardTitle>
                <CardDescription>Fill in the details below to create a new order and invoice.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="customerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="customerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="customerPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input type="tel" placeholder="+91 12345 67890" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                    <FormField control={form.control} name={`items.${index}.name`} render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-5">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>Item Name</FormLabel>
                        <FormControl><Input placeholder="E.g., Website Design" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                      <FormItem className="col-span-4 sm:col-span-2">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>Qty</FormLabel>
                        <FormControl><Input type="number" placeholder="1" {...field} onChange={e => field.onChange(Number(e.target.value))}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.price`} render={({ field }) => (
                      <FormItem className="col-span-5 sm:col-span-3">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>Price</FormLabel>
                        <FormControl><Input type="number" placeholder="12500.00" {...field} onChange={e => field.onChange(Number(e.target.value))}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="col-span-3 sm:col-span-2 flex items-end h-full">
                       {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-auto self-center">
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                       )}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", quantity: 1, price: 0 })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Tax Rate (%)</span>
                  <div className="w-24">
                    <FormField control={form.control} name="taxRate" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="text-right" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{taxAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
              </CardContent>
              <CardFooter>
                 <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" className="w-full" disabled={!form.formState.isValid || isSubmitting}>
                      <Eye className="mr-2 h-4 w-4" /> Preview Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Invoice Preview</DialogTitle>
                    </DialogHeader>
                    <InvoicePreview data={form.getValues()} />
                    <DialogFooter>
                       <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSubmitting}>Edit</Button>
                      </DialogClose>
                      <DialogClose asChild>
                         <Button type="submit" onClick={() => form.handleSubmit(onSubmit)()} disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm & Send'}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
