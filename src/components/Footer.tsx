import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang, ui } from '../i18n';
import { colors, waLink } from '../theme';
import { Logo } from './Logo';
import { tx } from '../i18n';

const CLOUD_POINTS: { icon: keyof typeof Ionicons.glyphMap; en: string; es: string; pt: string }[] = [
  { icon: 'download-outline', en: 'Nothing to install', es: 'Nada que instalar', pt: 'Nada para instalar' },
  { icon: 'phone-portrait-outline', en: 'Works on phone, tablet or PC', es: 'Funciona en teléfono, tablet o PC', pt: 'Funciona no celular, tablet ou PC' },
  { icon: 'cloud-done-outline', en: 'Data backed up automatically', es: 'Datos respaldados automáticamente', pt: 'Dados com backup automático' },
  { icon: 'headset-outline', en: 'Remote updates and support', es: 'Actualizaciones y soporte a distancia', pt: 'Atualizações e suporte remotos' },
  { icon: 'globe-outline', en: 'Ready in days, anywhere', es: 'Listo en días, donde estés', pt: 'Pronto em dias, onde você estiver' },
];

export function Footer() {
  const { t, lang } = useLang();
  return (
    <View style={styles.wrap}>
      <View style={styles.cloud}>
        <Text style={styles.cloudTitle}>
          {tx('Cloud systems for modern businesses.', 'Sistemas en la nube para negocios modernos.', 'Sistemas na nuvem para empresas modernas.')}
        </Text>
        <Text style={styles.cloudSub}>
          {tx('Set up remotely, anywhere in the world.', 'Instalados a distancia, en cualquier parte del mundo.', 'Configurados remotamente, em qualquer lugar do mundo.')}
        </Text>
        <View style={styles.chips}>
          {CLOUD_POINTS.map((p) => (
            <View key={p.en} style={styles.chip}>
              <Ionicons name={p.icon} size={15} color={colors.primary} />
              <Text style={styles.chipText}>{tx(p.en, p.es, p.pt)}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.inner}>
        <View style={{ gap: 4, flexShrink: 1 }}>
          <Logo size={26} />
          <Text style={styles.text}>{t(ui.footer)}</Text>
        </View>
        <Pressable
          style={styles.link}
          onPress={() => Linking.openURL(waLink(tx('Hi, I saw Sylkit and want more info.', 'Hola, vi Sylkit y quiero información.', "Olá, vi a Sylkit e quero mais informações.")))}
          accessibilityRole="link"
        >
          <Ionicons name="logo-whatsapp" size={18} color={colors.whatsapp} />
          <Text style={styles.linkText}>+1 (646) 934-8752</Text>
        </Pressable>
      </View>
      <View style={styles.legal}>
        <Link href="/security" style={styles.legalLink}>{tx('Security (Sylkit Shield)', 'Seguridad (Sylkit Shield)', "Segurança (Sylkit Shield)")}</Link>
        <Link href="/terms" style={styles.legalLink}>{tx('Terms', 'Términos', "Termos")}</Link>
        <Link href="/privacy" style={styles.legalLink}>{tx('Privacy', 'Privacidad', "Privacidade")}</Link>
        <Link href="/refunds" style={styles.legalLink}>{tx('Refunds and cancellation', 'Reembolsos y cancelación', "Reembolsos e cancelamento")}</Link>
      </View>
      <Text style={styles.copy}>© {new Date().getFullYear()} Sylkit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, marginTop: 48 },
  inner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  cloud: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cloudTitle: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', letterSpacing: -0.3 },
  cloudSub: { fontSize: 16, color: colors.muted, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.softBlue,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  brand: { fontSize: 18, fontWeight: '800', color: colors.text },
  text: { fontSize: 14, color: colors.muted },
  link: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  linkText: { fontSize: 14, fontWeight: '600', color: colors.text },
  legal: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18, paddingHorizontal: 16, paddingTop: 4 },
  legalLink: { fontSize: 13, color: colors.muted, textDecorationLine: 'underline', paddingVertical: 6 },
  copy: { textAlign: 'center', fontSize: 12, color: colors.muted, paddingBottom: 24, paddingTop: 8 },
});
