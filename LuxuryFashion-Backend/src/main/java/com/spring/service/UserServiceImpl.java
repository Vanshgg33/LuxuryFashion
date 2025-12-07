package com.spring.service;

import com.spring.dto.UserRegistrationDto;
import com.spring.model.Role;
import com.spring.model.User;
import com.spring.notification.EmailNotificationService;
import com.spring.notification.EmailTemplate;
import com.spring.repo.UserRepository;
import com.spring.util.ValidationUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailNotificationService emailService;
    private final GoogleCloudStorageService gcsService;

    @Value("${profile.picture.path}")
    private String profilePicturePath;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailNotificationService emailService, GoogleCloudStorageService gcsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.gcsService = gcsService;
    }

    @Override
    public User registerUser(UserRegistrationDto registrationDto) {
        if (!ValidationUtil.isValidEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Invalid email format");
        }
        
        if (!ValidationUtil.isValidPassword(registrationDto.getPassword())) {
            throw new RuntimeException("Password must be at least 6 characters long");
        }
        
        if (userRepository.findByEmail(registrationDto.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .name(registrationDto.getFirstName() + " " + registrationDto.getLastName())
                .email(registrationDto.getEmail())
                .password(passwordEncoder.encode(registrationDto.getPassword()))
                .phoneNumber(registrationDto.getPhone())
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        
        // Send welcome email
        sendWelcomeEmail(savedUser);
        
        return savedUser;
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User updateProfilePicture(Long userId, MultipartFile profilePicture) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        if (profilePicture != null && !profilePicture.isEmpty()) {
            try {
                // Delete old profile picture from GCS if it exists
                if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
                    try {
                        gcsService.deleteFile(user.getProfilePicture());
                    } catch (Exception e) {
                        System.err.println("Failed to delete old profile picture: " + e.getMessage());
                    }
                }

                // Upload to Google Cloud Storage
                String imageUrl = gcsService.uploadFile(profilePicture, "profiles");

                // Update user with GCS URL
                user.setProfilePicture(imageUrl);
                return userRepository.save(user);

            } catch (IOException e) {
                throw new RuntimeException("Failed to upload profile picture to GCS", e);
            }
        }

        return user;
    }

    @Override
    public User getUserWithProfilePictureUrl(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        
        // Profile picture is already stored as GCS URL, so return as is
        // If it's an old filename format, convert to URL
        if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
            // If it's already a URL, use it directly
            if (!user.getProfilePicture().startsWith("http://") && !user.getProfilePicture().startsWith("https://")) {
                // Legacy: If it's a filename, convert to GCS URL
                String url = gcsService.getPublicUrl("profiles/" + user.getProfilePicture());
                if (url != null) {
                    user.setProfilePicture(url);
                }
            }
        }

        return user;
    }

    private void sendWelcomeEmail(User user) {
        try {
            String subject = "Welcome to Food Ordering! 🎉";
            String content = EmailTemplate.getWelcomeTemplate(user.getName(), user.getEmail());
            emailService.sendNotification(user.getEmail(), null, subject, content);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }
}