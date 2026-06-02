'use client';

import Link from 'next/link';
import { Leaf, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-store';

const nav = [
  { href: '/products', label: 'Shop' },
  { href: '/products?condition=UPCYCLED', label: 'Upcycled' },
  { href: '/products?condition=REFURBISHED', label: 'Refurbished' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700">
          <Leaf className="h-7 w-7" />
          <span className="text-xl tracking-tight">RevoMart</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 hover:text-emerald-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/cart" className="relative rounded-lg p-2 hover:bg-slate-50">
            <ShoppingCart className="h-5 w-5 text-slate-700" />
          </Link>
          {user ? (
            <>
              {isAdmin() && (
                <Link href="/admin" className="btn-outline text-xs">
                  Admin
                </Link>
              )}
              <Link href="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">
                <User className="h-4 w-4" />
                {user.firstName}
              </Link>
              <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="btn-primary">
              Sign in
            </Link>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-100 px-4 py-4 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/cart" className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>
            Cart
          </Link>
          <Link href={user ? '/account' : '/auth/login'} className="block py-2 text-sm font-medium">
            {user ? 'Account' : 'Sign in'}
          </Link>
        </nav>
      )}
    </header>
  );
}
