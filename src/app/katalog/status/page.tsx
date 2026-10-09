import type { Metadata } from "next";
import PemeriksaStatus from "@/components/katalog/PemeriksaStatus";
import { kodeEventMerchandise } from "@/lib/kembarin/katalog";
import { kodeDariNilai } from "@/lib/kembarin/statusPesanan";

export const metadata: Metadata = {
  title: "Status Pesanan",
  description: "Status pembayaran pesanan merchandise Nganjuk Runners.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Tujuan kembali gateway setelah bayar (`?order=<kode>`) sekaligus halaman "cek status
 * pesanan". Status diperiksa ke core memakai token yang tersimpan di peramban tempat
 * memesan; tanpa token, pembeli diarahkan ke halaman status kembar.in.
 */
export default async function StatusPesananPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const { order } = await searchParams;
  const kodeKembali = kodeDariNilai(Array.isArray(order) ? order[0] : order);

  return (
    <div className="pt-32 pb-24 bg-canvas min-h-[70vh]">
      <section className="max-w-xl mx-auto px-4 sm:px-6">
        <PemeriksaStatus kodeKembali={kodeKembali} eventCode={kodeEventMerchandise()} />
      </section>
    </div>
  );
}
