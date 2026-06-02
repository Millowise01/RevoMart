'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, CreditCard, Banknote, MapPin, Plus } from 'lucide-react';
import { api, cartApi, ordersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { formatPrice } from '@/lib/utils';
import type { Cart } from '@/lib/types';
import { CheckoutStepper } from '@/components/ui/CheckoutStepper';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';

const STEPS = [
  { label: 'Delivery' },
  { label: 'Payment' },
  { label: 'Review' },
  { label: 'Confirm' },
];

const PAYMENT_METHODS = [
  { value: 'MOBILE_MONEY', label: 'Mobile Money (MoMo)', icon: Smartphone, desc: 'Pay with MTN, Vodafone or AirtelTigo MoMo' },
  { value: 'CARD', label: 'Card Payment', icon: CreditCard, desc: 'Visa, Mastercard accepted' },
  { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when your order arrives' },
];

type Address = { id: string; label: string; street: string; city: string; region: string };

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MOBILE_MONEY');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    Promise.all([cartApi.get(), api<Address[]>('/addresses')])
      .then(([c, a]) => {
        setCart(c as Cart);
        setAddresses(a);
        if (a[0]) setAddressId(a[0].id);
      })
      .catch(() => toast('error', 'Failed to load checkout data'))
      .finally(() => setLoading(false));
  }, [user, router]); // eslint-disable-line react-hooks/exhaustive-deps

  async function placeOrder() {
    if (!addressId) {
      toast('error', 'Please select a delivery address.');
      return;
    }
    setPlacing(true);
    try {
      const result = await ordersApi.create({ addressId, paymentMethod });
      const order = (result as { order: { id: string } }).order;
      if (paymentMethod === 'MOBILE_MONEY') {
        await api(`/payments/confirm/${order.id}`, {
          method: 'POST',
          body: JSON.stringify({ providerRef: `demo-${Date.now()}`, success: true }),
        });
      }
      setStep(3);
      toast('success', 'Order placed successfully!');
      setTimeout(() => router.push(`/account/orders/${order.id}`), 1500);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="mb-8 h-12 w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const deliveryFee = 15;
  const total = (cart?.subtotal ?? 0) + deliveryFee;
  const selectedAddress = addresses.find((a) => a.id === addressId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <CheckoutStepper steps={STEPS} current={step} />

      {/* Step 0 — Delivery address */}
      {step === 0 && (
        <div className="card space-y-4 p-6">
          <h2 className="font-semibold">Select delivery address</h2>
          {addresses.length === 0 ? (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
              No saved addresses.{' '}
              <a href="/account/addresses" className="font-semibold underline">
                Add one here
              </a>{' '}
              before checking out.
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                    addressId === a.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={a.id}
                    checked={addressId === a.id}
                    onChange={() => setAddressId(a.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-semibold">{a.label}</p>
                    <p className="text-sm text-slate-500">
                      {a.street}, {a.city}, {a.region}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
          <a
            href="/account/addresses"
            className="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
          >
            <Plus className="h-4 w-4" /> Add new address
          </a>
          <button
            onClick={() => setStep(1)}
            disabled={!addressId}
            className="btn-primary w-full"
          >
            Continue to Payment
          </button>
        </div>
      )}

      {/* Step 1 — Payment method */}
      {step === 1 && (
        <div className="card space-y-4 p-6">
          <h2 className="font-semibold">Select payment method</h2>
          <div className="space-y-3">
            {PAYMENT_METHODS.map(({ value, label, icon: Icon, desc }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                  paymentMethod === value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={value}
                  checked={paymentMethod === value}
                  onChange={() => setPaymentMethod(value)}
                  className="mt-0.5"
                />
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-outline flex-1">
              Back
            </button>
            <button onClick={() => setStep(2)} className="btn-primary flex-1">
              Review Order
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Review */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold">Order review</h2>

            <div className="mt-4 space-y-2 text-sm">
              {cart?.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.product.name}{' '}
                    <span className="text-slate-400">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">
                    {formatPrice(
                      Number(item.product.discountPrice ?? item.product.price) * item.quantity,
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1 border-t pt-4 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatPrice(cart?.subtotal ?? 0)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-emerald-700">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>
                  {selectedAddress
                    ? `${selectedAddress.label} — ${selectedAddress.street}, ${selectedAddress.city}`
                    : '—'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const m = PAYMENT_METHODS.find((p) => p.value === paymentMethod);
                  if (!m) return null;
                  const Icon = m.icon;
                  return (
                    <>
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span>{m.label}</span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline flex-1">
              Back
            </button>
            <button
              onClick={placeOrder}
              disabled={placing}
              className="btn-primary flex-1"
            >
              {placing ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Confirmed */}
      {step === 3 && (
        <div className="card flex flex-col items-center p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-emerald-700">Order Confirmed!</h2>
          <p className="mt-2 text-slate-600">Redirecting to your order details…</p>
        </div>
      )}
    </div>
  );
}
