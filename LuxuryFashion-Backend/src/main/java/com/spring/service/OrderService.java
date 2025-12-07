package com.spring.service;

import java.util.List;

import com.spring.model.Address;
import com.spring.model.Order;

public interface OrderService {
    Order placeOrder(Long userId);
    Order placeOrderWithAddress(Long userId, Address address);
    Order placeOrderWithAddressAndPhone(Long userId, Address address, String phoneNumber);
    Order placeOrderWithAddressAndPhoneAndCoupon(Long userId, Address address, String phoneNumber, String couponCode);
    List<Order> getOrderHistory(Long userId);
    Order getOrderById(Long orderId);
    
    // Admin methods
    List<Order> getAllOrders();
    Order updateOrderStatus(Long orderId, Order.OrderStatus status);
}