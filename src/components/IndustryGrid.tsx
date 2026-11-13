import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { industries } from '../data/industries';
import { useLang } from '../i18n';
import { pickPhotos } from '../lib/photos';
import { colors } from '../theme';
import { Photo } from './Photo';

// Photo-led grid of industries; each card opens a working demo.
export function IndustryGrid({ width }: { width: number }) {
  const { lang } = useLang();
  const router = useRouter();
  const cols = width >= 1100 ? 4 : width >= 700 ? 2 : 1;
  const inner = Math.min(width, 1180) - 32;
  const cardW = (inner - (cols - 1) * 16) / cols;
  const pick = (o: { en: string; es: string; pt: string }) => o[lang] ?? o.en;

  return (
    <View style={styles.grid}>
      {industries.map((ind, i) => {
        const photo = pickPhotos(ind.cat, 1, ind.photo)[0];
        const big = false;
        const w = big ? cardW * 2 + 16 : cardW;
        const open = () => (ind.href.startsWith('http') ? Linking.openURL(ind.href) : router.push(ind.href as any));
        return (
          <Pressable
            key={ind.id}
            onPress={open}
            style={({ hovered }: any) => [styles.card, { width: w }, hovered && styles.cardHover]}
            accessibilityRole="link"
            accessibilityLabel={pick(ind.title)}
          >
            <Photo photo={photo} width={w} ratio={big ? 2.1 : 1.05} radius={18} credit="overlay" />
            <View style={styles.body}>
              <View style={styles.row}>
                <Text style={styles.title}>{pick(ind.title)}</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.primary} />
              </View>
              <Text style={styles.built}>{pick(ind.built)}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { gap: 12, borderRadius: 20, transitionDuration: '180ms', transitionProperty: 'transform' } as any,
  cardHover: { transform: [{ translateY: -3 }] },
  body: { gap: 4, paddingHorizontal: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  built: { fontSize: 14, lineHeight: 20, color: colors.muted },
});
