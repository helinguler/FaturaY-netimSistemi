namespace InvoiceService.DTOs;

// API nin kullanıcıya döneceği fatura satırı bilgilerini ve satır toplamı
public class InvoiceLineResponse
{
    public int InvoiceLineId { get; set; }

    public int InvoiceId { get; set; }

    public string ItemName { get; set; } = string.Empty;

    public decimal Quantity { get; set; }

    public decimal Price { get; set; }

    public decimal LineTotal { get; set; }
}