import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { AuthService } from '../../../core/services/auth.service';
import { InvoiceApiService } from '../../../core/services/invoice-api.service';
import { CustomerApiService } from '../../../core/services/customer-api.service';
import { InvoiceResponse } from '../../../core/models/invoice.models';
import { CustomerResponse } from '../../../core/models/customer.models';

interface InvoiceListFilterState {
  startDate: string;
  endDate: string;
  selectedCustomerId: number | null;
  allDates: boolean;
}

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss',
})
export class InvoiceListComponent implements OnInit {
  private readonly filterStorageKey = 'invoice_list_filter';

  userName: string | null;

  invoices: InvoiceResponse[] = [];
  customers: CustomerResponse[] = [];

  startDate = '';
  endDate = '';
  selectedCustomerId: number | null = null;
  allDates = false;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  selectedInvoice: InvoiceResponse | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly invoiceApiService: InvoiceApiService,
    private readonly customerApiService: CustomerApiService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.userName = this.authService.getUserName();

    const savedFilter = this.getSavedFilter();

    if (savedFilter) {
      this.startDate = savedFilter.startDate;
      this.endDate = savedFilter.endDate;
      this.selectedCustomerId = savedFilter.selectedCustomerId;
      this.allDates = savedFilter.allDates;
    } else {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      this.startDate = this.toDateInputValue(firstDayOfMonth);
      this.endDate = this.toDateInputValue(today);
      this.selectedCustomerId = null;
      this.allDates = false;
    }
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.allDates && (!this.startDate || !this.endDate)) {
      this.errorMessage = 'Başlangıç ve bitiş tarihleri gereklidir. Tüm faturaları görmek için "Tüm tarihleri göster" seçeneğini işaretleyin.';
      this.invoices = [];
      this.cdr.detectChanges();
      return;
    }

    if (!this.allDates && this.startDate > this.endDate) {
      this.errorMessage = 'Başlangıç tarihi bitiş tarihinden büyük olamaz.';
      this.invoices = [];
      this.cdr.detectChanges();
      return;
    }

    this.saveFilter();

    this.isLoading = true;
    this.cdr.detectChanges();

    this.invoiceApiService
      .getInvoices(
        this.allDates ? null : this.startDate,
        this.allDates ? null : this.endDate,
        this.selectedCustomerId,
        this.allDates,
      )
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (invoices) => {
          this.invoices = [...invoices];
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.invoices = [];
          this.errorMessage = this.getErrorMessage(error);
          this.cdr.detectChanges();
        },
      });
  }

  loadCustomers(): void {
    this.customerApiService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = [...customers];
        this.cdr.detectChanges();
      },
      error: () => {
        this.customers = [];
        this.cdr.detectChanges();
      },
    });
  }

  onAllDatesChanged(): void {
    this.saveFilter();
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.startDate = this.toDateInputValue(firstDayOfMonth);
    this.endDate = this.toDateInputValue(today);
    this.selectedCustomerId = null;
    this.allDates = false;

    this.saveFilter();
    this.loadInvoices();
  }

  getCustomerTitle(customerId: number): string {
    const customer = this.customers.find((x) => x.customerId === customerId);

    return customer ? customer.title : `Customer #${customerId}`;
  }

  deleteInvoice(invoice: InvoiceResponse): void {
    const confirmed = confirm(`Delete invoice ${invoice.invoiceNumber}?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.invoiceApiService.deleteInvoice(invoice.invoiceId).subscribe({
      next: () => {
        this.successMessage = 'Fatura başarıyla silindi.';
        this.loadInvoices();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.cdr.detectChanges();
      },
    });
  }

  goToCreate(): void {
    this.saveFilter();
    this.router.navigate(['/invoices/new']);
  }

  goToEdit(invoiceId: number): void {
    this.saveFilter();
    this.router.navigate(['/invoices/edit', invoiceId]);
  }

  goToCustomers(): void {
    this.saveFilter();
    this.router.navigate(['/customers']);
  }

  openPreview(invoice: InvoiceResponse): void {
    this.selectedInvoice = invoice;
  }

  closePreview(): void {
    this.selectedInvoice = null;
  }

  getCustomerTaxNumber(customerId: number): string {
    const customer = this.customers.find((x) => x.customerId === customerId);

    return customer ? customer.taxNumber : '-';
  }

  getCustomerAddress(customerId: number): string {
    const customer = this.customers.find((x) => x.customerId === customerId);

    return customer ? customer.address : '-';
  }

  getCustomerEmail(customerId: number): string {
    const customer = this.customers.find((x) => x.customerId === customerId);

    return customer ? customer.eMail : '-';
  }

  async downloadInvoicePdf(invoice: InvoiceResponse): Promise<void> {
  const customerTitle = this.getCustomerTitle(invoice.customerId);
  const customerTaxNumber = this.getCustomerTaxNumber(invoice.customerId);
  const customerAddress = this.getCustomerAddress(invoice.customerId);
  const customerEmail = this.getCustomerEmail(invoice.customerId);

  const container = document.createElement('div');

  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = 'Arial, sans-serif';

  const lineRows = invoice.lines.map(line => `
    <tr>
      <td>${this.escapeHtml(line.itemName)}</td>
      <td style="text-align: right;">${line.quantity}</td>
      <td style="text-align: right;">${this.formatMoney(line.price)}</td>
      <td style="text-align: right;">${this.formatMoney(line.lineTotal)}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div style="font-size: 28px; font-weight: bold; margin-bottom: 24px;">
      FATURA
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 28px;">
      <div>
        <div><strong>Fatura No:</strong> ${this.escapeHtml(invoice.invoiceNumber)}</div>
        <div><strong>Müşteri:</strong> ${this.escapeHtml(customerTitle)}</div>
        <div><strong>Vergi No:</strong> ${this.escapeHtml(customerTaxNumber)}</div>
        <div><strong>E-posta:</strong> ${this.escapeHtml(customerEmail)}</div>
        <div><strong>Adres:</strong> ${this.escapeHtml(customerAddress)}</div>
      </div>

      <div style="text-align: right;">
        <div><strong>Tarih:</strong> ${this.formatDate(invoice.invoiceDate)}</div>
        <div><strong>Kayıt Tarihi:</strong> ${this.formatDate(invoice.recordDate)}</div>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background-color: #f1f3f5;">
          <th style="border: 1px solid #dee2e6; padding: 10px; text-align: left;">Ürün / Hizmet</th>
          <th style="border: 1px solid #dee2e6; padding: 10px; text-align: right;">Miktar</th>
          <th style="border: 1px solid #dee2e6; padding: 10px; text-align: right;">Fiyat</th>
          <th style="border: 1px solid #dee2e6; padding: 10px; text-align: right;">Toplam</th>
        </tr>
      </thead>

      <tbody>
        ${lineRows}
      </tbody>

      <tfoot>
        <tr>
          <td colspan="3" style="border: 1px solid #dee2e6; padding: 10px; text-align: right; font-weight: bold;">
            Genel Toplam
          </td>
          <td style="border: 1px solid #dee2e6; padding: 10px; text-align: right; font-weight: bold;">
            ${this.formatMoney(invoice.totalAmount)}
          </td>
        </tr>
      </tfoot>
    </table>
  `;

  document.body.appendChild(container);

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  });

  const imageData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = 0;

  pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${invoice.invoiceNumber}.pdf`);

  document.body.removeChild(container);
}

  formatDate(dateValue: string): string {
    return new Date(dateValue).toLocaleDateString('tr-TR');
  }

  formatMoney(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  trackByInvoiceId(index: number, invoice: InvoiceResponse): number {
    return invoice.invoiceId;
  }

  private saveFilter(): void {
    const filterState: InvoiceListFilterState = {
      startDate: this.startDate,
      endDate: this.endDate,
      selectedCustomerId: this.selectedCustomerId,
      allDates: this.allDates,
    };

    localStorage.setItem(this.filterStorageKey, JSON.stringify(filterState));
  }

  private getSavedFilter(): InvoiceListFilterState | null {
    const savedFilter = localStorage.getItem(this.filterStorageKey);

    if (!savedFilter) {
      return null;
    }

    try {
      return JSON.parse(savedFilter) as InvoiceListFilterState;
    } catch {
      return null;
    }
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getErrorMessage(error: any): string {
    if (typeof error?.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error?.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.';
    }

    if (error?.status === 0) {
      return 'API bağlantısı başarısız oldu. Lütfen backend servislerinin çalıştığından emin olun.';
    }

    return 'Bir sorun oluştu. Lütfen tekrar deneyin.';
  }
}