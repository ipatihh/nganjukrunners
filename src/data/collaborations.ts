export interface CollaborationItem {
  id: string;
  title: string;
  dateText: string;
  status: "upcoming" | "completed" | "ongoing";
  statusText: string;
  description: string;
  time: string;
  location: string;
  link?: string;
}

export const collaborations: CollaborationItem[] = [
  {
    id: "fnr-kedai-temu",
    title: "Friday Night Run x Kedai Temu",
    dateText: "Jum'at, 5 Juni 2026",
    status: "completed",
    statusText: "Selesai",
    description: "Menyusuri rute malam Kota Angin dengan lari santai, lalu ditutup dengan sesi sharing langsung di titik kumpul Kedai Temu.",
    time: "19.00 WIB - Selesai",
    location: "Kedai Temu Nganjuk",
    link: "https://kembar.in/fnr/temu",
  },
];
