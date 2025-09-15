package com.spring.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret:}")
    private String secretKey;
    @Value("${jwt.expiration:}")
    private Long expirationTime;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // Generate JWT for username
    public String generateToken(String username) {
        //    @Value("${jwt.expiration:}") // e.g. 900000 = 15 mins

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract username (subject) from token
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    // Check if token is expired
    public boolean isTokenExpired(String token) {
        return parseClaims(token).getExpiration().before(new Date());
    }

    // Validate token signature + expiry
    public boolean validateToken(String token) {
        try {
            parseClaims(token); // will throw if invalid
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }


    private Claims parseClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
