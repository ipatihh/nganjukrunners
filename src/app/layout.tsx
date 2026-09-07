import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Nganjuk Runners - Lari Bareng, Seduluran Selawase",
  description: "Komunitas lari terbesar di Nganjuk. Mari ciptakan jejak sehat di setiap sudut Kota Angin bersama kami.",
  icons: {
    icon: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgSh2c33qQSXOebQHiU6RNNESecQXFhL8KJanS44G08tXN0JgB-zkAUZ8C4_F4bG03-1wPsaJMM7ATM1svsw3Gxb2OmXvWCr5SH_bfwKk5OHy_UMp8dcETX0UVSF5WjZEEEE4SdB3BZnQinEMCHY6Stg6nyDVvO3l-LfB9328JsSVJR6lJFkE6RxZCy2Gw/s2000/logo%20trans.png",
    apple: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgSh2c33qQSXOebQHiU6RNNESecQXFhL8KJanS44G08tXN0JgB-zkAUZ8C4_F4bG03-1wPsaJMM7ATM1svsw3Gxb2OmXvWCr5SH_bfwKk5OHy_UMp8dcETX0UVSF5WjZEEEE4SdB3BZnQinEMCHY6Stg6nyDVvO3l-LfB9328JsSVJR6lJFkE6RxZCy2Gw/s2000/logo%20trans.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#fbfbfb] text-neutral-900 font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-sky-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:text-sm focus:shadow-lg"
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
