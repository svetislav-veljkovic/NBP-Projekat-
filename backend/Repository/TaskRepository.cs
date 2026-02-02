using backend.Models;
using backend.Services;
using Cassandra;
using Cassandra.Mapping;

public class TaskRepository : ITaskRepository
{
    private readonly Cassandra.ISession _session;
    private readonly IMapper _mapper;

    public TaskRepository(CassandraService cassandraService)
    {
        _session = cassandraService.GetSession();
        _mapper = new Mapper(_session);
    }

    public async System.Threading.Tasks.Task Create(TodoTask task) => await _mapper.InsertAsync(task);

    public async System.Threading.Tasks.Task<IEnumerable<TodoTask>> GetByUserId(Guid userId)
        => await _mapper.FetchAsync<TodoTask>("SELECT * FROM todo_task WHERE userid = ?", userId);

    public async System.Threading.Tasks.Task Delete(Guid userId, Guid taskId)
        => await _session.ExecuteAsync(new SimpleStatement("DELETE FROM todo_task WHERE userid = ? AND id = ?", userId, taskId));

    public async System.Threading.Tasks.Task<TodoTask> GetById(Guid userId, Guid taskId)
        => await _mapper.FirstOrDefaultAsync<TodoTask>("SELECT * FROM todo_task WHERE userid = ? AND id = ?", userId, taskId);

    
    public async System.Threading.Tasks.Task Update(TodoTask task)
        => await _mapper.UpdateAsync(task);

    public async System.Threading.Tasks.Task DeleteAllByUserId(Guid userId)
    {
      
        var query = "DELETE FROM todo_task WHERE userid = ?";
        await _session.ExecuteAsync(new SimpleStatement(query, userId));
    }
}