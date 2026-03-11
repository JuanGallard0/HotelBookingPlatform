using HotelBookingPlatform.Infrastructure.Data;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, config) =>
    config.ReadFrom.Configuration(ctx.Configuration));

// Add services to the container.

builder.AddKeyVaultIfConfigured();
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    await app.InitialiseDatabaseAsync();
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseSerilogRequestLogging();

app.UseHealthChecks("/health");
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapOpenApi();
app.MapScalarApiReference();


app.UseExceptionHandler(options => { });

app.Map("/", () => Results.Redirect("/scalar"));

app.MapEndpoints();

app.Run();

public partial class Program { }
