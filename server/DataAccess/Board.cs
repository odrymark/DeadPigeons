namespace DataAccess;

public class Board
{
    public Guid id { get; set; }
    public Guid userId { get; set; }
    public Guid gameId { get; set; }
    public List<int> numbers { get; set; } = new List<int>();
    public DateTime createdAt { get; set; }
    public Boolean? isWinner { get; set; }
    public int repeats { get; set; }
    
    public User user { get; set; } = null!;
    public Game game { get; set; } = null!;
}