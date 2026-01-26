using backend.Models;
using backend.DTOs;
using backend.Services.IServices; // BITNO
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
        private readonly IUserService _userService; // Koristimo interfejs da se poklopi sa Program.cs

        public TaskController(ITaskService taskService, IUserService userService)
        {
            _taskService = taskService;
            _userService = userService;
        }

        [HttpPost("Add")]
        public async Task<IActionResult> AddTask([FromBody] CreateTaskDTO taskDto)
        {
            try
            {
                var user = await GetUserFromCookie();
                var task = await _taskService.AddTask(user.Id, taskDto.Title, taskDto.Description);
                return Ok(task);
            }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        [HttpGet("MyTasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            try
            {
                var user = await GetUserFromCookie();
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
                var user = await GetUserFromCookie();
                await _taskService.CompleteTask(user.Id, taskId, user.Username!);
                return Ok(new { message = "Zadatak završen, dobili ste 10 poena!", points = 10 });
            }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        [HttpGet("Leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            try
            {
                var topUsers = await _taskService.GetLeaderboard();
                return Ok(topUsers);
            }
            catch (Exception) { return BadRequest(new { message = "Greška pri učitavanju." }); }
        }

        [HttpGet("ProductivityData")]
        public async Task<IActionResult> GetProductivityData()
        {
            try
            {
                var user = await GetUserFromCookie();
                var data = await _taskService.GetProductivityData(user.Id);
                return Ok(data);
            }
            catch (Exception) { return BadRequest(new { message = "Greška pri učitavanju dijagrama." }); }
        }

        // Pomoćna metoda
        private async Task<User> GetUserFromCookie()
        {
            var jwt = Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(jwt)) throw new Exception("Unauthorized");
            return await _userService.GetUser(jwt);
        }
    }
}