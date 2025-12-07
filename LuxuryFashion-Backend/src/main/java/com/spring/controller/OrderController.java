package com.spring.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        
        // Place order with optional coupon code
        Order order = orderService.placeOrderWithAddressAndPhoneAndCoupon(
            userId, 
            orderRequest.getAddress(), 
            orderRequest.getPhoneNumber(),
            orderRequest.getCouponCode()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("order", order);
        response.put("currency", CurrencyUtil.getCurrencyInfo());
        response.put("message", "Order placed successfully");
        if (order.getCouponCode() != null) {
            response.put("couponApplied", order.getCouponCode());
            response.put("discountAmount", order.getDiscountAmount());
        }
        return ResponseEntity.ok(response);
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