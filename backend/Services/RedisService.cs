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
        private const string ScoreboardKey = "leaderboard:global"; // Ime po zahtevu prof

        public RedisService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

        // --- 1. SESIJA (TTL) ---
        public async Task SaveUserSession(string userId, string sessionData, TimeSpan expiry)
        {
            await _db.StringSetAsync($"session:{userId}", sessionData, expiry);
        }

        public async Task<bool> IsSessionActive(string userId)
        {
            return await _db.KeyExistsAsync($"session:{userId}");
        }

        // --- 2. KORISNICI (HASH) ---
        // Zahtev: Minimalni podaci (score, username) se pamte u Redisu
        public async Task SaveUserHash(string userId, string username, double score = 0)
        {
            var hashEntries = new HashEntry[]
            {
                new HashEntry("username", username),
                new HashEntry("score", score)
            };
            await _db.HashSetAsync($"user:{userId}", hashEntries);
        }

        // --- 3. ZADACI (HASH + SET) ---
        
        // Čuvamo zadatak kao HASH (detalji zadatka)
        public async Task CacheTaskData(string taskId, string title, string description)
        {
            var hashEntries = new HashEntry[]
            {
                new HashEntry("title", title),
                new HashEntry("description", description)
            };
            await _db.HashSetAsync($"task:{taskId}", hashEntries);
        }

        // Povezujemo korisnika i zadatak kroz SET (samo ID zadatka)
        public async Task AddTaskToUserSet(string userId, string taskId)
        {
            await _db.SetAddAsync($"user_tasks:{userId}", taskId);
        }

        // Brišemo zadatak iz Redisa (kad se završi)
        public async Task RemoveTaskFromRedis(string userId, string taskId)
        {
            // 1. Obriši vezu iz Seta korisnika
            await _db.SetRemoveAsync($"user_tasks:{userId}", taskId);
            // 2. Obriši podatke o zadatku (Hash)
            await _db.KeyDeleteAsync($"task:{taskId}");
        }

        // Dohvatanje svih zadataka za korisnika iz Redisa
        public async Task<List<Dictionary<string, string>>> GetTasksFromRedis(string userId)
        {
            // 1. Uzmi sve ID-eve iz Seta
            var taskIds = await _db.SetMembersAsync($"user_tasks:{userId}");
            var tasksList = new List<Dictionary<string, string>>();

            foreach (var redisId in taskIds)
            {
                string taskId = redisId.ToString();
                // 2. Za svaki ID, povuci detalje iz Hash-a
                var hashEntries = await _db.HashGetAllAsync($"task:{taskId}");
                
                if (hashEntries.Length > 0)
                {
                    var taskDict = hashEntries.ToDictionary(
                        x => x.Name.ToString(), 
                        x => x.Value.ToString()
                    );
                    taskDict.Add("id", taskId); // Dodajemo i ID da znamo koji je
                    tasksList.Add(taskDict);
                }
            }
            return tasksList;
        }

        // --- 4. SCOREBOARD (SORTED SET) ---
        public async Task IncrementScore(string username, double points = 1)
        {
            // Prof traži: ZINCRBY leaderboard:global 1 "Marko"
            await _db.SortedSetIncrementAsync(ScoreboardKey, username, points);
        }

        public async Task<List<KeyValuePair<string, double>>> GetTopUsers(int count = 5)
        {
            // Prof traži Top 5
            var results = await _db.SortedSetRangeByRankWithScoresAsync(ScoreboardKey, 0, count - 1, Order.Descending);
            return results.Select(x => new KeyValuePair<string, double>(x.Element!, x.Score)).ToList();
        }
    }
}