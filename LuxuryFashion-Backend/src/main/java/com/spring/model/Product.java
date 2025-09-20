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

    private String prod_name;
    private String prod_description;
    private int prod_price;
    private int prod_quantity;
    private int selling_price;
    private String prod_category;
    private String prod_tag;
    private String prod_gender;
    private String prodStatus;
    private String prod_brand;

    @ElementCollection
    private List<String> imagenames;
    @ElementCollection
    private List<String> prod_images;
    private Double rating;
    private String createdAt;
    private String updatedAt;
    private String Badge;



}