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
                List<String> base64Images = new ArrayList<>();

                for (String imageName : product.getProd_images()) {
                    try {
                        Path imagePath = Paths.get(productPicturePath, imageName);

                        if (Files.exists(imagePath)) {
                            byte[] imageBytes = Files.readAllBytes(imagePath);
                            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

                            // detect content type (default fallback to jpeg)
                            String contentType = Files.probeContentType(imagePath);
                            if (contentType == null) contentType = "image/jpeg";

                            base64Images.add("data:" + contentType + ";base64," + base64Image);
                        }
                    } catch (Exception e) {
                        // optional: log the error instead of ignoring
                        System.err.println("Error encoding image " + imageName + ": " + e.getMessage());
                    }
                }

                // replace product images with base64 strings
                product.setProd_images(base64Images);
            }
        }

        return products;
    }

    public List<Product> fetchProductsBySelection(String keyword, String status) {

        List<Product> products = new ArrayList<>();
        if(Objects.equals(keyword, "men") || Objects.equals(keyword, "women")) {
     products = productRepository.findByGenderAndStatus(keyword, status);
        }
        else if (keyword.equals("accessories")) {
            products = productRepository.findByCategoryAndStatus("accessories", status);
        }
        else if (keyword.equals("sale") || keyword.equals("new-arrivals") || keyword.equals("new arrivals")) {

            String tag = keyword.replace("-", " ");
            products = productRepository.findByTagAndStatus(tag, status);
        }

        for (Product product : products) {
            if (product.getProd_images() != null && !product.getProd_images().isEmpty()) {
                List<String> base64Images = new ArrayList<>();

                for (String imageName : product.getImagenames()) {
                    try {
                        Path imagePath = Paths.get(productPicturePath, imageName);

                        if (Files.exists(imagePath)) {
                            byte[] imageBytes = Files.readAllBytes(imagePath);
                            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

                            // Detect content type (default fallback to jpeg)
                            String contentType = Files.probeContentType(imagePath);
                            if (contentType == null) contentType = "image/jpeg";

                            base64Images.add("data:" + contentType + ";base64," + base64Image);
                        }
                    } catch (Exception e) {
                        System.err.println("Error encoding image " + imageName + ": " + e.getMessage());
                    }
                }

                product.setProd_images(base64Images);
            }
        }

        return products;
    }

//    public List<Product> fetchFeaturedProducts(int limit) {
//        try {
//            Pageable pageable = PageRequest.of(0, limit);
//            return productRepository.findByProd_statusOrderByRatingDesc("active", pageable);
//        } catch (Exception e) {
//            throw new RuntimeException("Error fetching featured products: " + e.getMessage(), e);
//        }
//    }

//    public Optional<Product> fetchProductById(int productId) {
//        try {
//            return productRepository.findByProd_idAndProd_status(productId, "active");
//        } catch (Exception e) {
//            throw new RuntimeException("Error fetching product by ID: " + e.getMessage(), e);
//        }
//    }


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