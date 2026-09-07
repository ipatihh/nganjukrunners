import type { Metadata } from "next";
import JerseyList from "@/components/JerseyList";

export const metadata: Metadata = {
  title: "Katalog Jersey - Nganjuk Runners",
  description: "Tampil lebih percaya diri dan nyaman saat berlari dengan jersey resmi dari komunitas Nganjuk Runners.",
};

export default function KatalogPage() {
  return (
    <div className="pt-32 pb-24 bg-[#fbfbfb]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex flex-col items-center mb-16">
          <span className="text-neutral-600 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-3">
            Official Merchandise
          </span>
          <h1 className="text-neutral-900 text-3xl sm:text-4xl font-extrabold tracking-tight uppercase italic">
            Katalog <span className="text-neutral-500 font-normal">Jersey</span>
          </h1>
          <p className="text-neutral-500 max-w-xl text-sm sm:text-base leading-relaxed mt-4">
            Tampil lebih percaya diri dan nyaman saat berlari dengan jersey resmi dari komunitas kami. Pesan sekarang secara mudah via WhatsApp.
          </p>
        </div>

        <JerseyList />
      </section>
    </div>
  );
}
