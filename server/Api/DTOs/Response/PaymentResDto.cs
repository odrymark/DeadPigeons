namespace Api.DTOs.Response;

public class PaymentResDto
{
    public Guid id { get; set; }
    public Guid userId { get; set; }
    public DateTime createdAt { get; set; }
    public int? amount { get; set; }
    public string? paymentNumber { get; set; }
    public bool? isApproved { get; set; }
}