package com.spring.controller;


import com.spring.dto.ProductDto;
import com.spring.model.Gallery;
import com.spring.model.Order;
import com.spring.model.Product;
import com.spring.model.Role;
import com.spring.model.User;
import com.spring.model.UserShow;

import com.spring.service.AdminService;

import com.spring.service.ProductService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;



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
    public ResponseEntity<?> fetchProducts() {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        List<Product> products = adminService.fetchProducts();
        return ResponseEntity.ok(products);
    }


    @PostMapping(path = "/add-product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProduct(@ModelAttribute ProductDto productDto) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        
        // Validate input
        if (productDto.getProd_name() != null && productDto.getProd_name().length() > 255) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Product name too long (max 255 characters)"));
        }
        if (productDto.getProd_description() != null && productDto.getProd_description().length() > 2000) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Product description too long (max 2000 characters)"));
        }
        
        try {
            Product savedProduct = adminService.addProduct(productDto);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            String errorMessage = e.getMessage();
            if (errorMessage.contains("Data too long")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Data too long for database field. Please reduce text length."));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add product", "message", errorMessage));
        }
    }

    @PostMapping("add-gallery-images")
    public ResponseEntity<?> addGalleryImages(@RequestBody Gallery gallery ) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        adminService.addGalleryImages(gallery);
        return ResponseEntity.ok(gallery);
    }

    @GetMapping("/fetch-gallery-images")
    public ResponseEntity<?> fetchGalleryImages() {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
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
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        return adminService.updateGalleryStatus(galleries);
    }

    @PutMapping("/update-product/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable("id") Long id,
            @RequestBody ProductDto dto) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        Product updated = adminService.updateProduct(id, dto);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/delete-product/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable("id") Long productId) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        try {
            adminService.deleteProduct(productId);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete product", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/delete-gallery-image/{id}")
    public ResponseEntity<?> deleteGalleryImage(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        try {
            adminService.deleteGalleryImage(id);
            return ResponseEntity.ok(Map.of("message", "Gallery image deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete gallery image", "message", e.getMessage()));
        }
    }

    // User Management APIs
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        try {
            User updatedUser = adminService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update user", "message", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        try {
            User deactivatedUser = adminService.deactivateUser(id);
            return ResponseEntity.ok(Map.of("message", "User deactivated successfully", "user", deactivatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to deactivate user", "message", e.getMessage()));
        }
    }

    // Order Management APIs
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        List<Order> orders = adminService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        try {
            Order.OrderStatus status = Order.OrderStatus.valueOf(request.get("status"));
            Order updatedOrder = adminService.updateOrderStatus(id, status);
            return ResponseEntity.ok(Map.of("message", "Order status updated successfully", "order", updatedOrder));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update order status", "message", e.getMessage()));
        }
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserShow) {
            UserShow userShow = (UserShow) auth.getPrincipal();
            return userShow.getUser().getRole() == Role.ADMIN;
        }
        return false;
    }

}
