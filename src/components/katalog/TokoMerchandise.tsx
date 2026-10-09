"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Info, Loader2, Minus, Plus, Shirt, ShoppingBag, Trash2 } from "lucide-react";
import type { Katalog, Produk } from "@/lib/kembarin/katalog";
import { type BarisKeranjang, hitungRincian, kunciBaris, totalBarang } from "@/lib/kembarin/keranjang";
import { PESAN_BELUM_PASTI, tafsirkanResponsPesan } from "@/lib/kembarin/kontrakPesanan";
import { simpanPesananTerakhir } from "@/lib/kembarin/statusPesanan";

const rupiah = (nilai: number) => `Rp ${nilai.toLocaleString("id-ID")}`;

const INPUT =
  "w-full px-5 py-4 bg-canvas border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-800 placeholder-neutral-400 font-medium";
const LABEL = "block text-neutral-700 font-bold text-xs uppercase tracking-wider mb-2";

/** Batas tunggu browser > batas tunggu api/pesan ke core (25 detik). */
const BATAS_TUNGGU_MS = 35_000;

type Pemberitahuan = { jenis: "ditolak" | "belum-pasti"; pesan: string; kode?: string } | null;

interface Sesi {
  id: string;
  sidik: string;
}

function formatWib(iso: string): string {
  return `${new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(iso))} WIB`;
}

export default function TokoMerchandise({ katalog }: { katalog: Katalog }) {
  const [keranjang, setKeranjang] = useState<BarisKeranjang[]>([]);
  const [pemesan, setPemesan] = useState({ nama: "", email: "", whatsapp: "", website: "" });
  const [status, setStatus] = useState<"diam" | "mengirim" | "dialihkan">("diam");
  const [pemberitahuan, setPemberitahuan] = useState<Pemberitahuan>(null);
  const sesi = useRef<Sesi | null>(null);

  const produkById = useMemo(() => new Map(katalog.produk.map((p) => [p.id, p])), [katalog.produk]);
  const rincian = hitungRincian(katalog, keranjang);
  const jumlahBarang = totalBarang(keranjang);
  const sisaSlot = katalog.maksBarang - jumlahBarang;

  const tambah = (produk: Produk, ukuran: string | null, jumlah: number) => {
    setPemberitahuan(null);
    setKeranjang((lama) => {
      const kunci = kunciBaris({ produkId: produk.id, ukuran });
      const ada = lama.find((b) => kunciBaris(b) === kunci);
      if (ada) return lama.map((b) => (b === ada ? { ...b, jumlah: b.jumlah + jumlah } : b));
      return [...lama, { produkId: produk.id, ukuran, jumlah }];
    });
  };

  const ubahJumlah = (baris: BarisKeranjang, jumlah: number) => {
    setPemberitahuan(null);
    setKeranjang((lama) =>
      jumlah <= 0 ? lama.filter((b) => b !== baris) : lama.map((b) => (b === baris ? { ...b, jumlah } : b)),
    );
  };

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "diam" || keranjang.length === 0) return;
    setPemberitahuan(null);
    setStatus("mengirim");
    let dialihkan = false;

    const isi = {
      pemesan: { nama: pemesan.nama.trim(), email: pemesan.email.trim(), whatsapp: pemesan.whatsapp.trim() },
      keranjang: keranjang.map(({ produkId, ukuran, jumlah }) => ({ produkId, ukuran, jumlah })),
    };
    // Isi yang sama → kunci idempotensi yang sama (kirim ulang aman); isi berubah → kunci baru.
    const sidik = JSON.stringify(isi);
    if (!sesi.current || sesi.current.sidik !== sidik) sesi.current = { id: crypto.randomUUID(), sidik };

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), BATAS_TUNGGU_MS);
    try {
      const res = await fetch("/api/pesan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...isi, sessionId: sesi.current.id, website: pemesan.website }),
        signal: controller.signal,
      });
      const hasil = tafsirkanResponsPesan(res.status, res.headers.get("content-type"), await res.text(), window.location.origin);
      switch (hasil.jenis) {
        case "bayar":
          simpanPesananTerakhir({ kode: hasil.kode, statusToken: hasil.statusToken });
          dialihkan = true;
          setStatus("dialihkan");
          window.location.assign(hasil.url);
          return;
        case "lunas":
          simpanPesananTerakhir({ kode: hasil.kode, statusToken: hasil.statusToken });
          dialihkan = true;
          window.location.assign(`/katalog/status?order=${encodeURIComponent(hasil.kode)}`);
          return;
        case "ditolak":
          if (hasil.ulangSesi) sesi.current = null;
          if (hasil.kode) simpanPesananTerakhir({ kode: hasil.kode });
          setPemberitahuan({ jenis: "ditolak", pesan: hasil.pesan, kode: hasil.kode });
          return;
        case "belum-pasti":
          if (hasil.kode) simpanPesananTerakhir({ kode: hasil.kode });
          setPemberitahuan({ jenis: "belum-pasti", pesan: hasil.pesan, kode: hasil.kode });
          return;
      }
    } catch {
      // Timeout atau sambungan putus: permintaan mungkin sudah sampai ke server.
      setPemberitahuan({ jenis: "belum-pasti", pesan: PESAN_BELUM_PASTI });
    } finally {
      window.clearTimeout(timer);
      if (!dialihkan) setStatus("diam");
    }
  };

  const pengambilan = [katalog.pengambilan.lokasi, katalog.pengambilan.tanggal, katalog.pengambilan.waktu].filter(Boolean).join(" · ");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div>
        {!katalog.buka && (
          <div role="status" className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
            <p className="font-bold text-neutral-900">
              {katalog.segera ? "Segera dibuka" : katalog.bukaPada ? `Pemesanan dibuka ${formatWib(katalog.bukaPada)}` : "Pemesanan sedang ditutup"}
            </p>
            <p className="mt-1">Pantau Instagram Nganjuk Runners untuk kabar pembukaan pemesanan.</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {katalog.produk.map((produk) => (
            <KartuProduk
              key={produk.id}
              produk={produk}
              buka={katalog.buka}
              sisaSlot={sisaSlot}
              diKeranjang={keranjang.filter((b) => b.produkId === produk.id).reduce((s, b) => s + b.jumlah, 0)}
              onTambah={tambah}
            />
          ))}
        </div>
      </div>

      <aside id="keranjang" aria-labelledby="judul-keranjang" className="lg:sticky lg:top-28">
        <form onSubmit={kirim} className="rounded-[2rem] border border-neutral-100 bg-white p-6 shadow-[0_4px_30px_rgba(0,0,0,0.01)] md:p-8">
          <h2 id="judul-keranjang" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-neutral-950">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            Keranjang
          </h2>

          {keranjang.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-600">Belum ada barang. Pilih ukuran dan jumlah, lalu tekan Tambah.</p>
          ) : (
            <ul className="mt-4 divide-y divide-neutral-100">
              {keranjang.map((baris) => {
                const produk = produkById.get(baris.produkId);
                if (!produk) return null;
                return (
                  <li key={kunciBaris(baris)} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-neutral-900">{produk.nama}</p>
                      <p className="text-xs text-neutral-600">
                        {baris.ukuran ? `Ukuran ${baris.ukuran} · ` : ""}
                        {rupiah(produk.harga)}
                      </p>
                    </div>
                    <Penghitung
                      nilai={baris.jumlah}
                      label={`Jumlah ${produk.nama}${baris.ukuran ? ` ukuran ${baris.ukuran}` : ""}`}
                      bisaTambah={sisaSlot > 0}
                      onUbah={(n) => ubahJumlah(baris, n)}
                    />
                    <button
                      type="button"
                      onClick={() => ubahJumlah(baris, 0)}
                      className="rounded-lg p-2 text-neutral-600 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-sky-500"
                      aria-label={`Hapus ${produk.nama}${baris.ukuran ? ` ukuran ${baris.ukuran}` : ""}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {keranjang.length > 0 && (
            <dl className="mt-4 space-y-1.5 border-t border-neutral-100 pt-4 text-sm">
              <div className="flex justify-between text-neutral-600">
                <dt>{rincian.barang} barang</dt>
                <dd className="tabular-nums">{rupiah(rincian.subtotal)}</dd>
              </div>
              {rincian.biayaLayanan > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <dt>{katalog.labelBiayaLayanan}</dt>
                  <dd className="tabular-nums">{rupiah(rincian.biayaLayanan)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-1.5 text-base font-black text-neutral-950">
                <dt>Total</dt>
                <dd className="tabular-nums">{rupiah(rincian.total)}</dd>
              </div>
            </dl>
          )}

          {keranjang.length > 0 && (
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="pemesan-nama" className={LABEL}>Nama pemesan</label>
                <input
                  id="pemesan-nama"
                  required
                  autoComplete="name"
                  value={pemesan.nama}
                  onChange={(e) => setPemesan((p) => ({ ...p, nama: e.target.value }))}
                  placeholder="Nama lengkap"
                  maxLength={100}
                  className={INPUT}
                />
              </div>
              <div>
                <label htmlFor="pemesan-email" className={LABEL}>Email</label>
                <input
                  id="pemesan-email"
                  required
                  type="email"
                  autoComplete="email"
                  value={pemesan.email}
                  onChange={(e) => setPemesan((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Konfirmasi dan QR pengambilan dikirim ke sini"
                  className={INPUT}
                />
              </div>
              <div>
                <label htmlFor="pemesan-wa" className={LABEL}>WhatsApp</label>
                <input
                  id="pemesan-wa"
                  required
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={pemesan.whatsapp}
                  onChange={(e) => setPemesan((p) => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="Contoh: 08123456789"
                  className={INPUT}
                />
              </div>
              {/* Honeypot: tidak terlihat manusia; bot yang mengisi semua kolom tertolak. */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={pemesan.website}
                  onChange={(e) => setPemesan((p) => ({ ...p, website: e.target.value }))}
                />
              </div>
              <p className="text-xs leading-relaxed text-neutral-600">
                {pengambilan ? `Barang diambil di ${pengambilan}.` : "Lokasi dan jadwal pengambilan dikirim lewat email saat barang siap."}
              </p>
            </div>
          )}

          {pemberitahuan && (
            <div
              role="alert"
              className={`mt-5 flex items-start gap-2 rounded-2xl border p-4 text-xs leading-relaxed ${
                pemberitahuan.jenis === "ditolak" ? "border-red-100 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {pemberitahuan.pesan}
                {pemberitahuan.kode && (
                  <>
                    {" "}
                    <Link href={`/katalog/status?order=${encodeURIComponent(pemberitahuan.kode)}`} className="font-bold underline underline-offset-2">
                      Lihat status pesanan
                    </Link>
                  </>
                )}
              </span>
            </div>
          )}

          {keranjang.length > 0 && (
            <button
              type="submit"
              disabled={!katalog.buka || status !== "diam"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-4 text-xs font-extrabold uppercase tracking-widest text-white transition hover:bg-sky-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-600"
            >
              {status !== "diam" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {status === "dialihkan" ? "Membuka pembayaran…" : status === "mengirim" ? "Memproses…" : `Bayar ${rupiah(rincian.total)}`}
            </button>
          )}
          <p className="mt-4 text-center text-xs text-neutral-600">
            Sudah memesan?{" "}
            <Link href="/katalog/status" className="font-bold text-neutral-900 underline underline-offset-2 hover:text-sky-600">
              Cek status pesanan
            </Link>
          </p>
        </form>
      </aside>

      {/* Ponsel: keranjang ada di bawah daftar produk, jadi jumlahnya ditampilkan di bilah bawah. */}
      {keranjang.length > 0 && (
        <a
          href="#keranjang"
          className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-2xl bg-neutral-950 px-5 py-4 text-sm font-bold text-white shadow-lg lg:hidden"
        >
          <span>{jumlahBarang} barang · {rupiah(rincian.total)}</span>
          <span className="text-xs uppercase tracking-wider">Lanjut</span>
        </a>
      )}
    </div>
  );
}

function KartuProduk({
  produk,
  buka,
  sisaSlot,
  diKeranjang,
  onTambah,
}: {
  produk: Produk;
  buka: boolean;
  sisaSlot: number;
  diKeranjang: number;
  onTambah: (produk: Produk, ukuran: string | null, jumlah: number) => void;
}) {
  const [ukuran, setUkuran] = useState<string | null>(null);
  const [jumlah, setJumlah] = useState(1);
  const sisaProduk = produk.sisa === null ? Infinity : produk.sisa - diKeranjang;
  const habis = produk.sisa === 0;
  const batasJumlah = Math.max(0, Math.min(sisaSlot, sisaProduk));
  const perluUkuran = produk.ukuran.length > 0;
  const bisaTambah = buka && !habis && batasJumlah > 0 && (!perluUkuran || ukuran !== null);
  const idGrup = `ukuran-${produk.id}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-[2rem] border border-neutral-100 bg-white shadow-[0_4px_30px_rgba(0,0,0,0.01)] transition-all duration-300 hover:border-neutral-300">
      <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-neutral-100 bg-neutral-50">
        {produk.foto ? (
          <Image
            src={produk.foto}
            alt={produk.nama}
            fill
            unoptimized
            referrerPolicy="no-referrer"
            sizes="(max-width: 640px) 100vw, 400px"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <Shirt className="h-16 w-16" aria-hidden="true" />
          </div>
        )}
        {produk.label && (
          <span className="absolute left-5 top-5 rounded-full bg-neutral-950/90 px-4 py-1.5 text-[9px] font-black uppercase tracking-wider text-white">
            {produk.label}
          </span>
        )}
      </div>

      <div className="flex flex-grow flex-col p-6">
        {produk.keterangan && (
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-neutral-600">{produk.keterangan}</p>
        )}
        <h3 className="text-lg font-extrabold tracking-tight text-neutral-900">{produk.nama}</h3>
        <p className="mt-1 text-xl font-black text-neutral-950">
          {rupiah(produk.harga)}
          {produk.sisa !== null && produk.sisa > 0 && produk.sisa <= 20 && (
            <span className="ml-2 text-xs font-bold text-neutral-600">Sisa {produk.sisa}</span>
          )}
        </p>

        {perluUkuran && (
          <fieldset className="mt-5">
            <legend className={LABEL}>Ukuran</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={idGrup}>
              <span id={idGrup} className="sr-only">Ukuran {produk.nama}</span>
              {produk.ukuran.map((u) => (
                <button
                  key={u}
                  type="button"
                  role="radio"
                  aria-checked={ukuran === u}
                  onClick={() => setUkuran(u)}
                  disabled={!buka || habis}
                  className={`min-w-11 rounded-xl border px-3 py-2 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                    ukuran === u ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-canvas text-neutral-800 hover:border-neutral-400"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-auto flex items-center gap-3 pt-6">
          <Penghitung
            nilai={Math.min(jumlah, Math.max(1, batasJumlah))}
            label={`Jumlah ${produk.nama}`}
            bisaTambah={jumlah < batasJumlah}
            onUbah={(n) => setJumlah(Math.max(1, n))}
          />
          <button
            type="button"
            disabled={!bisaTambah}
            onClick={() => {
              onTambah(produk, perluUkuran ? ukuran : null, Math.min(jumlah, batasJumlah));
              setJumlah(1);
            }}
            className="flex-1 rounded-xl border border-neutral-900 py-3.5 text-xs font-extrabold uppercase tracking-widest transition hover:bg-neutral-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 active:scale-95 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-600 disabled:hover:bg-transparent"
          >
            {habis ? "Habis" : !buka ? "Belum dibuka" : perluUkuran && !ukuran ? "Pilih ukuran" : "Tambah"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Penghitung({
  nilai,
  label,
  bisaTambah,
  onUbah,
}: {
  nilai: number;
  label: string;
  bisaTambah: boolean;
  onUbah: (nilai: number) => void;
}) {
  const tombol =
    "flex h-9 w-9 items-center justify-center rounded-lg text-neutral-800 transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:text-neutral-300";
  return (
    <div className="flex items-center rounded-xl border border-neutral-200 bg-canvas" role="group" aria-label={label}>
      <button type="button" className={tombol} onClick={() => onUbah(nilai - 1)} aria-label="Kurangi">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-7 text-center text-sm font-bold tabular-nums" aria-live="polite">{nilai}</span>
      <button type="button" className={tombol} onClick={() => onUbah(nilai + 1)} disabled={!bisaTambah} aria-label="Tambah">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
