import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

// Very small in-memory throttle. Resets whenever the serverless instance recycles,
// so it's a speed bump against basic scripted spam, not a real distributed rate limiter.
const submissionLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  submissionLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  if (!GOOGLE_SCRIPT_URL) {
    return NextResponse.json({ error: "Registration endpoint is not configured." }, { status: 500 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi dalam 1 menit." }, { status: 429 });
  }

  const body = await request.json();

  // Honeypot: a hidden field real users never fill. Bots that auto-fill every field trip it.
  if (body.website) {
    return NextResponse.json({ success: true });
  }

  if (!body.nama_lengkap || !body.fileData || !body.mimeType) {
    return NextResponse.json({ error: "Data pendaftaran tidak lengkap." }, { status: 400 });
  }

  const payload = new URLSearchParams();
  payload.append("nama_lengkap", String(body.nama_lengkap));
  payload.append("whatsapp", String(body.whatsapp || ""));
  payload.append("gender", String(body.gender || ""));
  payload.append("jabatan", String(body.jabatan || "Official Member"));
  payload.append("instagram", String(body.instagram || ""));
  payload.append("bio_singkat", String(body.bio_singkat || ""));
  payload.append("fileData", String(body.fileData));
  payload.append("mimeType", String(body.mimeType));

  try {
    const scriptResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: payload,
    });
    const text = await scriptResponse.text();

    if (text.trim() === "Sukses") {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: text || "Gagal mendaftar." }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "Gagal terhubung ke server pendaftaran." }, { status: 502 });
  }
}
