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

        // --- DODAVANJE ZADATKA ---
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

            // 1. Čuvanje u Cassandri (Persistent Storage)
            await _taskRepo.Create(task);

            // 2. Čuvanje u Redis Hash-u (Podaci o zadatku)
            await _redisService.CacheTaskData(task.Id.ToString(), title, description);

            // 3. Povezivanje u Redis Set-u (User -> Task)
            // Ovo omogućava "brzu dostupnost" koju prof traži
            await _redisService.AddTaskToUserSet(userId.ToString(), task.Id.ToString());

            return task;
        }

        // --- PRIKAZ ZADATAKA ---
        public async Task<List<TodoTask>> GetActiveTasks(Guid userId)
        {
            // 1. Prvo pokušavamo da čitamo iz Redisa (Brzi keš)
            var redisTasksData = await _redisService.GetTasksFromRedis(userId.ToString());

            if (redisTasksData.Count > 0)
            {
                // Ako ima podataka u Redisu, pretvaramo ih u TodoTask objekte
                var redisTasks = new List<TodoTask>();
                foreach (var data in redisTasksData)
                {
                    redisTasks.Add(new TodoTask
                    {
                        Id = Guid.Parse(data["id"]),
                        UserId = userId,
                        Title = data["title"],
                        Description = data["description"],
                        IsCompleted = false // U Redisu držimo samo aktivne
                    });
                }
                return redisTasks;
            }

            // 2. Fallback na Cassandru (ako je Redis prazan ili je istekao)
            var tasks = await _taskRepo.GetByUserId(userId);
            return tasks.Where(t => !t.IsCompleted).ToList();
        }

        // --- ZAVRŠAVANJE ZADATKA (Check-off) ---
        public async Task CompleteTask(Guid userId, Guid taskId, string username)
        {
            // 1. Dohvati zadatak iz Cassandre da imamo sve podatke (datum itd.)
            var task = await _taskRepo.GetById(userId, taskId);
            if (task == null) throw new Exception("Zadatak nije pronađen.");

            // 2. "Check-off operacija": Arhiviramo ga u Cassandri
            task.IsCompleted = true;
            await _taskRepo.Create(task); // Update u Cassandri

            // 3. Brišemo iz Redisa (Hash i veza sa korisnikom)
            // Prof: "brisemo taj task, brisemo da je taj zadatak povezan sa korisnikom"
            await _redisService.RemoveTaskFromRedis(userId.ToString(), taskId.ToString());

            // 4. Ažuriramo Scoreboard (Sorted Set)
            // Prof: "azuriramo podatke o score-u"
            await _redisService.IncrementScore(username, 1);
        }

        public async Task<List<KeyValuePair<string, double>>> GetLeaderboard()
        {
            return await _redisService.GetTopUsers(5); // Top 5 po zahtevu
        }

        public async Task<object> GetProductivityData(Guid userId)
        {
            // Ovo čita arhivirane (završene) zadatke iz Cassandre
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