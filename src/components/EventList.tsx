"use client";

import Image from "next/image";
import { events } from "@/data/events";
import { ArrowRight, MapPin } from "lucide-react";

export default function EventList() {
  const data = events;

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-600 border border-dashed border-neutral-200 rounded-3xl">
        Belum ada event saat ini...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.map((event) => (
        <div
          key={event.id}
          className={`bg-white rounded-[2rem] border overflow-hidden flex flex-col transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:border-neutral-300 hover:shadow-xl ${
            event.status === "closed" ? "opacity-75 grayscale-[0.2]" : ""
          }`}
        >
          {/* Image Aspect Ratio 4:5 */}
          <div className="relative aspect-[4/5] w-full bg-neutral-50 border-b border-neutral-100 overflow-hidden">
            {/* Ditambahkan properti unoptimized agar gambar resolusi tinggi langsung dirender tanpa merusak server lokal */}
            <Image
              src={event.poster}
              alt={event.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
            />
            <div className={`absolute top-5 left-5 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md ${event.status === "open" ? "bg-sky-500" : "bg-neutral-500/90"}`}>
              {event.statusText}
            </div>
          </div>

          <div className="p-8 flex flex-col flex-grow">
            <div className="flex items-center gap-3 mb-3 text-neutral-600 text-[10px] font-bold">
              <span className="bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded">
                {event.year}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {event.location}
              </span>
            </div>

            <h3 className="text-neutral-900 text-lg font-black mb-3 leading-tight tracking-tight">
              {event.title}
            </h3>
            
            <p className="text-neutral-500 text-xs leading-relaxed mb-6 flex-grow">
              {event.description}
            </p>

            {event.status === "open" && event.link ? (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-4 bg-sky-500 text-white hover:bg-sky-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-neutral-100 text-neutral-600 rounded-xl font-bold text-xs uppercase tracking-widest cursor-not-allowed text-center"
              >
                Pendaftaran Ditutup
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}