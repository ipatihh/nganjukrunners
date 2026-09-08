"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Heart, Shield, FileText } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

type PolicyType = "disclaimer" | "privacy" | "terms";

export default function Footer() {
  const [modalType, setModalType] = useState<PolicyType | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(!!modalType, modalRef);

  const policyData = {
    disclaimer: {
      title: "Medical Disclaimer",
      icon: <Heart className="w-5 h-5 text-neutral-900" />,
      text: "Aktivitas lari di nganjukrunners.or.id melibatkan risiko fisik. Kami menyarankan konsultasi medis sebelum mengikuti program lari. NJR tidak bertanggung jawab atas cedera yang timbul akibat partisipasi mandiri atau kelalaian kondisi fisik.",
    },
    privacy: {
      title: "Data Privacy",
      icon: <Shield className="w-5 h-5 text-neutral-900" />,
      text: "Kami menghormati privasi Anda. Data pendaftaran event atau merchandise di situs ini disimpan secara aman dan hanya digunakan untuk keperluan internal komunitas Nganjuk Runners. Kami tidak menjual data Anda kepada pihak ketiga.",
    },
    terms: {
      title: "Terms of Service",
      icon: <FileText className="w-5 h-5 text-neutral-900" />,
      text: "Dengan menggunakan situs ini, Anda setuju bahwa: 1. Penyalahgunaan sistem NJR akan diproses hukum. 2. Pendaftaran event melalui link pihak ketiga (Redirection) mengikuti aturan platform tujuan. 3. Keputusan panitia event NJR bersifat mutlak.",
    },
  };

  const handleOpenModal = (type: PolicyType) => {
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  useEffect(() => {
    if (!modalType) return;

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalType]);

  return (
    <footer className="bg-canvas text-neutral-600 pt-12 pb-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-neutral-100">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:items-start md:text-left">

        {/* Kontainer Kiri: Logo & Deskripsi Komunitas */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="block select-none" aria-label="Nganjuk Runners — Beranda">
            <Image
              src="/assets/img/brand/njr-logo.png"
              alt="Nganjuk Runners"
              width={838}
              height={312}
              className="h-10 w-auto transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <p className="text-neutral-600 text-sm max-w-sm leading-relaxed">
            Komunitas lari terbesar di Nganjuk. Mari ciptakan jejak sehat di setiap sudut Kota Angin bersama kami.
          </p>
        </div>

        {/* Kontainer Kanan: Sosial Media (Menggunakan Aksen Biru Muda #3699ff / sky-500) */}
        <div className="flex flex-col items-center md:items-end gap-4">
  <span className="font-extrabold uppercase tracking-widest text-xs text-neutral-800">
    Ikuti Kami
  </span>
  <div className="flex gap-4">
    {/* Instagram - Hover: Warna Gradasi Magenta-Orange */}
    <a
      href="https://instagram.com/nganjukrunners"
      target="_blank"
      rel="noopener noreferrer"
      // hover:text-white tetap kita pertahankan agar kontras saat background berubah warna.
      // Warna hover dikunci ke hex Instagram yang spesifik.
      className="w-12 h-12 bg-neutral-100 hover:bg-[#E1306C] text-neutral-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1 shadow-sm"
      aria-label="Instagram"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    </a>

    {/* TikTok - Hover: Warna Merah TikTok yang Spesifik */}
    <a
      href="https://tiktok.com/@nganjukrunners"
      target="_blank"
      rel="noopener noreferrer"
      // Logo diganti SVG, 'TT' dihapus. Hover warna TikTok.
      className="w-12 h-12 bg-neutral-100 hover:bg-[#FE2C55] text-neutral-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1 shadow-sm"
      aria-label="TikTok"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    </a>

    {/* Telegram - Hover: Warna Biru Telegram */}
    <a
      href="https://t.me/+EoB_rQ6bHbY2MDJl"
      target="_blank"
      rel="noopener noreferrer"
      // Logo diganti SVG, 'TG' dihapus. Hover warna Telegram.
      className="w-12 h-12 bg-neutral-100 hover:bg-[#0088CC] text-neutral-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1 shadow-sm"
      aria-label="Telegram"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M21.5 2L2 11.5l6.8 2.5L21.5 2z" />
        <path d="M8.8 14v5.7L12 16l-3.2-2z" />
        <path d="M12 16l6.5 5.5 3-19.5L12 16z" />
      </svg>
    </a>
  </div>
</div>
</div>

      {/* Bagian Bawah: Link Kebijakan Resmi & Hak Cipta */}
      <div className="max-w-7xl mx-auto border-t border-neutral-100 mt-12 pt-8 text-center">
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          <button
            onClick={() => handleOpenModal("disclaimer")}
            className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-sky-600 transition-colors duration-200"
          >
            Disclaimer
          </button>
          <button
            onClick={() => handleOpenModal("privacy")}
            className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-sky-600 transition-colors duration-200"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => handleOpenModal("terms")}
            className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-sky-600 transition-colors duration-200"
          >
            Terms of Service
          </button>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          © {new Date().getFullYear()} <span className="font-bold text-neutral-900">Nganjuk Runners</span>. Hak cipta dilindungi.{" "}
          <br className="sm:hidden" />
          Dikembangkan oleh{" "}
          <a
            href="https://kembar.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-neutral-900 hover:underline hover:text-sky-500 transition-colors duration-200"
          >
            kembar.in
          </a>
        </p>
      </div>

      {/* Modal Legal */}
      {modalType && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={policyData[modalType].title}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleCloseModal}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-[2rem] max-w-lg w-full p-8 md:p-10 relative shadow-[0_4px_30px_rgba(0,0,0,0.1)] text-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-neutral-100 text-neutral-900 px-3.5 py-1.5 rounded-full mb-3">
                Legal & Protection
              </span>
              <h2 className="text-2xl font-black text-neutral-900 uppercase italic">
                NJR <span className="text-neutral-500">Policy</span>
              </h2>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 mb-2 font-black uppercase text-sm tracking-wider">
                {policyData[modalType].icon}
                <span>{policyData[modalType].title}</span>
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed">
                {policyData[modalType].text}
              </p>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full bg-neutral-900 text-white font-extrabold text-xs tracking-wider uppercase py-4 rounded-xl mt-8 transition-colors hover:bg-neutral-800 active:scale-[0.98]"
            >
              Saya Mengerti & Setuju
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}