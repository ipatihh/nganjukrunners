export interface JerseyItem {
  id: string;
  name: string;
  price: number;
  tag?: string;
  material: string;
  image: string;
  orderLink: string;
}

export const jerseys: JerseyItem[] = [
  {
    id: "jersey-long-sleeve",
    name: "Black Velocity Lengan Panjang",
    price: 140000,
    tag: "New Arrival",
    material: "Bahan Dry-Fit Premium",
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiFBarZurxV1hBT-_GE5KHAHHuxNRipNM3ESlRZE00JhQJlL-rWWLizNZ3xe1i4ymoDUjei46tSurVoPcnpMnKIRCRPWrrASSv0aPivZSlK3eb6A2zZvBSgOUXvtCvlfzQETH0xwv9qwCR5HbffA0bNDYgNcRs2Vp_h3kPp8_gprO_eyXRvqyi0jITEaGpH/s3190/DSC_6898.jpeg",
    orderLink: "https://wa.me/6287851862317?text=Halo,%20saya%20ingin%20memesan%20Jersey%20NR%20Black%20Velocity%20Lengan%20Panjang",
  },
  {
    id: "jersey-short-sleeve",
    name: "Black Velocity Lengan Pendek",
    price: 125000,
    tag: "Best Seller",
    material: "Bahan Dry-Fit Premium",
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhxSJbUsOcSh9qCYtrI8XoH81UsbFZceqb7yLtw2WHsokN6Jzyy89E9emQxozX34DCwjv10eeYA8hUKNqvV1UK_PkPp4OnDFcZa8QRW0sAbm4OykyG94TpKunoNNT3jHVcglHeXNcMi3YNgwaBpuxZWQ4gO8LH7xaYPLPJTUBc-8NTTuqZXGSx6UsPb67WN/s4288/DSC_7356.jpeg",
    orderLink: "https://wa.me/6287851862317?text=Halo,%20saya%20ingin%20memesan%20Jersey%20NR%20Black%20Velocity%20Lengan%20Pendek",
  },
  {
    id: "jersey-singlet-race",
    name: "Jersey Singlet Edisi Race",
    price: 115000,
    material: "Bahan Microfiber",
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjtRwRGqFlQJUHPvd-yRvYavUweyNjmFJjxqZD9RK32ugi3NGRlb7raSbt52SL_LJm1uLJzzeLEy2tCHHP6VnOTQbZYuSZbf0rH7eJt5KXaerW6_0Ejh1Jnr6MCwIjcZj5QltHZUr3JLlwjUHmW5-ZXx_b7Ys8QQ_PuNe8UpbEksbYnsIJTy-t9e5SV8icH/s6016/DSC_6410.jpeg",
    orderLink: "https://wa.me/6287851862317?text=Halo,%20saya%20ingin%20memesan%20Jersey%20NR%20Singlet%20Race",
  },
];
