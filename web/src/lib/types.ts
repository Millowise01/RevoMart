export type ProductCondition = 'NEW' | 'USED' | 'REFURBISHED' | 'UPCYCLED';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  discountPrice?: string | number | null;
  condition: ProductCondition;
  stockQuantity: number;
  tags: string[];
  sustainabilityScore: number;
  carbonSavedKg?: string | number | null;
  recycledContentPercent?: number | null;
  isEcoCertified: boolean;
  images: { url: string; altText?: string; isPrimary: boolean }[];
  category?: { id: string; name: string; slug: string };
  averageRating?: number | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  children?: Category[];
  _count?: { products: number };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product & { images: { url: string }[] };
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string | number;
  subtotal: string | number;
  deliveryFee: string | number;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: string | number;
    condition: ProductCondition;
  }>;
  payment?: { method: string; status: string };
  deliveryEvents?: Array<{
    status: string;
    description: string;
    occurredAt: string;
  }>;
}
