package com.spring.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(value = ConstraintMode.NO_CONSTRAINT))
    @JsonIgnoreProperties({"orders", "cart", "password"})
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    @Column(nullable = false)
    private Double totalPrice;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime orderDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "razorpay_order_id", unique = true)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", unique = true)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature")
    private String razorpaySignature;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_bank", length = 100)
    private String paymentBank;

    @Column(name = "payment_wallet", length = 100)
    private String paymentWallet;

    @Column(name = "payment_vpa", length = 50)
    private String paymentVpa; // Virtual Payment Address for UPI

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "payment_failure_reason", columnDefinition = "TEXT")
    private String paymentFailureReason;

    @Column(name = "razorpay_response", columnDefinition = "TEXT")
    private String razorpayResponse; // Store full Razorpay response as JSON

    public enum OrderStatus {
        PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    }

    public enum PaymentStatus {
        PENDING,        // Payment initiated but not completed
        CAPTURED,       // Payment successfully captured
        FAILED,         // Payment failed
        REFUNDED,       // Payment refunded
        PARTIALLY_REFUNDED // Partial refund
    }
}