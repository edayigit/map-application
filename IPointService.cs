using MapApp.Models;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace MapApp.Services

{
    public interface IPointService
    {
        Task<List<Point>> GetAllPoints();
        Task<List<Point>> GetPointsById(int id);
        Task<List<Point>> GetPointsByX(double x);
        Task<List<Point>> GetPointsByY(double y);
        Task<List<Point>> GetPointsByName(string name);
        Task<Point> UpdatePoint(int id, double newX, double newY, string newName);
        Task<List<Point>> UpdatePointNameById(int id, string newName);
        Task<int> DeletePointById(int id);
        Task<Point> AddPoint(Point point);
    }
}