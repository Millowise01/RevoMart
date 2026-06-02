'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

interface Address {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  region: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    region: '',
    deliveryZone: 'ACC-CENTRAL',
  });

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else api<Address[]>('/addresses').then(setAddresses);
  }, [user, router]);

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    await api('/addresses', { method: 'POST', body: JSON.stringify({ ...form, isDefault: true }) });
    setAddresses(await api<Address[]>('/addresses'));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Delivery Addresses</h1>
      <ul className="mt-6 space-y-3">
        {addresses.map((a) => (
          <li key={a.id} className="card p-4">
            <p className="font-semibold">{a.label} {a.isDefault && <span className="text-xs text-emerald-600">(default)</span>}</p>
            <p className="text-sm text-slate-600">{a.fullName} — {a.street}, {a.city}, {a.region}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={addAddress} className="card mt-8 space-y-3 p-6">
        <h2 className="font-semibold">Add new address</h2>
        {(['label', 'fullName', 'phone', 'street', 'city', 'region'] as const).map((f) => (
          <input key={f} className="input" placeholder={f} required value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
        ))}
        <button className="btn-primary">Save address</button>
      </form>
    </div>
  );
}
