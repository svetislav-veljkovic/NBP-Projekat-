using backend.Models;
using backend.DTOs; 
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services.IServices
{
    public interface ITaskService
    {
        
        Task<TodoTask> AddTask(Guid userId, string title, string description, string priority, DateTime? dueDate);
        Task<List<TodoTask>> GetFilteredTasks(Guid userId, string status, string sortBy);
        Task UpdateTask(Guid userId, Guid taskId, UpdateTaskDTO taskDto);
        Task DeleteTask(Guid userId, Guid taskId);
        Task<List<TodoTask>> GetActiveTasks(Guid userId);
        Task CompleteTask(Guid userId, Guid taskId, string username);
        Task<List<KeyValuePair<string, double>>> GetLeaderboard();

        Task<object> GetProductivityData(Guid userId, string period);
    }
}