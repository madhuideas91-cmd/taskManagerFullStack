package com.example.taskmanager.notification_service.security;


import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class JwtUtils {

    private final String SECRET = "your_secret_key_change_this_your_secret_key_change_this";
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token).getBody();
        return claims.get("userId", Long.class);
    }
}
