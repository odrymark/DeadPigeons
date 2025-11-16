namespace Api.DTOs.Response;

public class PaymentResDTO
{
    public Guid id { get; set; }
    public DateTime createdAt { get; set; }
    public int amount { get; set; }
    public string? paymentNumber { get; set; }
}