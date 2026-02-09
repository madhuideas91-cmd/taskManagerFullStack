package com.example.taskmanager.notification_service.listener;

import com.example.taskmanager.notification_service.service.NotificationService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class NotificationListener {


    //private final NotificationService notificationService;

    @KafkaListener(topics = "task-created", groupId = "notification-service-group")
    public void listenTaskCreated(String message) {
        System.out.println("Received task-created message: " + message);
    }

    @KafkaListener(topics = "task-updated", groupId = "notification-service-group")
    public void listenTaskUpdated(String message) {
        System.out.println("Received task-updated message: " + message);
    }

    @KafkaListener(topics = "task-deleted", groupId = "notification-service-group")
    public void listenTaskDeleted(String message) {
        System.out.println("Received task-deleted message: " + message);
    }

}
