package com.example.teamService.teamService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/api/auth/id-by-email")
    Long getUserIdByEmail(@RequestParam("email") String email);

    @GetMapping("/api/auth/email-by-id")
    ResponseEntity<String> getEmailByUserId(@RequestParam("userId") Long userId);
}

