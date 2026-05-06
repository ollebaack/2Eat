using _2Eat.Domain;

namespace _2Eat.Infrastructure.Services.ReceiptScanServices;

public interface IReceiptScanService
{
    Task<List<ScannedItem>> ScanReceiptAsync(byte[] imageBytes, string mimeType);
}
