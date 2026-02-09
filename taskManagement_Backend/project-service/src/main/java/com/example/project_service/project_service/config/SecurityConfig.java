package com.example.project_service.project_service.config;

//@Configuration
//@RequiredArgsConstructor
//public class SecurityConfig {
//
//    private final JwtFilter jwtFilter;
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable())
//                .authorizeHttpRequests(auth -> auth
//                        // ✅ Allow websocket handshake and SockJS info endpoint
//                        .requestMatchers("/ws/**", "/ws/info/**").permitAll()
//                        // ✅ Allow TeamService to call this endpoint without JWT
//                        .requestMatchers("/projects/byTeam/**").permitAll()
//                        // your existing secured APIs
//                        .requestMatchers("/projects/**").authenticated()
//                        .anyRequest().authenticated()
//                )
//                // Add JWT filter BEFORE username/password filter
//                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//}
//

import com.example.project_service.project_service.security.JwtFilter;
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
                .cors(cors -> {})   // ✅ allow CORS, but DO NOT define headers here
                .authorizeHttpRequests(auth -> auth
                        // WebSocket
                        .requestMatchers("/ws/**", "/ws/info/**").permitAll()
                        // ✅ INTERNAL SERVICE CALLS — MUST BE permitAll
                        .requestMatchers("/projects/team/**").permitAll()
                        .requestMatchers("/projects/getAllProjectsWithProgress").permitAll()// added after dockersizing

                        // Secured APIs
                        .requestMatchers("/projects/**").authenticated()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
