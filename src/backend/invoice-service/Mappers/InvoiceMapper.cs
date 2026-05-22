using InvoiceService.DTOs;
using InvoiceService.Models;

namespace InvoiceService.Mappers;

// db modeli ve DTO arasında dönüşüm yapan helper method
public static class InvoiceMapper
{
    // Bir Invoice modelini dışarıya döndürülecek InvoiceResponse DTOsuna çevirir
    public static InvoiceResponse ToResponse(Invoice invoice)
    {
        return new InvoiceResponse
        {
            InvoiceId = invoice.InvoiceId,
            CustomerId = invoice.CustomerId,
            InvoiceNumber = invoice.InvoiceNumber,
            InvoiceDate = invoice.InvoiceDate,
            TotalAmount = invoice.TotalAmount,
            UserId = invoice.UserId,
            RecordDate = invoice.RecordDate,
            Lines = invoice.InvoiceLines
                .OrderBy(x => x.InvoiceLineId)
                .Select(x => new InvoiceLineResponse
                {
                    InvoiceLineId = x.InvoiceLineId,
                    InvoiceId = x.InvoiceId,
                    ItemName = x.ItemName,
                    Quantity = x.Quantity,
                    Price = x.Price,
                    LineTotal = x.Quantity * x.Price
                })
                .ToList()
        };
    }

    // kullanıcıdan gelen InvoiceLineRequest listesini
    // dbye kaydedilecek InvoiceLine model listesine çevirir
    public static List<InvoiceLine> CreateInvoiceLines(
        List<InvoiceLineRequest> lineRequests,
        int userId)
    {
        return lineRequests.Select(line => new InvoiceLine
        {
            ItemName = line.ItemName.Trim(),
            Quantity = line.Quantity,
            Price = line.Price,
            UserId = userId,
            RecordDate = DateTime.UtcNow
        }).ToList();
    }
}