package com.spring.controller;

import com.spring.dto.UserRegistrationDto;
import com.spring.jwt.JwtUtil;
import com.spring.model.Cart;
import com.spring.model.LoginRequest;
import com.spring.model.User;
import com.spring.model.UserShow;
import com.spring.repo.UserRepository;
import com.spring.service.CartService;
import com.spring.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

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

    @Autowired
    private UserService userService;

    @Autowired
    private CartService cartService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

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

        // Secure cookie - configured via properties
        ResponseCookie cookie = ResponseCookie.from("authToken", token)
                .httpOnly(true)
                .secure(cookieSecure)   // Dynamic: true for HTTPS, false for HTTP
                .path("/")
                .sameSite(cookieSameSite)  // Dynamic: Lax for dev, None for production
                .maxAge(5 * 24 * 60 * 60)   // 5 days to match JWT token expiration
                .build();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("token", token);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    // --- TOKEN VALIDATION ---
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader(name = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Unauthorized: Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7); // Remove "Bearer " prefix

        try {
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "Invalid or expired token"));
            }

            String username = jwtUtil.extractUsername(token);
            User user = userRepository.findByEmail(username);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "User not found"));
            }

            UserShow userShow = new UserShow(user);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Token valid");
            response.put("user", userShow);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid token"));
        }
    }

    // --- REGISTRATION ---
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationDto registrationDto) {
        try {
            User user = userService.registerUser(registrationDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("userId", user.getId());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("Error during registration: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // --- OAUTH CALLBACK - Returns JWT, User Data, and Cart ---
    @PostMapping("/oauth/user")
    public ResponseEntity<?> getOAuthUser(@RequestHeader(name = "Authorization", required = false) String authHeader) {
        try {
            // Extract token from header
            String token = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "Missing or invalid Authorization header"));
            }

            // Validate token
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "Invalid or expired token"));
            }

            // Get user from token
            String email = jwtUtil.extractUsername(token);
            User user = userRepository.findByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "User not found"));
            }

            // Get user cart
            Cart cart = null;
            try {
                cart = cartService.getCartByUserId(user.getId());
            } catch (Exception e) {
                // Cart might not exist yet, that's okay
                System.out.println("Cart not found for user: " + user.getId() + " - " + e.getMessage());
            }

            // Build response
            UserShow userShow = new UserShow(user);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OAuth login successful");
            response.put("token", token);
            response.put("user", userShow);
            response.put("cart", cart);
            
            // Set cookie - configured via properties
            ResponseCookie cookie = ResponseCookie.from("authToken", token)
                    .httpOnly(true)
                    .secure(cookieSecure)   // Dynamic: true for HTTPS, false for HTTP
                    .path("/")
                    .sameSite(cookieSameSite)  // Dynamic: Lax for dev, None for production
                    .maxAge(5 * 24 * 60 * 60)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(response);

        } catch (Exception e) {
            System.err.println("Error in OAuth user endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to process OAuth login: " + e.getMessage()));
        }
    }

    // --- OAUTH CALLBACK (Alternative - accepts token as query param) ---
    @GetMapping("/oauth/user")
    public ResponseEntity<?> getOAuthUserByToken(@RequestParam(name = "token", required = false) String tokenParam,
                                                   @RequestHeader(name = "Authorization", required = false) String authHeader) {
        try {
            // Extract token from query param or header
            String token = tokenParam;
            if (token == null && authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
            
            if (token == null || token.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "Token is required"));
            }

            // Validate token
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "Invalid or expired token"));
            }

            // Get user from token
            String email = jwtUtil.extractUsername(token);
            User user = userRepository.findByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "User not found"));
            }

            // Get user cart
            Cart cart = null;
            try {
                cart = cartService.getCartByUserId(user.getId());
            } catch (Exception e) {
                // Cart might not exist yet, that's okay
                System.out.println("Cart not found for user: " + user.getId() + " - " + e.getMessage());
            }

            // Build response
            UserShow userShow = new UserShow(user);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OAuth login successful");
            response.put("token", token);
            response.put("user", userShow);
            response.put("cart", cart);
            
            // Set cookie - configured via properties
            ResponseCookie cookie = ResponseCookie.from("authToken", token)
                    .httpOnly(true)
                    .secure(cookieSecure)   // Dynamic: true for HTTPS, false for HTTP
                    .path("/")
                    .sameSite(cookieSameSite)  // Dynamic: Lax for dev, None for production
                    .maxAge(5 * 24 * 60 * 60)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(response);

        } catch (Exception e) {
            System.err.println("Error in OAuth user endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to process OAuth login: " + e.getMessage()));
        }
    }

}
