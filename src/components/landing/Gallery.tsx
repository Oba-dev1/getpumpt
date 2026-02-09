'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

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

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
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
    <section id="gallery" className="py-16 md:py-24 lg:py-32 bg-[#141414]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <span className="inline-block bg-[rgba(var(--gym-primary-rgb),0.1)] border border-[rgba(var(--gym-primary-rgb),0.3)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))] mb-6 rounded-md">
            Our Facility
          </span>
          <h2 className="font-['Bebas_Neue'] text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-4 text-white leading-tight">
            Experience {gymName}
          </h2>
          <p className="text-gray-400 text-lg">
            Explore our state-of-the-art facilities and vibrant fitness community.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image}
                alt={`${gymName} facility ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-white text-sm font-semibold uppercase tracking-wider">
                  View
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxIndex !== null && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-2xl w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors duration-200 z-10"
              aria-label="Close lightbox"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 text-white text-2xl w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors duration-200 z-10"
                  aria-label="Previous image"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 text-white text-2xl w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors duration-200 z-10"
                  aria-label="Next image"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute top-4 left-4 text-white text-sm font-semibold bg-black/50 px-4 py-2 rounded-full">
              {lightboxIndex + 1} / {images.length}
            </div>

            {/* Image */}
            <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center">
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
