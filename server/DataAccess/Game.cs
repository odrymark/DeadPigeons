namespace DataAccess;

public class Game
{
    public Guid id { get; set; }
    public List<int> numbers { get; set; } = new List<int>();
    public ICollection<User> winners { get; set; } = new List<User>();
    public int income { get; set; }
    public DateTime createdAt { get; set; }
    public DateTime openUntil { get; set; }
    public ICollection<Board> boards { get; set; } = new List<Board>();

}