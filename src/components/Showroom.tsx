import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageBackground, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { categories, type Product } from '../data/products';
import { storeTemplates } from '../data/storeTemplates';
import { tx, ui, useLang } from '../i18n';
import { tplText } from '../lib/names';
import { templateCover, templatePreview } from '../lib/templateShot';
import { useClientWidth } from '../lib/useClientWidth';
import { colors, waLink } from '../theme';

// The catalog as a gallery, laid out like Behance's Explore page:
//   Filter button · search bar with type tabs · sort
//   a row of photo chips for each sector
//   big cover cards: the real working system inside a laptop + phone, with Sylkit's name, a badge and the price under it.
// Covers live in /public/shots/covers (generated from real screenshots of the live demos and template previews).

type Kind = 'all' | 'system' | 'template';
type Sort = 'featured' | 'price' | 'name';
type Item = {
  key: string;
  kind: 'system' | 'template';
  title: string;
  sub: string;
  cover?: string;
  category: string;
  price: number | null;
  priceUnit: string;
  demo?: string;
  platforms: string[];
  open: () => void;
  haystack: string;
};

// The cover shown behind each sector chip.
const CHIP_COVER: Record<string, string> = {
  all: '/shots/covers/portafolio.webp',
  templates: '/shots/covers/tpl-aula-app.webp',
  retail: '/shots/covers/pos.webp',
  health: '/shots/covers/farmacia.webp',
  food: '/shots/covers/restaurante.webp',
  services: '/shots/covers/taller.webp',
  education: '/shots/covers/escuela.webp',
  management: '/shots/covers/facturas.webp',
  web: '/shots/covers/sitio-web.webp',
  mobile: '/shots/covers/app-movil.webp',
  ai: '/shots/covers/asistente.webp',
};
const ORIGIN = Platform.OS === 'web' ? '' : 'https://sylkit.com';

export function Showroom({ products, initialQuery = '' }: { products: Product[]; initialQuery?: string }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const width = useClientWidth();
  const [cat, setCat] = useState('all');
  const [kind, setKind] = useState<Kind>('all');
  const [sort, setSort] = useState<Sort>('featured');
  const [query, setQuery] = useState(initialQuery);
  const [sortOpen, setSortOpen] = useState(false);
  const [panel, setPanel] = useState(false);
  const [demoOnly, setDemoOnly] = useState(false);
  const [platform, setPlatform] = useState<string | null>(null);
  const chipsRef = useRef<ScrollView>(null);
  const chipX = useRef(0);
  useEffect(() => setQuery(initialQuery), [initialQuery]);

  const openUrl = (url: string) => {
    if (Platform.OS === 'web') {
      try {
        window.open(url, '_blank', 'noopener');
        return;
      } catch {}
    }
    Linking.openURL(url);
  };

  const items: Item[] = useMemo(() => {
    const sys: Item[] = products
      .filter((p) => p.category !== 'domains')
      .map((p) => {
        const yearly = p.pricing?.billing?.length === 1 && p.pricing.billing[0] === 'yearly';
        return {
          key: p.slug,
          kind: 'system',
          title: t(p.name),
          sub: t((categories.find((c) => c.id === p.category) ?? { name: ui.all }).name),
          cover: p.cover ? ORIGIN + p.cover : p.image,
          category: p.category,
          price: p.priceFrom == null ? null : yearly ? p.priceFrom * 10 : p.priceFrom,
          priceUnit: yearly ? tx('/yr', '/año', '/ano') : tx('/mo', '/mes', '/mês'),
          demo: p.demoUrl,
          platforms: p.platforms,
          open: () => router.push(`/product/${p.slug}` as any),
          haystack: [p.name.es, p.name.en, p.name.pt ?? '', p.short.es, p.short.en, ...p.platforms].join(' ').toLowerCase(),
        };
      });
    const tpl: Item[] = storeTemplates.map((x) => {
      const prod = products.find((p) => p.slug === x.product);
      return {
        key: 'tpl-' + x.slug,
        kind: 'template',
        title: x.name,
        sub: tplText(x.tagline),
        cover: templateCover(x.slug),
        category: 'templates',
        price: prod?.priceFrom ?? null,
        priceUnit: tx('/mo', '/mes', '/mês'),
        demo: templatePreview(x.slug),
        platforms: x.kind === 'app' ? ['iOS', 'Android'] : ['Web'],
        open: () => openUrl(templatePreview(x.slug)),
        haystack: [x.name, ...x.tagline, ...x.sectorName, ...x.blurb].join(' ').toLowerCase(),
      };
    });
    return [...sys, ...tpl];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, lang]);

  const chips = useMemo(() => {
    const out = [{ id: 'all', label: tx('For you', 'Para ti', 'Para você') }, { id: 'templates', label: tx('Templates', 'Plantillas', 'Modelos') }];
    for (const c of categories) if (items.some((i) => i.category === c.id)) out.push({ id: c.id, label: t(c.name) });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lang]);

  const sortOptions: { id: Sort; label: string }[] = [
    { id: 'featured', label: tx('Recommended', 'Recomendado', 'Recomendado') },
    { id: 'price', label: tx('Lowest price', 'Menor precio', 'Menor preço') },
    { id: 'name', label: tx('Name A–Z', 'Nombre A–Z', 'Nome A–Z') },
  ];
  const kinds: { id: Kind; label: string }[] = [
    { id: 'all', label: tx('All', 'Todo', 'Tudo') },
    { id: 'system', label: tx('Systems', 'Sistemas', 'Sistemas') },
    { id: 'template', label: tx('Templates', 'Plantillas', 'Modelos') },
  ];

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = items.filter(
      (i) =>
        (cat === 'all' || i.category === cat) &&
        (kind === 'all' || i.kind === kind) &&
        (!demoOnly || !!i.demo) &&
        (!platform || i.platforms.some((p) => p.toLowerCase().includes(platform.toLowerCase()))) &&
        (!q || i.haystack.includes(q) || i.title.toLowerCase().includes(q)),
    );
    if (sort === 'price') out.sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
    if (sort === 'name') out.sort((a, b) => a.title.localeCompare(b.title));
    return out;
  }, [items, cat, kind, demoOnly, platform, query, sort]);

  const cols = width >= 1400 ? 5 : width >= 1100 ? 4 : width >= 760 ? 3 : width >= 520 ? 2 : 1;
  const wide = width >= 820;
  const activeFilters = (demoOnly ? 1 : 0) + (platform ? 1 : 0) + (kind !== 'all' ? 1 : 0);
  const priceText = (i: Item) => (i.price == null ? tx('Quote', 'Cotizar', 'Orçamento') : `$${Number.isInteger(i.price) ? i.price : i.price.toFixed(2)}${i.priceUnit}`);
  const scrollChips = () => {
    chipX.current += 480;
    chipsRef.current?.scrollTo({ x: chipX.current, animated: true });
  };

  const filterBtn = (
    <Pressable style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnOn]} onPress={() => setPanel(true)} accessibilityRole="button" accessibilityLabel={tx('Filters', 'Filtros', 'Filtros')}>
      <Ionicons name="options-outline" size={18} color={colors.text} />
      {wide ? <Text style={styles.filterText}>{tx('Filter', 'Filtro', 'Filtro')}</Text> : null}
      {activeFilters ? <Text style={styles.badgeCount}>{activeFilters}</Text> : null}
    </Pressable>
  );

  return (
    <View style={{ gap: 18 }}>
      {/* Toolbar: Filter · search with tabs · sort */}
      <View style={[styles.toolbar, { zIndex: 20 }]}>
        {filterBtn}
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={tx('Search Sylkit…', 'Buscar en Sylkit…', 'Buscar na Sylkit…')}
            placeholderTextColor="#8A94A6"
            style={styles.searchInput}
            accessibilityLabel={tx('Search', 'Buscar', 'Buscar')}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} accessibilityLabel={tx('Clear', 'Borrar', 'Limpar')}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
          {width >= 900 ? (
            <View style={styles.tabs} accessibilityRole="tablist">
              {kinds.map((k) => (
                <Pressable key={k.id} onPress={() => setKind(k.id)} style={[styles.tab, kind === k.id && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: kind === k.id }}>
                  <Text style={[styles.tabText, kind === k.id && styles.tabTextOn]}>{k.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
        {wide ? (
          <View style={{ zIndex: 21 }}>
            <Pressable style={styles.sortBtn} onPress={() => setSortOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: sortOpen }}>
              <Ionicons name="swap-vertical" size={16} color={colors.text} />
              <Text style={styles.sortText}>{sortOptions.find((s) => s.id === sort)!.label}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.text} />
            </Pressable>
            {sortOpen ? (
              <View style={styles.menu}>
                {sortOptions.map((o) => (
                  <Pressable key={o.id} style={[styles.menuItem, sort === o.id && styles.menuItemOn]} onPress={() => { setSort(o.id); setSortOpen(false); }} accessibilityRole="menuitem">
                    <Text style={[styles.menuText, sort === o.id && { color: colors.primary }]}>{o.label}</Text>
                    {sort === o.id ? <Ionicons name="checkmark" size={16} color={colors.primary} /> : null}
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Sector chips with photos */}
      <View style={{ position: 'relative' }}>
        <ScrollView
          ref={chipsRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => (chipX.current = e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={32}
          contentContainerStyle={{ gap: 10, paddingRight: 56 }}
        >
          {chips.map((c, i) => {
            const on = cat === c.id;
            return (
              <Pressable key={c.id} onPress={() => setCat(c.id)} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.chipWrap, on && styles.chipWrapOn]}>
                {i === 0 ? (
                  <View style={[styles.chip, styles.chipFirst]}>
                    <Ionicons name="star-outline" size={17} color="#fff" />
                    <Text style={styles.chipText}>{c.label}</Text>
                  </View>
                ) : (
                  <ImageBackground source={{ uri: ORIGIN + (CHIP_COVER[c.id] ?? CHIP_COVER.all) }} style={styles.chip} imageStyle={{ borderRadius: 8 }} resizeMode="cover">
                    <View style={styles.chipShade} />
                    <Text style={styles.chipText} numberOfLines={1}>
                      {c.label}
                    </Text>
                  </ImageBackground>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
        {wide ? (
          <Pressable style={styles.chipArrow} onPress={scrollChips} accessibilityLabel={tx('More categories', 'Más categorías', 'Mais categorias')}>
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.headRow}>
        <Text style={styles.head}>{cat === 'all' && !query ? tx('Recommended for you', 'Recomendado para ti', 'Recomendado para você') : chips.find((c) => c.id === cat)?.label}</Text>
        <Text style={styles.count}>
          {list.length} {list.length === 1 ? tx('result', 'resultado', 'resultado') : tx('results', 'resultados', 'resultados')}
        </Text>
      </View>

      {/* Cards */}
      {list.length ? (
        <View style={[styles.grid, { marginHorizontal: -8 }]}>
          {list.map((i) => (
            <View key={i.key} style={{ width: `${100 / cols}%`, paddingHorizontal: 8, paddingBottom: 24 }}>
              <Card item={i} touch={!wide} priceText={priceText(i)} openDemo={openUrl} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={28} color={colors.primary} />
          <Text style={styles.emptyTitle}>{tx('Nothing matches that yet', 'Aún no hay nada con eso', 'Ainda não há nada com isso')}</Text>
          <Text style={styles.emptySub}>{tx('Tell us what you need and we build it for you.', 'Cuéntanos qué necesitas y lo construimos para ti.', 'Conte o que você precisa e nós construímos.')}</Text>
          <Pressable style={styles.emptyBtn} onPress={() => Linking.openURL(waLink(tx(`Hi, I'm looking for: ${query}`, `Hola, busco: ${query}`, `Olá, procuro: ${query}`)))} accessibilityRole="link">
            <Ionicons name="logo-whatsapp" size={17} color="#fff" />
            <Text style={styles.emptyBtnText}>{t(ui.talk)}</Text>
          </Pressable>
        </View>
      )}

      {/* Filters panel (slides in from the right, like Behance) */}
      {panel ? (
        <View style={styles.panelBg as any}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPanel(false)} accessibilityLabel={tx('Close', 'Cerrar', 'Fechar')} />
          <View style={[styles.panel as any, { width: Math.min(380, width) }]}>
            <View style={styles.panelHead}>
              <Text style={styles.panelTitle}>{tx('Filters', 'Filtros', 'Filtros')}</Text>
              <Pressable onPress={() => setPanel(false)} accessibilityLabel={tx('Close', 'Cerrar', 'Fechar')} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 18, gap: 22 }}>
              <Section icon="layers-outline" title={tx('Type', 'Tipo', 'Tipo')}>
                {kinds.map((k) => (
                  <Opt key={k.id} on={kind === k.id} label={k.label} onPress={() => setKind(k.id)} />
                ))}
              </Section>
              <Section icon="grid-outline" title={tx('Sector', 'Sector', 'Setor')}>
                {chips.map((c, i) => (
                  <Opt key={c.id} on={cat === c.id} label={i === 0 ? tx('All sectors', 'Todos los sectores', 'Todos os setores') : c.label} onPress={() => setCat(c.id)} />
                ))}
              </Section>
              <Section icon="phone-portrait-outline" title={tx('Works on', 'Funciona en', 'Funciona em')}>
                <Opt on={!platform} label={tx('Any device', 'Cualquier dispositivo', 'Qualquer dispositivo')} onPress={() => setPlatform(null)} />
                {['Web', 'Android', 'iOS'].map((p) => (
                  <Opt key={p} on={platform === p} label={p} onPress={() => setPlatform(p)} />
                ))}
              </Section>
              <Section icon="play-circle-outline" title={tx('Live demo', 'Demo en vivo', 'Demo ao vivo')}>
                <Opt on={demoOnly} check label={tx('Only with a live demo', 'Solo con demo en vivo', 'Só com demo ao vivo')} onPress={() => setDemoOnly((v) => !v)} />
              </Section>
            </ScrollView>
            <View style={styles.panelFoot}>
              <Pressable onPress={() => { setKind('all'); setCat('all'); setPlatform(null); setDemoOnly(false); }} style={styles.clearBtn} accessibilityRole="button">
                <Text style={styles.clearText}>{tx('Clear', 'Limpiar', 'Limpar')}</Text>
              </Pressable>
              <Pressable onPress={() => setPanel(false)} style={styles.applyBtn} accessibilityRole="button">
                <Text style={styles.applyText}>{tx(`Show ${list.length}`, `Ver ${list.length}`, `Ver ${list.length}`)}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <Ionicons name={icon as any} size={17} color={colors.muted} />
        <Text style={styles.secTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Opt({ on, label, onPress, check }: { on: boolean; label: string; onPress: () => void; check?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.opt} accessibilityRole={check ? 'checkbox' : 'radio'} accessibilityState={check ? { checked: on } : { selected: on }}>
      <View style={[check ? styles.box : styles.radio, on && styles.dotOn]}>{on ? <Ionicons name="checkmark" size={13} color="#fff" /> : null}</View>
      <Text style={[styles.optText, on && { color: colors.text, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

function Card({ item, touch, priceText, openDemo }: { item: Item; touch: boolean; priceText: string; openDemo: (url: string) => void }) {
  const [hover, setHover] = useState(false);
  const isTpl = item.kind === 'template';
  const showOverlay = hover && !touch;
  return (
    <View>
      <Pressable onPress={item.open} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} style={styles.cover} accessibilityRole="link" accessibilityLabel={item.title}>
        {item.cover ? <Image source={{ uri: item.cover }} style={[styles.img, hover && ({ transform: [{ scale: 1.03 }] } as any)]} resizeMode="cover" /> : null}
        {showOverlay ? (
          <View style={styles.shade as any}>
            <Text style={styles.ovTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {!touch ? (
              <Text style={styles.ovSub} numberOfLines={1}>
                {item.sub}
              </Text>
            ) : null}
          </View>
        ) : null}
        {hover && !isTpl && item.demo ? (
          <Pressable style={styles.demoBtn} onPress={() => openDemo(item.demo!)} accessibilityRole="link">
            <Ionicons name="play" size={12} color={colors.text} />
            <Text style={styles.demoBtnText}>{tx('Try demo', 'Probar demo', 'Testar demo')}</Text>
          </Pressable>
        ) : null}
      </Pressable>
      <View style={styles.meta}>
        <Image source={{ uri: `${ORIGIN}/brand/sylkit-mark.svg` }} style={styles.avatar} />
        <Text style={styles.owner} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.badge, isTpl ? styles.badgeTpl : item.demo ? styles.badgeLive : styles.badgeSvc]} numberOfLines={1}>
          {isTpl ? tx('TEMPLATE', 'PLANTILLA', 'MODELO') : item.demo ? tx('DEMO', 'DEMO', 'DEMO') : tx('SERVICE', 'SERVICIO', 'SERVIÇO')}
        </Text>
        <View style={{ flex: 1, minWidth: 4 }} />
        <Ionicons name="pricetag-outline" size={13} color={colors.muted} />
        <Text style={styles.price} numberOfLines={1}>
          {priceText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1, borderColor: '#D5DAE3', backgroundColor: colors.surface },
  filterBtnOn: { borderColor: colors.primary, backgroundColor: '#F2F6FF' },
  filterText: { fontSize: 15, fontWeight: '700', color: colors.text },
  badgeCount: { minWidth: 20, height: 20, borderRadius: 999, backgroundColor: colors.primary, color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center', lineHeight: 20, overflow: 'hidden' },
  search: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingLeft: 18, paddingRight: 6, borderRadius: 999, backgroundColor: '#F2F4F7' },
  searchInput: { flex: 1, minWidth: 0, fontSize: 16, color: colors.text, paddingVertical: 10, outlineStyle: 'none' } as any,
  tabs: { flexDirection: 'row', gap: 2 },
  tab: { paddingHorizontal: 14, height: 36, borderRadius: 999, justifyContent: 'center' },
  tabOn: { backgroundColor: colors.surface, boxShadow: '0 1px 3px rgba(15,23,42,0.14)' } as any,
  tabText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  tabTextOn: { color: colors.text },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 48, paddingHorizontal: 8 },
  sortText: { fontSize: 15, fontWeight: '700', color: colors.text },
  menu: { position: 'absolute', top: 52, right: 0, minWidth: 200, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingVertical: 6, boxShadow: '0 18px 40px rgba(15,40,90,0.16)', elevation: 8 } as any,
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, minHeight: 42 },
  menuItemOn: { backgroundColor: '#F3F7FF' },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  chipWrap: { borderRadius: 10, padding: 2, borderWidth: 2, borderColor: 'transparent' },
  chipWrapOn: { borderColor: colors.text },
  chip: { width: 156, height: 48, borderRadius: 8, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 10 },
  chipFirst: { backgroundImage: 'linear-gradient(135deg,#1D6BFF,#3D8BFF)', backgroundColor: colors.primary } as any,
  chipShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,12,24,0.52)' },
  chipText: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  chipArrow: { position: 'absolute', right: 0, top: 6, width: 40, height: 40, borderRadius: 999, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(15,23,42,0.18)' } as any,
  headRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginTop: 4 },
  head: { fontSize: 16, fontWeight: '800', color: colors.text },
  count: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cover: { width: '100%', aspectRatio: 1.28, borderRadius: 4, overflow: 'hidden', backgroundColor: '#EEF1F6', position: 'relative' },
  img: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transitionDuration: '300ms' } as any,
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14, backgroundImage: 'linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.72) 100%)' },
  ovTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ovSub: { color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 2, fontWeight: '600' },
  demoBtn: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 999, paddingHorizontal: 12, height: 32 },
  demoBtnText: { fontSize: 13, fontWeight: '800', color: colors.text },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  avatar: { width: 22, height: 22, borderRadius: 999, backgroundColor: '#0B1B3A' },
  owner: { fontSize: 14, fontWeight: '700', color: colors.text, flexShrink: 1, minWidth: 0 },
  badge: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', flexShrink: 0, whiteSpace: 'nowrap' } as any,
  badgeLive: { backgroundColor: colors.primary, color: '#fff' },
  badgeTpl: { backgroundColor: '#0B1B3A', color: '#fff' },
  badgeSvc: { backgroundColor: '#EEF2F8', color: colors.text },
  price: { fontSize: 13, fontWeight: '600', color: colors.muted, flexShrink: 0 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.muted, marginTop: 4 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  emptySub: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 16 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.whatsapp, borderRadius: 999, paddingHorizontal: 18, minHeight: 44, marginTop: 6 },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  panelBg: { position: Platform.OS === 'web' ? 'fixed' : 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, backgroundColor: 'rgba(8,12,24,0.35)' },
  panel: { position: 'absolute', top: 0, right: 0, bottom: 0, backgroundColor: colors.surface, boxShadow: '-12px 0 40px rgba(8,12,24,0.18)' },
  panelHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, height: 60, borderBottomWidth: 1, borderBottomColor: colors.border },
  panelTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  secTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 38 },
  radio: { width: 20, height: 20, borderRadius: 999, borderWidth: 1.5, borderColor: '#B8C0CC', alignItems: 'center', justifyContent: 'center' },
  box: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: '#B8C0CC', alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  optText: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  panelFoot: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  clearBtn: { height: 46, paddingHorizontal: 18, borderRadius: 999, justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  clearText: { fontSize: 15, fontWeight: '700', color: colors.text },
  applyBtn: { flex: 1, height: 46, borderRadius: 999, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  applyText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
