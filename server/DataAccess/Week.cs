namespace DataAccess;

public class Game
{
    public Guid id { get; set; }
    public string numbers { get; set; } = null!;
    public ICollection<User> winners { get; set; } = new List<User>();
    public int income { get; set; }
    public int payed { get; set; }
}