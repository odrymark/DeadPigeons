namespace Api.DTOs.Response;

public class GameResDto
{
    public DateTime createdAt { get; set; }
    public int income { get; set; }
    public List<int> winningNums { get; set; } = new List<int>();
    public List<WinnersResDto> winners { get; set; }
}