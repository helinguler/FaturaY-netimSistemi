namespace InvoiceService.DTOs;

// yeni bir fatura oluşturmak için kullanıcıdan gelen ana fatura bilgilerini ve satır listesi
public class InvoiceSaveRequest
{
    public int CustomerId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime InvoiceDate { get; set; }

    public List<InvoiceLineRequest> Lines { get; set; } = new();
}