namespace Api.DTOs.Response;

public class GameResDTO
{
    public DateTime createdAt { get; set; }
    public int income { get; set; }
    public List<int> winningNums { get; set; } = new List<int>();
    public List<WinnersResDTO> winners { get; set; }
}