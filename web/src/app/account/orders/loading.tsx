import { OrderListSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 h-4 w-64 animate-pulse rounded bg-slate-200" />
      <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="mb-8 h-4 w-36 animate-pulse rounded bg-slate-200" />
      <OrderListSkeleton count={4} />
    </div>
  );
}
