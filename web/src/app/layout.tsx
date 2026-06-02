import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Transformer Innovation Hub — Sustainable E-Commerce',
  description:
    'Shop new, used, refurbished, and upcycled products. Eco-conscious commerce with quality you can trust.',
  keywords: 'sustainable shopping, refurbished, upcycled, eco-friendly, mobile money',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
