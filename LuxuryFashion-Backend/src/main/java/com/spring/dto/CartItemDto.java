package com.spring.dto;

import lombok.Data;

@Data
public class CartItemDto {
    private Integer productId;
    private Integer quantity;
    private String size; // Product size (e.g., "S", "M", "L", "36", "38")
}