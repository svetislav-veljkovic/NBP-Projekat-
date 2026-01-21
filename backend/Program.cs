using backend.Services;
using backend.Services.IServices;
using backend.Repository;
using backend.Helpers;
using StackExchange.Redis;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// --- 1. INFRASTRUKTURA ---
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379"));

builder.Services.AddSingleton<CassandraService>();

// --- 2. REPOZITORIJUMI ---
builder.Services.AddScoped<IUserRepository, UserRepository>();

// --- 3. SERVISI ---
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddHttpContextAccessor();

// --- 4. KONTROLERI SA JSON OPCIJAMA ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Ovo osigurava da backend i frontend pričaju istim jezikom (camelCase)
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- 5. CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyMethod()
                  .AllowCredentials() // OBAVEZNO za JWT kolačiće
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// REDOSLED JE OVDE KRITIČAN:
app.UseRouting();

app.UseCors("AllowReactApp"); // Mora biti posle Routing, a pre Auth

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();