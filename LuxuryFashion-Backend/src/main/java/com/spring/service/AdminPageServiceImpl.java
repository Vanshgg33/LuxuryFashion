package com.spring.service;

import com.spring.dto.ProductDto;
import com.spring.model.Gallery;
import com.spring.model.Product;
import com.spring.repo.GalleryRepository;
import com.spring.repo.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
public class AdminPageServiceImpl implements AdminService {

    private final ProductRepository productRepository;
    private final GalleryRepository galleryRepository;
    public AdminPageServiceImpl(ProductRepository productRepository, GalleryRepository galleryRepository) {
        this.productRepository = productRepository;
        this.galleryRepository = galleryRepository;
    }
    @Value("${product.picture.path}")
    private String profilePicturePath;

    
    public List<Product> fetchProducts() {
        List<Product> products = productRepository.findAll();

        for (Product product : products) {
            if (product.getImagenames() != null && !product.getImagenames().isEmpty()) {
                List<String> base64Images = new ArrayList<>();

                for (String imageName : product.getImagenames()) {
                    try {
                        Path imagePath = Paths.get(profilePicturePath, imageName);
                        if (Files.exists(imagePath)) {
                            byte[] imageBytes = Files.readAllBytes(imagePath);
                            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

                            String contentType = Files.probeContentType(imagePath);
                            if (contentType == null) contentType = "image/jpeg";

                            base64Images.add("data:" + contentType + ";base64," + base64Image);
                        }
                    } catch (Exception ignored) {}
                }

                product.setProd_images(base64Images);
            }
        }

        return products;
    }


    public Product addProduct(ProductDto dto) {
        Product savedProduct = new Product();
        List<String> imageFileNames = new ArrayList<>();

        if (dto.getProd_photo() != null && !dto.getProd_photo().isEmpty()) {
            int index = 0;
            for (MultipartFile photo : dto.getProd_photo()) {
                if (!photo.isEmpty()) {
                    try {
                        File dir = new File(profilePicturePath);
                        if (!dir.exists() && !dir.mkdirs()) {
                            throw new RuntimeException("Failed to create directory: " + profilePicturePath);
                        }

                        String extension = ".jpg";
                        String originalFilename = photo.getOriginalFilename();
                        if (originalFilename != null && originalFilename.contains(".")) {
                            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                        }

                        String fileName = dto.getProd_name().replaceAll("\\s+", "_")
                                + "_" + index + "_" + System.currentTimeMillis() + extension;

                        Path filePath = Paths.get(profilePicturePath, fileName);
                        Files.copy(photo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                        imageFileNames.add(fileName);
                        index++;
                    } catch (IOException e) {
                        throw new RuntimeException("Error saving product image", e);
                    }
                }
            }
        }

        // Map DTO to Entity with all fields
        savedProduct.setProd_name(dto.getProd_name());
        savedProduct.setProd_description(dto.getProd_description());
        savedProduct.setProd_price((int) dto.getProd_price());
        savedProduct.setSelling_price((int) dto.getSelling_price()); // This maps to originalPrice from frontend
        savedProduct.setProd_quantity(dto.getProd_quantity());
        savedProduct.setProd_category(dto.getProd_category());
        savedProduct.setProd_tag(dto.getProd_tag());
        savedProduct.setProd_gender(dto.getProd_gender());
        savedProduct.setProdStatus(dto.getProdStatus());
        savedProduct.setProd_brand(dto.getProd_brand()); // Add brand field mapping
        savedProduct.setBadge(dto.getBadge());
        savedProduct.setRating(dto.getRating());

        // Handle new fields if your Product entity supports them
        // savedProduct.setReviewCount(dto.getReviewCount());
        // savedProduct.setFeatured(dto.getFeatured());
        savedProduct.setImagenames(imageFileNames);
        savedProduct.setProd_images(imageFileNames);

        String currentTime = String.valueOf(System.currentTimeMillis());
        savedProduct.setCreatedAt(currentTime);
        savedProduct.setUpdatedAt(currentTime);

        return productRepository.save(savedProduct);
    }
    @Override
    public Product updateProduct(Long productId, ProductDto dto) {
        Optional<Product> product = productRepository.findById(productId);
        if(product.isPresent()) {
            Product toupdate = product.get();
            toupdate.setProd_name(dto.getProd_name());
            toupdate.setProd_description(dto.getProd_description());
            toupdate.setProd_price((int) dto.getProd_price());
            toupdate.setSelling_price((int) dto.getSelling_price());
            toupdate.setProd_quantity(dto.getProd_quantity());
            toupdate.setProd_category(dto.getProd_category());
            toupdate.setProd_tag(dto.getProd_tag());
            toupdate.setProd_gender(dto.getProd_gender());
            toupdate.setProdStatus(dto.getProdStatus());
            toupdate.setProd_brand(dto.getProd_brand());
            toupdate.setBadge(dto.getBadge());
            toupdate.setRating(dto.getRating());
            String currentTime = String.valueOf(System.currentTimeMillis());
            toupdate.setCreatedAt(currentTime);
            toupdate.setUpdatedAt(currentTime);
            return productRepository.save(toupdate);
        }
        else {
            throw new RuntimeException("Product not found, not able to update it ");
        }
    }
    public void deleteProduct(Long productId) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (!productOpt.isPresent()) {
            throw new RuntimeException("Product with ID " + productId + " not found");
        }

        Product product = productOpt.get();


        if (product.getProd_images() != null) {
            for (String fileName : product.getProd_images()) {
                try {
                    Path filePath = Paths.get(profilePicturePath, fileName);
                    Files.deleteIfExists(filePath);
                } catch (Exception e) {
                    System.err.println("Failed to delete image: " + fileName + " - " + e.getMessage());
                }
            }
        }

        // Delete product from database
        productRepository.deleteById(productId);
    }

    @Override
    public Product getProductById(Long productId) {
        return null;
    }

    @Override
    public ResponseEntity<?> addGalleryImages(Gallery gallery) {
      galleryRepository.save(gallery);
        return ResponseEntity.ok(gallery);
    }


    @Override
    public ResponseEntity<?> fetchGalleryImages() {
        try {
            List<Gallery> galleries = galleryRepository.findAll();
            if (galleries.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No gallery images found"));
            }
            return ResponseEntity.ok(galleries);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch gallery images", "message", e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<?> updateGalleryStatus(List<Gallery> galleries) {
        try {
            List<Gallery> updated = galleryRepository.saveAll(galleries);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update gallery status", "message", e.getMessage()));
        }
    }
@Override
public void deleteGalleryImage(Long id) {
        if (!galleryRepository.existsById(id)) {
            throw new IllegalArgumentException("Gallery image with ID " + id + " not found");
        }

        galleryRepository.deleteById(id);
    }
}
