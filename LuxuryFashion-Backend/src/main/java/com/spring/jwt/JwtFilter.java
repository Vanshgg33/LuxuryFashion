package com.spring.jwt;


import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;


@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public JwtFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        System.out.println("Request path: " + path);

        // Skip JWT validation for public paths
        if (path.equals("/") ||
                path.equals("/login") ||
                path.equals("/users/register") ||
                path.equals("/auth/validate") ||
                path.equals("/auth/login") ||
                path.startsWith("/luxuryfashion/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwtToken = extractJwt(request);

        if (jwtToken == null) {
            response.sendRedirect(frontendUrl + "/login");
            System.out.println("JWT token missing");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Missing JWT token\"}");
            return;
        }

        try {
            String username = jwtUtil.extractUsername(jwtToken);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(jwtToken)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Authenticated user: " + username);
                } else {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT token");
                    return;
                }
            }

        } catch (ExpiredJwtException e) {
            response.sendRedirect(frontendUrl + "/login");
            System.out.println("JWT expired: " + e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT Token has expired");
            return;
        } catch (MalformedJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            System.out.println("Invalid JWT: " + e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwt(HttpServletRequest request) {
        // 1️⃣ Check Authorization header
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 2️⃣ Fallback to cookies
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("authToken".equals(cookie.getName())) {  // 👈 be consistent here
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}
