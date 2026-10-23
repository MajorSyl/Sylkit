import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Product } from '../data/products';
import { categories } from '../data/products';
import { useLang, ui } from '../i18n';
import { colors, shadow } from '../theme';

export function PriceLabel({ product }: { product: Product }) {
  const { t } = useLang();
  if (product.priceFrom == null) return <Text style={styles.price}>{t(ui.priceOnRequest)}</Text>;
  return (
    <Text style={styles.price}>
      {t(ui.from)} ${product.priceFrom}
      <Text style={styles.per}>{t(ui.perMonth)}</Text>
    </Text>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { t } = useLang();
  const cat = categories.find((c) => c.id === product.category);
  const tintBg = product.tint === 'cyan' ? colors.softCyan : colors.softBlue;
  const tintFg = product.tint === 'cyan' ? '#0E9DBB' : colors.primary;

  return (
    <Link href={`/product/${product.slug}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, shadow, pressed && { opacity: 0.9 }]} accessibilityRole="link">
        <View style={[styles.thumb, { backgroundColor: tintBg }]}>
          <View style={[styles.orb, { backgroundColor: tintFg, opacity: 0.12 }]} />
          <Ionicons name={product.icon as any} size={44} color={tintFg} />
          {(product.badge || product.demoUrl) && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge ? t(product.badge) : t({ es: '✓ Listo para usar', en: '✓ Ready to use' })}</Text>
            </View>
          )}
        </View>
        <View style={styles.body}>
          {cat && <Text style={styles.cat}>{t(cat.name)}</Text>}
          <Text style={styles.name}>{t(product.name)}</Text>
          <Text style={styles.short} numberOfLines={2}>
            {t(product.short)}
          </Text>
          <View style={styles.platforms}>
            {product.demoUrl ? <Text style={[styles.platform, { backgroundColor: colors.softCyan, color: '#0E7F98', fontWeight: '700' }]}>▶ Demo</Text> : null}
            {product.platforms.map((p) => (
              <Text key={p} style={styles.platform}>
                {p}
              </Text>
            ))}
          </View>
          <View style={styles.footer}>
            <PriceLabel product={product} />
            <View style={styles.more}>
              <Text style={styles.moreText}>{t(ui.view)}</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    flex: 1,
  },
  thumb: { height: 130, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  orb: { position: 'absolute', width: 180, height: 180, borderRadius: 90, top: -60, right: -50 },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.text },
  body: { padding: 16, gap: 6, flex: 1 },
  cat: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 },
  name: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.2 },
  short: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  platforms: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  platform: {
    fontSize: 11,
    color: colors.muted,
    backgroundColor: colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: { fontSize: 14, fontWeight: '700', color: colors.text },
  per: { fontSize: 12, fontWeight: '500', color: colors.muted },
  more: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moreText: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
