using MapApp.DBContext;
using MapApp.Repositories;
using MapApp.UnitOfWork;
using MapApp.Models;
using System.Threading.Tasks;

namespace MapApp.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly PointContext _context;
        private IGenericRepository<Point> _points;

        public UnitOfWork(PointContext context)
        {
            _context = context;
        }

        public IGenericRepository<Point> Points
            => _points ??= new GenericRepository<Point>(_context);

        public async Task<int> SaveAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}