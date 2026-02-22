using API.DTOs;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class VentasController : ControllerBase
	{
		private readonly VentasServices _service;

		public VentasController(VentasServices service)
		{
			_service = service;
		}


		[HttpGet]
		public async Task<ActionResult> GetVentas()
		{
			var ventas = await _service.GetAsync();

			return Ok(ventas);
		}

		[HttpGet("{saleId}")]
		public async Task<ActionResult> GetVentaById(int saleId)
		{
			var venta = await _service.GetOneAsync(saleId);
			
			if (venta == null)
				return NotFound();
			
			return Ok(venta);
		}

		[HttpPost]
		public async Task<ActionResult<Venta>> CreateVenta([FromBody] CreateVentaDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			var venta = new Venta
			{
				CustomerName = dto.CustomerName,
				Date = dto.Date
			};

			var productos = dto.Productos.Select(p => new VentaProducto
			{
				ProductoId = p.ProductoId,
				Cantidad = p.Cantidad,
				PrecioUnitario = p.PrecioUnitario
			}).ToList();

			var newVenta = await _service.Create(venta, productos);

			if (newVenta == null)
				return BadRequest("No se pudo crear la venta.");

			return CreatedAtAction(
				nameof(GetVentaById),
				new { id = newVenta.Id },
				newVenta
			);
		}
	}
}
