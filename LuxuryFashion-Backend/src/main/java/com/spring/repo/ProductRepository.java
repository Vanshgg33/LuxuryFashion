package com.spring.repo;

import com.spring.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByProdStatus(String status);
//    List<Product> findByProdCategoryAndProdStatus(String prodCategory, String prodStatus);

    @Query("SELECT p FROM Product p WHERE p.prod_gender = :gender AND p.prodStatus = :status")
    List<Product> findByGenderAndStatus(@Param("gender") String gender, @Param("status") String status);

    @Query("SELECT p FROM Product p WHERE LOWER(p.prod_category) = LOWER(:category) AND p.prodStatus = :status")
    List<Product> findByCategoryAndStatus(@Param("category") String category, @Param("status") String status);


@Query("SELECT p FROM Product p WHERE LOWER(p.prod_tag) = LOWER(:tag) AND p.prodStatus = :status")
 List<Product> findByTagAndStatus(@Param("tag") String tag, @Param("status") String status);

    @Query("""
    SELECT p FROM Product p
    WHERE p.prodStatus = 'ACTIVE'
      AND (
           LOWER(p.prod_name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(p.prod_description) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(p.prod_category) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(p.prod_tag) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(p.prod_brand) LIKE LOWER(CONCAT('%', :keyword, '%'))
      )
""")
    List<Product> searchActiveProducts(@Param("keyword") String keyword);



}

