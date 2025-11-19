package com.spring.controller;

import com.spring.dto.ProductDto;
import com.spring.model.Gallery;
import com.spring.model.Product;
import com.spring.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/luxuryfashion")
public class ProductController {


    @Autowired
    private ProductService productService;
    


    @Value("${product.picture.path}")
    private String productPicturePath;

    @GetMapping("/fetch-products-shop")
    public ResponseEntity<List<Product>> fetchAllProducts() {
        try {
            List<Product> products = productService.fetchAllProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

    @GetMapping("/fetch-gallery")
    public ResponseEntity<?> fetchAllGallery() {
    try{
        return productService.getGallery();
    }
    catch (Exception e) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching gallery images: " + e.getMessage());
    }
    }

    @GetMapping("/products")
    public List<Product> getProductsByCategory(){
        return productService.fetchAllProducts();
    }







}
