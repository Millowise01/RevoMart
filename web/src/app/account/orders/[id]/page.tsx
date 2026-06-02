'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (id) ordersApi.get(id).then((o) => setOrder(o as Order));
  }, [user, id, router]);

  if (!order) return <p className="p-20 text-center">Loading...</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
      <p className="mt-1 text-sm text-slate-500">Status: <span className="font-semibold uppercase">{order.status}</span></p>

      <div className="card mt-8 p-6">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-4 space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t pt-4 font-bold">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </p>
      </div>

      {order.deliveryEvents && order.deliveryEvents.length > 0 && (
        <div className="card mt-6 p-6">
          <h2 className="font-semibold">Delivery Tracking</h2>
          <ol className="mt-4 space-y-4 border-l-2 border-emerald-200 pl-4">
            {order.deliveryEvents.map((e, i) => (
              <li key={i}>
                <p className="font-medium">{e.status}</p>
                <p className="text-sm text-slate-600">{e.description}</p>
                <p className="text-xs text-slate-400">{new Date(e.occurredAt).toLocaleString()}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
