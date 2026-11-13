import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Btn, Card, DateField, DemoShell, demoStyles as d, Field, Notice, Wrap } from '../../src/components/DemoShell';
import { Photo } from '../../src/components/Photo';
import { tx } from '../../src/i18n';
import { money, today } from '../../src/lib/demo';
import { pickPhotos } from '../../src/lib/photos';
import { useClientWidth } from '../../src/lib/useClientWidth';
import { colors } from '../../src/theme';

// Real estate demo: listings with search and filters, a property page with gallery, and viewing
// requests. Listings are synthetic.

type Listing = { id: number; title: [string, string, string]; area: string; deal: 'sale' | 'rent'; type: 'apartment' | 'house' | 'office'; price: number; beds: number; baths: number; m2: number; ext: number; int: number[] };
const LISTINGS: Listing[] = [
  { id: 1, title: ['Bright penthouse with terrace', 'Penthouse luminoso con terraza', 'Cobertura iluminada com terraço'], area: 'Altamira, Caracas', deal: 'sale', type: 'apartment', price: 285000, beds: 3, baths: 3, m2: 190, ext: 0, int: [0, 1, 2] },
  { id: 2, title: ['Modern family house', 'Casa familiar moderna', 'Casa familiar moderna'], area: 'La Lagunita, Caracas', deal: 'sale', type: 'house', price: 420000, beds: 4, baths: 4, m2: 340, ext: 5, int: [3, 4, 5] },
  { id: 3, title: ['Furnished apartment near the park', 'Apartamento amoblado cerca del parque', 'Apartamento mobiliado perto do parque'], area: 'Los Palos Grandes, Caracas', deal: 'rent', type: 'apartment', price: 950, beds: 2, baths: 2, m2: 96, ext: 2, int: [6, 7, 1] },
  { id: 4, title: ['Office floor with city views', 'Piso de oficinas con vista a la ciudad', 'Andar corporativo com vista'], area: 'El Rosal, Caracas', deal: 'rent', type: 'office', price: 2800, beds: 0, baths: 2, m2: 260, ext: 1, int: [8, 9, 0] },
  { id: 5, title: ['Loft in a restored building', 'Loft en edificio restaurado', 'Loft em prédio restaurado'], area: 'Valencia, Carabobo', deal: 'sale', type: 'apartment', price: 118000, beds: 1, baths: 1, m2: 72, ext: 3, int: [2, 6, 8] },
  { id: 6, title: ['House with garden and pool', 'Casa con jardín y piscina', 'Casa com jardim e piscina'], area: 'Lechería, Anzoátegui', deal: 'sale', type: 'house', price: 265000, beds: 3, baths: 3, m2: 280, ext: 4, int: [4, 9, 3] },
];
const L = (a: [string, string, string]) => tx(a[0], a[1], a[2]);

export default function RealEstateDemo() {
  const width = useClientWidth() || 375;
  const wide = width >= 900;
  const [deal, setDeal] = useState<'all' | 'sale' | 'rent'>('all');
  const [type, setType] = useState<'all' | Listing['type']>('all');
  const [beds, setBeds] = useState(0);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Listing | null>(null);
  const ext = pickPhotos('architecture', 10);
  const int = pickPhotos('realestate', 10);
  const list = useMemo(
    () => LISTINGS.filter((l) => (deal === 'all' || l.deal === deal) && (type === 'all' || l.type === type) && l.beds >= beds && (!q || (L(l.title) + l.area).toLowerCase().includes(q.toLowerCase()))),
    [deal, type, beds, q],
  );
  const cw = wide ? (Math.min(width, 1180) - 32 - 32) / 3 : width - 32;

  return (
    <DemoShell title={tx('Real estate platform', 'Plataforma inmobiliaria', 'Plataforma imobiliária')} brand="Domus Inmobiliaria" product="realestate">
      {open ? (
        <Property l={open} ext={ext} int={int} onBack={() => setOpen(null)} width={width} />
      ) : (
        <Wrap style={{ paddingTop: 20, gap: 16 }}>
          <Text style={d.h1}>{tx('Find your next home', 'Encuentra tu próximo hogar', 'Encontre seu próximo lar')}</Text>
          <Card style={{ gap: 12 }}>
            <Field label={tx('Search', 'Buscar', 'Buscar')} value={q} onChangeText={setQ} placeholder={tx('Area, city or keyword', 'Zona, ciudad o palabra clave', 'Bairro, cidade ou palavra-chave')} />
            <View style={d.row}>
              {(['all', 'sale', 'rent'] as const).map((k) => <Chip key={k} on={deal === k} onPress={() => setDeal(k)} label={{ all: tx('Buy or rent', 'Comprar o alquilar', 'Comprar ou alugar'), sale: tx('For sale', 'En venta', 'À venda'), rent: tx('For rent', 'En alquiler', 'Para alugar') }[k]} />)}
              <View style={styles.sep} />
              {(['all', 'apartment', 'house', 'office'] as const).map((k) => <Chip key={k} on={type === k} onPress={() => setType(k)} label={{ all: tx('Any type', 'Cualquier tipo', 'Qualquer tipo'), apartment: tx('Apartment', 'Apartamento', 'Apartamento'), house: tx('House', 'Casa', 'Casa'), office: tx('Office', 'Oficina', 'Escritório') }[k]} />)}
              <View style={styles.sep} />
              {[0, 2, 3].map((b) => <Chip key={b} on={beds === b} onPress={() => setBeds(b)} label={b ? `${b}+ ${tx('beds', 'hab.', 'quartos')}` : tx('Any beds', 'Hab.: todas', 'Quartos: todos')} />)}
            </View>
          </Card>
          <Text style={styles.count}>{list.length} {tx('properties', 'inmuebles', 'imóveis')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {list.map((l) => (
              <Pressable key={l.id} onPress={() => setOpen(l)} style={[styles.card, { width: cw }]} accessibilityRole="link" accessibilityLabel={L(l.title)}>
                <View>
                  <Photo photo={l.type === 'house' || l.type === 'office' ? ext[l.ext] : int[l.int[0]]} width={cw} ratio={1.45} radius={16} />
                  <View style={styles.tag}><Text style={styles.tagText}>{l.deal === 'sale' ? tx('For sale', 'En venta', 'À venda') : tx('For rent', 'En alquiler', 'Para alugar')}</Text></View>
                </View>
                <View style={{ gap: 3, padding: 4 }}>
                  <Text style={styles.price}>{money(l.price)}{l.deal === 'rent' ? <Text style={styles.per}> / {tx('month', 'mes', 'mês')}</Text> : null}</Text>
                  <Text style={styles.title}>{L(l.title)}</Text>
                  <Text style={styles.area}><Ionicons name="location-outline" size={13} /> {l.area}</Text>
                  <Specs l={l} />
                </View>
              </Pressable>
            ))}
          </View>
          {!list.length ? <Notice text={tx('No properties match. Try fewer filters.', 'No hay inmuebles con esos filtros. Prueba con menos filtros.', 'Nenhum imóvel com esses filtros. Tente menos filtros.')} /> : null}
        </Wrap>
      )}
    </DemoShell>
  );
}

const Chip = ({ on, onPress, label }: { on: boolean; onPress: () => void; label: string }) => (
  <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
    <Text style={[styles.chipText, on && { color: '#fff' }]}>{label}</Text>
  </Pressable>
);

const Specs = ({ l }: { l: Listing }) => (
  <View style={[d.row, { gap: 14, marginTop: 4 }]}>
    {l.beds ? <Text style={styles.spec}><Ionicons name="bed-outline" size={14} /> {l.beds}</Text> : null}
    <Text style={styles.spec}><Ionicons name="water-outline" size={14} /> {l.baths}</Text>
    <Text style={styles.spec}><Ionicons name="resize-outline" size={14} /> {l.m2} m²</Text>
  </View>
);

function Property({ l, ext, int, onBack, width }: { l: Listing; ext: any[]; int: any[]; onBack: () => void; width: number }) {
  const wide = width >= 900;
  const gallery = [l.type === 'house' || l.type === 'office' ? ext[l.ext] : int[l.int[0]], ...l.int.map((i) => int[i])].filter(Boolean);
  const [main, setMain] = useState(0);
  const [date, setDate] = useState(today(2));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const mw = wide ? Math.min(width, 1180) * 0.62 : width - 32;
  return (
    <Wrap style={{ paddingTop: 16, gap: 16 }}>
      <Pressable onPress={onBack} style={[d.row, { gap: 6 }]} accessibilityRole="link">
        <Ionicons name="arrow-back" size={16} color={colors.primary} />
        <Text style={{ color: colors.primary, fontWeight: '700' }}>{tx('All properties', 'Todos los inmuebles', 'Todos os imóveis')}</Text>
      </Pressable>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 20, alignItems: 'flex-start' }}>
        <View style={{ width: mw, gap: 10 }}>
          <Photo photo={gallery[main]} width={mw} ratio={1.5} radius={18} priority />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {gallery.map((p, i) => (
              <Pressable key={i} onPress={() => setMain(i)} style={[{ width: (mw - 24) / 4, borderRadius: 12, borderWidth: 2, borderColor: main === i ? colors.primary : 'transparent' }]} accessibilityRole="button" accessibilityLabel={`${i + 1}`}>
                <Photo photo={p} width={(mw - 24) / 4} ratio={1.4} radius={10} credit="none" />
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ flex: 1, gap: 12, width: wide ? undefined : '100%' }}>
          <Text style={styles.price}>{money(l.price)}{l.deal === 'rent' ? <Text style={styles.per}> / {tx('month', 'mes', 'mês')}</Text> : null}</Text>
          <Text style={d.h1}>{L(l.title)}</Text>
          <Text style={styles.area}><Ionicons name="location-outline" size={14} /> {l.area}</Text>
          <Specs l={l} />
          <Text style={d.sub}>{tx('Natural light, quiet street, close to shops and transport. Building with 24h security and parking.', 'Luz natural, calle tranquila, cerca de comercios y transporte. Edificio con vigilancia 24h y estacionamiento.', 'Luz natural, rua tranquila, perto de comércio e transporte. Prédio com segurança 24h e garagem.')}</Text>
          <Card style={{ gap: 10 }}>
            <Text style={d.h2}>{tx('Book a viewing', 'Agenda una visita', 'Agende uma visita')}</Text>
            {sent ? (
              <Notice tone="ok" text={tx('Viewing requested. The agent confirms by WhatsApp within the hour.', 'Visita solicitada. El agente confirma por WhatsApp en menos de una hora.', 'Visita solicitada. O corretor confirma pelo WhatsApp em até uma hora.')} />
            ) : (
              <>
                <DateField label={tx('Day', 'Día', 'Dia')} value={date} min={today(1)} onChange={setDate} />
                <Field label={tx('Name', 'Nombre', 'Nome')} value={name} onChangeText={setName} />
                <Field label="WhatsApp" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+58 412 000 0000" />
                <Btn label={tx('Request viewing', 'Solicitar visita', 'Solicitar visita')} onPress={() => setSent(true)} disabled={name.trim().length < 2 || phone.replace(/\D/g, '').length < 7} />
              </>
            )}
          </Card>
        </View>
      </View>
    </Wrap>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 12, minHeight: 36, justifyContent: 'center', borderRadius: 999, backgroundColor: '#F2F4F7' },
  chipOn: { backgroundColor: colors.text },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  sep: { width: 1, height: 22, backgroundColor: '#EAECF0' },
  count: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 8, gap: 8 },
  tag: { position: 'absolute', left: 10, top: 10, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, fontWeight: '800', color: colors.text },
  price: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  per: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  title: { fontSize: 15.5, fontWeight: '700', color: colors.text },
  area: { fontSize: 13, color: colors.muted },
  spec: { fontSize: 13.5, color: colors.text, fontWeight: '600' },
});
