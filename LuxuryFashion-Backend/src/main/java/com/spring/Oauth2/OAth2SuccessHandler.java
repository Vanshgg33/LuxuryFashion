package com.spring.Oauth2;

import com.spring.jwt.JwtUtil;
import com.spring.model.User;
import com.spring.model.UserShow;
import com.spring.repo.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl; // e.g. http://localhost:5173

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");

        // Find or create user
        User user = userRepository.findByEmail(email);
        if (user == null) {
            User newUser = new User();
            newUser.setEmail(email);

            // Prevent dummy password login by using random encoded string
            newUser.setPassword(UUID.randomUUID().toString());

            // Store more info if available
            newUser.setGender("UNKNOWN");
            newUser.setName(oauth2User.getAttribute("name"));
            user = userRepository.save(newUser);
        }

        // DTO wrapper
        UserShow userShow = new UserShow(user);

        // Generate JWT
        String token = jwtUtil.generateToken(userShow.getUsername());

        // Secure cookie
        ResponseCookie cookie = ResponseCookie.from("authToken", token)
                .httpOnly(true)
                .secure(true)           // HTTPS only
                .path("/")
                .sameSite("None")
                .maxAge(24 * 60 * 60)   // 1 day
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Redirect to frontend
        response.sendRedirect(frontendUrl + "/shop");
    }
}
