using API.Data;

namespace API.Repository
{
	public abstract class Repo
	{
		protected readonly AppDbContext _context;

		public Repo (AppDbContext context)
		{
			_context = context;
		}
	}
}
