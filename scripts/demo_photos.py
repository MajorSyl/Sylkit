"""Adds real photos to the live demos in public/demos/* (engine: public/_kit/kit.js):
- a banner with a photo of that kind of business on the first screen,
- product/service photos next to items whose photo really matches the name.
Photos are Unsplash (hotlinked, credited on the page), picked by eye; see scripts/template_photos.py.
Run: python3 scripts/demo_photos.py  (idempotent: replaces the block between the markers)."""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from template_photos import photo  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent

# demo: cover pick, banner text, {item name (es or en): pick}
DEMOS = {
    'farmacia': ('pharmacy:5', ['Farmacia de confianza en tu barrio', 'Your trusted neighbourhood pharmacy'], {
        'Acetaminofén 500mg x20': 'pills:0', 'Ibuprofeno 400mg x10': 'pills:1', 'Loratadina 10mg x10': 'pills:4', 'Omeprazol 20mg x14': 'pills:5',
        'Amoxicilina 500mg x21': 'pharmacy:3', 'Losartán 50mg x30': 'pills:7', 'Metformina 850mg x30': 'pills:8', 'Atorvastatina 20mg x30': 'pills:9',
        'Salbutamol inhalador': 'pills:11', 'Suero oral': 'pills:6', 'Vitamina C 1g x10': 'pills:2', 'Jarabe para la tos': 'pills:13'}),
    'pos': ('minimarket:0', ['Ventas rápidas, inventario al día', 'Fast checkout, stock always up to date'], {
        'Agua mineral 1.5L': 'water-bottle:0', 'Refresco cola 2L': 'soft-drink:6', 'Jugo de naranja 1L': 'oj-bottle:0', 'Café molido 250g': 'coffee-bag:4',
        'Pan fresco x6': 'horno-bread:14', 'Arroz 1kg': 'rice:3', 'Pasta 1kg': 'pasta-dry:1', 'Aceite 1L': 'oil:3', 'Azúcar 1kg': 'sugar:2',
        'Leche entera 1L': 'milk:0', 'Queso blanco 500g': 'soap:2', 'Yogurt 1L': 'yogurt:4', 'Huevos x12': 'fresco-dairy:11',
        'Jabón de baño': 'soap:9', 'Detergente 1kg': 'detergent:0', 'Papel higiénico x4': 'toilet-paper:2', 'Limpiador multiuso 1L': 'cleaning:5',
        'Galletas': 'cookies:8', 'Papas fritas': 'groceries:14', 'Chocolate': 'chocolate:1'}),
    'restaurante': ('lib:restaurants:0', ['Menú QR, pedidos por mesa y cocina en tiempo real', 'QR menu, table orders and a live kitchen screen'], {
        'Hamburguesa de la casa': 'burger:13', 'Parrilla mixta': 'food:7', 'Pescado frito': 'food:9', 'Pasta carbonara': 'food:4', 'Ensalada César': 'caesar:1',
        'Torta de chocolate': 'horno-cake:1', 'Café': 'horno-coffee:5', 'Pabellón criollo': 'food:14', 'Jugo natural': 'oj-bottle:3',
        'Tequeños (8)': 'cheese-sticks:1', 'Empanadas (3)': 'empanadas:7', 'Papelón con limón': 'lemonade:5', 'Refresco': 'soft-drink:6', 'Quesillo': 'flan:3'}),
    'tienda': ('boutique:1', ['Tu tienda con stock, pedidos y envíos', 'Your store with stock, orders and shipping'], {
        'Vestido floral': 'lib:fashion:4', 'Blusa de lino': 'lib:clothing:8', 'Camisa casual': 'lib:clothing:5', 'Zapatos deportivos': 'lib:shoes:1',
        'Cartera de cuero': 'lib:accessories:0', 'Reloj': 'lib:accessories:2', 'Perfume 100ml': 'rose-perfume:1', 'Labial': 'rose-makeup:3', 'Botas': 'sandals:3',
        'Jean clásico': 'jeans:0', 'Sandalias': 'sandals:2', 'Lentes de sol': 'sunglasses:0'}),
    'salon': ('barber:2', ['Citas, comisiones y clientes fieles', 'Bookings, commissions and loyal clients'], {
        'Corte de caballero': 'barber:0', "Men's haircut": 'barber:0', 'Barba': 'barber:8', 'Beard trim': 'barber:8',
        'Corte y peinado dama': 'barber:14', "Women's cut & style": 'barber:14'}),
    'taller': ('mechanic:2', ['Órdenes de trabajo, repuestos y avisos al cliente', 'Work orders, parts and customer updates'], {}),
    'inventario': ('hardware:12', ['Stock en dos almacenes, sin sorpresas', 'Stock across two warehouses, no surprises'], {
        'Pintura blanca galón': 'hardware:3', 'Clavos 2" (kg)': 'hardware:10'}),
    'clinica': ('lib:healthcare:0', ['Citas, historias clínicas y recordatorios', 'Appointments, patient records and reminders'], {}),
    'escuela': ('lib:education:0', ['Notas, asistencia y pagos del colegio', 'Grades, attendance and school fees'], {}),
    'facturas': ('accounting:0', ['Facturas, cobros y clientes en un solo lugar', 'Invoices, payments and clients in one place'], {}),
    'nomina': ('warehouse:2', ['Asistencia, nómina y recibos de pago', 'Attendance, payroll and payslips'], {}),
    'servicios': ('home-repair:0', ['Técnicos, citas y presupuestos a domicilio', 'Technicians, visits and quotes at home'], {}),
    'asistente': ('pizza:0', ['Responde y toma pedidos por WhatsApp 24/7', 'Answers and takes orders on WhatsApp 24/7'], {}),
    'portafolio': ('lib:corporate:0', ['Tu sitio profesional, listo para compartir', 'Your professional site, ready to share'], {}),
}

START, END = '/*sylkit-photos*/', '/*/sylkit-photos*/'


def main():
    for demo, (cover, lead, items) in DEMOS.items():
        f = ROOT / 'public' / 'demos' / demo / 'index.html'
        html = f.read_text(encoding='utf-8')
        picks = [cover] + [p for p in items.values() if p != cover]
        keys = {}
        photos = {}
        for p in picks:
            if p not in keys:
                keys[p] = f'ph{len(keys)}'
                photos[keys[p]] = photo(p)[:3]
        names = {n: keys[p] for n, p in items.items()}
        block = (f"{START}\n  photos: {json.dumps(photos, ensure_ascii=False)},\n"
                 f"  cover: {{ photo: '{keys[cover]}', lead: {{ es: {json.dumps(lead[0], ensure_ascii=False)}, en: {json.dumps(lead[1], ensure_ascii=False)} }} }},\n"
                 f"  photoOf: (t) => ({json.dumps(names, ensure_ascii=False)})[t] || '',\n  {END}\n")
        if START in html:
            html = re.sub(re.escape(START) + r'.*?' + re.escape(END) + r'\n', lambda m: block, html, flags=re.S)
        else:
            html = html.replace('SylDemo.create({\n', 'SylDemo.create({\n  ' + block, 1)
        f.write_text(html, encoding='utf-8')
        print(demo, len(photos), 'photos')


if __name__ == '__main__':
    main()
