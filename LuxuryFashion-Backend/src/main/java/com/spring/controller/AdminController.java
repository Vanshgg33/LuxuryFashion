package com.spring.controller;


import com.spring.dto.ProductDto;
import com.spring.model.Gallery;
import com.spring.model.Product;
import com.spring.repo.ProductRepository;
import com.spring.service.AdminService;
import com.spring.service.ProductService;
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
    private final ProductService productService;


    public AdminController(AdminService adminService, ProductService productService) {
        this.adminService = adminService;
        this.productService = productService;
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

    @PostMapping("add-gallery-images")
    public ResponseEntity<?> addGalleryImages(@RequestBody Gallery gallery ) {
     adminService.addGalleryImages(gallery);
        return ResponseEntity.ok(gallery);
    }

    @GetMapping("/fetch-gallery-images")
    public ResponseEntity<?> fetchGalleryImages() {
        try {
            return adminService.fetchGalleryImages();
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching gallery images: " + e.getMessage());
        }
    }

    @PutMapping("/update-gallery-status")
    public ResponseEntity<?> updateGalleryStatus(@RequestBody List<Gallery> galleries) {
        return adminService.updateGalleryStatus(galleries);
    }

    @PutMapping("/update-product/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable("id") Long id,
            @RequestBody ProductDto dto) {

        Product updated = adminService.updateProduct(id, dto);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/delete-product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable("id") Long productId) {
        try {
            adminService.deleteProduct(productId);
            return ResponseEntity.ok("Product deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete product: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-gallery-image/{id}")
    public ResponseEntity<String> deleteGalleryImage(@PathVariable Long id) {
        try {
            adminService.deleteGalleryImage(id);
            return ResponseEntity.ok("Gallery image deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete gallery image: " + e.getMessage());
        }
    }



}
