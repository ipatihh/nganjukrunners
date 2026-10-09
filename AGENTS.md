<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Front-end / UI / UX

Before changing colors, typography, images, or layout, read
[`docs/UI-UX-GUIDELINES.md`](docs/UI-UX-GUIDELINES.md). It records the design
system tokens, the accessible brand-color ramp, how each image source must be
handled (local vs Blogger vs hot-linked), and content rules that are not obvious
from the code.

Key gotchas:
- Brand blue lives in `src/app/globals.css` `@theme` — the old `#3699ff` failed
  WCAG contrast; do not lighten it.
- Blogger images: always `bloggerImage(url)` from `src/lib/images.ts` + `unoptimized`.
- Use `bg-canvas` / `text-neutral-600`, not `bg-[#fbfbfb]` / `text-neutral-500`.

# Merchandise (KEMBAR.IN)

`/katalog` dijual lewat core KEMBAR.IN — katalog TIDAK disimpan di repo ini. Baca
[`docs/INTEGRASI_KEMBARIN.md`](docs/INTEGRASI_KEMBARIN.md) sebelum menyentuh
`src/lib/kembarin/`, `src/app/api/pesan`, atau `src/app/katalog`. Jangan menulis harga,
produk, atau ukuran di kode; jangan meneruskan body mentah browser ke core.
