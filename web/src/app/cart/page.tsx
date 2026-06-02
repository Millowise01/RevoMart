'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { cartApi } from '@/lib/api';
import type { Cart } from '@/lib/types';
import { formatPrice, getProductImage } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { CartItemSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    cartApi
      .get()
      .then((c) => setCart(c as Cart))
      .catch(() => toast('error', 'Failed to load cart'))
      .finally(() => setLoading(false));
  }, [user, router]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateQty(productId: string, quantity: number) {
    if (!cart) return;

    // Optimistic update
    const prev = cart;
    if (quantity <= 0) {
      setCart({
        ...cart,
        items: cart.items.filter((i) => i.productId !== productId),
        itemCount: cart.itemCount - 1,
        subtotal: cart.items
          .filter((i) => i.productId !== productId)
          .reduce((s, i) => s + Number(i.product.discountPrice ?? i.product.price) * i.quantity, 0),
      });
    } else {
      setCart({
        ...cart,
        items: cart.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        ),
      });
    }

    setUpdating(productId);
    try {
      const updated = await cartApi.update(productId, quantity);
      setCart(updated as Cart);
    } catch (err) {
      setCart(prev); // rollback
      toast('error', err instanceof Error ? err.message : 'Failed to update cart');
    } finally {
      setUpdating(null);
    }
  }

  async function removeItem(productId: string) {
    if (!cart) return;
    const prev = cart;
    setCart({
      ...cart,
      items: cart.items.filter((i) => i.productId !== productId),
      itemCount: cart.itemCount - 1,
    });
    try {
      const updated = await cartApi.remove(productId);
      setCart(updated as Cart);
      toast('info', 'Item removed from cart');
    } catch {
      setCart(prev);
      toast('error', 'Failed to remove item');
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <CartItemSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-2xl font-bold">Shopping Cart</h1>
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="Your cart is empty"
          description="Browse our sustainable products and add something you love."
          action={{ label: 'Continue Shopping', href: '/products' }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">
        Shopping Cart{' '}
        <span className="text-base font-normal text-slate-500">
          ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
        </span>
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Items list */}
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => {
            const itemPrice = item.product.discountPrice ?? item.product.price;
            const isUpdating = updating === item.productId;
            return (
              <div
                key={item.id}
                className={`card flex gap-4 p-4 transition ${isUpdating ? 'opacity-60' : ''}`}
              >
                <Link
                  href={`/products/${(item.product as { slug?: string }).slug ?? ''}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50"
                >
                  <Image
                    src={getProductImage(item.product)}
                    alt={item.product.name}
                    fill
                    className="object-cover transition hover:scale-105"
                    sizes="96px"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${(item.product as { slug?: string }).slug ?? ''}`}
                      className="font-semibold hover:text-emerald-700"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label="Remove item"
                      className="shrink-0 rounded p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-slate-200">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        disabled={isUpdating}
                        aria-label="Decrease quantity"
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        disabled={isUpdating}
                        aria-label="Increase quantity"
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-emerald-700">
                      {formatPrice(Number(itemPrice) * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="font-semibold">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="text-emerald-600">Calculated at checkout</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t pt-4 font-bold">
              <span>Subtotal</span>
              <span className="text-emerald-700">{formatPrice(cart.subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="btn-primary mt-5 block w-full text-center"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/products"
              className="mt-3 block text-center text-sm text-slate-500 hover:text-emerald-700"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
