using backend.Models;
using backend.DTOs;
using backend.Repository;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly ITaskRepository _taskRepo;
        private readonly RedisService _redisService;
        private readonly UserService _userService;

        public TaskController(ITaskRepository taskRepo, RedisService redisService, UserService userService)
        {
            _taskRepo = taskRepo;
            _redisService = redisService;
            _userService = userService;
        }

        [HttpPost("Add")]
        public async Task<IActionResult> AddTask([FromBody] CreateTaskDTO taskDto)
        {
            try
            {
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt)) return Unauthorized("Niste prijavljeni.");

                var user = await _userService.GetUser(jwt);

                var task = new TodoTask
                {
                    UserId = user.Id,
                    Title = taskDto.Title,
                    Description = taskDto.Description,
                    CreatedAt = DateTime.UtcNow,
                    IsCompleted = false
                };

                await _taskRepo.Create(task);
                return Ok(task);
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.Message });
            }
        }

        [HttpGet("MyTasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            try
            {
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt)) return Unauthorized();

                var user = await _userService.GetUser(jwt);

                // Uzimamo samo zadatke koji NISU završeni za prikaz u listi
                var tasks = await _taskRepo.GetByUserId(user.Id);
                var activeTasks = tasks.Where(t => !t.IsCompleted).ToList();

                return Ok(activeTasks);
            }
            catch (Exception e)
            {
                return Unauthorized();
            }
        }

        [HttpPost("Complete/{taskId}")]
        public async Task<IActionResult> CompleteTask(Guid taskId)
        {
            try
            {
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt)) return Unauthorized();

                var user = await _userService.GetUser(jwt);

                var task = await _taskRepo.GetById(user.Id, taskId);
                if (task == null) return NotFound("Zadatak nije pronađen.");

                // IZMENA: Umesto Delete, radimo Update statusa
                task.IsCompleted = true;
                await _taskRepo.Create(task); // Cassandra Mapping Create radi i Upsert (Update)

                // Dodeli poene u Redis
                await _redisService.IncrementScore(user.Username!, 10);

                return Ok(new { message = "Zadatak završen, dobili ste 10 poena!", points = 10 });
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.Message });
            }
        }

        [HttpGet("Leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            try
            {
                var topUsers = await _redisService.GetTopUsers(10);
                return Ok(topUsers);
            }
            catch (Exception e)
            {
                return BadRequest(new { message = "Nije moguće učitati rang listu." });
            }
        }

        // NOVO: Endpoint za podatke o produktivnosti (Dijagram)
        [HttpGet("ProductivityData")]
        public async Task<IActionResult> GetProductivityData()
        {
            try
            {
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt)) return Unauthorized();

                var user = await _userService.GetUser(jwt);
                var allTasks = await _taskRepo.GetByUserId(user.Id);

                // Grupišemo završene zadatke po datumu
                var chartData = allTasks
                    .Where(t => t.IsCompleted)
                    .GroupBy(t => t.CreatedAt.ToString("yyyy-MM-dd"))
                    .Select(g => new {
                        day = g.Key,
                        count = g.Count()
                    })
                    .OrderBy(x => x.day)
                    .ToList();

                return Ok(chartData);
            }
            catch (Exception e)
            {
                return BadRequest(new { message = "Greška pri obradi podataka za dijagram." });
            }
        }
    }
}