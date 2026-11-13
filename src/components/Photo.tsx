import { createElement } from 'react';
import { Image, Linking, Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { tx } from '../i18n';
import { LibPhoto, photoSrcSet, photoUrl, UNSPLASH_HOME } from '../lib/photos';

// A library photo: responsive on the web (srcset, lazy), the photo's own color while it loads,
// and the Unsplash credit (photographer + Unsplash, linked) that their terms require.
//   credit: 'overlay' (small tag on the photo), 'none' (show <PhotoCredit> elsewhere yourself)
export function Photo({
  photo,
  width,
  ratio,
  style,
  radius = 0,
  credit = 'overlay',
  priority = false,
  alt,
}: {
  photo: LibPhoto | undefined;
  width: number; // display width in px (used to pick sizes)
  ratio?: number; // width / height; crops when set
  style?: ViewStyle | ViewStyle[];
  radius?: number;
  credit?: 'overlay' | 'none';
  priority?: boolean;
  alt?: string;
}) {
  if (!photo) return <View style={[{ backgroundColor: '#E8EDF5', borderRadius: radius }, ratio ? { aspectRatio: ratio } : null, style as any]} />;
  const box = [{ backgroundColor: photo.color, borderRadius: radius, overflow: 'hidden' as const }, ratio ? { aspectRatio: ratio } : null, style as any];
  const img =
    Platform.OS === 'web'
      ? createElement('img', {
          src: photoUrl(photo, width, ratio ? width / ratio : undefined),
          srcSet: photoSrcSet(photo, width, ratio),
          sizes: `${Math.round(width)}px`,
          alt: alt ?? photo.alt,
          loading: priority ? 'eager' : 'lazy',
          decoding: 'async',
          ...(priority ? { fetchpriority: 'high' } : {}),
          style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
        })
      : <Image source={{ uri: photoUrl(photo, width, ratio ? width / ratio : undefined) }} style={StyleSheet.absoluteFillObject} accessibilityLabel={alt ?? photo.alt} />;
  return (
    <View style={box}>
      {img}
      {credit === 'overlay' ? <PhotoCredit photo={photo} overlay /> : null}
    </View>
  );
}

export function PhotoCredit({ photo, overlay, light }: { photo: LibPhoto; overlay?: boolean; light?: boolean }) {
  const open = (u: string) => Linking.openURL(u);
  const color = overlay || light ? '#fff' : '#5B6B88';
  return (
    <View style={overlay ? styles.overlay : styles.inline}>
      <Text style={[styles.text, { color }]} numberOfLines={1}>
        {tx('Photo', 'Foto', 'Foto')}:{' '}
        <Text onPress={() => open(photo.profile)} style={[styles.link, { color }]} accessibilityRole="link">
          {photo.by}
        </Text>{' '}
        /{' '}
        <Text onPress={() => open(UNSPLASH_HOME)} style={[styles.link, { color }]} accessibilityRole="link">
          Unsplash
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', right: 8, bottom: 8, maxWidth: '85%', backgroundColor: 'rgba(0,0,0,0.38)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  inline: { paddingTop: 4 },
  text: { fontSize: 10.5, fontWeight: '500' },
  link: { textDecorationLine: 'underline' },
});

