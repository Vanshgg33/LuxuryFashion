package com.spring.service;

import com.spring.model.Gallery;
import com.spring.model.Product;
import com.spring.repo.GalleryRepository;
import com.spring.repo.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service

public class ProductService {
    @Value("${product.picture.path}")
    private String productPicturePath;



    private final  ProductRepository productRepository;
    private final GalleryRepository galleryRepository;
    public ProductService(ProductRepository productRepository, GalleryRepository galleryRepository) {
        this.productRepository = productRepository;
        this.galleryRepository = galleryRepository;
    }

    public List<Product> fetchAllProducts() {
        List<Product> products = productRepository.findByProdStatus("active");

        for (Product product : products) {
            if (product.getProd_images() != null && !product.getProd_images().isEmpty()) {
                // Use the public URLs directly for frontend
                List<String> imageUrls = new ArrayList<>(product.getProd_images());
                product.setProd_images(imageUrls);
            }
        }

        return products;
    }



    public ResponseEntity<?> getGallery(){
        try {
            List<Gallery> gallery = galleryRepository.findByActiveTrue();
            return ResponseEntity.ok(gallery);
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch gallery ", "message", e.getMessage()));
        }
    }
}