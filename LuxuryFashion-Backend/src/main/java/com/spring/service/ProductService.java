package com.spring.service;

import com.spring.model.Gallery;
import com.spring.model.Product;
import com.spring.repo.GalleryRepository;
import com.spring.repo.ProductRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ProductService {

    @Value("${product.picture.path}")
    private String productPicturePath;

    private final ProductRepository productRepository;
    private final GalleryRepository galleryRepository;
    private final GoogleCloudStorageService gcsService;

    public ProductService(ProductRepository productRepository, GalleryRepository galleryRepository, GoogleCloudStorageService gcsService) {
        this.productRepository = productRepository;
        this.galleryRepository = galleryRepository;
        this.gcsService = gcsService;
    }


    @Transactional(readOnly = true)
    public List<Product> fetchAllProducts() {
        List<Product> products = productRepository.findByProdStatus("active");

        // Images are now stored as GCS URLs, so we can return them directly
        // If any old local file paths exist, convert them to URLs
        for (Product product : products) {
            // Force initialize ALL lazy collections while session is still open
            try {
                // Initialize all lazy collections
                Hibernate.initialize(product.getImagenames());
                Hibernate.initialize(product.getSizes());
                Hibernate.initialize(product.getReservedSizes());
                
                // Now safely access the imagenames collection
                List<String> imagenames = product.getImagenames();
                if (imagenames != null && !imagenames.isEmpty()) {
                    List<String> imageUrls = new ArrayList<>();

                    for (String imageNameOrUrl : imagenames) {
                        if (imageNameOrUrl == null || imageNameOrUrl.isEmpty()) {
                            continue;
                        }
                        
                        // If it's already a URL (starts with http), use it directly
                        if (imageNameOrUrl.startsWith("http://") || imageNameOrUrl.startsWith("https://")) {
                            imageUrls.add(imageNameOrUrl);
                        } else {
                            // Legacy: If it's a filename, try to get URL from GCS
                            String url = gcsService.getPublicUrl("products/" + imageNameOrUrl);
                            if (url != null) {
                                imageUrls.add(url);
                            }
                        }
                    }
                    
                    product.setImagenames(imageUrls);
                }
            } catch (Exception e) {
                // If collection is null or can't be initialized, skip
                System.err.println("Failed to initialize collections for product " + product.getProd_id() + ": " + e.getMessage());
            }
        }

        return products;
    }


    public ResponseEntity<?> getGallery() {
        try {
            List<Gallery> gallery = galleryRepository.findByActiveTrue();
            return ResponseEntity.ok(gallery);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to fetch gallery",
                            "message", e.getMessage()
                    ));
        }
    }
}
