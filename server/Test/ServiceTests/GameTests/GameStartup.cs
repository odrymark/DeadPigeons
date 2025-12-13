using Api.Services.Games;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Test.ServiceTests.GameTests;

public class GameStartup
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

        services.AddScoped<IGameService, GameService>();
    }
}