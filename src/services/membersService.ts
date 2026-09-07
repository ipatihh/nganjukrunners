export interface Member {
  nama: string;
  wa: string;
  bio: string;
  jabatan: string;
  foto: string;
  imgUrl: string;
  instagram: string;
  priority: number;
}

const SHEET_ID = "1MIggA3VsTl4SKqFvbWorjgRHb5BW3fQRexXaC6bwwI8";
const URL_DATA = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const PRIORITY_MAP: Record<string, number> = {
  Captain: 1,
  Bendahara: 2,
  "Media & Kreatif": 3,
  Atlet: 4,
  "Official Member": 5,
};

export async function fetchMembers(): Promise<Member[]> {
  try {
    const response = await fetch(URL_DATA);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheets data: ${response.statusText}`);
    }
    const text = await response.text();
    // Parse Google Visualization JSON
    // Format is google.visualization.Query.setResponse({ ... })
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid format from Google Sheets API response");
    }
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    const json = JSON.parse(jsonString);

    const rows = json.table.rows;
    const members: Member[] = rows
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => {
        const nama = r.c[1]?.v || "";
        const wa = r.c[2]?.f || r.c[2]?.v || "";
        const bio = r.c[4]?.v || "";
        const jabatan = r.c[5]?.v || "Official Member";
        const foto = r.c[6]?.v || "";
        const instagram = r.c[7]?.v || "";

        let driveId = "";
        if (foto.includes("id=")) {
          driveId = foto.split("id=")[1].split("&")[0];
        } else if (foto.includes("/d/")) {
          driveId = foto.split("/d/")[1].split("/")[0];
        }

        const imgUrl = driveId
          ? `https://lh3.googleusercontent.com/d/${driveId}`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=random`;

        const priority = PRIORITY_MAP[jabatan] || 99;

        return {
          nama,
          wa,
          bio,
          jabatan,
          foto,
          imgUrl,
          instagram: instagram.toString().replace("@", "").trim(),
          priority,
        };
      })
      .filter((m: Member) => m.nama && m.nama !== "Nama Lengkap");

    // Sort by priority (rank)
    members.sort((a, b) => a.priority - b.priority);

    return members;
  } catch (error) {
    console.error("Error in fetchMembers:", error);
    return [];
  }
}
