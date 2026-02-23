using API.DTOs;
using API.Services;
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
		public async Task<ActionResult<VentaResponseDto>> CreateVenta([FromBody] CreateVentaDto dto)
		{
			var newVenta = await _service.Create(dto);

			if (newVenta == null)
				return BadRequest();

			return CreatedAtAction(
				nameof(GetVentaById),
				new { saleId = newVenta.Id },
				newVenta
			);
		}
	}
}
