

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formSchema, OrderFormValues } from "@/lib/types";
import { PlusCircle, Trash2, Eye, Loader2, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { InvoicePreview } from "./invoice-preview";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { createOrderAction } from "@/app/order/actions";
import { cn } from "@/lib/utils";

const defaultValues: OrderFormValues = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  items: [{ name: "", quantity: 1, price: 0 }],
  taxRate: 8,
};

const StyledCard = ({className, ...props}: React.ComponentProps<typeof Card>) => (
    <Card className={cn("bg-card/60 backdrop-blur-sm border-border/50 transition-all duration-300 hover:border-border", className)} {...props} />
)

export function OrderForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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
    
    // Filter out empty or zero-price items before submitting
    const processedData = {
      ...data,
      items: data.items.filter(item => item.name.trim() !== "" && item.price > 0),
    };

    if (processedData.items.length === 0) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "Please add at least one valid item to the order.",
      });
      setIsSubmitting(false);
      return;
    }

    const result = await createOrderAction(processedData);
    setIsSubmitting(false);

    if (result.success && result.data) {
      toast({
        title: "Order Confirmed!",
        description: result.data.message || `Your order (ID: ${result.data.confirmationId}) has been processed. A confirmation has been sent via WhatsApp.`,
      });
      
      // The PDF is now generated and sent on the server.
      // We no longer need to call the client-side generator.
      // generateInvoicePdf(processedData, result.data.confirmationId);

      form.reset(defaultValues);
      setIsPreviewOpen(false);
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
      <form id="order-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <StyledCard>
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2"><Sparkles className="text-primary"/>Create New Order</CardTitle>
                <CardDescription>Fill in the details below to create a new order and invoice.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <FormField control={form.control} name="customerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField control={form.control} name="customerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="customerPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (with country code)</FormLabel>
                      <FormControl><Input type="tel" placeholder="+911234567890" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </StyledCard>

            <StyledCard>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start animate-in fade-in-0 slide-in-from-top-4 duration-300">
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
                        <FormControl><Input type="text" inputMode="decimal" {...field} onChange={e => field.onChange(e.target.value)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.price`} render={({ field }) => (
                      <FormItem className="col-span-5 sm:col-span-3">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>Price</FormLabel>
                        <FormControl><Input type="text" inputMode="decimal" {...field} onChange={e => field.onChange(e.target.value)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="col-span-3 sm:col-span-2 flex items-end h-full">
                       {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-auto self-center group">
                          <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
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
            </StyledCard>
          </div>
          
          <div className="lg:col-span-1">
            <StyledCard className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">{subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Tax Rate (%)</span>
                  <div className="w-24">
                    <FormField control={form.control} name="taxRate" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input type="text" inputMode="decimal" {...field} onChange={e => field.onChange(e.target.value)} className="text-right bg-transparent" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
                <Separator className="my-4 bg-border/50" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax</span>
                  <span className="font-medium text-foreground">{taxAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
              </CardContent>
              <CardFooter>
                 <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" className="w-full" variant="secondary">
                      <Eye className="mr-2 h-4 w-4" /> Preview Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl bg-card/80 backdrop-blur-xl">
                    <DialogHeader>
                      <DialogTitle>Invoice Preview</DialogTitle>
                    </DialogHeader>
                    <InvoicePreview data={form.getValues()} />
                    <DialogFooter>
                       <DialogClose asChild>
                        <Button type="button" variant="outline">Edit</Button>
                      </DialogClose>
                       <Button form="order-form" type="submit" disabled={!form.formState.isValid || isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm & Send'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </StyledCard>
          </div>
        </div>
      </form>
    </Form>
  );
}
