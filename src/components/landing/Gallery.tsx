'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryProps {
  images: string[];
  gymName: string;
}

export default function Gallery({ images = [], gymName }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goToPrevious = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  const goToNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') goToPrevious();
      else if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, images.length]);

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lightboxIndex]);

  return (
    <section id="gallery" className="bg-[#0F0F14] py-16 md:py-24 lg:py-32">
      <div className="container-custom">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16 lg:mb-20">
          <span className="mb-6 inline-block rounded-full border border-[rgba(var(--gym-primary-rgb),0.3)] bg-[rgba(var(--gym-primary-rgb),0.1)] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))]">
            Our Facility
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Experience {gymName}
          </h2>
          <p className="text-lg text-slate-400">
            Explore our state-of-the-art facilities and vibrant fitness community.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06]"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image}
                alt={`${gymName} facility ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                  View
                </span>
              </div>
            </div>
          ))}
        </div>

        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
            <button
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors duration-200 hover:bg-white/10"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors duration-200 hover:bg-white/10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors duration-200 hover:bg-white/10"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="absolute left-4 top-4 rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
              {lightboxIndex + 1} / {images.length}
            </div>

            <div className="relative flex h-full max-h-[90vh] w-full max-w-5xl items-center justify-center">
              <Image
                src={images[lightboxIndex]}
                alt={`${gymName} facility ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
