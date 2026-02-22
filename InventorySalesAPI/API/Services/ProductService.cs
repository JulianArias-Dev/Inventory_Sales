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

		public async Task<List<Producto>> GetProductsAsync()
		{
			return await _repository.GetAllAsync();
		}

		public async Task<Producto?> GetOneProductAsync(int id)
		{
			return await _repository.GetOne(id);
		}




	}
}
