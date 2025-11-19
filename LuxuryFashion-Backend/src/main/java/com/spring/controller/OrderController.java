package com.spring.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.dto.OrderRequest;
import com.spring.model.Address;
import com.spring.model.Order;
import com.spring.service.OrderService;
import com.spring.util.CurrencyUtil;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest orderRequest) {
        Long userId = getCurrentUserId();
        
        // Validate required fields
        String validationError = validateOrderRequest(orderRequest);
        if (validationError != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", validationError));
        }
        
        // Place order
        Order order = orderService.placeOrderWithAddressAndPhone(userId, orderRequest.getAddress(), orderRequest.getPhoneNumber());
        
        // Create Razorpay order for payment
        try {
            Map<String, Object> paymentResponse = orderService.createRazorpayOrder(order);
            Map<String, Object> response = new HashMap<>();
            response.put("order", order);
            response.put("payment", paymentResponse);
            response.put("currency", CurrencyUtil.getCurrencyInfo());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // If payment creation fails, still return order but with error message
            Map<String, Object> response = new HashMap<>();
            response.put("order", order);
            response.put("currency", CurrencyUtil.getCurrencyInfo());
            response.put("payment_error", "Failed to initialize payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT).body(response);
        }
    }

    @PostMapping("/create-razorpay-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody OrderRequest orderRequest) {
        try {
            Long userId = getCurrentUserId();
            
            logger.info("Creating Razorpay order request received for user: {}", userId);
            
            // Validate required fields
            String validationError = validateOrderRequest(orderRequest);
            if (validationError != null) {
                logger.warn("Validation failed for order request: {}", validationError);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", validationError, "details", "Please check address and phone number fields"));
            }
            
            // Place order
            Order order = orderService.placeOrderWithAddressAndPhone(userId, orderRequest.getAddress(), orderRequest.getPhoneNumber());
            logger.info("Order created successfully - Order ID: {}", order.getId());
            
            // Create Razorpay order for payment
            Map<String, Object> paymentResponse = orderService.createRazorpayOrder(order);
            Map<String, Object> response = new HashMap<>();
            response.put("order", order);
            response.put("payment", paymentResponse);
            response.put("currency", CurrencyUtil.getCurrencyInfo());
            
            logger.info("Razorpay order created successfully for Order ID: {}", order.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Failed to create Razorpay order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage(), "type", "RUNTIME_ERROR"));
        } catch (Exception e) {
            logger.error("Unexpected error creating Razorpay order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to initialize payment: " + e.getMessage(), "type", "INTERNAL_ERROR"));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> paymentData) {
        try {
            String razorpayOrderId = paymentData.get("razorpay_order_id");
            String razorpayPaymentId = paymentData.get("razorpay_payment_id");
            String razorpaySignature = paymentData.get("razorpay_signature");
            String orderIdStr = paymentData.get("order_id");

            logger.info("Verifying payment - Order ID: {}, Payment ID: {}", orderIdStr, razorpayPaymentId);

            if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null || orderIdStr == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Missing payment verification data"));
            }

            Long orderId = Long.parseLong(orderIdStr);
            Long userId = getCurrentUserId();
            Order order = orderService.getOrderById(orderId);
            
            // Verify order belongs to user
            if (!order.getUser().getId().equals(userId)) {
                logger.warn("User {} attempted to verify payment for order {} belonging to user {}", 
                        userId, orderId, order.getUser().getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied"));
            }

            Order verifiedOrder = orderService.verifyPayment(orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature);
            
            logger.info("Payment verified successfully - Order ID: {}", orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order_id", verifiedOrder.getId());
            response.put("status", verifiedOrder.getStatus().toString());
            response.put("payment_status", verifiedOrder.getPaymentStatus().toString());
            response.put("amount", verifiedOrder.getTotalPrice());
            response.put("currency", "INR");
            response.put("currency_code", CurrencyUtil.CURRENCY_CODE);
            response.put("currency_symbol", CurrencyUtil.CURRENCY_SYMBOL);
            response.put("currency_name", CurrencyUtil.CURRENCY_NAME);
            response.put("amount_formatted", CurrencyUtil.formatAmount(verifiedOrder.getTotalPrice()));
            response.put("message", "Payment verified successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error verifying payment", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Payment verification failed", "message", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Order>> getOrderHistory() {
        Long userId = getCurrentUserId();
        List<Order> orders = orderService.getOrderHistory(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable Long orderId) {
        Order order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    // Admin APIs
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        String statusStr = request.get("status");
        Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr.toUpperCase());
        Order updatedOrder = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/admin/{orderId}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> markOrderComplete(@PathVariable Long orderId) {
        Order completedOrder = orderService.updateOrderStatus(orderId, Order.OrderStatus.DELIVERED);
        return ResponseEntity.ok(completedOrder);
    }

    private String validateOrderRequest(OrderRequest orderRequest) {
        if (orderRequest == null) {
            return "Order request is required";
        }
        
        Address address = orderRequest.getAddress();
        if (address == null) {
            return "Address is required";
        }
        
        if (address.getStreet() == null || address.getStreet().trim().isEmpty()) {
            return "Street address is required";
        }
        if (address.getCity() == null || address.getCity().trim().isEmpty()) {
            return "City is required";
        }
        if (address.getState() == null || address.getState().trim().isEmpty()) {
            return "State is required";
        }
        if (address.getZipCode() == null || address.getZipCode().trim().isEmpty()) {
            return "Zip code is required";
        }
        if (address.getCountry() == null || address.getCountry().trim().isEmpty()) {
            return "Country is required";
        }
        
        String phoneNumber = orderRequest.getPhoneNumber();
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return "Phone number is required";
        }
        
        return null;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.spring.model.UserShow) {
            com.spring.model.UserShow userShow = (com.spring.model.UserShow) auth.getPrincipal();
            return userShow.getUser().getId();
        }
        throw new RuntimeException("User not authenticated");
    }
}