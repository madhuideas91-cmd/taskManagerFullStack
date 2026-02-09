package com.example.project_service.project_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

//    @Override
//    protected void doFilterInternal(
//            HttpServletRequest req,
//            HttpServletResponse res,
//            FilterChain chain
//    ) throws java.io.IOException, jakarta.servlet.ServletException {
//
//        // ✅ INTERNAL SERVICE CALL
//        if ("true".equals(req.getHeader("X-Internal-Call"))) {
//
//            UsernamePasswordAuthenticationToken auth =
//                    new UsernamePasswordAuthenticationToken(
//                            "INTERNAL_SERVICE",
//                            null,
//                            List.of()
//                    );
//
//            SecurityContextHolder.getContext().setAuthentication(auth);
//
//            chain.doFilter(req, res);
//            return;
//        }
//
//        // Normal JWT flow
//        String header = req.getHeader(HttpHeaders.AUTHORIZATION);
//
//        if (header != null && header.startsWith("Bearer ")) {
//            String token = header.substring(7);
//
//            if (jwtUtils.validateToken(token)) {
//                String email = jwtUtils.extractUsername(token);
//
//                UsernamePasswordAuthenticationToken auth =
//                        new UsernamePasswordAuthenticationToken(email, null, List.of());
//
//                SecurityContextHolder.getContext().setAuthentication(auth);
//            }
//        }
//
//        chain.doFilter(req, res);
//    }
@Override
protected void doFilterInternal(
        HttpServletRequest req,
        HttpServletResponse res,
        FilterChain chain
) throws java.io.IOException, jakarta.servlet.ServletException {

    String path = req.getRequestURI();

    // ✅ Skip JWT validation for public endpoints
    if ("true".equals(req.getHeader("X-Internal-Call")) ||
            path.equals("/projects/getAllProjectsWithProgress") ||
            path.startsWith("/ws/") ||
            path.startsWith("/projects/team/")) {

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        "PUBLIC", null, List.of()
                );
        SecurityContextHolder.getContext().setAuthentication(auth);

        chain.doFilter(req, res);
        return;
    }

    // Normal JWT flow
    String header = req.getHeader(HttpHeaders.AUTHORIZATION);

    if (header != null && header.startsWith("Bearer ")) {
        String token = header.substring(7);

        if (jwtUtils.validateToken(token)) {
            String email = jwtUtils.extractUsername(token);

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(email, null, List.of());

            SecurityContextHolder.getContext().setAuthentication(auth);
        }
    }

    chain.doFilter(req, res);
}

}
