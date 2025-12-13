namespace DataAccess;

public class User
{
    public Guid id { get; set; }
    public string username { get; set; }
    public string password { get; set; }
    public string email { get; set; }
    public string phoneNumber { get; set; }
    public bool isAdmin { get; set; }
    public bool isActive { get; set; }
    public DateTime createdAt { get; set; }
    public DateTime lastLogin { get; set; }
    public string? refreshToken { get; set; }
    public DateTime? refreshTokenExpiry { get; set; }
    
    public ICollection<Payment> payments { get; set; } = new List<Payment>();
    public ICollection<Board> boards { get; set; } = new List<Board>();
    public ICollection<Game> winningGames { get; set; } = new List<Game>();
}