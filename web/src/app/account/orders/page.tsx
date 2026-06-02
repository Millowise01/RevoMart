'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else ordersApi.list().then((o) => setOrders(o as Order[]));
  }, [user, router]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Order History</h1>
      <div className="mt-8 space-y-4">
        {orders.map((o) => (
          <Link key={o.id} href={`/account/orders/${o.id}`} className="card block p-6 hover:shadow-md">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{o.orderNumber}</p>
                <p className="text-sm text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-700">{formatPrice(o.total)}</p>
                <span className="text-xs font-medium uppercase text-slate-500">{o.status}</span>
              </div>
            </div>
          </Link>
        ))}
        {!orders.length && <p className="text-slate-500">No orders yet.</p>}
      </div>
    </div>
  );
}
