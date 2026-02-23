using API.DTOs;
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

		public async Task<List<ProductoResponseDto>> GetAsync()
		{
			var productos = await _repository.GetAllAsync();

			var response = productos.Select(producto => new ProductoResponseDto
			{
				Id = producto.Id,
				Name = producto.Name,
				Price = producto.Price,
				Stock = producto.Stock,
				categoria = producto.CategoriaId
			}).ToList();

			return response;
		}

		public async Task<ProductoResponseDto?> GetOneAsync(int id)
		{
			var producto = await _repository.GetOne(id);
			
			if (producto == null)
				return null;

			return new ProductoResponseDto
			{
				Id = producto.Id,
				Name = producto.Name,
				Price = producto.Price,
				Stock = producto.Stock,
				categoria = producto.CategoriaId
			};
		}

		public async Task<ProductoResponseDto> Create(CreateProductoDto dto)
		{
			var exists = await _repository.ExistsByNameAsync(dto.Name);
			if (exists)
				throw new InvalidOperationException("Ya existe un producto con ese nombre.");

			var producto = new Producto
			{
				Name = dto.Name,
				Price = dto.Price,
				Stock = dto.Stock,
				CategoriaId = dto.CategoriaId
			};

			try
			{
				producto = await _repository.CreateAsync(producto);
			}
			catch (DbUpdateException)
			{
				throw new InvalidOperationException("Ya existe un producto con ese nombre.");
			}

			return new ProductoResponseDto
			{
				Id = producto.Id,
				Name = producto.Name,
				Price = producto.Price,
				Stock = producto.Stock,
				categoria = producto.CategoriaId
			};
		}

		public async Task<ProductoResponseDto?> Update(int productId, UpdateProductoDto dto)
		{
			var producto = new Producto
			{
				Name = dto.Name,
				Price = dto.Price,
				Stock = dto.Stock,
				CategoriaId = dto.CategoriaId
			};

			var productUpdated = await _repository.UpdateProductAsync(productId, producto);

			if (productUpdated != null)
				return new ProductoResponseDto
				{
					Id = productUpdated.Id,
					Name = productUpdated.Name,
					Price = productUpdated.Price,
					Stock = productUpdated.Stock,
					categoria = productUpdated.CategoriaId
				};

			return null;
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
