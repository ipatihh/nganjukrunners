// Kontrak respons pemesanan: core KEMBAR.IN → api/pesan → browser.
// Fungsi murni, dipakai server maupun browser. Diadaptasi dari situs smadarun
// (src/lib/kontrakPendaftaran.ts) — kontrak core-nya sama.
//
// Sebuah percobaan pemesanan hanya punya tiga kemungkinan hasil:
//   - "berhasil"    : core mengonfirmasi pesanan (kode pesanan + tautan bayar / sudah lunas).
//   - "ditolak"     : core PASTI tidak membuat tagihan (validasi, kuota, rate limit, dst).
//   - "belum-pasti" : sisanya — timeout, sambungan putus, 5xx, respons rusak. Pesanan mungkin
//                     sudah dibuat. Isian dipertahankan dan pengiriman ulang memakai kunci
//                     idempotensi yang sama (sessionId), sehingga core mengembalikan pesanan
//                     yang sama, bukan membuat yang baru.

import { isTrustedPaymentUrl } from "./paymentUrl";

// ─── Pesan ──────────────────────────────────────────────────────────────────

export const PESAN_BELUM_PASTI =
  "Hasil pemesanan belum dapat dipastikan — pesanan mungkin sudah dibuat, mungkin juga belum. Isian Anda tetap ada di halaman ini. Tekan Bayar lagi tanpa mengubah keranjang: bila pesanan ternyata sudah ada, sistem memakai pesanan yang sama. Bila ragu, periksa email Anda atau hubungi admin.";

export const PESAN_GATEWAY_GAGAL =
  "Halaman pembayaran gagal disiapkan, sehingga belum ada tagihan maupun pembayaran yang dibuat. Silakan coba lagi beberapa saat lagi.";

export const pesanTanpaTautan = (kode: string) =>
  `Pesanan ${kode} sudah tercatat, tetapi tautan pembayarannya belum diterima. Jangan membuat pesanan baru: tekan Bayar lagi tanpa mengubah keranjang, atau hubungi admin dengan kode ${kode}.`;

export const pesanTautanDitolak = (kode: string) =>
  `Pesanan ${kode} sudah tercatat, tetapi tautan pembayarannya tidak lolos pemeriksaan keamanan sehingga tidak dibuka. Jangan membuat pesanan baru; hubungi admin dengan kode ${kode}.`;

export const pesanSedangDisiapkan = (kode: string, detik?: number) =>
  `Pesanan ${kode} sudah tercatat dan tautan pembayarannya masih disiapkan. Tunggu ${
    detik ? `sekitar ${detik} detik` : "sebentar"
  }, lalu tekan Bayar lagi tanpa mengubah keranjang.`;

export const pesanRekonsiliasi = (kode: string) =>
  `Status tagihan pesanan ${kode} belum dapat dipastikan. Jangan membuat pesanan baru; hubungi admin dengan kode ${kode}.`;

export const pesanIsiBerbeda = (kode?: string) =>
  kode
    ? `Pesanan ${kode} sudah tercatat dengan isi yang berbeda dari keranjang sekarang. Tekan Bayar lagi untuk mengirim keranjang ini sebagai pesanan baru, atau lanjutkan pembayaran pesanan ${kode} lewat tautan di email Anda.`
    : PESAN_SESI_DIPERBARUI;

export const PESAN_SESI_DIPERBARUI = "Sesi pemesanan perlu diperbarui. Keranjang Anda tetap ada; tekan Bayar lagi.";

/** Pesan core hanya diteruskan bila memang kalimat untuk manusia, bukan potongan error internal. */
export function isSafeUserFacingMessage(message: string, maxLength = 200): boolean {
  if (message.length === 0 || message.length > maxLength) return false;
  if (/[\n\r<>{}]/.test(message)) return false;
  return !/(error:|exception|stack|at\s+\w+\s*\(|\/var\/|\/home\/|node_modules|select\s|insert\s|update\s\w+\sset|prisma|sqlstate|econn|undefined is not)/i.test(
    message
  );
}

// ─── Bentuk respons api/pesan (yang diterima browser) ───────────────────────

export interface PesananTerverifikasi {
  kode: string;
  status: "pending" | "paid";
  /** Ada bila status "pending" — sudah lolos whitelist domain gateway di server. */
  paymentUrl?: string;
  paymentExpiresAt?: string;
  /** Kunci akses halaman status (core §8). */
  statusToken?: string;
}

export type ResponsPesan =
  | { success: true; outcome: "created" | "paid"; order: PesananTerverifikasi }
  | {
      success: false;
      outcome: "rejected";
      code: string;
      message: string;
      orderCode?: string;
      /** Browser wajib membuang sessionId lama (kunci idempotensi ditolak core). */
      ulangSesi?: true;
      ref?: string;
    }
  | {
      success: false;
      outcome: "unknown";
      code: string;
      message: string;
      orderCode?: string;
      retryAfterSeconds?: number;
      ref?: string;
    };

const POLA_KODE = /^[A-Z][A-Z0-9_]{2,63}$/;
/** Sama dengan ORDER_CODE_PATTERN core. */
export const POLA_KODE_PESANAN = /^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/;
/** HMAC-SHA256 base64url — sama dengan TOKEN_PATTERN core. */
export const POLA_TOKEN_STATUS = /^[A-Za-z0-9_-]{43}$/;

function tanggalIso(value: unknown): string | undefined {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : undefined;
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

// ─── Server: respons sukses core ─────────────────────────────────────────────

export type VerifikasiSukses =
  | { jenis: "berhasil"; order: PesananTerverifikasi }
  | { jenis: "tanpa-tautan"; kode: string }
  | { jenis: "tautan-ditolak"; kode: string }
  | { jenis: "rusak" };

/** Hanya field yang dibutuhkan browser yang diteruskan (allowlist). */
export function verifikasiSuksesCore(data: unknown): VerifikasiSukses {
  if (!isRecord(data) || data.success !== true) return { jenis: "rusak" };
  const kode = typeof data.orderCode === "string" ? data.orderCode.trim() : "";
  if (!POLA_KODE_PESANAN.test(kode)) return { jenis: "rusak" };
  const statusToken =
    typeof data.statusToken === "string" && POLA_TOKEN_STATUS.test(data.statusToken) ? data.statusToken : undefined;

  if (data.status === "paid") return { jenis: "berhasil", order: { kode, status: "paid", statusToken } };
  if (data.status !== "pending") return { jenis: "rusak" };

  // Situs ini selalu memakai gateway otomatis ("auto"): pesanan pending WAJIB punya tautan bayar.
  if (typeof data.paymentUrl !== "string" || !data.paymentUrl.trim()) return { jenis: "tanpa-tautan", kode };
  const paymentUrl = data.paymentUrl.trim();
  if (!isTrustedPaymentUrl(paymentUrl, "https://basis.invalid")) return { jenis: "tautan-ditolak", kode };

  return {
    jenis: "berhasil",
    order: { kode, status: "pending", paymentUrl, paymentExpiresAt: tanggalIso(data.paymentExpiresAt), statusToken },
  };
}

// ─── Server: respons non-2xx core ─────────────────────────────────────────────

export interface KlasifikasiPenolakan {
  outcome: "rejected" | "unknown";
  code: string;
  message: string;
  orderCode?: string;
  retryAfterSeconds?: number;
  ulangSesi?: true;
  /** Penolakan yang hanya mungkin terjadi karena kesalahan di situs ini — wajib dicatat. */
  bugPartner?: true;
}

/**
 * Tabel kode: kembarin-v2 docs/PARTNER_INTEGRATION.md §7. Yang dibaca `code` dan field
 * terstruktur — kalimat `message` tidak pernah diurai. 5xx tanpa kode dikenal = BELUM PASTI.
 */
export function klasifikasiPenolakanCore(status: number, teks: string): KlasifikasiPenolakan {
  const parsed = parseJson(teks);
  const err = isRecord(parsed) ? parsed : {};
  const code = typeof err.code === "string" && POLA_KODE.test(err.code) ? err.code : "";
  const kandidat = typeof err.message === "string" ? err.message : typeof err.error === "string" ? err.error : null;
  const pesanAman = kandidat && isSafeUserFacingMessage(kandidat) ? kandidat : null;
  const orderCode =
    typeof err.orderCode === "string" && POLA_KODE_PESANAN.test(err.orderCode.trim()) ? err.orderCode.trim() : undefined;
  const retryAfterSeconds =
    Number.isInteger(err.retryAfterSeconds) && (err.retryAfterSeconds as number) > 0 && (err.retryAfterSeconds as number) <= 3600
      ? (err.retryAfterSeconds as number)
      : undefined;

  switch (code) {
    case "PAYMENT_GATEWAY_CREATION_FAILED":
      return { outcome: "rejected", code, message: PESAN_GATEWAY_GAGAL };
    case "PAYMENT_GATEWAY_RECONCILIATION_REQUIRED":
      return { outcome: "unknown", code, orderCode, message: pesanAman ?? (orderCode ? pesanRekonsiliasi(orderCode) : PESAN_BELUM_PASTI) };
    case "REGISTRATION_ORDER_PROCESSING":
      return {
        outcome: "unknown",
        code,
        orderCode,
        retryAfterSeconds,
        message: orderCode ? pesanSedangDisiapkan(orderCode, retryAfterSeconds) : PESAN_BELUM_PASTI,
      };
    case "REGISTRATION_IDEMPOTENCY_MISMATCH":
      return { outcome: "rejected", code, orderCode, ulangSesi: true, bugPartner: true, message: pesanIsiBerbeda(orderCode) };
    case "REGISTRATION_SESSION_INVALID":
      return { outcome: "rejected", code, ulangSesi: true, bugPartner: true, message: PESAN_SESI_DIPERBARUI };
  }

  if (status >= 500 && code !== "REGISTRATION_PROTECTION_UNAVAILABLE") {
    return { outcome: "unknown", code: code || "CORE_SERVER_ERROR", message: PESAN_BELUM_PASTI };
  }
  if (status === 429 || code === "REGISTRATION_RATE_LIMITED") {
    return {
      outcome: "rejected",
      code: code || "CORE_RATE_LIMITED",
      retryAfterSeconds,
      message: pesanAman ?? "Terlalu banyak percobaan pemesanan. Silakan tunggu sebentar lalu coba lagi.",
    };
  }
  if (code === "REGISTRATION_PROTECTION_UNAVAILABLE") {
    return { outcome: "rejected", code, message: "Sistem pemesanan sedang sibuk. Belum ada pesanan yang dibuat; silakan coba lagi." };
  }
  return {
    outcome: "rejected",
    code: code || "CORE_REJECTED",
    message: pesanAman ?? "Pesanan Anda ditolak sistem pemesanan. Periksa kembali keranjang dan data Anda.",
  };
}

// ─── Browser: menafsirkan respons api/pesan ──────────────────────────────────

export type HasilPengiriman =
  | { jenis: "bayar"; url: string; kode: string; statusToken?: string }
  | { jenis: "lunas"; kode: string; statusToken?: string }
  | { jenis: "ditolak"; pesan: string; kode?: string; ulangSesi: boolean; ref?: string }
  | { jenis: "belum-pasti"; pesan: string; kode?: string; ref?: string };

/** Respons yang tidak sesuai kontrak SELALU "belum-pasti" — permintaan mungkin sudah sampai core. */
export function tafsirkanResponsPesan(
  httpStatus: number,
  contentType: string | null,
  teks: string,
  origin: string
): HasilPengiriman {
  const data = contentType && contentType.includes("application/json") ? parseJson(teks) : undefined;
  if (!isRecord(data)) return { jenis: "belum-pasti", pesan: PESAN_BELUM_PASTI };
  const ref = typeof data.ref === "string" && /^[A-Za-z0-9-]{4,64}$/.test(data.ref) ? data.ref : undefined;

  if (data.success === true && httpStatus >= 200 && httpStatus < 300) {
    const order = isRecord(data.order) ? data.order : null;
    const kode = order && typeof order.kode === "string" && POLA_KODE_PESANAN.test(order.kode) ? order.kode : null;
    if (!order || !kode) return { jenis: "belum-pasti", pesan: PESAN_BELUM_PASTI, ref };
    const statusToken =
      typeof order.statusToken === "string" && POLA_TOKEN_STATUS.test(order.statusToken) ? order.statusToken : undefined;
    if (data.outcome === "paid" && order.status === "paid") return { jenis: "lunas", kode, statusToken };
    if (data.outcome === "created" && order.status === "pending") {
      if (typeof order.paymentUrl !== "string") return { jenis: "belum-pasti", pesan: pesanTanpaTautan(kode), kode, ref };
      if (!isTrustedPaymentUrl(order.paymentUrl, origin)) return { jenis: "belum-pasti", pesan: pesanTautanDitolak(kode), kode, ref };
      return { jenis: "bayar", url: order.paymentUrl, kode, statusToken };
    }
    return { jenis: "belum-pasti", pesan: PESAN_BELUM_PASTI, ref };
  }

  const pesan = typeof data.message === "string" && isSafeUserFacingMessage(data.message, 600) ? data.message : null;
  const kode = typeof data.orderCode === "string" && POLA_KODE_PESANAN.test(data.orderCode) ? data.orderCode : undefined;
  if (data.success === false && data.outcome === "rejected" && httpStatus >= 400) {
    return { jenis: "ditolak", pesan: pesan ?? "Pesanan ditolak. Periksa kembali keranjang Anda.", kode, ulangSesi: data.ulangSesi === true, ref };
  }
  return { jenis: "belum-pasti", pesan: pesan ?? PESAN_BELUM_PASTI, kode, ref };
}
