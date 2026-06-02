export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-4 text-slate-600">
        Have questions about your order or our sustainable products? We are here to help.
      </p>
      <div className="card mt-8 space-y-4 p-8">
        <p><strong>Email:</strong> support@revomart.com</p>
        <p><strong>Phone:</strong> +233 XX XXX XXXX</p>
        <p><strong>Hours:</strong> Mon–Sat, 8am–6pm GMT</p>
      </div>
      <form className="card mt-8 space-y-4 p-8">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input className="input mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input className="input mt-1" type="email" />
        </div>
        <div>
          <label className="text-sm font-medium">Message</label>
          <textarea className="input mt-1 min-h-[120px]" />
        </div>
        <button type="button" className="btn-primary">Send Message</button>
      </form>
    </div>
  );
}
