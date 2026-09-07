"use client";

import Image from "next/image";
import { jerseys } from "@/data/jerseys";

export default function JerseyList() {
  const data = jerseys;

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-600 border border-dashed border-neutral-200 rounded-3xl">
        Katalog jersey sedang diperbarui...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.map((jersey) => (
        <div
          key={jersey.id}
          className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-[0_4px_30px_rgba(0,0,0,0.01)] group flex flex-col transition-all duration-300 hover:border-neutral-300 hover:shadow-xl"
        >
          {/* Aspect 4:5 image container */}
          <div className="relative aspect-[4/5] w-full bg-neutral-50 overflow-hidden border-b border-neutral-100">
            <Image
              src={jersey.image}
              alt={jersey.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            {jersey.tag && (
              <div className="absolute top-5 left-5 bg-neutral-950/90 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                {jersey.tag}
              </div>
            )}
          </div>

          <div className="p-8 flex flex-col flex-grow text-center items-center">
            <p className="text-neutral-600 font-extrabold text-[9px] uppercase tracking-wider mb-2">
              {jersey.material}
            </p>
            <h3 className="text-neutral-900 font-extrabold text-lg mb-3 tracking-tight">
              {jersey.name}
            </h3>
            <div className="text-neutral-950 font-black text-xl mb-8 mt-auto">
              Rp {jersey.price.toLocaleString("id-ID")}
            </div>
            <a
              href={jersey.orderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full py-4 border border-neutral-900 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all hover:bg-neutral-900 hover:text-white active:scale-95"
            >
              Pesan via WhatsApp
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
