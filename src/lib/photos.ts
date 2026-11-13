// Unsplash photos used across Sylkit (curated library in src/data/photoLibrary.ts).
// Images are hotlinked from Unsplash (as their API terms require) with sizing parameters, and every
// photo shown carries its credit: photographer + Unsplash, both linked.
import { photoLibrary, PhotoCategory } from '../data/photoLibrary';

export type LibPhoto = {
  id: string;
  cat: PhotoCategory;
  alt: string;
  color: string;
  w: number;
  h: number;
  raw: string;
  page: string;
  by: string;
  profile: string;
};

export const UNSPLASH_HOME = 'https://unsplash.com/?utm_source=sylkit&utm_medium=referral';

/** Sized image URL (Unsplash's imgix params). `h` crops to that box. */
export function photoUrl(p: Pick<LibPhoto, 'raw'>, w: number, h?: number, q = 72) {
  const sep = p.raw.includes('?') ? '&' : '?';
  return `${p.raw}${sep}w=${Math.round(w)}${h ? `&h=${Math.round(h)}&fit=crop&crop=entropy` : ''}&q=${q}&auto=format`;
}

/** srcSet for responsive images (1x/2x of the display width). */
export function photoSrcSet(p: Pick<LibPhoto, 'raw'>, w: number, ratio?: number) {
  return [1, 1.5, 2]
    .map((d) => `${photoUrl(p, w * d, ratio ? (w * d) / ratio : undefined)} ${Math.round(w * d)}w`)
    .join(', ');
}

const byId = new Map(photoLibrary.map((p) => [p.id, p as LibPhoto]));
export const getPhoto = (id: string) => byId.get(id);

/** Photos of one category, in library order. */
export const photosOf = (cat: PhotoCategory) => photoLibrary.filter((p) => p.cat === cat) as LibPhoto[];

/** n photos of a category starting at `offset`, never repeating within the same call. */
export function pickPhotos(cat: PhotoCategory, n: number, offset = 0) {
  const list = photosOf(cat);
  if (!list.length) return [];
  const out: LibPhoto[] = [];
  for (let i = 0; i < Math.min(n, list.length); i++) out.push(list[(offset + i) % list.length]);
  return out;
}
