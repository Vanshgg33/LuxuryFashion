package com.spring.dto;

import com.spring.model.Address;
import lombok.Data;

@Data
public class OrderRequest {
    private Address address;
    private String phoneNumber;
    private String couponCode; // Optional coupon code
}