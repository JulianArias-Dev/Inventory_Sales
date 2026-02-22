using API.Models;
using API.Repository;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
	public class ProductService
	{
		private ProductRep _repository;


		public ProductService(ProductRep repositoy) {
			_repository = repositoy;
		}

		public async Task<List<Producto>> GetAsync()
		{
			return await _repository.GetAllAsync();
		}

		public async Task<Producto?> GetOneAsync(int id)
		{
			return await _repository.GetOne(id);
		}

		public async Task<Producto> Create(Producto producto)
		{
			return await _repository.CreateAsync(producto);
		}

		public async Task<Producto?> Update(int productId, Producto producto)
		{
			return await _repository.UpdateProductAsync(productId, producto);
		}

		public async Task<bool> Delete(int id)
		{
			var product = await _repository.GetOne(id);

			if (product == null)
				return false;

			if (await _repository.HasRelation(id))
				return false;

			return await _repository.Delete(product);
		}
	}
}
