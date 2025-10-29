package com.spring.model;

import jakarta.persistence.*;
import lombok.Data;



import java.util.List;

@Entity
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int prod_id;

    @Column(length = 255)
    private String prod_name;
    
    @Column(length = 2000)
    private String prod_description;
    
    private int prod_price;
    private int prod_quantity;
    private int selling_price;
    
    @Column(length = 100)
    private String prod_category;
    
    @Column(length = 100)
    private String prod_tag;
    
    @Column(length = 50)
    private String prod_gender;
    
    @Column(length = 50)
    private String prodStatus;
    
    @Column(length = 100)
    private String prod_brand;

    @ElementCollection
    @Column(length = 255)
    private List<String> imagenames;
    private Double rating;
    
    @Column(length = 50)
    private String createdAt;
    
    @Column(length = 50)
    private String updatedAt;
    
    @Column(length = 100)
    private String Badge;



}