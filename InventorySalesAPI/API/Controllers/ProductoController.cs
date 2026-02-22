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
			var productos = await _service.GetAsync();
			return Ok(productos);
		}

		[HttpGet("{productId}")]
		public async Task<ActionResult<Producto>> GetProductById(int productId)
		{
			var product = await _service.GetOneAsync(productId);

			if (product == null)
				return NotFound();

			return Ok(product);
		}

		[HttpPost]
		public async Task<ActionResult<Producto>> CreateProduct([FromBody] Producto producto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			var newProduct = await _service.Create(producto);

			return CreatedAtAction(
				nameof(GetProductById),           
				new { id = newProduct.Id },
				newProduct
			);
		}

		[HttpDelete("{productId}")]
		public async Task<IActionResult> DeleteProduct(int productId)
		{
			var deleted = await _service.Delete(productId);

			if (!deleted)
				return NotFound();

			return NoContent();
		}

		[HttpPut("{productId}")]
		public async Task<IActionResult> UpdateProduct(int productId, Producto producto)
		{
			var updated = await _service.Update(productId, producto);

			if (updated == null)
				return NotFound();

			return Ok(updated);
		}


	}
}
