import { Ionicons } from '@expo/vector-icons';
import { useClientWidth } from '../lib/useClientWidth';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { Text as T } from '../i18n';
import { useLang } from '../i18n';
import { colors, glass, waLink } from '../theme';
import { Logo } from './Logo';
import { tx } from '../i18n';

// Site navigation. Wide screens show labeled links; phones show a "Menu" button that opens
// a full-screen list with an icon and a clear name for every section.

type Item = { href: string; icon: string; label: T; sub: T };

const products: Item[] = [
  {
    href: '/',
    icon: 'apps-outline',
    label: { en: 'Software for your business', pt: "Software para o seu negócio", es: 'Software para tu negocio' },
    sub: { en: 'POS, inventory, pharmacy, clinic and more', pt: "PDV, estoque, farmácia, clínica e mais", es: 'Punto de venta, inventario, farmacia, clínica y más' },
  },
  {
    href: '/templates',
    icon: 'color-palette-outline',
    label: { en: 'Design templates', pt: "Modelos de design", es: 'Plantillas de diseño' },
    sub: { en: 'Online stores, websites and mobile apps', pt: "Lojas online, sites e apps para celular", es: 'Tiendas en línea, sitios web y apps móviles' },
  },
  {
    href: '/domains',
    icon: 'globe-outline',
    label: { en: 'Domains and email', pt: "Domínios e e-mail", es: 'Dominios y correo' },
    sub: { en: 'Your .com and business email', pt: "Seu .com e e-mail profissional", es: 'Tu .com y correo profesional' },
  },
  {
    href: '/product/hosting-web',
    icon: 'server-outline',
    label: { en: 'Website hosting', pt: "Hospedagem de sites", es: 'Hosting para tu sitio' },
    sub: { en: 'Fast, secure hosting with backups', pt: "Hospedagem rápida e segura com backups", es: 'Hosting rápido y seguro con respaldos' },
  },
  {
    href: '/security',
    icon: 'shield-checkmark-outline',
    label: { en: 'Security (Sylkit Shield)', pt: "Segurança (Sylkit Shield)", es: 'Seguridad (Sylkit Shield)' },
    sub: { en: 'Check and protect your app or site', pt: "Verifique e proteja seu app ou site", es: 'Revisa y protege tu app o sitio' },
  },
  {
    href: '/quote',
    icon: 'construct-outline',
    label: { en: 'Custom system', pt: "Sistema sob medida", es: 'Sistema a medida' },
    sub: { en: 'Tell us what you need, we build it', pt: "Conte o que você precisa, nós construímos", es: 'Cuéntanos qué necesitas y lo construimos' },
  },
];

const top: { href: string; label: T }[] = [
  { href: '/', label: { en: 'Software', pt: "Software", es: 'Software' } },
  { href: '/templates', label: { en: 'Templates', pt: "Modelos", es: 'Plantillas' } },
  { href: '/domains', label: { en: 'Domains', pt: "Domínios", es: 'Dominios' } },
  { href: '/product/hosting-web', label: { en: 'Hosting', pt: "Hospedagem", es: 'Hosting' } },
  { href: '/security', label: { en: 'Security', pt: "Segurança", es: 'Seguridad' } },
];

export function Header() {
  const { lang, t } = useLang();
  const es = lang === 'es';
  const width = useClientWidth();
  const wide = width >= 980;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const go = (href: string) => {
    setOpen(false);
    router.push(href as any);
  };
  // Support goes through the help widget (chat bubble), which also offers WhatsApp.
  const help = () => {
    setOpen(false);
    try {
      window.dispatchEvent(new Event('sylkit:help'));
    } catch {
      Linking.openURL(waLink(tx('Hi, I saw Sylkit and want more info.', 'Hola, vi Sylkit y quiero información.', "Olá, vi a Sylkit e quero mais informações.")));
    }
  };

  return (
    <View style={[styles.wrap, glass]}>
      <View style={styles.inner}>
        <Link href="/" asChild>
          <Pressable style={styles.brand} accessibilityRole="link">
            <Logo />
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
            <Link href="/order" asChild>
              <Pressable style={styles.navLink} accessibilityRole="link">
                <Text style={styles.navText}>{tx('My order', 'Mi pedido', "Meu pedido")}</Text>
              </Pressable>
            </Link>
            <Pressable style={styles.helpBtn} onPress={help} accessibilityRole="button">
              <Ionicons name="chatbubble-ellipses-outline" size={17} color={colors.primary} />
              <Text style={styles.helpText}>{tx('Help', 'Ayuda', 'Ajuda')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.right}>
            <Pressable style={styles.menuBtn} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={tx('Open menu', 'Abrir menú', "Abrir menu")}>
              <Ionicons name="menu" size={24} color={colors.text} />
            </Pressable>
          </View>
        )}
      </View>

      <Modal visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <View style={styles.brand}>
              <Logo />
            </View>
            <Pressable onPress={() => setOpen(false)} style={styles.menuBtn} accessibilityRole="button" accessibilityLabel={tx('Close menu', 'Cerrar menú', "Fechar menu")}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={styles.section}>{tx('PRODUCTS', 'PRODUCTOS', "PRODUTOS")}</Text>
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
            <Pressable style={styles.item} onPress={() => go('/order')} accessibilityRole="link">
              <View style={styles.itemIcon}>
                <Ionicons name="receipt-outline" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.itemLabel, { flex: 1 }]}>{tx('Track my order', 'Seguir mi pedido', "Acompanhar meu pedido")}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </ScrollView>
          <Pressable style={[styles.sheetWa, { backgroundColor: colors.primary }]} onPress={help} accessibilityRole="button">
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            <Text style={styles.waText}>{tx('Help and support', 'Ayuda y soporte', 'Ajuda e suporte')}</Text>
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
  helpBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, minHeight: 40, marginLeft: 6 },
  helpText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
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
