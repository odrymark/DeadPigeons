using Api.Services;
using DataAccess;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddDbContext<PigeonsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<MainService>();
builder.Services.AddControllers();
builder.Services.AddOpenApiDocument();

var app = builder.Build();

//TEMPORARY-------------------------------
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetService<PigeonsDbContext>()!.Database.EnsureCreated();
}

//TEMPORARY-------------------------------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PigeonsDbContext>();
    db.Database.EnsureCreated();

    if (!db.Users.Any(u => u.username == "testuser"))
    {
        db.Users.Add(new User
        {
            id = Guid.NewGuid(),
            username = "testuser",
            password = "password123",
            isAdmin = true,
            isActive = true,
            createdAt = DateTime.UtcNow,
            lastLogin = DateTime.UtcNow
        });
        db.SaveChanges();
    }
}

app.UseOpenApi();
app.UseSwaggerUi();
app.UseCors("AllowFrontend");
app.MapControllers();
app.Run();