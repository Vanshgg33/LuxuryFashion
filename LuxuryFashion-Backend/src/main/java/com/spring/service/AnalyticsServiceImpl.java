package com.spring.service;

import com.spring.dto.AnalyticsDto;
import com.spring.model.Order;
import com.spring.repo.OrderRepository;
import com.spring.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public AnalyticsServiceImpl(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AnalyticsDto.DashboardStats getDashboardStats() {
        List<Order> allOrders = orderRepository.findAll();
        
        Long totalOrders = (long) allOrders.size();
        Double totalRevenue = allOrders.stream()
                .mapToDouble(Order::getTotalPrice)
                .sum();
        Long totalUsers = userRepository.count();
        Long pendingOrders = allOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.PENDING)
                .count();
        Double averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0.0;

        return AnalyticsDto.DashboardStats.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalUsers(totalUsers)
                .pendingOrders(pendingOrders)
                .averageOrderValue(averageOrderValue)
                .build();
    }

    @Override
    public List<AnalyticsDto.RevenueData> getMonthlyRevenue() {
        List<Order> orders = orderRepository.findAll();
        
        Map<String, Double> monthlyRevenue = orders.stream()
                .collect(Collectors.groupingBy(
                    order -> order.getOrderDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                    Collectors.summingDouble(Order::getTotalPrice)
                ));

        return monthlyRevenue.entrySet().stream()
                .map(entry -> AnalyticsDto.RevenueData.builder()
                        .period(entry.getKey())
                        .revenue(entry.getValue())
                        .build())
                .sorted(Comparator.comparing(AnalyticsDto.RevenueData::getPeriod))
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalyticsDto.ProductStats> getTopSellingProducts() {
        List<Order> orders = orderRepository.findAll();
        
        Map<String, AnalyticsDto.ProductStats> productStatsMap = new HashMap<>();
        
        orders.forEach(order -> 
            order.getItems().forEach(item -> {
                String productName = item.getProduct().getProd_name();
                productStatsMap.merge(productName, 
                    AnalyticsDto.ProductStats.builder()
                        .productName(productName)
                        .totalSold((long) item.getQuantity())
                        .revenue(item.getPrice() * item.getQuantity())
                        .build(),
                    (existing, replacement) -> AnalyticsDto.ProductStats.builder()
                        .productName(productName)
                        .totalSold(existing.getTotalSold() + replacement.getTotalSold())
                        .revenue(existing.getRevenue() + replacement.getRevenue())
                        .build()
                );
            })
        );

        return productStatsMap.values().stream()
                .sorted(Comparator.comparing(AnalyticsDto.ProductStats::getTotalSold).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Long> getOrderStatusDistribution() {
        List<Order> orders = orderRepository.findAll();
        
        return orders.stream()
                .collect(Collectors.groupingBy(
                    order -> order.getStatus().toString(),
                    Collectors.counting()
                ));
    }
}