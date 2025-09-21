package com.spring.service;

import com.spring.controller.AdminController;
import com.spring.dto.ProductDto;
import com.spring.model.Product;
import com.spring.repo.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class AdminPageServiceImpl implements AdminService {

    private final ProductRepository productRepository;

    public AdminPageServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
    @Value("${product.picture.path}")
    private String profilePicturePath;

    
    public List<Product> fetchProducts() {
        List<Product> products = productRepository.findAll();

        for (Product product : products) {
            System.out.println(product);
            if (product.getProd_images() != null && !product.getProd_images().isEmpty()) {
                System.out.println(product.getProd_images());
                List<String> base64Images = new ArrayList<>();
                for (String imageName : product.getProd_images()) {
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
        savedProduct.setProd_status(dto.getProd_status());
        savedProduct.setBrand(dto.getBrand()); // Add brand field mapping
        savedProduct.setBadge(dto.getBadge());
        savedProduct.setRating(dto.getRating());

        // Handle new fields if your Product entity supports them
        // savedProduct.setReviewCount(dto.getReviewCount());
        // savedProduct.setFeatured(dto.getFeatured());

        savedProduct.setProd_images(imageFileNames);

        String currentTime = String.valueOf(System.currentTimeMillis());
        savedProduct.setCreatedAt(currentTime);
        savedProduct.setUpdatedAt(currentTime);

        return productRepository.save(savedProduct);
    }
    @Override
    public Product updateProduct(Long productId, ProductDto dto) {
        return null;
    }

    @Override
    public void deleteProduct(Long productId) {

    }

    @Override
    public Product getProductById(Long productId) {
        return null;
    }

}
