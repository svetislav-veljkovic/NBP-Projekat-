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

        [Column("createdat")]
        public DateTime CreatedAt { get; set; }

        [Column("iscompleted")]
        public bool IsCompleted { get; set; }

        // --- NOVA POLJA KOJA SU FALILA ---
        [Column("priority")]
        public string Priority { get; set; } = "Medium";

        [Column("duedate")]
        public DateTime? DueDate { get; set; }

        [Column("completedat")]
        public DateTime? CompletedAt { get; set; }

        public TodoTask()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
            IsCompleted = false;
            Priority = "Medium";
        }
    }
}