// Perkakas bersama route server yang memproksikan permintaan pengunjung ke core KEMBAR.IN:
// api/pesan dan api/status-pesanan. Satu tempat untuk aturan keamanan — pembacaan IP, batas
// laju, asal permintaan, batas ukuran body, header partner, dan log tanpa data pribadi.
// Kontrak core: kembarin-v2 docs/PARTNER_INTEGRATION.md (pola sama dengan situs smadarun).

import type { NextRequest } from "next/server";

/**
 * IP pengunjung asli. `x-forwarded-for` bisa diisi sebagian oleh klien, jadi yang dipercaya:
 *   1. `x-vercel-forwarded-for` — ditulis platform, tidak bisa ditimpa klien.
 *   2. entri PALING KANAN `x-forwarded-for` — ditambahkan proxy terdekat.
 */
export function getClientIp(req: NextRequest): string {
  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",").pop()!.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((part) => part.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export const RATE_LIMIT_WINDOW = 60 * 1000;
export type PetaHitungan = Map<string, { count: number; lastReset: number }>;

/**
 * Batas laju per IP di memori SATU instance serverless — saringan lapis pertama, bukan
 * sumber kebenaran (batas terpusat ada di core). ok = masih di bawah batas.
 */
export function ambilJatah(map: PetaHitungan, ip: string, batas: number, now: number) {
  if (map.size > 200) {
    map.forEach((data, key) => {
      if (now - data.lastReset > RATE_LIMIT_WINDOW) map.delete(key);
    });
  }
  const data = map.get(ip);
  if (!data || now - data.lastReset > RATE_LIMIT_WINDOW) {
    map.set(ip, { count: 1, lastReset: now });
    return { ok: true, retryAfter: 0 };
  }
  if (data.count >= batas) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((RATE_LIMIT_WINDOW - (now - data.lastReset)) / 1000)) };
  }
  data.count++;
  return { ok: true, retryAfter: 0 };
}

/** Permintaan lintas situs ditolak; satu-satunya klien sah adalah halaman situs ini. */
export function asalDiizinkan(req: NextRequest): boolean {
  if (req.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").split(",")[0].trim();
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function contentTypeJson(req: NextRequest): boolean {
  return /^application\/json(\s*;|$)/i.test((req.headers.get("content-type") ?? "").trim());
}

/** Baca stream sampai `batas` byte; null bila melebihi batas. */
export async function bacaTeksTerbatas(stream: ReadableStream<Uint8Array> | null, batas: number): Promise<string | null> {
  if (!stream) return "";
  const reader = stream.getReader();
  const potongan: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > batas) {
      await reader.cancel().catch(() => {});
      return null;
    }
    potongan.push(value);
  }
  const gabung = new Uint8Array(total);
  let offset = 0;
  for (const p of potongan) {
    gabung.set(p, offset);
    offset += p.byteLength;
  }
  return new TextDecoder().decode(gabung);
}

/** Body request sebagai teks, menghormati Content-Length dan batas byte; null = terlalu besar. */
export async function bacaBodyRequest(req: NextRequest, batas: number): Promise<string | null> {
  const panjangDinyatakan = Number(req.headers.get("content-length"));
  if (Number.isFinite(panjangDinyatakan) && panjangDinyatakan > batas) return null;
  return bacaTeksTerbatas(req.body, batas);
}

/**
 * Header ke core. Kunci partner (`KEMBAR_IN_PARTNER_KEY`) harus sama dengan secret
 * `nganjukrunners:<secret>` di `TRUSTED_PARTNER_KEYS` core. Dengan kunci itu core mengenali
 * situs ini: batas laju dihitung per IP pengunjung asli, asal pesanan tercatat, dan tujuan
 * kembali setelah bayar (`partnerReturnUrl`) dipakai. Tanpa kunci, pesanan tetap bisa dibuat,
 * tetapi core menghitung IP server situs ini dan memulangkan pembeli ke kembar.in.
 */
export function headerKeCore(ip: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const kunci = process.env.KEMBAR_IN_PARTNER_KEY?.trim();
  if (kunci) {
    headers["X-Trusted-Proxy-Key"] = kunci;
    headers["X-Forwarded-Client-Ip"] = ip;
  }
  return headers;
}

/** Asal core (https://kembar.in di produksi). */
export function asalCore(): string {
  const raw = process.env.KEMBAR_IN_BASE_URL?.trim() || "https://kembar.in";
  return new URL(raw).origin;
}

export function urlCore(path: "register" | "status" | "event", eventCode = ""): string {
  const asal = asalCore();
  if (path === "register") return `${asal}/api/participants/register`;
  if (path === "status") return `${asal}/api/public/orders/status`;
  return `${asal}/api/public/events/${encodeURIComponent(eventCode)}`;
}

/**
 * Log terstruktur TANPA isi request/respons: body error core bisa memantulkan nama, email,
 * atau WhatsApp, dan token status pesanan adalah kunci akses. Yang dicatat hanya rujukan,
 * status, dan kode error.
 */
export function catat(src: string, event: string, data: Record<string, string | number | undefined>) {
  console.error(JSON.stringify({ src, event, ...data }));
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
