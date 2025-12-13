using Api.Services;
using Api.Services.Password;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Test.ServiceTests.PasswordTests;

public class PasswordStartup
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

        services.AddSingleton<IPasswordService, PasswordService>();
    }
}