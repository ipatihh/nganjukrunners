// Aturan keranjang merchandise — satu sumber untuk browser (tampilan, tombol) dan api/pesan
// (validasi sebelum diteruskan ke core). Core tetap validator akhir: harga, kuota, dan
// ukuran dihitung ulang di sana.

import type { Katalog, Produk } from "./katalog";

export interface BarisKeranjang {
  produkId: number;
  /** null = produk tanpa ukuran. */
  ukuran: string | null;
  jumlah: number;
}

export function kunciBaris(baris: Pick<BarisKeranjang, "produkId" | "ukuran">): string {
  return `${baris.produkId}:${baris.ukuran ?? ""}`;
}

export function totalBarang(keranjang: readonly BarisKeranjang[]): number {
  return keranjang.reduce((sum, baris) => sum + baris.jumlah, 0);
}

/** Ukuran dengan ejaan panitia, atau null bila tidak ada di daftar produk itu. */
export function ukuranSah(produk: Produk, ukuran: string | null): string | null {
  if (!ukuran) return null;
  const dicari = ukuran.trim().toLowerCase();
  return produk.ukuran.find((u) => u.toLowerCase() === dicari) ?? null;
}

export interface Rincian {
  subtotal: number;
  biayaLayanan: number;
  total: number;
  barang: number;
}

/** Biaya layanan dihitung PER BARANG, sama seperti core (`calculateAdminFee` × jumlah baris). */
export function hitungRincian(katalog: Katalog, keranjang: readonly BarisKeranjang[]): Rincian {
  const harga = new Map(katalog.produk.map((p) => [p.id, p.harga]));
  const barang = totalBarang(keranjang);
  const subtotal = keranjang.reduce((sum, baris) => sum + (harga.get(baris.produkId) ?? 0) * baris.jumlah, 0);
  const biayaLayanan = katalog.biayaLayanan * barang;
  return { subtotal, biayaLayanan, total: subtotal + biayaLayanan, barang };
}

/**
 * Validasi keranjang terhadap katalog live. Baris yang sama (produk + ukuran) digabung.
 * Pesan ditulis untuk pembeli.
 */
export function validasiKeranjang(
  katalog: Katalog,
  masukan: unknown,
): { ok: true; keranjang: BarisKeranjang[] } | { ok: false; pesan: string } {
  if (!Array.isArray(masukan) || masukan.length === 0) return { ok: false, pesan: "Keranjang masih kosong." };
  if (masukan.length > 50) return { ok: false, pesan: "Isi keranjang tidak valid." };

  const produkById = new Map(katalog.produk.map((p) => [p.id, p]));
  const gabungan = new Map<string, BarisKeranjang>();

  for (const item of masukan) {
    if (!item || typeof item !== "object") return { ok: false, pesan: "Isi keranjang tidak valid." };
    const raw = item as Record<string, unknown>;
    const produk = produkById.get(Number(raw.produkId));
    if (!produk) return { ok: false, pesan: "Salah satu produk sudah tidak dijual. Muat ulang halaman." };

    const jumlah = Number(raw.jumlah);
    if (!Number.isInteger(jumlah) || jumlah < 1) return { ok: false, pesan: `Jumlah ${produk.nama} tidak valid.` };

    let ukuran: string | null = null;
    if (produk.ukuran.length > 0) {
      ukuran = ukuranSah(produk, typeof raw.ukuran === "string" ? raw.ukuran : null);
      if (!ukuran) return { ok: false, pesan: `Pilih ukuran ${produk.nama} yang tersedia.` };
    }

    const kunci = kunciBaris({ produkId: produk.id, ukuran });
    const ada = gabungan.get(kunci);
    gabungan.set(kunci, { produkId: produk.id, ukuran, jumlah: (ada?.jumlah ?? 0) + jumlah });
  }

  const keranjang = [...gabungan.values()];
  if (totalBarang(keranjang) > katalog.maksBarang) {
    return { ok: false, pesan: `Maksimal ${katalog.maksBarang} barang dalam satu pesanan.` };
  }
  for (const produk of katalog.produk) {
    if (produk.sisa === null) continue;
    const dipesan = keranjang.filter((b) => b.produkId === produk.id).reduce((sum, b) => sum + b.jumlah, 0);
    if (dipesan > produk.sisa) {
      return { ok: false, pesan: produk.sisa === 0 ? `${produk.nama} sudah habis.` : `${produk.nama} tersisa ${produk.sisa}.` };
    }
  }
  return { ok: true, keranjang };
}

/**
 * Satu barang = satu entri `participants[]` di core (PARTNER_INTEGRATION.md §4c). Nama dan
 * email pemesan disalin ke tiap barang; ukuran dikirim di `customFields.size`.
 */
export function bangunParticipants(keranjang: readonly BarisKeranjang[], pemesan: { nama: string; email: string }) {
  return keranjang.flatMap((baris) =>
    Array.from({ length: baris.jumlah }, () => ({
      nama: pemesan.nama,
      email: pemesan.email,
      ticketTypeId: baris.produkId,
      customFields: baris.ukuran ? { size: baris.ukuran } : {},
    })),
  );
}
