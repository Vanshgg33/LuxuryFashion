package com.spring.controller;

import com.spring.model.Coupon;
import com.spring.service.CouponService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private static final Logger logger = LoggerFactory.getLogger(CouponController.class);

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    /**
     * Validate and get coupon details
     * POST /api/coupons/validate
     * Body: { "code": "COUPON123", "orderTotal": 500.0 }
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, Object> request) {
        try {
            String code = (String) request.get("code");
            Double orderTotal = request.get("orderTotal") != null 
                ? Double.parseDouble(request.get("orderTotal").toString()) 
                : null;

            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Coupon code is required"));
            }

            if (orderTotal == null || orderTotal <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Valid order total is required"));
            }

            Map<String, Object> result = couponService.applyCoupon(code.trim(), orderTotal);
            
            if ((Boolean) result.get("valid")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(result);
            }
        } catch (Exception e) {
            logger.error("Error validating coupon: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to validate coupon: " + e.getMessage()));
        }
    }

    /**
     * Get coupon details without validation (for display purposes)
     * GET /api/coupons/{code}
     */
    @GetMapping("/{code}")
    public ResponseEntity<?> getCouponDetails(@PathVariable String code) {
        try {
            com.spring.model.Coupon coupon = couponService.validateCoupon(code);
            
            if (coupon == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Coupon not found or invalid"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("code", coupon.getCode());
            response.put("discountType", coupon.getDiscountType().toString());
            response.put("discountValue", coupon.getDiscountValue());
            response.put("minOrderAmount", coupon.getMinOrderAmount());
            response.put("maxDiscountAmount", coupon.getMaxDiscountAmount());
            response.put("description", coupon.getDescription());
            response.put("validFrom", coupon.getValidFrom());
            response.put("validTo", coupon.getValidTo());
            response.put("usageLimit", coupon.getUsageLimit());
            response.put("usedCount", coupon.getUsedCount());
            response.put("isValid", coupon.isValid());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting coupon details: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get coupon details: " + e.getMessage()));
        }
    }

    /**
     * Admin endpoint: Create a new coupon
     * POST /api/coupons/admin/create
     * Requires ADMIN role
     */
    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            // Validate required fields
            if (coupon.getCode() == null || coupon.getCode().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Coupon code is required"));
            }
            if (coupon.getDiscountType() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Discount type is required"));
            }
            if (coupon.getDiscountValue() == null || coupon.getDiscountValue() <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Valid discount value is required"));
            }
            if (coupon.getValidFrom() == null || coupon.getValidTo() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Valid from and valid to dates are required"));
            }

            Coupon createdCoupon = couponService.createCoupon(coupon);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Coupon created successfully", "coupon", createdCoupon));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating coupon: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create coupon: " + e.getMessage()));
        }
    }

    /**
     * Admin endpoint: Get all coupons
     * GET /api/coupons/admin/all
     * Requires ADMIN role
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        List<Coupon> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(coupons);
    }
}

