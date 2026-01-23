using System;
using Cassandra.Mapping.Attributes;

namespace backend.Models
{
    [Table("todo_task")]
    public class TodoTask
    {
        [PartitionKey]
        [Column("userid")]
        public Guid UserId { get; set; }

        [ClusteringKey]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("createdat")] // USKLAĐENO SA TVOJOM TABELOM (nema donje crte _)
        public DateTime CreatedAt { get; set; }

        [Column("iscompleted")] // USKLAĐENO SA TVOJOM TABELOM
        public bool IsCompleted { get; set; }

        public TodoTask()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
            IsCompleted = false;
        }
    }
}