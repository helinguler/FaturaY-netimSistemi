namespace InvoiceService.DTOs;

// API’nin kullanıcıya döneceği fatura satırı bilgileri ve satır toplamı
public class InvoiceResponse
{
    public int InvoiceId { get; set; }

    public int CustomerId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime InvoiceDate { get; set; }

    public decimal TotalAmount { get; set; }

    public int UserId { get; set; }

    public DateTime RecordDate { get; set; }

    public List<InvoiceLineResponse> Lines { get; set; } = new();
}