using Api.Services;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;
using System;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;

public class TokenTest
{
    private readonly TokenService _tokenService;
    private readonly PigeonsDbContext _db;
    private readonly IConfiguration _config;

    public TokenTest(TokenService tokenService, PigeonsDbContext db, IConfiguration config)
    {
        _tokenService = tokenService;
        _db = db;
        _config = config;

        db.Database.EnsureCreated();
    }

    // --------------------------------------------------------
    // GenerateRefreshToken Tests
    // --------------------------------------------------------

    [Fact]
    public void GenerateRefreshToken_Returns_64Byte_Base64()
    {
        var token = _tokenService.GenerateRefreshToken();

        Assert.False(string.IsNullOrWhiteSpace(token));

        var raw = Convert.FromBase64String(token);
        Assert.Equal(64, raw.Length);
    }

    [Fact]
    public void GenerateRefreshToken_AlwaysUnique()
    {
        var t1 = _tokenService.GenerateRefreshToken();
        var t2 = _tokenService.GenerateRefreshToken();

        Assert.NotEqual(t1, t2);
    }

    // --------------------------------------------------------
    // GenerateToken Tests
    // --------------------------------------------------------

    [Fact]
    public void GenerateToken_Creates_Valid_JWT()
    {
        var user = new User
        {
            id = Guid.NewGuid(),
            username = "john",
            isAdmin = true
        };

        var jwt = _tokenService.GenerateToken(user);

        Assert.False(string.IsNullOrWhiteSpace(jwt));

        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(jwt);

        Assert.Equal(user.username, token.Claims.First(c => c.Type == JwtRegisteredClaimNames.UniqueName).Value);
        Assert.Equal("Admin", token.Claims.First(c => c.Type == "role").Value);
        Assert.Equal(_config["JWT_ISSUER"], token.Issuer);
        Assert.Equal(_config["JWT_AUDIENCE"], token.Audiences.First());
    }

    [Fact]
    public void GenerateToken_Throws_When_KeyMissing()
    {
        var badConfig = new ConfigurationBuilder()
            .AddInMemoryCollection() // no JWT_KEY
            .Build();

        var service = new TokenService(badConfig);

        var user = new User { id = Guid.NewGuid(), username = "test" };

        Assert.Throws<ArgumentNullException>(() => service.GenerateToken(user));
    }

    [Fact]
    public void GenerateToken_Throws_When_ExpireMinutes_Invalid()
    {
        var badConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JWT_KEY"] = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
                ["JWT_ISSUER"] = "issuer",
                ["JWT_AUDIENCE"] = "aud",
                ["JWT_EXPIREMINUTES"] = "not_a_number"
            })
            .Build();

        var service = new TokenService(badConfig);

        var user = new User { id = Guid.NewGuid(), username = "abc" };

        Assert.Throws<FormatException>(() => service.GenerateToken(user));
    }
}