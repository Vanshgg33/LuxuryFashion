package com.spring.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@Entity
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long  prod_id;
    private String prod_name;
    private String prod_description;
    private int prod_price;
    private int prod_quantity;
    private String prod_image;
    private String prod_category;
    private String prod_tag;
    private String prod_gender;
    private String prod_status;
    private String prod_pic;



}