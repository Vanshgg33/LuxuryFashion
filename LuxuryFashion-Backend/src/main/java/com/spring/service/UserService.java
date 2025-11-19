package com.spring.service;

import com.spring.dto.UserRegistrationDto;
import com.spring.model.User;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    User registerUser(UserRegistrationDto registrationDto);
    User updateProfilePicture(Long userId, MultipartFile profilePicture);
    User getUserWithProfilePictureUrl(Long userId);
    User findByEmail(String email);
}