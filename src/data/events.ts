export interface EventItem {
  id: string;
  title: string;
  year: string;
  location: string;
  description: string;
  status: "open" | "closed";
  statusText: string;
  link?: string;
  poster: string;
}

export const events: EventItem[] = [
  {
    id: "adhyaksa",
    title: "ADHYAKSA NIGHT RUN 2026",
    year: "2026",
    location: "Nganjuk, Jawa Timur",
    description: "Event Adhyaksa Night Run 2026 Memperingati Ulang Tahun Kejaksaan dan berkolaborasi dengan Nganjuk Runners.",
    status: "closed",
    statusText: "Past Event",
    link: "https://kembar.in/adhyaksa/",
    poster: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgw_jX9-ScVi0t_eRcuwnLFakMC_ww3l2D2V55iBa5YrZgAkWYulTPA-9WZExCotH-AplqdTSyVypn4Wp6u4DB63xJMQ9iitqrvFbCke3X-Xvc738qhYvn3k2-1s6TTSs4woBEFmBherfcQ1aFejVfC-5mjOwZtb7VY8OuVnbrsULisWnsgppDsyoyUVHk/s1350/WhatsApp%20Image%202026-08-05%20at%2021.18.43.jpeg",
  },
  {
    id: "run-fest-2026",
    title: "RUN FEST FAMILY NGANJUK 2026",
    year: "2026",
    location: "Nganjuk, Jawa Timur",
    description: "Event Run Fest Family 2026 diinisiasi oleh Forum Genre Anjuk Ladang dan berkolaborasi dengan Nganjuk Runners.",
    status: "closed",
    statusText: "Past Event",
    link: "https://runfest.nganjukrunners.or.id",
    poster: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgbJogC3KldbfBvBwlLGmCa1lUrYIpgA5C1rivdztmRmcJA9DMhy2JJejqyj2iNqzQzgK2aYwL8YfDhKDL99YCP0WHKjozaItHabJ_dyy7rICG2HfwXuonjefj7EA89AmhUqCDSAJH1U58U4QV6C67x6r9mq0J78BWBvsxi8yCskVnL-pJ41lgARc5WB8c/s6250/Pamflet%20Runfest%20Family_20260509_094409_0000.png",
  },
  {
    id: "luwes-run-2026",
    title: "LUWES NGANJUK RUN 2026",
    year: "2026",
    location: "Nganjuk, Jawa Timur",
    description: "Event kolaborasi perdana menandai perjalanan sewindu Luwes Nganjuk di Kota Angin. Segera amankan slotmu!",
    status: "closed",
    statusText: "Past Event",
    link: "https://luwes.nganjukrunners.or.id",
    poster: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEic-qCOXr0aGVbDkgiEdfCYtakyza_CeEsrZDTDhMcuBaZg8w92R9sSm10ZUVeMkYCTQKIu9qiu7h9Nr6RD8iDjCbmk_cI_vemIdss6-ijUce4gbKn2n-emccmFLz-1js-EhNq3wUdCAT7ZwCQ4vV6eD3-SH39ht0e45UtfRqcDHguI2_11TVAiOs73eyyf/s4219/Flayer%20Utama%202.png",
  },
  {
    id: "sedudo-vertical-run-2025",
    title: "Sedudo Vertical Run",
    year: "2025",
    location: "Sawahan, Nganjuk",
    description: "Kompetisi lari vertikal yang menantang dengan rute bersejarah di Sawahan, Nganjuk.",
    status: "closed",
    statusText: "Past Event",
    poster: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiE6pTY8R8CsnY-vHkWbNNNK1C8xjee5pdM1jtlGxGxwQMDTmGH4Df9b6LOfThfRXvG7Q3KOSFGc-hk1X64oZ-KYcpMs4XQpXVwZvZJ3JGujR5g2JXxJKlhdV4AP9zP0xzZ6MmsV6kNQhvFjAQ4c5XMn9vWPgzt9uJS0v-NTDHSgwT_DItH2Bfiz5E2YnI/s6048/PLA_6573.jpeg",
  },
];
