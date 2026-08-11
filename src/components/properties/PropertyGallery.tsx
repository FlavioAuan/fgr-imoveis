"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function prevImage() {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length
    );
  }

  function nextImage() {
    setLightboxIndex((i) =>
      i === null ? null : (i + 1) % images.length
    );
  }

  const main = images[0];
  const thumbs = images.slice(1, 5);

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] sm:h-[520px]">
        {/* Main image */}
        <div
          className="col-span-4 sm:col-span-3 row-span-2 relative overflow-hidden cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={main}
            alt={`${title} - foto principal`}
            fill
            sizes="(max-width: 640px) 100vw, 75vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Thumbnails */}
        {thumbs.map((img, idx) => (
          <div
            key={img}
            className="hidden sm:block relative overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(idx + 1)}
          >
            <Image
              src={img}
              alt={`${title} - foto ${idx + 2}`}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {idx === thumbs.length - 1 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold">
                +{images.length - 5} fotos
              </div>
            )}
          </div>
        ))}

        {/* Show all button (mobile) */}
        {images.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="sm:hidden absolute bottom-4 right-4 bg-white text-neutral-900 text-xs font-semibold px-3 py-2 shadow-md"
          >
            Ver todas as fotos ({images.length})
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Fechar galeria"
          >
            <X size={28} />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 text-white/70 hover:text-white transition-colors z-10 p-2"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={36} />
          </button>

          <div className="relative w-full max-w-4xl max-h-[80vh] mx-16">
            <Image
              src={images[lightboxIndex]}
              alt={`${title} - foto ${lightboxIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[80vh]"
            />
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 text-white/70 hover:text-white transition-colors z-10 p-2"
            aria-label="Próxima foto"
          >
            <ChevronRight size={36} />
          </button>

          <p className="absolute bottom-4 text-white/50 text-sm">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
