package com.spring.service;

import java.util.List;
import java.util.Map;

import com.spring.model.Address;
import com.spring.model.Order;

public interface OrderService {
    Order placeOrder(Long userId);
    Order placeOrderWithAddress(Long userId, Address address);
    Order placeOrderWithAddressAndPhone(Long userId, Address address, String phoneNumber);
    List<Order> getOrderHistory(Long userId);
    Order getOrderById(Long orderId);
    
    // Payment methods
    Map<String, Object> createRazorpayOrder(Order order);
    Order verifyPayment(Long orderId, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature);
    
    // Admin methods
    List<Order> getAllOrders();
    Order updateOrderStatus(Long orderId, Order.OrderStatus status);
}