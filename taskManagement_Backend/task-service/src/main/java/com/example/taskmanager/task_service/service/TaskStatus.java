package com.example.taskmanager.task_service.service;


public enum TaskStatus {
    OPEN,
    IN_PROGRESS,
    DONE;

    // Optional: convert string like "progress" to enum
    public static TaskStatus fromString(String value) {
        if (value == null) return null;

        switch (value.toUpperCase()) {
            case "OPEN":
                return OPEN;
            case "IN_PROGRESS":
            case "PROGRESS": // map "progress" automatically
                return IN_PROGRESS;
            case "DONE":
                return DONE;
            default:
                throw new IllegalArgumentException("Invalid status: " + value);
        }
    }
}
