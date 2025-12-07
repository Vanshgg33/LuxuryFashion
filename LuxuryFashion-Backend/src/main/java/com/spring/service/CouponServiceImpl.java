package com.spring.service;

import com.spring.model.Coupon;
import com.spring.repo.CouponRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class CouponServiceImpl implements CouponService {

    private static final Logger logger = LoggerFactory.getLogger(CouponServiceImpl.class);

    private final CouponRepository couponRepository;

    public CouponServiceImpl(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Coupon validateCoupon(String code) {
        if (code == null || code.trim().isEmpty()) {
            logger.debug("Coupon code is empty");
            return null;
        }

        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim());
        
        if (couponOpt.isEmpty()) {
            logger.debug("Coupon not found: {}", code);
            return null;
        }

        Coupon coupon = couponOpt.get();
        
        if (!coupon.isValid()) {
            logger.debug("Coupon is not valid: {}", code);
            return null;
        }

        logger.info("Coupon validated successfully: {}", code);
        return coupon;
    }

    @Override
    @Transactional(readOnly = true)
    public Double calculateDiscount(Coupon coupon, Double orderTotal) {
        if (coupon == null || orderTotal == null || orderTotal <= 0) {
            return 0.0;
        }

        // Check minimum order amount
        if (coupon.getMinOrderAmount() != null && orderTotal < coupon.getMinOrderAmount()) {
            logger.debug("Order total {} is less than minimum order amount {}", orderTotal, coupon.getMinOrderAmount());
            return 0.0;
        }

        Double discount = 0.0;

        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            // Calculate percentage discount
            discount = (orderTotal * coupon.getDiscountValue()) / 100.0;
            
            // Apply maximum discount limit if set
            if (coupon.getMaxDiscountAmount() != null && discount > coupon.getMaxDiscountAmount()) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else if (coupon.getDiscountType() == Coupon.DiscountType.FIXED) {
            // Fixed amount discount
            discount = coupon.getDiscountValue();
            
            // Don't allow discount to exceed order total
            if (discount > orderTotal) {
                discount = orderTotal;
            }
        }

        // Round to 2 decimal places
        return Math.round(discount * 100.0) / 100.0;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> applyCoupon(String code, Double orderTotal) {
        Map<String, Object> result = new HashMap<>();
        
        Coupon coupon = validateCoupon(code);
        
        if (coupon == null) {
            result.put("valid", false);
            result.put("message", "Invalid or expired coupon code");
            return result;
        }

        Double discount = calculateDiscount(coupon, orderTotal);
        Double finalAmount = orderTotal - discount;

        result.put("valid", true);
        result.put("coupon", coupon);
        result.put("discount", discount);
        result.put("discountFormatted", String.format("₹%.2f", discount));
        result.put("orderTotal", orderTotal);
        result.put("finalAmount", finalAmount);
        result.put("finalAmountFormatted", String.format("₹%.2f", finalAmount));
        result.put("message", "Coupon applied successfully");

        logger.info("Coupon {} applied: discount {}, final amount {}", code, discount, finalAmount);
        return result;
    }

    @Override
    public void incrementUsageCount(Coupon coupon) {
        if (coupon != null) {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
            logger.info("Incremented usage count for coupon: {}", coupon.getCode());
        }
    }

    @Override
    public Coupon createCoupon(Coupon coupon) {
        // Check if code already exists
        if (couponRepository.findByCodeIgnoreCase(coupon.getCode()).isPresent()) {
            throw new RuntimeException("Coupon code already exists: " + coupon.getCode());
        }
        
        Coupon savedCoupon = couponRepository.save(coupon);
        logger.info("Created new coupon: {}", savedCoupon.getCode());
        return savedCoupon;
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }
}

