using System;
using System.Threading.Tasks;
using MapApp.Repositories;
using MapApp.Models;

namespace MapApp.UnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<Point> Points { get; }
        Task<int> SaveAsync();
    }
}