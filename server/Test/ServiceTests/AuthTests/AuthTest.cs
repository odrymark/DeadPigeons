using Api.DTOs;
using Api.Services;
using Api.Services.Auth;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

public class AuthServiceTests
{
    private readonly PigeonsDbContext _db;
    private readonly IAuthService _authService;
    private readonly IPasswordService _passwordService;
    private readonly ITokenService _tokenService;

    public AuthServiceTests(PigeonsDbContext db, IAuthService authService,
        IPasswordService passwordService, ITokenService tokenService)
    {
        _db = db;
        _authService = authService;
        _passwordService = passwordService;
        _tokenService = tokenService;

        db.Database.EnsureCreated();
    }

    // -------------------------
    // AuthenticateUser Tests
    // -------------------------

    [Fact]
    public async Task AuthenticateUser_Returns_Token_When_Valid()
    {
        var user = new User
        {
            username = "test",
            password = "hashed_pw",
            isAdmin = false
        };

        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        var req = new UserLoginReqDTO
        {
            username = "test",
            password = "password"
        };

        var res = await _authService.AuthenticateUser(req);

        Assert.Equal(user.username, res.username);
        Assert.Equal("jwt_token", res.token);
        Assert.Equal("refresh_token_new", res.refreshToken);
    }

    [Fact]
    public async Task AuthenticateUser_Throws_When_User_Not_Found()
    {
        await Assert.ThrowsAsync<Exception>(async () =>
        {
            await _authService.AuthenticateUser(new UserLoginReqDTO
            {
                username = "ghost",
                password = "password"
            });
        });
    }

    [Fact]
    public async Task AuthenticateUser_Throws_When_Password_Invalid()
    {
        var user = new User
        {
            username = "test",
            password = "pw_hash"
        };

        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        var mockPwd = Substitute.For<IPasswordService>();
        mockPwd.VerifyHashedPassword(Arg.Any<string>(), Arg.Any<string>())
               .Returns(false);

        var badService = new AuthService(_tokenService, mockPwd, _db);

        await Assert.ThrowsAsync<Exception>(async () =>
        {
            await badService.AuthenticateUser(new UserLoginReqDTO
            {
                username = "test",
                password = "incorrect"
            });
        });
    }

    // -------------------------
    // RefreshToken Tests
    // -------------------------

    [Fact]
    public async Task RefreshToken_Returns_NewTokens_When_Valid()
    {
        var user = new User
        {
            username = "test",
            refreshToken = "HASH_123",
            refreshTokenExpiry = DateTime.UtcNow.AddDays(1)
        };

        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        var (token, refresh) = await _authService.RefreshToken("123");

        Assert.Equal("jwt_token", token);
        Assert.Equal("refresh_token_new", refresh);
    }

    [Fact]
    public async Task RefreshToken_Throws_When_Invalid()
    {
        await Assert.ThrowsAsync<Exception>(() =>
            _authService.RefreshToken("not_in_db"));
    }

    [Fact]
    public async Task RefreshToken_Throws_When_Expired()
    {
        var user = new User
        {
            username = "test",
            refreshToken = "HASH_123",
            refreshTokenExpiry = DateTime.UtcNow.AddDays(-1)
        };

        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        await Assert.ThrowsAsync<Exception>(() =>
            _authService.RefreshToken("123"));
    }

    // -------------------------
    // Logout Tests
    // -------------------------

    [Fact]
    public async Task Logout_Removes_RefreshToken_When_Valid()
    {
        var user = new User
        {
            username = "test",
            refreshToken = "HASH_123",
            refreshTokenExpiry = DateTime.UtcNow.AddDays(5)
        };

        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        await _authService.Logout("123");

        Assert.Null(user.refreshToken);
        Assert.Null(user.refreshTokenExpiry);
    }

    [Fact]
    public async Task Logout_Throws_When_User_Not_Found()
    {
        await Assert.ThrowsAsync<Exception>(() =>
            _authService.Logout("invalid"));
    }
}
