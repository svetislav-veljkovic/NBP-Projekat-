using backend.Models;
using backend.DTOs; // Dodaj ovaj namespace
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services.IServices
{
    public interface ITaskService
    {
        // Izmenjeno: Dodata nova polja za dodavanje
        Task<TodoTask> AddTask(Guid userId, string title, string description, string priority, DateTime? dueDate);

        // Izmenjeno: Dodata podrška za filtriranje i sortiranje
        Task<List<TodoTask>> GetFilteredTasks(Guid userId, string status, string sortBy);

        // Novo: CRUD operacije
        Task UpdateTask(Guid userId, Guid taskId, UpdateTaskDTO taskDto);
        Task DeleteTask(Guid userId, Guid taskId);

        Task<List<TodoTask>> GetActiveTasks(Guid userId);
        Task CompleteTask(Guid userId, Guid taskId, string username);
        Task<List<KeyValuePair<string, double>>> GetLeaderboard();

        // Izmenjeno: Podrška za period (7 dana / mesec)
        Task<object> GetProductivityData(Guid userId, string period);
    }
}