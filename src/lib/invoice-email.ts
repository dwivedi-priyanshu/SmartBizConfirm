import { OrderFormValues } from './types';

function currency(amount: number, locale = 'en-IN', currencyCode = 'INR') {
  return amount.toLocaleString(locale, { style: 'currency', currency: currencyCode });
}

export function buildInvoiceHtml(data: OrderFormValues & { confirmationId: string }): string {
  const subtotal = data.items.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
  const taxAmount = subtotal * ((data.taxRate || 0) / 100);
  const total = subtotal + taxAmount;

  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px;text-align:center;border-bottom:1px solid #eee;">${item.quantity}</td>
          <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">${currency(item.price)}</td>
          <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">${currency(item.quantity * item.price)}</td>
        </tr>`
    )
    .join('');

  const now = new Date();
  const invoiceNo = `INV-${now.getTime().toString().slice(-6)}`;

  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;background:#f8fafc;padding:24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:24px 24px 8px 24px;background:#f1f5f9;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <div style="font-size:18px;font-weight:700;display:flex;align-items:center;gap:8px;">SmartBiz Confirm</div>
              <div style="font-size:12px;color:#6b7280;">123 Business Rd, Suite 456<br/>Businesstown, ST 12345</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:14px;font-weight:700;">INVOICE</div>
              <div style="font-size:12px;color:#6b7280;">#${invoiceNo}</div>
              <div style="font-size:12px;">Date: ${now.toLocaleDateString()}</div>
              <div style="font-size:12px;color:#6b7280;">Order: ${data.confirmationId}</div>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <div style="margin-bottom:16px;">
            <div style="font-weight:600;margin-bottom:4px;">Bill To:</div>
            <div>${data.customerName}</div>
            <div style="font-size:12px;color:#6b7280;">${data.customerEmail}</div>
            <div style="font-size:12px;color:#6b7280;">${data.customerPhone}</div>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:#f8fafc;border-bottom:1px solid #e5e7eb;">
                <th align="left" style="padding:10px 8px;font-size:12px;color:#6b7280;width:50%;">Item</th>
                <th align="center" style="padding:10px 8px;font-size:12px;color:#6b7280;">Quantity</th>
                <th align="right" style="padding:10px 8px;font-size:12px;color:#6b7280;">Unit Price</th>
                <th align="right" style="padding:10px 8px;font-size:12px;color:#6b7280;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="min-width:260px;">
              <tr>
                <td style="padding:6px 8px;color:#6b7280;">Subtotal</td>
                <td style="padding:6px 8px;text-align:right;">${currency(subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:6px 8px;color:#6b7280;">Tax (${data.taxRate}%)</td>
                <td style="padding:6px 8px;text-align:right;">${currency(taxAmount)}</td>
              </tr>
              <tr>
                <td style="padding:6px 8px;font-weight:700;">Total</td>
                <td style="padding:6px 8px;text-align:right;font-weight:700;">${currency(total)}</td>
              </tr>
            </table>
          </div>
          <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
            Thank you for your business! If you have any questions about this invoice, reply to this email.
          </div>
        </td>
      </tr>
    </table>
  </div>
  `;
}


