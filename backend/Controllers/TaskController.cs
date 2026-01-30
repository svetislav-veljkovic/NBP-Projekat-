using backend.Models;
using backend.DTOs;
using backend.Services;
using backend.Services.IServices;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;
        private readonly IUserService _userService;
        private readonly RedisService _redisService;

        public TaskController(ITaskService taskService, IUserService userService, RedisService redisService)
        {
            _taskService = taskService;
            _userService = userService;
            _redisService = redisService;
        }

        [HttpPost("Add")]
        public async Task<IActionResult> AddTask([FromBody] CreateTaskDTO taskDto)
        {
            try
            {
                var user = await ValidateSessionAndGetUser();
                var task = await _taskService.AddTask(user.Id, taskDto.Title, taskDto.Description);
                return Ok(task);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        [HttpGet("MyTasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            try
            {
                var user = await ValidateSessionAndGetUser();
                var activeTasks = await _taskService.GetActiveTasks(user.Id);
                return Ok(activeTasks);
            }
            catch (Exception) { return Unauthorized(); }
        }

        [HttpPost("Complete/{taskId}")]
        public async Task<IActionResult> CompleteTask(Guid taskId)
        {
            try
            {
                var user = await ValidateSessionAndGetUser();

                // Cassandra Update + Redis Scoreboard Increment
                await _taskService.CompleteTask(user.Id, taskId, user.Username!);

                return Ok(new { message = "Zadatak završen, +10 poena na nedeljnoj listi!", points = 10 });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        [HttpGet("Leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            try
            {
                var topUsers = await _redisService.GetTopUsers(10);
                var result = topUsers.Select(x => new { key = x.Key, value = x.Value });
                return Ok(result);
            }
            catch (Exception) { return BadRequest(new { message = "Greška pri učitavanju." }); }
        }

        [HttpGet("ProductivityData")]
        public async Task<IActionResult> GetProductivityData()
        {
            try
            {
                var user = await ValidateSessionAndGetUser();
                var data = await _taskService.GetProductivityData(user.Id);
                return Ok(data);
            }
            catch (Exception) { return BadRequest(new { message = "Greška pri učitavanju dijagrama." }); }
        }

        // Centralizovana provera JWT-a i Redis Sesije
        private async Task<User> ValidateSessionAndGetUser()
        {
            var jwt = Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(jwt)) throw new UnauthorizedAccessException();

            var user = await _userService.GetUser(jwt);

            // KLJUČNO: Provera Redis TTL sesije
            if (!await _redisService.IsSessionActive(user.Id.ToString()))
                throw new UnauthorizedAccessException("Session expired");

            return user;
        }
    }
}