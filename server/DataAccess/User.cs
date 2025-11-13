namespace DataAccess;

public class User
{
    public Guid id { get; set; }
    public string username { get; set; }
    public string password { get; set; }
    public bool isAdmin { get; set; }
    public bool isActive { get; set; }
    public DateTime createdAt { get; set; }
    public DateTime lastLogin { get; set; }
    
    public ICollection<Payment> payments { get; set; } = new List<Payment>();
    public ICollection<Board> boards { get; set; } = new List<Board>();
    public ICollection<Week> winningWeeks { get; set; } = new List<Week>();
}