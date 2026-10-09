"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
import {
  bacaDaftarPesanan,
  type HasilStatus,
  JEDA_PERIKSA_ULANG_MS,
  KUNCI_PESANAN,
  lupakanPesanan,
  perluPeriksaUlang,
  type PesananTersimpan,
  pilihPesananTampil,
  tafsirkanResponsStatus,
  urlPaymentReturn,
} from "@/lib/kembarin/statusPesanan";
import { TAUTAN_WHATSAPP_MERCH, WHATSAPP_MERCH } from "@/data/kontak";

// localStorage lewat useSyncExternalStore: render server memakai null, browser nilai sebenarnya.
const berlangganan = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const bacaMentah = () => {
  try {
    return window.localStorage.getItem(KUNCI_PESANAN);
  } catch {
    return null;
  }
};

async function ambilStatus(p: PesananTersimpan): Promise<HasilStatus> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch("/api/status-pesanan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderCode: p.kode, statusToken: p.statusToken }),
      signal: controller.signal,
    });
    return tafsirkanResponsStatus(res.status, res.headers.get("content-type"), await res.text(), window.location.origin);
  } catch {
    return { jenis: "gangguan" };
  } finally {
    window.clearTimeout(timer);
  }
}

const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
const tautan = "font-bold text-neutral-900 underline underline-offset-2 hover:text-sky-600";

/**
 * Status pesanan dari peramban ini (kode + token di localStorage), juga tujuan kembali gateway
 * (`?order=<kode>`). Tanpa token, pembeli diarahkan ke halaman status kembar.in.
 */
export default function PemeriksaStatus({ kodeKembali, eventCode }: { kodeKembali: string | null; eventCode: string }) {
  const mentah = useSyncExternalStore(berlangganan, bacaMentah, () => null);
  const daftar = useMemo(() => (mentah ? bacaDaftarPesanan() : []), [mentah]);
  const tampil = useMemo(() => pilihPesananTampil(daftar, kodeKembali), [daftar, kodeKembali]);
  const [dilupakan, setDilupakan] = useState(false);
  const pesanan = dilupakan ? null : (tampil?.pesanan ?? null);
  const dariGateway = tampil?.dariGateway === true;
  const [hasil, setHasil] = useState<HasilStatus | null>(null);
  const [diulang, setDiulang] = useState(0);

  useEffect(() => {
    if (!pesanan?.statusToken) return;
    let batal = false;
    void ambilStatus(pesanan).then((h) => !batal && setHasil(h));
    return () => {
      batal = true;
    };
  }, [pesanan]);

  // Baru kembali dari gateway: konfirmasi bisa terlambat beberapa detik; `pending` diperiksa ulang sebentar.
  useEffect(() => {
    if (!pesanan || !perluPeriksaUlang(hasil, dariGateway, diulang)) return;
    const timer = window.setTimeout(() => {
      void ambilStatus(pesanan).then((h) => {
        setDiulang((n) => n + 1);
        setHasil(h);
      });
    }, JEDA_PERIKSA_ULANG_MS);
    return () => window.clearTimeout(timer);
  }, [pesanan, hasil, dariGateway, diulang]);

  const judul = (
    <h1 className="text-neutral-900 text-3xl font-extrabold tracking-tight uppercase italic">
      Status <span className="text-neutral-500 font-normal">Pesanan</span>
    </h1>
  );

  if (!pesanan) {
    return (
      <>
        {judul}
        <p className="mt-4 text-sm text-neutral-600">
          Belum ada pesanan dari perangkat ini. Status pesanan juga dikirim ke email pemesan.{" "}
          <Link href="/katalog" className={tautan}>Kembali ke katalog</Link>
        </p>
      </>
    );
  }

  const kembarIn = eventCode ? (
    <a href={urlPaymentReturn(eventCode, pesanan.kode)} target="_blank" rel="noopener noreferrer" className={tautan}>
      Lihat status di kembar.in
    </a>
  ) : null;

  let isi: React.ReactNode;
  if (!pesanan.statusToken) {
    isi = <p className="text-sm text-neutral-600">Status pesanan ini belum bisa diperiksa dari perangkat ini. {kembarIn}</p>;
  } else if (hasil === null) {
    isi = <p className="text-sm text-neutral-600" role="status">Memeriksa status pesanan…</p>;
  } else if (hasil.jenis === "ada") {
    const { order } = hasil;
    if (order.status === "paid") {
      isi = (
        <Baris ikon={<CheckCircle2 className="h-5 w-5 text-green-600" />} judul="Pembayaran terverifikasi">
          {order.totalAmount !== undefined ? `Total ${rupiah(order.totalAmount)}. ` : ""}
          Konfirmasi dan QR pengambilan dikirim ke email pemesan.
          {" "}Luar kota? Hubungi panitia di{" "}
          <a href={TAUTAN_WHATSAPP_MERCH} target="_blank" rel="noopener noreferrer" className={tautan}>
            WhatsApp {WHATSAPP_MERCH}
          </a>{" "}
          untuk pengiriman.
        </Baris>
      );
    } else if (order.status === "pending") {
      isi = (
        <>
          <Baris ikon={<Clock className="h-5 w-5 text-amber-600" />} judul="Menunggu pembayaran">
            {dariGateway && perluPeriksaUlang(hasil, dariGateway, diulang)
              ? "Sudah membayar? Status diperbarui otomatis dalam beberapa saat."
              : "Sudah membayar? Konfirmasi bisa butuh beberapa menit."}
          </Baris>
          {order.paymentUrl && (
            <a
              href={order.paymentUrl}
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-sky-500 py-4 text-xs font-extrabold uppercase tracking-widest text-white hover:bg-sky-600"
            >
              Lanjutkan pembayaran
            </a>
          )}
          <button type="button" onClick={() => void ambilStatus(pesanan).then(setHasil)} className={`mt-3 inline-flex items-center gap-1.5 text-sm ${tautan}`}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Periksa lagi
          </button>
        </>
      );
    } else {
      isi = (
        <Baris ikon={<XCircle className="h-5 w-5 text-red-600" />} judul={order.status === "expired" ? "Batas pembayaran terlewat" : "Pesanan dibatalkan"}>
          <Link href="/katalog" className={tautan}>Pesan ulang</Link>
        </Baris>
      );
    }
  } else {
    isi = (
      <Baris ikon={<AlertTriangle className="h-5 w-5 text-amber-600" />} judul="Status belum dapat diperiksa">
        Coba lagi sebentar. {kembarIn}
      </Baris>
    );
  }

  return (
    <>
      {judul}
      <section className="mt-8 rounded-[2rem] border border-neutral-100 bg-white p-6">
        <p className="mb-4 flex justify-between gap-3 text-xs font-bold uppercase tracking-wider text-neutral-600">
          <span>Kode pesanan</span>
          <span className="font-mono text-neutral-900">{pesanan.kode}</span>
        </p>
        <div aria-live="polite">{isi}</div>
        {tampil?.dariPenyimpanan && (
          <button
            type="button"
            onClick={() => {
              lupakanPesanan(pesanan.kode);
              setDilupakan(true);
            }}
            className="mt-5 text-xs text-neutral-600 underline underline-offset-2"
          >
            Lupakan pesanan ini di perangkat ini
          </button>
        )}
      </section>
    </>
  );
}

function Baris({ ikon, judul, children }: { ikon: React.ReactNode; judul: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0" aria-hidden="true">{ikon}</span>
      <div>
        <p className="font-bold text-neutral-900">{judul}</p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600">{children}</p>
      </div>
    </div>
  );
}
