"use client";

import Image from "next/image";
import { events } from "@/data/events";
import { ArrowRight, MapPin, ArrowUpRight } from "lucide-react";
import { bloggerImage } from "@/lib/images";

export default function EventList() {
  const data = events;

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-600 border border-dashed border-neutral-200 rounded-3xl">
        Belum ada event saat ini...
      </div>
    );
  }

  const hasOpenEvent = data.some((e) => e.status === "open");

  return (
    <div className="space-y-8">
      {/* When nothing is open, say so plainly and point people to where the next
          announcement will land — instead of a wall of greyed-out dead events. */}
      {!hasOpenEvent && (
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="text-sm font-bold text-neutral-900">
              Belum ada pendaftaran event yang dibuka saat ini.
            </p>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Info event berikutnya selalu diumumkan lebih dulu di Instagram & Telegram kami.
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <a
              href="https://instagram.com/nganjukrunners"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-sky-600 active:scale-95"
            >
              Instagram <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="https://t.me/+EoB_rQ6bHbY2MDJl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-900 transition-all hover:bg-neutral-50 active:scale-95"
            >
              Telegram <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-[2rem] border border-neutral-100 overflow-hidden flex flex-col transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:border-neutral-300 hover:shadow-xl"
          >
            {/* Image Aspect Ratio 4:5 */}
            <div className="relative aspect-[4/5] w-full bg-neutral-50 border-b border-neutral-100 overflow-hidden">
              {/* unoptimized + bloggerImage(): load a ~1000px poster straight from
                  Blogger instead of routing multi-MB originals through the (slow,
                  timeout-prone) optimizer. See docs/UI-UX-GUIDELINES.md. */}
              <Image
                src={bloggerImage(event.poster, 1000)}
                alt={`Poster ${event.title}`}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
              />
              <div
                className={`absolute top-5 left-5 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md ${
                  event.status === "open" ? "bg-sky-500" : "bg-neutral-700"
                }`}
              >
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

              <p className="text-neutral-600 text-xs leading-relaxed mb-6 flex-grow">
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
                <span className="w-full py-4 bg-neutral-100 text-neutral-600 rounded-xl font-bold text-xs uppercase tracking-widest text-center block">
                  Pendaftaran Ditutup
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
