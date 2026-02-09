package com.example.teamService.teamService.config;

import com.example.teamService.teamService.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {}) // ✅ IMPORTANT
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/ws/**", "/ws/info/**").permitAll()
                        .requestMatchers("/api/teams/my-teams").permitAll() // ✅ ADD THIS
                        .requestMatchers("/api/teams/*/members").permitAll() // ✅ FIX
                        .requestMatchers("/api/teams/**").authenticated()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
