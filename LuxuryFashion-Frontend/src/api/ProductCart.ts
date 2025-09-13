export interface ProductDTO {
    prod_name: string;
    prod_description: string;
    prod_price: number;
    prod_quantity: number;
    prod_image: string;
    prod_category: string;
    prod_tag: string;
    prod_gender: string;
    prod_status: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: 'hero' | 'gallery' | 'banner';
  active: boolean;
}