using Microsoft.AspNetCore.Mvc;
using MapApp.Response;
using System.Threading.Tasks;
using MapApp.Services;
using MapApp.Models;
using System.Collections.Generic;

namespace MapApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PointController : ControllerBase
    {
        private readonly IPointService _pointService;

        public PointController(IPointService pointService)
        {
            _pointService = pointService;
        }

        [HttpGet]
        public async Task<ActionResult<Response<List<Point>>>> GetAll()
        {
            try
            {
                var points = await _pointService.GetAllPoints();
                return Ok(new Response<List<Point>>(true, "Points retrieved successfully", points));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response<List<Point>>(false, $"Internal server error: {ex.Message}", null));
            }
        }

        [HttpGet("filter")]
        public async Task<ActionResult<Response<List<Point>>>> GetById(int id)
        {
            try
            {
                var filteredPoints = await _pointService.GetPointsById(id);
                if (filteredPoints.Count == 0)
                {
                    return NotFound(new Response<List<Point>>(false, "No points found with the given ID", null));
                }
                return Ok(new Response<List<Point>>(true, "Points retrieved successfully", filteredPoints));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response<List<Point>>(false, $"Internal server error: {ex.Message}", null));
            }
        }

        [HttpGet("filterByX")]
        public async Task<ActionResult<Response<List<Point>>>> GetByX(double x)
        {
            try
            {
                var filteredPoints = await _pointService.GetPointsByX(x);
                if (filteredPoints.Count == 0)
                {
                    return NotFound(new Response<List<Point>>(false, "No points found with the given X coordinate", null));
                }
                return Ok(new Response<List<Point>>(true, "Points retrieved successfully", filteredPoints));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response<List<Point>>(false, $"Internal server error: {ex.Message}", null));
            }
        }

        [HttpGet("filterByY")]
        public async Task<ActionResult<Response<List<Point>>>> GetByY(double y)
        {
            try
            {
                var filteredPoints = await _pointService.GetPointsByY(y);
                if (filteredPoints.Count == 0)
                {
                    return NotFound(new Response<List<Point>>(false, "No points found with the given Y coordinate", null));
                }
                return Ok(new Response<List<Point>>(true, "Points retrieved successfully", filteredPoints));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response<List<Point>>(false, $"Internal server error: {ex.Message}", null));
            }
        }

        [HttpGet("filterByName")]
        public async Task<ActionResult<Response<List<Point>>>> GetByName(string name)
        {
            try
            {
                var filteredPoints = await _pointService.GetPointsByName(name);
                if (filteredPoints.Count == 0)
                {
                    return NotFound(new Response<List<Point>>(false, "No points found with the given name", null));
                }
                return Ok(new Response<List<Point>>(true, "Points retrieved successfully", filteredPoints));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response<List<Point>>(false, $"Internal server error: {ex.Message}", null));
            }
        }

        [HttpPut("update")]
        public async Task<ActionResult<Response<Point>>> UpdatePoint([FromBody] UpdatePointRequest request)
        {
            try
            {
                var updatedPoint = await _pointService.UpdatePoint(request.Id, request.NewX, request.NewY, request.NewName);
                if (updatedPoint == null)
                {
                    return NotFound(new Response<Point>(false, "Point not found or not updated", null));
                }
                return Ok(new Response<Point>(true, "Point updated successfully", updatedPoint));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new Response<Point>(false, "No points found with the given ID", null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response<Point>(false, $"Internal server error: {ex.Message}", null));
            }
        }


        [HttpPut("updateName")]
        public async Task<ActionResult<Response<List<Point>>>> UpdateByName(int id, string newName)
        {
            try
            {
                var pointsToUpdate = await _pointService.UpdatePointNameById(id, newName);
                return Ok(new Response<List<Point>>(true, "Points updated successfully", pointsToUpdate));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new Response<List<Point>>(false, "No points found with the given ID", null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response<List<Point>>(false, $"Internal server error: {ex.Message}", null));
            }
        }

        [HttpDelete("delete")]
        public async Task<ActionResult<Response<string>>> DeleteById(int id)
        {
            try
            {
                var deletedCount = await _pointService.DeletePointById(id);
                if (deletedCount == 0)
                {
                    return NotFound(new Response<string>(false, "No points found with the given ID", null));
                }
                return Ok(new Response<string>(true, $"Deleted {deletedCount} points with ID {id}", null));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response<string>(false, $"Internal server error: {ex.Message}", null));
            }
        }

        [HttpPost]
        public async Task<ActionResult<Response<Point>>> Add(Point point)
        {
            try
            {
                var newPoint = await _pointService.AddPoint(point);
                return CreatedAtAction(nameof(GetById), new { id = newPoint.Id }, new Response<Point>(true, "Point added successfully", newPoint));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response<Point>(false, $"Internal server error: {ex.Message}", null));
            }
        }
    }
}

