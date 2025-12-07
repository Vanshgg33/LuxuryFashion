package com.spring.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private Double discountValue; // Percentage (0-100) or fixed amount

    @Column(name = "min_order_amount")
    private Double minOrderAmount; // Minimum order amount to use this coupon

    @Column(name = "max_discount_amount")
    private Double maxDiscountAmount; // Maximum discount for percentage coupons

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_to", nullable = false)
    private LocalDateTime validTo;

    @Column(name = "usage_limit")
    private Integer usageLimit; // Total number of times coupon can be used (null = unlimited)

    @Column(name = "used_count")
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum DiscountType {
        PERCENTAGE,  // Discount as percentage (e.g., 10% off)
        FIXED        // Fixed amount discount (e.g., ₹50 off)
    }

    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive 
            && now.isAfter(validFrom) 
            && now.isBefore(validTo)
            && (usageLimit == null || usedCount < usageLimit);
    }
}


