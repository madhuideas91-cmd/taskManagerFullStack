package com.example.teamService.teamService.client;

// ✅ Make this public
public class NotificationRequest {
    private String message;

    public NotificationRequest() {}
    public NotificationRequest(String message) { this.message = message; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
