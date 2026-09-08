"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const asideRef = useRef<HTMLElement>(null);
  useFocusTrap(isOpen, asideRef);

  // Give the fixed header a shadow + blur once the page scrolls, so it stays
  // separated from white content underneath it.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/katalog", label: "Katalog Jersey" },
    { href: "/event", label: "Event" },
    { href: "/kolaborasi", label: "Kolaborasi" },
    { href: "/anggota", label: "Anggota" },
  ];

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 border-b transition-colors duration-200 ${
        isScrolled
          ? "bg-canvas/85 backdrop-blur-md border-neutral-200 shadow-sm"
          : "bg-canvas border-neutral-100"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">

        {/* Logo — cropped horizontal lockup, served locally from /public. */}
        <div className="flex items-center">
          <Link href="/" className="block select-none" aria-label="Nganjuk Runners — Beranda">
            <Image
              src="/assets/img/brand/njr-logo.png"
              alt="Nganjuk Runners"
              width={838}
              height={312}
              priority
              className="h-9 w-auto transition-transform duration-300 hover:scale-105 sm:h-10"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-semibold text-sm transition-colors duration-200 ${
                  isActive
                    ? "text-sky-600 border-b-2 border-sky-500 pb-1"
                    : "text-neutral-600 hover:text-sky-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/registrasi"
            className="bg-sky-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-sky-600 transition-all active:scale-95"
          >
            Gabung
          </Link>
        </div>

        {/* Burger Button Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        inert={!isOpen}
        className={`fixed top-0 right-0 h-full w-64 bg-canvas z-50 shadow-2xl flex flex-col p-8 md:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-600">Navigasi</span>
          <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-neutral-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`font-bold text-lg border-b border-neutral-100 pb-3 transition-colors ${
                  isActive ? "text-sky-600 border-sky-500" : "text-neutral-600 hover:text-sky-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/registrasi"
            onClick={() => setIsOpen(false)}
            className="bg-sky-500 text-white font-bold text-center text-sm uppercase tracking-wider py-3.5 rounded-2xl hover:bg-sky-600 transition-all"
          >
            Gabung Sekarang
          </Link>
        </div>
      </aside>
    </header>
  );
}