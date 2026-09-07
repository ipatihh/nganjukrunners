"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchMembers, Member } from "@/services/membersService";
import { Search, Loader2 } from "lucide-react";

const MAX_IMAGE_RETRIES = 2;

// Sub-component for individual Member Card to isolate image state and onError handling
function MemberCard({ member, getBadgeStyle }: { member: Member; getBadgeStyle: (jabatan: string) => string }) {
  const [retryCount, setRetryCount] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Fallback condition if visual URL is empty, drives empty UI avatars, or repeated load failures
  const showFallback = gaveUp || !member.imgUrl || member.imgUrl.includes("ui-avatars.com");

  // Hotlinked Google Drive photos occasionally fail on the first attempt (slow network,
  // transient throttling). Retry with a cache-busting param before giving up to the placeholder.
  const handleImageError = () => {
    if (retryCount < MAX_IMAGE_RETRIES) {
      setTimeout(() => setRetryCount((c) => c + 1), 700);
    } else {
      setGaveUp(true);
    }
  };

  const imgSrc =
    retryCount === 0 ? member.imgUrl : `${member.imgUrl}${member.imgUrl.includes("?") ? "&" : "?"}retry=${retryCount}`;

  return (
    <a
      href={member.instagram ? `https://instagram.com/${member.instagram}` : "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-[2rem] p-4 border border-neutral-100 shadow-[0_4px_30px_rgba(0,0,0,0.01)] transition-all duration-300 hover:border-neutral-300 hover:shadow-xl flex flex-col hover:-translate-y-1"
    >
      {/* Upper part: Photo ratio aspect 4:5 with rounded borders, no absolute positioning for text */}
      <div className="relative overflow-hidden rounded-2xl aspect-[4/5] mb-5 bg-neutral-100 border border-neutral-100 flex items-center justify-center">
        {showFallback ? (
          // Elegant SVG placeholder in Nganjuk Runners brand blue style
          <div className="w-full h-full bg-gradient-to-br from-neutral-50 to-neutral-100 flex flex-col items-center justify-center p-6 text-neutral-600 select-none">
            <svg
              className="w-16 h-16 text-sky-500 opacity-80 mb-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" />
              <circle cx="12" cy="8" r="2" />
              <path d="m14 13-2-1-2 1v4" />
              <path d="M12 16h2" />
              <path d="M10 16h2" />
            </svg>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-600">
              NJR Runner
            </span>
          </div>
        ) : (
          <>
            {!loaded && (
              <div className="absolute inset-0 animate-pulse bg-neutral-200" />
            )}
            <Image
              key={retryCount}
              src={imgSrc}
              alt={member.nama}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              unoptimized={true} // Bypass Next.js image optimization compression to prevent 400 errors or pixelation on hotlinked files
              onLoad={() => setLoaded(true)}
              onError={handleImageError}
            />
          </>
        )}
      </div>

      {/* Lower part: Info text outside of image area */}
      <div className="px-1 flex flex-col flex-grow justify-between">
        <div>
          <div
            className={`self-start px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider inline-block mb-3.5 select-none ${getBadgeStyle(
              member.jabatan
            )}`}
          >
            {member.jabatan}
          </div>
          <div className="text-neutral-900 font-bold text-base mb-1.5 leading-tight group-hover:text-sky-500 transition-colors">
            {member.nama}
          </div>
          <div className="text-neutral-600 text-xs italic mb-4 line-clamp-2 leading-relaxed">
            &ldquo;{member.bio || "Semangat Lari!"}&rdquo;
          </div>
        </div>

        <div className="pt-3.5 border-t border-neutral-100 mt-auto flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-neutral-600">
            <span>WHATSAPP</span>
            <span className="text-neutral-600 font-medium">{member.wa || "-"}</span>
          </div>
          {member.instagram && (
            <span className="text-sky-500 font-black text-[10px] tracking-wide block mt-1 hover:underline">
              @{member.instagram}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "official" | "atlet">("all");

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await fetchMembers();
        if (data && data.length > 0) {
          setMembers(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed loading members:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  const getBadgeStyle = (jabatan: string) => {
    switch (jabatan) {
      case "Captain":
        return "bg-neutral-950 text-white";
      case "Bendahara":
        return "bg-neutral-900 text-white";
      case "Media & Kreatif":
        return "bg-neutral-800 text-neutral-100";
      case "Atlet":
        return "bg-neutral-700 text-neutral-100";
      default:
        return "bg-neutral-100 text-neutral-800 border border-neutral-200";
    }
  };

  const handleTabChange = (tab: "all" | "official" | "atlet") => {
    setActiveTab(tab);
  };

  // Filter members based on search query and tabs
  const filteredMembers = members?.filter((member) => {
    const matchesSearch =
      member.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const isAtlet = member.jabatan === "Atlet";

    if (activeTab === "atlet") {
      return matchesSearch && isAtlet;
    }
    if (activeTab === "official") {
      return matchesSearch && !isAtlet;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-neutral-600">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-4" />
        <p className="text-sm font-semibold tracking-wide uppercase text-neutral-500">
          Menyusun barisan pelari...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-neutral-500 border border-dashed border-neutral-200 rounded-3xl">
        <p className="font-bold">Gagal memuat data anggota.</p>
        <p className="text-xs mt-2 text-neutral-600">
          Silakan periksa koneksi internet Anda atau coba muat kembali halaman.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Search and Tabs */}
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Cari nama atau status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 pl-12 bg-white border border-neutral-200 rounded-full text-sm text-center outline-none transition-all focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-neutral-900 placeholder-neutral-400 font-medium"
          />
          <Search className="w-4 h-4 text-neutral-600 absolute left-6 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex gap-2.5 justify-center flex-wrap select-none">
          <button
            onClick={() => handleTabChange("all")}
            className={`px-5 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
              activeTab === "all"
                ? "bg-sky-500 text-white border-sky-500"
                : "bg-white text-neutral-500 border-neutral-200 hover:text-sky-500 hover:border-sky-500"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => handleTabChange("official")}
            className={`px-5 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
              activeTab === "official"
                ? "bg-sky-500 text-white border-sky-500"
                : "bg-white text-neutral-500 border-neutral-200 hover:text-sky-500 hover:border-sky-500"
            }`}
          >
            Anggota
          </button>
          <button
            onClick={() => handleTabChange("atlet")}
            className={`px-5 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
              activeTab === "atlet"
                ? "bg-sky-500 text-white border-sky-500"
                : "bg-white text-neutral-500 border-neutral-200 hover:text-sky-500 hover:border-sky-500"
            }`}
          >
            Atlet
          </button>
        </div>
      </div>

      {/* Grid List */}
      {filteredMembers && filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers?.map((member, idx) => (
            <MemberCard key={idx} member={member} getBadgeStyle={getBadgeStyle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-neutral-600 border border-dashed border-neutral-200 rounded-3xl">
          Anggota tidak ditemukan.
        </div>
      )}
    </div>
  );
}
