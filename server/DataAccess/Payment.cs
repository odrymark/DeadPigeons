namespace DataAccess;

public class Payment
{
    public Guid id { get; set; }
    public Guid userId { get; set; }
    public int? amount { get; set; }
    public string? paymentNumber { get; set; }
    public DateTime createdAt { get; set; }
    public bool? isApproved { get; set; }
    
    public User user { get; set; } = null!;
}