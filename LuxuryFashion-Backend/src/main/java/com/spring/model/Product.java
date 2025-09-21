package com.spring.model;

import jakarta.persistence.*;
import lombok.Data;



import java.util.List;

@Entity
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private int prod_id;

    private String prod_name;
    private String prod_description;
    private int prod_price;
    private int prod_quantity;
    private int selling_price;
    private String prod_category;
    private String prod_tag;
    private String prod_gender;
    private String prod_status;
    @ElementCollection
    private List<String> prod_images;
    private Double rating;
    private String createdAt;
    private String updatedAt;
    private String Badge;


    public void setBrand(String brand) {
    }
}