import type { EventItem } from "@/data/events";
import { bloggerImage } from "@/lib/images";

/**
 * Data terstruktur (schema.org) situs ini. Sumber tunggal supaya nama/URL tidak
 * berbeda antar halaman.
 *
 * Dua peran yang dinyatakan ke Google:
 *   1. Nganjuk Runners = komunitas lari (SportsOrganization) di Kabupaten Nganjuk.
 *   2. nganjukrunners.or.id = pusat info event lari di Nganjuk: setiap event ber-
 *      `startDate` di src/data/events.ts ditulis sebagai SportsEvent, dan /event
 *      adalah CollectionPage yang memuat daftarnya.
 *
 * Peran PT KEMBAR INOVASI INDONESIA dinyatakan eksplisit untuk mesin pencari:
 * pengembang situs dan mitra pemesanan/pendaftaran. `@id` WAJIB sama dengan node
 * Organization di kembar.in (`https://kembar.in/#organization`) supaya Google
 * menyatukannya sebagai satu entitas — kontrak: docs/PARTNER_INTEGRATION.md §13
 * di repo kembarin-v2.
 */
// Host www: nganjukrunners.or.id selalu dialihkan (308) ke www, jadi canonical,
// sitemap, dan @id memakai host tujuan akhir.
export const SITE_URL = "https://www.nganjukrunners.or.id";
export const SITE_NAME = "Nganjuk Runners";
export const SITE_TITLE = "Nganjuk Runners - Komunitas Lari & Jadwal Event Lari Nganjuk";
export const SITE_DESC =
  "Komunitas lari terbesar di Nganjuk sekaligus pusat info jadwal dan pendaftaran event lari di Kabupaten Nganjuk, Jawa Timur. Lari bareng, seduluran selawase.";
export const NAMA_PENGEMBANG = "PT KEMBAR INOVASI INDONESIA";
export const URL_PENGEMBANG = "https://kembar.in";

export const SOSIAL_MEDIA = [
  "https://www.instagram.com/nganjukrunners",
  "https://www.tiktok.com/@nganjukrunners",
];

const alamatNganjuk = {
  "@type": "PostalAddress",
  addressLocality: "Nganjuk",
  addressRegion: "Jawa Timur",
  addressCountry: "ID",
};

const ID_KOMUNITAS = `${SITE_URL}/#organisasi`;
const ID_PENGEMBANG = `${URL_PENGEMBANG}/#organization`;

const orgKomunitas = {
  "@type": "SportsOrganization",
  "@id": ID_KOMUNITAS,
  name: SITE_NAME,
  alternateName: ["NJR", "Nganjuk Runners Community"],
  description:
    "Komunitas lari di Kabupaten Nganjuk, Jawa Timur: lari bareng rutin, race management, dan kolaborasi event lari di Kota Angin.",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/assets/img/brand/njr-logo.png`,
  image: `${SITE_URL}/opengraph-image`,
  sport: "Running",
  areaServed: { "@type": "AdministrativeArea", name: "Kabupaten Nganjuk" },
  address: alamatNganjuk,
  sameAs: SOSIAL_MEDIA,
};

const orgPengembang = {
  "@type": "Organization",
  "@id": ID_PENGEMBANG,
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
      description: SITE_DESC,
      inLanguage: "id-ID",
      about: [{ "@id": ID_KOMUNITAS }, { "@type": "Thing", name: "Event lari di Nganjuk" }],
      publisher: { "@id": ID_KOMUNITAS },
      creator: { "@id": ID_PENGEMBANG },
      provider: { "@id": ID_PENGEMBANG },
    },
    orgKomunitas,
    orgPengembang,
  ],
};

const idEvent = (e: EventItem) => `${SITE_URL}/event#${e.id}`;

/** Event yang boleh ditulis sebagai SportsEvent: hanya yang tanggalnya diketahui. */
const eventTerstruktur = (daftar: EventItem[]) => daftar.filter((e) => e.startDate);

function sportsEvent(e: EventItem) {
  return {
    "@type": "SportsEvent",
    "@id": idEvent(e),
    name: e.title,
    description: e.description,
    url: e.link ?? `${SITE_URL}/event`,
    image: [bloggerImage(e.poster, 1000)],
    sport: "Running",
    startDate: e.startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    isAccessibleForFree: false,
    inLanguage: "id-ID",
    location: {
      "@type": "Place",
      name: e.venue ?? e.location,
      address: alamatNganjuk,
    },
    // Penyelenggara sebenarnya; Nganjuk Runners hanya ditulis bila ikut menangani.
    ...(e.organizer && {
      organizer: { "@type": "Organization", name: e.organizer.name, ...(e.organizer.url && { url: e.organizer.url }) },
    }),
    ...(e.byNganjukRunners && { contributor: { "@id": ID_KOMUNITAS } }),
    // Harga sengaja tidak ditulis di sini: bisa berubah di core dan basi di repo.
    ...(e.status === "open" &&
      e.link && {
        offers: {
          "@type": "Offer",
          url: e.link,
          availability: "https://schema.org/InStock",
          seller: { "@id": ID_PENGEMBANG },
        },
      }),
  };
}

/** JSON-LD halaman /event: daftar resmi event lari di Nganjuk. */
export function jsonLdHalamanEvent(daftar: EventItem[]) {
  const terstruktur = eventTerstruktur(daftar);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/event#halaman`,
        url: `${SITE_URL}/event`,
        name: "Jadwal Event Lari Nganjuk",
        inLanguage: "id-ID",
        isPartOf: { "@id": `${SITE_URL}/#situs` },
        publisher: { "@id": ID_KOMUNITAS },
        about: { "@type": "Thing", name: "Event lari di Kabupaten Nganjuk" },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: terstruktur.map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: { "@id": idEvent(e) },
          })),
        },
      },
      ...terstruktur.map(sportsEvent),
    ],
  };
}

/** JSON-LD beranda: event yang pendaftarannya sedang dibuka. */
export function jsonLdEventDibuka(daftar: EventItem[]) {
  const dibuka = eventTerstruktur(daftar).filter((e) => e.status === "open");
  if (dibuka.length === 0) return null;
  return { "@context": "https://schema.org", "@graph": dibuka.map(sportsEvent) };
}

/** Meta pelengkap bagi crawler lain; sinyal utama Google tetap JSON-LD di atas. */
export const META_MITRA = {
  developer: NAMA_PENGEMBANG,
  "registration-partner": NAMA_PENGEMBANG,
  "ticketing-partner": NAMA_PENGEMBANG,
} as const;

/** "<" di-escape supaya teks tidak bisa menutup tag script. */
export const serialisasiJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
