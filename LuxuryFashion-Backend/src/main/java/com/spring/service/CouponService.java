package com.spring.service;

import com.spring.model.Coupon;
import java.util.List;
import java.util.Map;

public interface CouponService {
    /**
     * Validate and get coupon by code
     * @param code coupon code
     * @return coupon if valid, null otherwise
     */
    Coupon validateCoupon(String code);

    /**
     * Calculate discount amount for a given order total
     * @param coupon coupon to apply
     * @param orderTotal order total amount
     * @return discount amount
     */
    Double calculateDiscount(Coupon coupon, Double orderTotal);

    /**
     * Apply coupon and calculate final amount
     * @param code coupon code
     * @param orderTotal order total amount
     * @return map containing discount details and final amount
     */
    Map<String, Object> applyCoupon(String code, Double orderTotal);

    /**
     * Increment usage count for a coupon
     * @param coupon coupon to update
     */
    void incrementUsageCount(Coupon coupon);

    /**
     * Create a new coupon (Admin only)
     * @param coupon coupon to create
     * @return created coupon
     */
    Coupon createCoupon(Coupon coupon);

    /**
     * Get all coupons (Admin only)
     * @return list of all coupons
     */
    List<Coupon> getAllCoupons();
}

