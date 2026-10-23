import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLang } from '../i18n';
import { checkDomain, DomainChoice, DomainMode, DomainResult, money } from '../lib/pricing';
import { colors, shadow } from '../theme';

// Lets the client choose their web address:
//  - sub: free name.sylkit.com (included in every plan)
//  - new: a new .com/.net/.org we register in their name (adds the "Your own domain" extra)
//  - own: a domain they already have; we connect it for free

const RESERVED = new Set([
  'www', 'admin', 'api', 'app', 'mail', 'help', 'support', 'billing', 'status',
  'alertas', 'pos', 'inventario', 'farmacia', 'clinica', 'restaurante', 'salon', 'taller', 'servicios', 'escuela', 'nomina', 'facturas', 'tienda', 'portafolio', 'asistente',
]);

const L = {
  title: { es: 'Tu dirección web', en: 'Your web address' },
  sub: { es: 'Cómo entrarán tú y tus clientes al sistema.', en: 'How you and your customers will open the system.' },
  modeSub: { es: 'Gratis: tunegocio.sylkit.com', en: 'Free: yourbusiness.sylkit.com' },
  modeSubNote: { es: 'Incluido en todos los planes. Puedes cambiar a un dominio propio cuando quieras.', en: 'Included in every plan. You can move to your own domain any time.' },
  modeNew: { es: 'Quiero mi propio dominio (.com, .net, .org)', en: 'I want my own domain (.com, .net, .org)' },
  modeNewNote: {
    es: 'Lo registramos a tu nombre: es tuyo. Nosotros lo conectamos y renovamos mientras tengas tu plan.',
    en: 'We register it in your name, so it is yours. We connect it and renew it while your plan is active.',
  },
  modeOwn: { es: 'Ya tengo un dominio', en: 'I already have a domain' },
  modeOwnNote: { es: 'Lo conectamos gratis. Solo necesitamos acceso a su configuración (DNS).', en: 'We connect it for free. We only need access to its settings (DNS).' },
  placeholderSub: { es: 'nombre de tu negocio', en: 'your business name' },
  placeholderNew: { es: 'nombre que quieres, ej. farmaciasanrafael', en: 'name you want, e.g. sunrisepharmacy' },
  placeholderOwn: { es: 'tunegocio.com', en: 'yourbusiness.com' },
  check: { es: 'Verificar', en: 'Check' },
  available: { es: 'Disponible', en: 'Available' },
  taken: { es: 'Ocupado', en: 'Taken' },
  unknown: { es: 'No se pudo verificar', en: "Couldn't check" },
  pick: { es: 'Elegir', en: 'Choose' },
  chosen: { es: 'Elegido', en: 'Chosen' },
  allTaken: { es: 'Esos están ocupados. Prueba otro nombre o una variación (ej. agrega tu ciudad).', en: 'Those are taken. Try another name or a variation (e.g. add your city).' },
  error: { es: 'Escribe un nombre válido (letras, números o guiones).', en: 'Enter a valid name (letters, numbers or hyphens).' },
  offline: { es: 'No pudimos verificar ahora. Elige igual y lo confirmamos contigo.', en: "We couldn't check right now. Pick it anyway and we'll confirm with you." },
  subTaken: { es: 'Ese nombre está reservado. Prueba otro.', en: 'That name is reserved. Try another.' },
  saved: { es: 'Guardado', en: 'Saved' },
};

const clean = (v: string) => v.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[^a-z0-9.-]/g, '');

export function DomainPicker({ value, onChange, domainPrice }: { value?: DomainChoice; onChange: (d?: DomainChoice) => void; domainPrice: number }) {
  const { t, lang } = useLang();
  const [mode, setMode] = useState<DomainMode>(value?.mode ?? 'sub');
  const [text, setText] = useState(value?.mode === 'new' ? value.name.split('.')[0] : value?.name ?? '');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<DomainResult[] | null>(null);
  const [note, setNote] = useState('');

  const switchMode = (m: DomainMode) => {
    setMode(m);
    setResults(null);
    setNote('');
    onChange(undefined);
  };

  const submit = async () => {
    setNote('');
    setResults(null);
    const v = clean(text);
    if (mode === 'sub') {
      const label = v.split('.')[0].replace(/^-+|-+$/g, '').slice(0, 40);
      if (label.length < 2) return setNote(t(L.error));
      if (RESERVED.has(label)) return setNote(t(L.subTaken));
      setText(label);
      return onChange({ mode: 'sub', name: label });
    }
    if (mode === 'own') {
      if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(v)) return setNote(t(L.error));
      setText(v);
      return onChange({ mode: 'own', name: v });
    }
    if (v.split('.')[0].length < 2) return setNote(t(L.error));
    setBusy(true);
    try {
      const r = await checkDomain(v);
      setResults(r.results);
      if (r.results.every((x) => x.status === 'taken')) setNote(t(L.allTaken));
      else if (r.results.every((x) => x.status === 'unknown')) setNote(t(L.offline));
    } catch {
      setNote(t(L.error));
    }
    setBusy(false);
  };

  const options: { m: DomainMode; title: string; note: string; price?: string }[] = [
    { m: 'sub', title: t(L.modeSub), note: t(L.modeSubNote) },
    { m: 'new', title: t(L.modeNew), note: t(L.modeNewNote), price: `+${money(domainPrice)}${lang === 'es' ? '/mes' : '/mo'}` },
    { m: 'own', title: t(L.modeOwn), note: t(L.modeOwnNote) },
  ];

  return (
    <View style={[styles.box, shadow]}>
      <Text style={styles.h3}>{t(L.title)}</Text>
      <Text style={styles.muted}>{t(L.sub)}</Text>
      {options.map((o) => {
        const on = mode === o.m;
        return (
          <Pressable key={o.m} onPress={() => switchMode(o.m)} style={[styles.opt, on && styles.optOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
            <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.optTitle}>{o.title}</Text>
              <Text style={styles.optNote}>{o.note}</Text>
            </View>
            {o.price ? <Text style={styles.price}>{o.price}</Text> : null}
          </Pressable>
        );
      })}

      <View style={styles.inputRow}>
        <View style={styles.inputWrap}>
          <TextInput
            value={text}
            onChangeText={(v) => {
              setText(v);
              if (value) onChange(undefined);
            }}
            onSubmitEditing={submit}
            placeholder={t(mode === 'sub' ? L.placeholderSub : mode === 'new' ? L.placeholderNew : L.placeholderOwn)}
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          {mode === 'sub' ? <Text style={styles.suffix}>.sylkit.com</Text> : null}
        </View>
        <Pressable onPress={submit} style={styles.btn} accessibilityRole="button">
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{mode === 'new' ? t(L.check) : t(L.pick)}</Text>}
        </Pressable>
      </View>

      {results ? (
        <View style={{ gap: 8 }}>
          {results.map((r) => {
            const chosen = value?.mode === 'new' && value.name === r.domain;
            const canPick = r.status !== 'taken';
            return (
              <View key={r.domain} style={styles.result}>
                <Text style={styles.domain}>{r.domain}</Text>
                <Text
                  style={[
                    styles.pill,
                    r.status === 'available' ? styles.pillOk : r.status === 'taken' ? styles.pillNo : styles.pillMaybe,
                  ]}
                >
                  {t(r.status === 'available' ? L.available : r.status === 'taken' ? L.taken : L.unknown)}
                </Text>
                {canPick ? (
                  <Pressable
                    onPress={() => onChange({ mode: 'new', name: r.domain })}
                    style={[styles.pickBtn, chosen && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.pickText, chosen && { color: '#fff' }]}>{chosen ? `✓ ${t(L.chosen)}` : t(L.pick)}</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {value && mode !== 'new' ? (
        <View style={styles.done}>
          <Ionicons name="checkmark-circle" size={18} color="#0E7F98" />
          <Text style={styles.doneText}>{value.mode === 'sub' ? `${value.name}.sylkit.com` : value.name}</Text>
        </View>
      ) : null}
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border },
  h3: { fontSize: 18, fontWeight: '800', color: colors.text },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  opt: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  optOn: { borderColor: colors.primary, backgroundColor: '#F7FAFF' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#C3CDE0', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  optNote: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  price: { fontSize: 14, fontWeight: '800', color: colors.text },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  inputWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5DCEA',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  input: { flex: 1, minWidth: 0, paddingVertical: 11, fontSize: 15, color: colors.text, outlineStyle: 'none' } as any,
  suffix: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  btn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  result: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
  domain: { flex: 1, minWidth: 140, fontSize: 15, fontWeight: '700', color: colors.text },
  pill: { fontSize: 12, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  pillOk: { backgroundColor: '#DCFCE7', color: '#166534' },
  pillNo: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  pillMaybe: { backgroundColor: '#FEF3C7', color: '#92400E' },
  pickBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  pickText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  done: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.softCyan, borderRadius: 10, padding: 10 },
  doneText: { fontSize: 14, fontWeight: '800', color: '#0E7F98' },
  note: { fontSize: 13, color: colors.muted },
});
