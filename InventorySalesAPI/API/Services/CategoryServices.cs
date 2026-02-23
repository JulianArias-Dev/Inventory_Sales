using API.DTOs;
using API.Models;
using API.Repository;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
	public class CategoryServices
	{
		private CategoryRep _repository;

		public CategoryServices(CategoryRep categoryRep)
		{
			_repository = categoryRep;
		}

		public async Task<List<CategoryResponseDto>> GetAsync()
		{
			var categorias = await _repository.GetAllAsync();

			var response = categorias.Select(c => new CategoryResponseDto
			{
				Id = c.Id,
				Nombre = c.Name,
			}).ToList();

			return response;
		}

		public async Task<CategoryResponseDto?> GetOneAsync(int id)
		{
			var category = await _repository.GetOne(id);

			if (category == null)
				return null;

			return new CategoryResponseDto()
			{
				Id = category.Id,
				Nombre = category.Name,
			};
		}

		public async Task<CategoryResponseDto> Create(CreateCategoryDto dto)
		{
			var categoria = new Categoria()
			{
				Name = dto.Nombre,
			};

			try
			{
				await _repository.Create(categoria);
			}
			catch (DbUpdateException ex)
			{
				if (ex.InnerException?.Message.Contains("IX_Categorias_Name") == true)
				{
					throw new InvalidOperationException("Ya existe una categoría con ese nombre.");
				}

				throw;
			}

			return new CategoryResponseDto()
			{
				Id = categoria.Id,
				Nombre = categoria.Name,
			};
		}

		public async Task<CategoryResponseDto?> Update(int id, CategoryResponseDto dto)
		{
			var categoria = new Categoria()
			{
				Id = id,
				Name = dto.Nombre,
			};

			var categoryUpdated =  await _repository.Update(id, categoria);

			if (categoryUpdated == null)
				return null;

			return new CategoryResponseDto()
			{
				Id = categoryUpdated.Id,
				Nombre = categoryUpdated.Name,
			};
		}

		public async Task<bool> Delete(int id)
		{
			var category = await _repository.GetOne(id);

			if(category == null) 
				return false;

			if(await _repository.HasRelation(id)) 
				return false;

			return await _repository.Delete(category);
		}
	}
}
