package com.spring.controller;

import com.spring.dto.CartItemDto;
import com.spring.model.Cart;
import com.spring.model.CartItem;
import com.spring.service.CartService;
import com.spring.util.CurrencyUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        try {
            Long userId = getCurrentUserId();
            Cart cart = cartService.getCartByUserId(userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            System.out.println("Error getting cart: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/items")
    public ResponseEntity<List<CartItem>> getCartItems() {
        try {
            Long userId = getCurrentUserId();
            Cart cart = cartService.getCartByUserId(userId);
            return ResponseEntity.ok(cart.getCartItems());
        } catch (Exception e) {
            System.out.println("Error getting cart items: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/items/{cartItemId}")
    public ResponseEntity<CartItem> getCartItem(@PathVariable Long cartItemId) {
        Long userId = getCurrentUserId();
        Cart cart = cartService.getCartByUserId(userId);
        CartItem item = cart.getCartItems().stream()
                .filter(cartItem -> cartItem.getId().equals(cartItemId))
                .findFirst()
                .orElse(null);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(item);
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCartItemCount() {
        Long userId = getCurrentUserId();
        Cart cart = cartService.getCartByUserId(userId);
        int totalItems = cart.getCartItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
        return ResponseEntity.ok(totalItems);
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, Object>> getCartTotal() {
        Long userId = getCurrentUserId();
        Cart cart = cartService.getCartByUserId(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("totalPrice", cart.getTotalPrice());
        response.put("totalPriceFormatted", CurrencyUtil.formatAmount(cart.getTotalPrice()));
        response.put("currency", CurrencyUtil.getCurrencyInfo());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addItemToCart(@RequestBody CartItemDto cartItemDto) {
        try {
            Long userId = getCurrentUserId();
            Cart cart = cartService.addItemToCart(userId, cartItemDto);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            System.out.println("Error adding item to cart: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<Cart> updateCartItem(@PathVariable Long cartItemId, @RequestParam Integer quantity) {
        Long userId = getCurrentUserId();
        Cart cart = cartService.updateCartItem(userId, cartItemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Cart> removeItemFromCart(@PathVariable Long cartItemId) {
        Long userId = getCurrentUserId();
        Cart cart = cartService.removeItemFromCart(userId, cartItemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        Long userId = getCurrentUserId();
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }

    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Authentication: " + auth);
            if (auth != null) {
                System.out.println("Principal: " + auth.getPrincipal());
                if (auth.getPrincipal() instanceof com.spring.model.UserShow) {
                    com.spring.model.UserShow userShow = (com.spring.model.UserShow) auth.getPrincipal();
                    System.out.println("User ID: " + userShow.getUser().getId());
                    return userShow.getUser().getId();
                }
            }
            throw new RuntimeException("User not authenticated");
        } catch (Exception e) {
            System.out.println("Error getting current user ID: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}