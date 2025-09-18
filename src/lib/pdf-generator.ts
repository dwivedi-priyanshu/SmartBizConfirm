// @ts-nocheck
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { OrderFormValues } from './types';

function toSafeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return s;
}

function createPdf(data: OrderFormValues, confirmationId: string) {
  const doc = new jsPDF();

  const items = Array.isArray(data.items) ? data.items : [];
  const taxRateNum = Number(data.taxRate || 0) || 0;
  const subtotal = items.reduce((acc, item) => acc + Number(item.quantity || 0) * Number(item.price || 0), 0);
  const taxAmount = subtotal * (taxRateNum / 100);
  const total = subtotal + taxAmount;

  // Header
  doc.setFontSize(20);
  doc.text('Receptio', 14, 22);
  doc.setFontSize(10);
  doc.text('123 Business Rd, Suite 456', 14, 30);
  doc.text('Businesstown, ST 12345', 14, 35);
  
  doc.setFontSize(16);
  doc.text('INVOICE', 190, 22, { align: 'right' });
  doc.setFontSize(10);
  doc.text(`Invoice #: ${confirmationId}`, 190, 30, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, 35, { align: 'right' });

  // Bill To
  doc.setLineWidth(0.5);
  doc.line(14, 45, 196, 45);
  doc.setFontSize(12);
  doc.text('Bill To:', 14, 55);
  doc.setFontSize(10);
  doc.text(toSafeText(data.customerName), 14, 62);
  doc.text(toSafeText(data.customerEmail), 14, 67);
  doc.text(toSafeText((data as any).customerPhone ?? ''), 14, 72);
  doc.line(14, 80, 196, 80);

  // Table
  const tableColumn = ["Item", "Quantity", "Unit Price", "Total"];
  const tableRows = [];

  items.forEach(item => {
    const itemData = [
      toSafeText(item.name),
      String(Number(item.quantity || 0)),
      `$${Number(item.price || 0).toFixed(2)}`,
      `$${(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}`
    ];
    tableRows.push(itemData);
  });

  doc.autoTable({
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    styles: { font: 'helvetica', fontSize: 10 },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.setFontSize(10);

  let yPos = finalY + 10;
  doc.text(`Subtotal: $${subtotal.toFixed(2)}` as any, 190, yPos, { align: 'right' } as any);
  
  yPos += 7;
  doc.text(`Tax (${taxRateNum}%): $${taxAmount.toFixed(2)}` as any, 190, yPos, { align: 'right' } as any);
  
  yPos += 7;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: $${total.toFixed(2)}` as any, 190, yPos, { align: 'right' } as any);

  // Footer
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 105, 280, { align: 'center'});

  return doc;
}

export function generateInvoicePdf(data: OrderFormValues, confirmationId: string) {
  const doc = createPdf(data, confirmationId);
  // Save the PDF
  doc.save(`Invoice-${confirmationId}.pdf`);
}

export async function generateInvoicePdfBuffer(data: OrderFormValues, confirmationId: string): Promise<Buffer> {
    const doc = createPdf(data, confirmationId);
    const pdfOutput = doc.output('arraybuffer');
    return Buffer.from(pdfOutput);
}
