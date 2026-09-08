"use client";

import { collaborations } from "@/data/collaborations";
import { Clock, MapPin, Calendar, CheckCircle } from "lucide-react";

export default function CollaborationList() {
  const data = collaborations;

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-600 border border-dashed border-neutral-200 rounded-3xl">
        Belum ada jadwal kolaborasi saat ini...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.map((collab) => (
        <div
          key={collab.id}
          className="bg-white border border-neutral-100 rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300 hover:border-neutral-300 hover:shadow-xl shadow-[0_4px_30px_rgba(0,0,0,0.01)]"
        >
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <span className="bg-neutral-900 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1 select-none">
                <CheckCircle className="w-3.5 h-3.5" />
                {collab.statusText}
              </span>
              <span className="text-[10px] text-neutral-600 font-bold bg-neutral-50 border border-neutral-100 px-3.5 py-1.5 rounded-full flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                {collab.dateText}
              </span>
            </div>

            <h3 className="text-xl font-bold text-neutral-950 mb-3 tracking-tight leading-tight">
              {collab.title}
            </h3>
            
            <p className="text-sm text-neutral-600 leading-relaxed mb-8">
              {collab.description}
            </p>

            <div className="space-y-3 bg-canvas p-5 rounded-2xl border border-neutral-100 mb-8">
              <div className="text-xs text-neutral-600 flex justify-between gap-4">
                <span className="text-neutral-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Waktu:
                </span>
                <span className="font-bold text-neutral-800 text-right">{collab.time}</span>
              </div>
              <div className="text-xs text-neutral-600 flex justify-between gap-4">
                <span className="text-neutral-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Tempat:
                </span>
                <span className="font-bold text-neutral-800 text-right">{collab.location}</span>
              </div>
            </div>
          </div>

          {collab.link && (
            <a
              href={collab.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs tracking-widest uppercase py-4 px-4 rounded-xl transition duration-300 block active:scale-95"
            >
              Daftar Sekarang
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
