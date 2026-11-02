import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { categories, type Product } from '../data/products';
import { storeTemplates } from '../data/storeTemplates';
import { tx, ui, useLang } from '../i18n';
import { tplText } from '../lib/names';
import { templatePreview, templateShot } from '../lib/templateShot';
import { useClientWidth } from '../lib/useClientWidth';
import { colors, waLink } from '../theme';

// The catalog as a showroom: big screenshot cards (like a website builder's "All sites" view) with
// a toolbar to pick a category, sort, filter, search and switch between a roomy and a dense grid.
// Shows ready-made systems and design templates (online stores, websites, apps) side by side.
//   card     -> details (product page, or the template's live preview)
//   "+"      -> straight to buying (checkout for fixed-price systems, the product with the design chosen for templates)

type Item = {
  key: string;
  kind: 'system' | 'template';
  title: string;
  sub: string;
  image?: string;
  icon?: string;
  category: string;
  price: number | null;
  demo?: string;
  platforms: string[];
  open: () => void;
  add: () => void;
  haystack: string;
};
type Sort = 'featured' | 'price' | 'name';

export function Showroom({ products, initialQuery = '' }: { products: Product[]; initialQuery?: string }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const width = useClientWidth();
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<Sort>('featured');
  const [query, setQuery] = useState(initialQuery);
  const [menu, setMenu] = useState<'cat' | 'sort' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [demoOnly, setDemoOnly] = useState(false);
  const [platform, setPlatform] = useState<string | null>(null);
  const [dense, setDense] = useState<boolean | null>(null);
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
    const sys: Item[] = products.map((p) => {
      const yearly = p.pricing?.billing?.length === 1 && p.pricing.billing[0] === 'yearly';
      return {
        key: p.slug,
        kind: 'system',
        title: t(p.name),
        sub: t((categories.find((c) => c.id === p.category) ?? { name: ui.all }).name),
        image: p.image,
        icon: p.icon,
        category: p.category,
        price: p.priceFrom == null ? null : yearly ? p.priceFrom * 10 : p.priceFrom,
        demo: p.demoUrl,
        platforms: p.platforms,
        open: () => router.push(`/product/${p.slug}` as any),
        add: () => router.push((p.pricing ? `/checkout?product=${p.slug}` : `/quote?product=${p.slug}`) as any),
        haystack: [p.name.es, p.name.en, p.name.pt ?? '', p.short.es, p.short.en, ...p.platforms].join(' ').toLowerCase(),
      };
    });
    const tpl: Item[] = storeTemplates.map((x) => {
      const prod = products.find((p) => p.slug === x.product);
      return {
        key: 'tpl-' + x.slug,
        kind: 'template',
        title: x.name,
        sub: `${tx('Template', 'Plantilla', 'Modelo')} · ${tplText(x.tagline)}`,
        image: templateShot(x.slug, 'desktop'),
        category: 'templates',
        price: prod?.priceFrom ?? null,
        demo: templatePreview(x.slug),
        platforms: x.kind === 'app' ? ['iOS', 'Android'] : ['Web'],
        open: () => openUrl(templatePreview(x.slug)),
        add: () => router.push(`/product/${x.product}?template=${x.slug}` as any),
        haystack: [x.name, ...x.tagline, ...x.sectorName, ...x.blurb].join(' ').toLowerCase(),
      };
    });
    return [...sys, ...tpl];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, lang]);

  const catOptions = useMemo(() => {
    const opts = [{ id: 'all', label: tx('All', 'Todo', 'Tudo'), icon: 'apps-outline', n: items.length }];
    opts.push({ id: 'templates', label: tx('Design templates', 'Plantillas de diseño', 'Modelos de design'), icon: 'color-palette-outline', n: items.filter((i) => i.kind === 'template').length });
    for (const c of categories) {
      const n = items.filter((i) => i.category === c.id).length;
      if (n) opts.push({ id: c.id, label: t(c.name), icon: c.icon + '-outline', n });
    }
    return opts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lang]);
  const sortOptions: { id: Sort; label: string }[] = [
    { id: 'featured', label: tx('Featured', 'Destacados', 'Destaques') },
    { id: 'price', label: tx('Price: low to high', 'Precio: menor a mayor', 'Preço: menor para maior') },
    { id: 'name', label: tx('Name: A to Z', 'Nombre: A a Z', 'Nome: A a Z') },
  ];
  const platforms = ['Web', 'Android', 'iOS'];

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = items.filter(
      (i) =>
        (cat === 'all' || i.category === cat) &&
        (!demoOnly || !!i.demo) &&
        (!platform || i.platforms.some((p) => p.toLowerCase().includes(platform.toLowerCase()))) &&
        (!q || i.haystack.includes(q) || i.title.toLowerCase().includes(q)),
    );
    if (sort === 'price') out.sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
    if (sort === 'name') out.sort((a, b) => a.title.localeCompare(b.title));
    return out;
  }, [items, cat, demoOnly, platform, query, sort]);

  const isDense = dense ?? width >= 640;
  const cols = isDense ? (width >= 1100 ? 4 : width >= 760 ? 3 : 2) : width >= 1100 ? 3 : width >= 640 ? 2 : 1;
  const current = catOptions.find((o) => o.id === cat) ?? catOptions[0];
  const activeFilters = (demoOnly ? 1 : 0) + (platform ? 1 : 0);
  const priceText = (i: Item) =>
    i.price == null ? t(ui.priceOnRequest) : `${t(ui.from)} $${Number.isInteger(i.price) ? i.price : i.price.toFixed(2)}${i.category === 'domains' ? t(ui.perYear) : t(ui.perMonth)}`;

  const searchBox = (
    <View style={[styles.search, width < 760 && { width: '100%' }]}>
      <Ionicons name="search" size={17} color={colors.primary} />
      <TextInput value={query} onChangeText={setQuery} placeholder={tx('Search', 'Buscar', 'Buscar')} placeholderTextColor="#94A3B8" style={styles.searchInput} accessibilityLabel={tx('Search', 'Buscar', 'Buscar')} />
      {query ? (
        <Pressable onPress={() => setQuery('')} accessibilityLabel={tx('Clear', 'Borrar', 'Limpar')}>
          <Ionicons name="close-circle" size={17} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View style={{ gap: 14 }}>
      {/* Toolbar */}
      <View style={[styles.toolbar, { zIndex: 30 }]}>
        <View style={{ zIndex: 31 }}>
          <Pressable style={[styles.select, menu === 'cat' && styles.selectOn]} onPress={() => setMenu(menu === 'cat' ? null : 'cat')} accessibilityRole="button" accessibilityState={{ expanded: menu === 'cat' }}>
            <Text style={styles.selectText} numberOfLines={1}>
              {current.label}
            </Text>
            <Text style={styles.selectCount}>({current.n})</Text>
            <Ionicons name={menu === 'cat' ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
          </Pressable>
          {menu === 'cat' ? (
            <View style={styles.menu}>
              {catOptions.map((o) => (
                <Pressable key={o.id} style={[styles.menuItem, cat === o.id && styles.menuItemOn]} onPress={() => { setCat(o.id); setMenu(null); }} accessibilityRole="menuitem">
                  <Ionicons name={o.icon as any} size={17} color={cat === o.id ? colors.primary : colors.muted} />
                  <Text style={[styles.menuText, cat === o.id && { color: colors.primary }]}>{o.label}</Text>
                  <Text style={styles.menuCount}>{o.n}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={{ zIndex: 30 }}>
          <Pressable style={styles.plainBtn} onPress={() => setMenu(menu === 'sort' ? null : 'sort')} accessibilityRole="button" accessibilityState={{ expanded: menu === 'sort' }}>
            <Text style={styles.plainText}>{width >= 520 ? sortOptions.find((s) => s.id === sort)!.label : tx('Sort', 'Ordenar', 'Ordenar')}</Text>
            <Ionicons name="chevron-down" size={15} color={colors.text} />
          </Pressable>
          {menu === 'sort' ? (
            <View style={[styles.menu, { minWidth: 220 }]}>
              {sortOptions.map((o) => (
                <Pressable key={o.id} style={[styles.menuItem, sort === o.id && styles.menuItemOn]} onPress={() => { setSort(o.id); setMenu(null); }} accessibilityRole="menuitem">
                  <Text style={[styles.menuText, sort === o.id && { color: colors.primary }]}>{o.label}</Text>
                  {sort === o.id ? <Ionicons name="checkmark" size={16} color={colors.primary} /> : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.spacer} />

        <Pressable style={[styles.filterBtn, (showFilters || activeFilters > 0) && styles.filterOn]} onPress={() => setShowFilters((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: showFilters }}>
          <Ionicons name="funnel-outline" size={16} color={colors.text} />
          <Text style={styles.filterText}>{tx('Filter', 'Filtrar', 'Filtrar')}</Text>
          {activeFilters ? <Text style={styles.filterBadge}>{activeFilters}</Text> : null}
        </Pressable>

        {width >= 760 ? searchBox : null}

        <View style={styles.views} accessibilityRole="radiogroup">
          <Pressable style={[styles.viewBtn, !isDense && styles.viewOn]} onPress={() => setDense(false)} accessibilityRole="radio" accessibilityState={{ checked: !isDense }} accessibilityLabel={tx('Large cards', 'Tarjetas grandes', 'Cartões grandes')}>
            <Ionicons name="tablet-landscape-outline" size={17} color={colors.text} />
          </Pressable>
          <Pressable style={[styles.viewBtn, isDense && styles.viewOn]} onPress={() => setDense(true)} accessibilityRole="radio" accessibilityState={{ checked: isDense }} accessibilityLabel={tx('Grid', 'Cuadrícula', 'Grade')}>
            <Ionicons name="grid-outline" size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {width < 760 ? searchBox : null}

      {showFilters ? (
        <View style={styles.filters}>
          <Pressable style={[styles.fChip, demoOnly && styles.fChipOn]} onPress={() => setDemoOnly((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: demoOnly }}>
            <Ionicons name="play-circle-outline" size={15} color={demoOnly ? '#fff' : colors.text} />
            <Text style={[styles.fChipText, demoOnly && { color: '#fff' }]}>{tx('Live demo', 'Demo en vivo', 'Demo ao vivo')}</Text>
          </Pressable>
          {platforms.map((p) => {
            const on = platform === p;
            return (
              <Pressable key={p} style={[styles.fChip, on && styles.fChipOn]} onPress={() => setPlatform(on ? null : p)} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                <Ionicons name={p === 'Web' ? 'globe-outline' : p === 'iOS' ? 'logo-apple' : 'logo-android'} size={15} color={on ? '#fff' : colors.text} />
                <Text style={[styles.fChipText, on && { color: '#fff' }]}>{p}</Text>
              </Pressable>
            );
          })}
          {activeFilters ? (
            <Pressable onPress={() => { setDemoOnly(false); setPlatform(null); }} style={styles.clear} accessibilityRole="button">
              <Text style={styles.clearText}>{tx('Clear filters', 'Quitar filtros', 'Limpar filtros')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* Cards */}
      {list.length ? (
        <View style={[styles.grid, { marginHorizontal: -8 }]}>
          {list.map((i) => (
            <View key={i.key} style={{ width: `${100 / cols}%`, padding: 8 }}>
              <SiteCard item={i} dense={isDense && cols >= 2} priceText={priceText(i)} openDemo={openUrl} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={28} color={colors.primary} />
          <Text style={styles.emptyTitle}>{tx('Nothing matches that yet', 'Aún no hay nada con eso', 'Ainda não há nada com isso')}</Text>
          <Text style={styles.emptySub}>{tx('Tell us what you need and we build it for you.', 'Cuéntanos qué necesitas y lo construimos para ti.', 'Conte o que você precisa e nós construímos.')}</Text>
          <Pressable
            style={styles.emptyBtn}
            onPress={() => Linking.openURL(waLink(tx(`Hi, I'm looking for: ${query}`, `Hola, busco: ${query}`, `Olá, procuro: ${query}`)))}
            accessibilityRole="link"
          >
            <Ionicons name="logo-whatsapp" size={17} color="#fff" />
            <Text style={styles.emptyBtnText}>{t(ui.talk)}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function SiteCard({ item, dense, priceText, openDemo }: { item: Item; dense: boolean; priceText: string; openDemo: (url: string) => void }) {
  const [hover, setHover] = useState(false);
  const isTpl = item.kind === 'template';
  return (
    <View style={[styles.card, hover && styles.cardHover]}>
      <Pressable
        onPress={item.open}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={[styles.shot, dense ? { aspectRatio: 16 / 11 } : { aspectRatio: 16 / 10 }]}
        accessibilityRole="link"
        accessibilityLabel={item.title}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={[styles.img, hover && Platform.OS === 'web' && ({ transform: [{ scale: 1.04 }] } as any)]} resizeMode="cover" />
        ) : (
          <View style={styles.iconFallback}>
            <Ionicons name={(item.icon as any) ?? 'cube'} size={40} color={colors.primary} />
          </View>
        )}
        {item.demo ? (
          <View style={[styles.tag, isTpl && styles.tagTpl]}>
            <Text style={[styles.tagText, isTpl && { color: '#fff' }]}>{isTpl ? tx('Template', 'Plantilla', 'Modelo') : tx('▶ Live demo', '▶ Demo en vivo', '▶ Demo ao vivo')}</Text>
          </View>
        ) : null}
        {hover && Platform.OS === 'web' ? (
          <View style={styles.overlay}>
            <Pressable style={styles.ovBtn} onPress={item.open} accessibilityRole="link">
              <Text style={styles.ovBtnText}>{isTpl ? tx('Live preview', 'Ver en vivo', 'Ver ao vivo') : tx('View details', 'Ver detalles', 'Ver detalhes')}</Text>
            </Pressable>
            {!isTpl && item.demo ? (
              <Pressable style={[styles.ovBtn, styles.ovGhost]} onPress={() => openDemo(item.demo!)} accessibilityRole="link">
                <Text style={[styles.ovBtnText, { color: '#fff' }]}>{tx('Try the demo', 'Probar demo', 'Testar demo')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </Pressable>
      <View style={[styles.foot, dense && { paddingVertical: 12, paddingHorizontal: 14 }]}>
        <Pressable onPress={item.open} style={{ flex: 1, minWidth: 0 }} accessibilityRole="link">
          <Text style={[styles.title, dense && { fontSize: 16 }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {isTpl ? item.sub : `${item.sub} · ${priceText}`}
          </Text>
        </Pressable>
        <Pressable
          onPress={item.add}
          style={({ pressed }) => [styles.plus, pressed && { backgroundColor: colors.softBlue }]}
          accessibilityRole="button"
          accessibilityLabel={`${isTpl ? tx('Use this design', 'Usar este diseño', 'Usar este design') : tx('Buy', 'Comprar', 'Comprar')}: ${item.title}`}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  select: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 46, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: '#9DB6F3', backgroundColor: colors.surface, minWidth: 200, maxWidth: 300 },
  selectOn: { borderColor: colors.primary },
  selectText: { fontSize: 16, fontWeight: '600', color: colors.text, flexShrink: 1 },
  selectCount: { fontSize: 16, color: colors.muted, marginLeft: 'auto' as any, marginRight: 4 },
  menu: { position: 'absolute', top: 52, left: 0, minWidth: 260, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingVertical: 6, boxShadow: '0 18px 40px rgba(15,40,90,0.16)', elevation: 8 } as any,
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, minHeight: 44 },
  menuItemOn: { backgroundColor: '#F3F7FF' },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  menuCount: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  plainBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 46, paddingHorizontal: 8 },
  plainText: { fontSize: 16, fontWeight: '600', color: colors.text },
  spacer: { flex: 1, minWidth: 0 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 46, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1.5, borderColor: colors.text, backgroundColor: colors.surface },
  filterOn: { backgroundColor: '#F3F7FF' },
  filterText: { fontSize: 16, fontWeight: '600', color: colors.text },
  filterBadge: { minWidth: 20, height: 20, borderRadius: 999, backgroundColor: colors.primary, color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center', lineHeight: 20, overflow: 'hidden' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 46, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: '#9DB6F3', backgroundColor: colors.surface, width: 260 },
  searchInput: { flex: 1, minWidth: 0, fontSize: 16, color: colors.text, paddingVertical: 10, outlineStyle: 'none' } as any,
  views: { flexDirection: 'row', borderRadius: 12, borderWidth: 1.5, borderColor: '#9DB6F3', overflow: 'hidden' },
  viewBtn: { width: 44, height: 42, alignItems: 'center', justifyContent: 'center' },
  viewOn: { borderWidth: 1.5, borderColor: colors.text, borderRadius: 10, margin: -1.5 } as any,
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  fChip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  fChipOn: { backgroundColor: colors.text, borderColor: colors.text },
  fChipText: { fontSize: 14, fontWeight: '700', color: colors.text },
  clear: { paddingHorizontal: 8, minHeight: 38, justifyContent: 'center' },
  clearText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { backgroundColor: colors.surface, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(15,40,90,0.07)', elevation: 2 } as any,
  cardHover: { boxShadow: '0 16px 36px rgba(15,40,90,0.16)', transform: [{ translateY: -3 }] } as any,
  shot: { width: '100%', backgroundColor: '#EEF2F8', overflow: 'hidden', position: 'relative' },
  img: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' } as any,
  iconFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.softBlue },
  tag: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagTpl: { backgroundColor: 'rgba(11,27,58,0.85)' },
  tagText: { fontSize: 11, fontWeight: '800', color: colors.text },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,27,58,0.45)', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 },
  ovBtn: { backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 18, minHeight: 40, justifyContent: 'center', minWidth: 150, alignItems: 'center' },
  ovGhost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#fff' },
  ovBtnText: { fontSize: 14, fontWeight: '800', color: colors.text },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 16 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  plus: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  emptySub: { fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 16 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.whatsapp, borderRadius: 999, paddingHorizontal: 18, minHeight: 44, marginTop: 6 },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
