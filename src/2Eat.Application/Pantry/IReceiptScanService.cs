using _2Eat.Domain;

namespace _2Eat.Application.Pantry;

public interface IReceiptScanService
{
    Task<List<ScannedItem>> ScanReceiptAsync(byte[] imageBytes, string mimeType);
}
