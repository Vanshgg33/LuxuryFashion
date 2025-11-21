package com.spring.security;



import com.spring.Oauth2.OAth2SuccessHandler;
import com.spring.jwt.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class Config {
    @Autowired
    private JwtFilter jwtFilter;
    @Autowired
    private com.spring.jwt.JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private OAth2SuccessHandler oAth2SuccessHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
@Value("${app.frontend.url}")
private String frontendUrl;

@Value("${app.cors.allowed-origins:http://localhost:5173,https://www.rangeelaboutique.com}")
private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for APIs
                .csrf(csrf -> csrf.disable())

                // Enable CORS with configuration source
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/products/**", "/save", "/css/**", "/style.css",
                                "/auth/validate", "/auth/login", "/auth/register", "/auth/oauth/user", 
                                "/oauth2/**", "/login/oauth2/**")
                        .permitAll()
                        .requestMatchers("/luxuryfashion/**","/luxuryfashion/fetch-gallery").permitAll()
                        .requestMatchers("/admin-api/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/admin-api/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/admin-api/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/admin-api/**").hasRole("ADMIN")
                        .requestMatchers("/api/cart/**", "/api/orders/**").hasAnyRole("USER", "ADMIN")
                        .anyRequest().authenticated()
                )

                // OAuth2 login success handler
                .oauth2Login(oauth2 -> oauth2.successHandler(oAth2SuccessHandler))


                .anonymous(anon -> anon.authorities("ROLE_ANONYMOUS"))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Parse allowed origins from environment variable or use defaults
        String[] origins = allowedOrigins.split(",");
        
        // Build list of allowed origins
        List<String> allowedOriginsList = new ArrayList<>();
        
        // Add origins from environment variable
        for (String origin : origins) {
            String trimmed = origin.trim();
            if (!trimmed.isEmpty()) {
                allowedOriginsList.add(trimmed);
            }
        }
        
        // Also add the configured frontend URL if not already present
        if (frontendUrl != null && !frontendUrl.isEmpty()) {
            String trimmedFrontendUrl = frontendUrl.trim();
            if (!allowedOriginsList.contains(trimmedFrontendUrl)) {
                allowedOriginsList.add(trimmedFrontendUrl);
            }
        }
        
        // IMPORTANT: When allowCredentials is true, you CANNOT use wildcard "*" 
        // You must specify exact origins
        config.setAllowedOrigins(allowedOriginsList);
        
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // Required for cookies and auth headers
        config.setExposedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "accept", "Origin", 
                                         "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        config.setMaxAge(3600L); // Cache preflight response for 1 hour

        // Log CORS configuration for debugging
        System.out.println("=== CORS Configuration ===");
        System.out.println("Frontend URL: " + frontendUrl);
        System.out.println("Allowed Origins: " + allowedOriginsList);
        System.out.println("Allow Credentials: " + config.getAllowCredentials());
        System.out.println("==========================");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(new BCryptPasswordEncoder(12));
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)throws Exception{
        return
                config.getAuthenticationManager();
    }
}
