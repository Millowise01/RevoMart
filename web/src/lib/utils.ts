import type { ProductCondition } from './types';

export function formatPrice(value: string | number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export function conditionLabel(c: ProductCondition) {
  const labels: Record<ProductCondition, string> = {
    NEW: 'New',
    USED: 'Used',
    REFURBISHED: 'Refurbished',
    UPCYCLED: 'Upcycled',
  };
  return labels[c];
}

export function conditionColor(c: ProductCondition) {
  const colors: Record<ProductCondition, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    USED: 'bg-amber-100 text-amber-800',
    REFURBISHED: 'bg-purple-100 text-purple-800',
    UPCYCLED: 'bg-emerald-100 text-emerald-800',
  };
  return colors[c];
}

export function getProductImage(product: {
  images?: { url: string }[];
}) {
  return product.images?.[0]?.url || '/placeholder-product.svg';
}
