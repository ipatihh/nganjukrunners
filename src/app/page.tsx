import HeroSlider from "@/components/HeroSlider";
import EventList from "@/components/EventList";
import GalleryList from "@/components/GalleryList";
import FAQSection from "@/components/FAQSection";

export default function Home() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <HeroSlider />

      {/* Event & Kegiatan — canvas band */}
      <section className="bg-canvas py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sky-500 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-3 block">
              Rekam Jejak
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight uppercase italic">
              Event & <span className="text-neutral-500 font-normal">Kegiatan Utama</span>
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-neutral-600 leading-relaxed">
              Jejak event lari yang sudah kami jalani bersama, dari kolaborasi komunitas hingga race di Kota Angin.
            </p>
          </div>
          <EventList />
        </div>
      </section>

      {/* Gallery — raised white band gives the page vertical rhythm */}
      <section className="bg-canvas-alt border-y border-neutral-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sky-500 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-3 block">
              Jejak dan Langkah Kami
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight uppercase italic">
              Dokumentasi <span className="text-neutral-500 font-normal">Kegiatan</span>
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-neutral-600 leading-relaxed">
              Momen keseruan dan kebersamaan seduluran pelari Nganjuk Runners di setiap rute dan event.
            </p>
          </div>
          <GalleryList />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}
