package com.spring.controller;

import com.spring.jwt.JwtUtil;
import com.spring.model.LoginRequest;
import com.spring.model.User;
import com.spring.model.UserShow;
import com.spring.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // --- LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();

        User user = userRepository.findByEmail(email);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            System.out.println("Wrong password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid credentials"));
        }

        // Generate JWT securely
        UserShow userShow = new UserShow(user);
        String token = jwtUtil.generateToken(userShow.getUsername());

        // Secure cookie
        ResponseCookie cookie = ResponseCookie.from("authToken", token)
                .httpOnly(true)         // not accessible by JS
                .secure(true)           // only over HTTPS
                .path("/")
                .sameSite("Strict")     // prevent CSRF
                .maxAge(24 * 60 * 60)   // 1 day
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Collections.singletonMap("message", "Login successful"));
    }

    // --- TOKEN VALIDATION ---
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@CookieValue(name = "authToken", required = false) String token) {
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Unauthorized: Missing JWT cookie"));
        }

        try {
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "Invalid or expired token"));
            }

            String username = jwtUtil.extractUsername(token);
            return ResponseEntity.ok(Collections.singletonMap("message", "Token valid for user: " + username));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid token"));
        }
    }
}
