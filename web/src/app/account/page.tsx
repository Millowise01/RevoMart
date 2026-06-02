'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Package, MapPin, Bell, RotateCcw } from 'lucide-react';

const links = [
  { href: '/account/orders', label: 'Order History', icon: Package },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/notifications', label: 'Notifications', icon: Bell },
  { href: '/account/returns', label: 'Returns', icon: RotateCcw },
];

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Hello, {user.firstName}</h1>
      <p className="text-slate-600">{user.email}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="card flex items-center gap-4 p-6 hover:shadow-md">
            <Icon className="h-8 w-8 text-emerald-600" />
            <span className="font-semibold">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
