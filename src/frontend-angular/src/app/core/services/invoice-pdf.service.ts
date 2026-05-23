/*
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { InvoiceResponse } from '../models/invoice.models';
import { CustomerResponse } from '../models/customer.models';

@Injectable({
  providedIn: 'root'
})
export class InvoicePdfService {
  downloadInvoicePdf(invoice: InvoiceResponse, customer?: CustomerResponse): void {
    const doc = new jsPDF();

    const customerTitle = customer?.title ?? `Customer #${invoice.customerId}`;
    const customerTaxNumber = customer?.taxNumber ?? '-';
    const customerAddress = customer?.address ?? '-';
    const customerEmail = customer?.eMail ?? '-';

    doc.setFontSize(18);
    doc.text('INVOICE', 14, 20);

    doc.setFontSize(11);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 32);
    doc.text(`Invoice Date: ${this.formatDate(invoice.invoiceDate)}`, 14, 39);

    doc.text('Customer Information', 14, 51);
    doc.text(`Title: ${customerTitle}`, 14, 59);
    doc.text(`Tax Number: ${customerTaxNumber}`, 14, 66);
    doc.text(`Email: ${customerEmail}`, 14, 73);
    doc.text(`Address: ${customerAddress}`, 14, 80);

    const lines = invoice.lines ?? [];

    const tableBody = lines.map((line: any, index: number) => {
      const description = line.description ?? line.itemName ?? line.productName ?? '-';
      const quantity = Number(line.quantity ?? 0);
      const unitPrice = Number(line.unitPrice ?? line.price ?? 0);
      const vatRate = Number(line.vatRate ?? line.taxRate ?? 0);

      const amount = quantity * unitPrice;
      const vatAmount = amount * vatRate / 100;
      const total = amount + vatAmount;

      return [
        index + 1,
        description,
        quantity,
        unitPrice.toFixed(2),
        `%${vatRate}`,
        total.toFixed(2)
      ];
    });

    autoTable(doc, {
      startY: 90,
      head: [[
        '#',
        'Description',
        'Quantity',
        'Unit Price',
        'VAT',
        'Total'
      ]],
      body: tableBody
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 100;

    doc.setFontSize(12);
    doc.text(`Grand Total: ${Number(invoice.totalAmount ?? 0).toFixed(2)}`, 14, finalY + 15);

    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  }

  private formatDate(value: string | Date): string {
    const date = new Date(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
*/