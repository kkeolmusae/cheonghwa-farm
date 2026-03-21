export interface Category {
  id: number;
  name: string;
  sort_order: number;
}

export interface ProductOption {
  id: number;
  product_id: number;
  name: string;
  price: number;
  stock_quantity: number;
  stock_threshold: number;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  thumbnail_url: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  category: Category;
  name: string;
  description: string;
  status: string;
  harvest_start: string | null;
  harvest_end: string | null;
  sale_start: string | null;
  sale_end: string | null;
  options: ProductOption[];
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductListItem {
  id: number;
  category_id: number;
  category: Category;
  name: string;
  status: string;
  harvest_start: string | null;
  harvest_end: string | null;
  options: ProductOption[];
  primary_image: ProductImage | null;
  created_at: string;
}
