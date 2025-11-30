using Api.Services.Users;
using Api.Services;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;

public class UserStartup
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

        var passwordMock = Substitute.For<IPasswordService>();
        passwordMock.HashPassword(Arg.Any<string>()).Returns(ci => "HASH_" + ci.Arg<string>());
        services.AddSingleton(passwordMock);

        services.AddScoped<IUserService, UserService>();
    }
}