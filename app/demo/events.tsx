import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Btn, Card, DemoShell, demoStyles as d, Field, Notice, Pill, Stat, Wrap } from '../../src/components/DemoShell';
import { Photo } from '../../src/components/Photo';
import { tx, useLang } from '../../src/i18n';
import { demoApi, fmtDate, money, useDemo } from '../../src/lib/demo';
import { pickPhotos } from '../../src/lib/photos';
import { useClientWidth } from '../../src/lib/useClientWidth';
import { colors } from '../../src/theme';

// Event ticketing demo: buy tickets (capacity can't be oversold), get QR tickets, and the organizer
// dashboard with sales, attendees and the door check-in scanner.

export const EVENT_TEXT: Record<string, { name: [string, string, string]; venue: string; photo: number }> = {
  jazz: { name: ['Jazz Night at the Rooftop', 'Noche de Jazz en la Terraza', 'Noite de Jazz no Terraço'], venue: 'Terraza Aurora · Caracas', photo: 1 },
  summit: { name: ['Founders Summit 2026', 'Cumbre de Emprendedores 2026', 'Cúpula de Empreendedores 2026'], venue: 'Centro de Convenciones · Valencia', photo: 3 },
  market: { name: ['Weekend Design Market', 'Mercado de Diseño de Fin de Semana', 'Feira de Design de Fim de Semana'], venue: 'Plaza Central · Maracaibo', photo: 0 },
};
export const TIER: Record<string, [string, string, string]> = { general: ['General', 'General', 'Geral'], vip: ['VIP', 'VIP', 'VIP'] };
export const L = (a: [string, string, string]) => tx(a[0], a[1], a[2]);

export default function EventsDemo() {
  const [tab, setTab] = useState('buy');
  return (
    <DemoShell
      title={tx('Event ticketing', 'Venta de entradas', 'Venda de ingressos')}
      brand="Aurora Live"
      product="events"
      tab={tab}
      onTab={setTab}
      tabs={[
        { id: 'buy', label: tx('Buy tickets', 'Comprar entradas', 'Comprar ingressos'), icon: 'ticket-outline' },
        { id: 'org', label: tx('Organizer', 'Organizador', 'Organizador'), icon: 'stats-chart-outline' },
      ]}
    >
      {tab === 'buy' ? <Buy onOrg={() => setTab('org')} /> : <Organizer />}
    </DemoShell>
  );
}

function Buy({ onOrg }: { onOrg: () => void }) {
  const { lang } = useLang();
  const width = useClientWidth() || 375;
  const wide = width >= 900;
  const { data, reload } = useDemo<any>('events/list');
  const [sel, setSel] = useState<{ ev: string; tier: string } | null>(null);
  const [qty, setQty] = useState(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const photos = pickPhotos('events', 6);
  const cw = wide ? (Math.min(width, 1180) - 32 - 32) / 3 : width - 32;

  const buy = async () => {
    if (!sel) return;
    setBusy(true);
    setErr(null);
    const r = await demoApi('events/buy', { event: sel.ev, tier: sel.tier, qty, name, email }).catch(() => ({ error: 'network' }) as any);
    setBusy(false);
    reload();
    if (r.error) setErr(r.error);
    else setOrder({ ...r, ...sel });
  };
  const errText = (e: string) =>
    ({
      sold_out: tx('Sold out: there are no tickets left in this tier.', 'Agotado: no quedan entradas en esta categoría.', 'Esgotado: não há mais ingressos nesta categoria.'),
      bad_email: tx('Please check the email address.', 'Revisa el correo.', 'Confira o e-mail.'),
      bad_name: tx('Please enter your name.', 'Escribe tu nombre.', 'Digite seu nome.'),
    })[e] || tx('Something went wrong. Please try again.', 'Algo salió mal. Intenta de nuevo.', 'Algo deu errado. Tente novamente.');

  if (order) {
    const ev = EVENT_TEXT[order.ev];
    return (
      <Wrap style={{ paddingTop: 24, gap: 16 }}>
        <Notice tone="ok" text={order.partial ? tx(`Only ${order.codes.length} tickets were left: they are yours.`, `Solo quedaban ${order.codes.length} entradas: son tuyas.`, `Só restavam ${order.codes.length} ingressos: são seus.`) : tx('Payment simulated. Your tickets are ready.', 'Pago simulado. Tus entradas están listas.', 'Pagamento simulado. Seus ingressos estão prontos.')} />
        <Text style={d.h1}>{L(ev.name)}</Text>
        <Text style={d.sub}>{ev.venue} · {tx('Order', 'Pedido', 'Pedido')} {order.order} · {money(order.total)}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {order.codes.map((c: string, i: number) => (
            <TicketCard key={c} code={c} ev={order.ev} tier={order.tier} name={name} n={i + 1} of={order.codes.length} />
          ))}
        </View>
        <View style={d.row}>
          <Btn label={tx('Scan them at the door', 'Validarlas en la puerta', 'Validar na entrada')} icon="scan-outline" onPress={onOrg} />
          <Btn kind="alt" label={tx('Buy more', 'Comprar más', 'Comprar mais')} onPress={() => { setOrder(null); setSel(null); }} />
        </View>
      </Wrap>
    );
  }

  return (
    <Wrap style={{ paddingTop: 24, gap: 16 }}>
      <Text style={d.h1}>{tx('Upcoming events', 'Próximos eventos', 'Próximos eventos')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {(data?.events || []).map((e: any) => {
          const t = EVENT_TEXT[e.id];
          return (
            <Card key={e.id} style={{ width: cw, padding: 8, gap: 10 }}>
              <Photo photo={photos[t.photo]} width={cw - 16} ratio={1.6} radius={14} />
              <View style={{ paddingHorizontal: 6, gap: 4 }}>
                <Text style={styles.date}>{fmtDate(e.date, lang, { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                <Text style={styles.evName}>{L(t.name)}</Text>
                <Text style={styles.venue}><Ionicons name="location-outline" size={13} /> {t.venue}</Text>
              </View>
              <View style={{ gap: 8, padding: 6 }}>
                {e.tiers.map((tr: any) => {
                  const on = sel?.ev === e.id && sel?.tier === tr.id;
                  return (
                    <Pressable
                      key={tr.id}
                      disabled={tr.left <= 0}
                      onPress={() => { setSel({ ev: e.id, tier: tr.id }); setErr(null); setQty(Math.min(2, tr.left)); }}
                      style={[styles.tier, on && styles.tierOn, tr.left <= 0 && { opacity: 0.55 }]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on, disabled: tr.left <= 0 }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tierName}>{L(TIER[tr.id])} · {money(tr.price)}</Text>
                        <Text style={styles.tierLeft}>{tr.left <= 0 ? tx('Sold out', 'Agotado', 'Esgotado') : `${tr.left} ${tx('left', 'disponibles', 'disponíveis')}`}</Text>
                      </View>
                      <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={20} color={on ? colors.primary : '#98A2B3'} />
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          );
        })}
      </View>

      {sel ? (
        <Card style={{ gap: 14 }}>
          <Text style={d.h2}>{L(EVENT_TEXT[sel.ev].name)} · {L(TIER[sel.tier])}</Text>
          <View style={d.row}>
            <Text style={styles.qtyLabel}>{tx('Tickets', 'Entradas', 'Ingressos')}</Text>
            <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} style={styles.qtyBtn} accessibilityLabel="-"><Ionicons name="remove" size={18} color={colors.text} /></Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable onPress={() => setQty((q) => Math.min(6, q + 1))} style={styles.qtyBtn} accessibilityLabel="+"><Ionicons name="add" size={18} color={colors.text} /></Pressable>
          </View>
          <View style={[d.row, { alignItems: 'flex-start' }]}>
            <Field label={tx('Name on tickets', 'Nombre en las entradas', 'Nome nos ingressos')} value={name} onChangeText={setName} placeholder="Ana Torres" />
            <Field label={tx('Email', 'Correo', 'E-mail')} value={email} onChangeText={setEmail} placeholder="ana@example.com" keyboardType="email-address" autoCapitalize="none" />
          </View>
          {err ? <Notice tone="error" text={errText(err)} /> : null}
          <Btn
            label={busy ? tx('Processing…', 'Procesando…', 'Processando…') : `${tx('Pay', 'Pagar', 'Pagar')} ${money(qty * (data?.events.find((e: any) => e.id === sel.ev)?.tiers.find((t: any) => t.id === sel.tier)?.price || 0))}`}
            icon="lock-closed-outline"
            onPress={buy}
            disabled={busy}
          />
          <Text style={styles.hint}>{tx('Demo: payment is simulated. VIP tiers are small so you can watch them sell out.', 'Demo: el pago es simulado. Las categorías VIP son pequeñas para que las veas agotarse.', 'Demo: o pagamento é simulado. As categorias VIP são pequenas para você vê-las esgotar.')}</Text>
        </Card>
      ) : null}
    </Wrap>
  );
}

export function TicketCard({ code, ev, tier, name, n, of }: { code: string; ev: string; tier: string; name: string; n?: number; of?: number }) {
  const t = EVENT_TEXT[ev];
  const src = `/api/demo/events/ticket/${code}/qr.svg`;
  return (
    <View style={styles.ticket}>
      <View style={styles.tHead}>
        <Text style={styles.tBrand}>AURORA LIVE</Text>
        {n ? <Text style={styles.tN}>{n}/{of}</Text> : null}
      </View>
      <Text style={styles.tName}>{L(t.name)}</Text>
      <Text style={styles.tVenue}>{t.venue}</Text>
      <View style={styles.qrBox}>
        {Platform.OS === 'web' ? createElement('img', { src, width: 180, height: 180, alt: `QR ${code}`, style: { display: 'block', imageRendering: 'pixelated' } }) : null}
      </View>
      <View style={styles.tFoot}>
        <View>
          <Text style={styles.tLabel}>{tx('Holder', 'Titular', 'Titular')}</Text>
          <Text style={styles.tVal}>{name || '—'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.tLabel}>{L(TIER[tier])}</Text>
          <Text style={[styles.tVal, { fontFamily: 'monospace' } as any]}>{code}</Text>
        </View>
      </View>
    </View>
  );
}

function Organizer() {
  const router = useRouter();
  const { lang } = useLang();
  const { data } = useDemo<any>('events/list');
  const [ev, setEv] = useState('jazz');
  const { data: att } = useDemo<any>(`events/attendees?event=${ev}`);
  if (!data) return <Wrap style={{ paddingTop: 24 }}><Text style={d.sub}>{tx('Loading…', 'Cargando…', 'Carregando…')}</Text></Wrap>;
  const e = data.events.find((x: any) => x.id === ev);
  const sold = e.tiers.reduce((s: number, t: any) => s + t.sold, 0);
  const cap = e.tiers.reduce((s: number, t: any) => s + t.cap, 0);
  const inside = e.tiers.reduce((s: number, t: any) => s + t.inside, 0);
  const revenue = e.tiers.reduce((s: number, t: any) => s + t.sold * t.price, 0);
  return (
    <Wrap style={{ paddingTop: 20, gap: 16 }}>
      <View style={d.row}>
        {data.events.map((x: any) => (
          <Pressable key={x.id} onPress={() => setEv(x.id)} style={[styles.evTab, ev === x.id && styles.evTabOn]} accessibilityRole="tab" accessibilityState={{ selected: ev === x.id }}>
            <Text style={[styles.evTabText, ev === x.id && { color: '#fff' }]}>{L(EVENT_TEXT[x.id].name)}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[d.row, { alignItems: 'stretch' }]}>
        <Stat label={tx('Tickets sold', 'Entradas vendidas', 'Ingressos vendidos')} value={`${sold} / ${cap}`} />
        <Stat label={tx('Revenue', 'Ingresos', 'Receita')} value={money(revenue)} tone="#067647" />
        <Stat label={tx('Checked in', 'Ya entraron', 'Já entraram')} value={inside} />
        <Stat label={tx('Event date', 'Fecha', 'Data')} value={fmtDate(e.date, lang)} />
      </View>
      <Card style={{ gap: 12 }}>
        <View style={[d.row, { justifyContent: 'space-between' }]}>
          <Text style={d.h2}>{tx('Sales by tier', 'Ventas por categoría', 'Vendas por categoria')}</Text>
          <Btn icon="scan-outline" label={tx('Open door scanner', 'Abrir escáner de puerta', 'Abrir leitor da entrada')} onPress={() => router.push(`/demo/checkin?event=${ev}` as any)} />
        </View>
        {e.tiers.map((t: any) => (
          <View key={t.id} style={{ gap: 6 }}>
            <View style={[d.row, { justifyContent: 'space-between' }]}>
              <Text style={styles.tierName}>{L(TIER[t.id])} · {money(t.price)}</Text>
              <Text style={styles.tierLeft}>{t.sold}/{t.cap} · {t.inside} {tx('inside', 'dentro', 'dentro')}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(t.sold / t.cap) * 100}%` }]} />
              <View style={[styles.fillIn, { width: `${(t.inside / t.cap) * 100}%` }]} />
            </View>
          </View>
        ))}
      </Card>
      <Card style={{ gap: 4 }}>
        <Text style={[d.h2, { marginBottom: 6 }]}>{tx('Attendees', 'Asistentes', 'Participantes')}</Text>
        {(att?.attendees || []).slice(0, 40).map((a: any) => (
          <View key={a.code} style={styles.att}>
            <Text style={styles.attName}>{a.name}</Text>
            <Text style={styles.attMeta}>{L(TIER[a.tier])} · {a.code}</Text>
            {a.checked_in ? <Pill label={tx('Inside', 'Dentro', 'Dentro')} tone="#067647" bg="#ECFDF3" /> : <Pill label={tx('Not yet', 'Aún no', 'Ainda não')} />}
          </View>
        ))}
      </Card>
    </Wrap>
  );
}

const styles = StyleSheet.create({
  date: { fontSize: 12.5, fontWeight: '700', color: colors.primary, textTransform: 'capitalize' },
  evName: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  venue: { fontSize: 13, color: colors.muted },
  tier: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#EAECF0', borderRadius: 12, padding: 10 },
  tierOn: { borderColor: colors.primary, backgroundColor: '#F5F8FF' },
  tierName: { fontSize: 14.5, fontWeight: '800', color: colors.text },
  tierLeft: { fontSize: 12.5, color: colors.muted },
  qtyLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginRight: 6 },
  qtyBtn: { width: 38, height: 38, borderRadius: 999, borderWidth: 1, borderColor: '#D0D5DD', alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 18, fontWeight: '800', color: colors.text, minWidth: 24, textAlign: 'center' },
  hint: { fontSize: 12.5, color: colors.muted },
  ticket: { width: 280, backgroundColor: '#fff', borderRadius: 20, padding: 18, gap: 6, borderWidth: 1, borderColor: '#EAECF0', boxShadow: '0 12px 30px rgba(11,27,58,0.08)' } as any,
  tHead: { flexDirection: 'row', justifyContent: 'space-between' },
  tBrand: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: colors.primary },
  tN: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  tName: { fontSize: 17, fontWeight: '800', color: colors.text },
  tVenue: { fontSize: 12.5, color: colors.muted },
  qrBox: { alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#D0D5DD', marginVertical: 6 },
  tFoot: { flexDirection: 'row', justifyContent: 'space-between' },
  tLabel: { fontSize: 11, color: colors.muted, fontWeight: '700', textTransform: 'uppercase' },
  tVal: { fontSize: 13.5, fontWeight: '800', color: colors.text },
  evTab: { paddingHorizontal: 14, minHeight: 38, justifyContent: 'center', borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  evTabOn: { backgroundColor: colors.text, borderColor: colors.text },
  evTabText: { fontSize: 13.5, fontWeight: '700', color: colors.text },
  track: { height: 10, borderRadius: 999, backgroundColor: '#F2F4F7', overflow: 'hidden', position: 'relative' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#B2CCFF', borderRadius: 999 },
  fillIn: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.primary, borderRadius: 999 },
  att: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F2F4F7', flexWrap: 'wrap' },
  attName: { fontSize: 14, fontWeight: '700', color: colors.text, minWidth: 140 },
  attMeta: { fontSize: 12.5, color: colors.muted, flex: 1 },
});
