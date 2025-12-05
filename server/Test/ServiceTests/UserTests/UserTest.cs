using Api.DTOs.Request;
using Api.Services;
using Api.Services.Password;
using Api.Services.Users;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Xunit.DependencyInjection;

namespace Test.ServiceTests.UserTests;

[Startup(typeof(UserStartup))]
public class UserTest : TestBase
{
    private readonly IUserService _service;
    private readonly IPasswordService _passwordService;

    public UserTest(PigeonsDbContext db, IUserService service, IPasswordService passwordService) : base(db)
    {
        _service = service;
        _passwordService = passwordService;
    }

    // -------------------------
    // GetUserByName
    // -------------------------
    [Fact]
    public async Task GetUserByName_Returns_User_When_Found()
    {
        var user = await CreateUserAsync("alice");

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
        await CreateUserAsync("bob");
        await CreateUserAsync("carol");

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
        var user = await CreateUserAsync("dave");

        var result = await _service.GetUserInfo("dave");

        Assert.Equal("dave", result.username);
        Assert.Equal("dave@example.com", result.email);
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
        var dto = new UserAddReqDto
        {
            username = "eve",
            password = "password",
            email = "eve@test.com",
            phoneNumber = "5555555555"
        };

        await _service.AddUser(dto);

        var user = await Db.Users.FirstAsync(u => u.username == "eve");

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
        await CreateUserAsync("frank");

        var dto = new UserAddReqDto
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
        await CreateUserAsync("gwen");

        var dto = new UserAddReqDto
        {
            username = "newuser",
            password = "pw",
            email = "gwen@example.com",
            phoneNumber = "222"
        };

        await Assert.ThrowsAsync<Exception>(() => _service.AddUser(dto));
    }

    [Fact]
    public async Task AddUser_Throws_When_Duplicate_PhoneNumber()
    {
        await CreateUserAsync("harry");

        var dto = new UserAddReqDto
        {
            username = "newuser",
            password = "pw",
            email = "new@test.com",
            phoneNumber = "1234567890"
        };

        await Assert.ThrowsAsync<Exception>(() => _service.AddUser(dto));
    }
}