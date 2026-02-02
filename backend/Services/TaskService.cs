using backend.Models;
using backend.DTOs;
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

        public async Task<TodoTask> AddTask(Guid userId, string title, string description, string priority, DateTime? dueDate)
        {
            var task = new TodoTask
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = title,
                Description = description,
                Priority = priority ?? "Medium",
                DueDate = dueDate,
                CreatedAt = DateTime.UtcNow,
                IsCompleted = false
            };

            await _taskRepo.Create(task);
            await _redisService.CacheTaskData(task.Id.ToString(), title, description, task.Priority, task.DueDate);
            await _redisService.AddTaskToUserSet(userId.ToString(), task.Id.ToString());

            return task;
        }

        public async Task<List<TodoTask>> GetFilteredTasks(Guid userId, string status, string sortBy)
        {
            List<TodoTask> tasks = new List<TodoTask>();

    
            var taskIds = await _redisService.GetUserTaskIds(userId.ToString());
            foreach (var id in taskIds)
            {
                var taskData = await _redisService.GetTaskData(id);
                if (taskData != null)
                {
                    tasks.Add(new TodoTask
                    {
                        Id = Guid.Parse(id),
                        UserId = userId,
                        Title = taskData["title"],
                        Description = taskData["description"],
                        Priority = taskData["priority"],
                        DueDate = string.IsNullOrEmpty(taskData["dueDate"]) ? null : DateTime.Parse(taskData["dueDate"]),
                        CreatedAt = DateTime.UtcNow, 
                        IsCompleted = false
                    });
                }
            }

            return ApplySorting(tasks, sortBy);
        }
      

        public async Task<List<TodoTask>> GetActiveTasks(Guid userId)
            => await GetFilteredTasks(userId, "active", "date");

        public async Task<List<KeyValuePair<string, double>>> GetLeaderboard()
            => await _redisService.GetTopUsers(5);


        public async Task CompleteTask(Guid userId, Guid taskId, string username)
        {
            var task = await _taskRepo.GetById(userId, taskId);
            if (task == null) throw new Exception("Zadatak nije pronadjen.");

           
            int weight = task.Priority?.ToLower() switch
            {
                "high" => 3,
                "medium" => 2,
                "low" => 1,
                _ => 1
            };

            task.IsCompleted = true;
            task.CompletedAt = DateTime.UtcNow;

          
            await _taskRepo.Update(task);
         
            await _redisService.CompleteTaskCheckOff(userId.ToString(), taskId.ToString(), username, weight);
        }

        public async Task UpdateTask(Guid userId, Guid taskId, UpdateTaskDTO taskDto)
        {
            var task = await _taskRepo.GetById(userId, taskId);
            if (task == null) throw new Exception("Zadatak nije pronadjen.");

            task.Title = taskDto.Title;
            task.Description = taskDto.Description;
            task.Priority = taskDto.Priority;
            task.DueDate = taskDto.DueDate;

            await _taskRepo.Update(task);

            if (!task.IsCompleted)
            {
                await _redisService.CacheTaskData(task.Id.ToString(), task.Title, task.Description, task.Priority, task.DueDate);
            }
        }

        public async Task DeleteTask(Guid userId, Guid taskId)
        {
            var task = await _taskRepo.GetById(userId, taskId);
            if (task != null)
            {
                await _taskRepo.Delete(userId, taskId);
                await _redisService.RemoveTaskFromRedis(userId.ToString(), taskId.ToString());
            }
        }

        public async Task<object> GetProductivityData(Guid userId, string period)
        {
            var tasks = (await _taskRepo.GetByUserId(userId)).ToList();
            var completedTasks = tasks.Where(t => t.IsCompleted);

            if (period == "7days")
                completedTasks = completedTasks.Where(t => t.CreatedAt >= DateTime.UtcNow.AddDays(-7));
            else if (period == "month")
                completedTasks = completedTasks.Where(t => t.CreatedAt >= DateTime.UtcNow.AddMonths(-1));

            return completedTasks
                .GroupBy(t => t.CreatedAt.ToString(period == "month" ? "yyyy-MM-dd" : "dd.MM."))
                .Select(g => new { day = g.Key, count = g.Count() })
                .OrderBy(x => x.day)
                .ToList();
        }

        private List<TodoTask> ApplySorting(List<TodoTask> tasks, string sortBy)
        {
            return sortBy switch
            {
                "priority" => tasks.OrderByDescending(t => t.Priority == "High")
                                  .ThenByDescending(t => t.Priority == "Medium")
                                  .ThenByDescending(t => t.Priority == "Low").ToList(),
                "due" => tasks.OrderBy(t => t.DueDate ?? DateTime.MaxValue).ToList(),
                "status" => tasks.OrderBy(t => t.IsCompleted).ToList(),
                _ => tasks.OrderByDescending(t => t.CreatedAt).ToList()
            };
        }
    }
}