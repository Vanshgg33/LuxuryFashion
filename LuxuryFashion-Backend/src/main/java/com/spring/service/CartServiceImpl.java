package com.spring.service;

import com.spring.dto.CartItemDto;
import com.spring.model.*;
import com.spring.repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(CartRepository cartRepository, CartItemRepository cartItemRepository, 
                          ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));
    }

    @Override
    public Cart addItemToCart(Long userId, CartItemDto cartItemDto) {
        Cart cart = getCartByUserId(userId);
        Product product = productRepository.findById(cartItemDto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        String size = cartItemDto.getSize();
        boolean hasSizes = product.getSizes() != null && !product.getSizes().isEmpty();
        boolean isOneSize = size != null && size.trim().equalsIgnoreCase("One Size");
        
        // Determine if we should use size-based or general quantity logic
        // Use size-based logic only if:
        // 1. Size is provided AND not "One Size"
        // 2. Product has sizes defined
        // 3. The size exists in the product's sizes map
        boolean useSizeBasedLogic = size != null && !size.trim().isEmpty() 
                && !isOneSize 
                && hasSizes 
                && product.getSizes().containsKey(size.trim());
        
        if (useSizeBasedLogic) {
            size = size.trim();
            // Check if size has enough quantity
            if (!product.isSizeAvailable(size, cartItemDto.getQuantity())) {
                Integer available = product.getAvailableQuantityForSize(size);
                throw new RuntimeException("Size '" + size + "' has only " + available + " items available");
            }
            
            // Reserve the quantity for this size
            Integer currentReserved = product.getReservedSizes().getOrDefault(size, 0);
            product.getReservedSizes().put(size, currentReserved + cartItemDto.getQuantity());
            productRepository.save(product);
        } else {
            // Use general product quantity for:
            // - No size specified
            // - "One Size" (treated as no size selection)
            // - Product has no sizes defined
            // - Size doesn't exist in product's sizes map
            if (size != null && !size.trim().isEmpty() && !isOneSize && hasSizes) {
                // Size was provided but doesn't exist in product sizes
                throw new RuntimeException("Size '" + size.trim() + "' not available for this product");
            }
            
            // Fallback to general product quantity check
            if (product.getProd_quantity() < cartItemDto.getQuantity()) {
                throw new RuntimeException("Insufficient product quantity available");
            }
            product.setProd_quantity(product.getProd_quantity() - cartItemDto.getQuantity());
            productRepository.save(product);
            
            // For "One Size" or products without sizes, set size to null or "One Size" based on input
            if (isOneSize) {
                size = "One Size"; // Keep "One Size" for display purposes
            } else {
                size = null; // No size for products without size selection
            }
        }

        // Check for existing cart item with same product and size
        Optional<CartItem> existingItem = size != null && !size.trim().isEmpty()
            ? cartItemRepository.findByCartIdAndProductIdAndSize(cart.getId(), cartItemDto.getProductId(), size.trim())
            : cartItemRepository.findByCartIdAndProductId(cart.getId(), cartItemDto.getProductId());
        
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + cartItemDto.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(cartItemDto.getQuantity())
                    .price((double) product.getSelling_price())
                    .size(size != null ? size.trim() : null)
                    .build();
            cartItemRepository.save(newItem);
        }
        
        return cartRepository.findById(cart.getId()).orElse(cart);
    }

    @Override
    public Cart updateCartItem(Long userId, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        Product product = cartItem.getProduct();
        int oldQuantity = cartItem.getQuantity();
        int quantityDifference = quantity - oldQuantity;
        String size = cartItem.getSize();
        boolean hasSizes = product.getSizes() != null && !product.getSizes().isEmpty();
        boolean isOneSize = size != null && size.trim().equalsIgnoreCase("One Size");
        
        // Determine if we should use size-based or general quantity logic
        boolean useSizeBasedLogic = size != null && !size.trim().isEmpty() 
                && !isOneSize 
                && hasSizes 
                && product.getSizes().containsKey(size.trim());

        if (quantity <= 0) {
            // Restore quantity when removing item
            restoreQuantity(product, size, oldQuantity);
            cartItemRepository.delete(cartItem);
        } else {
            // Check availability for size if applicable
            if (useSizeBasedLogic) {
                size = size.trim();
                
                // Release old reserved quantity
                Integer currentReserved = product.getReservedSizes().getOrDefault(size, 0);
                product.getReservedSizes().put(size, Math.max(0, currentReserved - oldQuantity));
                
                // Check if new quantity is available
                if (!product.isSizeAvailable(size, quantity)) {
                    // Restore reserved quantity
                    product.getReservedSizes().put(size, currentReserved);
                    productRepository.save(product);
                    Integer available = product.getAvailableQuantityForSize(size);
                    throw new RuntimeException("Size '" + size + "' has only " + available + " items available");
                }
                
                // Reserve new quantity
                Integer updatedReserved = product.getReservedSizes().getOrDefault(size, 0);
                product.getReservedSizes().put(size, updatedReserved + quantity);
                productRepository.save(product);
            } else {
                // Fallback to general product quantity
                if (quantityDifference > 0 && product.getProd_quantity() < quantityDifference) {
                    throw new RuntimeException("Insufficient product quantity available");
                }
                // Restore old quantity and reduce by new quantity
                product.setProd_quantity(product.getProd_quantity() + oldQuantity - quantity);
                productRepository.save(product);
            }
            
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }
        
        return getCartByUserId(userId);
    }

    @Override
    public Cart removeItemFromCart(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to cart item");
        }

        // Restore quantity when removing item
        restoreQuantity(cartItem.getProduct(), cartItem.getSize(), cartItem.getQuantity());
        cartItemRepository.delete(cartItem);
        return getCartByUserId(userId);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        
        // Restore quantities for all items before clearing
        for (CartItem item : cart.getCartItems()) {
            restoreQuantity(item.getProduct(), item.getSize(), item.getQuantity());
        }
        
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }
    
    // Helper method to restore quantity (for size or general product)
    private void restoreQuantity(Product product, String size, Integer quantity) {
        boolean hasSizes = product.getSizes() != null && !product.getSizes().isEmpty();
        boolean isOneSize = size != null && size.trim().equalsIgnoreCase("One Size");
        
        // Use size-based restoration only if:
        // 1. Size is provided AND not "One Size"
        // 2. Product has sizes defined
        // 3. The size exists in the product's sizes map
        boolean useSizeBasedLogic = size != null && !size.trim().isEmpty() 
                && !isOneSize 
                && hasSizes 
                && product.getSizes().containsKey(size.trim());
        
        if (useSizeBasedLogic) {
            size = size.trim();
            if (product.getReservedSizes().containsKey(size)) {
                Integer currentReserved = product.getReservedSizes().getOrDefault(size, 0);
                product.getReservedSizes().put(size, Math.max(0, currentReserved - quantity));
                productRepository.save(product);
            }
        } else {
            // Restore general product quantity for "One Size" or products without sizes
            product.setProd_quantity(product.getProd_quantity() + quantity);
            productRepository.save(product);
        }
    }

    private Cart createCartForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Cart cart = Cart.builder()
                .user(user)
                .build();
        
        return cartRepository.save(cart);
    }
}