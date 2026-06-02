import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-100 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <Leaf className="h-6 w-6 text-emerald-400" />
            RevoMart
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed">
            Sustainable commerce for new, used, refurbished, and upcycled products.
            Building trust through quality control and eco-conscious shopping.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-emerald-400">All Products</Link></li>
            <li><Link href="/products?condition=UPCYCLED" className="hover:text-emerald-400">Upcycled</Link></li>
            <li><Link href="/products?condition=REFURBISHED" className="hover:text-emerald-400">Refurbished</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Support</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/contact" className="hover:text-emerald-400">Contact</Link></li>
            <li><Link href="/support" className="hover:text-emerald-400">Help Center</Link></li>
            <li><Link href="/account/orders" className="hover:text-emerald-400">Track Order</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} RevoMart. All rights reserved.
      </div>
    </footer>
  );
}
