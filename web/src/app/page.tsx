import Link from 'next/link';
import { ArrowRight, Leaf, Recycle, RefreshCw, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getFeatured(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

const conditions = [
  { icon: Sparkles, label: 'New', desc: 'Brand new sustainable products', href: '/products?condition=NEW', color: 'bg-blue-50 text-blue-700' },
  { icon: RefreshCw, label: 'Refurbished', desc: 'Restored & quality tested', href: '/products?condition=REFURBISHED', color: 'bg-purple-50 text-purple-700' },
  { icon: Recycle, label: 'Upcycled', desc: 'Creative reuse & craftsmanship', href: '/products?condition=UPCYCLED', color: 'bg-emerald-50 text-emerald-700' },
  { icon: Leaf, label: 'Used', desc: 'Pre-owned, inspected items', href: '/products?condition=USED', color: 'bg-amber-50 text-amber-700' },
];

export default async function HomePage() {
  const products = await getFeatured();

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-100">
              Sustainable Commerce
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Shop smarter. <br />Live greener.
            </h1>
            <p className="mt-6 text-lg text-emerald-50/90">
              RevoMart brings you new, used, refurbished, and upcycled products —
              all quality-checked for a trusted, eco-conscious shopping experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-emerald-700 hover:bg-emerald-50">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/products?condition=UPCYCLED" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-semibold hover:bg-white/10">
                Explore Upcycled
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold">Shop by Condition</h2>
        <p className="mt-2 text-center text-slate-600">Every product type, one trusted marketplace</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {conditions.map(({ icon: Icon, label, desc, href, color }) => (
            <Link key={label} href={href} className="card p-6 transition hover:shadow-md">
              <div className={`inline-flex rounded-xl p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">{label}</h3>
              <p className="mt-1 text-sm text-slate-600">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="mt-1 text-slate-600">Hand-picked sustainable finds</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-emerald-700 hover:underline">
              View all →
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
              Start the API and database to see products. Run: docker compose up -d && cd backend && npm run db:push && npm run db:seed
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="card grid gap-8 bg-emerald-50 p-8 md:grid-cols-3 md:p-12">
          {[
            { title: 'Quality Checked', desc: 'Every item inspected before listing' },
            { title: 'Mobile Money', desc: 'Pay securely with MoMo & more' },
            { title: 'Track Delivery', desc: 'Real-time order & delivery updates' },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="font-bold text-emerald-800">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
