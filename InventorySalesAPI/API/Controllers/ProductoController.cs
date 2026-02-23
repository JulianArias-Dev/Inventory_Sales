using API.DTOs;
using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ProductoController : ControllerBase
	{
		private readonly ProductService _service;

		public ProductoController(ProductService service)
		{
			_service = service;
		}

		[HttpGet]
		public async Task<ActionResult<List<ProductoResponseDto>>>	 GetProducts()
		{
			var productos = await _service.GetAsync();
			return Ok(productos);
		}

		[HttpGet("{productId}")]
		public async Task<ActionResult<ProductoResponseDto>> GetProductById(int productId)
		{
			var product = await _service.GetOneAsync(productId);

			if (product == null)
				return NotFound();

			return Ok(product);
		}

		[HttpPost]
		public async Task<ActionResult<ProductoResponseDto>> CreateProduct([FromBody] CreateProductoDto dto)
		{
			try
			{
				if (!ModelState.IsValid)
					return BadRequest(ModelState);

				var newProduct = await _service.Create(dto);

				return CreatedAtAction(
					nameof(GetProductById),
					new { productId = newProduct.Id },
					newProduct
				);
			}
			catch (InvalidOperationException ex)
			{
				return Conflict(new { message = ex.Message });
			}
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
		public async Task<ActionResult<ProductoResponseDto>> UpdateProduct(int productId, [FromBody] UpdateProductoDto dto)
		{
			var updated = await _service.Update(productId, dto);

			if (updated == null)
				return NotFound();

			return Ok(updated);
		}


	}
}
