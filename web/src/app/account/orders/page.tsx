'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { OrderListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

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

const STATUS_LABELS: Record<string, string> = {
  PENDING:          'Pending',
  PAYMENT_PENDING:  'Awaiting Payment',
  PAID:             'Paid',
  PROCESSING:       'Processing',
  SHIPPED:          'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED:        'Delivered',
  COMPLETED:        'Completed',
  CANCELLED:        'Cancelled',
  REFUNDED:         'Refunded',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    ordersApi
      .list()
      .then((o) => setOrders(o as Order[]))
      .finally(() => setLoading(false));
  }, [user, router]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Order History' },
        ]}
      />

      <h1 className="text-2xl font-bold">Order History</h1>
      <p className="mt-1 text-sm text-slate-500">Track and manage all your orders</p>

      <div className="mt-8">
        {loading ? (
          <OrderListSkeleton count={4} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="No orders yet"
            description="When you place an order it will appear here."
            action={{ label: 'Start Shopping', href: '/products' }}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/account/orders/${o.id}`}
                className="card flex items-center gap-4 p-5 transition hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                  <Package className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString('en-GH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' · '}
                    {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-bold text-emerald-700">{formatPrice(o.total)}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      STATUS_COLORS[o.status] ?? 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
