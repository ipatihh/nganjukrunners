/**
 * Blogger (blogger.googleusercontent.com) serves the original upload by default —
 * often 5000px+ and several MB. The URL carries a size segment like `/s6250/` or
 * `/w1600-h900/` that we can rewrite to ask Blogger for a smaller source.
 *
 * Use this on every Blogger URL before handing it to <Image>, so Next's optimizer
 * fetches a sane source instead of a 15MP original.
 */
export function bloggerImage(url: string, size = 1600): string {
  if (!url.includes("blogger") && !url.includes("googleusercontent")) return url;
  return url.replace(/\/(s\d+|w\d+-h\d+|s\d+-c)\//, `/s${size}/`);
}
