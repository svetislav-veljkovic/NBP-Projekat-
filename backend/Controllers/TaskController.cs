using backend.Models;
using backend.DTOs;
using backend.Services;
using backend.Services.IServices;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

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
                var task = await _taskService.AddTask(
                    user.Id,
                    taskDto.Title,
                    taskDto.Description,
                    taskDto.Priority,
                    taskDto.DueDate
                );
                return Ok(task);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        [HttpGet("MyTasks")]
        public async Task<IActionResult> GetMyTasks([FromQuery] string status = "all", [FromQuery] string sortBy = "date")
        {
            try
            {
                var user = await ValidateSessionAndGetUser();
                // Ovde prosleđujemo status i sortBy servisu
                var tasks = await _taskService.GetFilteredTasks(user.Id, status, sortBy);
                return Ok(tasks);
            }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        [HttpPut("Update/{taskId}")]
        public async Task<IActionResult> UpdateTask(Guid taskId, [FromBody] UpdateTaskDTO taskDto)
        {
            try
            {
                var user = await ValidateSessionAndGetUser();
                await _taskService.UpdateTask(user.Id, taskId, taskDto);
                return Ok(new { message = "Zadatak uspešno izmenjen." });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        [HttpDelete("Delete/{taskId}")]
        public async Task<IActionResult> DeleteTask(Guid taskId)
        {
            try
            {
                var user = await ValidateSessionAndGetUser();
                await _taskService.DeleteTask(user.Id, taskId);

                // Sada će ova metoda raditi jer smo je vratili u RedisService
                await _redisService.RemoveTaskFromRedis(user.Id.ToString(), taskId.ToString());

                return Ok(new { message = "Zadatak obrisan." });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        [HttpPost("Complete/{taskId}")]
        public async Task<IActionResult> CompleteTask(Guid taskId)
        {
            try
            {
                var user = await ValidateSessionAndGetUser();

                
                await _taskService.CompleteTask(user.Id, taskId, user.Username!);

                return Ok(new { message = "Zadatak uspešno završen i poeni su dodeljeni!" });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return BadRequest(new { message = e.Message });
            }
        }
        [HttpGet("Leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            try
            {
                // Leaderboard je javni, ne mora ValidateSession osim ako ne želiš
                var topUsers = await _redisService.GetTopUsers(10);
                var result = topUsers.Select(x => new { key = x.Key, value = x.Value });
                return Ok(result);
            }
            catch (Exception) { return BadRequest(new { message = "Greška pri učitavanju." }); }
        }

        [HttpGet("ProductivityData")]
        public async Task<IActionResult> GetProductivityData([FromQuery] string period = "7days")
        {
            try
            {
                var user = await ValidateSessionAndGetUser();
                var data = await _taskService.GetProductivityData(user.Id, period);
                return Ok(data);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception) { return BadRequest(new { message = "Greška pri učitavanju dijagrama." }); }
        }

        // --- POMOĆNA METODA SA SLIDING EXPIRATION ---
        private async Task<User> ValidateSessionAndGetUser()
        {
            var jwt = Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(jwt)) throw new UnauthorizedAccessException();

            // Provera TTL sesije (Key = Token)
            if (!await _redisService.IsSessionActive(jwt))
                throw new UnauthorizedAccessException("Sesija istekla.");

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) throw new UnauthorizedAccessException();

            // Sliding Expiration - produži sesiju za 30 min pri svakoj akciji
            await _redisService.SaveUserSession(jwt, userIdStr, TimeSpan.FromMinutes(30));

            return await _userService.GetUserById(Guid.Parse(userIdStr));
        }
    }
}