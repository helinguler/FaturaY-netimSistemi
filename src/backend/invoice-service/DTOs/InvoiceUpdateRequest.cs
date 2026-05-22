namespace InvoiceService.DTOs;

public class InvoiceUpdateRequest
{
    public int CustomerId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime InvoiceDate { get; set; }

    public List<InvoiceLineRequest> Lines { get; set; } = new();
}