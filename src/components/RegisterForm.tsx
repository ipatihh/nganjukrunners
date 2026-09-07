"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Check, RefreshCw, Upload, Info } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    whatsapp: "",
    gender: "Laki-laki",
    jabatan: "Official Member",
    instagram: "",
    bio_singkat: "",
    website: "", // honeypot: real users never see or fill this field
  });

  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (errorMsg) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errorMsg]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMsg("Ukuran foto terlalu besar! Maksimal adalah 10 MB.");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setFile(selectedFile);
        setErrorMsg("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_lengkap) {
      setErrorMsg("Nama Lengkap wajib diisi!");
      return;
    }
    if (!file) {
      setErrorMsg("Foto Profil wajib diunggah!");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = event.target?.result as string;
        const base64 = result.split(",")[1];

        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_lengkap: formData.nama_lengkap,
            whatsapp: formData.whatsapp,
            gender: formData.gender,
            jabatan: formData.jabatan,
            instagram: formData.instagram,
            bio_singkat: formData.bio_singkat,
            website: formData.website,
            fileData: base64,
            mimeType: file.type,
          }),
        });

        const result_ = await response.json();
        if (response.ok && result_.success) {
          setSuccess(true);
          setFormData({
            nama_lengkap: "",
            whatsapp: "",
            gender: "Laki-laki",
            jabatan: "Official Member",
            instagram: "",
            bio_singkat: "",
            website: "",
          });
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          throw new Error(result_.error || "Gagal mendaftar.");
        }
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg(`Gagal mendaftar: ${error.message || "Terjadi kesalahan koneksi"}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg("Gagal membaca file foto.");
      setIsSubmitting(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-2xl bg-white border border-neutral-100 rounded-[2.5rem] p-8 md:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.01)] text-neutral-900">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-50 text-neutral-900 mb-6 border border-neutral-100">
          <User className="w-7 h-7" />
        </div>
        <span className="block text-neutral-600 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-2">
          Join the Movement
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-neutral-950 tracking-tight uppercase italic">
          Registrasi <span className="text-neutral-500 font-normal">Anggota</span>
        </h2>
        <p className="text-neutral-500 mt-2 text-sm leading-relaxed max-w-sm mx-auto">
          Lengkapi data dirimu di bawah ini untuk menjadi bagian resmi dari Nganjuk Runners Community.
        </p>
      </div>

      {success ? (
        <div className="text-center py-10 space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 border border-green-100">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-neutral-950">Pendaftaran Berhasil!</h3>
          <p className="text-neutral-500 text-sm max-w-sm mx-auto leading-relaxed">
            Selamat bergabung di Nganjuk Runners. Data profil Anda sedang diproses ke database kami.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              router.push("/anggota");
            }}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-xl transition duration-300"
          >
            Lihat Daftar Anggota
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div
              ref={errorRef}
              role="alert"
              aria-live="assertive"
              className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs flex items-start gap-2"
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-neutral-700 font-bold text-xs uppercase tracking-wider mb-2">
              Nama Lengkap
            </label>
            <input
              name="nama_lengkap"
              required
              type="text"
              value={formData.nama_lengkap}
              onChange={handleInputChange}
              placeholder="Sesuai kartu identitas"
              className="w-full px-5 py-4 bg-[#fbfbfb] border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-800 placeholder-neutral-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-neutral-700 font-bold text-xs uppercase tracking-wider mb-2">
                WhatsApp
              </label>
              <div className="relative">
                <input
                  name="whatsapp"
                  required
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="Contoh: 08123456789"
                  className="w-full pl-12 pr-5 py-4 bg-[#fbfbfb] border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-800 placeholder-neutral-400 font-medium"
                />
                <Phone className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600" />
              </div>
            </div>
            <div>
              <label className="block text-neutral-700 font-bold text-xs uppercase tracking-wider mb-2">
                Jenis Kelamin
              </label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-[#fbfbfb] border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-800 cursor-pointer font-medium"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-neutral-700 font-bold text-xs uppercase tracking-wider mb-2">
              Jabatan Keanggotaan
            </label>
            <div className="w-full px-5 py-4 bg-[#fbfbfb] border border-neutral-200 rounded-xl text-sm text-neutral-800 font-medium flex items-center justify-between">
              <span>Official Member</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                Jabatan lain belum dibuka
              </span>
            </div>
          </div>

          {/* Honeypot: invisible to real users, but bots that auto-fill every field trip it */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-neutral-700 font-bold text-xs uppercase tracking-wider mb-2">
              Username Instagram
            </label>
            <div className="relative">
              <input
                name="instagram"
                type="text"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="nganjukrunners (Tanpa @)"
                className="w-full pl-12 pr-5 py-4 bg-[#fbfbfb] border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-800 placeholder-neutral-400 font-medium"
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-neutral-700 font-bold text-xs uppercase tracking-wider mb-2">
              Bio Singkat
            </label>
            <textarea
              name="bio_singkat"
              rows={3}
              value={formData.bio_singkat}
              onChange={handleInputChange}
              placeholder="Tulis kutipan lari atau moto olahraga favoritmu..."
              className="w-full px-5 py-4 bg-[#fbfbfb] border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-all text-neutral-800 placeholder-neutral-400 resize-none font-medium"
            />
          </div>

          <div>
            <label className="block text-neutral-700 font-bold text-xs uppercase tracking-wider mb-2">
              Foto Profil <span className="text-neutral-600 font-normal text-[10px] lowercase">(Maks 10MB)</span>
            </label>
            <div className="relative border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center hover:border-neutral-400 transition-colors">
              <input
                accept="image/*"
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-neutral-600" />
                <span className="text-sm font-semibold text-neutral-900">
                  {file ? file.name : "Pilih file gambar profil"}
                </span>
                <span className="text-xs text-neutral-600">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "JPG, PNG, atau WEBP hingga 10MB"}
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-neutral-900 text-white font-extrabold text-xs tracking-widest uppercase py-4.5 rounded-xl shadow-lg hover:bg-neutral-800 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sedang Mengirim...</span>
              </>
            ) : (
              <span>Gabung Sekarang</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
