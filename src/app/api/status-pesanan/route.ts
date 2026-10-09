import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { POLA_KODE_PESANAN, POLA_TOKEN_STATUS } from "@/lib/kembarin/kontrakPesanan";
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
import { responsGagalStatus, type ResponsStatus, terjemahkanStatusCore } from "@/lib/kembarin/statusPesanan";

/**
 * Pemeriksa status pesanan untuk /katalog/status.
 * Browser → POST { orderCode, statusToken } → core POST /api/public/orders/status (§8).
 * Token adalah kunci akses pesanan: dikirim di body (bukan URL) dan tidak pernah dicatat.
 */

export const dynamic = "force-dynamic";

const BATAS_BODY = 1024;
const BATAS_BODY_CORE = 8 * 1024;
const CORE_TIMEOUT_MS = 10_000;
const BATAS_PER_IP = 30;
const hitungan: PetaHitungan = new Map();

const catat = (event: string, data: Record<string, string | number | undefined>) => catatLog("api/status-pesanan", event, data);

function balas({ status, body }: { status: number; body: ResponsStatus }, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(req: NextRequest) {
  const ref = randomUUID();
  const ip = getClientIp(req);
  const jatah = ambilJatah(hitungan, ip, BATAS_PER_IP, Date.now());
  if (!jatah.ok) return balas(responsGagalStatus("dibatasi", 429), { "Retry-After": String(jatah.retryAfter) });

  if (!asalDiizinkan(req) || !contentTypeJson(req)) return balas(responsGagalStatus("tidak-valid", 400));
  const teks = await bacaBodyRequest(req, BATAS_BODY);
  let data: unknown;
  try {
    data = teks === null ? null : JSON.parse(teks);
  } catch {
    data = null;
  }
  const orderCode = isRecord(data) && typeof data.orderCode === "string" ? data.orderCode.trim() : "";
  const statusToken = isRecord(data) && typeof data.statusToken === "string" ? data.statusToken : "";
  if (!POLA_KODE_PESANAN.test(orderCode) || !POLA_TOKEN_STATUS.test(statusToken)) {
    return balas(responsGagalStatus("tidak-valid", 400));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CORE_TIMEOUT_MS);
  try {
    const response = await fetch(urlCore("status"), {
      method: "POST",
      headers: headerKeCore(ip),
      body: JSON.stringify({ orderCode, statusToken }),
      signal: controller.signal,
      cache: "no-store",
    });
    const teksCore = await bacaTeksTerbatas(response.body, BATAS_BODY_CORE);
    if (teksCore === null) {
      catat("core_response_too_large", { ref, httpStatus: response.status });
      return balas(responsGagalStatus("gangguan", 502));
    }
    const hasil = terjemahkanStatusCore(response.status, teksCore);
    if (hasil.status >= 500 || hasil.status === 429) catat("core_status_gagal", { ref, httpStatus: response.status });
    return balas(hasil);
  } catch (err: unknown) {
    const nama = err instanceof Error ? err.name : "unknown";
    catat(nama === "AbortError" || nama === "TimeoutError" ? "core_timeout" : "core_unreachable", { ref, error: nama });
    return balas(responsGagalStatus("gangguan", 504));
  } finally {
    clearTimeout(timeoutId);
  }
}
