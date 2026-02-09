package com.example.taskmanager.task_service.kafka;


import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class TaskKafkaListener {

    @KafkaListener(topics = "task-created", groupId = "task-group")
    public void onTaskCreated(String message) {
        System.out.println("📥 [Kafka] Task Created Event Received: " + message);
    }

    @KafkaListener(topics = "task-updated", groupId = "task-group")
    public void onTaskUpdated(String message) {
        System.out.println("📥 [Kafka] Task Updated Event Received: " + message);
    }

    @KafkaListener(topics = "task-deleted", groupId = "task-group")
    public void onTaskDeleted(String message) {
        System.out.println("📥 [Kafka] Task Deleted Event Received: " + message);
    }
}
