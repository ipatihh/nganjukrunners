import HeroSlider from "@/components/HeroSlider";
import EventList from "@/components/EventList";
import GalleryList from "@/components/GalleryList";
import FAQSection from "@/components/FAQSection";

export default function Home() {
  return (
    <div className="space-y-24 pb-24 pt-20">
      {/* Hero Section */}
      <HeroSlider />

      {/* Highlights Event Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sky-500 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-3 block">
            Our Highlights
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight uppercase italic">
            Event & <span className="text-neutral-500 font-normal">Kegiatan Utama</span>
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-neutral-500 leading-relaxed">
            Ikuti agenda lari bersama kami dan amankan slot registrasi Anda pada event-event terbaru dari Nganjuk Runners.
          </p>
        </div>
        <EventList />
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sky-500 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-3 block">
            Jejak dan Langkah Kami
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight uppercase italic">
            Dokumentasi <span className="text-neutral-500 font-normal">Kegiatan</span>
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-neutral-500 leading-relaxed">
            Momen keseruan dan kebersamaan seduluran pelari Nganjuk Runners di setiap rute dan event.
          </p>
        </div>
        <GalleryList />
      </section>

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}