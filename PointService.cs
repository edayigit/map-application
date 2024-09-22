using MapApp.Services;
using MapApp.Models;
using MapApp.Response;
using MapApp.UnitOfWork;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MapApp.Services
{
    public class PointService : IPointService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PointService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<Point>> GetAllPoints()
        {
            return (await _unitOfWork.Points.GetAllAsync()).ToList();
        }

        public async Task<List<Point>> GetPointsById(int id)
        {
            return new List<Point> { await _unitOfWork.Points.GetByIdAsync(id) };
        }

        public async Task<List<Point>> GetPointsByX(double x)
        {
            return (await _unitOfWork.Points.GetAllAsync()).Where(p => p.X == x).ToList();
        }

        public async Task<List<Point>> GetPointsByY(double y)
        {
            return (await _unitOfWork.Points.GetAllAsync()).Where(p => p.Y == y).ToList();
        }

        public async Task<List<Point>> GetPointsByName(string name)
        {
            return (await _unitOfWork.Points.GetAllAsync()).Where(p => p.Name == name).ToList();
        }

        public async Task<Point> UpdatePoint(int id, double newX, double newY, string newName)
        {
            var pointsToUpdate = await _unitOfWork.Points.FindAsync(p => p.Id == id);
            if (!pointsToUpdate.Any())
            {
                throw new KeyNotFoundException("No points found with the given ID.");
            }

            var pointToUpdate = pointsToUpdate.First();
            pointToUpdate.X = newX;
            pointToUpdate.Y = newY;
            pointToUpdate.Name = newName;

            _unitOfWork.Points.Update(pointToUpdate);
            await _unitOfWork.SaveAsync();

            // Veritabanında güncellenen veriyi geri döndür
            return pointToUpdate;
        }

        public async Task<List<Point>> UpdatePointNameById(int id, string newName)
        {
            var points = await GetPointsById(id);
            if (!points.Any())
            {
                throw new KeyNotFoundException("No points found with the given ID.");
            }

            foreach (var point in points)
            {
                point.Name = newName;
                _unitOfWork.Points.Update(point);
            }

            await _unitOfWork.SaveAsync();
            return points;
        }

        public async Task<int> DeletePointById(int id)
        {
            var points = await GetPointsById(id);
            if (!points.Any())
            {
                return 0;
            }

            foreach (var point in points)
            {
                _unitOfWork.Points.Delete(point);
            }

            return await _unitOfWork.SaveAsync();
        }

        public async Task<Point> AddPoint(Point point)
        {
            await _unitOfWork.Points.AddAsync(point);
            await _unitOfWork.SaveAsync();
            return point;
        }
    }
}