package com.example.teamService.teamService.config;

import com.example.teamService.teamService.security.ServiceTokenProvider;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ProjectFeignConfig {

    private final ServiceTokenProvider tokenProvider;

    public ProjectFeignConfig(ServiceTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            // Generate internal service token (userId=0L)
            String token = tokenProvider.generateToken(0L);

            // Add Authorization header
            requestTemplate.header("Authorization", "Bearer " + token);

            // Mark as internal call so JwtFilter skips normal validation
            requestTemplate.header("X-Internal-Call", "true");
        };
    }
}
