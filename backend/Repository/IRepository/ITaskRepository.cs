using backend.Models;

public interface ITaskRepository
{
    Task Create(TodoTask task);
    Task<IEnumerable<TodoTask>> GetByUserId(Guid userId);
    Task Delete(Guid userId, Guid taskId);
    Task<TodoTask> GetById(Guid userId, Guid taskId);
}