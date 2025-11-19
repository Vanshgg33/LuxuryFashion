package com.spring.service;

import com.spring.dto.CartItemDto;
import com.spring.model.Cart;

public interface CartService {
    Cart getCartByUserId(Long userId);
    Cart addItemToCart(Long userId, CartItemDto cartItemDto);
    Cart updateCartItem(Long userId, Long cartItemId, Integer quantity);
    Cart removeItemFromCart(Long userId, Long cartItemId);
    void clearCart(Long userId);
}