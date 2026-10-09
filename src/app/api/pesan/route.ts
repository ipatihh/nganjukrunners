import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getKatalog } from "@/lib/kembarin/katalog";
import { bangunParticipants, validasiKeranjang } from "@/lib/kembarin/keranjang";
import {
  klasifikasiPenolakanCore,
  PESAN_BELUM_PASTI,
  pesanTanpaTautan,
  pesanTautanDitolak,
  type ResponsPesan,
  verifikasiSuksesCore,
} from "@/lib/kembarin/kontrakPesanan";
import {
  ambilJatah,
  asalDiizinkan,
  bacaBodyRequest,
  bacaTeksTerbatas,
  catat as catatLog,
  contentTypeJson,
  getClientIp,
  headerKeCore,
  isRecord,
  urlCore,
  type PetaHitungan,
} from "@/lib/kembarin/proxyCore";
import { urlKembaliPembayaran } from "@/lib/kembarin/statusPesanan";

/**
 * Pemesanan merchandise: browser → api/pesan → core KEMBAR.IN (POST /api/participants/register).
 *
 * Situs ini hanya penerus yang memvalidasi: harga, biaya layanan, kuota, dan ukuran dihitung
 * ulang core dari databasenya. Satu barang = satu baris pesanan di core; data pemesan diisi
 * sekali dan disalin ke tiap barang (kembarin-v2 docs/PARTNER_INTEGRATION.md §4c).
 */

export const dynamic = "force-dynamic";

// Saringan per instance (lapis pertama). Batas terpusat ada di core: 30/menit per IP
// pengunjung partner terverifikasi.
const BATAS_SEMUA_PERMINTAAN = 30;
const BATAS_KE_CORE = 20;
const hitunganSemua: PetaHitungan = new Map();
const hitunganKeCore: PetaHitungan = new Map();

const BATAS_BODY_REQUEST = 16 * 1024;
const BATAS_BODY_CORE = 64 * 1024;
const CORE_TIMEOUT_MS = 25_000;

const NAMA_PATTERN = /^[a-zA-Z\s.']+$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const WHATSAPP_PATTERN = /^\+?\d{8,15}$/;
const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const catat = (event: string, data: Record<string, string | number | undefined>) => catatLog("api/pesan", event, data);

function balas(body: ResponsPesan, status: number, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Penolakan sebelum menghubungi core: pasti tidak ada pesanan yang dibuat. */
function gagal(message: string, status = 400, code = "INVALID_REQUEST", headers?: Record<string, string>) {
  return balas({ success: false, outcome: "rejected", code, message }, status, headers);
}

export async function POST(req: NextRequest) {
  const ref = randomUUID();
  let coreDihubungi = false;
  try {
    const now = Date.now();
    const ip = getClientIp(req);

    const jatahSemua = ambilJatah(hitunganSemua, ip, BATAS_SEMUA_PERMINTAAN, now);
    if (!jatahSemua.ok) {
      return gagal("Terlalu banyak permintaan dari jaringan Anda. Tunggu 1 menit lalu coba lagi.", 429, "RATE_LIMITED", {
        "Retry-After": String(jatahSemua.retryAfter),
      });
    }
    if (!asalDiizinkan(req)) return gagal("Permintaan ditolak.", 403, "ORIGIN_NOT_ALLOWED");
    if (!contentTypeJson(req)) return gagal("Format permintaan harus JSON.", 415, "UNSUPPORTED_MEDIA_TYPE");

    const teksBody = await bacaBodyRequest(req, BATAS_BODY_REQUEST);
    if (teksBody === null) return gagal("Ukuran data pesanan terlalu besar.", 413, "PAYLOAD_TOO_LARGE");
    let body: unknown;
    try {
      body = JSON.parse(teksBody);
    } catch {
      return gagal("Format JSON tidak valid.");
    }
    if (!isRecord(body)) return gagal("Format data pesanan tidak valid.");

    // Honeypot: kolom tersembunyi yang tidak pernah diisi manusia.
    if (typeof body.website === "string" && body.website.trim()) return gagal("Permintaan ditolak.", 400, "INVALID_REQUEST");

    // Satu UUID per isi pesanan (browser). Isi sama → kunci sama → core mengembalikan pesanan yang sama.
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    if (!SESSION_ID_PATTERN.test(sessionId)) return gagal("Sesi pemesanan tidak valid. Muat ulang halaman lalu coba lagi.");

    const pemesan = isRecord(body.pemesan) ? body.pemesan : {};
    const nama = typeof pemesan.nama === "string" ? pemesan.nama.replace(/\s+/g, " ").trim() : "";
    if (nama.length < 3 || nama.length > 100 || !NAMA_PATTERN.test(nama)) {
      return gagal("Nama pemesan hanya boleh huruf, spasi, titik, atau kutip (3–100 karakter).");
    }
    const email = typeof pemesan.email === "string" ? pemesan.email.trim() : "";
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) return gagal("Format email tidak valid.");
    const whatsapp = typeof pemesan.whatsapp === "string" ? pemesan.whatsapp.replace(/[\s-]/g, "") : "";
    if (!WHATSAPP_PATTERN.test(whatsapp)) return gagal("Nomor WhatsApp harus 8–15 digit angka.");

    // Katalog live: produk, ukuran, kuota, dan buka/tutup dari core — bukan dari browser.
    const katalog = await getKatalog();
    if (!katalog || !katalog.buka) {
      return gagal("Pemesanan sedang tidak dibuka. Silakan coba beberapa saat lagi.", 400, "ORDERING_CLOSED");
    }
    const keranjang = validasiKeranjang(katalog, body.keranjang);
    if (!keranjang.ok) return gagal(keranjang.pesan);

    const jatahCore = ambilJatah(hitunganKeCore, ip, BATAS_KE_CORE, now);
    if (!jatahCore.ok) {
      return gagal("Terlalu banyak percobaan pemesanan dari jaringan Anda. Tunggu 1 menit lalu coba lagi.", 429, "RATE_LIMITED", {
        "Retry-After": String(jatahCore.retryAfter),
      });
    }

    // Payload dibangun EKSPLISIT dari field yang sudah divalidasi — body mentah tidak pernah
    // diteruskan, karena permintaan ini membawa kunci partner.
    const payload = {
      eventCode: katalog.eventCode,
      sessionId: sessionId.toLowerCase(),
      buyer: { nama, email, whatsapp },
      participants: bangunParticipants(keranjang.keranjang, { nama, email }),
      // Gateway dipilih core dari pengaturan event.
      paymentGateway: "auto",
      // Setelah bayar, gateway memulangkan pembeli ke /katalog/status situs ini (core §4b).
      partnerReturnUrl: urlKembaliPembayaran(),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CORE_TIMEOUT_MS);
    let statusCore: number;
    let teksCore: string | null;
    coreDihubungi = true;
    try {
      const response = await fetch(urlCore("register"), {
        method: "POST",
        headers: headerKeCore(ip),
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      });
      statusCore = response.status;
      teksCore = await bacaTeksTerbatas(response.body, BATAS_BODY_CORE);
    } catch (fetchErr: unknown) {
      const namaErr = fetchErr instanceof Error ? fetchErr.name : "unknown";
      const timeout = namaErr === "AbortError" || namaErr === "TimeoutError";
      catat(timeout ? "core_timeout" : "core_unreachable", { ref, error: namaErr });
      // Permintaan mungkin sudah diproses core sebelum sambungan putus.
      return balas(
        { success: false, outcome: "unknown", code: timeout ? "CORE_TIMEOUT" : "CORE_UNREACHABLE", message: PESAN_BELUM_PASTI, ref },
        504,
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (teksCore === null) {
      catat("core_response_too_large", { ref, httpStatus: statusCore });
      return balas({ success: false, outcome: "unknown", code: "CORE_MALFORMED_RESPONSE", message: PESAN_BELUM_PASTI, ref }, 502);
    }

    if (statusCore < 200 || statusCore >= 300) {
      const hasil = klasifikasiPenolakanCore(statusCore, teksCore);
      catat(hasil.bugPartner ? "partner_bug" : "core_rejected", { ref, httpStatus: statusCore, code: hasil.code, outcome: hasil.outcome });
      const retryAfter = hasil.retryAfterSeconds ? { "Retry-After": String(hasil.retryAfterSeconds) } : undefined;
      if (hasil.outcome === "unknown") {
        return balas(
          {
            success: false,
            outcome: "unknown",
            code: hasil.code,
            message: hasil.message,
            orderCode: hasil.orderCode,
            retryAfterSeconds: hasil.retryAfterSeconds,
            ref,
          },
          hasil.code === "REGISTRATION_ORDER_PROCESSING" ? 503 : 502,
          retryAfter,
        );
      }
      return balas(
        {
          success: false,
          outcome: "rejected",
          code: hasil.code,
          message: hasil.message,
          orderCode: hasil.orderCode,
          ...(hasil.ulangSesi ? { ulangSesi: true as const } : {}),
          ref,
        },
        statusCore >= 400 && statusCore < 500 ? statusCore : 503,
        retryAfter,
      );
    }

    let dataCore: unknown;
    try {
      dataCore = JSON.parse(teksCore);
    } catch {
      dataCore = undefined;
    }
    const verifikasi = verifikasiSuksesCore(dataCore);
    switch (verifikasi.jenis) {
      case "berhasil":
        return balas({ success: true, outcome: verifikasi.order.status === "paid" ? "paid" : "created", order: verifikasi.order }, 200);
      case "tanpa-tautan":
        catat("core_missing_payment_url", { ref });
        return balas(
          { success: false, outcome: "unknown", code: "PAYMENT_LINK_MISSING", message: pesanTanpaTautan(verifikasi.kode), orderCode: verifikasi.kode, ref },
          502,
        );
      case "tautan-ditolak":
        catat("core_untrusted_payment_url", { ref });
        return balas(
          { success: false, outcome: "unknown", code: "PAYMENT_LINK_UNTRUSTED", message: pesanTautanDitolak(verifikasi.kode), orderCode: verifikasi.kode, ref },
          502,
        );
      default:
        catat("core_malformed_success", { ref, httpStatus: statusCore });
        return balas({ success: false, outcome: "unknown", code: "CORE_MALFORMED_RESPONSE", message: PESAN_BELUM_PASTI, ref }, 502);
    }
  } catch (err: unknown) {
    catat("internal_error", { ref, error: err instanceof Error ? err.name : "unknown" });
    return coreDihubungi
      ? balas({ success: false, outcome: "unknown", code: "INTERNAL_ERROR", message: PESAN_BELUM_PASTI, ref }, 502)
      : balas(
          { success: false, outcome: "rejected", code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server. Belum ada pesanan yang dikirim; coba lagi sebentar.", ref },
          500,
        );
  }
}
