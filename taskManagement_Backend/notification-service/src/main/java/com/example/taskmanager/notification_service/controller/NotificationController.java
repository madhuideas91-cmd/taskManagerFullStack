package com.example.taskmanager.notification_service.controller;

import com.example.taskmanager.notification_service.dto.NotificationRequest;
import com.example.taskmanager.notification_service.model.Notification;
import com.example.taskmanager.notification_service.model.NotificationPreference;
import com.example.taskmanager.notification_service.dto.NotificationPreferenceRequest;
import com.example.taskmanager.notification_service.service.NotificationService;
import com.example.taskmanager.notification_service.service.PreferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PreferenceService preferenceService;

    @GetMapping
    public List<Notification> getNotifications() {
        return notificationService.getAllNotifications();
    }

    @PostMapping("/create")
    public Notification createNotification(@RequestBody NotificationRequest request) {
        return notificationService.createNotification(new Notification(request.getMessage()));
    }

    @PatchMapping("/mark-read/{id}")
    public Notification markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return "Notification deleted with id: " + id;
    }


    // ✅ Get current user's notification preferences
    @GetMapping("/preferences")
    public List<NotificationPreference> getPreferences() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return preferenceService.getByUserId(userId);
    }

    // ✅ Update current user's notification preferences
    @PutMapping("/preferences")
    public void updatePreferences(@RequestBody List<NotificationPreferenceRequest> prefs) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        preferenceService.save(userId, prefs);
    }

}
