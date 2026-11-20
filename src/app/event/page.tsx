import type { Metadata } from "next";
import EventList from "@/components/EventList";
import { events } from "@/data/events";
import { jsonLdHalamanEvent, serialisasiJsonLd } from "@/lib/seo";

const dibuka = events.filter((e) => e.status === "open").map((e) => e.title);

export const metadata: Metadata = {
  title: "Jadwal Event Lari Nganjuk",
  description:
    dibuka.length > 0
      ? `Jadwal dan pendaftaran resmi event lari di Nganjuk: ${dibuka.join(", ")}. Plus arsip event yang dijalani Nganjuk Runners.`
      : "Jadwal dan pendaftaran resmi event lari di Nganjuk, plus arsip event yang dijalani Nganjuk Runners.",
  alternates: { canonical: "/event" },
};

export default function EventPage() {
  return (
    <div className="pt-32 pb-24 bg-canvas">
      {/* "<" di-escape di serialisasiJsonLd supaya teks tidak bisa menutup tag script. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialisasiJsonLd(jsonLdHalamanEvent(events)) }}
      />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex flex-col items-center mb-16">
          <span className="text-sky-500 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-3">
            Jadwal & Arsip
          </span>
          <h1 className="text-neutral-900 text-3xl sm:text-4xl font-extrabold tracking-tight uppercase italic">
            Event Lari <span className="text-neutral-500 font-normal">Nganjuk</span>
          </h1>
          <p className="text-neutral-600 max-w-xl text-sm sm:text-base leading-relaxed mt-4">
            Jadwal dan pendaftaran event lari di Nganjuk, plus arsip event yang sudah dijalani Nganjuk Runners.
          </p>
        </div>

        <EventList />
      </section>
    </div>
  );
}
