using Api.DTOs;
using Api.DTOs.Response;
using Api.Services.Payments;
using Api.Services.Users;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

public class PaymentTest
{
    private readonly PigeonsDbContext _db;
    private readonly PaymentService _service;
    private readonly IUserService _userService;

    public PaymentTest(PigeonsDbContext db)
    {
        _db = db;
        _db.Database.EnsureCreated();

        // Mock IUserService
        _userService = Substitute.For<IUserService>();
        _service = new PaymentService(_db, _userService);
    }

    // -------------------------
    // GetPayments
    // -------------------------
    [Fact]
    public async Task GetPayments_ByUserId_Returns_Payments()
    {
        var userId = Guid.NewGuid();

        await _db.Payments.AddAsync(new Payment
        {
            id = Guid.NewGuid(),
            userId = userId,
            amount = 50,
            createdAt = DateTime.UtcNow,
            isApproved = true
        });

        await _db.SaveChangesAsync();

        var payments = await _service.GetPayments(userId, null);

        Assert.Single(payments);
        Assert.Equal(50, payments.First().amount);
    }

    [Fact]
    public async Task GetPayments_ByUsername_Returns_Payments()
    {
        var userId = Guid.NewGuid();
        var user = new User { id = userId, username = "bob" };
        _userService.GetUserByName("bob").Returns(user);

        await _db.Payments.AddAsync(new Payment
        {
            id = Guid.NewGuid(),
            userId = userId,
            amount = 100,
            createdAt = DateTime.UtcNow,
            isApproved = true
        });
        await _db.SaveChangesAsync();

        var payments = await _service.GetPayments(null, "bob");

        Assert.Single(payments);
        Assert.Equal(100, payments.First().amount);
    }

    [Fact]
    public async Task GetPayments_Throws_When_UserNotFound()
    {
        _userService.GetUserByName("ghost").Returns<User>(_ => throw new Exception("User not found"));

        await Assert.ThrowsAsync<Exception>(() => _service.GetPayments(null, "ghost"));
    }

    // -------------------------
    // CreateBuyPayment
    // -------------------------
    [Fact]
    public async Task CreateBuyPayment_Creates_NegativePayment()
    {
        var userId = Guid.NewGuid();

        await _service.CreateBuyPayment(50, userId);

        var payment = await _db.Payments.FirstAsync();
        Assert.Equal(-50, payment.amount);
        Assert.True(payment.isApproved);
    }

    // -------------------------
    // GetBalance
    // -------------------------
    [Fact]
    public async Task GetBalance_Returns_SumOfApprovedPayments()
    {
        var userId = Guid.NewGuid();

        await _db.Payments.AddRangeAsync(
            new Payment { id = Guid.NewGuid(), userId = userId, amount = 50, isApproved = true },
            new Payment { id = Guid.NewGuid(), userId = userId, amount = 30, isApproved = true },
            new Payment { id = Guid.NewGuid(), userId = userId, amount = 20, isApproved = false }
        );
        await _db.SaveChangesAsync();

        var balance = await _service.GetBalance(userId);

        Assert.Equal(80, balance); // Only approved payments count
    }

    // -------------------------
    // AddPayment
    // -------------------------
    [Fact]
    public async Task AddPayment_CreatesPayment()
    {
        var user = new User { id = Guid.NewGuid(), username = "alice" };
        _userService.GetUserByName("alice").Returns(user);

        var dto = new PaymentReqDTO { paymentNumber = "12345" };

        await _service.AddPayment(dto, "alice");

        var payment = await _db.Payments.FirstAsync();
        Assert.Equal(user.id, payment.userId);
        Assert.Equal("12345", payment.paymentNumber);
    }

    [Fact]
    public async Task AddPayment_Throws_When_UserServiceFails()
    {
        _userService.GetUserByName("fail").Returns<User>(_ => throw new Exception("User not found"));

        var dto = new PaymentReqDTO { paymentNumber = "123" };

        await Assert.ThrowsAsync<Exception>(() => _service.AddPayment(dto, "fail"));
    }

    // -------------------------
    // ApprovePayment
    // -------------------------
    [Fact]
    public async Task ApprovePayment_SetsApprovedAndAmount()
    {
        var user = new User { id = Guid.NewGuid(), username = "bob" };
        var payment = new Payment
        {
            id = Guid.NewGuid(),
            user = user,
            userId = user.id,
            isApproved = false,
            amount = null
        };

        await _db.Payments.AddAsync(payment);
        await _db.SaveChangesAsync();

        var dto = new PaymentReqDTO
        {
            id = payment.id.ToString(),
            isApproved = true,
            amount = 100
        };

        await _service.ApprovePayment(dto);

        var updated = await _db.Payments.FirstAsync();
        Assert.True(updated.isApproved);
        Assert.Equal(100, updated.amount);
    }

    [Fact]
    public async Task ApprovePayment_SetsDisapproved()
    {
        var user = new User { id = Guid.NewGuid(), username = "bob" };
        var payment = new Payment
        {
            id = Guid.NewGuid(),
            user = user,
            userId = user.id,
            isApproved = true,
            amount = 100
        };

        await _db.Payments.AddAsync(payment);
        await _db.SaveChangesAsync();

        var dto = new PaymentReqDTO
        {
            id = payment.id.ToString(),
            isApproved = false
        };

        await _service.ApprovePayment(dto);

        var updated = await _db.Payments.FirstAsync();
        Assert.False(updated.isApproved);
        Assert.Null(updated.amount);
    }

    [Fact]
    public async Task ApprovePayment_Throws_When_InvalidId()
    {
        var dto = new PaymentReqDTO { id = "not-a-guid", isApproved = true, amount = 10 };

        await Assert.ThrowsAsync<Exception>(() => _service.ApprovePayment(dto));
    }

    [Fact]
    public async Task ApprovePayment_Throws_When_PaymentNotFound()
    {
        var dto = new PaymentReqDTO { id = Guid.NewGuid().ToString(), isApproved = true, amount = 10 };

        await Assert.ThrowsAsync<Exception>(() => _service.ApprovePayment(dto));
    }

    [Fact]
    public async Task ApprovePayment_Throws_When_AmountMissingOnApprove()
    {
        var user = new User { id = Guid.NewGuid(), username = "bob" };
        var payment = new Payment
        {
            id = Guid.NewGuid(),
            user = user,
            userId = user.id
        };

        await _db.Payments.AddAsync(payment);
        await _db.SaveChangesAsync();

        var dto = new PaymentReqDTO { id = payment.id.ToString(), isApproved = true, amount = null };

        await Assert.ThrowsAsync<Exception>(() => _service.ApprovePayment(dto));
    }

    [Fact]
    public async Task ApprovePayment_Throws_When_isApprovedMissing()
    {
        var user = new User { id = Guid.NewGuid(), username = "bob" };
        var payment = new Payment
        {
            id = Guid.NewGuid(),
            user = user,
            userId = user.id
        };

        await _db.Payments.AddAsync(payment);
        await _db.SaveChangesAsync();

        var dto = new PaymentReqDTO { id = payment.id.ToString() }; // isApproved not set

        await Assert.ThrowsAsync<Exception>(() => _service.ApprovePayment(dto));
    }
}