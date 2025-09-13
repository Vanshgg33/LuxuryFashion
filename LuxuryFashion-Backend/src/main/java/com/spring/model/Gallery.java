package com.spring.model;


import jakarta.persistence.*;
import lombok.Data;


@Entity
@Data
public class Gallery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gallery_id;
    private String title;
    @Column(length=5000)
    private String imageUrl;
    private boolean active;
}
