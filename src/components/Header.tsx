import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { Text as T } from '../i18n';
import { useLang } from '../i18n';
import { colors, glass, waLink } from '../theme';

// Site navigation. Wide screens show labeled links; phones show a "Menu" button that opens
// a full-screen list with an icon and a clear name for every section.

type Item = { href: string; icon: string; label: T; sub: T };

const products: Item[] = [
  {
    href: '/',
    icon: 'apps-outline',
    label: { en: 'Software for your business', es: 'Software para tu negocio' },
    sub: { en: 'POS, inventory, pharmacy, clinic and more', es: 'Punto de venta, inventario, farmacia, clínica y más' },
  },
  {
    href: '/domains',
    icon: 'globe-outline',
    label: { en: 'Domains and email', es: 'Dominios y correo' },
    sub: { en: 'Your .com and business email', es: 'Tu .com y correo profesional' },
  },
  {
    href: '/product/hosting-web',
    icon: 'server-outline',
    label: { en: 'Website hosting', es: 'Hosting para tu sitio' },
    sub: { en: 'Fast, secure hosting with backups', es: 'Hosting rápido y seguro con respaldos' },
  },
  {
    href: '/security',
    icon: 'shield-checkmark-outline',
    label: { en: 'Security (Sylkit Shield)', es: 'Seguridad (Sylkit Shield)' },
    sub: { en: 'Check and protect your app or site', es: 'Revisa y protege tu app o sitio' },
  },
  {
    href: '/startups',
    icon: 'rocket-outline',
    label: { en: 'Startups for sale', es: 'Negocios en venta' },
    sub: { en: 'Buy a whole online business', es: 'Compra un negocio online completo' },
  },
  {
    href: '/quote',
    icon: 'construct-outline',
    label: { en: 'Custom system', es: 'Sistema a medida' },
    sub: { en: 'Tell us what you need, we build it', es: 'Cuéntanos qué necesitas y lo construimos' },
  },
];

const top: { href: string; label: T }[] = [
  { href: '/', label: { en: 'Software', es: 'Software' } },
  { href: '/domains', label: { en: 'Domains', es: 'Dominios' } },
  { href: '/product/hosting-web', label: { en: 'Hosting', es: 'Hosting' } },
  { href: '/security', label: { en: 'Security', es: 'Seguridad' } },
  { href: '/startups', label: { en: 'Startups', es: 'Negocios' } },
];

export function Header() {
  const { lang, t } = useLang();
  const es = lang === 'es';
  const { width } = useWindowDimensions();
  const wide = width >= 980;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const go = (href: string) => {
    setOpen(false);
    router.push(href as any);
  };
  const wa = () => Linking.openURL(waLink(es ? 'Hola, vi Sylkit y quiero información.' : 'Hi, I saw Sylkit and want more info.'));

  return (
    <View style={[styles.wrap, glass]}>
      <View style={styles.inner}>
        <Link href="/" asChild>
          <Pressable style={styles.brand} accessibilityRole="link">
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.brandText}>Sylkit</Text>
          </Pressable>
        </Link>

        {wide ? (
          <View style={styles.right}>
            {top.map((x) => (
              <Link key={x.href} href={x.href as any} asChild>
                <Pressable style={styles.navLink} accessibilityRole="link">
                  <Text style={styles.navText}>{t(x.label)}</Text>
                </Pressable>
              </Link>
            ))}
            <Link href="/track" asChild>
              <Pressable style={styles.navLink} accessibilityRole="link">
                <Text style={styles.navText}>{es ? 'Mi pedido' : 'My order'}</Text>
              </Pressable>
            </Link>
            <Pressable style={styles.wa} onPress={wa} accessibilityRole="link">
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={styles.waText}>WhatsApp</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.right}>
            <Pressable style={styles.waIcon} onPress={wa} accessibilityRole="link" accessibilityLabel="WhatsApp">
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            </Pressable>
            <Pressable style={styles.menuBtn} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={es ? 'Abrir menú' : 'Open menu'}>
              <Ionicons name="menu" size={24} color={colors.text} />
            </Pressable>
          </View>
        )}
      </View>

      <Modal visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>S</Text>
              </View>
              <Text style={styles.brandText}>Sylkit</Text>
            </View>
            <Pressable onPress={() => setOpen(false)} style={styles.menuBtn} accessibilityRole="button" accessibilityLabel={es ? 'Cerrar menú' : 'Close menu'}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={styles.section}>{es ? 'PRODUCTOS' : 'PRODUCTS'}</Text>
            {products.map((x) => (
              <Pressable key={x.href} style={styles.item} onPress={() => go(x.href)} accessibilityRole="link">
                <View style={styles.itemIcon}>
                  <Ionicons name={x.icon as any} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemLabel}>{t(x.label)}</Text>
                  <Text style={styles.itemSub}>{t(x.sub)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            ))}
            <View style={styles.divider} />
            <Pressable style={styles.item} onPress={() => go('/track')} accessibilityRole="link">
              <View style={styles.itemIcon}>
                <Ionicons name="receipt-outline" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.itemLabel, { flex: 1 }]}>{es ? 'Seguir mi pedido' : 'Track my order'}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </ScrollView>
          <Pressable style={styles.sheetWa} onPress={wa} accessibilityRole="link">
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.waText}>{es ? 'Hablar por WhatsApp' : 'Chat on WhatsApp'}</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.glass,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
    zIndex: 10,
  },
  inner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  brandText: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navLink: { paddingHorizontal: 10, minHeight: 40, justifyContent: 'center' },
  navText: { fontSize: 14, fontWeight: '700', color: colors.text },
  wa: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.whatsapp, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, minHeight: 40, marginLeft: 6 },
  waIcon: { width: 40, height: 40, borderRadius: 999, backgroundColor: colors.whatsapp, alignItems: 'center', justifyContent: 'center' },
  waText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  menuBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sheet: { flex: 1, backgroundColor: colors.surface },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  section: { fontSize: 12, fontWeight: '800', color: colors.muted, letterSpacing: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14, minHeight: 60 },
  itemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: 17, fontWeight: '700', color: colors.text },
  itemSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 20, marginVertical: 8 },
  sheetWa: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.whatsapp, margin: 16, minHeight: 52, borderRadius: 14 },
});
