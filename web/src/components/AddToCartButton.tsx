'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { cartApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/utils';

interface Props {
  productId: string;
  disabled?: boolean;
  productName?: string;
}

export function AddToCartButton({ productId, disabled, productName }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleAdd() {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setLoading(true);
    try {
      await cartApi.add(productId);
      setDone(true);
      toast('success', productName ? `"${productName}" added to cart` : 'Added to cart');
      setTimeout(() => setDone(false), 2500);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled || loading}
      className="btn-primary mt-6 flex w-full gap-2 sm:w-auto"
    >
      {done ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {done ? 'Added!' : loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}

/** Sticky bottom bar shown on mobile product detail pages */
export function StickyCartBar({
  productId,
  productName,
  price,
  disabled,
}: {
  productId: string;
  productName: string;
  price: string | number;
  disabled?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleAdd() {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setLoading(true);
    try {
      await cartApi.add(productId);
      setDone(true);
      toast('success', `"${productName}" added to cart`);
      setTimeout(() => setDone(false), 2500);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-4">
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold text-slate-800">{productName}</p>
          <p className="text-sm font-bold text-emerald-700">{formatPrice(price)}</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={disabled || loading}
          className="btn-primary shrink-0 gap-2"
        >
          {done ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          {done ? 'Added!' : loading ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
