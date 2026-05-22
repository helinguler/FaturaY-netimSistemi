namespace InvoiceService.DTOs;

// kullanıcıdan gelen fatura satırı bilgilerini taşır
public class InvoiceLineRequest
{
    public string ItemName { get; set; } = string.Empty;

    public decimal Quantity { get; set; }

    public decimal Price { get; set; }
}