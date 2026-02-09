package com.example.project_service.project_service.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Connection;
import java.sql.DriverManager;

@RestController
public class HealthCheckController {

    @GetMapping("/db-test")
    public String testDbConnection() {
        try (Connection conn = DriverManager.getConnection(
                "jdbc:mysql://mysql:3306/your_db", "user", "password")) {
            return conn.isValid(2) ? "DB OK" : "DB FAIL";
        } catch (Exception e) {
            return "DB FAIL: " + e.getMessage();
        }
    }
}
