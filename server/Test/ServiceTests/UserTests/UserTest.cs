using Api.DTOs;
using Api.DTOs.Response;
using Api.Services;
using Api.Services.Users;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

public class UserTest
{
    private readonly PigeonsDbContext _db;
    private readonly UserService _service;
    private readonly IPasswordService _passwordService;

    public UserTest(PigeonsDbContext db)
    {
        _db = db;
        _db.Database.EnsureCreated();

        // Mock password service
        _passwordService = Substitute.For<IPasswordService>();
        _passwordService.HashPassword(Arg.Any<string>()).Returns(ci => "HASH_" + ci.Arg<string>());

        _service = new UserService(_db, _passwordService);
    }

    // -------------------------
    // GetUserByName
    // -------------------------
    [Fact]
    public async Task GetUserByName_Returns_User_When_Found()
    {
        var user = new User { username = "alice" };
        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        var result = await _service.GetUserByName("alice");

        Assert.Equal("alice", result.username);
    }

    [Fact]
    public async Task GetUserByName_Throws_When_NotFound()
    {
        await Assert.ThrowsAsync<Exception>(() => _service.GetUserByName("ghost"));
    }

    // -------------------------
    // GetAllUsers
    // -------------------------
    [Fact]
    public async Task GetAllUsers_Returns_Usernames()
    {
        await _db.Users.AddRangeAsync(
            new User { username = "bob" },
            new User { username = "carol" }
        );
        await _db.SaveChangesAsync();

        var result = await _service.GetAllUsers();

        Assert.Contains("bob", result);
        Assert.Contains("carol", result);
    }

    // -------------------------
    // GetUserInfo
    // -------------------------
    [Fact]
    public async Task GetUserInfo_Returns_UserInfo_When_Found()
    {
        var user = new User
        {
            username = "dave",
            email = "dave@test.com",
            phoneNumber = "1234567890",
            isActive = true,
            createdAt = DateTime.UtcNow.AddDays(-1),
            lastLogin = DateTime.UtcNow
        };

        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        var result = await _service.GetUserInfo("dave");

        Assert.Equal("dave", result.username);
        Assert.Equal("dave@test.com", result.email);
        Assert.Equal("1234567890", result.phoneNumber);
        Assert.True(result.isActive);
    }

    [Fact]
    public async Task GetUserInfo_Throws_When_NotFound()
    {
        await Assert.ThrowsAsync<Exception>(() => _service.GetUserInfo("ghost"));
    }

    // -------------------------
    // AddUser
    // -------------------------
    [Fact]
    public async Task AddUser_Creates_New_User()
    {
        var dto = new UserAddReqDTO
        {
            username = "eve",
            password = "password",
            email = "eve@test.com",
            phoneNumber = "5555555555"
        };

        await _service.AddUser(dto);

        var user = await _db.Users.FirstAsync(u => u.username == "eve");

        Assert.Equal("eve", user.username);
        Assert.Equal("HASH_password", user.password); // hashed by mock
        Assert.Equal("eve@test.com", user.email);
        Assert.Equal("5555555555", user.phoneNumber);
        Assert.False(user.isAdmin);
        Assert.False(user.isActive);
    }

    [Fact]
    public async Task AddUser_Throws_When_Duplicate_Username()
    {
        var existing = new User { username = "frank", email = "f@test.com", phoneNumber = "111" };
        await _db.Users.AddAsync(existing);
        await _db.SaveChangesAsync();

        var dto = new UserAddReqDTO
        {
            username = "frank",
            password = "pw",
            email = "new@test.com",
            phoneNumber = "222"
        };

        await Assert.ThrowsAsync<Exception>(() => _service.AddUser(dto));
    }

    [Fact]
    public async Task AddUser_Throws_When_Duplicate_Email()
    {
        var existing = new User { username = "gwen", email = "g@test.com", phoneNumber = "111" };
        await _db.Users.AddAsync(existing);
        await _db.SaveChangesAsync();

        var dto = new UserAddReqDTO
        {
            username = "newuser",
            password = "pw",
            email = "g@test.com",
            phoneNumber = "222"
        };

        await Assert.ThrowsAsync<Exception>(() => _service.AddUser(dto));
    }

    [Fact]
    public async Task AddUser_Throws_When_Duplicate_PhoneNumber()
    {
        var existing = new User { username = "harry", email = "h@test.com", phoneNumber = "999" };
        await _db.Users.AddAsync(existing);
        await _db.SaveChangesAsync();

        var dto = new UserAddReqDTO
        {
            username = "newuser",
            password = "pw",
            email = "new@test.com",
            phoneNumber = "999"
        };

        await Assert.ThrowsAsync<Exception>(() => _service.AddUser(dto));
    }
}