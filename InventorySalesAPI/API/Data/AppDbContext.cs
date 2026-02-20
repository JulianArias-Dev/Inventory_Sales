using Microsoft.EntityFrameworkCore;
using API.Models;

namespace API.Data
{
	public class AppDbContext : DbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
		{
		}
		
		public DbSet<Categoria> Categorias { get; set; }
		
		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);
			
			modelBuilder.Entity<Categoria>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
			});

			modelBuilder.Entity<Categoria>().ToTable("Categorias");
		}

	}
}
