import type { Metadata } from "next";
import MemberList from "@/components/MemberList";

export const metadata: Metadata = {
  title: "Daftar Anggota - Nganjuk Runners",
  description: "Mengenal lebih dekat anggota kita yang berdedikasi tinggi dalam memajukan olahraga lari di Nganjuk.",
};

export default function AnggotaPage() {
  return (
    <div className="pt-32 pb-24 bg-[#fbfbfb]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex flex-col items-center mb-16">
          <span className="text-neutral-600 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-3">
            Our Community
          </span>
          <h1 className="text-neutral-900 text-3xl sm:text-4xl font-extrabold tracking-tight uppercase italic">
            Daftar <span className="text-neutral-500 font-normal">Anggota</span>
          </h1>
          <p className="text-neutral-500 max-w-xl text-sm sm:text-base leading-relaxed mt-4">
            Mengenal lebih dekat anggota kita yang berdedikasi tinggi dalam memajukan olahraga lari di Nganjuk.
          </p>
        </div>

        <MemberList />
      </section>
    </div>
  );
}
