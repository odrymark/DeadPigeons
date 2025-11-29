using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using DataAccess;
using Microsoft.IdentityModel.Tokens;

namespace Api.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
    
    public string GenerateToken(User user)
    {
        var key = Encoding.UTF8.GetBytes(_configuration["JWT_KEY"]!);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.username),
            new Claim(ClaimTypes.Role, user.isAdmin ? "Admin" : "User")
        };

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["JWT_EXPIREMINUTES"]!)),
            Issuer = _configuration["JWT_ISSUER"]!,
            Audience = _configuration["JWT_AUDIENCE"]!,
            SigningCredentials =
                new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        
        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(descriptor);
        
        return handler.WriteToken(token);
    }
}