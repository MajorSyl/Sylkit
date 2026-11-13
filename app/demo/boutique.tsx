import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Btn, Card, DemoShell, demoStyles as d, Notice, Wrap } from '../../src/components/DemoShell';
import { Photo } from '../../src/components/Photo';
import { tx } from '../../src/i18n';
import { money } from '../../src/lib/demo';
import { pickPhotos } from '../../src/lib/photos';
import { useClientWidth } from '../../src/lib/useClientWidth';
import { colors } from '../../src/theme';

// Fashion boutique demo: collections, sizes with stock, a cart and checkout by WhatsApp message
// (how most of our boutique clients sell). Products and stock are synthetic.

type P = { id: number; cat: 'clothing' | 'shoes' | 'accessories'; photo: number; name: [string, string, string]; price: number; sizes: Record<string, number> };
const PRODUCTS: P[] = [
  { id: 1, cat: 'clothing', photo: 0, name: ['Linen shirt, sand', 'Camisa de lino, arena', 'Camisa de linho, areia'], price: 39, sizes: { S: 4, M: 6, L: 2, XL: 0 } },
  { id: 2, cat: 'clothing', photo: 3, name: ['Summer blouse, ivory', 'Blusa de verano, marfil', 'Blusa de verão, marfim'], price: 34, sizes: { S: 3, M: 0, L: 5 } },
  { id: 3, cat: 'shoes', photo: 0, name: ['Leather sneakers, white', 'Zapatillas de cuero, blancas', 'Tênis de couro, branco'], price: 79, sizes: { '38': 2, '39': 4, '40': 3, '41': 0, '42': 1 } },
  { id: 4, cat: 'accessories', photo: 0, name: ['Crossbody bag, grey', 'Bolso cruzado, gris', 'Bolsa transversal, cinza'], price: 58, sizes: { U: 5 } },
  { id: 5, cat: 'clothing', photo: 9, name: ['Knit cardigan, cream', 'Cárdigan tejido, crema', 'Cardigã de tricô, creme'], price: 46, sizes: { S: 2, M: 3, L: 1 } },
  { id: 6, cat: 'accessories', photo: 1, name: ['Gold-tone watch', 'Reloj dorado', 'Relógio dourado'], price: 120, sizes: { U: 2 } },
  { id: 7, cat: 'shoes', photo: 4, name: ['Canvas low-tops, olive', 'Zapatillas de lona, oliva', 'Tênis de lona, oliva'], price: 52, sizes: { '37': 3, '38': 3, '39': 0, '40': 2 } },
  { id: 8, cat: 'clothing', photo: 7, name: ['Tailored coat, camel', 'Abrigo entallado, camel', 'Casaco acinturado, camelo'], price: 98, sizes: { S: 1, M: 2, L: 0 } },
];
const L = (a: [string, string, string]) => tx(a[0], a[1], a[2]);

export default function BoutiqueDemo() {
  const width = useClientWidth() || 375;
  const wide = width >= 900;
  const [cat, setCat] = useState<'all' | P['cat']>('all');
  const [cart, setCart] = useState<{ id: number; size: string; qty: number }[]>([]);
  const [sizes, setSizes] = useState<Record<number, string>>({});
  const [showCart, setShowCart] = useState(false);
  const photos = { clothing: pickPhotos('clothing', 10), shoes: pickPhotos('shoes', 5), accessories: pickPhotos('accessories', 7) };
  const hero = pickPhotos('fashion', 1, 1)[0];
  const list = PRODUCTS.filter((p) => cat === 'all' || p.cat === cat);
  const cols = width >= 1100 ? 4 : width >= 700 ? 3 : 2;
  const cw = (Math.min(width, 1180) - 32 - (cols - 1) * 14) / cols;
  const items = cart.length;
  const total = useMemo(() => cart.reduce((s, c) => s + c.qty * PRODUCTS.find((p) => p.id === c.id)!.price, 0), [cart]);

  const add = (p: P) => {
    const size = sizes[p.id] || (Object.keys(p.sizes).length === 1 ? Object.keys(p.sizes)[0] : '');
    if (!size || !p.sizes[size]) return;
    setCart((c) => {
      const i = c.findIndex((x) => x.id === p.id && x.size === size);
      if (i >= 0) {
        const inCart = c[i].qty;
        if (inCart >= p.sizes[size]) return c; // can't add more than the stock
        return c.map((x, j) => (j === i ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...c, { id: p.id, size, qty: 1 }];
    });
  };
  const order = () => {
    const lines = cart.map((c) => {
      const p = PRODUCTS.find((x) => x.id === c.id)!;
      return `• ${c.qty} × ${L(p.name)}${c.size !== 'U' ? ` (${c.size})` : ''} — ${money(c.qty * p.price)}`;
    });
    const text = `${tx('Hi Maison Lumi! I would like to order:', '¡Hola Maison Lumi! Quiero pedir:', 'Olá Maison Lumi! Quero pedir:')}\n${lines.join('\n')}\n${tx('Total', 'Total', 'Total')}: ${money(total)}`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <DemoShell title={tx('Boutique online store', 'Tienda online para boutique', 'Loja online para boutique')} brand="Maison Lumi" product="boutique">
      <View style={{ position: 'relative' }}>
        <Photo photo={hero} width={Math.min(width, 1600)} ratio={wide ? 3.2 : 1.5} priority />
        <View style={styles.shade} pointerEvents="none" />
        <View style={styles.heroText} pointerEvents="none">
          <Text style={styles.heroKicker}>{tx('New season', 'Nueva temporada', 'Nova coleção')}</Text>
          <Text style={[styles.heroTitle, wide && { fontSize: 44 }]}>{tx('Pieces made to last', 'Prendas hechas para durar', 'Peças feitas para durar')}</Text>
        </View>
      </View>
      <Wrap style={{ paddingTop: 20, gap: 16 }}>
        <View style={[d.row, { justifyContent: 'space-between' }]}>
          <View style={d.row}>
            {(['all', 'clothing', 'shoes', 'accessories'] as const).map((k) => (
              <Pressable key={k} onPress={() => setCat(k)} style={[styles.chip, cat === k && styles.chipOn]} accessibilityRole="tab" accessibilityState={{ selected: cat === k }}>
                <Text style={[styles.chipText, cat === k && { color: '#fff' }]}>{{ all: tx('All', 'Todo', 'Tudo'), clothing: tx('Clothing', 'Ropa', 'Roupas'), shoes: tx('Shoes', 'Calzado', 'Calçados'), accessories: tx('Accessories', 'Accesorios', 'Acessórios') }[k]}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => setShowCart(!showCart)} style={styles.cartBtn} accessibilityRole="button" accessibilityLabel={tx('Cart', 'Carrito', 'Carrinho')}>
            <Ionicons name="bag-handle-outline" size={18} color="#fff" />
            <Text style={styles.cartText}>{items} · {money(total)}</Text>
          </Pressable>
        </View>

        {showCart ? (
          <Card style={{ gap: 10 }}>
            <Text style={d.h2}>{tx('Your bag', 'Tu bolsa', 'Sua sacola')}</Text>
            {!cart.length ? <Text style={d.sub}>{tx('Your bag is empty.', 'Tu bolsa está vacía.', 'Sua sacola está vazia.')}</Text> : null}
            {cart.map((c, i) => {
              const p = PRODUCTS.find((x) => x.id === c.id)!;
              return (
                <View key={i} style={[d.row, { justifyContent: 'space-between' }]}>
                  <Text style={styles.line}>{c.qty} × {L(p.name)}{c.size !== 'U' ? ` · ${c.size}` : ''}</Text>
                  <View style={d.row}>
                    <Text style={styles.line}>{money(c.qty * p.price)}</Text>
                    <Pressable onPress={() => setCart(cart.filter((_, j) => j !== i))} accessibilityLabel={tx('Remove', 'Quitar', 'Remover')}><Ionicons name="close-circle-outline" size={20} color={colors.muted} /></Pressable>
                  </View>
                </View>
              );
            })}
            {cart.length ? <Btn icon="logo-whatsapp" label={tx('Order by WhatsApp', 'Pedir por WhatsApp', 'Pedir pelo WhatsApp')} onPress={order} /> : null}
            <Notice text={tx('In your store, customers can also pay by card, PayPal, Pago Móvil or Zelle, and stock updates by itself.', 'En tu tienda los clientes también pueden pagar con tarjeta, PayPal, Pago Móvil o Zelle, y el stock se actualiza solo.', 'Na sua loja, os clientes também podem pagar com cartão, PayPal ou Pix, e o estoque se atualiza sozinho.')} />
          </Card>
        ) : null}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
          {list.map((p) => {
            const sz = Object.keys(p.sizes);
            const chosen = sizes[p.id] || (sz.length === 1 ? sz[0] : '');
            const out = sz.every((s) => !p.sizes[s]);
            return (
              <View key={p.id} style={{ width: cw, gap: 8 }}>
                <Photo photo={photos[p.cat][p.photo % photos[p.cat].length]} width={cw} ratio={0.8} radius={14} />
                <Text style={styles.pName} numberOfLines={2}>{L(p.name)}</Text>
                <Text style={styles.pPrice}>{money(p.price)}</Text>
                {sz.length > 1 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {sz.map((s) => (
                      <Pressable key={s} disabled={!p.sizes[s]} onPress={() => setSizes({ ...sizes, [p.id]: s })} style={[styles.size, chosen === s && styles.sizeOn, !p.sizes[s] && styles.sizeOut]} accessibilityRole="radio" accessibilityState={{ checked: chosen === s, disabled: !p.sizes[s] }} accessibilityLabel={`${s}${!p.sizes[s] ? ' — ' + tx('sold out', 'agotado', 'esgotado') : ''}`}>
                        <Text style={[styles.sizeText, chosen === s && { color: '#fff' }, !p.sizes[s] && { textDecorationLine: 'line-through' }]}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                {chosen && p.sizes[chosen] <= 2 ? <Text style={styles.low}>{tx(`Only ${p.sizes[chosen]} left`, `Solo quedan ${p.sizes[chosen]}`, `Restam só ${p.sizes[chosen]}`)}</Text> : null}
                <Btn small kind={chosen ? 'main' : 'alt'} label={out ? tx('Sold out', 'Agotado', 'Esgotado') : chosen ? tx('Add to bag', 'Agregar', 'Adicionar') : tx('Choose a size', 'Elige talla', 'Escolha o tamanho')} onPress={() => add(p)} disabled={out || !chosen} />
              </View>
            );
          })}
        </View>
      </Wrap>
    </DemoShell>
  );
}

const styles = StyleSheet.create({
  shade: { position: 'absolute', inset: 0, backgroundColor: 'rgba(20,14,8,0.35)' } as any,
  heroText: { position: 'absolute', left: 24, right: 24, bottom: 28, gap: 6 },
  heroKicker: { color: '#fff', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  chip: { paddingHorizontal: 14, minHeight: 36, justifyContent: 'center', borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 13.5, fontWeight: '700', color: colors.text },
  cartBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.text, borderRadius: 999, paddingHorizontal: 14, minHeight: 40 },
  cartText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  line: { fontSize: 14, color: colors.text, fontWeight: '600' },
  pName: { fontSize: 14.5, fontWeight: '700', color: colors.text },
  pPrice: { fontSize: 15, fontWeight: '800', color: colors.text },
  size: { minWidth: 36, height: 32, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: '#D0D5DD', alignItems: 'center', justifyContent: 'center' },
  sizeOn: { backgroundColor: colors.text, borderColor: colors.text },
  sizeOut: { opacity: 0.4 },
  sizeText: { fontSize: 12.5, fontWeight: '700', color: colors.text },
  low: { fontSize: 12, color: '#B54708', fontWeight: '700' },
});
