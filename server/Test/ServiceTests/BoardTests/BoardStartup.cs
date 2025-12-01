using Api.Services.Boards;
using Api.Services.Games;
using Api.Services.Payments;
using api.Services.Price;
using Api.Services.Users;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;

namespace Test.ServiceTests.BoardTests;

public class BoardStartup
{
    private static DbContainer? _container;

    public void ConfigureServices(IServiceCollection services)
    {
        if (_container == null)
        {
            _container = new DbContainer();
            _container.InitializeAsync().GetAwaiter().GetResult();
        }

        services.AddSingleton(_container);
        
        services.AddDbContext<PigeonsDbContext>(options =>
            options.UseNpgsql(_container.Container.GetConnectionString()));
        
        var paymentMock = Substitute.For<IPaymentService>();
        var priceMock = Substitute.For<IPriceService>();
        var userMock = Substitute.For<IUserService>();
        var gameMock = Substitute.For<IGameService>();

        services.AddSingleton(paymentMock);
        services.AddSingleton(priceMock);
        services.AddSingleton(userMock);
        services.AddSingleton(gameMock);
        
        services.AddScoped<IBoardService, BoardService>();
    }
}