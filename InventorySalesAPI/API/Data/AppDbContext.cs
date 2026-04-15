using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
	public class AppDbContext : DbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
		{
		}
		
		public DbSet<Categoria> Categorias { get; set; }
		public DbSet<Producto> Productos { get; set; }
		public DbSet<Venta> Ventas { get; set; }
		public DbSet<VentaProducto> VentaProductos { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			// Categoria
			modelBuilder.Entity<Categoria>(entity =>
			{
				entity.ToTable("Categorias");

				entity.HasKey(e => e.Id);
				entity.Property(e => e.Name)
					  .IsRequired()
					  .HasMaxLength(100);

				entity.HasIndex(e => e.Name)
						.IsUnique();

				entity.HasMany(c => c.Productos)
					  .WithOne(p => p.Categoria)
					  .HasForeignKey(p => p.CategoriaId)
					  .OnDelete(DeleteBehavior.Cascade);
			});

			// Producto
			modelBuilder.Entity<Producto>(entity =>
			{
				entity.ToTable("Productos");

				entity.HasKey(e => e.Id);
				entity.Property(e => e.Name)
					  .IsRequired()
					  .HasMaxLength(100);

				entity.HasIndex(e => e.Name)
						.IsUnique();

				entity.Property(e => e.Price)
					  .HasColumnType("decimal(18,2)");

				entity.Property(e => e.Stock)
					  .IsRequired();
			});

			// Venta
			modelBuilder.Entity<Venta>(entity =>
			{
				entity.ToTable("Ventas");

				entity.HasKey(e => e.Id);
				entity.Property(e => e.CustomerName)
					  .IsRequired()
					  .HasMaxLength(100);

				entity.Property(e => e.CustomerEmail)
					  .HasMaxLength(100);

				entity.HasMany(v => v.VentaProductos)
					  .WithOne(vp => vp.Venta)
					  .HasForeignKey(vp => vp.VentaId)
					  .OnDelete(DeleteBehavior.Cascade);
			});

			// VentaProducto
			modelBuilder.Entity<VentaProducto>(entity =>
			{
				entity.ToTable("VentaProductos");
				
				// Clave primaria compuesta
				entity.HasKey(e => new { e.VentaId, e.ProductoId });

				entity.HasOne(vp => vp.Venta)
					  .WithMany(v => v.VentaProductos)
					  .HasForeignKey(vp => vp.VentaId)
					  .OnDelete(DeleteBehavior.Cascade);

				entity.HasOne(vp => vp.Producto)
					  .WithMany(p => p.VentaProductos)
					  .HasForeignKey(vp => vp.ProductoId)
					  .OnDelete(DeleteBehavior.Cascade);
			});

			// Seeding de datos iniciales
			var categoriaJeans = new Categoria { Id = 1, Name = "Jeans" };
			var categoriaZapatos = new Categoria { Id = 2, Name = "Zapatos" };

			modelBuilder.Entity<Categoria>().HasData(categoriaJeans, categoriaZapatos);

			modelBuilder.Entity<Producto>().HasData(
				new Producto { Id = 1, Name = "Jeans Azules", Price = 125000, Stock = 50, CategoriaId = 1 },
				new Producto { Id = 2, Name = "Jeans Claros", Price = 118000, Stock = 50, CategoriaId = 1 },
				new Producto { Id = 3, Name = "Tennis Nike", Price = 220000, Stock = 50, CategoriaId = 2 },
				new Producto { Id = 4, Name = "Tennis Adidas", Price = 225000, Stock = 50, CategoriaId = 2 }
			);
		}
	}
}
