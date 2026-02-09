package com.example.taskmanager.user_service.dto;

public class AuthResponse {
    private String token;
    private Long userId;  // ✅ NEW

    public AuthResponse() {}

    public AuthResponse(String token, Long userId) {
        this.token = token;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }  // ✅ NEW
    public void setUserId(Long userId) { this.userId = userId; } // ✅ NEW
}
