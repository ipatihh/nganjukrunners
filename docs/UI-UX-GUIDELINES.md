# Nganjuk Runners — UI/UX Guidelines

Guidance for anyone (human or agent) touching the front-end. Read this before
changing colors, typography, images, or layout. It records **decisions and
constraints that are not obvious from the code.**

Last major pass: 2026-09-08 (accessibility + polish sweep).

---

## 1. Design language

The site is a **light, minimal, "sporty editorial"** theme:

| Token | Value | Use |
| --- | --- | --- |
| `bg-canvas` | `#fbfbfb` | default page background |
| `bg-canvas-alt` | `#ffffff` | alternating section band (gallery on home) — gives vertical rhythm |
| `bg-surface` / `bg-white` | `#ffffff` | cards, raised elements |
| `text-neutral-900/950` | near-black | headings, key numbers |
| `text-neutral-600` | `#525252` | **body text, descriptions, metadata** (see §3) |
| `text-neutral-500` | `#737373` | decorative only — e.g. the de-emphasised half of a heading (`font-normal` span). Do not use for standalone body copy. |
| `border-neutral-100/200` | hairlines | card borders, dividers |

Shape & motion:

- Cards: `rounded-[2rem]`. Pills/badges: `rounded-full`. Inputs/buttons: `rounded-xl` / `rounded-2xl`.
- Card hover: `hover:border-neutral-300 hover:shadow-xl`, plus `hover:-translate-y-1` on member cards.
- Buttons: `active:scale-95`.
- Headings: `uppercase italic font-extrabold tracking-tight`, with a `font-normal`
  neutral span for the secondary word (e.g. **EVENT &** _Kegiatan Utama_).
- Eyebrow labels above headings: `text-sky-500 font-extrabold text-[10px] tracking-[0.2em] uppercase`.

Typography: **Inter** via `next/font/google`, loaded as a **variable font** in
`src/app/layout.tsx`. Do **not** add a `weight: [...]` array — that forces static
instances and ships more CSS. Tailwind weight classes (`font-bold` etc.) work off
the variable axis.

---

## 2. Brand color — accessibility critical

The original brand blue `#3699ff` **failed WCAG AA**: white-on-blue and small
blue-on-canvas were both ~2.8:1 (need 4.5:1).

The ramp is now defined once in `src/app/globals.css` `@theme`:

```css
--color-sky-500: #1773cf;  /* default brand blue — 4.6–4.8:1, safe for text + buttons */
--color-sky-600: #135ba8;  /* hover / pressed / emphasis — ~6.8:1 */
--color-sky-700: #0f4a88;  /* deep accent, rarely needed */
```

Rules:

- **Every** blue element (button fill, link, eyebrow, active nav, focus ring,
  pagination dot) uses `sky-500` or darker. `sky-500` is safe for white text.
- Hover states go **one step darker** (`hover:bg-sky-600`, `hover:text-sky-600`).
- Never reintroduce a lighter blue for text or a button fill. If you need a light
  blue *wash* it must be a large non-text area only.
- If you change these values, re-check contrast (WebAIM) for: white on `sky-500`,
  `sky-500` on `#fbfbfb`, white on `sky-600`.

The brand *logo* keeps its original bright cyan/blue — that's fine, it's imagery,
not UI text.

---

## 3. Text contrast

Body copy is `text-neutral-600` (`#525252`, ~7:1 on canvas). `text-neutral-500`
(`#737373`) is only ~4.5:1 — **borderline** — so it is reserved for decorative
text (the greyed half of a heading). When adding a paragraph, caption, list item,
form helper, or empty-state message, use `text-neutral-600` or darker.

Interactive text (nav links, footer policy buttons, tabs) also uses
`text-neutral-600` minimum.

---

## 4. Images — this is where it gets tricky

There are **three image sources**, each handled differently:

### a) Local files in `public/assets/img/**`
Use `<Image>` normally (optimized). These are fast and reliable. **Keep source
files ≤ ~2000px / < 1 MB** — originals from cameras are 5–15 MB and bloat the repo
and slow the optimizer. Resize before committing (`sips -Z 2000 -s formatOptions 80`).

### b) Blogger (`blogger.googleusercontent.com`) — event posters, hero slides
Blogger serves the **original upload** (often 5000px+, several MB) and the host
can be **slow** (multi-second). Next's optimizer fetch then **times out and 500s**.

**Rule:** wrap every Blogger URL in `bloggerImage(url, size)` from
`src/lib/images.ts` (rewrites the `/sXXXX/` segment) **and** pass `unoptimized`
to `<Image>`. The browser loads a right-sized image straight from Blogger — no
optimizer dependency, no multi-MB transfer.

```tsx
import { bloggerImage } from "@/lib/images";
<Image src={bloggerImage(event.poster, 1000)} alt={`Poster ${event.title}`} fill unoptimized ... />
```

### c) Hot-linked Google Drive / `ui-avatars` — member photos (`MemberList.tsx`)
These 400 when routed through the optimizer, so `MemberList` uses `unoptimized`
plus a **retry + SVG-placeholder fallback**. Leave that logic alone.

### Remote hosts
Every remote host must be in `next.config.ts` `images.remotePatterns`. Currently:
`blogger.googleusercontent.com`, `*.googleusercontent.com`, `drive.google.com`,
`ui-avatars.com`.

### `alt` text
Real descriptions, not `"Photo 1"`. Posters: `` `Poster ${title}` ``. Decorative
images: `alt=""`.

---

## 5. Icons & favicon

- Favicon / touch icon come from **`src/app/icon.png`** and
  **`src/app/apple-icon.png`** (Next file convention) — cropped from the square
  master logo. Do not re-add a remote `icons:` URL in metadata.
- Social share card: **`src/app/opengraph-image.tsx`** (generated with `next/og`
  `ImageResponse` at build time). satori rule: every `<div>` with >1 child needs
  an explicit `display`. Keep it flat and flex.
- Header/footer logo: **`public/assets/img/brand/njr-logo.png`** — a horizontal
  lockup cropped from the 1:1 master (`.../s6250/NJR Shape Besar.png`). Displayed
  at `h-9`/`h-10 w-auto`. If you need to regenerate, crop the wordmark+mark band
  out of the square; don't use the raw square (it renders tiny).
- UI icons: `lucide-react`. Note **brand glyphs (Instagram/TikTok/Telegram) are
  NOT in lucide** — the footer uses hand-rolled inline SVGs; elsewhere use a
  neutral icon like `ArrowUpRight`.

---

## 6. Motion & reduced motion

- `globals.css` has a global `@media (prefers-reduced-motion: reduce)` block that
  neutralises transitions/animations.
- Components that run a JS loop must **also** check it: `HeroSlider` disables
  Swiper `autoplay` when `matchMedia('(prefers-reduced-motion: reduce)').matches`.
  Do the same for any new autoplay/marquee/interval animation.
- Hero slider also has `pauseOnMouseEnter` and real prev/next buttons
  (`aria-label` "Foto sebelumnya/berikutnya"), wired via `onBeforeInit`. Swiper's
  default arrows are not rendered — don't rely on `.swiper-button-next` selectors.

---

## 7. Accessibility patterns already in place — keep them

- Skip link (`layout.tsx`), focus traps (`useFocusTrap`) on header menu, gallery
  lightbox, and footer policy modals. `inert` on the closed mobile menu.
- FAQ items: `<h3><button aria-expanded aria-controls>`; panel is a
  `role="region"` with `id="faq-panel-N"`. Answer reveal uses `max-h-96`
  (generous — realistic answers never clip) + opacity transition.
- Disabled "Pendaftaran Ditutup" is a non-focusable `<span>`, not a
  `<button disabled>`.
- Focus styling: prefer `focus-visible:outline-2 focus-visible:outline-sky-500`.

---

## 8. Content / UX rules

- **The events section on the home page shows past events** (all are `closed`
  today). `EventList` renders a "belum ada pendaftaran dibuka → Instagram /
  Telegram" banner whenever no event is `status: "open"`. When a real upcoming
  event exists, add it to `src/data/events.ts` with `status: "open"` and a
  working `link`; the banner hides itself.
- Do **not** grey-out / `grayscale` past events — it made the section look dead.
  The "Past Event" badge + muted button already communicate status.
- Copy is **Indonesian**. Eyebrow labels included (`Rekam Jejak`, `Perjalanan
  Kami`, `Kemitraan`, …). Keep proper nouns and unavoidable terms (e.g. "Friday
  Night Run") as-is. `kembar.in` credit in the footer stays.

---

## 9. Section rhythm

Home page alternates background bands so sections don't blur together:

```
Hero          bg-canvas
Event          bg-canvas
Gallery        bg-canvas-alt (#fff) + border-y   ← the visual "step"
FAQ            bg-canvas + border-t
```

Sub-pages are single `bg-canvas`. If you add a home section, continue the
alternation and give full-bleed bands (`<section className="bg-… py-24">` with an
inner `max-w-7xl`).

---

## 10. Checklist before shipping a front-end change

- [ ] `npm run build` passes (lint + types + prerender).
- [ ] New text is `text-neutral-600`+; new blue passes contrast.
- [ ] New `<Image>`: local = optimized & ≤2000px source; Blogger = `bloggerImage()` + `unoptimized`; real `alt`.
- [ ] New animation respects `prefers-reduced-motion`.
- [ ] New interactive control is keyboard reachable and has a visible focus style.
- [ ] Checked at 375px (mobile) and ~1280px (desktop).
- [ ] Didn't reintroduce `bg-[#fbfbfb]` literals — use `bg-canvas`.
