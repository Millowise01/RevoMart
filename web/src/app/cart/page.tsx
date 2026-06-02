'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cartApi } from '@/lib/api';
import type { Cart } from '@/lib/types';
import { formatPrice, getProductImage } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    cartApi.get().then((c) => setCart(c as Cart)).finally(() => setLoading(false));
  }, [user, router]);

  async function updateQty(productId: string, quantity: number) {
    const updated = await cartApi.update(productId, quantity);
    setCart(updated as Cart);
  }

  if (loading) return <p className="p-20 text-center">Loading cart...</p>;
  if (!cart?.items?.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/products" className="btn-primary mt-6 inline-block">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>
      <div className="mt-8 space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="card flex gap-4 p-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50">
              <Image src={getProductImage(item.product)} alt="" fill className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="text-emerald-700 font-bold">
                  {formatPrice(item.product.discountPrice ?? item.product.price)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="rounded border px-2">−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="rounded border px-2">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card mt-8 p-6">
        <div className="flex justify-between text-lg font-bold">
          <span>Subtotal</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        <Link href="/checkout" className="btn-primary mt-6 block w-full text-center">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
