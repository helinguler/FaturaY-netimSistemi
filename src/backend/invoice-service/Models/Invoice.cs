namespace InvoiceService.Models;

// bu class bir faturayı temsil eder
public class Invoice
{
    public int InvoiceId { get; set; }  // primary key

    public int CustomerId { get; set; } // fatura hangi customera ait

    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime InvoiceDate { get; set; }

    public decimal TotalAmount { get; set; }

    public int UserId { get; set; }

    public DateTime RecordDate { get; set; } = DateTime.UtcNow;

    // faturaya ait satırların listesi
    public ICollection<InvoiceLine> InvoiceLines { get; set; } = new List<InvoiceLine>();
}