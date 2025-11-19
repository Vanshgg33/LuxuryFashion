package com.spring.service;


import com.spring.dto.ProductDto;
import com.spring.model.Gallery;
import com.spring.model.Order;
import com.spring.model.Product;
import com.spring.model.User;
import com.spring.repo.CartItemRepository;
import com.spring.repo.GalleryRepository;
import com.spring.repo.OrderItemRepository;
import com.spring.repo.OrderRepository;
import com.spring.repo.ProductRepository;
import com.spring.repo.UserRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.Optional;

@Service
public class AdminPageServiceImpl implements AdminService {

    private final ProductRepository productRepository;
    private final GalleryRepository galleryRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final GoogleCloudStorageService gcsService;
    
    public AdminPageServiceImpl(ProductRepository productRepository, GalleryRepository galleryRepository, UserRepository userRepository, OrderRepository orderRepository, OrderItemRepository orderItemRepository, CartItemRepository cartItemRepository, GoogleCloudStorageService gcsService) {
        this.productRepository = productRepository;
        this.galleryRepository = galleryRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.gcsService = gcsService;
    }
    @Value("${product.picture.path}")
    private String productPicturePath;

    @Value("${profile.picture.path}")
    private String profilePicturePath;




    @Transactional(readOnly = true)
    public List<Product> fetchProducts() {
        List<Product> products = productRepository.findAll();

        // Images are now stored as GCS URLs, so we can return them directly
        // If any old local file paths exist, convert them to URLs
        for (Product product : products) {
            // Force initialize ALL lazy collections while session is still open
            // This must be done before any access to the collections
            try {
                // Initialize all lazy collections and force them to load by accessing them
                Hibernate.initialize(product.getImagenames());
                List<String> imagenames = product.getImagenames();
                if (imagenames != null) {
                    // Force load by iterating through the collection
                    for (String img : imagenames) {
                        // Just accessing to force load
                        if (img != null) break;
                    }
                }
                
                Hibernate.initialize(product.getSizes());
                Map<String, Integer> sizes = product.getSizes();
                if (sizes != null) {
                    // Force load by accessing the map
                    sizes.size();
                    // Iterate to force load all entries
                    for (Map.Entry<String, Integer> entry : sizes.entrySet()) {
                        // Just accessing to force load
                        if (entry != null) break;
                    }
                }
                
                Hibernate.initialize(product.getReservedSizes());
                Map<String, Integer> reservedSizes = product.getReservedSizes();
                if (reservedSizes != null) {
                    // Force load by accessing the map
                    reservedSizes.size();
                    // Iterate to force load all entries
                    for (Map.Entry<String, Integer> entry : reservedSizes.entrySet()) {
                        // Just accessing to force load
                        if (entry != null) break;
                    }
                }
                
                // Now safely access the imagenames collection (already loaded above)
                if (imagenames != null && !imagenames.isEmpty()) {
                    List<String> imageUrls = new ArrayList<>();

                    for (String imageNameOrUrl : imagenames) {
                        if (imageNameOrUrl == null || imageNameOrUrl.isEmpty()) {
                            continue;
                        }
                        
                        // If it's already a URL (starts with http), use it directly
                        if (imageNameOrUrl.startsWith("http://") || imageNameOrUrl.startsWith("https://")) {
                            imageUrls.add(imageNameOrUrl);
                        } else {
                            // Legacy: If it's a filename, try to get URL from GCS or return as is
                            // For backward compatibility, we'll try to construct URL
                            String url = gcsService.getPublicUrl("products/" + imageNameOrUrl);
                            if (url != null) {
                                imageUrls.add(url);
                            }
                        }
                    }
                    
                    product.setImagenames(imageUrls);
                }
            } catch (Exception e) {
                // If collection is null or can't be initialized, skip
                System.err.println("Failed to initialize collections for product " + product.getProd_id() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }

        return products;
    }


    @Transactional
    public Product addProduct(ProductDto dto) {
        try {
            Product savedProduct = new Product();
            List<String> imageUrls = new ArrayList<>();

            if (dto.getProd_photo() != null && !dto.getProd_photo().isEmpty()) {
                System.out.println("Processing " + dto.getProd_photo().size() + " image(s) for product upload...");
                for (MultipartFile photo : dto.getProd_photo()) {
                    if (!photo.isEmpty()) {
                        try {
                            System.out.println("Attempting to upload image to GCS: " + photo.getOriginalFilename());
                            // Upload to Google Cloud Storage
                            String imageUrl = gcsService.uploadFile(photo, "products");
                            imageUrls.add(imageUrl);
                            System.out.println("Successfully uploaded image to GCS: " + imageUrl);
                        } catch (Exception e) {
                            // If GCS fails, log error but don't fail the entire operation
                            System.err.println("========================================");
                            System.err.println("WARNING: Failed to upload image to GCS");
                            System.err.println("Image: " + photo.getOriginalFilename());
                            System.err.println("Error: " + e.getMessage());
                            System.err.println("Product will be saved WITHOUT this image URL.");
                            System.err.println("To fix: Configure GCS credentials or grant permissions.");
                            System.err.println("========================================");
                            e.printStackTrace();
                            // Continue without this image - product will be saved with other images that succeeded
                        }
                    }
                }
                System.out.println("Image processing complete. " + imageUrls.size() + " image(s) uploaded successfully.");
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
            savedProduct.setProdStatus(dto.getProdStatus() != null ? dto.getProdStatus() : "active");
            savedProduct.setProd_brand(dto.getProd_brand()); // Add brand field mapping
            savedProduct.setBadge(dto.getBadge());
            savedProduct.setRating(dto.getRating());

            // Handle new fields if your Product entity supports them
            // savedProduct.setReviewCount(dto.getReviewCount());
            // savedProduct.setFeatured(dto.getFeatured());
            savedProduct.setImagenames(imageUrls.isEmpty() ? null : imageUrls);

            String currentTime = String.valueOf(System.currentTimeMillis());
            savedProduct.setCreatedAt(currentTime);
            savedProduct.setUpdatedAt(currentTime);

            System.out.println("Saving product to database: " + savedProduct.getProd_name());
            Product saved = productRepository.save(savedProduct);
            System.out.println("========================================");
            System.out.println("Product saved successfully!");
            System.out.println("Product ID: " + saved.getProd_id());
            System.out.println("Product Name: " + saved.getProd_name());
            System.out.println("Images: " + (saved.getImagenames() != null ? saved.getImagenames().size() : 0));
            System.out.println("========================================");
            return saved;
        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("ERROR: Failed to add product");
            System.err.println("Error Message: " + e.getMessage());
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("========================================");
            e.printStackTrace();
            System.err.println("========================================");
            throw new RuntimeException("Failed to add product: " + e.getMessage(), e);
        }
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
            
            // Update sizes if provided in DTO
            if (dto.getSizes() != null && !dto.getSizes().isEmpty()) {
                // For ElementCollection (lazy-loaded), we need to ensure it's loaded first
                // Initialize if null, or force load by accessing it
                if (toupdate.getSizes() == null) {
                    toupdate.setSizes(new HashMap<>());
                } else {
                    // Force load by accessing the map (triggers lazy loading)
                    toupdate.getSizes().isEmpty();
                }
                
                // Clear existing values and add new ones
                // This ensures JPA properly detects the changes
                toupdate.getSizes().clear();
                toupdate.getSizes().putAll(dto.getSizes());
                
                System.out.println("Updated product sizes: " + dto.getSizes());
            } else if (dto.getSizes() != null && dto.getSizes().isEmpty()) {
                // If empty map is provided, clear all sizes
                if (toupdate.getSizes() != null) {
                    toupdate.getSizes().isEmpty(); // Force load
                    toupdate.getSizes().clear();
                }
            }
            
            String currentTime = String.valueOf(System.currentTimeMillis());
            toupdate.setCreatedAt(currentTime);
            toupdate.setUpdatedAt(currentTime);
            return productRepository.save(toupdate);
        }
        else {
            throw new RuntimeException("Product not found, not able to update it ");
        }
    }


    @Transactional
    public void deleteProduct(Long productId) {
        Optional<Product> productOpt = productRepository.findById(productId.intValue());
        if (!productOpt.isPresent()) {
            throw new RuntimeException("Product with ID " + productId + " not found");
        }

        Product product = productOpt.get();

        // Hard delete: Delete all related entities first, then delete the product
        
        // 1. Delete all cart items referencing this product
        try {
            cartItemRepository.deleteAll(cartItemRepository.findByProduct_ProdId(productId.intValue()));
        } catch (Exception e) {
            System.err.println("Warning: Failed to delete some cart items: " + e.getMessage());
        }

        // 2. Delete all order items referencing this product
        // Note: This will break order history, but user requested hard delete
        try {
            List<com.spring.model.OrderItem> orderItems = orderItemRepository.findByProductId(productId.intValue());
            if (!orderItems.isEmpty()) {
                System.out.println("Warning: Deleting " + orderItems.size() + " order item(s) for product '" + product.getProd_name() + 
                        "'. This will affect order history.");
                orderItemRepository.deleteAll(orderItems);
            }
        } catch (Exception e) {
            System.err.println("Warning: Failed to delete some order items: " + e.getMessage());
            throw new RuntimeException("Cannot delete product with existing order items. Please handle order items first.", e);
        }

        // 3. Initialize and delete product images from Google Cloud Storage
        // Note: If GCS is not configured, this will fail gracefully
        try {
            // Force initialize lazy collection before accessing
            Hibernate.initialize(product.getImagenames());
            List<String> imagenames = product.getImagenames();
            if (imagenames != null && !imagenames.isEmpty()) {
                for (String imageUrl : imagenames) {
                    try {
                        boolean deleted = gcsService.deleteFile(imageUrl);
                        if (!deleted) {
                            System.err.println("Warning: Could not delete image from GCS: " + imageUrl);
                        }
                    } catch (Exception e) {
                        // Log but don't fail - continue with product deletion
                        System.err.println("Warning: Failed to delete image from GCS: " + imageUrl + " - " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            // Log but don't fail - continue with product deletion even if GCS fails
            System.err.println("Warning: Failed to delete images from GCS: " + e.getMessage());
            System.err.println("Product deletion will continue without deleting images from GCS");
        }

        // 4. Clear all ElementCollection fields before deleting the product
        // This is necessary because ElementCollection creates separate tables with foreign keys
        try {
            // Force load and clear imagenames collection (product_prod_images table)
            Hibernate.initialize(product.getImagenames());
            if (product.getImagenames() != null) {
                product.getImagenames().clear();
            }
            
            // Force load and clear sizes collection (product_sizes table)
            Hibernate.initialize(product.getSizes());
            if (product.getSizes() != null) {
                product.getSizes().clear();
            }
            
            // Force load and clear reservedSizes collection (product_reserved_sizes table)
            Hibernate.initialize(product.getReservedSizes());
            if (product.getReservedSizes() != null) {
                product.getReservedSizes().clear();
            }
            
            // Save the product with cleared collections to remove foreign key references
            productRepository.save(product);
        } catch (Exception e) {
            System.err.println("Warning: Failed to clear ElementCollection fields: " + e.getMessage());
            e.printStackTrace();
        }

        // 5. Delete the product completely
        productRepository.deleteById(productId.intValue());
        System.out.println("Product '" + product.getProd_name() + "' (ID: " + productId + ") has been permanently deleted.");
    }


    @Override
    public Product getProductById(Long productId) {
        return productRepository.findById(productId.intValue())
                .orElseThrow(() -> new RuntimeException("Product with ID " + productId + " not found"));
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
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElse(null);
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

    @Override
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }
}
