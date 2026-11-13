import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tx } from '../i18n';
import { pickPhotos } from '../lib/photos';
import { colors } from '../theme';
import { Photo } from './Photo';

// Sylkit 2.0 hero: an editorial headline on the left, real photography with live-looking product
// cards on the right (a confirmed booking, a scanned ticket), so visitors see what we build.
export function HomeHero({ width: w0 }: { width: number }) {
  const width = w0 || 375; // pre-rendered pages have no width yet
  const router = useRouter();
  const wide = width >= 980;
  const hotel = pickPhotos('hotels', 1)[0];
  const arch = pickPhotos('architecture', 1)[0];
  const event = pickPhotos('events', 1)[0];
  const colW = wide ? Math.min(560, width / 2 - 40) : Math.min(width - 32, 620);

  const scrollTo = (id: string) => {
    try {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {}
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.inner, wide && { flexDirection: 'row', alignItems: 'center', gap: 56 }]}>
        <View style={[styles.copy, wide && { flex: 1 }]}>
          <Text style={styles.kicker}>{tx('Software studio · Websites · Systems · AI', 'Estudio de software · Webs · Sistemas · IA', 'Estúdio de software · Sites · Sistemas · IA')}</Text>
          <Text style={[styles.h1, wide && { fontSize: 58, lineHeight: 62 }]} accessibilityRole="header">
            {tx('Software that runs real businesses.', 'Software que hace funcionar negocios reales.', 'Software que faz negócios reais funcionarem.')}
          </Text>
          <Text style={[styles.sub, wide && { fontSize: 18, lineHeight: 28 }]}>
            {tx(
              'Booking engines for hotels, ticketing for events, stores, clinics, logistics and construction systems. Try every demo, then launch yours in days, with setup and support included.',
              'Reservas para hoteles, entradas para eventos, tiendas, clínicas, logística y sistemas para construcción. Prueba cada demo y lanza el tuyo en días, con instalación y soporte incluidos.',
              'Reservas para hotéis, ingressos para eventos, lojas, clínicas, logística e sistemas para construção. Teste cada demo e lance o seu em dias, com instalação e suporte incluídos.',
            )}
          </Text>
          <View style={styles.ctas}>
            <Pressable style={styles.ctaMain} onPress={() => scrollTo('work')} accessibilityRole="button">
              <Text style={styles.ctaMainText}>{tx('See our work', 'Ver nuestro trabajo', 'Ver nosso trabalho')}</Text>
              <Ionicons name="arrow-down" size={16} color="#fff" />
            </Pressable>
            <Pressable style={styles.ctaAlt} onPress={() => router.push('/quote')} accessibilityRole="link">
              <Text style={styles.ctaAltText}>{tx('Start a project', 'Iniciar un proyecto', 'Começar um projeto')}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.trust}>
            {[
              ['language-outline', tx('English, Spanish, Portuguese', 'Inglés, español, portugués', 'Inglês, espanhol, português')],
              ['flash-outline', tx('Live demos you can try', 'Demos en vivo para probar', 'Demos ao vivo para testar')],
              ['headset-outline', tx('Setup and support included', 'Instalación y soporte incluidos', 'Instalação e suporte incluídos')],
            ].map(([icon, label]) => (
              <View key={label} style={styles.trustItem}>
                <Ionicons name={icon as any} size={15} color={colors.primary} />
                <Text style={styles.trustText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.visual, { width: colW, height: colW * (wide ? 1.02 : 0.9) }]}>
          <Photo photo={arch} width={colW * 0.58} radius={22} priority style={[styles.pTall, { width: '58%' }]} />
          <Photo photo={hotel} width={colW * 0.4} ratio={1} radius={18} priority style={[styles.pTop, { width: '39%' }]} />
          <Photo photo={event} width={colW * 0.4} ratio={0.82} radius={18} style={[styles.pBottom, { width: '39%' }]} />

          {/* Product cards drawn as UI, not images: what the customer's software looks like */}
          <View style={[styles.card, { left: wide ? -28 : 8, bottom: '22%' }]}>
            <View style={[styles.dot, { backgroundColor: '#16A34A' }]}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
            <View>
              <Text style={styles.cardTitle}>{tx('Booking confirmed', 'Reserva confirmada', 'Reserva confirmada')}</Text>
              <Text style={styles.cardSub}>{tx('Deluxe room · 3 nights · $360', 'Hab. Deluxe · 3 noches · $360', 'Quarto Deluxe · 3 noites · $360')}</Text>
            </View>
          </View>
          <View style={[styles.card, { right: wide ? -18 : 8, top: '48%' }]}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]}>
              <Ionicons name="qr-code-outline" size={13} color="#fff" />
            </View>
            <View>
              <Text style={styles.cardTitle}>{tx('Ticket checked in', 'Entrada validada', 'Ingresso validado')}</Text>
              <Text style={styles.cardSub}>{tx('Gate A · 412 of 600 inside', 'Puerta A · 412 de 600 dentro', 'Portão A · 412 de 600 dentro')}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', paddingTop: 40, paddingBottom: 48, backgroundColor: colors.bg },
  inner: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16, gap: 36 },
  copy: { gap: 16 },
  kicker: { fontSize: 13, fontWeight: '700', color: colors.primary, letterSpacing: 0.6, textTransform: 'uppercase' },
  h1: { fontSize: 38, lineHeight: 44, fontWeight: '800', color: colors.text, letterSpacing: -1.4 },
  sub: { fontSize: 16, lineHeight: 25, color: colors.muted, maxWidth: 560 },
  ctas: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  ctaMain: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.text, paddingHorizontal: 22, minHeight: 50, borderRadius: 999 },
  ctaMainText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  ctaAlt: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(11,27,58,0.16)', paddingHorizontal: 22, minHeight: 50, borderRadius: 999 },
  ctaAltText: { color: colors.text, fontSize: 15, fontWeight: '800' },
  trust: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 6 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustText: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  visual: { position: 'relative', alignSelf: 'center' },
  pTall: { position: 'absolute', left: 0, top: '4%', bottom: 0 },
  pTop: { position: 'absolute', right: 0, top: 0 },
  pBottom: { position: 'absolute', right: 0, bottom: '2%' },
  card: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    boxShadow: '0 14px 40px rgba(11,27,58,0.18)',
  } as any,
  dot: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 13.5, fontWeight: '800', color: colors.text },
  cardSub: { fontSize: 12, color: colors.muted },
});
