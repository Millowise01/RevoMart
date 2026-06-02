import { Check } from 'lucide-react';

interface Step {
  label: string;
}

export function CheckoutStepper({
  steps,
  current,
}: {
  steps: Step[];
  current: number;
}) {
  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={i} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
                    done
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : active
                        ? 'border-emerald-600 bg-white text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    active ? 'text-emerald-700' : done ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition ${
                    done ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
