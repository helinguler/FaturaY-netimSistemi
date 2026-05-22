namespace InvoiceService.Models;

// bu class bir fatura satırını temsil eder
public class InvoiceLine
{
    public int InvoiceLineId { get; set; }  // primary key

    // bu satırın hangi faturaya ait olduğunu belirtir
    // Invoice tablosuna bağlı foreign key gibi çalışır
    public int InvoiceId { get; set; } 

    public string ItemName { get; set; } = string.Empty;

    public decimal Quantity { get; set; }

    public decimal Price { get; set; }

    public int UserId { get; set; }

    public DateTime RecordDate { get; set; } = DateTime.UtcNow;

    // InvoiceLine üzerinden faturaya ulaşmayı sağlar
    public Invoice Invoice { get; set; } = null!;
}