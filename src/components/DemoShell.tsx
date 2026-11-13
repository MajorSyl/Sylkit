import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { createElement, ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { tx } from '../i18n';
import { colors } from '../theme';

// Frame for every Sylkit 2.0 demo: a slim bar that says it's a demo with sample data, the tabs
// (customer view / staff view), and a clear way to get the same system for your business.
export function DemoShell({
  title,
  brand,
  tabs,
  tab,
  onTab,
  children,
  product,
}: {
  title: string;
  brand: string;
  tabs?: { id: string; label: string; icon: string }[];
  tab?: string;
  onTab?: (id: string) => void;
  children: ReactNode;
  product: string;
}) {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F6FA' }}>
      <Head>
        <title>{`${title} · ${tx('Live demo', 'Demo en vivo', 'Demo ao vivo')} · Sylkit`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <View style={styles.bar}>
        <Pressable onPress={() => router.push('/')} style={styles.back} accessibilityRole="link" accessibilityLabel="Sylkit">
          <Ionicons name="arrow-back" size={16} color="#fff" />
          <Text style={styles.backText}>Sylkit</Text>
        </Pressable>
        <View style={styles.badge}>
          <View style={styles.pulse} />
          <Text style={styles.badgeText} numberOfLines={1}>
            {tx('Live demo · sample data', 'Demo en vivo · datos de ejemplo', 'Demo ao vivo · dados de exemplo')}
          </Text>
        </View>
        <Pressable onPress={() => router.push(`/quote?ref=${product}` as any)} style={styles.get} accessibilityRole="link">
          <Text style={styles.getText}>{tx('Get this system', 'Quiero este sistema', 'Quero este sistema')}</Text>
        </Pressable>
      </View>
      {tabs ? (
        <View style={styles.tabsWrap}>
          <View style={styles.tabs}>
            <Text style={styles.brand} numberOfLines={1}>{brand}</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {tabs.map((t) => (
                <Pressable key={t.id} onPress={() => onTab?.(t.id)} style={[styles.tab, tab === t.id && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === t.id }}>
                  <Ionicons name={t.icon as any} size={15} color={tab === t.id ? '#fff' : colors.text} />
                  <Text style={[styles.tabText, tab === t.id && { color: '#fff' }]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ) : null}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 }}>{children}</ScrollView>
    </View>
  );
}

export const Wrap = ({ children, style }: { children: ReactNode; style?: any }) => <View style={[{ width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16 }, style]}>{children}</View>;

export function Card({ children, style }: { children: ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Stat({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <View style={[styles.card, styles.stat]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, tone ? { color: tone } : null]}>{value}</Text>
    </View>
  );
}

export function Btn({ label, onPress, icon, kind = 'main', disabled, small }: { label: string; onPress: () => void; icon?: string; kind?: 'main' | 'alt' | 'danger'; disabled?: boolean; small?: boolean }) {
  const bg = kind === 'main' ? colors.text : kind === 'danger' ? '#B42318' : '#fff';
  const fg = kind === 'alt' ? colors.text : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, kind === 'alt' && { borderWidth: 1, borderColor: 'rgba(11,27,58,0.16)' }, small && { minHeight: 36, paddingHorizontal: 12 }]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
    >
      {icon ? <Ionicons name={icon as any} size={small ? 14 : 16} color={fg} /> : null}
      <Text style={[styles.btnText, { color: fg }, small && { fontSize: 13 }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...p }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6, flexGrow: 1, minWidth: 200 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...p} style={styles.input} placeholderTextColor="#98A2B3" accessibilityLabel={label} />
    </View>
  );
}

/** Native date picker on the web, text field elsewhere. */
export function DateField({ label, value, onChange, min }: { label: string; value: string; onChange: (v: string) => void; min?: string }) {
  return (
    <View style={{ gap: 6, flexGrow: 1, minWidth: 150 }}>
      <Text style={styles.label}>{label}</Text>
      {Platform.OS === 'web'
        ? createElement('input', {
            type: 'date',
            value,
            min,
            'aria-label': label,
            onChange: (e: any) => onChange(e.target.value),
            style: { border: '1px solid rgba(11,27,58,0.16)', borderRadius: 12, padding: '0 12px', height: 46, fontSize: 15, color: colors.text, background: '#fff', fontFamily: 'inherit' },
          })
        : <TextInput value={value} onChangeText={onChange} style={styles.input} />}
    </View>
  );
}

export function Pill({ label, tone = '#475467', bg = '#F2F4F7' }: { label: string; tone?: string; bg?: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color: tone, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function Notice({ text, tone = 'info' }: { text: string; tone?: 'info' | 'ok' | 'error' }) {
  const c = tone === 'ok' ? ['#ECFDF3', '#067647'] : tone === 'error' ? ['#FEF3F2', '#B42318'] : ['#EFF4FF', '#1849A9'];
  return (
    <View style={{ backgroundColor: c[0], borderRadius: 12, padding: 12 }} accessibilityRole="alert">
      <Text style={{ color: c[1], fontSize: 14, fontWeight: '600' }}>{text}</Text>
    </View>
  );
}

export const demoStyles = StyleSheet.create({
  h1: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  h2: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  sub: { fontSize: 15, color: colors.muted, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
});

const styles = StyleSheet.create({
  bar: { backgroundColor: '#0B1B3A', paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4 },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  badge: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  pulse: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#32D583' },
  badgeText: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontWeight: '600' },
  get: { backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  getText: { color: '#0B1B3A', fontWeight: '800', fontSize: 13 },
  tabsWrap: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(11,27,58,0.08)' },
  tabs: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  brand: { fontSize: 17, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 38, borderRadius: 999, backgroundColor: '#F2F4F7' },
  tabOn: { backgroundColor: colors.text },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.text },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(11,27,58,0.07)' },
  stat: { flexGrow: 1, flexBasis: 150, gap: 4 },
  statLabel: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, paddingHorizontal: 18, borderRadius: 999 },
  btnText: { fontSize: 15, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  input: { borderWidth: 1, borderColor: 'rgba(11,27,58,0.16)', borderRadius: 12, paddingHorizontal: 12, minHeight: 46, fontSize: 15, color: colors.text, backgroundColor: '#fff', outlineStyle: 'none' } as any,
});
