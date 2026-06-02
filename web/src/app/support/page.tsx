export default function SupportPage() {
  const faqs = [
    { q: 'What payment methods do you accept?', a: 'Mobile Money (primary), card payments, and cash on delivery in supported regions.' },
    { q: 'How do returns work?', a: 'Request a return from your order history within 14 days of delivery. Refunds are processed to your original payment method.' },
    { q: 'What does upcycled mean?', a: 'Upcycled products are creatively transformed from waste materials into new, higher-value items.' },
    { q: 'How is delivery tracked?', a: 'You will receive real-time updates in your account and via notifications as your order moves through processing, shipping, and delivery.' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Help Center</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((f) => (
          <details key={f.q} className="card p-6">
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <p className="mt-3 text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
