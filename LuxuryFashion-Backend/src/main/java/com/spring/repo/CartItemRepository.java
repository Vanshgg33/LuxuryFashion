package com.spring.repo;

import com.spring.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.prod_id = :productId")
    Optional<CartItem> findByCartIdAndProductId(@Param("cartId") Long cartId, @Param("productId") Integer productId);
    
    // Find cart item by cart, product, and size
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.prod_id = :productId AND ci.size = :size")
    Optional<CartItem> findByCartIdAndProductIdAndSize(@Param("cartId") Long cartId, @Param("productId") Integer productId, @Param("size") String size);
    
    // Find all cart items by product ID
    @Query("SELECT ci FROM CartItem ci WHERE ci.product.prod_id = :productId")
    List<CartItem> findByProduct_ProdId(@Param("productId") Integer productId);
}