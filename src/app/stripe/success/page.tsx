'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Mail, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function StripeSuccessPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    const sessionIdParam = searchParams.get('session_id');
    
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
    
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-green-800">Payment Successful!</CardTitle>
          <CardDescription className="text-lg text-green-700">
            Your order has been confirmed and payment processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {orderId && (
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-lg mb-2">Order Details</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Order ID:</strong> {orderId}
              </p>
              {sessionId && (
                <p className="text-sm text-muted-foreground">
                  <strong>Payment Session:</strong> {sessionId}
                </p>
              )}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Invoice sent to your email address</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Confirmation call will be placed to your phone</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>WhatsApp confirmation message sent</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/order">
                Create New Order
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard">
                View Dashboard
              </Link>
            </Button>
          </div>

          {orderId && (
            <div className="text-center">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/invoice/${orderId}`} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  View Invoice
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
