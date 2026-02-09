package com.example.teamService.teamService.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final ServiceTokenProvider tokenProvider;

    public JwtFilter(ServiceTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Skip JWT validation for internal calls
        if ("true".equals(request.getHeader("X-Internal-Call"))) {
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            "internal", null,
                            List.of(new SimpleGrantedAuthority("ROLE_INTERNAL"))
                    );
            SecurityContextHolder.getContext().setAuthentication(auth);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // Try to get numeric user ID
                Long userId = null;
                Object principal = null;

                tokenProvider.getUserIdFromToken(token)
                        .map(id -> (Object) id)
                        .or(() -> tokenProvider.getSubjectFromToken(token).map(s -> (Object) s))
                        .ifPresent(prin -> {  // rename from 'principal' to 'prin'
                            UsernamePasswordAuthenticationToken auth =
                                    new UsernamePasswordAuthenticationToken(
                                            prin, null,
                                            List.of(new SimpleGrantedAuthority("ROLE_USER"))
                                    );
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        });


            } catch (Exception e) {
                // Invalid token, just skip authentication
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
