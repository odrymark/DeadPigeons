namespace Api.DTOs.Response;

public class BoardResDto
{
    public Guid id { get; set; }
    public List<int> numbers { get; set; } = new List<int>();
    public DateTime createdAt { get; set; }
    public int repeats { get; set; }
    public bool? isWinner { get; set; }
}