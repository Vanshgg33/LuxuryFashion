package com.spring.service;

import com.spring.dto.AnalyticsDto;
import java.util.List;
import java.util.Map;

public interface AnalyticsService {
    AnalyticsDto.DashboardStats getDashboardStats();
    List<AnalyticsDto.RevenueData> getMonthlyRevenue();
    List<AnalyticsDto.ProductStats> getTopSellingProducts();
    Map<String, Long> getOrderStatusDistribution();
}