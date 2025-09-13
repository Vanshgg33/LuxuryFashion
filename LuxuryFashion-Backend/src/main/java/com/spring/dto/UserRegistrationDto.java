package com.spring.dto;


import lombok.Data;

@Data
public class UserRegistrationDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String password;
}