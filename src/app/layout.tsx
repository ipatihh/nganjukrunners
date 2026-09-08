import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Inter is a variable font — do NOT pass a `weight` array (that forces static
// instances and ships more CSS). The variable file covers 100–900.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const SITE_URL = "https://nganjukrunners.or.id";
const SITE_NAME = "Nganjuk Runners";
const SITE_DESC =
  "Komunitas lari terbesar di Nganjuk. Mari ciptakan jejak sehat di setiap sudut Kota Angin bersama kami.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nganjuk Runners - Lari Bareng, Seduluran Selawase",
    template: "%s - Nganjuk Runners",
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: ["Nganjuk Runners", "komunitas lari Nganjuk", "lari", "running", "Kota Angin"],
  // Favicon + touch icon come from src/app/icon.png and src/app/apple-icon.png
  // (Next file conventions). The OG/Twitter card comes from src/app/opengraph-image.tsx.
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Nganjuk Runners - Lari Bareng, Seduluran Selawase",
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: "Nganjuk Runners - Lari Bareng, Seduluran Selawase",
    description: SITE_DESC,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-canvas text-neutral-900 font-sans">
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
