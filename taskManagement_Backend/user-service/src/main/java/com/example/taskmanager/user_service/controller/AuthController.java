package com.example.taskmanager.user_service.controller;
import com.example.taskmanager.user_service.dto.ChangePasswordRequest;

import com.example.taskmanager.user_service.dto.*;
import com.example.taskmanager.user_service.model.User;
import com.example.taskmanager.user_service.security.JwtUtils;
import com.example.taskmanager.user_service.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtils jwtUtils;

    public AuthController(UserService userService, JwtUtils jwtUtils) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        try {
            User u = userService.signup(req.getName(), req.getEmail(), req.getPassword());
            return ResponseEntity.ok().body("User created successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody AuthRequest req) {
    var opt = userService.findByEmail(req.getEmail());
    if (opt.isEmpty()) return ResponseEntity.status(401).body("Invalid credentials");

    var user = opt.get();
    if (!userService.checkPassword(user, req.getPassword())) {
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    String token = jwtUtils.generateToken(user.getEmail());
    return ResponseEntity.ok(new AuthResponse(token, user.getId())); // ✅ include userId
}


    @GetMapping("/profile")
    public ResponseEntity<?> profile(@RequestHeader(value = "Authorization", required = false) String auth) {

        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = auth.substring(7);

        if (!jwtUtils.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }

        String email = jwtUtils.extractUsername(token);

        var userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).build();

        var user = userOpt.get();

        // Return object instead of plain string
        Map<String, Object> profile = new HashMap<>();
        profile.put("name", user.getFirstName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().name()); // Enum → String

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/id-by-email")
    public ResponseEntity<Long> getIdByEmail(@RequestParam String email) {
        return userService.findByEmail(email)
                .map(user -> ResponseEntity.ok(user.getId()))
                .orElse(ResponseEntity.notFound().build());
    }
    // ✅ ADD THIS (missing endpoint)
    @GetMapping("/email-by-id")
    public ResponseEntity<String> getEmailById(@RequestParam Long userId) {
        return userService.findById(userId)
                .map(user -> ResponseEntity.ok(user.getEmail()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody UpdateProfileRequest req
    ) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = auth.substring(7);
        if (!jwtUtils.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }

        String emailFromToken = jwtUtils.extractUsername(token);

        var userOpt = userService.findByEmail(emailFromToken);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        User user = userOpt.get();

        // ✅ Update allowed fields only
        user.setFirstName(req.getName());
        user.setEmail(req.getEmail());

        userService.save(user); // save updated user

        return ResponseEntity.ok().build();
    }
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody ChangePasswordRequest req
    ) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = auth.substring(7);
        if (!jwtUtils.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }

        String email = jwtUtils.extractUsername(token);

        var userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        User user = userOpt.get();

        // 🔐 verify current password
        if (!userService.checkPassword(user, req.getCurrentPassword())) {
            return ResponseEntity.badRequest().body("Current password is incorrect");
        }

        // 🔐 update password
        userService.updatePassword(user, req.getNewPassword());

        return ResponseEntity.ok("Password updated successfully");
    }

}
