package com.spring.repo;

import com.spring.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("SELECT oi FROM OrderItem oi WHERE oi.product.prod_id = :productId")
    List<OrderItem> findByProductId(@Param("productId") Integer productId);
    
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.product.prod_id = :productId")
    long countByProductId(@Param("productId") Integer productId);
}

