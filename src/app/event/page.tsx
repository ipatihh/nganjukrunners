import type { Metadata } from "next";
import EventList from "@/components/EventList";

export const metadata: Metadata = {
  title: "Event & Kegiatan - Nganjuk Runners",
  description: "Arsip kegiatan dan kolaborasi resmi Nganjuk Runners dalam membangun ekosistem lari yang inklusif.",
};

export default function EventPage() {
  return (
    <div className="pt-32 pb-24 bg-canvas">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex flex-col items-center mb-16">
          <span className="text-sky-500 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-3">
            Perjalanan Kami
          </span>
          <h1 className="text-neutral-900 text-3xl sm:text-4xl font-extrabold tracking-tight uppercase italic">
            Event & <span className="text-neutral-500 font-normal">Kegiatan</span>
          </h1>
          <p className="text-neutral-600 max-w-xl text-sm sm:text-base leading-relaxed mt-4">
            Arsip kegiatan dan event resmi Nganjuk Runners dalam membangun ekosistem lari yang sehat dan inklusif.
          </p>
        </div>

        <EventList />
      </section>
    </div>
  );
}
