using API.Data;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repository

{
	public class ProductRep : Repo
	{
		public ProductRep(AppDbContext context) : base(context)
		{ 
			
		}

		public async Task<List<Producto>> GetAllAsync()
		{
			return await _context.Productos.ToListAsync();
		}

		public async Task<Producto?> GetOne(int productId)
		{
			return await _context.Productos.FindAsync(productId);
		}

		public async Task<Producto> CreateAsync(Producto producto)
		{
			await _context.Productos.AddAsync(producto);
			await _context.SaveChangesAsync();

			return producto;
		}

		public async Task<Producto?> UpdateProductAsync(int productId, Producto updatedProducto)
		{
			var existingProduct = await _context.Productos.FindAsync(productId);

			if (existingProduct == null)
				return null;

			existingProduct.Name = updatedProducto.Name;
			existingProduct.Price = updatedProducto.Price;

			await _context.SaveChangesAsync();

			return existingProduct;
		}

		public async Task<bool> HasRelation(int productId)
		{
			return 
				await _context.VentaProductos
				.AnyAsync(v => v.ProductoId == productId);
		}

		public async Task<bool> Delete(Producto product)
		{
			_context.Productos.Remove(product);
			await _context.SaveChangesAsync();

			return true;
		}
	}
}
