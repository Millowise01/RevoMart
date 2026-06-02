'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Circle, Package, MapPin, CreditCard } from 'lucide-react';
import { ordersApi, api } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';
import { Skeleton } from '@/components/ui/Skeleton';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useToast } from '@/components/ui/Toast';

const STATUS_COLORS: Record<string, string> = {
  PENDING:          'bg-slate-100 text-slate-600',
  PAYMENT_PENDING:  'bg-amber-100 text-amber-700',
  PAID:             'bg-blue-100 text-blue-700',
  PROCESSING:       'bg-blue-100 text-blue-700',
  SHIPPED:          'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED:        'bg-emerald-100 text-emerald-700',
  COMPLETED:        'bg-emerald-100 text-emerald-700',
  CANCELLED:        'bg-red-100 text-red-700',
  REFUNDED:         'bg-slate-100 text-slate-600',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (id) {
      ordersApi
        .get(id)
        .then((o) => setOrder(o as Order))
        .catch(() => toast('error', 'Failed to load order'))
        .finally(() => setLoading(false));
    }
  }, [user, id, router]); // eslint-disable-line react-hooks/exhaustive-deps

  async function requestReturn() {
    const reason = prompt('Please describe the reason for your return:');
    if (!reason?.trim()) return;
    setReturning(true);
    try {
      await api(`/returns`, {
        method: 'POST',
        body: JSON.stringify({ orderId: id, reason }),
      });
      toast('success', 'Return request submitted successfully');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to submit return');
    } finally {
      setReturning(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="mb-6 h-4 w-64" />
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-slate-500">Order not found.</p>
        <Link href="/account/orders" className="mt-4 inline-block text-emerald-700 hover:underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const canReturn = ['DELIVERED', 'COMPLETED'].includes(order.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Orders', href: '/account/orders' },
          { label: order.orderNumber },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Placed{' '}
            {new Date(order.createdAt).toLocaleDateString('en-GH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-600'
          }`}
        >
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Order items */}
      <div className="card mt-8 p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <Package className="h-4 w-4 text-emerald-600" />
          Items ordered
        </h2>
        <ul className="mt-4 divide-y divide-slate-50">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span className="text-slate-700">
                {item.name}{' '}
                <span className="text-slate-400">× {item.quantity}</span>
              </span>
              <span className="font-semibold">{formatPrice(item.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Delivery</span>
            <span>{formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-emerald-700">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment + address info */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {order.payment && (
          <div className="card p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Payment
            </p>
            <p className="mt-2 text-slate-500">{order.payment.method.replace(/_/g, ' ')}</p>
            <p className={`mt-1 font-medium ${order.payment.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {order.payment.status}
            </p>
          </div>
        )}
        <div className="card p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Delivery address
          </p>
          <p className="mt-2 text-slate-500">See account addresses</p>
        </div>
      </div>

      {/* Delivery tracking timeline */}
      {order.deliveryEvents && order.deliveryEvents.length > 0 && (
        <div className="card mt-6 p-6">
          <h2 className="font-semibold">Delivery Tracking</h2>
          <ol className="mt-5 space-y-5">
            {order.deliveryEvents.map((e, i) => {
              const isLatest = i === order.deliveryEvents!.length - 1;
              return (
                <li key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {isLatest ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                    {i < order.deliveryEvents!.length - 1 && (
                      <div className="mt-1 h-full w-0.5 flex-1 bg-slate-100" />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className={`text-sm font-semibold ${isLatest ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {e.status.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-slate-500">{e.description}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(e.occurredAt).toLocaleString('en-GH')}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Return request */}
      {canReturn && (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-4 text-center">
          <p className="text-sm text-slate-500">Not satisfied? You can request a return within 14 days.</p>
          <button
            onClick={requestReturn}
            disabled={returning}
            className="btn-outline mt-3 text-sm"
          >
            {returning ? 'Submitting…' : 'Request Return'}
          </button>
        </div>
      )}
    </div>
  );
}
