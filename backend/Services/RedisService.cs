using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class RedisService
    {
        private readonly IDatabase _db;
        private const string ScoreboardKey = "leaderboard:global";

        public RedisService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

     
        public async Task SaveUserSession(string token, string userId, TimeSpan expiry)
        {
            
            await _db.StringSetAsync($"session:{token}", userId, expiry);
        }

        public async Task<bool> IsSessionActive(string token)
        {
            return await _db.KeyExistsAsync($"session:{token}");
        }

        public async Task DeleteSession(string token)
        {
            await _db.KeyDeleteAsync($"session:{token}");
        }

        
        public async Task SaveUserHash(string userId, string? username, double score = 0)
        {
            string safeUsername = username ?? "UnknownUser";
            var hashEntries = new HashEntry[]
            {
                new HashEntry("username", safeUsername),
                new HashEntry("score", score.ToString())
            };
            await _db.HashSetAsync($"user:{userId}", hashEntries);
        }

       
        public async Task CacheTaskData(string taskId, string title, string description, string priority, DateTime? dueDate)
        {
            var hashEntries = new HashEntry[]
            {
                new HashEntry("title", title),
                new HashEntry("description", description),
                new HashEntry("priority", priority ?? "Medium"),
               new HashEntry("dueDate", dueDate?.ToString("yyyy-MM-ddTHH:mm:ss") ?? "")
            };
            await _db.HashSetAsync($"task:{taskId}", hashEntries);
        }

        public async Task AddTaskToUserSet(string userId, string taskId)
        {
          
            await _db.SetAddAsync($"user_tasks:{userId}", taskId);
        }

      
        public async Task CompleteTaskCheckOff(string userId, string taskId, string username, int weight)
        {
            
            await _db.SetRemoveAsync($"user_tasks:{userId}", taskId);
            await _db.KeyDeleteAsync($"task:{taskId}");
            await _db.SortedSetIncrementAsync(ScoreboardKey, username, weight);
            await _db.HashIncrementAsync($"user:{userId}", "score", weight);

         
            var currentTtl = await _db.KeyTimeToLiveAsync(ScoreboardKey);

            if (currentTtl == null || currentTtl.Value.TotalSeconds < 0)
            {

                DateTime sadUtc = DateTime.UtcNow;
                int daysUntilMonday = ((int)DayOfWeek.Monday - (int)sadUtc.DayOfWeek + 7) % 7;
                if (daysUntilMonday == 0) daysUntilMonday = 7;
                DateTime sledeciPonedeljakUtc = sadUtc.AddDays(daysUntilMonday).Date;

                TimeSpan vremeDoReseta = sledeciPonedeljakUtc - sadUtc;

                // TimeSpan vremeDoReseta = TimeSpan.FromMinutes(1);                                  ZA TESTRIRANJE TTL SCOREBOARD 

                await _db.KeyExpireAsync(ScoreboardKey, vremeDoReseta);
            }
        }
        

      
        public async Task<List<Dictionary<string, string>>> GetTasksFromRedis(string userId)
        {
            var taskIds = await _db.SetMembersAsync($"user_tasks:{userId}");
            var tasksList = new List<Dictionary<string, string>>();

            foreach (var redisId in taskIds)
            {
                string taskId = redisId.ToString();
                var hashEntries = await _db.HashGetAllAsync($"task:{taskId}");

                if (hashEntries.Length > 0)
                {
                    var taskDict = hashEntries.ToDictionary(
                        x => x.Name.ToString(),
                        x => x.Value.ToString()
                    );
                    taskDict.Add("id", taskId);
                    tasksList.Add(taskDict);
                }
            }
            return tasksList;
        }

   
        public async Task<List<KeyValuePair<string, double>>> GetTopUsers(int count = 5)
        {
           
            var results = await _db.SortedSetRangeByRankWithScoresAsync(ScoreboardKey, 0, count - 1, Order.Descending);
            return results.Select(x => new KeyValuePair<string, double>(x.Element!, x.Score)).ToList();
        }


        public async Task RemoveTaskFromRedis(string userId, string taskId)
        {
            await _db.SetRemoveAsync($"user_tasks:{userId}", taskId);
            await _db.KeyDeleteAsync($"task:{taskId}");
        }


     
        public async Task<IEnumerable<string>> GetUserTaskIds(string userId)
        {
            var members = await _db.SetMembersAsync($"user_tasks:{userId}");
            return members.Select(x => x.ToString());
        }

        public async Task<Dictionary<string, string>?> GetTaskData(string taskId)
        {
            var entries = await _db.HashGetAllAsync($"task:{taskId}");
            if (entries.Length == 0) return null;

            return entries.ToDictionary(x => x.Name.ToString(), x => x.Value.ToString());
        }

        

        public async Task RemoveUserAllData(string userId, string username)
        {
           
            await _db.KeyDeleteAsync($"user:{userId}");

       
            var taskIds = await _db.SetMembersAsync($"user_tasks:{userId}");
            foreach (var taskId in taskIds)
            {
                await _db.KeyDeleteAsync($"task:{taskId}");
            }
            
            await _db.KeyDeleteAsync($"user_tasks:{userId}");

           
            await _db.SortedSetRemoveAsync(ScoreboardKey, username);

        }
    }
}