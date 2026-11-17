"""Real photos for the design templates (replaces the old emoji / drawn illustrations).

Photos come from Unsplash through sylkit.com's own search endpoint (scripts/ci/fetch_photos.py writes
.ci/photos/<query>.json on GitHub Actions) or from the curated library (src/data/photoLibrary.ts).
Every photo was picked by eye from the contact sheets: no brand logos, product matches the name.
Pages hotlink images.unsplash.com and credit each photographer in the footer.

A pick is "query:index" (e.g. "rose-makeup:3") or "lib:<category>:<index>".
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
_cache = {}


def _lib():
    if 'lib' not in _cache:
        src = (ROOT / 'src' / 'data' / 'photoLibrary.ts').read_text(encoding='utf-8')
        rows = [json.loads(m) for m in re.findall(r'^\s*(\{"id".*\}),?\s*$', src, re.M)]
        by = {}
        for r in rows:
            by.setdefault(r['cat'], []).append(r)
        _cache['lib'] = by
    return _cache['lib']


def photo(pick):
    """-> [url, author, profile, unsplash id]"""
    if pick.startswith('lib:'):
        _, cat, i = pick.split(':')
        r = _lib()[cat][int(i)]
    else:
        key, i = pick.split(':')
        if key not in _cache:
            _cache[key] = json.loads((ROOT / '.ci' / 'photos' / f'{key}.json').read_text())
        r = _cache[key][int(i)]
    return [r['raw'], r['by'], r['profile'], r['id']]


# ---------- Online stores ----------
# products: [nameEs, nameEn, category, price, extra]  (extra gets "img" automatically)
# Each entry: cats (id, es, en, pick), products (es, en, cat, price, pick, extra), hero tiles {cat: pick}
STORES = {
    'lumen': {
        'cats': [('mujer', 'Mujer', 'Women', 'lib:fashion:5'), ('hombre', 'Hombre', 'Men', 'lib:clothing:3'),
                 ('zapatos', 'Zapatos', 'Shoes', 'lib:shoes:3'), ('bolsos', 'Bolsos', 'Bags', 'aurum-jewelry:12'),
                 ('accesorios', 'Accesorios', 'Accessories', 'lib:accessories:3')],
        'products': [
            ('Top de encaje', 'Lace tank top', 'mujer', 24, 'lib:clothing:8', {'opt': 'size', 'badge': 'new'}),
            ('Blusa estampada', 'Printed blouse', 'mujer', 28, 'lib:fashion:4', {'opt': 'size'}),
            ('Abrigo de lana', 'Wool coat', 'mujer', 69, 'lib:clothing:9', {'opt': 'size', 'old': 85, 'badge': 'sale'}),
            ('Blusas de temporada', 'Seasonal tops', 'mujer', 22, 'lib:fashion:7', {'opt': 'size'}),
            ('Camisas clásicas', 'Classic shirts', 'hombre', 32, 'lib:clothing:2', {'opt': 'size'}),
            ('Chaqueta negra', 'Black jacket', 'hombre', 58, 'lib:clothing:4', {'opt': 'size', 'badge': 'hot'}),
            ('Camisa casual', 'Casual shirt', 'hombre', 26, 'lib:clothing:5', {'opt': 'size'}),
            ('Zapatillas de cuero', 'Leather sneakers', 'zapatos', 64, 'lib:shoes:0', {'opt': 'shoe'}),
            ('Zapatillas urbanas', 'Street sneakers', 'zapatos', 59, 'lib:shoes:4', {'opt': 'shoe', 'old': 72, 'badge': 'sale'}),
            ('Bolso cruzado de cuero', 'Leather crossbody bag', 'bolsos', 48, 'lib:accessories:0', {'badge': 'new'}),
            ('Reloj malla dorada', 'Gold mesh watch', 'accesorios', 54, 'lib:accessories:1', {}),
            ('Reloj negro y dorado', 'Black & gold watch', 'accesorios', 49, 'lib:accessories:6', {'stock': 0}),
        ],
        'hero': ['p0', 'p5'],
    },
    'rose': {
        'cats': [('maquillaje', 'Maquillaje', 'Makeup', 'rose-makeup:11'), ('skincare', 'Skincare', 'Skincare', 'rose-skin:3'),
                 ('perfumes', 'Perfumes', 'Fragrance', 'rose-perfume:4'), ('sets', 'Sets', 'Sets', 'rose-skin:11')],
        'products': [
            ('Labial mate', 'Matte lipstick', 'maquillaje', 9, 'rose-makeup:3', {'opt': 'shade', 'badge': 'hot'}),
            ('Labiales líquidos', 'Liquid lipsticks', 'maquillaje', 14, 'rose-makeup:2', {'opt': 'shade'}),
            ('Set de maquillaje', 'Makeup set', 'maquillaje', 39, 'rose-makeup:0', {'old': 48, 'badge': 'sale'}),
            ('Labial satinado', 'Satin lipstick', 'maquillaje', 11, 'rose-makeup:5', {}),
            ('Brochas de maquillaje', 'Makeup brushes', 'maquillaje', 18, 'rose-makeup:7', {}),
            ('Sérum vitamina C', 'Vitamin C serum', 'skincare', 21, 'rose-skin:2', {'badge': 'new'}),
            ('Sérum hidratante', 'Hydrating serum', 'skincare', 19, 'rose-skin:0', {}),
            ('Aceite facial', 'Face oil', 'skincare', 16, 'rose-skin:9', {}),
            ('Agua de rosas', 'Rose eau de parfum', 'perfumes', 35, 'rose-perfume:3', {'opt': 'ml'}),
            ('Eau de toilette', 'Eau de toilette', 'perfumes', 29, 'rose-perfume:0', {'opt': 'ml', 'old': 34, 'badge': 'sale'}),
            ('Perfume rojo intenso', 'Red intense perfume', 'perfumes', 38, 'rose-perfume:2', {'opt': 'ml'}),
            ('Rutina en 4 pasos', '4-step routine set', 'sets', 49, 'rose-skin:10', {'stock': 0}),
        ],
        'hero': ['p0', 'p5', 'p8'],
    },
    'volt': {
        'cats': [('celulares', 'Celulares', 'Phones', 'volt-phone:3'), ('audio', 'Audio', 'Audio', 'volt-audio:5'),
                 ('relojes', 'Relojes', 'Watches', 'volt-gadgets:10'), ('laptops', 'Laptops', 'Laptops', 'volt-gadgets:2')],
        'products': [
            ('Celular Nova 5G', 'Nova 5G phone', 'celulares', 349, 'volt-phone:0', {'badge': 'new'}),
            ('Celular Lite', 'Lite phone', 'celulares', 189, 'volt-phone:10', {}),
            ('Celular Pro Max', 'Pro Max phone', 'celulares', 529, 'volt-phone:2', {'badge': 'hot'}),
            ('Celular Mini', 'Mini phone', 'celulares', 159, 'volt-phone:5', {'old': 189, 'badge': 'sale'}),
            ('Audífonos Studio', 'Studio headphones', 'audio', 129, 'volt-audio:0', {}),
            ('Audífonos inalámbricos', 'Wireless headphones', 'audio', 79, 'volt-audio:6', {}),
            ('Audífonos con cable', 'Wired headphones', 'audio', 35, 'volt-audio:2', {}),
            ('Audífonos Bass', 'Bass headphones', 'audio', 59, 'volt-audio:8', {'old': 69, 'badge': 'sale'}),
            ('Smartwatch Fit', 'Fit smartwatch', 'relojes', 99, 'volt-gadgets:14', {}),
            ('Reloj clásico negro', 'Classic black watch', 'relojes', 69, 'volt-gadgets:5', {}),
            ('Reloj de cuero', 'Leather strap watch', 'relojes', 75, 'volt-gadgets:1', {'stock': 0}),
            ('Laptop Air 14', 'Air 14 laptop', 'laptops', 699, 'volt-gadgets:4', {}),
        ],
        'hero': ['p0'], 'tiles': {'audio': 'volt-audio:12', 'relojes': 'volt-gadgets:15'},
    },
    'horno': {
        'cats': [('panes', 'Panes', 'Bread', 'horno-bread:2'), ('tortas', 'Tortas', 'Cakes', 'horno-cake:0'),
                 ('dulces', 'Dulces', 'Pastries', 'horno-bread:9'), ('bebidas', 'Bebidas', 'Drinks', 'horno-coffee:14')],
        'products': [
            ('Panes artesanales', 'Artisan loaves', 'panes', 6, 'horno-bread:1', {'badge': 'hot'}),
            ('Pan integral', 'Whole wheat bread', 'panes', 4.5, 'horno-bread:13', {}),
            ('Pancitos (6)', 'Fresh rolls (6)', 'panes', 3, 'horno-bread:14', {}),
            ('Torta de chocolate', 'Chocolate cake', 'tortas', 24, 'horno-cake:1', {}),
            ('Cheesecake de arándanos', 'Blueberry cheesecake', 'tortas', 28, 'horno-cake:5', {'badge': 'new'}),
            ('Torta de cereza', 'Cherry cake', 'tortas', 22, 'horno-cake:14', {}),
            ('Croissants y danesas', 'Croissants & danishes', 'dulces', 9, 'horno-bread:4', {}),
            ('Trío de hojaldres', 'Pastry trio', 'dulces', 7, 'horno-bread:10', {'old': 9, 'badge': 'sale'}),
            ('Brownies (2)', 'Brownies (2)', 'dulces', 5, 'horno-cake:3', {}),
            ('Café latte', 'Café latte', 'bebidas', 2.5, 'horno-coffee:1', {}),
            ('Capuchino', 'Cappuccino', 'bebidas', 2.8, 'horno-coffee:6', {}),
            ('Matcha latte', 'Matcha latte', 'bebidas', 3.5, 'horno-coffee:13', {}),
        ],
        'hero': ['p0', 'p3', 'p6'],
    },
    'fresco': {
        'cats': [('frutas', 'Frutas', 'Fruit', 'fresco-produce:14'), ('verduras', 'Verduras', 'Vegetables', 'fresco-produce:9'),
                 ('lacteos', 'Huevos y quesos', 'Eggs & cheese', 'fresco-dairy:13'), ('despensa', 'Despensa', 'Pantry', 'minimarket:13'),
                 ('bebidas', 'Bebidas', 'Drinks', 'minimarket:6')],
        'products': [
            ('Cesta de frutas y verduras', 'Fruit & veg box', 'frutas', 15, 'fresco-produce:1', {'badge': 'hot', 'unit': ['caja', 'box']}),
            ('Mangos', 'Mangoes', 'frutas', 2.5, 'fresco-produce:12', {'unit': ['kg', 'kg']}),
            ('Frutas de temporada', 'Seasonal fruit', 'frutas', 3, 'fresco-produce:7', {'unit': ['kg', 'kg']}),
            ('Verduras mixtas', 'Mixed vegetables', 'verduras', 4, 'fresco-produce:4', {'unit': ['kg', 'kg']}),
            ('Ají y ajo', 'Chili & garlic', 'verduras', 2, 'fresco-produce:5', {'unit': ['kg', 'kg']}),
            ('Cebollas', 'Onions', 'verduras', 1.6, 'fresco-produce:15', {'unit': ['kg', 'kg'], 'old': 2, 'badge': 'sale'}),
            ('Huevos (cartón de 30)', 'Eggs (tray of 30)', 'lacteos', 6.5, 'fresco-dairy:3', {}),
            ('Huevos rojos (12)', 'Brown eggs (12)', 'lacteos', 3.2, 'fresco-dairy:11', {}),
            ('Quesos del día', 'Fresh cheeses', 'lacteos', 7, 'fresco-dairy:9', {'unit': ['kg', 'kg']}),
            ('Conservas en frasco', 'Jarred preserves', 'despensa', 4.5, 'groceries:7', {}),
            ('Especias y aliños', 'Spices & seasonings', 'despensa', 3, 'minimarket:7', {'badge': 'new'}),
            ('Refrescos y jugos', 'Sodas & juices', 'bebidas', 2.2, 'groceries:8', {}),
        ],
        'hero': ['p0'], 'tiles': {'frutas': 'fresco-produce:10', 'despensa': 'groceries:13'},
    },
    'aurum': {
        'cats': [('anillos', 'Anillos', 'Rings', 'aurum-jewelry:15'), ('collares', 'Collares', 'Necklaces', 'aurum-jewelry:0'),
                 ('aretes', 'Aretes', 'Earrings', 'aurum-jewelry:11'), ('relojes', 'Relojes', 'Watches', 'aurum-watch:8'),
                 ('pulseras', 'Pulseras', 'Bracelets', 'aurum-jewelry:13')],
        'products': [
            ('Anillos dorados entrelazados', 'Interlocking gold rings', 'anillos', 180, 'aurum-jewelry:3', {'badge': 'new'}),
            ('Aros de matrimonio', 'Wedding bands', 'anillos', 320, 'aurum-jewelry:7', {}),
            ('Anillo con diamante', 'Diamond ring', 'anillos', 450, 'aurum-jewelry:14', {'badge': 'hot'}),
            ('Dije de gota', 'Teardrop pendant', 'collares', 140, 'aurum-jewelry:4', {}),
            ('Collar de diamantes', 'Diamond necklace', 'collares', 690, 'aurum-jewelry:9', {}),
            ('Set de cadenas', 'Gold chain set', 'collares', 210, 'aurum-jewelry:1', {'old': 250, 'badge': 'sale'}),
            ('Aretes de perla', 'Pearl earrings', 'aretes', 95, 'aurum-jewelry:8', {}),
            ('Reloj bicolor', 'Two-tone watch', 'relojes', 260, 'aurum-watch:0', {}),
            ('Reloj dorado minimalista', 'Minimal gold watch', 'relojes', 230, 'aurum-watch:3', {}),
            ('Reloj con brillantes', 'Diamond watch', 'relojes', 890, 'aurum-watch:13', {'stock': 0}),
            ('Brazalete serpiente', 'Snake bracelet', 'pulseras', 160, 'aurum-jewelry:10', {}),
            ('Pulsera de perlas', 'Beaded bracelet', 'pulseras', 85, 'aurum-jewelry:2', {}),
        ],
        'hero': ['p1', 'p4', 'p8'],
    },
    'nido': {
        'cats': [('sala', 'Sala', 'Living room', 'nido-furniture:1'), ('deco', 'Decoración', 'Decor', 'nido-decor:5'),
                 ('luz', 'Iluminación', 'Lighting', 'nido-lamp:10')],
        'products': [
            ('Sofá capitoné', 'Tufted sofa', 'sala', 590, 'nido-furniture:0', {'badge': 'hot'}),
            ('Butaca de madera', 'Wooden armchair', 'sala', 240, 'nido-furniture:7', {}),
            ('Butaca azul', 'Blue armchair', 'sala', 280, 'nido-furniture:13', {'badge': 'new'}),
            ('Silla tapizada', 'Upholstered chair', 'sala', 160, 'nido-furniture:9', {'old': 190, 'badge': 'sale'}),
            ('Jarrón de cerámica blanca', 'White ceramic vase', 'deco', 32, 'nido-decor:0', {}),
            ('Jarrón azul pintado', 'Hand-painted blue vase', 'deco', 38, 'nido-decor:2', {}),
            ('Matero geométrico', 'Geometric planter', 'deco', 22, 'nido-decor:8', {}),
            ('Jarrón negro', 'Black vase', 'deco', 29, 'nido-decor:14', {}),
            ('Lámpara de mesa de madera', 'Wooden table lamp', 'luz', 75, 'nido-lamp:4', {}),
            ('Lámpara de pie', 'Floor lamp', 'luz', 120, 'nido-lamp:5', {}),
            ('Lámpara de bambú', 'Woven bamboo pendant', 'luz', 89, 'nido-lamp:11', {'stock': 0}),
        ],
        'hero': ['p0', 'p8'],
    },
    'patitas': {
        'cats': [('perros', 'Perros', 'Dogs', 'patitas-dog:2'), ('gatos', 'Gatos', 'Cats', 'patitas-cat:1'),
                 ('juguetes', 'Juguetes', 'Toys', 'patitas-supplies:10'), ('accesorios', 'Accesorios', 'Accessories', 'patitas-dog:13')],
        'products': [
            ('Peluche para perro', 'Plush dog toy', 'juguetes', 8, 'patitas-supplies:15', {'badge': 'hot'}),
            ('Aro mordedor', 'Chew ring', 'juguetes', 5, 'patitas-supplies:14', {}),
            ('Juguete de goma', 'Rubber toy', 'juguetes', 6, 'patitas-supplies:13', {}),
            ('Pelotas para gato', 'Cat play balls', 'gatos', 4, 'patitas-supplies:9', {'badge': 'new'}),
            ('Comedero de cerámica', 'Ceramic food bowl', 'gatos', 9, 'patitas-supplies:5', {}),
            ('Mini sofá para gato', 'Mini pet sofa', 'gatos', 39, 'patitas-supplies:2', {'old': 45, 'badge': 'sale'}),
            ('Collar ajustable', 'Adjustable collar', 'perros', 12, 'patitas-dog:4', {}),
            ('Bandana para perro', 'Dog bandana', 'accesorios', 7, 'patitas-dog:6', {}),
            ('Bolso transportador', 'Pet carrier', 'accesorios', 34, 'patitas-dog:12', {}),
            ('Cama acolchada', 'Cushioned bed', 'perros', 29, 'patitas-dog:11', {'stock': 0}),
        ],
        'hero': ['p0', 'p3', 'p6'],
    },
}


def apply_store(t):
    """Swap a store template's emoji art for real photos (categories, products, hero, promo tiles)."""
    spec = STORES.get(t['slug'])
    if not spec:
        return t
    picks, photos = {}, []

    def idx(pick):
        if pick not in picks:
            picks[pick] = len(photos)
            photos.append(photo(pick)[:3])
        return picks[pick]

    t['cats'] = [{'id': c, 'n': [es, en], 'img': idx(p)} for c, es, en, p in spec['cats']]
    t['products'] = [[es, en, cat, price, {**extra, 'img': idx(p)}] for es, en, cat, price, p, extra in spec['products']]
    t['hero']['art'] = spec['hero']
    if spec.get('tiles') and t['hero'].get('tiles'):
        for tile in t['hero']['tiles']:
            if tile['cat'] in spec['tiles']:
                tile['img'] = idx(spec['tiles'][tile['cat']])
            else:
                tile['cat'] = t['cats'][0]['id']
    # Category ids changed for some stores: keep the hero's second button and descriptions valid.
    ids = {c['id'] for c in t['cats']}
    cta2 = t['hero'].get('cta2')
    if cta2 and cta2.get('cat') not in ids:
        cta2['cat'] = t['cats'][1]['id']
        cta2['t'] = [f"Ver {t['cats'][1]['n'][0].lower()}", f"See {t['cats'][1]['n'][1].lower()}"]
    if t.get('desc'):
        default = next(iter(t['desc'].values()))
        t['desc'] = {c: t['desc'].get(c, default) for c in ids}
    t['photos'] = photos
    return t


# ---------- Websites and apps (Habitat real estate, Plano architecture) ----------
# Each drawn scene (kind + seed) becomes a distinct real photo of the same kind.
SCENE_POOLS = {
    'tower': ['apartments:1', 'apartments:3', 'apartments:9', 'apartments:12', 'apartments:15', 'apartments:13', 'lib:architecture:7'],
    'modern': ['lib:architecture:2', 'lib:architecture:5', 'lib:architecture:3', 'apartments:0', 'lib:architecture:9', 'apartments:7',
               'lib:architecture:6', 'apartments:8', 'lib:architecture:4', 'apartments:5', 'lib:architecture:0', 'apartments:11'],
    'house': ['lib:architecture:1', 'apartments:10', 'apartments:4', 'apartments:6', 'lib:architecture:8', 'apartments:14'],
    'interior': ['lib:realestate:0', 'lib:realestate:1', 'lib:realestate:4', 'lib:realestate:9', 'apartment-interior:0', 'lib:realestate:3',
                 'apartment-interior:7', 'lib:realestate:5', 'apartment-interior:10', 'lib:realestate:8'],
}


def scene_photos(templates):
    """One shared photo set for the website + app templates: {'k:s': index} and the photo list."""
    import re as _re
    seen, scenes = set(), []
    blob = json.dumps(templates, ensure_ascii=False)
    for k, s in _re.findall(r'"k": "([a-z]+)", "s": (\d+)', blob) + _re.findall(r'\["([a-z]+)", (\d+)\]', blob):
        if k in SCENE_POOLS and (k, s) not in seen:
            seen.add((k, s))
            scenes.append((k, s))
    used = {k: 0 for k in SCENE_POOLS}
    photos, index, scene = [], {}, {}
    for k, s in scenes:
        pool = SCENE_POOLS[k]
        pick = pool[used[k] % len(pool)]
        used[k] += 1
        if pick not in index:
            index[pick] = len(photos)
            photos.append(photo(pick)[:3])
        scene[f'{k}:{s}'] = index[pick]
    return photos, scene
