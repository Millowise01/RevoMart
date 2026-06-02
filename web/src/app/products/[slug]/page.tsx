import Image from 'next/image';
import Link from 'next/link';
import { Leaf, Star } from 'lucide-react';
import { AddToCartButton } from '@/components/AddToCartButton';
import type { Product } from '@/lib/types';
import { conditionColor, conditionLabel, formatPrice, getProductImage } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/products" className="mt-4 inline-block text-emerald-700 hover:underline">
          ← Back to shop
        </Link>
      </div>
    );
  }

  const price = product.discountPrice ?? product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
          <Image
            src={getProductImage(product)}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${conditionColor(product.condition)}`}>
            {conditionLabel(product.condition)}
          </span>
          <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>
          {product.averageRating != null && (
            <p className="mt-2 flex items-center gap-1 text-sm text-slate-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {product.averageRating.toFixed(1)} rating
            </p>
          )}
          <p className="mt-4 text-3xl font-bold text-emerald-700">{formatPrice(price)}</p>
          {product.discountPrice && (
            <p className="text-lg text-slate-400 line-through">{formatPrice(product.price)}</p>
          )}
          <p className="mt-6 leading-relaxed text-slate-600">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-3 rounded-xl bg-emerald-50 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium text-emerald-800">
              <Leaf className="h-4 w-4" /> Sustainability score: {product.sustainabilityScore}%
            </p>
            {product.carbonSavedKg && (
              <p>Carbon saved: {product.carbonSavedKg} kg CO₂</p>
            )}
            {product.recycledContentPercent != null && (
              <p>Recycled content: {product.recycledContentPercent}%</p>
            )}
          </div>

          <p className="mt-4 text-sm text-slate-500">
            {product.stockQuantity > 0
              ? `${product.stockQuantity} in stock`
              : 'Out of stock'}
          </p>

          <AddToCartButton productId={product.id} disabled={product.stockQuantity < 1} />
        </div>
      </div>
    </div>
  );
}
