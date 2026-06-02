import { ProductGridSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="mb-8 h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-8 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        </div>
        <div className="lg:col-span-3">
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
