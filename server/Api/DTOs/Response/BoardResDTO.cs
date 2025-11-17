namespace Api.DTOs.Response;

public class BoardResDTO
{
    public Guid id { get; set; }
    public List<int> numbers { get; set; } = new List<int>();
    public DateTime createdAt { get; set; }
    public bool? isWinner { get; set; }
}