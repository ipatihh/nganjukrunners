import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Hanya halaman publik yang layak muncul di Google. /katalog/status dan /api tidak
// dimasukkan (lihat robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const halaman: { path: string; changeFrequency: "daily" | "weekly" | "monthly"; priority: number }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/event", changeFrequency: "weekly", priority: 0.9 },
    { path: "/katalog", changeFrequency: "weekly", priority: 0.6 },
    { path: "/anggota", changeFrequency: "monthly", priority: 0.5 },
    { path: "/kolaborasi", changeFrequency: "monthly", priority: 0.5 },
    { path: "/registrasi", changeFrequency: "monthly", priority: 0.4 },
  ];
  return halaman.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "/" : path}`,
    changeFrequency,
    priority,
  }));
}
