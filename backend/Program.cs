using backend.Services;
using backend.Services.IServices;
using backend.Repository;
using backend.Helpers;
using StackExchange.Redis;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

// --- 1. INFRASTRUKTURA ---
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379"));

builder.Services.AddSingleton<CassandraService>();

// --- 2. REPOZITORIJUMI ---
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();

// --- 3. SERVISI ---
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<RedisService>();
builder.Services.AddSingleton<JwtService>(); // Može ostati ako ga koristiš za nešto drugo, ali za login ćemo koristiti Cookie
builder.Services.AddHttpContextAccessor();

// --- 4. AUTHENTICATION (Izmenjeno na Cookie za Redis sesije) ---
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "TodoAppSession";
        options.Cookie.HttpOnly = true; // Bezbednost: JS ne može da čita kolačić
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30); // TTL sesije
        options.SlidingExpiration = true; // Resetuje tajmer pri svakoj aktivnosti
        options.Events.OnRedirectToLogin = context =>
        {
            // Koristimo Microsoft.AspNetCore.Http.StatusCodes
            context.Response.StatusCode = Microsoft.AspNetCore.Http.StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
    });

// --- 5. KONTROLERI ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- 6. CORS (Ključno za withCredentials na frontendu) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials(); // Obavezno za kolačiće/sesije
        });
});

var app = builder.Build();

// --- 7. MIDDLEWARE ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();