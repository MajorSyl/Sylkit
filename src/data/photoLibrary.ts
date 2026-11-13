// Sylkit photo library: Unsplash photos chosen per industry (filled by the curation step of Sylkit 2.0).
// Each entry keeps what attribution needs (photographer, profile, photo page) and the hotlink URL.
export type PhotoCategory =
  | 'architecture' | 'construction' | 'realestate' | 'fashion' | 'shoes' | 'clothing' | 'accessories' | 'hotels'
  | 'restaurants' | 'logistics' | 'healthcare' | 'events' | 'education' | 'corporate' | 'technology' | 'services';

export const photoLibrary: { id: string; cat: PhotoCategory; alt: string; color: string; w: number; h: number; raw: string; page: string; by: string; profile: string }[] = [];
