package com.spring.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long Id;

    @Column(name = "username")
    private String name;

    @Column(nullable = false)
    private String password;

    @Column
    private Boolean active = true;

    @Column(name = "email_id", nullable = false)
    private String email;

    @Column(name = "DOB")
    private Date dob;

    @Column(name = "phone_number")
    private String phoneNumber;


    @Column(name = "gender")
    private String gender;

    @Column(name="role")
    private String role;



    @OneToOne(cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", referencedColumnName = "cartid")
    private Cart cart;
}

