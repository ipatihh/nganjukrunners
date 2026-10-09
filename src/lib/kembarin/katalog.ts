// Satu-satunya titik baca katalog merchandise dari core KEMBAR.IN.
// Produk, harga, foto, keterangan, label, pilihan ukuran, kuota, dan buka/tutup pemesanan
// diatur panitia di dashboard KEMBAR.IN (event berjenis Merchandise). Situs ini TIDAK
// menyimpan katalog sendiri: produk baru atau ukuran baru tampil di sini tanpa coding.
// Kontrak: kembarin-v2 docs/PARTNER_INTEGRATION.md §4c.

import { isRecord, urlCore } from "./proxyCore";

export interface Produk {
  /** id tiket di core; dikirim sebagai `ticketTypeId`. */
  id: number;
  nama: string;
  harga: number;
  /** null = tanpa batas. */
  sisa: number | null;
  foto: string | null;
  keterangan: string | null;
  label: string | null;
  /** Kosong = produk tanpa ukuran. */
  ukuran: string[];
}

export interface Katalog {
  eventCode: string;
  namaEvent: string;
  /** Pemesanan bisa dikirim sekarang. */
  buka: boolean;
  /** Saklar Coming Soon di dashboard. */
  segera: boolean;
  /** Jadwal buka (ISO) bila masih di masa depan. */
  bukaPada: string | null;
  produk: Produk[];
  /** Biaya layanan PER BARANG (core menghitung per baris pesanan). */
  biayaLayanan: number;
  labelBiayaLayanan: string;
  maksBarang: number;
  pengambilan: { lokasi: string | null; tanggal: string | null; waktu: string | null };
}

const FETCH_TIMEOUT_MS = 8000;
// Cerminan konstanta core (RegistrationOrderService). Jangan diubah sepihak di sini.
const DEFAULT_MAX_TICKETS = 5;
const ABSOLUTE_MAX_TICKETS = 10;

export function kodeEventMerchandise(): string {
  return process.env.KEMBAR_IN_MERCH_EVENT_CODE?.trim() ?? "";
}

function teks(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Membaca respons `GET /api/public/events/{kode}` menjadi katalog. Murni, supaya bisa dipakai
 * route pesanan (validasi server) dan halaman katalog dengan aturan yang sama.
 * null = bukan event Merchandise atau bentuknya tidak sesuai kontrak.
 */
export function bacaKatalog(json: unknown, now = Date.now()): Katalog | null {
  if (!isRecord(json) || json.success !== true || !isRecord(json.data)) return null;
  const event = json.data;
  if (event.event_category !== "merchandise") return null;
  const eventCode = teks(event.event_code);
  if (!eventCode) return null;

  const pengaturan = new Map<number, Record<string, unknown>>();
  for (const item of Array.isArray(event.merchandise_products) ? event.merchandise_products : []) {
    if (isRecord(item) && Number.isInteger(item.ticket_type_id)) pengaturan.set(item.ticket_type_id as number, item);
  }

  const produk: Produk[] = (Array.isArray(event.ticket_types) ? event.ticket_types : [])
    .filter(isRecord)
    .filter((row) => row.is_active === undefined || row.is_active === null || Boolean(Number(row.is_active)))
    .map((row) => {
      const id = Number(row.id);
      const atur = pengaturan.get(id) ?? {};
      const foto = teks(atur.image_url);
      return {
        id,
        nama: teks(row.category_name) ?? "",
        harga: Number(row.price) || 0,
        sisa: row.remaining === null || row.remaining === undefined ? null : Math.max(0, Number(row.remaining) || 0),
        foto: foto && /^https:\/\//i.test(foto) ? foto : null,
        keterangan: teks(atur.description),
        label: teks(atur.tag),
        ukuran: Array.isArray(atur.sizes) ? atur.sizes.filter((s): s is string => typeof s === "string" && s.trim() !== "") : [],
      };
    })
    .filter((p) => Number.isSafeInteger(p.id) && p.id > 0 && p.nama && p.harga > 0);

  const cfg = isRecord(event.event_config) ? event.event_config : {};
  const segera = cfg.coming_soon === true;
  const ditutup = cfg.registration_closed === true;

  const rawOpenAt = teks(event.registration_open_at) ?? teks(cfg.registration_open_at);
  let bukaPada: string | null = null;
  if (rawOpenAt) {
    // Jadwal tanpa offset adalah WIB (kontrak core).
    const ms = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(rawOpenAt) ? rawOpenAt : `${rawOpenAt.replace(" ", "T")}+07:00`).getTime();
    if (!Number.isNaN(ms) && ms > now) bukaPada = new Date(ms).toISOString();
  }

  const multi = cfg.multi_ticket_enabled !== false;
  const configuredMax = Number(cfg.max_tickets_per_order || DEFAULT_MAX_TICKETS);
  const maksBarang = multi
    ? Math.min(ABSOLUTE_MAX_TICKETS, Math.max(2, Number.isFinite(configuredMax) ? Math.floor(configuredMax) : DEFAULT_MAX_TICKETS))
    : 1;

  return {
    eventCode,
    namaEvent: teks(event.nama_resmi) ?? "",
    buka: event.status === "active" && !ditutup && !segera && !bukaPada && produk.length > 0,
    segera,
    bukaPada,
    produk,
    biayaLayanan: cfg.enable_admin_fee === true ? Math.max(0, Number(cfg.admin_fee_amount) || 0) : 0,
    labelBiayaLayanan: teks(cfg.admin_fee_label) ?? "Biaya layanan",
    maksBarang,
    pengambilan: { lokasi: teks(cfg.rpc_lokasi), tanggal: teks(cfg.rpc_tanggal), waktu: teks(cfg.rpc_waktu) },
  };
}

/**
 * Katalog live. Gagal mengambil = null (halaman menampilkan "pemesanan belum dibuka"):
 * lebih aman menolak sementara daripada menjual dengan harga/produk usang.
 */
export async function getKatalog(): Promise<Katalog | null> {
  const kode = kodeEventMerchandise();
  if (!kode) return null;
  try {
    const res = await fetch(urlCore("event", kode), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      // Core tetap validator akhir saat memesan; revalidate pendek supaya perubahan panitia
      // terlihat dalam hitungan detik tanpa membebani core tiap kunjungan.
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return bacaKatalog(await res.json());
  } catch (err) {
    const alasan = err instanceof Error ? err.name : "unknown";
    console.error(JSON.stringify({ src: "katalog", event: "core_fetch_failed", error: alasan }));
    return null;
  }
}
