package com.spring.dto;

import com.spring.model.Gallery;
import com.spring.model.Product;
import lombok.Data;

import java.util.List;

@Data
public class ShopPageDto {

  private  List<Product> products;
 private    Gallery gallery;
}
