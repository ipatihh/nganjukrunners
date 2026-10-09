import type { Metadata } from "next";
import TokoMerchandise from "@/components/katalog/TokoMerchandise";
import { getKatalog } from "@/lib/kembarin/katalog";

export const metadata: Metadata = {
  title: "Merchandise",
  description: "Pesan merchandise resmi komunitas Nganjuk Runners. Pembayaran online, barang diambil di lokasi panitia.",
};

// Katalog dibaca dari KEMBAR.IN tiap kunjungan (di-cache 30 detik di lapisan fetch).
export const dynamic = "force-dynamic";

export default async function KatalogPage() {
  const katalog = await getKatalog();

  return (
    <div className="pt-32 pb-28 bg-canvas lg:pb-24">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex flex-col items-center mb-12">
          <span className="text-sky-500 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-3">
            Merchandise Resmi
          </span>
          <h1 className="text-neutral-900 text-3xl sm:text-4xl font-extrabold tracking-tight uppercase italic">
            Katalog <span className="text-neutral-500 font-normal">Merchandise</span>
          </h1>
          <p className="text-neutral-600 max-w-xl text-sm sm:text-base leading-relaxed mt-4">
            Pilih ukuran dan jumlah, bayar online, lalu ambil pesanan dengan QR yang dikirim ke email Anda.
          </p>
        </div>

        {katalog && katalog.produk.length > 0 ? (
          <TokoMerchandise katalog={katalog} />
        ) : (
          <div className="text-center py-20 text-neutral-600 border border-dashed border-neutral-200 rounded-3xl">
            Belum ada merchandise yang dijual. Pantau Instagram Nganjuk Runners untuk kabar berikutnya.
          </div>
        )}
      </section>
    </div>
  );
}
