package com.spring.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    // Store sizes with their available quantities
    // Key: size (e.g., "S", "M", "L", "36", "38"), Value: available quantity
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_sizes", joinColumns = @JoinColumn(name = "prod_id", nullable = false))
    @MapKeyColumn(name = "size", length = 20)
    @Column(name = "quantity")
    private Map<String, Integer> sizes = new HashMap<>();

    // Reserved quantities by size (items in carts)
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_reserved_sizes", joinColumns = @JoinColumn(name = "prod_id", nullable = false))
    @MapKeyColumn(name = "size", length = 20)
    @Column(name = "reserved_quantity")
    private Map<String, Integer> reservedSizes = new HashMap<>();

    // Helper method to get available quantity for a size
    public Integer getAvailableQuantityForSize(String size) {
        Integer totalQuantity = sizes.getOrDefault(size, 0);
        Integer reservedQuantity = reservedSizes.getOrDefault(size, 0);
        return Math.max(0, totalQuantity - reservedQuantity);
    }

    // Helper method to check if size is available
    public boolean isSizeAvailable(String size, Integer requestedQuantity) {
        return getAvailableQuantityForSize(size) >= requestedQuantity;
    }

}