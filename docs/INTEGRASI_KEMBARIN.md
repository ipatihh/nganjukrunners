# Merchandise lewat KEMBAR.IN

Halaman `/katalog` menjual merchandise lewat core KEMBAR.IN. Situs ini **tidak menyimpan
katalog**: produk, harga, foto, keterangan, label, pilihan ukuran, kuota, biaya layanan,
buka/tutup pemesanan, dan info pengambilan diatur panitia di dashboard KEMBAR.IN (event
berjenis **Merchandise**). Produk atau ukuran baru tampil di sini tanpa coding.

Kontrak lengkap: `kembarin-v2/docs/PARTNER_INTEGRATION.md` (§4c Merchandise). Polanya sama
dengan situs smadarun.

## Alur

```
/katalog (server)        → GET  {core}/api/public/events/{kode}      katalog live (cache 30 dtk)
keranjang → /api/pesan   → POST {core}/api/participants/register     satu barang = satu baris
gateway bayar            → /katalog/status?order=KBR-…               tujuan kembali (partnerReturnUrl)
/api/status-pesanan      → POST {core}/api/public/orders/status      status dengan token
```

- Data pemesan diisi sekali dan disalin ke tiap barang; ukuran dikirim di `customFields.size`.
- Harga, biaya layanan (per barang), kuota, dan ukuran dihitung ulang core. Validasi di
  `/api/pesan` hanya saringan supaya pembeli mendapat pesan yang jelas lebih awal.
- `sessionId` satu per isi keranjang: kirim ulang setelah hasil "belum pasti" memakai pesanan
  yang sama, bukan membuat yang baru.
- Tautan bayar hanya dibuka bila domainnya gateway resmi (`src/lib/kembarin/paymentUrl.ts`).
- Kode pesanan + token status disimpan di localStorage peramban tempat memesan (tanpa data
  pribadi), untuk halaman `/katalog/status`.
- Email konfirmasi, QR pengambilan, dan kabar "Siap Diambil" dikirim core, bukan situs ini.
- Pengiriman ke luar kota diurus manual lewat WhatsApp panitia (`src/data/kontak.ts`), di luar
  sistem pemesanan: yang dibayar online hanya barang dan biaya layanan; alamat, ongkir, dan resi
  tidak tercatat di KEMBAR.IN. Setelah paket dikirim, panitia menandai barangnya "diambil" di
  dashboard supaya QR pengambilan tidak bisa dipakai lagi.

## Kode

| Berkas | Isi |
|---|---|
| `src/lib/kembarin/katalog.ts` | Membaca katalog dari core. |
| `src/lib/kembarin/keranjang.ts` | Aturan keranjang, dipakai browser dan server. |
| `src/lib/kembarin/kontrakPesanan.ts` | Menafsirkan jawaban core: berhasil / ditolak / belum pasti. |
| `src/lib/kembarin/statusPesanan.ts` | Status pesanan dan penyimpanan token di peramban. |
| `src/lib/kembarin/proxyCore.ts` | IP, batas laju, asal permintaan, header partner, log tanpa data pribadi. |
| `src/app/api/pesan/route.ts` | Meneruskan pesanan ke core. |
| `src/app/api/status-pesanan/route.ts` | Meneruskan pemeriksaan status. |

## Persiapan sebelum tayang

1. Di KEMBAR.IN: event jenis Merchandise, produk + ukuran + harga di Edit Detail, matikan
   Coming Soon, isi **Tiket dijual di** = `https://www.nganjukrunners.or.id/katalog` (pakai `www`: alamat tanpa www dialihkan ke www, dan core hanya memulangkan pembeli ke host yang sama persis).
2. Buat secret acak 32+ karakter. Core: tambahkan `nganjukrunners:<secret>` ke
   `TRUSTED_PARTNER_KEYS`. Situs ini: isi `KEMBAR_IN_PARTNER_KEY` dengan secret yang sama.
3. Isi `KEMBAR_IN_MERCH_EVENT_CODE` (lihat `.env.example`).
4. Uji satu pesanan sungguhan sampai email konfirmasi dan halaman status lunas.

Catatan: endpoint publik core belum menyaring produk "Internal" (`is_public = 0`); jangan
memakai sakelar Internal untuk produk merchandise — produknya tampil tetapi ditolak saat dibayar.
