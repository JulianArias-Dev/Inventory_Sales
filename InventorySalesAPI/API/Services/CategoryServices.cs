using API.Models;
using API.Repository;

namespace API.Services
{
	public class CategoryServices
	{
		private CategoryRep _repository;

		public CategoryServices(CategoryRep categoryRep)
		{
			_repository = categoryRep;
		}

		public async Task<List<Categoria>> GetAsync()
		{
			return await _repository.GetAllAsync();
		}

		public async Task<Categoria?> GetOneAsync(int id)
		{
			return await _repository.GetOne(id);
		}

		public async Task<Categoria> Create(Categoria categoria)
		{
			return await _repository.Create(categoria);
		}

		public async Task<Categoria?> Update(int id, Categoria categoria)
		{
			return await _repository.Update(id, categoria);
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
