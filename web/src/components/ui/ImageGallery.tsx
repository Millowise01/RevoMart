'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Img {
  url: string;
  altText?: string;
}

export function ImageGallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [{ url: '/placeholder-product.svg' }];

  function prev() {
    setActive((i) => (i === 0 ? list.length - 1 : i - 1));
  }
  function next() {
    setActive((i) => (i === list.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
        <Image
          src={list[active].url}
          alt={list[active].altText || name}
          fill
          className="object-cover transition duration-300"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {list.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5 text-slate-700" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                  className={`h-2 w-2 rounded-full transition ${
                    i === active ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active
                  ? 'border-emerald-500'
                  : 'border-transparent hover:border-slate-300'
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${name} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
