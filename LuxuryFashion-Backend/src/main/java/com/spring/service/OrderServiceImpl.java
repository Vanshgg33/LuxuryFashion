package com.spring.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.spring.model.*;
import com.spring.notification.EmailNotificationService;
import com.spring.notification.EmailTemplate;
import com.spring.repo.*;
import com.spring.util.CurrencyUtil;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.Hibernate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
    private final RazorpayClient razorpayClient;
    private final GoogleCloudStorageService gcsService;
    
    @Value("${razorpay.key.id}")
    private String razorpayKeyId;
    
    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;
    
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
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret) throws RazorpayException {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.addressRepository = addressRepository;
        this.productRepository = productRepository;
        this.gcsService = gcsService;
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
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
        // First, reload all products with their sizes collections to ensure they're loaded
        List<OrderItem> orderItems = cart.getCartItems().stream()
                .map(cartItem -> {
                    // Reload product to ensure we have fresh data from database
                    Product product = productRepository.findById(cartItem.getProduct().getProd_id())
                            .orElseThrow(() -> new RuntimeException("Product not found"));
                    
                    // Initialize and force load sizes collections (ElementCollection lazy loading)
                    if (product.getSizes() == null) {
                        product.setSizes(new java.util.HashMap<>());
                    } else {
                        // Force load by accessing the map
                        product.getSizes().isEmpty(); // Trigger lazy load
                    }
                    
                    if (product.getReservedSizes() == null) {
                        product.setReservedSizes(new java.util.HashMap<>());
                    } else {
                        // Force load by accessing the map
                        product.getReservedSizes().isEmpty(); // Trigger lazy load
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
                        
                        productRepository.save(product);
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
                        productRepository.save(product);
                    }
                    
                    return OrderItem.builder()
                            .product(product)
                            .quantity(cartItem.getQuantity())
                            .price(cartItem.getPrice())
                            .size(size != null ? size : null)
                            .build();
                })
                .collect(Collectors.toList());

        Order order = Order.builder()
                .user(user)
                .items(orderItems)
                .totalPrice(cart.getTotalPrice())
                .build();

        // Set order reference in order items
        orderItems.forEach(item -> item.setOrder(order));

        Order savedOrder = orderRepository.save(order);
        
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

    @Override
    public Map<String, Object> createRazorpayOrder(Order order) {
        try {
            logger.info("Creating Razorpay order for Order ID: {}", order.getId());
            
            // Check if Razorpay order already exists
            if (order.getRazorpayOrderId() != null && !order.getRazorpayOrderId().isEmpty()) {
                logger.warn("Razorpay order already exists for Order ID: {}", order.getId());
                return buildOrderResponse(order);
            }

            // Create Razorpay order
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (order.getTotalPrice() * 100)); // Amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "order_" + order.getId());
            orderRequest.put("notes", new JSONObject()
                    .put("order_id", order.getId().toString())
                    .put("user_id", order.getUser().getId().toString())
                    .put("user_email", order.getUser().getEmail()));

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            
            logger.info("Razorpay order created: {}", Optional.ofNullable(razorpayOrder.get("id")));

            // Update order with Razorpay order ID
            order.setRazorpayOrderId(razorpayOrder.get("id").toString());
            order.setRazorpayResponse(razorpayOrder.toString());
            order.setPaymentStatus(Order.PaymentStatus.PENDING);
            orderRepository.save(order);

            logger.info("Order updated with Razorpay order ID: {}", order.getRazorpayOrderId());

            return buildOrderResponse(order);
        } catch (RazorpayException e) {
            logger.error("Error creating Razorpay order for Order ID: {}", order.getId(), e);
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error creating Razorpay order for Order ID: {}", order.getId(), e);
            throw new RuntimeException("Unexpected error: " + e.getMessage(), e);
        }
    }

    @Override
    public Order verifyPayment(Long orderId, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            logger.info("Verifying payment - Order ID: {}, Payment ID: {}", orderId, razorpayPaymentId);
            
            // Get order
            Order order = getOrderById(orderId);
            
            if (order == null) {
                throw new RuntimeException("Order not found");
            }
            
            // Verify order belongs to the Razorpay order ID
            if (!order.getRazorpayOrderId().equals(razorpayOrderId)) {
                logger.error("Razorpay order ID mismatch for Order ID: {}", orderId);
                order.setPaymentStatus(Order.PaymentStatus.FAILED);
                order.setPaymentFailureReason("Razorpay order ID mismatch");
                orderRepository.save(order);
                throw new RuntimeException("Razorpay order ID mismatch");
            }

            // Verify signature
            if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
                logger.error("Invalid payment signature for Order ID: {}", orderId);
                order.setPaymentStatus(Order.PaymentStatus.FAILED);
                order.setPaymentFailureReason("Invalid signature");
                orderRepository.save(order);
                throw new RuntimeException("Invalid payment signature");
            }

            // Fetch payment details from Razorpay
            com.razorpay.Payment razorpayPayment = razorpayClient.payments.fetch(razorpayPaymentId);
            
            logger.info("Payment verified successfully - Payment ID: {}", razorpayPaymentId);

            // Update order with payment details
            order.setRazorpayPaymentId(razorpayPaymentId);
            order.setRazorpaySignature(razorpaySignature);
            order.setPaymentStatus(Order.PaymentStatus.CAPTURED);
            order.setPaidAt(LocalDateTime.now());
            order.setPaymentMethod(razorpayPayment.has("method") ? razorpayPayment.get("method").toString() : null);
            order.setPaymentBank(razorpayPayment.has("bank") ? razorpayPayment.get("bank").toString() : null);
            order.setPaymentWallet(razorpayPayment.has("wallet") ? razorpayPayment.get("wallet").toString() : null);
            order.setPaymentVpa(razorpayPayment.has("vpa") ? razorpayPayment.get("vpa").toString() : null);
            order.setRazorpayResponse(razorpayPayment.toString());

            // Update order status to CONFIRMED if it was PENDING
            if (order.getStatus() == Order.OrderStatus.PENDING) {
                order.setStatus(Order.OrderStatus.CONFIRMED);
            }

            Order savedOrder = orderRepository.save(order);
            logger.info("Payment verified and order updated - Order ID: {}", orderId);

            // Process product images for the verified order (write transaction - use detach version)
            processOrderImagesForWriteTransaction(savedOrder);

            // Send payment success email with order details
            sendPaymentSuccessEmail(savedOrder);

            return savedOrder;
        } catch (RazorpayException e) {
            logger.error("Error verifying payment - Order ID: {}, Payment ID: {}", orderId, razorpayPaymentId, e);
            throw new RuntimeException("Failed to verify payment: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error verifying payment", e);
            throw new RuntimeException("Unexpected error: " + e.getMessage(), e);
        }
    }

    private boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            String message = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            String calculatedSignature = bytesToHex(hash);
            
            boolean isValid = calculatedSignature.equals(razorpaySignature);
            logger.debug("Signature verification - Calculated: {}, Received: {}, Valid: {}", 
                    calculatedSignature, razorpaySignature, isValid);
            
            return isValid;
        } catch (Exception e) {
            logger.error("Error verifying signature", e);
            return false;
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
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

    private Map<String, Object> buildOrderResponse(Order order) {
        Map<String, Object> response = new HashMap<>();
        response.put("razorpay_order_id", order.getRazorpayOrderId());
        response.put("amount", order.getTotalPrice());
        response.put("currency", "INR");
        response.put("currency_code", CurrencyUtil.CURRENCY_CODE);
        response.put("currency_symbol", CurrencyUtil.CURRENCY_SYMBOL);
        response.put("currency_name", CurrencyUtil.CURRENCY_NAME);
        response.put("amount_formatted", CurrencyUtil.formatAmount(order.getTotalPrice()));
        response.put("key", razorpayKeyId);
        response.put("order_id", order.getId());
        return response;
    }

    private void sendOrderConfirmationEmail(Order order) {
        try {
            String subject = "Order Confirmation - LuxuryFashion";
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
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
    }

    private void sendOrderStatusUpdateEmail(Order order) {
        try {
            String subject = "Order Update - LuxuryFashion";
            String content = EmailTemplate.getOrderStatusUpdateTemplate(
                order.getUser().getName(), 
                order.getId(), 
                order.getStatus().toString()
            );
            emailService.sendNotification(order.getUser().getEmail(), null, subject, content);
        } catch (Exception e) {
            System.err.println("Failed to send order status update email: " + e.getMessage());
        }
    }

    private void sendPaymentSuccessEmail(Order order) {
        try {
            String subject = "Payment Successful - Order Confirmed | LuxuryFashion";
            String itemsHtml = buildOrderItemsHtml(order.getItems());
            String addressHtml = buildAddressHtml(order.getUser().getAddress());
            
            // Build payment details
            String paymentDetailsHtml = buildPaymentDetailsHtml(order);
            
            // Support contact information
            String supportEmail = "rangeelaboutique6@gmail.com";
            String supportPhone = "8981260291";
            int year = java.time.Year.now().getValue();
            
            // Create email content with improved styling
            String content = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Payment Successful - LuxuryFashion</title>" +
                "</head>" +
                "<body style='margin:0; padding:0; background: linear-gradient(135deg, #f5f7fa 0%%, #c3cfe2 100%%); font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>" +
                "<table style='width:100%%; max-width:600px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);'>" +
                "<tr>" +
                "<td style='background: linear-gradient(135deg, #28a745 0%%, #20c997 100%%); padding:40px; text-align:center;'>" +
                "<h1 style='margin:0; font-size:32px; color:#ffffff; font-weight:700; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);'>✅ Payment Successful!</h1>" +
                "<p style='margin:12px 0 0; font-size:18px; color:#f0f0f0; font-weight:500;'>Your order has been confirmed</p>" +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td style='padding:40px 30px;'>" +
                "<p style='font-size:18px; margin:0 0 20px; color:#333; font-weight:600;'>Dear <strong>%s</strong>,</p>" +
                "<p style='font-size:16px; line-height:1.8; color:#555; margin:0 0 25px;'>Great news! Your payment has been successfully processed and your order <strong style='color:#28a745;'>#%d</strong> has been confirmed.</p>" +
                "<div style='background:linear-gradient(135deg, #f8f9fa 0%%, #e9ecef 100%%); padding:25px; border-radius:10px; margin:25px 0; border-left:4px solid #28a745; box-shadow: 0 2px 10px rgba(0,0,0,0.05);'>" +
                "<h2 style='margin:0 0 15px; color:#28a745; font-size:22px; font-weight:600;'>💰 Payment Summary</h2>" +
                "<p style='margin:8px 0; font-size:15px; color:#555;'><strong style='color:#333;'>Order ID:</strong> <span style='color:#28a745; font-weight:600;'>#%d</span></p>" +
                "<p style='margin:8px 0; font-size:15px; color:#555;'><strong style='color:#333;'>Total Amount:</strong> <span style='color:#28a745; font-size:20px; font-weight:700;'>₹%.2f</span></p>" +
                "<p style='margin:8px 0; font-size:15px; color:#555;'><strong style='color:#333;'>Payment Status:</strong> <span style='color:#28a745; font-weight:bold; font-size:16px;'>%s</span></p>" +
                "<p style='margin:8px 0; font-size:15px; color:#555;'><strong style='color:#333;'>Payment Method:</strong> %s</p>" +
                "<p style='margin:8px 0; font-size:15px; color:#555;'><strong style='color:#333;'>Paid At:</strong> %s</p>" +
                "</div>" +
                "%s" + // Order items
                "%s" + // Delivery address
                "%s" + // Payment details
                "<div style='background:#fff3cd; padding:20px; border-radius:10px; margin:25px 0; border-left:4px solid #ffc107;'>" +
                "<p style='margin:0; color:#856404; font-size:16px; font-weight:600;'>📦 What's Next?</p>" +
                "<p style='margin:8px 0 0; color:#856404; font-size:14px; line-height:1.6;'>We're preparing your order and will notify you once it ships. You can track your order status in your account dashboard.</p>" +
                "</div>" +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td style='background: #f8f9fa; padding: 30px; text-align: center; border-top: 2px solid #e0e0e0;'>" +
                "<div style='margin-bottom: 20px;'>" +
                "<h3 style='margin: 0 0 15px; color: #333; font-size: 18px;'>Need Help?</h3>" +
                "<p style='margin: 8px 0; color: #666; font-size: 14px;'><strong>📧 Email:</strong> <a href='mailto:%s' style='color: #d4af37; text-decoration: none; font-weight:600;'>%s</a></p>" +
                "<p style='margin: 8px 0; color: #666; font-size: 14px;'><strong>📞 Phone:</strong> <a href='tel:%s' style='color: #d4af37; text-decoration: none; font-weight:600;'>%s</a></p>" +
                "</div>" +
                "<div style='border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;'>" +
                "<p style='margin: 0; color: #999; font-size: 12px;'>&copy; %d LuxuryFashion. All rights reserved.</p>" +
                "<p style='margin: 5px 0 0; color: #999; font-size: 11px;'>This is an automated email. Please do not reply directly to this message.</p>" +
                "</div>" +
                "</td>" +
                "</tr>" +
                "</table>" +
                "</body>" +
                "</html>",
                order.getUser().getName(),
                order.getId(),
                order.getId(),
                order.getTotalPrice(),
                order.getPaymentStatus().toString(),
                order.getPaymentMethod() != null ? order.getPaymentMethod() : "N/A",
                order.getPaidAt() != null ? order.getPaidAt().toString() : "N/A",
                itemsHtml,
                addressHtml,
                paymentDetailsHtml,
                supportEmail,
                supportEmail,
                supportPhone,
                supportPhone,
                year
            );
            
            emailService.sendNotification(order.getUser().getEmail(), null, subject, content);
            logger.info("Payment success email sent to: {}", order.getUser().getEmail());
        } catch (Exception e) {
            logger.error("Failed to send payment success email for order: {}", order.getId(), e);
            System.err.println("Failed to send payment success email: " + e.getMessage());
        }
    }

    private String buildPaymentDetailsHtml(Order order) {
        StringBuilder html = new StringBuilder();
        html.append("<div style='background:#e7f3ff; padding:20px; border-radius:8px; margin:20px 0; border-left:4px solid #2196F3;'>");
        html.append("<h3 style='margin:0 0 15px; color:#1976D2;'>💳 Payment Information</h3>");
        
        if (order.getRazorpayPaymentId() != null) {
            html.append(String.format(
                "<p style='margin:5px 0;'><strong>Payment ID:</strong> %s</p>",
                order.getRazorpayPaymentId()
            ));
        }
        
        if (order.getRazorpayOrderId() != null) {
            html.append(String.format(
                "<p style='margin:5px 0;'><strong>Razorpay Order ID:</strong> %s</p>",
                order.getRazorpayOrderId()
            ));
        }
        
        if (order.getPaymentMethod() != null) {
            html.append(String.format(
                "<p style='margin:5px 0;'><strong>Payment Method:</strong> %s</p>",
                order.getPaymentMethod()
            ));
        }
        
        if (order.getPaymentBank() != null) {
            html.append(String.format(
                "<p style='margin:5px 0;'><strong>Bank:</strong> %s</p>",
                order.getPaymentBank()
            ));
        }
        
        if (order.getPaymentWallet() != null) {
            html.append(String.format(
                "<p style='margin:5px 0;'><strong>Wallet:</strong> %s</p>",
                order.getPaymentWallet()
            ));
        }
        
        if (order.getPaymentVpa() != null) {
            html.append(String.format(
                "<p style='margin:5px 0;'><strong>UPI ID:</strong> %s</p>",
                order.getPaymentVpa()
            ));
        }
        
        if (order.getPaidAt() != null) {
            html.append(String.format(
                "<p style='margin:5px 0;'><strong>Payment Date:</strong> %s</p>",
                order.getPaidAt().toString()
            ));
        }
        
        html.append("</div>");
        return html.toString();
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