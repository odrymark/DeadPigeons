using Api.Services.Boards;
using Api.Services.Games;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;

namespace Test.ServiceTests.GameTests;

public class ManagerStartup
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

        services.AddDbContext<PigeonsDbContext>(opts =>
            opts.UseNpgsql(_container.Container.GetConnectionString()));

        var gameMock = Substitute.For<IGameService>();
        services.AddSingleton(gameMock);

        var boardMock = Substitute.For<IBoardService>();
        services.AddSingleton(boardMock);

        services.AddScoped<GameManager>();
    }
}