'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface Dashboard {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    user: { firstName: string; lastName: string };
  }>;
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Dashboard | null>(null);

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (!isAdmin()) router.push('/');
    else adminApi.dashboard().then((d) => setStats(d as Dashboard));
  }, [user, isAdmin, router]);

  if (!stats) return <p className="p-20 text-center">Loading dashboard...</p>;

  const cards = [
    { label: 'Revenue', value: formatPrice(stats.totalRevenue) },
    { label: 'Orders', value: stats.totalOrders },
    { label: 'Products', value: stats.totalProducts },
    { label: 'Customers', value: stats.totalCustomers },
    { label: 'Pending', value: stats.pendingOrders },
    { label: 'Low Stock', value: stats.lowStockProducts },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/orders" className="btn-outline">Orders</Link>
          <Link href="/admin/products" className="btn-outline">Products</Link>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-6">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="card mt-8 p-6">
        <h2 className="font-semibold">Recent Orders</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="pb-2">Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-slate-50">
                <td className="py-3">{o.orderNumber}</td>
                <td>{o.user.firstName} {o.user.lastName}</td>
                <td>{formatPrice(o.total)}</td>
                <td className="uppercase text-xs">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
