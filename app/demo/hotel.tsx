import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Btn, Card, DateField, DemoShell, demoStyles as d, Field, Notice, Pill, Stat, Wrap } from '../../src/components/DemoShell';
import { Photo } from '../../src/components/Photo';
import { tx, useLang } from '../../src/i18n';
import { demoApi, fmtDate, money, today, useDemo } from '../../src/lib/demo';
import { pickPhotos } from '../../src/lib/photos';
import { useClientWidth } from '../../src/lib/useClientWidth';
import { colors } from '../../src/theme';

// Hotel booking engine demo: the guest website (live availability, booking without double bookings)
// and the front desk (occupancy, arrivals, a room-by-day calendar, check-in/out).

const ROOM_TEXT: Record<string, { name: [string, string, string]; desc: [string, string, string]; photo: number }> = {
  standard: { name: ['Standard room', 'Habitación estándar', 'Quarto standard'], desc: ['Queen bed, rain shower, work desk.', 'Cama queen, ducha de lluvia, escritorio.', 'Cama queen, chuveiro, mesa de trabalho.'], photo: 4 },
  deluxe: { name: ['Deluxe room', 'Habitación deluxe', 'Quarto deluxe'], desc: ['King bed, city view, breakfast included.', 'Cama king, vista a la ciudad, desayuno incluido.', 'Cama king, vista da cidade, café da manhã incluso.'], photo: 1 },
  family: { name: ['Family room', 'Habitación familiar', 'Quarto família'], desc: ['Two beds for four guests, sofa area.', 'Dos camas para cuatro huéspedes, zona de sofá.', 'Duas camas para quatro hóspedes, área de sofá.'], photo: 3 },
  suite: { name: ['Garden suite', 'Suite jardín', 'Suíte jardim'], desc: ['Private terrace, bathtub, late check-out.', 'Terraza privada, bañera, salida tardía.', 'Terraço privativo, banheira, check-out tardio.'], photo: 2 },
};
const L = (a: [string, string, string]) => tx(a[0], a[1], a[2]);

const STATUS: Record<string, { label: () => string; tone: string; bg: string }> = {
  confirmed: { label: () => tx('Confirmed', 'Confirmada', 'Confirmada'), tone: '#1849A9', bg: '#EFF4FF' },
  checked_in: { label: () => tx('In house', 'Hospedado', 'Hospedado'), tone: '#067647', bg: '#ECFDF3' },
  checked_out: { label: () => tx('Checked out', 'Salió', 'Saiu'), tone: '#475467', bg: '#F2F4F7' },
  cancelled: { label: () => tx('Cancelled', 'Cancelada', 'Cancelada'), tone: '#B42318', bg: '#FEF3F2' },
};

export default function HotelDemo() {
  const [tab, setTab] = useState('guest');
  return (
    <DemoShell
      title={tx('Hotel booking system', 'Sistema de reservas para hotel', 'Sistema de reservas para hotel')}
      brand="Casa Aurora Hotel"
      product="hotel"
      tab={tab}
      onTab={setTab}
      tabs={[
        { id: 'guest', label: tx('Guest website', 'Web del huésped', 'Site do hóspede'), icon: 'globe-outline' },
        { id: 'desk', label: tx('Front desk', 'Recepción', 'Recepção'), icon: 'grid-outline' },
      ]}
    >
      {tab === 'guest' ? <GuestSite onDesk={() => setTab('desk')} /> : <FrontDesk />}
    </DemoShell>
  );
}

function GuestSite({ onDesk }: { onDesk: () => void }) {
  const { lang } = useLang();
  const width = useClientWidth() || 375;
  const wide = width >= 900;
  const [checkIn, setIn] = useState(today(7));
  const [checkOut, setOut] = useState(today(10));
  const [pick, setPick] = useState<string | null>(null);
  const [guest, setGuest] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const valid = checkIn && checkOut && checkOut > checkIn;
  const { data, error, reload } = useDemo<any>(valid ? `hotel/availability?in=${checkIn}&out=${checkOut}` : null);
  const hero = pickPhotos('hotels', 1, 0)[0];
  const photos = pickPhotos('hotels', 6, 0);

  const errText = (e: string) =>
    ({
      sold_out: tx('Someone just booked the last room of this type for those dates. Please choose another room or dates.', 'Alguien acaba de reservar la última habitación de este tipo para esas fechas. Elige otra habitación u otras fechas.', 'Alguém acabou de reservar o último quarto deste tipo para essas datas. Escolha outro quarto ou outras datas.'),
      bad_email: tx('Please check the email address.', 'Revisa el correo electrónico.', 'Confira o e-mail.'),
      bad_name: tx('Please enter the guest name.', 'Escribe el nombre del huésped.', 'Digite o nome do hóspede.'),
      bad_dates: tx('Check-out must be after check-in.', 'La salida debe ser después de la llegada.', 'O check-out deve ser depois do check-in.'),
      past_dates: tx('Those dates have passed.', 'Esas fechas ya pasaron.', 'Essas datas já passaram.'),
      too_long: tx('Stays are limited to 30 nights online.', 'Las estadías online son de hasta 30 noches.', 'Estadias online de até 30 noites.'),
      rate_limited: tx('Too many tries today. Please try again tomorrow.', 'Demasiados intentos hoy. Intenta mañana.', 'Muitas tentativas hoje. Tente amanhã.'),
    })[e] || tx('Something went wrong. Please try again.', 'Algo salió mal. Intenta de nuevo.', 'Algo deu errado. Tente novamente.');

  const book = async () => {
    if (!pick) return;
    setBusy(true);
    setErr(null);
    const r = await demoApi('hotel/book', { type: pick, in: checkIn, out: checkOut, guest, email }).catch(() => ({ error: 'network' }) as any);
    setBusy(false);
    if (r.error) {
      setErr(r.error);
      reload();
    } else {
      setDone({ ...r, type: pick });
      reload();
    }
  };

  const room = data?.rooms?.find((r: any) => r.type === pick);

  return (
    <View>
      {/* Hero */}
      <View style={{ position: 'relative' }}>
        <Photo photo={hero} width={Math.min(width, 1600)} ratio={wide ? 2.9 : 1.25} priority />
        <View style={styles.heroShade} pointerEvents="none" />
        <View style={styles.heroText} pointerEvents="none">
          <Text style={styles.heroKicker}>Casa Aurora · {tx('Boutique hotel', 'Hotel boutique', 'Hotel boutique')}</Text>
          <Text style={[styles.heroTitle, wide && { fontSize: 46, lineHeight: 50 }]}>{tx('Stay in the heart of the city', 'Hospédate en el corazón de la ciudad', 'Hospede-se no coração da cidade')}</Text>
        </View>
      </View>

      <Wrap style={{ marginTop: -36 }}>
        {/* Search bar */}
        <Card style={[styles.search, { boxShadow: '0 18px 40px rgba(11,27,58,0.14)' } as any]}>
          <DateField label={tx('Check-in', 'Llegada', 'Check-in')} value={checkIn} min={today(0)} onChange={(v) => { setIn(v); setDone(null); if (v >= checkOut) setOut(new Date(Date.parse(v) + 864e5).toISOString().slice(0, 10)); }} />
          <DateField label={tx('Check-out', 'Salida', 'Check-out')} value={checkOut} min={checkIn} onChange={(v) => { setOut(v); setDone(null); }} />
          <View style={{ justifyContent: 'flex-end', flexBasis: 160, flexGrow: 1 }}>
            <Text style={styles.nights}>
              {data?.nights ? `${data.nights} ${tx('nights', 'noches', 'noites')} · ${fmtDate(checkIn, lang)} → ${fmtDate(checkOut, lang)}` : tx('Choose your dates', 'Elige tus fechas', 'Escolha suas datas')}
            </Text>
          </View>
        </Card>

        {done ? (
          <Card style={{ marginTop: 20, gap: 12, borderColor: '#ABEFC6' }}>
            <View style={d.row}>
              <View style={styles.okDot}><Ionicons name="checkmark" size={18} color="#fff" /></View>
              <Text style={d.h2}>{tx('Your booking is confirmed', 'Tu reserva está confirmada', 'Sua reserva está confirmada')}</Text>
            </View>
            <Text style={d.sub}>
              {L(ROOM_TEXT[done.type].name)} · {done.nights} {tx('nights', 'noches', 'noites')} · {fmtDate(checkIn, lang)} → {fmtDate(checkOut, lang)} · {money(done.total)}
            </Text>
            <Text style={styles.code}>{tx('Booking code', 'Código de reserva', 'Código da reserva')}: {done.code}</Text>
            <View style={d.row}>
              <Btn label={tx('See it at the front desk', 'Verla en recepción', 'Ver na recepção')} icon="grid-outline" onPress={onDesk} />
              <Btn kind="alt" label={tx('Book another room', 'Reservar otra habitación', 'Reservar outro quarto')} onPress={() => { setDone(null); setPick(null); }} />
            </View>
            <Text style={styles.hint}>{tx('Tip: try booking the Garden suite twice for the same nights. The second booking is refused: there is only one suite.', 'Prueba: reserva la Suite jardín dos veces para las mismas noches. La segunda se rechaza: solo hay una suite.', 'Dica: reserve a Suíte jardim duas vezes nas mesmas noites. A segunda é recusada: só existe uma suíte.')}</Text>
          </Card>
        ) : null}

        {error ? <View style={{ marginTop: 16 }}><Notice tone="error" text={errText(error)} /></View> : null}

        <Text style={[d.h2, { marginTop: 28, marginBottom: 12 }]}>{tx('Rooms', 'Habitaciones', 'Quartos')}</Text>
        <View style={styles.rooms}>
          {(data?.rooms || []).map((r: any) => {
            const t = ROOM_TEXT[r.type];
            const sel = pick === r.type;
            const cw = wide ? (Math.min(width, 1180) - 32 - 16 * 3) / 4 : wide ? 0 : width - 32;
            return (
              <Pressable
                key={r.type}
                onPress={() => r.free > 0 && (setPick(r.type), setErr(null), setDone(null))}
                style={[styles.room, { width: wide ? cw : '100%' }, sel && styles.roomSel, r.free === 0 && { opacity: 0.6 }]}
                accessibilityRole="radio"
                accessibilityState={{ checked: sel, disabled: r.free === 0 }}
                accessibilityLabel={L(t.name)}
              >
                <Photo photo={photos[t.photo]} width={wide ? cw : width - 32} ratio={1.5} radius={14} />
                <View style={{ gap: 4, padding: 4 }}>
                  <View style={[d.row, { justifyContent: 'space-between' }]}>
                    <Text style={styles.roomName}>{L(t.name)}</Text>
                    {r.free === 0 ? <Pill label={tx('Sold out', 'Agotada', 'Esgotado')} tone="#B42318" bg="#FEF3F2" /> : r.free === 1 ? <Pill label={tx('Last room', 'Última', 'Último')} tone="#B54708" bg="#FFFAEB" /> : <Pill label={`${r.free} ${tx('left', 'libres', 'livres')}`} tone="#067647" bg="#ECFDF3" />}
                  </View>
                  <Text style={styles.roomDesc}>{L(t.desc)}</Text>
                  <Text style={styles.roomDesc}>
                    <Ionicons name="people-outline" size={13} /> {r.guests} · <Text style={styles.price}>{money(r.price)}</Text> / {tx('night', 'noche', 'noite')}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          {!data && !error ? <Text style={d.sub}>{tx('Checking availability…', 'Consultando disponibilidad…', 'Verificando disponibilidade…')}</Text> : null}
        </View>

        {pick && room && !done ? (
          <Card style={{ marginTop: 20, gap: 14 }}>
            <Text style={d.h2}>{tx('Guest details', 'Datos del huésped', 'Dados do hóspede')}</Text>
            <View style={[d.row, { alignItems: 'flex-start' }]}>
              <Field label={tx('Full name', 'Nombre completo', 'Nome completo')} value={guest} onChangeText={setGuest} placeholder="Ana Torres" autoComplete="name" />
              <Field label={tx('Email', 'Correo', 'E-mail')} value={email} onChangeText={setEmail} placeholder="ana@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            </View>
            <View style={styles.summary}>
              <Text style={styles.sumText}>{L(ROOM_TEXT[pick].name)} · {data.nights} × {money(room.price)}</Text>
              <Text style={styles.sumTotal}>{money(data.nights * room.price)}</Text>
            </View>
            {err ? <Notice tone="error" text={errText(err)} /> : null}
            <Btn label={busy ? tx('Booking…', 'Reservando…', 'Reservando…') : tx('Confirm booking', 'Confirmar reserva', 'Confirmar reserva')} icon="lock-closed-outline" onPress={book} disabled={busy} />
            <Text style={styles.hint}>{tx('Demo: no payment is taken. In your system this step takes a deposit by card, PayPal, Pago Móvil or mobile money.', 'Demo: no se cobra nada. En tu sistema este paso cobra un depósito por tarjeta, PayPal, Pago Móvil o dinero móvil.', 'Demo: nada é cobrado. No seu sistema esta etapa cobra um sinal por cartão, PayPal, Pix ou dinheiro móvel.')}</Text>
          </Card>
        ) : null}
      </Wrap>
    </View>
  );
}

function FrontDesk() {
  const { lang } = useLang();
  const width = useClientWidth() || 375;
  const [from] = useState(today(-2));
  const days = 14;
  const to = useMemo(() => new Date(Date.parse(from) + days * 864e5).toISOString().slice(0, 10), [from]);
  const { data, reload } = useDemo<any>(`hotel/bookings?from=${from}&to=${to}`);
  const [busy, setBusy] = useState<string | null>(null);
  const dates = Array.from({ length: days }, (_, i) => new Date(Date.parse(from) + i * 864e5).toISOString().slice(0, 10));
  const cell = width >= 900 ? 56 : 44;

  const setStatus = async (code: string, status: string) => {
    setBusy(code);
    await demoApi('hotel/status', { code, status }).catch(() => null);
    setBusy(null);
    reload();
  };

  if (!data) return <Wrap style={{ paddingTop: 24 }}><Text style={d.sub}>{tx('Loading the front desk…', 'Cargando recepción…', 'Carregando recepção…')}</Text></Wrap>;
  const active = data.bookings.filter((b: any) => b.status !== 'cancelled');
  const revenue = active.reduce((s: number, b: any) => s + b.total, 0);
  const units: { type: string; unit: number }[] = data.rooms.flatMap((r: any) => Array.from({ length: r.units }, (_, i) => ({ type: r.type, unit: i + 1 })));

  return (
    <Wrap style={{ paddingTop: 20, gap: 16 }}>
      <View style={[d.row, { alignItems: 'stretch' }]}>
        <Stat label={tx('Occupancy tonight', 'Ocupación hoy', 'Ocupação hoje')} value={`${data.occupancy}%`} />
        <Stat label={tx('Arrivals today', 'Llegadas hoy', 'Chegadas hoje')} value={data.arrivals} />
        <Stat label={tx('Departures today', 'Salidas hoy', 'Saídas hoje')} value={data.departures} />
        <Stat label={tx('Booked revenue (2 weeks)', 'Ingresos reservados (2 semanas)', 'Receita reservada (2 semanas)')} value={money(revenue)} tone="#067647" />
      </View>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Text style={[d.h2, { padding: 16, paddingBottom: 8 }]}>{tx('Room calendar', 'Calendario de habitaciones', 'Calendário de quartos')}</Text>
        <View style={{ overflow: 'scroll' } as any}>
          <View style={{ minWidth: 150 + cell * days }}>
            <View style={styles.calRow}>
              <View style={[styles.calHead, { width: 150 }]} />
              {dates.map((dt) => (
                <View key={dt} style={[styles.calHead, { width: cell }, dt === data.today && { backgroundColor: '#EFF4FF' }]}>
                  <Text style={styles.calDay}>{fmtDate(dt, lang, { weekday: 'short' })}</Text>
                  <Text style={styles.calNum}>{fmtDate(dt, lang, { day: 'numeric' })}</Text>
                </View>
              ))}
            </View>
            {units.map((u) => {
              const bs = active.filter((b: any) => b.room_type === u.type && b.unit === u.unit);
              return (
                <View key={u.type + u.unit} style={styles.calRow}>
                  <View style={[styles.calLabel, { width: 150 }]}>
                    <Text style={styles.calRoom} numberOfLines={1}>{L(ROOM_TEXT[u.type].name)}</Text>
                    <Text style={styles.calUnit}>#{u.unit}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', position: 'relative', height: 44 }}>
                    {dates.map((dt) => <View key={dt} style={[styles.calCell, { width: cell }, dt === data.today && { backgroundColor: '#F5F8FF' }]} />)}
                    {bs.map((b: any) => {
                      const s = Math.max(0, (Date.parse(b.check_in) - Date.parse(from)) / 864e5);
                      const e = Math.min(days, (Date.parse(b.check_out) - Date.parse(from)) / 864e5);
                      if (e <= 0 || s >= days) return null;
                      const st = STATUS[b.status];
                      return (
                        <View key={b.code} style={[styles.bar, { left: s * cell + cell / 2, width: (e - s) * cell - 4, backgroundColor: st.bg, borderColor: st.tone }]}>
                          <Text style={[styles.barText, { color: st.tone }]} numberOfLines={1}>{b.guest}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <Text style={d.h2}>{tx('Bookings', 'Reservas', 'Reservas')}</Text>
        {data.bookings.map((b: any) => {
          const st = STATUS[b.status];
          return (
            <View key={b.code} style={styles.bk}>
              <View style={{ flex: 1, minWidth: 220, gap: 2 }}>
                <View style={d.row}>
                  <Text style={styles.bkName}>{b.guest}</Text>
                  <Pill label={st.label()} tone={st.tone} bg={st.bg} />
                </View>
                <Text style={styles.bkMeta}>
                  {L(ROOM_TEXT[b.room_type].name)} #{b.unit} · {fmtDate(b.check_in, lang)} → {fmtDate(b.check_out, lang)} · {money(b.total)} · {b.code}
                </Text>
              </View>
              <View style={d.row}>
                {b.status === 'confirmed' ? <Btn small label={tx('Check in', 'Registrar llegada', 'Fazer check-in')} onPress={() => setStatus(b.code, 'checked_in')} disabled={busy === b.code} /> : null}
                {b.status === 'checked_in' ? <Btn small label={tx('Check out', 'Registrar salida', 'Fazer check-out')} onPress={() => setStatus(b.code, 'checked_out')} disabled={busy === b.code} /> : null}
                {b.status === 'confirmed' ? <Btn small kind="alt" label={tx('Cancel', 'Cancelar', 'Cancelar')} onPress={() => setStatus(b.code, 'cancelled')} disabled={busy === b.code} /> : null}
              </View>
            </View>
          );
        })}
      </Card>
    </Wrap>
  );
}

const styles = StyleSheet.create({
  heroShade: { position: 'absolute', inset: 0, backgroundColor: 'rgba(8,14,30,0.42)' } as any,
  heroText: { position: 'absolute', left: 0, right: 0, bottom: 64, paddingHorizontal: 24, maxWidth: 1180, alignSelf: 'center', width: '100%', gap: 8 },
  heroKicker: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { color: '#fff', fontSize: 30, lineHeight: 34, fontWeight: '800', letterSpacing: -0.8, maxWidth: 620 },
  search: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' },
  nights: { fontSize: 14, fontWeight: '700', color: colors.text, paddingBottom: 12 },
  rooms: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  room: { backgroundColor: '#fff', borderRadius: 18, padding: 8, gap: 8, borderWidth: 2, borderColor: 'transparent' },
  roomSel: { borderColor: colors.primary },
  roomName: { fontSize: 16, fontWeight: '800', color: colors.text },
  roomDesc: { fontSize: 13.5, color: colors.muted, lineHeight: 19 },
  price: { color: colors.text, fontWeight: '800' },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
  sumText: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  sumTotal: { fontSize: 20, fontWeight: '800', color: colors.text },
  hint: { fontSize: 12.5, color: colors.muted, lineHeight: 18 },
  okDot: { width: 30, height: 30, borderRadius: 999, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  code: { fontSize: 15, fontWeight: '800', color: colors.text, fontFamily: 'monospace' } as any,
  calRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EEF1F5' },
  calHead: { height: 44, alignItems: 'center', justifyContent: 'center' },
  calDay: { fontSize: 11, color: colors.muted, textTransform: 'capitalize' },
  calNum: { fontSize: 14, fontWeight: '800', color: colors.text },
  calLabel: { height: 44, paddingHorizontal: 12, justifyContent: 'center' },
  calRoom: { fontSize: 13, fontWeight: '700', color: colors.text },
  calUnit: { fontSize: 11, color: colors.muted },
  calCell: { height: 44, borderLeftWidth: 1, borderLeftColor: '#F2F4F7' },
  bar: { position: 'absolute', top: 7, height: 30, borderRadius: 8, borderLeftWidth: 3, paddingHorizontal: 8, justifyContent: 'center' },
  barText: { fontSize: 12, fontWeight: '700' },
  bk: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEF1F5' },
  bkName: { fontSize: 15, fontWeight: '800', color: colors.text },
  bkMeta: { fontSize: 13, color: colors.muted },
});
