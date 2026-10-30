import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { Product } from '../data/products';
import { useLang } from '../i18n';
import { allowedBilling, billingName, planQuote } from '../lib/planText';
import type { Billing } from '../lib/pricing';
import { colors, shadow } from '../theme';

// Plan cards in the style of big hosting companies: each card shows one price, one
// "Choose plan" button and an honest "Today you pay … Renews at …" line. Extras are chosen at checkout.

export function PlanCards({ product, initialBilling }: { product: Product; initialBilling?: string }) {
  const { t, lang } = useLang();
  const es = lang === 'es';
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pricing = product.pricing!;
  const allowed = allowedBilling(pricing);
  const [billing, setBilling] = useState<Billing>(allowed.includes(initialBilling as Billing) ? (initialBilling as Billing) : allowed[0]);
  const plans = pricing.plans;
  const popularIdx = Math.max(plans.findIndex((p) => p.popular), 0);

  // Phones: swipe between cards. Wide screens: side by side.
  const swipe = width < 760;
  const cardW = swipe ? Math.min(width * 0.84, 360) : undefined;
  const gap = 12;

  const choose = (planId: string) => router.push(`/quote?product=${product.slug}&plan=${encodeURIComponent(planId)}&billing=${billing}`);

  const cards = plans.map((p, i) => {
    const q = planQuote(p, billing, pricing, lang);
    return (
      <View key={p.id} style={[styles.card, shadow, p.popular && styles.cardPopular, swipe ? { width: cardW } : { flex: 1 }, i < plans.length - 1 && swipe && { marginRight: gap }]}>
        <View style={styles.tagRow}>{p.popular ? <Text style={styles.popular}>{es ? 'Más elegido' : 'Most popular'}</Text> : <View style={{ height: 22 }} />}</View>
        <Text style={styles.name}>{t(p.name)}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{q.price}</Text>
          <Text style={styles.per}>{q.per}</Text>
        </View>
        <Pressable style={[styles.btn, p.popular ? styles.btnPrimary : styles.btnOutline]} onPress={() => choose(p.id)} accessibilityRole="button">
          <Text style={[styles.btnText, p.popular && { color: '#fff' }]}>{es ? 'Elegir plan' : 'Choose plan'}</Text>
        </Pressable>
        <Text style={styles.today}>
          {q.todayText} {q.renewText}
        </Text>
        <View style={styles.divider} />
        <View style={{ gap: 9 }}>
          {p.includes.map((inc, k) => (
            <View key={k} style={styles.inc}>
              <Ionicons name="checkmark" size={17} color={colors.primary} />
              <Text style={styles.incText}>{t(inc)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  });

  return (
    <View style={{ gap: 18 }} nativeID="plans">
      {allowed.length > 1 ? (
        <View style={styles.toggle} accessibilityRole="radiogroup">
          {allowed.map((b) => {
            const on = billing === b;
            return (
              <Pressable key={b} onPress={() => setBilling(b)} style={[styles.toggleBtn, on && styles.toggleOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                <Text style={[styles.toggleText, on && { color: colors.text }]}>{billingName(b, lang)}</Text>
                {b === 'yearly' ? <Text style={styles.free}>{es ? '2 meses gratis' : '2 months free'}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {swipe ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={(cardW ?? 0) + gap}
          decelerationRate="fast"
          contentOffset={{ x: Math.max(popularIdx * ((cardW ?? 0) + gap) - (width - (cardW ?? 0)) / 2 + 16, 0), y: 0 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6 }}
          style={{ marginHorizontal: -16 }}
        >
          {cards}
        </ScrollView>
      ) : (
        <View style={{ flexDirection: 'row', gap, alignItems: 'stretch' }}>{cards}</View>
      )}
      {swipe && plans.length > 1 ? (
        <Text style={styles.hint}>{es ? 'Desliza para ver todos los planes →' : 'Swipe to see all plans →'}</Text>
      ) : null}
      <Text style={styles.fine}>
        {es
          ? 'Las funciones extra y tu dirección web se eligen en el siguiente paso. Pagas con USDT, Pago Móvil u otro método.'
          : 'Extras and your web address are chosen in the next step. Pay with USDT, Pago Móvil or another method.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', alignSelf: 'center', backgroundColor: '#E9EEF7', borderRadius: 999, padding: 4 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, minHeight: 40 },
  toggleOn: { backgroundColor: colors.surface },
  toggleText: { fontSize: 14, fontWeight: '700', color: colors.muted },
  free: { fontSize: 11, fontWeight: '800', color: '#0E7F98', backgroundColor: colors.softCyan, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border },
  cardPopular: { borderColor: colors.primary, borderWidth: 2 },
  tagRow: { minHeight: 22, marginBottom: 8 },
  popular: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '800', color: '#fff', backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, marginBottom: 14 },
  price: { fontSize: 38, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  per: { fontSize: 15, fontWeight: '600', color: colors.muted, marginBottom: 7, marginLeft: 2 },
  btn: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnOutline: { borderWidth: 1.5, borderColor: colors.text },
  btnText: { fontSize: 15, fontWeight: '800', color: colors.text },
  today: { fontSize: 12.5, lineHeight: 18, color: colors.muted, marginTop: 12 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  inc: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  incText: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.text },
  hint: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: -6 },
  fine: { fontSize: 12.5, color: colors.muted, textAlign: 'center', lineHeight: 18 },
});
