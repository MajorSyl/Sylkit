import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Btn, Card, DemoShell, demoStyles as d, Field, Notice, Pill, Stat, Wrap } from '../../src/components/DemoShell';
import { Photo } from '../../src/components/Photo';
import { tx, useLang } from '../../src/i18n';
import { demoApi, demoPublic, fmtDate, useDemo } from '../../src/lib/demo';
import { pickPhotos } from '../../src/lib/photos';
import { useClientWidth } from '../../src/lib/useClientWidth';
import { colors } from '../../src/theme';

// Logistics demo: dispatcher dashboard (create shipments, assign drivers, update status) and the
// public tracking page customers use with their code.

const ST: Record<string, { label: () => string; tone: string; bg: string; icon: string }> = {
  received: { label: () => tx('Received', 'Recibido', 'Recebido'), tone: '#475467', bg: '#F2F4F7', icon: 'cube-outline' },
  in_transit: { label: () => tx('In transit', 'En tránsito', 'Em trânsito'), tone: '#1849A9', bg: '#EFF4FF', icon: 'car-outline' },
  at_hub: { label: () => tx('At hub', 'En centro de distribución', 'No centro de distribuição'), tone: '#5925DC', bg: '#F4F3FF', icon: 'business-outline' },
  out_for_delivery: { label: () => tx('Out for delivery', 'En reparto', 'Saiu para entrega'), tone: '#B54708', bg: '#FFFAEB', icon: 'bicycle-outline' },
  delivered: { label: () => tx('Delivered', 'Entregado', 'Entregue'), tone: '#067647', bg: '#ECFDF3', icon: 'checkmark-done-outline' },
  issue: { label: () => tx('Needs attention', 'Requiere atención', 'Requer atenção'), tone: '#B42318', bg: '#FEF3F2', icon: 'warning-outline' },
};
const NEXT: Record<string, string[]> = { received: ['in_transit', 'issue'], in_transit: ['at_hub', 'out_for_delivery', 'issue'], at_hub: ['out_for_delivery', 'issue'], out_for_delivery: ['delivered', 'issue'], issue: ['in_transit', 'out_for_delivery'], delivered: [] };

export default function LogisticsDemo() {
  const [tab, setTab] = useState('ops');
  const [track, setTrack] = useState('');
  return (
    <DemoShell
      title={tx('Logistics management', 'Gestión logística', 'Gestão logística')}
      brand="Rápido Cargo"
      product="logistics"
      tab={tab}
      onTab={setTab}
      tabs={[
        { id: 'ops', label: tx('Dispatch', 'Despacho', 'Despacho'), icon: 'git-network-outline' },
        { id: 'track', label: tx('Customer tracking', 'Rastreo del cliente', 'Rastreio do cliente'), icon: 'search-outline' },
      ]}
    >
      {tab === 'ops' ? <Ops onTrack={(c) => { setTrack(c); setTab('track'); }} /> : <Track initial={track} />}
    </DemoShell>
  );
}

function Ops({ onTrack }: { onTrack: (c: string) => void }) {
  const { lang } = useLang();
  const { data, reload } = useDemo<any>('logistics/list');
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState(false);
  const [f, setF] = useState({ sender: '', receiver: '', origin: '', dest: '', weight: '', driver: '' });
  const [msg, setMsg] = useState<{ t: string; tone: 'ok' | 'error' } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!data) return <Wrap style={{ paddingTop: 24 }}><Text style={d.sub}>{tx('Loading shipments…', 'Cargando envíos…', 'Carregando envios…')}</Text></Wrap>;
  const list = data.shipments.filter((s: any) => filter === 'all' || s.status === filter);
  const count = (k: string) => data.shipments.filter((s: any) => s.status === k).length;

  const create = async () => {
    setBusy(true);
    const r = await demoApi('logistics/create', { ...f, weight: Number(f.weight) }).catch(() => ({ error: 'network' }) as any);
    setBusy(false);
    if (r.error) setMsg({ t: r.error === 'bad_weight' ? tx('Weight must be a number in kg.', 'El peso debe ser un número en kg.', 'O peso deve ser um número em kg.') : tx('Fill in sender, receiver, origin and destination.', 'Completa remitente, destinatario, origen y destino.', 'Preencha remetente, destinatário, origem e destino.'), tone: 'error' });
    else {
      setMsg({ t: `${tx('Shipment created', 'Envío creado', 'Envio criado')}: ${r.code}`, tone: 'ok' });
      setForm(false);
      setF({ sender: '', receiver: '', origin: '', dest: '', weight: '', driver: '' });
      reload();
    }
  };
  const update = async (code: string, status: string) => {
    setBusy(true);
    await demoApi('logistics/update', { code, status, place: '' }).catch(() => null);
    setBusy(false);
    reload();
  };

  return (
    <Wrap style={{ paddingTop: 20, gap: 16 }}>
      <View style={[d.row, { alignItems: 'stretch' }]}>
        <Stat label={tx('Active shipments', 'Envíos activos', 'Envios ativos')} value={data.shipments.filter((s: any) => s.status !== 'delivered').length} />
        <Stat label={tx('Out for delivery', 'En reparto', 'Saiu para entrega')} value={count('out_for_delivery')} tone="#B54708" />
        <Stat label={tx('Delivered', 'Entregados', 'Entregues')} value={count('delivered')} tone="#067647" />
        <Stat label={tx('Need attention', 'Requieren atención', 'Requerem atenção')} value={count('issue')} tone="#B42318" />
      </View>
      {msg ? <Notice tone={msg.tone} text={msg.t} /> : null}
      <View style={[d.row, { justifyContent: 'space-between' }]}>
        <View style={d.row}>
          {['all', ...Object.keys(ST)].map((k) => (
            <Pressable key={k} onPress={() => setFilter(k)} style={[styles.chip, filter === k && styles.chipOn]} accessibilityRole="tab" accessibilityState={{ selected: filter === k }}>
              <Text style={[styles.chipText, filter === k && { color: '#fff' }]}>{k === 'all' ? tx('All', 'Todos', 'Todos') : ST[k].label()}</Text>
            </Pressable>
          ))}
        </View>
        <Btn icon="add" label={tx('New shipment', 'Nuevo envío', 'Novo envio')} onPress={() => { setForm(!form); setMsg(null); }} />
      </View>

      {form ? (
        <Card style={{ gap: 12 }}>
          <Text style={d.h2}>{tx('New shipment', 'Nuevo envío', 'Novo envio')}</Text>
          <View style={[d.row, { alignItems: 'flex-start' }]}>
            <Field label={tx('Sender', 'Remitente', 'Remetente')} value={f.sender} onChangeText={(v) => setF({ ...f, sender: v })} />
            <Field label={tx('Receiver', 'Destinatario', 'Destinatário')} value={f.receiver} onChangeText={(v) => setF({ ...f, receiver: v })} />
            <Field label={tx('From', 'Origen', 'Origem')} value={f.origin} onChangeText={(v) => setF({ ...f, origin: v })} placeholder="Caracas" />
            <Field label={tx('To', 'Destino', 'Destino')} value={f.dest} onChangeText={(v) => setF({ ...f, dest: v })} placeholder="Mérida" />
            <Field label={tx('Weight (kg)', 'Peso (kg)', 'Peso (kg)')} value={f.weight} onChangeText={(v) => setF({ ...f, weight: v })} keyboardType="decimal-pad" />
            <Field label={tx('Driver (optional)', 'Chofer (opcional)', 'Motorista (opcional)')} value={f.driver} onChangeText={(v) => setF({ ...f, driver: v })} />
          </View>
          <Btn label={busy ? '…' : tx('Create and print label', 'Crear e imprimir guía', 'Criar e imprimir etiqueta')} onPress={create} disabled={busy} />
        </Card>
      ) : null}

      <Card style={{ padding: 0 }}>
        {list.map((s: any) => {
          const st = ST[s.status];
          const isOpen = open === s.code;
          return (
            <View key={s.code} style={styles.ship}>
              <Pressable onPress={() => setOpen(isOpen ? null : s.code)} style={styles.shipHead} accessibilityRole="button" accessibilityState={{ expanded: isOpen }}>
                <View style={[styles.icon, { backgroundColor: st.bg }]}><Ionicons name={st.icon as any} size={18} color={st.tone} /></View>
                <View style={{ flex: 1, minWidth: 180 }}>
                  <Text style={styles.route}>{s.origin} → {s.dest}</Text>
                  <Text style={styles.meta}>{s.code} · {s.receiver} · {s.weight} kg{s.driver ? ` · ${s.driver}` : ''}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Pill label={st.label()} tone={st.tone} bg={st.bg} />
                  {s.status !== 'delivered' ? <Text style={styles.meta}>ETA {fmtDate(s.eta, lang)}</Text> : null}
                </View>
              </Pressable>
              {isOpen ? (
                <View style={styles.detail}>
                  {s.events.map((e: any, i: number) => (
                    <View key={i} style={styles.ev}>
                      <View style={[styles.evDot, { backgroundColor: ST[e.status]?.tone || '#98A2B3' }]} />
                      <Text style={styles.evText}>
                        <Text style={{ fontWeight: '800' }}>{ST[e.status]?.label()}</Text> · {e.place} · {new Date(e.at).toLocaleString(lang === 'en' ? 'en' : lang === 'pt' ? 'pt-BR' : 'es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {e.note ? ` · ${e.note}` : ''}
                      </Text>
                    </View>
                  ))}
                  <View style={[d.row, { marginTop: 8 }]}>
                    {NEXT[s.status].map((n) => (
                      <Btn key={n} small kind={n === 'issue' ? 'alt' : 'main'} label={`→ ${ST[n].label()}`} onPress={() => update(s.code, n)} disabled={busy} />
                    ))}
                    <Btn small kind="alt" icon="open-outline" label={tx('Customer view', 'Vista del cliente', 'Visão do cliente')} onPress={() => onTrack(s.code)} />
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
      </Card>
    </Wrap>
  );
}

function Track({ initial }: { initial: string }) {
  const { lang } = useLang();
  const width = useClientWidth() || 375;
  const [code, setCode] = useState(initial);
  const [s, setS] = useState<any>(null);
  const [err, setErr] = useState(false);
  const photo = pickPhotos('logistics', 1, 2)[0];
  const look = async (c = code) => {
    setErr(false);
    const r = await demoPublic(`logistics/track/${encodeURIComponent(c.trim().toUpperCase())}`).catch(() => ({ error: 'x' }) as any);
    if (r.error) {
      setS(null);
      setErr(true);
    } else setS(r.shipment);
  };
  useEffect(() => {
    if (initial) look(initial);
  }, [initial]);
  const steps = ['received', 'in_transit', 'at_hub', 'out_for_delivery', 'delivered'];
  const at = s ? Math.max(0, steps.indexOf(s.status === 'issue' ? 'in_transit' : s.status)) : 0;
  return (
    <View>
      <View style={{ position: 'relative' }}>
        <Photo photo={photo} width={Math.min(width, 1600)} ratio={width >= 900 ? 3.4 : 1.6} priority />
        <View style={styles.shade} pointerEvents="none" />
        <View style={styles.trackHero} pointerEvents="box-none">
          <Text style={styles.trackTitle}>{tx('Track your shipment', 'Rastrea tu envío', 'Rastreie seu envio')}</Text>
        </View>
      </View>
      <Wrap style={{ marginTop: -30, gap: 16, maxWidth: 760 }}>
        <Card style={[d.row, { alignItems: 'flex-end' }]}>
          <Field label={tx('Tracking code', 'Código de rastreo', 'Código de rastreio')} value={code} onChangeText={setCode} placeholder="SKXXXXXXXX" autoCapitalize="characters" onSubmitEditing={() => look()} />
          <Btn label={tx('Track', 'Rastrear', 'Rastrear')} icon="search" onPress={() => look()} />
        </Card>
        {err ? <Notice tone="error" text={tx('We couldn’t find that code. Check it and try again.', 'No encontramos ese código. Revísalo e intenta de nuevo.', 'Não encontramos esse código. Confira e tente novamente.')} /> : null}
        {s ? (
          <Card style={{ gap: 16 }}>
            <View style={[d.row, { justifyContent: 'space-between' }]}>
              <View>
                <Text style={d.h2}>{s.origin} → {s.dest}</Text>
                <Text style={styles.meta}>{s.code} · {s.weight} kg</Text>
              </View>
              <Pill label={ST[s.status].label()} tone={ST[s.status].tone} bg={ST[s.status].bg} />
            </View>
            <View style={styles.progress}>
              {steps.map((k, i) => (
                <View key={k} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                  <View style={[styles.pDot, i <= at && { backgroundColor: colors.primary }]}>
                    <Ionicons name={ST[k].icon as any} size={14} color={i <= at ? '#fff' : '#98A2B3'} />
                  </View>
                  <Text style={[styles.pLabel, i <= at && { color: colors.text }]} numberOfLines={2}>{ST[k].label()}</Text>
                </View>
              ))}
            </View>
            {s.status !== 'delivered' ? <Text style={styles.eta}>{tx('Estimated delivery', 'Entrega estimada', 'Entrega estimada')}: {fmtDate(s.eta, lang, { weekday: 'long', day: 'numeric', month: 'long' })}</Text> : null}
            {s.events.slice().reverse().map((e: any, i: number) => (
              <View key={i} style={styles.ev}>
                <View style={[styles.evDot, { backgroundColor: ST[e.status]?.tone }]} />
                <Text style={styles.evText}><Text style={{ fontWeight: '800' }}>{ST[e.status]?.label()}</Text> · {e.place} · {new Date(e.at).toLocaleString()}</Text>
              </View>
            ))}
          </Card>
        ) : !err ? <Text style={d.sub}>{tx('Tip: open a shipment in Dispatch and press “Customer view”.', 'Prueba: abre un envío en Despacho y pulsa “Vista del cliente”.', 'Dica: abra um envio no Despacho e toque em “Visão do cliente”.')}</Text> : null}
      </Wrap>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 12, minHeight: 34, justifyContent: 'center', borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  ship: { borderBottomWidth: 1, borderBottomColor: '#F2F4F7' },
  shipHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, flexWrap: 'wrap' },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  route: { fontSize: 15, fontWeight: '800', color: colors.text },
  meta: { fontSize: 12.5, color: colors.muted },
  detail: { paddingHorizontal: 16, paddingBottom: 16, gap: 8, marginLeft: 52 },
  ev: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  evDot: { width: 10, height: 10, borderRadius: 999, marginTop: 5 },
  evText: { flex: 1, fontSize: 13.5, color: colors.text, lineHeight: 19 },
  shade: { position: 'absolute', inset: 0, backgroundColor: 'rgba(8,14,30,0.45)' } as any,
  trackHero: { position: 'absolute', left: 0, right: 0, bottom: 52, alignItems: 'center' },
  trackTitle: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  progress: { flexDirection: 'row', gap: 4 },
  pDot: { width: 30, height: 30, borderRadius: 999, backgroundColor: '#F2F4F7', alignItems: 'center', justifyContent: 'center' },
  pLabel: { fontSize: 11.5, color: '#98A2B3', textAlign: 'center', fontWeight: '600' },
  eta: { fontSize: 14, fontWeight: '700', color: colors.text, textTransform: 'none' },
});
