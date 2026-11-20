/**
 * Data terstruktur (schema.org) situs ini. Sumber tunggal supaya nama/URL tidak
 * berbeda antar halaman.
 *
 * Peran PT KEMBAR INOVASI INDONESIA dinyatakan eksplisit untuk mesin pencari:
 * pengembang situs dan mitra pemesanan/pendaftaran. `@id` WAJIB sama dengan node
 * Organization di kembar.in (`https://kembar.in/#organization`) supaya Google
 * menyatukannya sebagai satu entitas — kontrak: docs/PARTNER_INTEGRATION.md §13
 * di repo kembarin-v2.
 */
export const SITE_URL = "https://nganjukrunners.or.id";
export const SITE_NAME = "Nganjuk Runners";
export const NAMA_PENGEMBANG = "PT KEMBAR INOVASI INDONESIA";
export const URL_PENGEMBANG = "https://kembar.in";

const orgKomunitas = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organisasi`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  address: { "@type": "PostalAddress", addressLocality: "Nganjuk", addressRegion: "Jawa Timur", addressCountry: "ID" },
};

const orgPengembang = {
  "@type": "Organization",
  "@id": `${URL_PENGEMBANG}/#organization`,
  name: NAMA_PENGEMBANG,
  legalName: NAMA_PENGEMBANG,
  alternateName: ["KEMBAR.IN", "Kembarin"],
  url: URL_PENGEMBANG,
  description: "Pengembang situs nganjukrunners.or.id sekaligus mitra resmi pemesanan dan ticketing.",
};

export const jsonLdSitus = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#situs`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      inLanguage: "id-ID",
      publisher: { "@id": orgKomunitas["@id"] },
      creator: { "@id": orgPengembang["@id"] },
      provider: { "@id": orgPengembang["@id"] },
    },
    orgKomunitas,
    orgPengembang,
  ],
};

/** Meta pelengkap bagi crawler lain; sinyal utama Google tetap JSON-LD di atas. */
export const META_MITRA = {
  developer: NAMA_PENGEMBANG,
  "registration-partner": NAMA_PENGEMBANG,
  "ticketing-partner": NAMA_PENGEMBANG,
} as const;

/** "<" di-escape supaya teks tidak bisa menutup tag script. */
export const serialisasiJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
