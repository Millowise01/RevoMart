'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { cartApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
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
      setTimeout(() => setDone(false), 2000);
    } catch {
      alert('Failed to add to cart');
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
      <ShoppingCart className="h-4 w-4" />
      {done ? 'Added!' : loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
