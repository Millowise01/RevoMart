import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Star } from 'lucide-react';
import type { Product } from '@/lib/types';
import { conditionColor, conditionLabel, formatPrice, getProductImage } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const price = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice != null;

  return (
    <Link href={`/products/${product.slug}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Image
          src={getProductImage(product)}
          alt={product.name}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${conditionColor(product.condition)}`}>
          {conditionLabel(product.condition)}
        </span>
        {product.isEcoCertified && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs font-medium text-white">
            <Leaf className="h-3 w-3" /> Eco
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-emerald-700">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-emerald-700">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          {product.averageRating != null && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {product.averageRating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Leaf className="h-3.5 w-3.5 text-emerald-500" />
            {product.sustainabilityScore}% sustainable
          </span>
        </div>
      </div>
    </Link>
  );
}
