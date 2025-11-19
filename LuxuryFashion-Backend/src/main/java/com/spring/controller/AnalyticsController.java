package com.spring.controller;

import com.spring.dto.AnalyticsDto;
import com.spring.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsDto.DashboardStats> getDashboardStats() {
        AnalyticsDto.DashboardStats stats = analyticsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<List<AnalyticsDto.RevenueData>> getMonthlyRevenue() {
        List<AnalyticsDto.RevenueData> revenue = analyticsService.getMonthlyRevenue();
        return ResponseEntity.ok(revenue);
    }

    @GetMapping("/products/top-selling")
    public ResponseEntity<List<AnalyticsDto.ProductStats>> getTopSellingProducts() {
        List<AnalyticsDto.ProductStats> products = analyticsService.getTopSellingProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/orders/status-distribution")
    public ResponseEntity<Map<String, Long>> getOrderStatusDistribution() {
        Map<String, Long> distribution = analyticsService.getOrderStatusDistribution();
        return ResponseEntity.ok(distribution);
    }
}