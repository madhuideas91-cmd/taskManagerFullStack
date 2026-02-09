package com.example.taskmanager.task_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class TaskEventWebSocketPublisher {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = {
            "task-created",
            "task-updated",
            "task-deleted"
    })
    public void forwardToWebSocket(String projectIdAsString) {

        // 🔥 projectId is coming as Kafka message value
        messagingTemplate.convertAndSend(
                "/topic/projects/" + projectIdAsString + "/tasks",
                "TASK_CHANGED"
        );
    }
}

