using backend.Models;
using backend.DTOs; // DODATO: Namespace gde se nalazi CreateTaskDTO
using backend.Repository;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
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
        public async Task<IActionResult> AddTask([FromBody] CreateTaskDTO taskDto) // IZMENJENO: Prima DTO, ne Model
        {
            try
            {
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt)) return Unauthorized("Niste prijavljeni.");

                var user = await _userService.GetUser(jwt);

                // Ručno kreiramo Model na osnovu DTO-a
                var task = new TodoTask
                {
                    UserId = user.Id, // ID dobijamo iz tokena, sigurno je
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
                // Vraćamo objekat sa porukom radi lakšeg čitanja na frontendu
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

                var tasks = await _taskRepo.GetByUserId(user.Id);
                return Ok(tasks);
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

                // 1. Obriši iz Cassandre
                await _taskRepo.Delete(user.Id, taskId);

                // 2. Dodeli poene u Redis Scoreboard
                // Koristimo Username jer Redis Scoreboard obično čuva string ključeve
                await _redisService.IncrementScore(user.Username!, 10);

                return Ok(new { message = "Zadatak završen, dobili ste 10 poena!", points = 10 });
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.Message });
            }
        }
    }
}