using API.DTOs;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class VentasController : ControllerBase
	{
		private readonly VentasServices _service;
		private readonly ILogger<VentasController> _logger;

		public VentasController(VentasServices service, ILogger<VentasController> logger)
		{
			_service = service;
			_logger = logger;
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
			try
			{
				var newVenta = await _service.Create(dto);

				if (newVenta == null)
					return BadRequest(new { message = "No se pudo crear la venta" });

				return CreatedAtAction(
					nameof(GetVentaById),
					new { saleId = newVenta.Id },
					newVenta
				);
			}
			catch (InvalidOperationException ex)
			{
				_logger.LogWarning(ex, "Error de validación en CreateVenta: {Message}", ex.Message);
				return Conflict(new { message = ex.Message });
			}
			catch (DbUpdateException ex)
			{
				_logger.LogError(ex, "Error de base de datos en CreateVenta");
				return StatusCode(500, new { message = "Error al guardar la venta en la base de datos" });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error inesperado en CreateVenta");
				return StatusCode(500, new { message = "Error interno del servidor" });
			}
		}
	}
}
