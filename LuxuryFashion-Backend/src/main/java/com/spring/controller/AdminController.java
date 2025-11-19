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
import com.spring.repo.ProductRepository;
import com.spring.repo.OrderItemRepository;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;



import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("admin-api")
public class AdminController {
    private final AdminService adminService;
    private final ProductService productService;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminController(AdminService adminService, ProductService productService, 
                          ProductRepository productRepository, OrderItemRepository orderItemRepository) {
        this.adminService = adminService;
        this.productService = productService;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }


    @GetMapping("/fetch-products")
    @Transactional(readOnly = true)
    public ResponseEntity<?> fetchProducts() {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        List<Product> products = adminService.fetchProducts();
        return ResponseEntity.ok(products);
    }


    @PostMapping(path = "/add-product", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> addProduct(@ModelAttribute ProductDto productDto, HttpServletRequest request) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        
        // Check content type and provide helpful error for JSON
        String contentType = request != null ? request.getContentType() : null;
        if (contentType != null && contentType.contains("application/json")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "JSON format not supported for adding products. Please use multipart/form-data to upload product images.",
                            "hint", "Use FormData in your request with Content-Type: multipart/form-data"));
        }
        
        // Validate that we have product data
        if (productDto == null || productDto.getProd_name() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid request. Product data is required.",
                            "hint", "Ensure you're sending multipart/form-data with product fields and images"));
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
            System.err.println("========================================");
            System.err.println("ERROR in AdminController.addProduct");
            System.err.println("Error Message: " + errorMessage);
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("========================================");
            e.printStackTrace();
            System.err.println("========================================");
            
            if (errorMessage != null && errorMessage.contains("Data too long")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Data too long for database field. Please reduce text length."));
            }
            
            if (errorMessage != null && (errorMessage.contains("GCS") || errorMessage.contains("Google Cloud") || errorMessage.contains("403 Forbidden") || errorMessage.contains("Permission denied"))) {
                String hint = "Please check your Google Cloud Storage configuration.";
                if (errorMessage.contains("403") || errorMessage.contains("Permission denied")) {
                    hint = "Permission denied: Your service account needs 'Storage Object Creator' or 'Storage Admin' role. " +
                           "Go to IAM & Admin in Google Cloud Console and grant the role to your service account.";
                } else if (errorMessage.contains("404") || errorMessage.contains("not found")) {
                    hint = "Bucket not found: Check the bucket name in application.properties (gcs.bucket.name)";
                } else if (errorMessage.contains("GOOGLE_APPLICATION_CREDENTIALS")) {
                    hint = "Please set GOOGLE_APPLICATION_CREDENTIALS environment variable to your service account JSON file path";
                }
                
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "error", "Failed to upload images to Google Cloud Storage",
                                "message", errorMessage,
                                "hint", hint
                        ));
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add product", "message", errorMessage != null ? errorMessage : "Unknown error"));
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
            // Check if product exists before deletion
            Optional<Product> productOpt = productRepository.findById(productId.intValue());
            if (productOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Product not found"));
            }
            
            Product product = productOpt.get();
            long orderItemCount = orderItemRepository.countByProductId(productId.intValue());
            
            // Hard delete: Delete product and all related cart items and order items
            adminService.deleteProduct(productId);
            
            // Return success message
            if (orderItemCount > 0) {
                return ResponseEntity.ok(Map.of(
                    "message", "Product permanently deleted successfully",
                    "status", "deleted",
                    "warning", "Deleted " + orderItemCount + " order item(s) associated with this product. Order history may be affected."
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "message", "Product permanently deleted successfully",
                    "status", "deleted"
                ));
            }
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

    // Product Size Management APIs
    @PutMapping("/products/{productId}/sizes")
    public ResponseEntity<?> updateProductSizes(@PathVariable Long productId, @RequestBody Map<String, Integer> sizes) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        try {
            Product product = adminService.getProductById(productId);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Product not found"));
            }
            
            // Update size quantities - track sizes with their quantities
            product.setSizes(sizes);
            String currentTime = String.valueOf(System.currentTimeMillis());
            product.setUpdatedAt(currentTime);
            
            // Save through updateProduct to ensure consistency
            ProductDto dto = new ProductDto();
            dto.setSizes(sizes);
            Product updatedProduct = adminService.updateProduct(productId, dto);
            
            return ResponseEntity.ok(Map.of(
                "message", "Product sizes updated successfully",
                "product", updatedProduct,
                "sizes", updatedProduct.getSizes()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update product sizes", "message", e.getMessage()));
        }
    }

    @GetMapping("/products/{productId}/sizes")
    public ResponseEntity<?> getProductSizes(@PathVariable Long productId) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        try {
            Product product = adminService.getProductById(productId);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Product not found"));
            }
            
            return ResponseEntity.ok(Map.of(
                "productId", product.getProd_id(),
                "productName", product.getProd_name(),
                "sizes", product.getSizes() != null ? product.getSizes() : Map.of(),
                "reservedSizes", product.getReservedSizes() != null ? product.getReservedSizes() : Map.of(),
                "availableSizes", product.getSizes() != null ? 
                    product.getSizes().entrySet().stream()
                        .collect(java.util.stream.Collectors.toMap(
                            Map.Entry::getKey,
                            entry -> product.getAvailableQuantityForSize(entry.getKey())
                        )) : Map.of()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get product sizes", "message", e.getMessage()));
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

    @PutMapping("/orders/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        try {
            Order.PaymentStatus paymentStatus = Order.PaymentStatus.valueOf(request.get("payment_status").toUpperCase());
            Order order = adminService.getOrderById(id);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Order not found"));
            }
            order.setPaymentStatus(paymentStatus);
            Order updatedOrder = adminService.saveOrder(order);
            return ResponseEntity.ok(Map.of("message", "Payment status updated successfully", "order", updatedOrder));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid payment status", "valid_statuses", 
                            "PENDING, CAPTURED, FAILED, REFUNDED, PARTIALLY_REFUNDED"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update payment status", "message", e.getMessage()));
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }
        try {
            Order order = adminService.getOrderById(id);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Order not found"));
            }
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch order", "message", e.getMessage()));
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
