'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, cartApi, ordersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { formatPrice } from '@/lib/utils';
import type { Cart } from '@/lib/types';

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Array<{ id: string; label: string; street: string; city: string }>>([]);
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MOBILE_MONEY');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    Promise.all([
      cartApi.get(),
      api<Array<{ id: string; label: string; street: string; city: string }>>('/addresses'),
    ]).then(([c, a]) => {
      setCart(c as Cart);
      setAddresses(a);
      if (a[0]) setAddressId(a[0].id);
    });
  }, [user, router]);

  async function placeOrder() {
    if (!addressId) {
      alert('Please add a delivery address in your account first.');
      return;
    }
    setLoading(true);
    try {
      const result = await ordersApi.create({ addressId, paymentMethod });
      const order = (result as { order: { id: string } }).order;
      if (paymentMethod === 'MOBILE_MONEY') {
        await api(`/payments/confirm/${order.id}`, {
          method: 'POST',
          body: JSON.stringify({ providerRef: `demo-${Date.now()}`, success: true }),
        });
      }
      router.push(`/account/orders/${order.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  if (!cart) return <p className="p-20 text-center">Loading...</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="card mt-8 space-y-6 p-6">
        <div>
          <label className="text-sm font-semibold">Delivery address</label>
          <select className="input mt-2" value={addressId} onChange={(e) => setAddressId(e.target.value)}>
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>{a.label} — {a.street}, {a.city}</option>
            ))}
          </select>
          {!addresses.length && (
            <p className="mt-2 text-sm text-amber-600">Add an address in your account settings first.</p>
          )}
        </div>
        <div>
          <label className="text-sm font-semibold">Payment method</label>
          <div className="mt-2 space-y-2">
            {[
              { value: 'MOBILE_MONEY', label: 'Mobile Money (MoMo)' },
              { value: 'CARD', label: 'Card Payment' },
              { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery' },
            ].map((m) => (
              <label key={m.value} className="flex items-center gap-2">
                <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
                {m.label}
              </label>
            ))}
          </div>
        </div>
        <div className="border-t pt-4">
          <p className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatPrice(cart.subtotal + 15)}</span>
          </p>
          <p className="text-xs text-slate-500">Includes estimated delivery fee</p>
        </div>
        <button onClick={placeOrder} className="btn-primary w-full" disabled={loading || !addressId}>
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
