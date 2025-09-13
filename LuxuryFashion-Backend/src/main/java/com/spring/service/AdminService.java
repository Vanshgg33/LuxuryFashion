package com.spring.service;

import com.spring.dto.ProductDto;
import com.spring.model.Gallery;
import com.spring.model.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AdminService {
    /**
     * Fetch all products with base64 encoded images (for frontend).
     * @return list of products
     */
    List<Product> fetchProducts();

    /**
     * Add a new product with multiple images.
     * @param dto ProductDto containing product details + multiple images
     * @return saved Product entity
     */
    Product addProduct(ProductDto dto);

    /**
     * Update an existing product. Allows updating metadata and images.
     * @param productId product identifier
     * @param dto updated product data
     * @return updated Product entity
     */
    Product updateProduct(Long productId, ProductDto dto);

    /**
     * Delete a product and its images from storage.
     * @param productId product identifier
     */
    void deleteProduct(Long productId);

    /**
     * Get product details by ID (with images in base64).
     * @param productId product identifier
     * @return product object
     */
    Product getProductById(Long productId);


    ResponseEntity<?> addGalleryImages(Gallery gallery);

    ResponseEntity<?> fetchGalleryImages();

    ResponseEntity<?> updateGalleryStatus(List<Gallery> galleries);

    void deleteGalleryImage(Long id);
}

