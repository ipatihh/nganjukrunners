import type { Metadata } from "next";
import CollaborationList from "@/components/CollaborationList";

export const metadata: Metadata = {
  title: "Kolaborasi Komunitas - Nganjuk Runners",
  description: "Rangkaian kegiatan resmi Nganjuk Runners bersama para mitra dan komunitas.",
};

export default function KolaborasiPage() {
  return (
    <div className="pt-32 pb-24 bg-[#fbfbfb]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex flex-col items-center mb-16">
          <span className="text-neutral-600 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-3">
            Partnership & Portfolio
          </span>
          <h1 className="text-neutral-900 text-3xl sm:text-4xl font-extrabold tracking-tight uppercase italic">
            Jadwal <span className="text-neutral-500 font-normal">Kolaborasi</span>
          </h1>
          <p className="text-neutral-500 max-w-xl text-sm sm:text-base leading-relaxed mt-4">
            Rangkaian kegiatan resmi Nganjuk Runners bersama para mitra, sponsor, dan komunitas olahraga regional.
          </p>
        </div>

        <CollaborationList />
      </section>
    </div>
  );
}
