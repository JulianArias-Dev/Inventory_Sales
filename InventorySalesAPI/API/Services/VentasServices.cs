using API.Models;
using API.Repository;

namespace API.Services
{
	public class VentasServices
	{
		private readonly VentasRep _repository;

		public VentasServices(VentasRep repository)
		{
			_repository = repository;
		}

		public async Task<List<Venta>> GetAsync()
		{
			return await _repository.GetAllAsync();
		}

		public async Task<Venta?> GetOneAsync(int id)
		{
			return await _repository.GetByIdAsync(id);
		}

		public async Task<Venta?> Create(Venta venta, List<VentaProducto> productos)
		{
			foreach(var vp in productos)
			{
				venta.TotalAmount += vp.Cantidad * vp.PrecioUnitario;
			}

			return await _repository.Create(venta, productos);
		}
	}
}
