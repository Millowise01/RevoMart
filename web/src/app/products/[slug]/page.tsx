import Link from 'next/link';
import { Leaf, Star } from 'lucide-react';
import { AddToCartButton, StickyCartBar } from '@/components/AddToCartButton';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import type { Product } from '@/lib/types';
import { conditionColor, conditionLabel, formatPrice } from '@/lib/utils';

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found — RevoMart' };
  return {
    title: `${product.name} — RevoMart`,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images?.[0] ? [product.images[0].url] : [] },
  };
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
  const hasDiscount = product.discountPrice != null;
  const outOfStock = product.stockQuantity < 1;

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/products' },
    ...(product.category
      ? [{ label: product.category.name, href: `/products?categorySlug=${product.category.slug}` }]
      : []),
    { label: product.name },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8 lg:pb-10">
        <Breadcrumb crumbs={crumbs} />

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image gallery */}
          <ImageGallery images={product.images ?? []} name={product.name} />

          {/* Product info */}
          <div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${conditionColor(product.condition)}`}
            >
              {conditionLabel(product.condition)}
            </span>

            <h1 className="mt-3 text-3xl font-bold leading-tight">{product.name}</h1>

            {product.averageRating != null && (
              <div className="mt-2 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.round(product.averageRating!)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm text-slate-500">
                  {product.averageRating.toFixed(1)}
                </span>
              </div>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-emerald-700">{formatPrice(price)}</span>
              {hasDiscount && (
                <span className="text-lg text-slate-400 line-through">{formatPrice(product.price)}</span>
              )}
              {hasDiscount && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  Sale
                </span>
              )}
            </div>

            <p className="mt-6 leading-relaxed text-slate-600">{product.description}</p>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/products?tag=${tag}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Sustainability */}
            <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-emerald-800">
                <Leaf className="h-4 w-4" />
                Sustainability score: {product.sustainabilityScore}%
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-emerald-100">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${product.sustainabilityScore}%` }}
                />
              </div>
              <div className="mt-3 grid gap-1 text-slate-600">
                {product.carbonSavedKg && (
                  <p>🌍 Carbon saved: {product.carbonSavedKg} kg CO₂</p>
                )}
                {product.recycledContentPercent != null && product.recycledContentPercent > 0 && (
                  <p>♻️ Recycled content: {product.recycledContentPercent}%</p>
                )}
                {product.isEcoCertified && (
                  <p className="font-medium text-emerald-700">✓ Eco certified</p>
                )}
              </div>
            </div>

            {/* Stock */}
            <p className={`mt-4 text-sm font-medium ${outOfStock ? 'text-red-500' : 'text-slate-500'}`}>
              {outOfStock
                ? 'Out of stock'
                : product.stockQuantity <= 5
                  ? `Only ${product.stockQuantity} left in stock`
                  : `${product.stockQuantity} in stock`}
            </p>

            {/* Desktop add-to-cart */}
            <div className="hidden lg:block">
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                disabled={outOfStock}
              />
            </div>
          </div>
        </div>

        {/* Reviews section placeholder */}
        {(product as Product & { reviews?: unknown[] }).reviews &&
          ((product as Product & { reviews?: unknown[] }).reviews!.length > 0) && (
          <div className="mt-16">
            <h2 className="text-xl font-bold">Customer Reviews</h2>
            <div className="mt-6 space-y-4">
              {((product as Product & { reviews?: Array<{
                id: string; rating: number; title?: string; comment?: string;
                user: { firstName: string; lastName: string };
                createdAt: string;
              }> }).reviews ?? []).map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {r.user.firstName} {r.user.lastName}
                    </span>
                    <span className="ml-auto text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                  {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky mobile cart bar */}
      <StickyCartBar
        productId={product.id}
        productName={product.name}
        price={price}
        disabled={outOfStock}
      />
    </>
  );
}
