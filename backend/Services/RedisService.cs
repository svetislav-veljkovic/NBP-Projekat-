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
        private const string ScoreboardKey = "todo_scoreboard";

        public RedisService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

        // Povećava poene korisniku i postavlja TTL ako je lista nova
        public async Task IncrementScore(string username, double points = 10)
        {
            // 1. Povećavamo poene (Redis Sorted Set)
            await _db.SortedSetIncrementAsync(ScoreboardKey, username, points);

            // 2. Proveravamo da li tabela već ima postavljen TTL (Time To Live)
            // Ako ključ nema TTL (rezultat je null ili negativan), postavljamo ga
            var currentTtl = await _db.KeyTimeToLiveAsync(ScoreboardKey);

            if (currentTtl == null || currentTtl.Value.TotalSeconds < 0)
            {
                // Postavljamo da se cela rang lista obriše nakon 24 sata
                // Ovo obezbeđuje "Daily Scoreboard" mehanizam koji si tražio
                await _db.KeyExpireAsync(ScoreboardKey, TimeSpan.FromHours(24));
            }
        }

        // Uzima Top 10 korisnika
        public async Task<List<KeyValuePair<string, double>>> GetTopUsers(int count = 10)
        {
            // Vraća korisnike sortirane po poenima (opadajuće)
            var results = await _db.SortedSetRangeByRankWithScoresAsync(ScoreboardKey, 0, count - 1, Order.Descending);

            return results.Select(x => new KeyValuePair<string, double>(x.Element!, x.Score)).ToList();
        }

        // TTL Sesija / Check-out mehanizam (npr. zaključavanje zadatka dok je u obradi)
        public async Task SetTaskStatus(string taskId, string status, TimeSpan expiry)
        {
            // Koristi TTL da automatski obriše status nakon isteka vremena
            await _db.StringSetAsync($"task_status:{taskId}", status, expiry);
        }
    }
}