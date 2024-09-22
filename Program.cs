using Microsoft.EntityFrameworkCore;
using MapApp.Services;
using MapApp.DBContext;
using MapApp.Repositories;
using MapApp.UnitOfWork;



var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<PointContext>(
    options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Servisler ve baðýmlýlýklarýn eklenmesi
builder.Services.AddScoped<IPointService, PointService>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// CORS ayarlarý
var corsPolicyName = "AllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicyName,
                      builder =>
                      {
                          builder.WithOrigins("http://localhost:5163") // Frontend uygulamanýzýn adresi
                                 .AllowAnyHeader()
                                 .AllowAnyMethod()
                                 .AllowCredentials(); // Kimlik doðrulama gerekiyorsa
                      });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
// Statik dosyalarýn sunulmasý
app.UseStaticFiles();

// Routing ve CORS middleware'leri
app.UseRouting();
app.UseCors(corsPolicyName);


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
