export interface GalleryImage {
  src: string;
  caption: string;
}

export interface GalleryAlbum {
  id: string;
  cover: string;
  title: string;
  category: string;
  date: string;
  images: GalleryImage[];
}

export const galleryAlbums: GalleryAlbum[] = [
  {
    id: "album-adhyaksa",
    cover: "/assets/img/adhyaksa/pahri1.JPG",
    title: "ADHYAKSA NIGHT RUN 2026",
    category: "Kolaborasi",
    date: "5 Agustus 2026",
    images: [
      { src: "/assets/img/adhyaksa/pahri1.JPG", caption: "ADHYAKSA NIGHT RUN 2026" },
      { src: "/assets/img/adhyaksa/PLA_1523.JPG", caption: "ADHYAKSA NIGHT RUN 2026" },
      { src: "/assets/img/adhyaksa/pahri2.JPG", caption: "ADHYAKSA NIGHT RUN 2026" },
      { src: "/assets/img/adhyaksa/PLA_1541.JPG", caption: "ADHYAKSA NIGHT RUN 2026" },
      { src: "/assets/img/adhyaksa/PLA_1550.JPG", caption: "ADHYAKSA NIGHT RUN 2026" },
      { src: "/assets/img/adhyaksa/PLA_1592.JPG", caption: "ADHYAKSA NIGHT RUN 2026" },
      { src: "/assets/img/adhyaksa/PLA_1611.JPG", caption: "ADHYAKSA NIGHT RUN 2026" },
      { src: "/assets/img/adhyaksa/PLA_7130.JPG", caption: "ADHYAKSA NIGHT RUN 2026" },
      { src: "/assets/img/adhyaksa/PLA_7136.JPG", caption: "ADHYAKSA NIGHT RUN 2026" },
      { src: "/assets/img/adhyaksa/IMG_4342.jpg", caption: "ADHYAKSA NIGHT RUN 2026" },
    ],
  },
  {
    id: "album-luwes",
    cover: "/assets/img/luwes/PLA_1392.JPG",
    title: "LUWES NGANJUK RUN 2026",
    category: "Kolaborasi",
    date: "31 Mei 2026",
    images: [
      { src: "/assets/img/luwes/PLA_1392.JPG", caption: "LUWES NGANJUK RUN 2026" },
      { src: "/assets/img/luwes/IMG_2649.jpg", caption: "LUWES NGANJUK RUN 2026" },
      { src: "/assets/img/luwes/1.jpeg", caption: "LUWES NGANJUK RUN 2026" },
      { src: "/assets/img/luwes/2.jpeg", caption: "LUWES NGANJUK RUN 2026" },
      { src: "/assets/img/luwes/3.jpeg", caption: "LUWES NGANJUK RUN 2026" },
      { src: "/assets/img/luwes/4.jpeg", caption: "LUWES NGANJUK RUN 2026" },
      { src: "/assets/img/luwes/5.jpeg", caption: "LUWES NGANJUK RUN 2026" },
    ],
  },
  {
    id: "album-dwie",
    cover: "/assets/img/dwieshop/IMG_7606.jpg",
    title: "DWIE SHOP FUN RUN 2026",
    category: "Kolaborasi",
    date: "15 Februari 2026",
    images: [
      { src: "/assets/img/dwieshop/IMG_7606.jpg", caption: "DWIE SHOP FUN RUN 2026" },
      { src: "/assets/img/dwieshop/IMG_2272.jpg", caption: "DWIE SHOP FUN RUN 2026" },
      { src: "/assets/img/dwieshop/IMG_6460.jpg", caption: "DWIE SHOP FUN RUN 2026" },
      { src: "/assets/img/dwieshop/IMG_6484.jpeg", caption: "DWIE SHOP FUN RUN 2026" },
      { src: "/assets/img/dwieshop/IMG_6492.jpg", caption: "DWIE SHOP FUN RUN 2026" },
      { src: "/assets/img/dwieshop/IMG_6511.jpg", caption: "DWIE SHOP FUN RUN 2026" },
      { src: "/assets/img/dwieshop/IMG_6861.JPG", caption: "DWIE SHOP FUN RUN 2026" },
      { src: "/assets/img/dwieshop/IMG_7510.jpg", caption: "DWIE SHOP FUN RUN 2026" },
      { src: "/assets/img/dwieshop/IMG_7603.jpg", caption: "DWIE SHOP FUN RUN 2026" },
    ],
  },
  {
    id: "album-pocari",
    cover: "/assets/img/pocari/1.JPG",
    title: "POCARI SWEAT VIRTUAL RUN 2025",
    category: "Kolaborasi",
    date: "20 Juli 2025",
    images: [
      { src: "/assets/img/pocari/1.JPG", caption: "POCARI SWEAT VIRTUAL RUN 2025" },
      { src: "/assets/img/pocari/2.jpeg", caption: "POCARI SWEAT VIRTUAL RUN 2025" },
      { src: "/assets/img/pocari/3.jpg", caption: "POCARI SWEAT VIRTUAL RUN 2025" },
      { src: "/assets/img/pocari/4.jpeg", caption: "POCARI SWEAT VIRTUAL RUN 2025" },
      { src: "/assets/img/pocari/5.jpeg", caption: "POCARI SWEAT VIRTUAL RUN 2025" },
      { src: "/assets/img/pocari/6.jpeg", caption: "POCARI SWEAT VIRTUAL RUN 2025" },
      { src: "/assets/img/pocari/7.jpeg", caption: "POCARI SWEAT VIRTUAL RUN 2025" },
      { src: "/assets/img/pocari/8.jpeg", caption: "POCARI SWEAT VIRTUAL RUN 2025" },
    ],
  },
  {
    id: "album-rank",
    cover: "/assets/img/rank/6.jpeg",
    title: "RANK SPORT",
    category: "Kolaborasi",
    date: "25 Mei 2025",
    images: [
      { src: "/assets/img/rank/6.jpeg", caption: "RANK THIS TOWN" },
      { src: "/assets/img/rank/1.jpg", caption: "RANK THIS TOWN" },
      { src: "/assets/img/rank/2.jpg", caption: "RANK THIS TOWN" },
      { src: "/assets/img/rank/3.jpg", caption: "RANK THIS TOWN" },
      { src: "/assets/img/rank/4.jpeg", caption: "RANK THIS TOWN" },
      { src: "/assets/img/rank/5.jpeg", caption: "RANK THIS TOWN" },
      { src: "/assets/img/rank/7.jpeg", caption: "RANK THIS TOWN" },
      { src: "/assets/img/rank/8.jpeg", caption: "RANK THIS TOWN" },
    ],
  },
];
