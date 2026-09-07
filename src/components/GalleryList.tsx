"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { galleryAlbums } from "@/data/gallery";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export default function GalleryList() {
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const lightboxRef = useRef<HTMLDivElement>(null);
  useFocusTrap(!!activeAlbumId, lightboxRef);

  const activeAlbum = galleryAlbums.find((a) => a.id === activeAlbumId);
  const activeImages = activeAlbum?.images || [];

  const handleOpenAlbum = (albumId: string) => {
    setActiveAlbumId(albumId);
    setActiveImageIndex(0);
  };

  const handleCloseAlbum = () => {
    setActiveAlbumId(null);
  };

  const goToPrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? activeImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setActiveImageIndex((prev) => (prev === activeImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToPrevImage();
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToNextImage();
  };

  useEffect(() => {
    if (!activeAlbumId) return;

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseAlbum();
      else if (e.key === "ArrowLeft") goToPrevImage();
      else if (e.key === "ArrowRight") goToNextImage();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAlbumId, activeImages.length]);

  return (
    <div className="space-y-12">
      {/* Grid of albums */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryAlbums?.map((album) => (
          <div
            key={album.id}
            onClick={() => handleOpenAlbum(album.id)}
            className="group bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
          >
            {/* Aspect 4:5 as per guidelines */}
            <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-50 relative border-b border-neutral-100">
              <Image
                src={album.cover}
                alt={album.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 right-4 bg-neutral-950/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 select-none">
                <ImageIcon className="w-3.5 h-3.5" />
                {album.images?.length || 0} Foto
              </span>
            </div>

            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">
                  {album.category}
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-1 tracking-tight group-hover:text-neutral-500 transition-colors">
                  {album.title}
                </h3>
              </div>
              <p className="text-xs text-neutral-600 mt-4 font-semibold">
                {album.date}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Lightbox */}
      {activeAlbumId && activeImages.length > 0 && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={activeAlbum?.title || "Galeri foto"}
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
          onClick={handleCloseAlbum}
        >
          {/* Close button */}
          <button
            onClick={handleCloseAlbum}
            className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors p-2 rounded-full hover:bg-neutral-900 focus:outline-none"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Controls */}
          {activeImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-6 text-neutral-400 hover:text-white transition-all p-3 rounded-full hover:bg-neutral-900 focus:outline-none z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-6 text-neutral-400 hover:text-white transition-all p-3 rounded-full hover:bg-neutral-900 focus:outline-none z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Image Display */}
          <div
            className="relative max-w-4xl w-full h-[70vh] sm:h-[80vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={activeImages[activeImageIndex].src}
                alt={activeImages[activeImageIndex].caption || activeAlbum?.title || "Foto"}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-contain w-full h-full rounded-2xl"
                priority
              />
            </div>
            
            {/* Caption */}
            <div className="mt-4 text-center text-white px-6">
              <p className="text-sm font-semibold tracking-wide">
                {activeImages[activeImageIndex].caption}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {activeImageIndex + 1} dari {activeImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
