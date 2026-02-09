package com.example.taskmanager.notification_service.service;

import java.util.concurrent.atomic.AtomicLong;

public class NotificationIdGenerator {
    private static final AtomicLong counter = new AtomicLong(1);

    public static Long getNextId() {
        return counter.getAndIncrement();
    }
}
