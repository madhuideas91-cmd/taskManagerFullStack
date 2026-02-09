package com.example.project_service.project_service.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    @LoadBalanced   // ⭐ THIS IS THE KEY
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}

