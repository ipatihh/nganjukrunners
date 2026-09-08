import type { Metadata } from "next";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Registrasi Anggota - Nganjuk Runners",
  description: "Formulir pendaftaran anggota resmi Nganjuk Runners Community.",
};

export default function RegistrasiPage() {
  return (
    <div className="pt-32 pb-24 bg-canvas flex items-center justify-center min-h-[80vh]">
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <RegisterForm />
      </section>
    </div>
  );
}
