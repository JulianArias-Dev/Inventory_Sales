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
		public DbSet<Producto> Productos { get; set; }
		public DbSet<Venta> Ventas { get; set; }
		public DbSet<VentaProducto> VentaProductos { get; set; }
		
		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);
			
			modelBuilder.Entity<Categoria>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
			});

			modelBuilder.Entity<Categoria>().ToTable("Categorias");

			modelBuilder.Entity<Producto>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
				entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
				entity.Property(e => e.Stock).IsRequired();
				entity.HasOne<Categoria>()
					.WithMany()
					.HasForeignKey(e => e.CategoriaId)
					.OnDelete(DeleteBehavior.Cascade);
			});

			modelBuilder.Entity<Producto>().ToTable("Productos");

			modelBuilder.Entity<Venta>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Date).IsRequired();
			});

			modelBuilder.Entity<Venta>().ToTable("Ventas");

			modelBuilder.Entity<VentaProducto>()
			.HasKey(vp => new { vp.VentaId, vp.ProductoId });

			modelBuilder.Entity<VentaProducto>()
				.HasOne(vp => vp.Venta)
				.WithMany(v => v.VentaProductos)
				.HasForeignKey(vp => vp.VentaId);

			modelBuilder.Entity<VentaProducto>()
				.HasOne(vp => vp.Producto)
				.WithMany(p => p.VentaProductos)
				.HasForeignKey(vp => vp.ProductoId);

			modelBuilder.Entity<VentaProducto>().ToTable("VentaProducto");
		}

	}
}
