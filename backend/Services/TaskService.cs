using backend.Models;
using backend.Repository;
using backend.Services.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepo;
        private readonly RedisService _redisService;

        public TaskService(ITaskRepository taskRepo, RedisService redisService)
        {
            _taskRepo = taskRepo;
            _redisService = redisService;
        }

        public async Task<TodoTask> AddTask(Guid userId, string title, string description)
        {
            var task = new TodoTask
            {
                UserId = userId,
                Title = title,
                Description = description,
                CreatedAt = DateTime.UtcNow,
                IsCompleted = false
            };
            await _taskRepo.Create(task);
            return task;
        }

        public async Task<List<TodoTask>> GetActiveTasks(Guid userId)
        {
            var tasks = await _taskRepo.GetByUserId(userId);
            return tasks.Where(t => !t.IsCompleted).ToList();
        }

        public async Task CompleteTask(Guid userId, Guid taskId, string username)
        {
            var task = await _taskRepo.GetById(userId, taskId);
            if (task == null) throw new Exception("Zadatak nije pronađen.");

            // 1. Markiramo kao završeno
            task.IsCompleted = true;

            // 2. Čuvamo u Cassandri (ovo služi za tvoje dijagrame produktivnosti kasnije)
            await _taskRepo.Create(task);

            // 3. REDIS LOGIKA: Ovde se dešava Weekly TTL magija
            // Koristimo username za Scoreboard jer je on vidljiv na rang listi
            await _redisService.IncrementScore(username, 10);
        }

        public async Task<List<KeyValuePair<string, double>>> GetLeaderboard()
        {
            return await _redisService.GetTopUsers(10);
        }

        public async Task<object> GetProductivityData(Guid userId)
        {
            var allTasks = await _taskRepo.GetByUserId(userId);

            return allTasks
                .Where(t => t.IsCompleted)
                .GroupBy(t => t.CreatedAt.ToString("yyyy-MM-dd"))
                .Select(g => new {
                    day = g.Key,
                    count = g.Count()
                })
                .OrderBy(x => x.day)
                .ToList();
        }
    }
}