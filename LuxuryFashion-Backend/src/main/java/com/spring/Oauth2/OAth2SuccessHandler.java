package com.spring.Oauth2;

import com.spring.jwt.JwtUtil;
import com.spring.model.Role;
import com.spring.model.User;
import com.spring.model.UserShow;
import com.spring.notification.EmailNotificationService;
import com.spring.notification.EmailTemplate;
import com.spring.repo.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class OAth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailNotificationService emailService;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url}")
    private String frontendUrl; // e.g. http://localhost:5173

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        if (email == null || email.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not provided by OAuth provider");
            return;
        }

        // Find or create user
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            // Create new user - only set password for NEW users
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name != null ? name : email.split("@")[0]); // Use email prefix if name not available
            
            // Set OAuth user password to "1234" (encoded) - ONLY for new users
            newUser.setPassword(passwordEncoder.encode("1234"));

            // Set default values
            newUser.setGender("UNKNOWN");
            newUser.setRole(Role.USER); // Set default role
            
            user = userRepository.save(newUser);
            
            // Send welcome email for new users
            sendWelcomeEmail(user);
        } else {
            // Existing user - DO NOT change password, preserve existing password
            // Only update name if it's missing or empty
            if ((user.getName() == null || user.getName().isEmpty()) && name != null) {
                user.setName(name);
                userRepository.save(user);
            }
            // Password remains unchanged for existing users
        }

        // DTO wrapper
        UserShow userShow = new UserShow(user);

        // Generate JWT
        String token = jwtUtil.generateToken(userShow.getUsername());

        // Secure cookie - configured via properties (matches AuthController)
        ResponseCookie cookie = ResponseCookie.from("authToken", token)
                .httpOnly(true)
                .secure(cookieSecure)   // Dynamic: true for HTTPS, false for HTTP
                .path("/")
                .sameSite(cookieSameSite)  // Dynamic: Lax for dev, None for production
                .maxAge(5 * 24 * 60 * 60)   // 5 days to match JWT token expiration
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        // Encode token for URL
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
        
        // Redirect to frontend with token in URL (frontend will extract and call /auth/oauth/user)
        String redirectUrl = frontendUrl + "/oauth/callback?token=" + encodedToken + "&email=" +
                           URLEncoder.encode(email, StandardCharsets.UTF_8);
        
        System.out.println("OAuth2 Success - Redirecting with token for user: " + email);

        // Redirect to frontend OAuth callback page
        response.sendRedirect(redirectUrl);
    }

    private void sendWelcomeEmail(User user) {
        try {
            String subject = "Welcome to LuxuryFashion! 🎉";
            // Use OAuth welcome template with password "1234"
            String content = EmailTemplate.getOAuthWelcomeTemplate(user.getName(), user.getEmail(), "1234");
            emailService.sendNotification(user.getEmail(), null, subject, content);
        } catch (Exception e) {
            System.err.println("Failed to send OAuth2 welcome email: " + e.getMessage());
        }
    }
}
