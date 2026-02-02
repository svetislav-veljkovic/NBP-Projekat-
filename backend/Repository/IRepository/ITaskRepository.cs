using backend.Models;

public interface ITaskRepository
{
    System.Threading.Tasks.Task Create(TodoTask task);
    System.Threading.Tasks.Task<IEnumerable<TodoTask>> GetByUserId(Guid userId);
    System.Threading.Tasks.Task Delete(Guid userId, Guid taskId);
    System.Threading.Tasks.Task<TodoTask> GetById(Guid userId, Guid taskId);
    System.Threading.Tasks.Task Update(TodoTask task);
    System.Threading.Tasks.Task DeleteAllByUserId(Guid userId);
}