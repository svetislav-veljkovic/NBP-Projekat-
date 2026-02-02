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

        // --- 1. TTL SESIJA (Key-Value String) ---
        public async Task SaveUserSession(string token, string userId, TimeSpan expiry)
        {
            // Key: session:jwt_token, Value: userId
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

        // --- 2. DODAVANJE KORISNIKA (HASH) ---
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

        // --- 3. DODAVANJE ZADATAKA (HASH + SET) ---
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
            // Set koji pamti vezu korisnik -> zadaci
            await _db.SetAddAsync($"user_tasks:{userId}", taskId);
        }

        // --- 4. CHECK-OFF OPERACIJA (Brisanje + Scoreboard) ---
        public async Task CompleteTaskCheckOff(string userId, string taskId, string username, int weight)
        {
            // 1. Brišemo vezu iz SET-a korisnika (Redis Set)
            await _db.SetRemoveAsync($"user_tasks:{userId}", taskId);

            // 2. Brišemo detalje o zadatku (Redis Hash)
            await _db.KeyDeleteAsync($"task:{taskId}");

            // 3. Inkrementiramo globalni scoreboard za WEIGHT (Sorted Set - ZINCRBY)
            // Profesor će ovo ceniti jer nije puko brojanje, već rangiranje po težini
            await _db.SortedSetIncrementAsync(ScoreboardKey, username, weight);

            // 4. Ažuriramo score i u korisničkom Hash-u
            await _db.HashIncrementAsync($"user:{userId}", "score", weight);
        }

        // Metoda za dobavljanje zadataka iz keša (za brzi pristup profilu)
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

        // --- 5. SCOREBOARD (SORTED SET) ---
        public async Task<List<KeyValuePair<string, double>>> GetTopUsers(int count = 5)
        {
            // Vraća Top 5 korisnika (Sorted Set - ZREVRANGE)
            var results = await _db.SortedSetRangeByRankWithScoresAsync(ScoreboardKey, 0, count - 1, Order.Descending);
            return results.Select(x => new KeyValuePair<string, double>(x.Element!, x.Score)).ToList();
        }


        public async Task RemoveTaskFromRedis(string userId, string taskId)
        {
            await _db.SetRemoveAsync($"user_tasks:{userId}", taskId);
            await _db.KeyDeleteAsync($"task:{taskId}");
        }


        // Dodaj ovo unutar RedisService klase
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

        // --- 6. BRISANJE SVIH PODATAKA KORISNIKA IZ REDISA ---

        public async Task RemoveUserAllData(string userId, string username)
        {
            // 1. Brišemo Hash sa podacima korisnika (user:ID)
            await _db.KeyDeleteAsync($"user:{userId}");

            // 2. Brišemo Set sa ID-jevima zadataka (user_tasks:ID)
            // Prvo moramo obrisati svaki pojedinačni Task Hash da ne ostanu "siročići"
            var taskIds = await _db.SetMembersAsync($"user_tasks:{userId}");
            foreach (var taskId in taskIds)
            {
                await _db.KeyDeleteAsync($"task:{taskId}");
            }
            // Zatim brišemo sam Set
            await _db.KeyDeleteAsync($"user_tasks:{userId}");

            // 3. Brišemo korisnika sa Leaderboard-a (Sorted Set)
            await _db.SortedSetRemoveAsync(ScoreboardKey, username);

            // 4. Brišemo sve sesije (opciono, ako koristiš prefiks session:*)
            // Napomena: Za ovo bi nam trebao SCAN, ali pošto admin briše preko ID-a, 
            // sesiju obično brišemo direktno preko tokena u Controlleru ili ostavimo da istekne TTL.
        }
    }
}