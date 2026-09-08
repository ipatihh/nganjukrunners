import { ImageResponse } from "next/og";

// Static social share card (used for Open Graph + Twitter).
// Rendered at build time — no data dependency.
// NOTE: next/og uses satori — every <div> with more than one child MUST set an
// explicit display (flex / none). Keep the tree flat and flex-y.
export const alt = "Nganjuk Runners - Lari Bareng, Seduluran Selawase";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1773cf 0%, #0f4a88 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          Nganjuk Runners Community
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 92,
            fontWeight: 900,
            fontStyle: "italic",
            textTransform: "uppercase",
            lineHeight: 1.08,
            marginTop: 24,
          }}
        >
          <span>Lari Bareng,</span>
          <span>Seduluran Selawase.</span>
        </div>
        <div style={{ display: "flex", fontSize: 30, opacity: 0.9, marginTop: 32 }}>
          Komunitas lari terbesar di Nganjuk — Kota Angin.
        </div>
      </div>
    ),
    { ...size }
  );
}
