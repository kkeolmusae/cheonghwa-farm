export interface Category {
  id: number;
  name: string;
  sort_order: number;
}

export interface ProductOption {
  id?: number;
  name: string;
  price: number;
  stock_quantity: number;
  stock_threshold?: number;
  sort_order: number;
  is_active?: boolean;
}

export interface ProductImage {
  id?: number;
  image_url: string;
  thumbnail_url: string | null;
  is_primary?: boolean;
  sort_order: number;
}

export type ProductStatus = '판매 예정' | '판매 중' | '품절' | '판매 종료';

export interface Product {
  id: number;
  name: string;
  description: string;
  category_id: number;
  category?: Category;
  status: ProductStatus;
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
  name: string;
  category_id: number;
  category?: Category;
  status: ProductStatus;
  harvest_start: string | null;
  harvest_end: string | null;
  options: ProductOption[];
  primary_image: ProductImage | null;
  created_at: string;
}

export interface ProductImageCreate {
  image_url: string;
  thumbnail_url: string | null;
  sort_order: number;
}

export interface ProductCreate {
  name: string;
  description: string;
  category_id: number;
  status: ProductStatus;
  harvest_start?: string | null;
  harvest_end?: string | null;
  sale_start?: string | null;
  sale_end?: string | null;
  options: Omit<ProductOption, 'id'>[];
  images: ProductImageCreate[];
}

export interface ProductUpdate extends Partial<ProductCreate> {}

export interface ProductStatusUpdate {
  status: ProductStatus;
}
