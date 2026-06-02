'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const conditions = [
  { value: '', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'USED', label: 'Used' },
  { value: 'REFURBISHED', label: 'Refurbished' },
  { value: 'UPCYCLED', label: 'Upcycled' },
];

export function ProductFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/products?${next}`);
  }

  return (
    <div className="card space-y-6 p-6">
      <div>
        <label className="text-sm font-semibold">Search</label>
        <input
          className="input mt-2"
          placeholder="Search products..."
          defaultValue={params.get('search') ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') update('search', (e.target as HTMLInputElement).value);
          }}
        />
      </div>
      <div>
        <label className="text-sm font-semibold">Condition</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {conditions.map((c) => (
            <button
              key={c.value}
              onClick={() => update('condition', c.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                (params.get('condition') ?? '') === c.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold">Sort by</label>
        <select
          className="input mt-2"
          value={params.get('sortBy') ?? 'createdAt'}
          onChange={(e) => update('sortBy', e.target.value)}
        >
          <option value="createdAt">Newest</option>
          <option value="price">Price</option>
          <option value="name">Name</option>
          <option value="sustainabilityScore">Sustainability</option>
        </select>
      </div>
    </div>
  );
}
