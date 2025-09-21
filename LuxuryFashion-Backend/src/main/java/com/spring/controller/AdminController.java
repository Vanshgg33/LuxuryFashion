package com.spring.controller;


import com.spring.dto.ProductDto;
import com.spring.model.Product;
import com.spring.repo.ProductRepository;
import com.spring.service.AdminService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("admin-api")
public class AdminController {
    private final AdminService adminService;


    public AdminController(AdminService adminService) {
        this.adminService = adminService;

    }


    @GetMapping("/fetch-products")
    public ResponseEntity<List<Product>> fetchProducts() {
        List<Product> products = adminService.fetchProducts();
        return ResponseEntity.ok(products);
    }


    @PostMapping(path = "/add-product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProduct(@ModelAttribute ProductDto productDto) {
        try {
            Product savedProduct = adminService.addProduct(productDto);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add product", "message", e.getMessage()));
        }
    }




}
