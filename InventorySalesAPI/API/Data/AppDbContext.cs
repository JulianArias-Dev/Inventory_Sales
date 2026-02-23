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
				entity.Property(e => e.Date).IsRequired();
			});

			// VentaProducto (Many to Many con entidad intermedia)
			modelBuilder.Entity<VentaProducto>(entity =>
			{
				entity.ToTable("VentaProducto");

				entity.HasKey(vp => new { vp.VentaId, vp.ProductoId });

				entity.HasOne(vp => vp.Venta)
					  .WithMany(v => v.VentaProductos)
					  .HasForeignKey(vp => vp.VentaId);

				entity.HasOne(vp => vp.Producto)
					  .WithMany(p => p.VentaProductos)
					  .HasForeignKey(vp => vp.ProductoId);
			});
		}

	}
}
