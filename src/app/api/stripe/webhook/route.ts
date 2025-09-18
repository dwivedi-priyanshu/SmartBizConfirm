import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrderById } from '@/lib/order-service';
import { buildInvoiceHtml } from '@/lib/invoice-email';
import { sendMail } from '@/lib/mailer';
import { placeConfirmationCall, toE164, sendWhatsAppMessage, toWhatsAppE164 } from '@/lib/twilio';
import { generateInvoicePdfBuffer } from '@/lib/pdf-generator';
import { uploadInvoicePdf } from '@/lib/cloudinary';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error('No order ID in session metadata');
      return NextResponse.json({ error: 'No order ID' }, { status: 400 });
    }

    try {
      // Get order details
      const order = await getOrderById(orderId);
      if (!order) {
        console.error('Order not found:', orderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Generate PDF and upload to Cloudinary
      try {
        const pdfBuffer = await generateInvoicePdfBuffer(
          {
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone || '',
            items: order.items || [],
            taxRate: order.taxRate || 0,
          } as any,
          order.id
        );
        const cloudinaryUrl = await uploadInvoicePdf(pdfBuffer, `invoice-${order.id}`);

        // Send email with HTML invoice and attach Cloudinary link
        const html = buildInvoiceHtml({
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone || '',
          items: order.items || [],
          taxRate: order.taxRate || 0,
          confirmationId: order.id,
        });
        const htmlWithLink = `${html}<p style="margin-top:16px">Download PDF: <a href="${cloudinaryUrl}">${cloudinaryUrl}</a></p>`;
        await sendMail({
          to: order.customerEmail,
          subject: `Your Invoice - Order ${order.id}`,
          html: htmlWithLink,
        });
        console.log('Invoice PDF uploaded and email sent for order:', orderId);
      } catch (mailError) {
        console.error('Failed to send invoice email:', mailError);
      }

      // Send voice call
      if (order.customerPhone) {
        try {
          const formatted = toE164(order.customerPhone);
          if (formatted) {
            await placeConfirmationCall({
              toPhoneE164: formatted,
              confirmationId: order.id,
              customerName: order.customerName,
            });
            console.log('Confirmation call placed for order:', orderId);
          }
        } catch (callError) {
          console.error('Failed to place confirmation call:', callError);
        }
      }

      // Send WhatsApp message
      if (order.customerPhone) {
        try {
          const whatsappPhone = toWhatsAppE164(order.customerPhone);
          if (whatsappPhone) {
            // Use Cloudinary link for PDF if available
            // Re-uploading would be redundant; in practice we would persist the URL.
            // Here, we generate and upload again to ensure availability.
            let invoiceUrl = '';
            try {
              const pdfBuffer = await generateInvoicePdfBuffer(
                {
                  customerName: order.customerName,
                  customerEmail: order.customerEmail,
                  customerPhone: order.customerPhone || '',
                  items: order.items || [],
                  taxRate: order.taxRate || 0,
                } as any,
                order.id
              );
              invoiceUrl = await uploadInvoicePdf(pdfBuffer, `invoice-${order.id}`);
            } catch (e) {
              console.warn('Failed to prepare Cloudinary invoice for WhatsApp; skipping link', e);
            }
            
            const subtotal = (order.items || []).reduce((acc, item) => acc + item.quantity * item.price, 0);
            const taxRate = order.taxRate || 0;
            const taxAmount = subtotal * (taxRate / 100);
            const total = order.total;

            const whatsappMessage = `🎉 *Payment Successful!*

📋 *Order Confirmation - ${order.id}*

Hello ${order.customerName}! Your payment has been processed and order confirmed.

*Order Details:*
${(order.items || []).map(item => `• ${item.quantity}x ${item.name} - ₹${item.price}`).join('\n')}

*Summary:*
Subtotal: ₹${subtotal.toFixed(2)}
Tax (${taxRate}%): ₹${taxAmount.toFixed(2)}
*Total: ₹${total.toFixed(2)}*

${invoiceUrl ? `Download invoice PDF: ${invoiceUrl}\n\n` : ''}Thank you for choosing Smart Biz Confirm! 🎉`;

            await sendWhatsAppMessage({
              toPhoneE164: whatsappPhone,
              message: whatsappMessage,
            });
            console.log('WhatsApp message sent for order:', orderId);
          }
        } catch (whatsappError) {
          console.error('Failed to send WhatsApp message:', whatsappError);
        }
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Error processing payment webhook:', error);
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

