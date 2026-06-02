'use client';

import { useCallback } from 'react';
import { create } from 'zustand';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  add: (type: ToastType, message: string) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      4000,
    );
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function useToast() {
  const add = useToastStore((s) => s.add);
  return useCallback((type: ToastType, message: string) => add(type, message), [add]);
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />,
  error:   <XCircle    className="h-5 w-5 shrink-0 text-red-500" />,
  info:    <Info       className="h-5 w-5 shrink-0 text-blue-500" />,
};

const border: Record<ToastType, string> = {
  success: 'border-emerald-100',
  error:   'border-red-100',
  info:    'border-blue-100',
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-4 z-[100] flex flex-col gap-3 sm:right-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg ${border[t.type]}`}
        >
          {icons[t.type]}
          <p className="flex-1 text-sm font-medium text-slate-800">{t.message}</p>
          <button
            onClick={() => remove(t.id)}
            aria-label="Dismiss"
            className="rounded p-0.5 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
