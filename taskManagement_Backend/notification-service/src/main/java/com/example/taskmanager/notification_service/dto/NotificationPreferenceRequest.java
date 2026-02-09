package com.example.taskmanager.notification_service.dto;


import com.example.taskmanager.notification_service.model.NotificationType;

public class NotificationPreferenceRequest {
    private NotificationType type;
    private boolean emailEnabled;
    private boolean inAppEnabled;

    // getters & setters
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public boolean isEmailEnabled() { return emailEnabled; }
    public void setEmailEnabled(boolean emailEnabled) { this.emailEnabled = emailEnabled; }
    public boolean isInAppEnabled() { return inAppEnabled; }
    public void setInAppEnabled(boolean inAppEnabled) { this.inAppEnabled = inAppEnabled; }
}
