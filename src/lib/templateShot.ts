import { Platform } from 'react-native';

// Screenshot and preview URLs for a store template. On the web they are relative to sylkit.com;
// the native app has no site origin, so it uses the full address.
const ORIGIN = Platform.OS === 'web' ? '' : 'https://sylkit.com';

export const templateShot = (slug: string, kind: 'desktop' | 'phone') => `${ORIGIN}/shots/templates/${slug}-${kind}.webp`;
export const templatePreview = (slug: string) => `${ORIGIN}/preview/${slug}/`;
