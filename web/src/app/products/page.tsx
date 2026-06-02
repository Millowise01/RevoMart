import { ProductCard } from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import type { Product } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getProducts(searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => v && params.set(k, v));
  try {
    const res = await fetch(`${API_URL}/products?${params}`, { next: { revalidate: 30 } });
    if (!res.ok) return { items: [], meta: { total: 0 } };
    return res.json();
  } catch {
    return { items: [], meta: { total: 0 } };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const data = await getProducts(sp);
  const products = (data.items ?? []) as Product[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Shop All Products</h1>
      <p className="mt-2 text-slate-600">{data.meta?.total ?? 0} products found</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <ProductFilters />
        </aside>
        <div className="lg:col-span-3">
          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed p-12 text-center text-slate-500">
              No products match your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
