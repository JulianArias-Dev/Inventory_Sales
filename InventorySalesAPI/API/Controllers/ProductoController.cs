using API.Data;
using API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Services;

namespace API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ProductoController : ControllerBase
	{
		//private readonly AppDbContext _context;
		private readonly ProductService _service;

		public ProductoController(ProductService service)
		{
			_service = service;
		}

		[HttpGet]
		public async Task<ActionResult> GetProducts()
		{
			var productos = await _service.GetProductsAsync();
			return Ok(productos);
		}

		[HttpGet("{productId}")]
		public async Task<ActionResult<Producto>> GetProductById(int productId)
		{
			var product = await _service.GetOneProductAsync(productId);

			if (product == null)
				return NotFound();

			return Ok(product);
		}

		[HttpPost]
		public async Task<ActionResult<Producto>> CreateProduct([FromBody] Producto producto)
		{
			if (producto == null)
				return BadRequest();

			await _context.Productos.AddAsync(producto);
			await _context.SaveChangesAsync();

			return CreatedAtAction(
				nameof(GetProductById),
				new { productId = producto.Id },
				producto);
		}

		[HttpDelete("{productId}")]
		public async Task<IActionResult> DeleteProduct(int productId)
		{
			var product = await _context.Productos.FindAsync(productId);

			if (product == null)
				return NotFound();

			var hasRelation = await _context.VentaProductos
				.AnyAsync(v => v.ProductoId == productId);

			if (hasRelation)
				return Conflict("No se puede eliminar el producto porque está asociado a una venta.");

			_context.Productos.Remove(product);
			await _context.SaveChangesAsync();

			return NoContent();
		}

		[HttpPut("{productId}")]
		public async Task<IActionResult> UpdateProduct(int productId, Producto producto)
		{
			if (productId != producto.Id)
				return BadRequest();

			_context.Entry(producto).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!await _context.Productos.AnyAsync(p => p.Id == productId))
					return NotFound();
				else
					throw;
			}

			return NoContent();
		}


	}
}
