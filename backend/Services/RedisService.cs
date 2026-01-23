using StackExchange.Redis;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class RedisService
    {
        private readonly IDatabase _db;
        private const string ScoreboardKey = "todo_scoreboard";

        public RedisService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

        // Povećava poene korisniku (za Scoreboard)
        public async Task IncrementScore(string username, double points = 10)
        {
            // Redis Sorted Set (ZINCRBY)
            await _db.SortedSetIncrementAsync(ScoreboardKey, username, points);
        }

        // Uzima Top 10 korisnika
        public async Task<List<KeyValuePair<string, double>>> GetTopUsers(int count = 10)
        {
            // ZREVRANGE sa skorovima
            var results = await _db.SortedSetRangeByRankWithScoresAsync(ScoreboardKey, 0, count - 1, Order.Descending);

            return results.Select(x => new KeyValuePair<string, double>(x.Element!, x.Score)).ToList();
        }

        // TTL Sesija (Primer: privremeno čuvanje statusa zadatka u obradi)
        public async Task SetTaskStatus(string taskId, string status, TimeSpan expiry)
        {
            await _db.StringSetAsync($"task_status:{taskId}", status, expiry);
        }
    }
}