package com.spring.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class ProductDto {
    private String prod_name;
    private String prod_description;

    // Change to double to handle decimal prices
    private double prod_price;
    private int prod_quantity;

    // Keep selling_price for original price mapping
    private double selling_price;
    private List<String> imagenames;
    private String prod_category;
    private String prod_tag;
    private String prod_gender;
    private String prodStatus;
    private String prod_brand;
    private List<MultipartFile> prod_photo;

    private String badge;
    private Double rating;

    // Add missing fields that frontend sends
    private Integer reviewCount;
    private Boolean featured;

    // For response (base64 images)
    private List<String> prod_images;
}