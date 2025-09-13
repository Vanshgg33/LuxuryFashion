package com.spring.controller;

import com.spring.jwt.JwtUtil;
import com.spring.model.User;
import com.spring.dto.UserRegistrationDto;
import com.spring.notification.EmailTemplate;
import com.spring.notification.NotificationManager;
import com.spring.repo.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/users")
public class Controller1 {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private NotificationManager notificationManager;


    @PostMapping("/register")
    public ResponseEntity<?> saveUser(@RequestBody UserRegistrationDto dto) throws Exception {
        User user = new User();
        user.setName(dto.getFirstName() + " " + dto.getLastName()); // combine names
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhone());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        // set default values for required fields
        user.setGender("Not Specified");
        user.setDob(new Date()); // or null if not mandatory
        user.setActive(true);
        user.setRole("ROLE_USER");
        if(userRepository.existsByEmail(user.getEmail()) != null) {
        throw new Exception("User already Exsist");
        }
        userRepository.save(user);
        notificationManager.sendNotification("email",user.getEmail(),null,"Account Created ", EmailTemplate.getWelcomeTemplate(user.getName(),user.getEmail(),null));
        return ResponseEntity.ok("User registered successfully");
    }





}
