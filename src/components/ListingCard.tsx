import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../i18n';
import { categoryOf, Listing, usd } from '../lib/listings';
import { colors, shadow } from '../theme';

// Card for a business for sale: image, name, one-line pitch, category, and the two numbers buyers look at first.
export function ListingCard({ listing, compact }: { listing: Listing; compact?: boolean }) {
  const { t, lang } = useLang();
  const cat = categoryOf(listing.category);
  const sold = listing.status === 'sold';
  const es = lang === 'es';

  return (
    <Link href={`/startup?s=${listing.slug}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, shadow, compact && styles.row, pressed && { opacity: 0.92 }]} accessibilityRole="link">
        <View style={[styles.media, compact && styles.mediaRow, { backgroundColor: `${cat.tint}14` }]}>
          {listing.image_url ? (
            <Image source={{ uri: listing.image_url }} style={styles.img} resizeMode="cover" accessibilityLabel={listing.title} />
          ) : (
            <>
              <View style={[styles.orb, { backgroundColor: cat.tint }]} />
              <Ionicons name={cat.icon as any} size={46} color={cat.tint} />
            </>
          )}
          {listing.featured && !sold ? <Text style={styles.featured}>★ {es ? 'Destacado' : 'Featured'}</Text> : null}
          {listing.status === 'under_offer' ? <Text style={[styles.flag, { backgroundColor: '#F59E0B' }]}>{es ? 'En negociación' : 'Under offer'}</Text> : null}
          {sold ? <Text style={[styles.flag, { backgroundColor: '#16A34A' }]}>{es ? 'Vendido' : 'Sold'}</Text> : null}
        </View>

        <View style={[styles.body, compact && { flex: 1 }]}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>
          <Text style={styles.tagline} numberOfLines={compact ? 3 : 2}>
            {listing.tagline}
          </Text>
          <View style={styles.pills}>
            <View style={[styles.pill, { backgroundColor: `${cat.tint}1A` }]}>
              <View style={[styles.dot, { backgroundColor: cat.tint }]} />
              <Text style={[styles.pillText, { color: cat.tint }]}>{t(cat.name)}</Text>
            </View>
            {Number(listing.annual_revenue) === 0 ? (
              <View style={[styles.pill, { backgroundColor: '#F1F5F9' }]}>
                <Text style={[styles.pillText, { color: colors.muted }]}>{es ? 'Sin ingresos aún' : 'Pre-revenue'}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{usd(listing.annual_revenue)}</Text>
              <Text style={styles.statLabel}>{es ? 'Ingresos anuales' : 'Annual revenue'}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{usd(sold ? listing.sold_price ?? listing.asking_price : listing.asking_price)}</Text>
              <Text style={styles.statLabel}>{sold ? (es ? 'Precio de venta' : 'Exit price') : es ? 'Precio pedido' : 'Asking price'}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  media: { aspectRatio: 16 / 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: 8, borderRadius: 14 },
  mediaRow: { width: 240, flexGrow: 1, maxWidth: 320 },
  img: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  orb: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -70, right: -60, opacity: 0.12 },
  featured: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff',
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  flag: {
    position: 'absolute',
    top: 10,
    right: 10,
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  body: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 6, gap: 8, flexGrow: 1, minWidth: 220 },
  title: { fontSize: 19, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  tagline: { fontSize: 14, lineHeight: 20, color: colors.muted },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontSize: 12, fontWeight: '800' },
  stats: { flexDirection: 'row', gap: 8, marginTop: 'auto', paddingTop: 4 },
  stat: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, gap: 2 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  statLabel: { fontSize: 12, color: colors.muted },
});
