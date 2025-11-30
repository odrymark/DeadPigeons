using Testcontainers.PostgreSql;

public class DbContainer : IAsyncLifetime
{
    public PostgreSqlContainer Container { get; }

    public DbContainer()
    {
        Container = new PostgreSqlBuilder()
            .WithDatabase("pigeons_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();
    }

    public Task InitializeAsync() => Container.StartAsync();
    public Task DisposeAsync() => Container.DisposeAsync().AsTask();
}