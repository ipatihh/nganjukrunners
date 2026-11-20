import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { META_MITRA, SITE_DESC, SITE_NAME, SITE_TITLE, SITE_URL, jsonLdSitus, serialisasiJsonLd } from "@/lib/seo";

// Inter is a variable font — do NOT pass a `weight` array (that forces static
// instances and ships more CSS). The variable file covers 100–900.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s - Nganjuk Runners",
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: [
    "Nganjuk Runners",
    "komunitas lari Nganjuk",
    "event lari Nganjuk",
    "jadwal lari Nganjuk",
    "fun run Nganjuk",
    "Kota Angin",
  ],
  // Canonical TIDAK dipasang di sini (akan diwarisi semua halaman); tiap halaman
  // memasang `alternates.canonical` sendiri.
  // Favicon + touch icon come from src/app/icon.png and src/app/apple-icon.png
  // (Next file conventions). The OG/Twitter card comes from src/app/opengraph-image.tsx.
  openGraph: {
    type: "website",
    locale: "id_ID",
    // Tanpa `url`: nilai di root layout diwarisi semua halaman dan membuat setiap
    // halaman mengaku sebagai beranda.
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  // Pelengkap bagi crawler lain; sinyal utama untuk Google adalah JSON-LD (lib/seo.ts).
  other: { ...META_MITRA },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-canvas text-neutral-900 font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialisasiJsonLd(jsonLdSitus) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-sky-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:text-sm focus:shadow-lg"
        >
          Lewati ke konten utama
        </a>
        <Header />
        <main id="main-content" className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
