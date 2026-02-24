using API.Data;
using API.Repository;
using API.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(
	options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddProblemDetails();

// Build Own Services
builder.Services.AddScoped<CategoryRep>();
builder.Services.AddScoped<CategoryServices>();

builder.Services.AddScoped<ProductRep>();
builder.Services.AddScoped<ProductService>();

builder.Services.AddScoped<VentasRep>();
builder.Services.AddScoped<VentasServices>();

builder.Services.AddScoped<ReportesRep>();
builder.Services.AddScoped<ReportServices>();

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseExceptionHandler("/error");

app.Map("/error", (HttpContext context) =>
{
	return Results.Problem(
		title: "An unexpected error occurred.",
		statusCode: 500
	);
});

app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
	var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
	db.Database.Migrate();
}

app.Run();
