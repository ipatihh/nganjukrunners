// Status pesanan untuk halaman /katalog/status: core → api/status-pesanan → browser.
// Kontrak core: kembarin-v2 docs/PARTNER_INTEGRATION.md §8. Diadaptasi dari situs smadarun.

import { isTrustedPaymentUrl } from "./paymentUrl";
import { POLA_KODE_PESANAN, POLA_TOKEN_STATUS } from "./kontrakPesanan";

export type StatusPesanan = "pending" | "paid" | "cancelled" | "expired";

export interface StatusTerverifikasi {
  status: StatusPesanan;
  ticketCount?: number;
  totalAmount?: number;
  paymentMethod?: string;
  paymentExpiresAt?: string;
  /** Hanya selama pesanan masih bisa dibayar, dan sudah lolos whitelist domain gateway. */
  paymentUrl?: string;
}

export type JenisGagalStatus = "tidak-valid" | "tidak-ada" | "belum-aktif" | "dibatasi" | "gangguan";

export type ResponsStatus =
  | { success: true; order: StatusTerverifikasi }
  | { success: false; hasil: JenisGagalStatus; message: string };

/**
 * Tujuan kembali dari gateway setelah bayar (`partnerReturnUrl`, kontrak core §4b). Core
 * menambahkan `?order=<kode>&result=…` dan hanya memakainya bila host-nya sama dengan tautan
 * "Tiket dijual di" event Merchandise di KEMBAR.IN — selain itu pembeli kembali ke halaman
 * kembar.in. Token status tersimpan di localStorage origin tempat pembeli memesan, jadi host
 * ini harus host yang sama dengan halaman katalog.
 */
export function urlKembaliPembayaran(): string {
  const asal = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.nganjukrunners.or.id";
  return `${new URL(asal).origin}/katalog/status`;
}

/** Halaman status pesanan di kembar.in; bisa dibuka cukup dengan kode. */
export const urlPaymentReturn = (eventCode: string, kode: string) =>
  `https://kembar.in/events/${encodeURIComponent(eventCode)}/payment-return?order=${encodeURIComponent(kode)}`;

/** Kode pesanan dari `?order=`. `result` sengaja tidak dibaca: status hanya dari core. */
export function kodeDariNilai(nilai: unknown): string | null {
  const kode = typeof nilai === "string" ? nilai.trim() : "";
  return POLA_KODE_PESANAN.test(kode) ? kode : null;
}

export interface PesananTampil {
  pesanan: PesananTersimpan;
  dariPenyimpanan: boolean;
  dariGateway: boolean;
}

export function pilihPesananTampil(daftar: PesananTersimpan[], kodeKembali: string | null): PesananTampil | null {
  if (kodeKembali) {
    const tersimpan = daftar.find((p) => p.kode === kodeKembali);
    return tersimpan
      ? { pesanan: tersimpan, dariPenyimpanan: true, dariGateway: true }
      : { pesanan: { kode: kodeKembali }, dariPenyimpanan: false, dariGateway: true };
  }
  return daftar[0] ? { pesanan: daftar[0], dariPenyimpanan: true, dariGateway: false } : null;
}

/**
 * Baru kembali dari gateway, konfirmasi pembayaran bisa tiba beberapa detik kemudian. Status
 * `pending` diperiksa ulang 12 × 5 detik ≈ 1 menit — di bawah batas core 20/menit per pesanan.
 */
export const JEDA_PERIKSA_ULANG_MS = 5_000;
export const BATAS_PERIKSA_ULANG = 12;

export function perluPeriksaUlang(hasil: HasilStatus | null, dariGateway: boolean, sudahDiulang: number): boolean {
  return dariGateway && sudahDiulang < BATAS_PERIKSA_ULANG && hasil?.jenis === "ada" && hasil.order.status === "pending";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function parseJson(teks: string): unknown {
  try {
    return JSON.parse(teks);
  } catch {
    return undefined;
  }
}

const POLA_METODE = /^[A-Za-z0-9 .\/-]{1,40}$/;
const STATUS_SAH: readonly StatusPesanan[] = ["pending", "paid", "cancelled", "expired"];

function bersihkanStatus(order: unknown, base: string): StatusTerverifikasi | null {
  if (!isRecord(order) || !STATUS_SAH.includes(order.status as StatusPesanan)) return null;
  const status = order.status as StatusPesanan;
  const hasil: StatusTerverifikasi = { status };
  if (Number.isInteger(order.ticketCount) && (order.ticketCount as number) >= 0) hasil.ticketCount = order.ticketCount as number;
  if (typeof order.totalAmount === "number" && Number.isFinite(order.totalAmount) && order.totalAmount >= 0) {
    hasil.totalAmount = order.totalAmount;
  }
  if (typeof order.paymentMethod === "string" && POLA_METODE.test(order.paymentMethod.trim())) {
    hasil.paymentMethod = order.paymentMethod.trim();
  }
  if (typeof order.paymentExpiresAt === "string" && !Number.isNaN(Date.parse(order.paymentExpiresAt))) {
    hasil.paymentExpiresAt = order.paymentExpiresAt;
  }
  if (status === "pending" && typeof order.paymentUrl === "string" && isTrustedPaymentUrl(order.paymentUrl, base)) {
    hasil.paymentUrl = order.paymentUrl;
  }
  return hasil;
}

const PESAN: Record<JenisGagalStatus, string> = {
  "tidak-valid": "Data pesanan di perangkat ini tidak valid.",
  "tidak-ada": "Pesanan tidak ditemukan.",
  "belum-aktif": "Pemeriksaan status otomatis belum tersedia.",
  dibatasi: "Terlalu banyak pemeriksaan status. Coba lagi sebentar lagi.",
  gangguan: "Status pesanan belum dapat diperiksa saat ini.",
};

export function terjemahkanStatusCore(httpStatus: number, teks: string): { status: number; body: ResponsStatus } {
  const data = parseJson(teks);
  const code = isRecord(data) && typeof data.code === "string" ? data.code : "";
  if (httpStatus >= 200 && httpStatus < 300) {
    const order = isRecord(data) && data.success === true ? bersihkanStatus(data.order, "https://basis.invalid") : null;
    return order
      ? { status: 200, body: { success: true, order } }
      : { status: 502, body: { success: false, hasil: "gangguan", message: PESAN.gangguan } };
  }
  if (httpStatus === 404) return { status: 404, body: { success: false, hasil: "tidak-ada", message: PESAN["tidak-ada"] } };
  if (httpStatus === 503 && code === "ORDER_STATUS_UNAVAILABLE") {
    return { status: 503, body: { success: false, hasil: "belum-aktif", message: PESAN["belum-aktif"] } };
  }
  if (httpStatus === 429) return { status: 429, body: { success: false, hasil: "dibatasi", message: PESAN.dibatasi } };
  return { status: 502, body: { success: false, hasil: "gangguan", message: PESAN.gangguan } };
}

export const responsGagalStatus = (hasil: JenisGagalStatus, status: number) => ({
  status,
  body: { success: false, hasil, message: PESAN[hasil] } as ResponsStatus,
});

export type HasilStatus = { jenis: "ada"; order: StatusTerverifikasi } | { jenis: JenisGagalStatus };

export function tafsirkanResponsStatus(httpStatus: number, contentType: string | null, teks: string, origin: string): HasilStatus {
  const data = contentType && contentType.includes("application/json") ? parseJson(teks) : undefined;
  if (!isRecord(data)) return { jenis: "gangguan" };
  if (data.success === true && httpStatus === 200) {
    const order = bersihkanStatus(data.order, origin);
    return order ? { jenis: "ada", order } : { jenis: "gangguan" };
  }
  const hasil = data.hasil;
  if (hasil === "tidak-ada" || hasil === "belum-aktif" || hasil === "dibatasi" || hasil === "tidak-valid") return { jenis: hasil };
  return { jenis: "gangguan" };
}

// ─── Penyimpanan di browser ──────────────────────────────────────────────────
// localStorage, BUKAN URL: token status adalah kunci baca pesanan. Yang disimpan hanya kode +
// token (tanpa data pribadi), paling banyak 5 pesanan selama 30 hari.

export const KUNCI_PESANAN = "nganjukrunners:pesanan";
export const BATAS_PESANAN_TERSIMPAN = 5;
export const MASA_SIMPAN_MS = 30 * 24 * 60 * 60 * 1000;

export interface PesananTersimpan {
  kode: string;
  statusToken?: string;
}

interface EntriTersimpan extends PesananTersimpan {
  t: number;
}

function penyimpanan(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function bacaEntri(store: Storage | null, now: number): EntriTersimpan[] {
  try {
    const data = parseJson(store?.getItem(KUNCI_PESANAN) ?? "");
    if (!Array.isArray(data)) return [];
    const hasil: EntriTersimpan[] = [];
    for (const item of data) {
      if (!isRecord(item) || typeof item.kode !== "string" || !POLA_KODE_PESANAN.test(item.kode)) continue;
      const t = typeof item.t === "number" && Number.isFinite(item.t) ? item.t : 0;
      if (now - t > MASA_SIMPAN_MS || t > now + 60_000) continue;
      if (hasil.some((e) => e.kode === item.kode)) continue;
      const statusToken =
        typeof item.statusToken === "string" && POLA_TOKEN_STATUS.test(item.statusToken) ? item.statusToken : undefined;
      hasil.push(statusToken ? { kode: item.kode, statusToken, t } : { kode: item.kode, t });
      if (hasil.length >= BATAS_PESANAN_TERSIMPAN) break;
    }
    return hasil;
  } catch {
    return [];
  }
}

const tanpaJam = ({ kode, statusToken }: EntriTersimpan): PesananTersimpan => (statusToken ? { kode, statusToken } : { kode });

export function bacaDaftarPesanan(store: Storage | null = penyimpanan(), now = Date.now()): PesananTersimpan[] {
  return bacaEntri(store, now).map(tanpaJam);
}

/** Simpan sebagai yang terbaru. Kode tanpa token tidak menghapus token tersimpan kode yang SAMA. */
export function simpanPesananTerakhir(baru: PesananTersimpan, store: Storage | null = penyimpanan(), now = Date.now()): void {
  if (!store || !POLA_KODE_PESANAN.test(baru.kode)) return;
  const entri = bacaEntri(store, now);
  const lama = entri.find((e) => e.kode === baru.kode);
  const statusToken = baru.statusToken && POLA_TOKEN_STATUS.test(baru.statusToken) ? baru.statusToken : lama?.statusToken;
  const depan: EntriTersimpan = statusToken ? { kode: baru.kode, statusToken, t: now } : { kode: baru.kode, t: now };
  const isi = [depan, ...entri.filter((e) => e.kode !== baru.kode)].slice(0, BATAS_PESANAN_TERSIMPAN);
  try {
    store.setItem(KUNCI_PESANAN, JSON.stringify(isi));
  } catch {
    // Penyimpanan penuh/diblokir: halaman status jatuh ke tautan kembar.in.
  }
}

export function lupakanPesanan(kode: string, store: Storage | null = penyimpanan(), now = Date.now()): void {
  if (!store) return;
  try {
    const sisa = bacaEntri(store, now).filter((e) => e.kode !== kode);
    if (sisa.length) store.setItem(KUNCI_PESANAN, JSON.stringify(sisa));
    else store.removeItem(KUNCI_PESANAN);
  } catch {
    // abaikan
  }
}
