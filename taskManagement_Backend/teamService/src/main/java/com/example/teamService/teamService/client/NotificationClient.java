package com.example.teamService.teamService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationClient {

    // ✅ Change to POST and send JSON
    @PostMapping(value = "/notifications/create", consumes = "application/json")
    void sendNotification(@RequestBody NotificationRequest message);
}