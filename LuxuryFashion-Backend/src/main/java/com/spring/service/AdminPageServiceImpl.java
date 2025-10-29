package com.spring.service;


import com.spring.dto.ProductDto;
import com.spring.model.Gallery;
import com.spring.model.Order;
import com.spring.model.Product;
import com.spring.model.User;
import com.spring.repo.GalleryRepository;
import com.spring.repo.OrderRepository;
import com.spring.repo.ProductRepository;
import com.spring.repo.UserRepository;
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
import java.util.Base64;
import java.util.Optional;

@Service
public class AdminPageServiceImpl implements AdminService {

    private final ProductRepository productRepository;
    private final GalleryRepository galleryRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    
    public AdminPageServiceImpl(ProductRepository productRepository, GalleryRepository galleryRepository, UserRepository userRepository, OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.galleryRepository = galleryRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }
    @Value("${product.picture.path}")
    private String productPicturePath;

    @Value("${profile.picture.path}")
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
                System.out.println(base64Images);
                product.setImagenames(base64Images);
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


        String currentTime = String.valueOf(System.currentTimeMillis());
        savedProduct.setCreatedAt(currentTime);
        savedProduct.setUpdatedAt(currentTime);

        return productRepository.save(savedProduct);
    }
    @Override
    public Product updateProduct(Long productId, ProductDto dto) {
        Optional<Product> product = productRepository.findById(productId.intValue());
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
        Optional<Product> productOpt = productRepository.findById(productId.intValue());
        if (!productOpt.isPresent()) {
            throw new RuntimeException("Product with ID " + productId + " not found");
        }

        Product product = productOpt.get();

        if (product.getImagenames() != null) {
            for (String imageName : product.getImagenames()) {
                try {
                    Path filePath = Paths.get(productPicturePath).resolve(imageName);
                    Files.deleteIfExists(filePath);
                } catch (Exception e) {
                    System.err.println("Failed to delete image file: " + imageName + " - " + e.getMessage());
                }
            }
        }

        productRepository.deleteById(productId.intValue());
    }


    @Override
    public Product getProductById(Long productId) {
        return null;
    }

    @Override
    public ResponseEntity<?> addGalleryImages(Gallery gallery) {   if (gallery.getGallery_id() != null && gallery.getGallery_id() == 0) {
        gallery.setGallery_id(null); 
    }

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

    // User Management Methods
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(Long userId, User userDetails) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User with ID " + userId + " not found");
        }
        
        User user = userOpt.get();
        if (userDetails.getName() != null) user.setName(userDetails.getName());
        if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
        if (userDetails.getPhoneNumber() != null) user.setPhoneNumber(userDetails.getPhoneNumber());
        if (userDetails.getGender() != null) user.setGender(userDetails.getGender());
        if (userDetails.getDob() != null) user.setDob(userDetails.getDob());
        if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
        if (userDetails.getActive() != null) user.setActive(userDetails.getActive());
        
        return userRepository.save(user);
    }

    @Override
    public User deactivateUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User with ID " + userId + " not found");
        }
        
        User user = userOpt.get();
        user.setActive(false);
        return userRepository.save(user);
    }

    // Order Management Methods
    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    @Override
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (!orderOpt.isPresent()) {
            throw new RuntimeException("Order with ID " + orderId + " not found");
        }
        
        Order order = orderOpt.get();
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
