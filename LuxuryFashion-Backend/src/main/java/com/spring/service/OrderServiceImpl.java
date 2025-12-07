package com.spring.service;

import com.spring.model.*;
import com.spring.notification.EmailNotificationService;
import com.spring.notification.EmailTemplate;
import com.spring.repo.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.Hibernate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final UserRepository userRepository;
    private final EmailNotificationService emailService;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final GoogleCloudStorageService gcsService;
    private final CouponService couponService;
    
    @Value("${product.picture.path}")
    private String productPicturePath;
    
    @PersistenceContext
    private EntityManager entityManager;

    public OrderServiceImpl(
            OrderRepository orderRepository, 
            CartService cartService, 
            UserRepository userRepository, 
            EmailNotificationService emailService, 
            AddressRepository addressRepository, 
            ProductRepository productRepository,
            GoogleCloudStorageService gcsService,
            CouponService couponService) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.addressRepository = addressRepository;
        this.productRepository = productRepository;
        this.gcsService = gcsService;
        this.couponService = couponService;
    }

    @Override
    public Order placeOrder(Long userId) {
        return placeOrderWithAddress(userId, null);
    }

    @Override
    public Order placeOrderWithAddress(Long userId, Address address) {
        return placeOrderWithAddressAndPhone(userId, address, null);
    }

    @Override
    public Order placeOrderWithAddressAndPhone(Long userId, Address address, String phoneNumber) {
        return placeOrderWithAddressAndPhoneAndCoupon(userId, address, phoneNumber, null);
    }

    @Override
    public Order placeOrderWithAddressAndPhoneAndCoupon(Long userId, Address address, String phoneNumber, String couponCode) {
        Cart cart = cartService.getCartByUserId(userId);
        
        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save address and phone number to user profile
        if (address != null && isValidAddress(address)) {
            // Check if user already has an address - update it or create new
            Address existingAddress = user.getAddress();
            
            if (existingAddress != null) {
                // Update existing address
                existingAddress.setStreet(address.getStreet());
                existingAddress.setCity(address.getCity());
                existingAddress.setState(address.getState());
                existingAddress.setZipCode(address.getZipCode());
                existingAddress.setCountry(address.getCountry());
                if (address.getPhoneNumber() != null) {
                    existingAddress.setPhoneNumber(address.getPhoneNumber());
                }
                // Ensure user is set (should already be set, but just in case)
                existingAddress.setUser(user);
                Address savedAddress = addressRepository.save(existingAddress);
                user.setAddress(savedAddress);
            } else {
                // Create new address - set user before saving (since user_id is in address table)
                address.setUser(user);
                Address savedAddress = addressRepository.save(address);
                user.setAddress(savedAddress);
            }
        }
        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            user.setPhoneNumber(phoneNumber.trim());
        }
        userRepository.save(user);

        // Check size availability and create order items
        // Reload all products with their sizes collections to ensure fresh data
        List<OrderItem> orderItems = cart.getCartItems().stream()
                .map(cartItem -> {
                    // Reload product to ensure we have fresh data from database
                    Product product = productRepository.findById(cartItem.getProduct().getProd_id())
                            .orElseThrow(() -> new RuntimeException("Product not found"));
                    
                    // Initialize and force load sizes collections (ElementCollection lazy loading)
                    if (product.getSizes() == null) {
                        product.setSizes(new java.util.HashMap<>());
                    } else {
                        Hibernate.initialize(product.getSizes());
                    }
                    
                    if (product.getReservedSizes() == null) {
                        product.setReservedSizes(new java.util.HashMap<>());
                    } else {
                        Hibernate.initialize(product.getReservedSizes());
                    }
                    
                    String size = cartItem.getSize();
                    boolean hasSizes = product.getSizes() != null && !product.getSizes().isEmpty();
                    boolean isOneSize = size != null && size.trim().equalsIgnoreCase("One Size");
                    
                    // Determine if we should use size-based or general quantity logic
                    // Use size-based logic only if:
                    // 1. Size is provided AND not "One Size"
                    // 2. Product has sizes defined
                    // 3. The size exists in the product's sizes map
                    boolean useSizeBasedLogic = size != null && !size.trim().isEmpty() 
                            && !isOneSize 
                            && hasSizes 
                            && product.getSizes().containsKey(size.trim());
                    
                    // Check and update size availability if size is provided
                    if (useSizeBasedLogic) {
                        size = size.trim();
                        
                        // Get current quantities
                        Integer totalQuantity = product.getSizes().getOrDefault(size, 0);
                        Integer reservedQuantity = product.getReservedSizes().getOrDefault(size, 0);
                        
                        // During order placement, we allow the order if:
                        // 1. The item was already in cart (reserved), so reservedQuantity should cover the cartItem.quantity
                        // 2. OR if totalQuantity is sufficient
                        // Since item is in cart, it was already validated and reserved when added
                        if (totalQuantity < cartItem.getQuantity()) {
                            throw new RuntimeException("Size '" + size + "' for product '" + product.getProd_name() + "' has only " + totalQuantity + " items available, but " + cartItem.getQuantity() + " requested");
                        }
                        
                        // Decrease actual quantity for this size (order is being placed)
                        product.getSizes().put(size, totalQuantity - cartItem.getQuantity());
                        
                        // Clear reserved quantity for this size (item is moving from cart to order)
                        // The reserved quantity should match or exceed cartItem.quantity if it was added properly
                        product.getReservedSizes().put(size, Math.max(0, reservedQuantity - cartItem.getQuantity()));
                    } else {
                        // Fallback to general product quantity for:
                        // - No size specified
                        // - "One Size" (treated as no size selection)
                        // - Product has no sizes defined
                        // - Size doesn't exist in product's sizes map
                        if (product.getProd_quantity() < cartItem.getQuantity()) {
                            throw new RuntimeException("Insufficient quantity available for product '" + product.getProd_name() + "'");
                        }
                        product.setProd_quantity(product.getProd_quantity() - cartItem.getQuantity());
                    }
                    
                    return OrderItem.builder()
                            .product(product)
                            .quantity(cartItem.getQuantity())
                            .price(cartItem.getPrice())
                            .size(size != null ? size : null)
                            .build();
                })
                .collect(Collectors.toList());

        // Batch save all updated products (more efficient than saving individually)
        List<Product> productsToUpdate = orderItems.stream()
                .map(OrderItem::getProduct)
                .distinct()
                .collect(Collectors.toList());
        productRepository.saveAll(productsToUpdate);

        // Calculate subtotal (before discount)
        Double subtotal = cart.getTotalPrice();
        Double discountAmount = 0.0;
        String appliedCouponCode = null;

        // Apply coupon if provided
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Map<String, Object> couponResult = couponService.applyCoupon(couponCode.trim(), subtotal);
            if ((Boolean) couponResult.get("valid")) {
                discountAmount = (Double) couponResult.get("discount");
                appliedCouponCode = couponCode.trim();
                logger.info("Coupon {} applied: discount {}", appliedCouponCode, discountAmount);
            } else {
                logger.warn("Invalid coupon code provided: {}", couponCode);
                throw new RuntimeException("Invalid or expired coupon code: " + couponCode);
            }
        }

        // Calculate final total after discount
        Double finalTotal = subtotal - discountAmount;

        Order order = Order.builder()
                .user(user)
                .items(orderItems)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .couponCode(appliedCouponCode)
                .totalPrice(finalTotal)
                .build();

        // Set order reference in order items
        orderItems.forEach(item -> item.setOrder(order));

        Order savedOrder = orderRepository.save(order);
        
        // Increment coupon usage count if coupon was applied
        if (appliedCouponCode != null) {
            com.spring.model.Coupon coupon = couponService.validateCoupon(appliedCouponCode);
            if (coupon != null) {
                couponService.incrementUsageCount(coupon);
            }
        }
        
        // Clear cart after successful order
        cartService.clearCart(userId);
        
        // Send order confirmation email
        sendOrderConfirmationEmail(savedOrder);
        
        // Process product images for the order AFTER saving and clearing cart
        // Detach products to prevent saving base64 strings to DB
        processOrderImagesForWriteTransaction(savedOrder);
        
        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrderHistory(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        processOrderImages(orders);
        return orders;
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        processOrderImages(order);
        return order;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
        processOrderImages(orders);
        return orders;
    }

    @Override
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = getOrderById(orderId);
        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        
        // Process product images for the updated order (write transaction - use detach version)
        processOrderImagesForWriteTransaction(updatedOrder);
        
        // Send status update email if status changed
        if (!oldStatus.equals(status)) {
            sendOrderStatusUpdateEmail(updatedOrder);
        }
        
        return updatedOrder;
    }


    /**
     * Process product images in order items - ensure images are GCS URLs
     * For READ-ONLY transactions - products stay managed for lazy loading
     */
    private void processOrderImages(Order order) {
        if (order == null || order.getItems() == null) {
            return;
        }
        
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                // Force initialize all lazy collections before detaching
                // This prevents "could not initialize proxy - no Session" errors during JSON serialization
                try {
                    // Initialize and materialize collections
                    if (product.getImagenames() != null) {
                        Hibernate.initialize(product.getImagenames());
                        // Access collection to ensure it's fully loaded
                        product.getImagenames().size();
                    }
                    if (product.getSizes() != null) {
                        Hibernate.initialize(product.getSizes());
                        // Access collection to ensure it's fully loaded
                        product.getSizes().size();
                    }
                    if (product.getReservedSizes() != null) {
                        Hibernate.initialize(product.getReservedSizes());
                        // Access collection to ensure it's fully loaded
                        product.getReservedSizes().size();
                    }
                } catch (Exception e) {
                    logger.warn("Failed to initialize lazy collections for product: {}", product.getProd_id(), e);
                }
                
                // Now process images if they exist - convert to GCS URLs if needed
                if (product.getImagenames() != null && !product.getImagenames().isEmpty()) {
                    List<String> imageUrls = new ArrayList<>();
                    
                    for (String imageNameOrUrl : product.getImagenames()) {
                        if (imageNameOrUrl == null || imageNameOrUrl.isEmpty()) {
                            continue;
                        }
                        
                        try {
                            // If it's already a URL (starts with http), use it directly
                            if (imageNameOrUrl.startsWith("http://") || imageNameOrUrl.startsWith("https://")) {
                                imageUrls.add(imageNameOrUrl);
                            } else if (imageNameOrUrl.startsWith("data:")) {
                                // Legacy base64 - skip or convert (for now, skip to avoid large payloads)
                                logger.warn("Skipping base64 image in order - should be migrated to GCS URL");
                            } else {
                                // Legacy: If it's a filename, convert to GCS URL
                                String url = gcsService.getPublicUrl("products/" + imageNameOrUrl);
                                if (url != null) {
                                    imageUrls.add(url);
                                }
                            }
                        } catch (Exception e) {
                            logger.warn("Failed to process image: {}", imageNameOrUrl, e);
                        }
                    }
                    
                    if (!imageUrls.isEmpty()) {
                        product.setImagenames(imageUrls);
                    }
                }
            }
        }
    }
    
    /**
     * Process product images for multiple orders
     */
    private void processOrderImages(List<Order> orders) {
        if (orders == null) {
            return;
        }
        for (Order order : orders) {
            processOrderImages(order);
        }
    }
    
    /**
     * Process product images for WRITE transactions - detach products before modifying
     * Ensures images are GCS URLs
     */
    private void processOrderImagesForWriteTransaction(Order order) {
        if (order == null || order.getItems() == null) {
            return;
        }
        
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                // Force initialize all lazy collections before detaching
                try {
                    if (product.getImagenames() != null) {
                        Hibernate.initialize(product.getImagenames());
                        product.getImagenames().size();
                    }
                    if (product.getSizes() != null) {
                        Hibernate.initialize(product.getSizes());
                        product.getSizes().size();
                    }
                    if (product.getReservedSizes() != null) {
                        Hibernate.initialize(product.getReservedSizes());
                        product.getReservedSizes().size();
                    }
                } catch (Exception e) {
                    logger.warn("Failed to initialize lazy collections for product: {}", product.getProd_id(), e);
                }
                
                // Detach BEFORE modifying to prevent DB save
                entityManager.detach(product);
                
                // Now process images if they exist - convert to GCS URLs if needed
                if (product.getImagenames() != null && !product.getImagenames().isEmpty()) {
                    List<String> imageUrls = new ArrayList<>();
                    
                    for (String imageNameOrUrl : product.getImagenames()) {
                        if (imageNameOrUrl == null || imageNameOrUrl.isEmpty()) {
                            continue;
                        }
                        
                        try {
                            // If it's already a URL (starts with http), use it directly
                            if (imageNameOrUrl.startsWith("http://") || imageNameOrUrl.startsWith("https://")) {
                                imageUrls.add(imageNameOrUrl);
                            } else if (imageNameOrUrl.startsWith("data:")) {
                                // Legacy base64 - skip or convert (for now, skip to avoid large payloads)
                                logger.warn("Skipping base64 image in order - should be migrated to GCS URL");
                            } else {
                                // Legacy: If it's a filename, convert to GCS URL
                                String url = gcsService.getPublicUrl("products/" + imageNameOrUrl);
                                if (url != null) {
                                    imageUrls.add(url);
                                }
                            }
                        } catch (Exception e) {
                            logger.warn("Failed to process image: {}", imageNameOrUrl, e);
                        }
                    }
                    
                    if (!imageUrls.isEmpty()) {
                        // Safe to modify now since product is detached
                        product.setImagenames(imageUrls);
                    }
                }
            }
        }
    }


    private void sendOrderConfirmationEmail(Order order) {
        try {
            String subject = "Order Confirmation - Food Ordering";
            String itemsHtml = buildOrderItemsHtml(order.getItems());
            String addressHtml = buildAddressHtml(order.getUser().getAddress());
            String content = EmailTemplate.getOrderConfirmationTemplate(
                order.getUser().getName(), 
                order.getId(), 
                order.getTotalPrice(),
                itemsHtml,
                addressHtml
            );
            emailService.sendNotification(order.getUser().getEmail(), null, subject, content);
            logger.info("Order confirmation email sent to: {}", order.getUser().getEmail());
        } catch (Exception e) {
            logger.error("Failed to send order confirmation email for order: {}", order.getId(), e);
        }
    }

    private void sendOrderStatusUpdateEmail(Order order) {
        try {
            String subject = "Order Update - Food Ordering";
            String content = EmailTemplate.getOrderStatusUpdateTemplate(
                order.getUser().getName(), 
                order.getId(), 
                order.getStatus().toString()
            );
            emailService.sendNotification(order.getUser().getEmail(), null, subject, content);
            logger.info("Order status update email sent to: {}", order.getUser().getEmail());
        } catch (Exception e) {
            logger.error("Failed to send order status update email for order: {}", order.getId(), e);
        }
    }


    private boolean isValidAddress(Address address) {
        return address.getStreet() != null && !address.getStreet().trim().isEmpty() &&
               address.getCity() != null && !address.getCity().trim().isEmpty() &&
               address.getState() != null && !address.getState().trim().isEmpty() &&
               address.getZipCode() != null && !address.getZipCode().trim().isEmpty() &&
               address.getCountry() != null && !address.getCountry().trim().isEmpty();
    }

    private String buildOrderItemsHtml(List<OrderItem> items) {
        StringBuilder html = new StringBuilder();
        html.append("<div style='background:#f9fafc; padding:20px; border-radius:8px; margin:20px 0;'>");
        html.append("<h3 style='margin:0 0 15px; color:#333;'>📦 Items Ordered</h3>");
        for (OrderItem item : items) {
            String sizeInfo = item.getSize() != null ? " | Size: " + item.getSize() : "";
            html.append(String.format(
                "<div style='border-bottom:1px solid #eee; padding:10px 0;'>" +
                "<p style='margin:0; font-weight:bold;'>%s</p>" +
                "<p style='margin:5px 0; color:#666;'>Quantity: %d%s | Price: ₹%.2f</p>" +
                "<p style='margin:5px 0; color:#666;'>Subtotal: ₹%.2f</p>" +
                "</div>",
                item.getProduct().getProd_name(),
                item.getQuantity(),
                sizeInfo,
                item.getPrice(),
                item.getPrice() * item.getQuantity()
            ));
        }
        html.append("</div>");
        return html.toString();
    }

    private String buildAddressHtml(Address address) {
        if (address == null || !isValidAddress(address)) {
            return "";
        }
        return String.format(
            "<div style='background:#f9fafc; padding:20px; border-radius:8px; margin:20px 0;'>" +
            "<h3 style='margin:0 0 15px; color:#333;'>🏠 Delivery Address</h3>" +
            "<p style='margin:0; line-height:1.6;'>%s<br>%s, %s %s<br>%s</p>" +
            "</div>",
            address.getStreet(),
            address.getCity(),
            address.getState(),
            address.getZipCode(),
            address.getCountry()
        );
    }
}