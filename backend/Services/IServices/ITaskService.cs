using backend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services.IServices
{
    public interface ITaskService
    {
        Task<TodoTask> AddTask(Guid userId, string title, string description);
        Task<List<TodoTask>> GetActiveTasks(Guid userId);
        Task CompleteTask(Guid userId, Guid taskId, string username);
        Task<List<KeyValuePair<string, double>>> GetLeaderboard();
        Task<object> GetProductivityData(Guid userId);
    }
}