"""Builds the photo-led live demos of popular systems (engine: public/_pro/pro.js) into
public/demos/<id>/index.html, served at sylkit.com/demos/<id>/.

Each demo = a customer site (real photos, search, booking or ordering) + the staff dashboard that
receives it. Photos: Unsplash via scripts/template_photos.py (picked by eye, credited on the page).
Run: python3 scripts/build_pro_demos.py
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from template_photos import photo  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent

PAGE = """<!doctype html>
<html lang="en" translate="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="google" content="notranslate"><title>{title} · Demo · Sylkit</title><meta name="description" content="{desc}">
<link rel="preconnect" href="https://images.unsplash.com"><link rel="stylesheet" href="/_pro/pro.css"></head><body>
<script src="/_pro/pro.js"></script>
<script>
SylPro.create(Object.assign({{ photos: {photos} }}, {cfg}));
</script>
</body></html>
"""

# Shared JS helpers inside the configs: app.day(n), app.money(n), app.L(x), app.db.records, app.item(id)
DEMOS = {}

# ---------------------------------------------------------------- Gym & fitness
DEMOS['gym'] = dict(
    title='IronCore Gym', desc='Live demo of the Sylkit gym system: memberships, class bookings, check-ins and renewals.',
    photos={'hero': 'gym:2', 'monthly': 'gym:11', 'quarter': 'gym:3', 'annual': 'gym:12', 'hiit': 'fitness-class:3', 'yoga': 'fitness-class:1',
            'strength': 'fitness-class:2', 'spin': 'gym:5', 'cross': 'fitness-class:5', 'dance': 'fitness-class:7', 'pt': 'fitness-class:14', 'tread': 'gym:4'},
    cfg="""{
  id: 'gym', version: 1, ref: 'gym',
  theme: { primary: '#e8432e', primaryD: '#c4321f', soft: '#fdecea', fonts: 'family=Inter:wght@400;600;700;800;900' },
  brand: { name: 'IronCore Gym', mark: 'IC' },
  hero: { photo: 'hero', eyebrow: { en: 'Train · Recover · Repeat', es: 'Entrena · Recupera · Repite' },
    title: { en: 'Your strongest year starts here', es: 'Tu mejor año empieza aquí' },
    lead: { en: 'Memberships, classes and personal training. Book your spot from your phone in seconds.', es: 'Membresías, clases y entrenamiento personal. Reserva tu cupo desde el teléfono en segundos.' },
    search: [{ name: 'type', label: { en: 'I want', es: 'Quiero' }, type: 'select', options: [['all', { en: 'Everything', es: 'Todo' }], ['plan', { en: 'A membership', es: 'Una membresía' }], ['class', { en: 'A class', es: 'Una clase' }]] },
      { name: 'date', label: { en: 'Day', es: 'Día' }, type: 'date', value: (a) => a.day(1) }],
    cta: { en: 'See options', es: 'Ver opciones' }, onSearch: (v, a) => { a.db.cat = v.type; } },
  catalog: { title: { en: 'Memberships & classes', es: 'Membresías y clases' }, lead: { en: 'Tap any card to join or book. It appears instantly on the front desk dashboard.', es: 'Toca una tarjeta para inscribirte o reservar. Aparece al instante en el panel de recepción.' },
    filters: [['plan', { en: 'Memberships', es: 'Membresías' }], ['class', { en: 'Classes', es: 'Clases' }]],
    items: [
      { id: 'm1', cat: 'plan', photo: 'monthly', title: { en: 'Monthly membership', es: 'Membresía mensual' }, meta: { en: 'Full gym access · 6 am to 11 pm', es: 'Acceso completo · 6 am a 11 pm' }, price: 35, unit: { en: '/month', es: '/mes' }, tag: { en: 'Most popular', es: 'Más popular' } },
      { id: 'm2', cat: 'plan', photo: 'quarter', title: { en: 'Quarterly membership', es: 'Membresía trimestral' }, meta: { en: '3 months + 2 classes a week', es: '3 meses + 2 clases por semana' }, price: 95, unit: { en: '/3 months', es: '/3 meses' } },
      { id: 'm3', cat: 'plan', photo: 'annual', title: { en: 'Annual membership', es: 'Membresía anual' }, meta: { en: 'Unlimited classes + body assessment', es: 'Clases ilimitadas + evaluación física' }, price: 330, unit: { en: '/year', es: '/año' }, tag: { en: 'Save 21%', es: 'Ahorra 21%' } },
      { id: 'c1', cat: 'class', photo: 'hiit', title: { en: 'HIIT Burn', es: 'HIIT Burn' }, meta: { en: 'Mon · Wed · Fri · 7:00 am · 45 min', es: 'Lun · Mié · Vie · 7:00 am · 45 min' }, price: 8, unit: { en: '/class', es: '/clase' } },
      { id: 'c2', cat: 'class', photo: 'yoga', title: { en: 'Yoga Flow', es: 'Yoga Flow' }, meta: { en: 'Tue · Thu · 6:30 pm · 60 min', es: 'Mar · Jue · 6:30 pm · 60 min' }, price: 7, unit: { en: '/class', es: '/clase' } },
      { id: 'c3', cat: 'class', photo: 'strength', title: { en: 'Strength Lab', es: 'Strength Lab' }, meta: { en: 'Daily · 6:00 pm · coach-led', es: 'Diario · 6:00 pm · con coach' }, price: 9, unit: { en: '/class', es: '/clase' }, tag: { en: '3 spots left', es: 'Quedan 3 cupos' } },
      { id: 'c4', cat: 'class', photo: 'spin', title: { en: 'Spinning', es: 'Spinning' }, meta: { en: 'Mon to Sat · 7:30 pm · 45 min', es: 'Lun a sáb · 7:30 pm · 45 min' }, price: 7, unit: { en: '/class', es: '/clase' } },
      { id: 'c5', cat: 'class', photo: 'cross', title: { en: 'Functional Cross', es: 'Funcional Cross' }, meta: { en: 'Tue · Thu · Sat · 8:00 am', es: 'Mar · Jue · Sáb · 8:00 am' }, price: 9, unit: { en: '/class', es: '/clase' } },
      { id: 'c6', cat: 'class', photo: 'dance', title: { en: 'Dance Cardio', es: 'Baile Cardio' }, meta: { en: 'Wed · Fri · 7:00 pm', es: 'Mié · Vie · 7:00 pm' }, price: 6, unit: { en: '/class', es: '/clase' } },
      { id: 'c7', cat: 'class', photo: 'pt', title: { en: 'Personal training', es: 'Entrenamiento personal' }, meta: { en: '1:1 with a certified coach · 60 min', es: '1:1 con coach certificado · 60 min' }, price: 20, unit: { en: '/session', es: '/sesión' } },
    ] },
  book: { button: { en: 'Book', es: 'Reservar' }, confirm: { en: 'Confirm & pay at the gym', es: 'Confirmar y pagar en el gym' },
    fields: [{ name: 'date', label: { en: 'Start / class day', es: 'Inicio / día de la clase' }, type: 'date', value: (a) => a.day(1) },
      { name: 'pay', label: { en: 'Payment', es: 'Pago' }, type: 'select', options: ['Pago Móvil', 'Card', 'Cash', 'USDT'] }],
    total: (x) => x.price, detail: (x, v, a) => a.date(v.date) + ' · ' + v.pay },
  flow: [{ id: 'new', label: { en: 'New sign-ups', es: 'Nuevas' } }, { id: 'paid', label: { en: 'Paid', es: 'Pagadas' }, verb: { en: 'Mark paid', es: 'Marcar pagada' }, tone: 'ok' },
    { id: 'in', label: { en: 'Checked in', es: 'Asistieron' }, verb: { en: 'Check in', es: 'Registrar entrada' } }],
  dashTitle: { en: 'Front desk', es: 'Recepción' }, dashLead: { en: 'Memberships, class bookings and check-ins, updated live.', es: 'Membresías, reservas de clases y entradas, al momento.' },
  stats: (a) => { const r = a.db.records; return [[{ en: 'Active members', es: 'Socios activos' }, String(312 + r.filter((x) => x.item[0] === 'm').length), { en: '+18 this month', es: '+18 este mes' }],
    [{ en: 'Check-ins today', es: 'Entradas hoy' }, String(146 + r.filter((x) => x.status === 'in').length)],
    [{ en: 'Revenue this month', es: 'Ingresos del mes' }, a.money(11840 + r.filter((x) => x.status !== 'new').reduce((s, x) => s + x.total, 0))],
    [{ en: 'Renewals due (7 days)', es: 'Renovaciones (7 días)' }, '23']]; },
  side: { title: { en: 'Today’s classes', es: 'Clases de hoy' }, rows: (a) => [
    { img: 'hiit', title: 'HIIT Burn · 7:00 am', sub: { en: 'Coach Daniela · Room A', es: 'Coach Daniela · Sala A' }, bar: 0.9, right: '18/20' },
    { img: 'strength', title: 'Strength Lab · 6:00 pm', sub: { en: 'Coach Luis · Free weights', es: 'Coach Luis · Peso libre' }, bar: 0.85, right: '17/20', tone: 'warn' },
    { img: 'yoga', title: 'Yoga Flow · 6:30 pm', sub: { en: 'Coach Ana · Studio', es: 'Coach Ana · Estudio' }, bar: 0.55, right: '11/20' },
    { img: 'spin', title: 'Spinning · 7:30 pm', sub: { en: 'Coach Pedro · Bike room', es: 'Coach Pedro · Sala de bicis' }, bar: 0.7, right: '14/20' }] },
  perks: [['key', { en: 'QR access', es: 'Acceso con QR' }, { en: 'Members check in with their phone.', es: 'Los socios entran con su teléfono.' }],
    ['bolt', { en: 'Auto renewals', es: 'Renovación automática' }, { en: 'Reminders by WhatsApp before expiry.', es: 'Recordatorios por WhatsApp antes de vencer.' }],
    ['users', { en: 'Class limits', es: 'Cupos por clase' }, { en: 'No overbooking, waitlist included.', es: 'Sin sobrecupo, con lista de espera.' }]],
  seed: (a) => [['Carlos Mendoza', 'm1', 'paid', 30], ['María Fernanda R.', 'c1', 'new', 8], ['José Pérez', 'm3', 'in', 120], ['Valeria Gómez', 'c2', 'paid', 45], ['Andrés Silva', 'c7', 'new', 15], ['Luisa Marín', 'm2', 'in', 200], ['Kevin Rojas', 'c3', 'paid', 60]]
    .map(([name, item, status, min]) => { const x = a.item(item); return { id: a.uid(), item, name, phone: '+58 414 000 0000', detail: a.date(a.day(0)) + ' · Pago Móvil', total: x.price, status, at: new Date(Date.now() - min * 6e4).toISOString() }; }),
}""")

# ---------------------------------------------------------------- Car rental
DEMOS['car-rental'] = dict(
    title='Ruta Rent a Car', desc='Live demo of the Sylkit car rental system: fleet, live availability, bookings, pick-ups and returns.',
    photos={'hero': 'cars:2', 'c1': 'cars:2', 'c2': 'cars:1', 'c3': 'cars:3', 'c4': 'cars:7', 'c5': 'cars:9', 'c6': 'cars:12', 'c7': 'cars:14'},
    cfg="""{
  id: 'car-rental', version: 1, ref: 'car-rental',
  theme: { primary: '#0f766e', primaryD: '#0b5d57', soft: '#e6f4f1', fonts: 'family=Inter:wght@400;600;700;800;900' },
  brand: { name: 'Ruta Rent a Car', mark: 'R' },
  hero: { photo: 'hero', eyebrow: { en: 'Airport · City · Beach', es: 'Aeropuerto · Ciudad · Playa' },
    title: { en: 'Rent the right car in two minutes', es: 'Alquila el carro ideal en dos minutos' },
    lead: { en: 'Live availability, clear prices with insurance included, and pick-up at the airport or your hotel.', es: 'Disponibilidad en vivo, precios claros con seguro incluido y entrega en el aeropuerto o tu hotel.' },
    search: [{ name: 'place', label: { en: 'Pick-up', es: 'Entrega' }, type: 'select', options: [['all', { en: 'Maiquetía Airport', es: 'Aeropuerto de Maiquetía' }], ['city', { en: 'Caracas city', es: 'Caracas ciudad' }]] },
      { name: 'from', label: { en: 'From', es: 'Desde' }, type: 'date', value: (a) => a.day(2) }, { name: 'to', label: { en: 'To', es: 'Hasta' }, type: 'date', value: (a) => a.day(5) }],
    cta: { en: 'Search cars', es: 'Buscar carros' } },
  catalog: { title: { en: 'Available cars', es: 'Carros disponibles' }, lead: { en: 'Unlimited km, basic insurance and 24/7 roadside assistance included.', es: 'Kilometraje libre, seguro básico y asistencia 24/7 incluidos.' },
    filters: [['suv', 'SUV'], ['car', { en: 'Cars', es: 'Autos' }]],
    items: [
      { id: 'v1', cat: 'suv', photo: 'c1', title: { en: 'Compact SUV', es: 'SUV compacta' }, meta: { en: '5 seats · Automatic · A/C · 2 bags', es: '5 puestos · Automática · A/A · 2 maletas' }, price: 55, unit: { en: '/day', es: '/día' }, tag: { en: 'Best value', es: 'Mejor precio' } },
      { id: 'v2', cat: 'suv', photo: 'c2', title: { en: 'Family SUV', es: 'SUV familiar' }, meta: { en: '7 seats · Automatic · 4 bags', es: '7 puestos · Automática · 4 maletas' }, price: 78, unit: { en: '/day', es: '/día' } },
      { id: 'v3', cat: 'car', photo: 'c3', title: { en: 'City hatchback', es: 'Hatchback urbano' }, meta: { en: '5 seats · Manual · Low fuel use', es: '5 puestos · Sincrónico · Bajo consumo' }, price: 38, unit: { en: '/day', es: '/día' } },
      { id: 'v4', cat: 'car', photo: 'c4', title: { en: 'Executive sedan', es: 'Sedán ejecutivo' }, meta: { en: '5 seats · Automatic · Leather', es: '5 puestos · Automático · Cuero' }, price: 85, unit: { en: '/day', es: '/día' } },
      { id: 'v5', cat: 'suv', photo: 'c5', title: { en: 'Urban SUV', es: 'SUV urbana' }, meta: { en: '5 seats · Automatic · CarPlay', es: '5 puestos · Automática · CarPlay' }, price: 64, unit: { en: '/day', es: '/día' }, tag: { en: '2 left', es: 'Quedan 2' } },
      { id: 'v6', cat: 'suv', photo: 'c6', title: { en: 'Premium SUV', es: 'SUV premium' }, meta: { en: '5 seats · AWD · Panoramic roof', es: '5 puestos · 4x4 · Techo panorámico' }, price: 110, unit: { en: '/day', es: '/día' } },
      { id: 'v7', cat: 'car', photo: 'c7', title: { en: 'Luxury sedan', es: 'Sedán de lujo' }, meta: { en: 'Chauffeur optional · Airport transfers', es: 'Chofer opcional · Traslados al aeropuerto' }, price: 140, unit: { en: '/day', es: '/día' } },
    ] },
  book: { button: { en: 'Reserve', es: 'Reservar' }, confirm: { en: 'Reserve with $50 deposit', es: 'Reservar con $50 de depósito' },
    fields: [{ name: 'from', label: { en: 'Pick-up', es: 'Retiro' }, type: 'date', value: (a) => a.day(2) }, { name: 'to', label: { en: 'Return', es: 'Devolución' }, type: 'date', value: (a) => a.day(5) },
      { name: 'extra', label: { en: 'Extras', es: 'Extras' }, type: 'select', options: [['0', { en: 'None', es: 'Ninguno' }], ['8', { en: 'Child seat (+$8/day)', es: 'Silla de niño (+$8/día)' }], ['15', { en: 'Full insurance (+$15/day)', es: 'Seguro total (+$15/día)' }]] }],
    total: (x, v) => { const d = Math.max(1, Math.round((new Date(v.to) - new Date(v.from)) / 864e5) || 1); return d * (x.price + Number(v.extra || 0)); },
    detail: (x, v, a) => `${a.date(v.from)} → ${a.date(v.to)}` },
  flow: [{ id: 'res', label: { en: 'Reserved', es: 'Reservados' } }, { id: 'out', label: { en: 'On the road', es: 'En la calle' }, verb: { en: 'Hand over', es: 'Entregar' }, tone: 'info' },
    { id: 'back', label: { en: 'Returned', es: 'Devueltos' }, verb: { en: 'Check in', es: 'Recibir' } }],
  dashTitle: { en: 'Fleet & rentals', es: 'Flota y alquileres' }, dashLead: { en: 'Every booking blocks the car for those dates, so there are no double rentals.', es: 'Cada reserva bloquea el carro en esas fechas: nunca hay alquileres dobles.' },
  stats: (a) => { const r = a.db.records; return [[{ en: 'Cars on the road', es: 'Carros en la calle' }, `${r.filter((x) => x.status === 'out').length + 9}/24`],
    [{ en: 'Pick-ups today', es: 'Entregas hoy' }, String(r.filter((x) => x.status === 'res').length)], [{ en: 'Revenue this month', es: 'Ingresos del mes' }, a.money(18420 + r.reduce((s, x) => s + x.total, 0))],
    [{ en: 'Utilization', es: 'Ocupación' }, '78%', { en: '+6% vs last month', es: '+6% vs mes pasado' }]]; },
  side: { title: { en: 'Fleet status', es: 'Estado de la flota' }, rows: (a) => [
    { img: 'c1', title: { en: 'Compact SUV · AB123CD', es: 'SUV compacta · AB123CD' }, sub: { en: 'Back tomorrow 10:00 · 12,400 km', es: 'Vuelve mañana 10:00 · 12.400 km' }, right: { en: 'Rented', es: 'Alquilado' }, tone: 'info' },
    { img: 'c4', title: { en: 'Executive sedan · AC774KL', es: 'Sedán ejecutivo · AC774KL' }, sub: { en: 'Ready at the airport', es: 'Listo en el aeropuerto' }, right: { en: 'Available', es: 'Disponible' }, tone: 'ok' },
    { img: 'c2', title: { en: 'Family SUV · AD209PQ', es: 'SUV familiar · AD209PQ' }, sub: { en: 'Oil change due in 300 km', es: 'Cambio de aceite en 300 km' }, right: { en: 'Service', es: 'Servicio' }, tone: 'warn' },
    { img: 'c3', title: { en: 'City hatchback · AE551MN', es: 'Hatchback urbano · AE551MN' }, sub: { en: 'Clean and fueled', es: 'Limpio y con tanque lleno' }, right: { en: 'Available', es: 'Disponible' }, tone: 'ok' }] },
  perks: [['shield', { en: 'Insurance included', es: 'Seguro incluido' }, { en: 'Basic cover on every rental.', es: 'Cobertura básica en cada alquiler.' }],
    ['pin', { en: 'Airport delivery', es: 'Entrega en aeropuerto' }, { en: 'We meet you at arrivals.', es: 'Te esperamos en llegadas.' }],
    ['card', { en: 'Pay your way', es: 'Paga como quieras' }, { en: 'Card, Pago Móvil, cash or USDT.', es: 'Tarjeta, Pago Móvil, efectivo o USDT.' }]],
  seed: (a) => [['Daniel Herrera', 'v1', 'out', 2, 5], ['Sofía Castillo', 'v4', 'res', 1, 3], ['Miguel Torres', 'v2', 'res', 0, 4], ['Laura Pineda', 'v3', 'back', -4, -1], ['Ricardo Díaz', 'v5', 'out', -1, 2]]
    .map(([name, item, status, f, t]) => { const x = a.item(item); return { id: a.uid(), item, name, phone: '+58 412 000 0000', detail: `${a.date(a.day(f))} → ${a.date(a.day(t))}`, total: x.price * Math.max(1, t - f), status, at: new Date(Date.now() - 36e5 * (3 - f)).toISOString() }; }),
}""")

# ---------------------------------------------------------------- Food ordering & delivery
DEMOS['delivery'] = dict(
    title='Brasa Express', desc='Live demo of the Sylkit food ordering and delivery system: online menu, orders, kitchen and riders.',
    photos={'hero': 'delivery-rider:5', 'b1': 'burger:13', 'b2': 'burger:12', 'p1': 'pizza:2', 'p2': 'pizza:5', 't1': 'tacos:2', 's1': 'sushi:7',
            'f1': 'fried-chicken:0', 'w1': 'bowl:0', 'x1': 'burger:14', 'd1': 'lemonade:1'},
    cfg="""{
  id: 'delivery', version: 1, ref: 'delivery',
  theme: { primary: '#f97316', primaryD: '#dd6206', soft: '#fff1e6', fonts: 'family=Inter:wght@400;600;700;800;900' },
  brand: { name: 'Brasa Express', mark: 'B' },
  hero: { photo: 'hero', eyebrow: { en: 'Delivery in 30 min · Caracas', es: 'Delivery en 30 min · Caracas' },
    title: { en: 'Hot food at your door, fast', es: 'Comida caliente en tu puerta, rápido' },
    lead: { en: 'Order online, pay your way and follow your rider live. No calls, no waiting on WhatsApp.', es: 'Pide en línea, paga como quieras y sigue a tu motorizado en vivo. Sin llamadas ni esperas por WhatsApp.' },
    search: [{ name: 'addr', label: { en: 'Deliver to', es: 'Entregar en' }, value: 'Los Palos Grandes, Caracas' }, { name: 'when', label: { en: 'When', es: 'Cuándo' }, type: 'select', options: [['all', { en: 'Now (25–35 min)', es: 'Ahora (25–35 min)' }], ['later', { en: 'Schedule', es: 'Programar' }]] }],
    cta: { en: 'See menu', es: 'Ver menú' } },
  catalog: { title: { en: 'Menu', es: 'Menú' }, lead: { en: 'Tap a dish to order. The order lands on the kitchen screen at once.', es: 'Toca un plato para pedir. El pedido llega al instante a la pantalla de cocina.' },
    filters: [['burgers', { en: 'Burgers', es: 'Hamburguesas' }], ['pizza', 'Pizza'], ['more', { en: 'Chicken, tacos & sushi', es: 'Pollo, tacos y sushi' }], ['sides', { en: 'Sides & drinks', es: 'Acompañantes y bebidas' }]],
    items: [
      { id: 'i1', cat: 'burgers', photo: 'b1', title: { en: 'Classic Brasa burger', es: 'Hamburguesa Brasa clásica' }, meta: { en: 'Grilled beef, cheddar, lettuce, tomato', es: 'Carne a la brasa, cheddar, lechuga, tomate' }, price: 8.5, tag: { en: 'Best seller', es: 'Más vendida' } },
      { id: 'i2', cat: 'burgers', photo: 'b2', title: { en: 'Double cheeseburger', es: 'Doble queso' }, meta: { en: 'Two patties, double cheese, house sauce', es: 'Doble carne, doble queso, salsa de la casa' }, price: 11 },
      { id: 'i3', cat: 'pizza', photo: 'p1', title: { en: 'Pepperoni pizza', es: 'Pizza pepperoni' }, meta: { en: 'Large · 8 slices', es: 'Familiar · 8 porciones' }, price: 14 },
      { id: 'i4', cat: 'pizza', photo: 'p2', title: { en: 'Garden pizza', es: 'Pizza vegetariana' }, meta: { en: 'Peppers, olives, basil', es: 'Pimentón, aceitunas, albahaca' }, price: 12.5 },
      { id: 'i5', cat: 'more', photo: 'f1', title: { en: 'Crispy chicken (8 pcs)', es: 'Pollo crujiente (8 pzs)' }, meta: { en: 'With two sauces', es: 'Con dos salsas' }, price: 13, tag: { en: 'New', es: 'Nuevo' } },
      { id: 'i6', cat: 'more', photo: 't1', title: { en: 'Chicken tacos (2)', es: 'Tacos de pollo (2)' }, meta: { en: 'Corn tortilla, pico de gallo, lime', es: 'Tortilla de maíz, pico de gallo, limón' }, price: 7 },
      { id: 'i7', cat: 'more', photo: 's1', title: { en: 'Sushi platter (16)', es: 'Tabla de sushi (16)' }, meta: { en: 'Salmon, tuna and California rolls', es: 'Rolls de salmón, atún y California' }, price: 18 },
      { id: 'i8', cat: 'sides', photo: 'w1', title: { en: 'Fresh bowl', es: 'Bowl fresco' }, meta: { en: 'Greens, chicken, avocado', es: 'Vegetales, pollo, aguacate' }, price: 9 },
      { id: 'i9', cat: 'sides', photo: 'x1', title: { en: 'Fries', es: 'Papas fritas' }, meta: { en: 'Large, sea salt', es: 'Grandes, sal marina' }, price: 3 },
      { id: 'i10', cat: 'sides', photo: 'd1', title: { en: 'Lemonade', es: 'Limonada' }, meta: { en: 'Fresh, 500 ml', es: 'Natural, 500 ml' }, price: 2.5 },
    ] },
  book: { button: { en: 'Add', es: 'Pedir' }, confirm: { en: 'Place order', es: 'Hacer pedido' },
    fields: [{ name: 'qty', label: { en: 'Quantity', es: 'Cantidad' }, type: 'number', min: 1, value: 1 }, { name: 'pay', label: { en: 'Payment', es: 'Pago' }, type: 'select', options: ['Pago Móvil', 'Card', 'Cash', 'USDT'] },
      { name: 'addr', label: { en: 'Address', es: 'Dirección' }, value: 'Los Palos Grandes, Av. 4' }],
    total: (x, v) => x.price * Math.max(1, Number(v.qty) || 1) + 2, detail: (x, v) => `${Math.max(1, Number(v.qty) || 1)}× · ${v.addr}` },
  flow: [{ id: 'new', label: { en: 'New', es: 'Nuevos' } }, { id: 'kitchen', label: { en: 'In the kitchen', es: 'En cocina' }, verb: { en: 'Accept', es: 'Aceptar' }, tone: 'warn' },
    { id: 'road', label: { en: 'On the way', es: 'En camino' }, verb: { en: 'Send rider', es: 'Enviar' }, tone: 'info' }, { id: 'done', label: { en: 'Delivered', es: 'Entregados' }, verb: { en: 'Delivered', es: 'Entregado' } }],
  dashTitle: { en: 'Orders & kitchen', es: 'Pedidos y cocina' }, dashLead: { en: 'Orders arrive here in real time; riders and customers get updates automatically.', es: 'Los pedidos llegan aquí en tiempo real; motorizados y clientes reciben avisos automáticos.' },
  stats: (a) => { const r = a.db.records; return [[{ en: 'Orders today', es: 'Pedidos hoy' }, String(64 + r.length)], [{ en: 'Sales today', es: 'Ventas hoy' }, a.money(912 + r.reduce((s, x) => s + x.total, 0))],
    [{ en: 'Avg. delivery time', es: 'Tiempo promedio' }, '27 min'], [{ en: 'Riders online', es: 'Motorizados activos' }, '6']]; },
  side: { title: { en: 'Top dishes this week', es: 'Lo más pedido esta semana' }, rows: (a) => [
    { img: 'b1', title: { en: 'Classic Brasa burger', es: 'Hamburguesa Brasa clásica' }, sub: { en: '214 orders', es: '214 pedidos' }, bar: 1 },
    { img: 'p1', title: { en: 'Pepperoni pizza', es: 'Pizza pepperoni' }, sub: { en: '168 orders', es: '168 pedidos' }, bar: 0.78 },
    { img: 'f1', title: { en: 'Crispy chicken', es: 'Pollo crujiente' }, sub: { en: '121 orders', es: '121 pedidos' }, bar: 0.57 },
    { img: 's1', title: { en: 'Sushi platter', es: 'Tabla de sushi' }, sub: { en: '74 orders', es: '74 pedidos' }, bar: 0.35 }] },
  perks: [['truck', { en: 'Live tracking', es: 'Seguimiento en vivo' }, { en: 'Customers see their rider on the map.', es: 'El cliente ve a su motorizado en el mapa.' }],
    ['card', { en: 'All payments', es: 'Todos los pagos' }, { en: 'Pago Móvil, card, cash or USDT.', es: 'Pago Móvil, tarjeta, efectivo o USDT.' }],
    ['clock', { en: 'Kitchen screen', es: 'Pantalla de cocina' }, { en: 'Every order timed, nothing forgotten.', es: 'Cada pedido cronometrado, nada se olvida.' }]],
  seed: (a) => [['Gabriela León', 'i1', 'kitchen', 2, 6], ['Jesús Rivas', 'i3', 'road', 1, 14], ['Paola Medina', 'i7', 'new', 1, 2], ['Oscar Blanco', 'i5', 'done', 2, 48], ['Rebeca Suárez', 'i2', 'kitchen', 1, 9], ['Hugo Salas', 'i6', 'done', 3, 70]]
    .map(([name, item, status, q, min]) => { const x = a.item(item); return { id: a.uid(), item, name, phone: '+58 424 000 0000', detail: `${q}× · Altamira`, total: x.price * q + 2, status, at: new Date(Date.now() - min * 6e4).toISOString() }; }),
}""")

# ---------------------------------------------------------------- CRM & sales
DEMOS['crm'] = dict(
    title='Vértice CRM', desc='Live demo of the Sylkit CRM: website lead capture, sales pipeline, follow-ups and won deals.',
    photos={'hero': 'lib:corporate:6', 'web': 'lib:technology:9', 'soft': 'lib:technology:6', 'it': 'lib:technology:1', 'acc': 'accounting:0',
            'cons': 'lib:corporate:3', 'mkt': 'lib:corporate:7', 'team': 'lib:corporate:0'},
    cfg="""{
  id: 'crm', version: 1, ref: 'crm',
  theme: { primary: '#4f46e5', primaryD: '#4338ca', soft: '#eef2ff', fonts: 'family=Inter:wght@400;600;700;800;900' },
  brand: { name: 'Vértice Solutions', mark: 'V' },
  hero: { photo: 'hero', eyebrow: { en: 'Technology & consulting for growing businesses', es: 'Tecnología y consultoría para empresas que crecen' },
    title: { en: 'Tell us what you need. We reply today.', es: 'Cuéntanos qué necesitas. Te respondemos hoy.' },
    lead: { en: 'Every request from this site goes straight into the sales pipeline, assigned to a person, with a follow-up date.', es: 'Cada solicitud de este sitio entra directo al embudo de ventas, asignada a una persona y con fecha de seguimiento.' },
    search: [{ name: 'svc', label: { en: 'Service', es: 'Servicio' }, type: 'select', options: [['all', { en: 'All services', es: 'Todos los servicios' }], ['tech', { en: 'Technology', es: 'Tecnología' }], ['biz', { en: 'Business', es: 'Negocio' }]] },
      { name: 'size', label: { en: 'Company size', es: 'Tamaño de empresa' }, type: 'select', options: ['1–10', '11–50', '51–200', '200+'] }],
    cta: { en: 'Get a proposal', es: 'Pedir propuesta' }, onSearch: (v, a) => { a.db.cat = v.svc; } },
  catalog: { title: { en: 'Services', es: 'Servicios' }, lead: { en: 'Request a proposal: it appears as a new lead in the CRM.', es: 'Pide una propuesta: aparece como un nuevo prospecto en el CRM.' },
    filters: [['tech', { en: 'Technology', es: 'Tecnología' }], ['biz', { en: 'Business', es: 'Negocio' }]],
    items: [
      { id: 's1', cat: 'tech', photo: 'web', title: { en: 'Website & online store', es: 'Sitio web y tienda online' }, meta: { en: 'Design, payments, hosting', es: 'Diseño, pagos, hosting' }, price: 1200, unit: { en: 'from', es: 'desde' } },
      { id: 's2', cat: 'tech', photo: 'soft', title: { en: 'Custom software', es: 'Software a medida' }, meta: { en: 'Systems built around your process', es: 'Sistemas hechos para tu proceso' }, price: 4500, unit: { en: 'from', es: 'desde' }, tag: { en: 'Most requested', es: 'Más solicitado' } },
      { id: 's3', cat: 'tech', photo: 'it', title: { en: 'IT support plan', es: 'Plan de soporte IT' }, meta: { en: 'Help desk, backups, security', es: 'Mesa de ayuda, respaldos, seguridad' }, price: 350, unit: { en: '/month', es: '/mes' } },
      { id: 's4', cat: 'biz', photo: 'acc', title: { en: 'Accounting & tax', es: 'Contabilidad e impuestos' }, meta: { en: 'Monthly books and filings', es: 'Libros mensuales y declaraciones' }, price: 280, unit: { en: '/month', es: '/mes' } },
      { id: 's5', cat: 'biz', photo: 'cons', title: { en: 'Business consulting', es: 'Consultoría de negocio' }, meta: { en: 'Pricing, processes, growth plan', es: 'Precios, procesos, plan de crecimiento' }, price: 900, unit: { en: 'from', es: 'desde' } },
      { id: 's6', cat: 'biz', photo: 'mkt', title: { en: 'Digital marketing', es: 'Marketing digital' }, meta: { en: 'Ads, content and reporting', es: 'Anuncios, contenido y reportes' }, price: 600, unit: { en: '/month', es: '/mes' } },
    ] },
  book: { button: { en: 'Request', es: 'Solicitar' }, confirm: { en: 'Send request', es: 'Enviar solicitud' },
    fields: [{ name: 'company', label: { en: 'Company', es: 'Empresa' }, value: 'Distribuidora Ávila' }, { name: 'budget', label: { en: 'Budget', es: 'Presupuesto' }, type: 'select', options: ['$1,000–5,000', '$5,000–15,000', '$15,000+'] }],
    total: (x) => x.price, detail: (x, v) => `${v.company} · ${v.budget}` },
  flow: [{ id: 'lead', label: { en: 'New leads', es: 'Prospectos' } }, { id: 'call', label: { en: 'Contacted', es: 'Contactados' }, verb: { en: 'Contacted', es: 'Contactado' } },
    { id: 'prop', label: { en: 'Proposal sent', es: 'Propuesta enviada' }, verb: { en: 'Send proposal', es: 'Enviar propuesta' }, tone: 'warn' }, { id: 'won', label: { en: 'Won', es: 'Ganados' }, verb: { en: 'Won', es: 'Ganado' } }],
  dashTitle: { en: 'Sales pipeline', es: 'Embudo de ventas' }, dashLead: { en: 'Leads from the website, WhatsApp and referrals, each with an owner and a next step.', es: 'Prospectos del sitio web, WhatsApp y referidos, cada uno con responsable y próximo paso.' },
  stats: (a) => { const r = a.db.records; const open = r.filter((x) => x.status !== 'won'); return [[{ en: 'Open pipeline', es: 'Embudo abierto' }, a.money(open.reduce((s, x) => s + x.total, 0) + 38000)],
    [{ en: 'Won this month', es: 'Ganado este mes' }, a.money(r.filter((x) => x.status === 'won').reduce((s, x) => s + x.total, 0) + 12400)],
    [{ en: 'New leads (7 days)', es: 'Nuevos (7 días)' }, String(r.filter((x) => x.status === 'lead').length + 11)], [{ en: 'Win rate', es: 'Tasa de cierre' }, '34%', { en: '+5 pts', es: '+5 pts' }]]; },
  side: { title: { en: 'Follow-ups due', es: 'Seguimientos pendientes' }, rows: (a) => [
    { img: 'soft', title: { en: 'Call Distribuidora Ávila', es: 'Llamar a Distribuidora Ávila' }, sub: { en: 'Custom software · Today 3:00 pm · Carla', es: 'Software a medida · Hoy 3:00 pm · Carla' }, right: { en: 'Today', es: 'Hoy' }, tone: 'warn' },
    { img: 'acc', title: { en: 'Send contract to Farmacia Sol', es: 'Enviar contrato a Farmacia Sol' }, sub: { en: 'Accounting · Tomorrow · José', es: 'Contabilidad · Mañana · José' }, right: { en: 'Tomorrow', es: 'Mañana' }, tone: 'info' },
    { img: 'web', title: { en: 'Demo for Hotel Litoral', es: 'Demo para Hotel Litoral' }, sub: { en: 'Website & store · Friday · Carla', es: 'Sitio web y tienda · Viernes · Carla' }, right: { en: 'Fri', es: 'Vie' } }] },
  perks: [['users', { en: 'Every lead has an owner', es: 'Cada prospecto con responsable' }, { en: 'Nothing gets lost in WhatsApp.', es: 'Nada se pierde en WhatsApp.' }],
    ['clock', { en: 'Follow-up reminders', es: 'Recordatorios' }, { en: 'Know who to call today.', es: 'Sabes a quién llamar hoy.' }],
    ['dash', { en: 'Sales reports', es: 'Reportes de ventas' }, { en: 'Pipeline, win rate and revenue.', es: 'Embudo, tasa de cierre e ingresos.' }]],
  seed: (a) => [['Hotel Litoral', 's1', 'prop', 'Carla'], ['Farmacia Sol', 's4', 'won', 'José'], ['Distribuidora Ávila', 's2', 'call', 'Carla'], ['Clínica Norte', 's3', 'lead', 'José'], ['Panadería Real', 's6', 'lead', 'Ana'], ['Grupo Andes', 's5', 'prop', 'Ana']]
    .map(([name, item, status, rep], i) => { const x = a.item(item); return { id: a.uid(), item, name, phone: '+58 212 000 0000', detail: `${rep} · ${a.date(a.day(i - 2))}`, total: x.price * (x.unit && x.unit.en === '/month' ? 12 : 1), status, at: new Date(Date.now() - (i + 1) * 864e5 / 2).toISOString() }; }),
}""")

# ---------------------------------------------------------------- Property rentals
DEMOS['rentals'] = dict(
    title='Altavista Rentals', desc='Live demo of the Sylkit property rental system: listings, applications, leases, rent collection and maintenance.',
    photos={'hero': 'apartments:1', 'u1': 'apartment-interior:0', 'u2': 'lib:realestate:1', 'u3': 'apartment-interior:5', 'u4': 'lib:realestate:9',
            'u5': 'apartment-interior:7', 'u6': 'lib:realestate:4', 'b1': 'apartments:9', 'b2': 'apartments:4', 'b3': 'apartments:10'},
    cfg="""{
  id: 'rentals', version: 1, ref: 'rentals',
  theme: { primary: '#0e7490', primaryD: '#0b5e75', soft: '#e0f2f7', fonts: 'family=Inter:wght@400;600;700;800;900' },
  brand: { name: 'Altavista Rentals', mark: 'A' },
  hero: { photo: 'hero', eyebrow: { en: 'Apartments for rent · Caracas', es: 'Apartamentos en alquiler · Caracas' },
    title: { en: 'Find your next home, apply online', es: 'Encuentra tu próximo hogar y aplica en línea' },
    lead: { en: 'Verified apartments, clear monthly rent and a lease signed without paperwork running around.', es: 'Apartamentos verificados, alquiler mensual claro y contrato firmado sin vueltas de papeles.' },
    search: [{ name: 'beds', label: { en: 'Bedrooms', es: 'Habitaciones' }, type: 'select', options: [['all', { en: 'Any', es: 'Cualquiera' }], ['1', '1'], ['2', '2'], ['3', '3+']] },
      { name: 'move', label: { en: 'Move-in', es: 'Mudanza' }, type: 'date', value: (a) => a.day(14) }],
    cta: { en: 'Search', es: 'Buscar' }, onSearch: (v, a) => { a.db.cat = v.beds; } },
  catalog: { title: { en: 'Available now', es: 'Disponibles ahora' }, lead: { en: 'Apply in one step; the owner sees your application on the dashboard.', es: 'Aplica en un paso; el propietario ve tu solicitud en el panel.' },
    filters: [['1', { en: '1 bedroom', es: '1 habitación' }], ['2', { en: '2 bedrooms', es: '2 habitaciones' }], ['3', { en: '3+ bedrooms', es: '3+ habitaciones' }]],
    items: [
      { id: 'a1', cat: '2', photo: 'u1', title: { en: 'Bright 2-bed in Altamira', es: '2 hab. luminoso en Altamira' }, meta: { en: '2 bed · 2 bath · 85 m² · Parking', es: '2 hab · 2 baños · 85 m² · Puesto' }, price: 650, unit: { en: '/month', es: '/mes' }, tag: { en: 'New', es: 'Nuevo' } },
      { id: 'a2', cat: '3', photo: 'u2', title: { en: 'Family flat in La Castellana', es: 'Apartamento familiar en La Castellana' }, meta: { en: '3 bed · 2 bath · 120 m² · Balcony', es: '3 hab · 2 baños · 120 m² · Balcón' }, price: 980, unit: { en: '/month', es: '/mes' } },
      { id: 'a3', cat: '1', photo: 'u3', title: { en: 'Studio near the metro', es: 'Estudio cerca del metro' }, meta: { en: '1 bed · 1 bath · 42 m² · Furnished', es: '1 hab · 1 baño · 42 m² · Amoblado' }, price: 380, unit: { en: '/month', es: '/mes' } },
      { id: 'a4', cat: '3', photo: 'u4', title: { en: 'Penthouse with Ávila views', es: 'Penthouse con vista al Ávila' }, meta: { en: '3 bed · 3 bath · 160 m² · Terrace', es: '3 hab · 3 baños · 160 m² · Terraza' }, price: 1650, unit: { en: '/month', es: '/mes' }, tag: { en: 'Featured', es: 'Destacado' } },
      { id: 'a5', cat: '1', photo: 'u5', title: { en: 'Cozy 1-bed in Chacao', es: '1 hab. acogedor en Chacao' }, meta: { en: '1 bed · 1 bath · 55 m² · Pet friendly', es: '1 hab · 1 baño · 55 m² · Acepta mascotas' }, price: 450, unit: { en: '/month', es: '/mes' } },
      { id: 'a6', cat: '2', photo: 'u6', title: { en: 'Modern 2-bed in Los Palos Grandes', es: '2 hab. moderno en Los Palos Grandes' }, meta: { en: '2 bed · 2 bath · 95 m² · Gym', es: '2 hab · 2 baños · 95 m² · Gimnasio' }, price: 790, unit: { en: '/month', es: '/mes' } },
    ] },
  book: { button: { en: 'Apply', es: 'Aplicar' }, confirm: { en: 'Send application', es: 'Enviar solicitud' },
    fields: [{ name: 'move', label: { en: 'Move-in date', es: 'Fecha de mudanza' }, type: 'date', value: (a) => a.day(14) }, { name: 'term', label: { en: 'Lease', es: 'Contrato' }, type: 'select', options: [['12', { en: '12 months', es: '12 meses' }], ['6', { en: '6 months', es: '6 meses' }]] }],
    total: (x) => x.price * 2, detail: (x, v, a) => `${a.date(v.move)} · ${v.term} ${a.lang === 'es' ? 'meses' : 'months'}` },
  flow: [{ id: 'app', label: { en: 'Applications', es: 'Solicitudes' } }, { id: 'ok', label: { en: 'Approved', es: 'Aprobadas' }, verb: { en: 'Approve', es: 'Aprobar' }, tone: 'info' },
    { id: 'lease', label: { en: 'Leased', es: 'Alquilados' }, verb: { en: 'Sign lease', es: 'Firmar contrato' } }],
  dashTitle: { en: 'Properties & tenants', es: 'Inmuebles e inquilinos' }, dashLead: { en: 'Applications, leases, rent due and maintenance in one place. Totals show deposit + first month.', es: 'Solicitudes, contratos, alquileres por cobrar y mantenimiento en un solo lugar. Los montos son depósito + primer mes.' },
  stats: (a) => [[{ en: 'Occupancy', es: 'Ocupación' }, '92%', { en: '46 of 50 units', es: '46 de 50 unidades' }], [{ en: 'Rent collected', es: 'Alquiler cobrado' }, a.money(31240), { en: '87% of this month', es: '87% del mes' }],
    [{ en: 'Rent overdue', es: 'Alquiler vencido' }, a.money(1980)], [{ en: 'Open maintenance', es: 'Mantenimiento abierto' }, '5']],
  side: { title: { en: 'Buildings', es: 'Edificios' }, rows: (a) => [
    { img: 'b1', title: 'Residencias Altamira', sub: { en: '18 units · 1 overdue · 2 requests', es: '18 unidades · 1 vencido · 2 solicitudes' }, bar: 0.94, right: '17/18' },
    { img: 'b2', title: 'Torre La Castellana', sub: { en: '20 units · all paid', es: '20 unidades · todo al día' }, bar: 0.95, right: '19/20', tone: 'ok' },
    { img: 'b3', title: 'Edificio Chacao Park', sub: { en: '12 units · 2 overdue · 3 requests', es: '12 unidades · 2 vencidos · 3 solicitudes' }, bar: 0.83, right: '10/12', tone: 'warn' }] },
  perks: [['key', { en: 'Verified listings', es: 'Inmuebles verificados' }, { en: 'Photos and documents checked.', es: 'Fotos y documentos revisados.' }],
    ['card', { en: 'Rent reminders', es: 'Recordatorio de pago' }, { en: 'Tenants pay by link; receipts sent.', es: 'El inquilino paga por enlace; recibos automáticos.' }],
    ['shield', { en: 'Maintenance tickets', es: 'Tickets de mantenimiento' }, { en: 'Tenants report, you track the fix.', es: 'El inquilino reporta, tú sigues el arreglo.' }]],
  seed: (a) => [['Mariana Ochoa', 'a1', 'app', 1], ['Pedro Fajardo', 'a3', 'ok', 2], ['Elena Brito', 'a2', 'lease', 6], ['Tomás Ruiz', 'a6', 'app', 0]]
    .map(([name, item, status, d]) => { const x = a.item(item); return { id: a.uid(), item, name, phone: '+58 414 000 0000', detail: `${a.date(a.day(10 + d))} · 12 ${a.lang === 'es' ? 'meses' : 'months'}`, total: x.price * 2, status, at: new Date(Date.now() - d * 864e5 - 36e5).toISOString() }; }),
}""")

# ---------------------------------------------------------------- Travel & tours
DEMOS['tours'] = dict(
    title='Caribe Tours', desc='Live demo of the Sylkit travel and tours system: tour pages, seat availability, bookings, guides and payments.',
    photos={'hero': 'travel-beach:1', 't1': 'island:11', 't2': 'waterfall:3', 't3': 'tour-colonial:6', 't4': 'hiking:3', 't5': 'travel-beach:8', 't6': 'island:12', 't7': 'waterfall:14', 't8': 'travel-city:8'},
    cfg="""{
  id: 'tours', version: 1, ref: 'tours',
  theme: { primary: '#0284c7', primaryD: '#0369a1', soft: '#e0f2fe', fonts: 'family=Inter:wght@400;600;700;800;900' },
  brand: { name: 'Caribe Tours', mark: 'C' },
  hero: { photo: 'hero', eyebrow: { en: 'Islands · Waterfalls · Old towns', es: 'Islas · Cascadas · Pueblos coloniales' },
    title: { en: 'Unforgettable trips, booked in a minute', es: 'Viajes inolvidables, reservados en un minuto' },
    lead: { en: 'Pick a date, see the seats left and pay a deposit. Your guide confirms by WhatsApp.', es: 'Elige la fecha, mira los cupos que quedan y paga un abono. Tu guía confirma por WhatsApp.' },
    search: [{ name: 'kind', label: { en: 'Trip type', es: 'Tipo de viaje' }, type: 'select', options: [['all', { en: 'All trips', es: 'Todos' }], ['sea', { en: 'Beach & islands', es: 'Playa e islas' }], ['nature', { en: 'Nature & hiking', es: 'Naturaleza' }], ['city', { en: 'Culture & cities', es: 'Cultura y ciudades' }]] },
      { name: 'date', label: { en: 'Date', es: 'Fecha' }, type: 'date', value: (a) => a.day(10) }, { name: 'people', label: { en: 'Travelers', es: 'Viajeros' }, type: 'number', value: 2, min: 1 }],
    cta: { en: 'Find tours', es: 'Buscar tours' }, onSearch: (v, a) => { a.db.cat = v.kind; } },
  catalog: { title: { en: 'Popular tours', es: 'Tours populares' }, lead: { en: 'Prices per person, guide and transport included.', es: 'Precios por persona, con guía y transporte incluidos.' },
    filters: [['sea', { en: 'Beach & islands', es: 'Playa e islas' }], ['nature', { en: 'Nature', es: 'Naturaleza' }], ['city', { en: 'Culture', es: 'Cultura' }]],
    items: [
      { id: 'r1', cat: 'sea', photo: 't1', title: { en: 'Island hopping day', es: 'Día de islas' }, meta: { en: 'Full day · boat, lunch, snorkel', es: 'Día completo · lancha, almuerzo, snorkel' }, price: 120, unit: { en: '/person', es: '/persona' }, tag: { en: '6 seats left', es: 'Quedan 6 cupos' } },
      { id: 'r2', cat: 'nature', photo: 't2', title: { en: 'Waterfall expedition', es: 'Expedición a la cascada' }, meta: { en: '3 days · flights, camp, guide', es: '3 días · vuelos, campamento, guía' }, price: 690, unit: { en: '/person', es: '/persona' }, tag: { en: 'Bestseller', es: 'Más vendido' } },
      { id: 'r3', cat: 'city', photo: 't3', title: { en: 'Colonial town walk', es: 'Recorrido colonial' }, meta: { en: 'Half day · local food tasting', es: 'Medio día · degustación local' }, price: 45, unit: { en: '/person', es: '/persona' } },
      { id: 'r4', cat: 'nature', photo: 't4', title: { en: 'Mountain trail hike', es: 'Caminata de montaña' }, meta: { en: '1 day · moderate · 12 km', es: '1 día · moderado · 12 km' }, price: 60, unit: { en: '/person', es: '/persona' } },
      { id: 'r5', cat: 'sea', photo: 't5', title: { en: 'Palm beach escape', es: 'Escapada a la playa' }, meta: { en: '2 days · hotel, transfers', es: '2 días · hotel, traslados' }, price: 260, unit: { en: '/person', es: '/persona' } },
      { id: 'r6', cat: 'sea', photo: 't6', title: { en: 'Catamaran sunset', es: 'Catamarán al atardecer' }, meta: { en: '3 h · drinks included', es: '3 h · bebidas incluidas' }, price: 75, unit: { en: '/person', es: '/persona' } },
      { id: 'r7', cat: 'nature', photo: 't7', title: { en: 'Rainforest & falls', es: 'Selva y cascadas' }, meta: { en: '1 day · swim in natural pools', es: '1 día · baño en pozos naturales' }, price: 85, unit: { en: '/person', es: '/persona' } },
      { id: 'r8', cat: 'city', photo: 't8', title: { en: 'Coast & city panorama', es: 'Panorámica de costa y ciudad' }, meta: { en: 'Half day · cable car + viewpoints', es: 'Medio día · teleférico + miradores' }, price: 55, unit: { en: '/person', es: '/persona' } },
    ] },
  book: { button: { en: 'Book', es: 'Reservar' }, confirm: { en: 'Book with 30% deposit', es: 'Reservar con 30% de abono' },
    fields: [{ name: 'date', label: { en: 'Date', es: 'Fecha' }, type: 'date', value: (a) => a.day(10) }, { name: 'people', label: { en: 'Travelers', es: 'Viajeros' }, type: 'number', min: 1, value: 2 }],
    total: (x, v) => x.price * Math.max(1, Number(v.people) || 1), detail: (x, v, a) => `${a.date(v.date)} · ${Math.max(1, Number(v.people) || 1)} pax` },
  flow: [{ id: 'new', label: { en: 'New bookings', es: 'Nuevas reservas' } }, { id: 'dep', label: { en: 'Deposit paid', es: 'Abono pagado' }, verb: { en: 'Deposit in', es: 'Abono recibido' }, tone: 'info' },
    { id: 'conf', label: { en: 'Confirmed', es: 'Confirmadas' }, verb: { en: 'Confirm', es: 'Confirmar' } }],
  dashTitle: { en: 'Bookings & departures', es: 'Reservas y salidas' }, dashLead: { en: 'Seats are counted per departure, so a tour can never be oversold.', es: 'Los cupos se cuentan por salida: un tour nunca se sobrevende.' },
  stats: (a) => { const r = a.db.records; return [[{ en: 'Travelers this month', es: 'Viajeros del mes' }, String(286 + r.length * 2)], [{ en: 'Sales this month', es: 'Ventas del mes' }, a.money(41750 + r.reduce((s, x) => s + x.total, 0))],
    [{ en: 'Departures this week', es: 'Salidas esta semana' }, '9'], [{ en: 'Deposits pending', es: 'Abonos pendientes' }, String(r.filter((x) => x.status === 'new').length)]]; },
  side: { title: { en: 'Next departures', es: 'Próximas salidas' }, rows: (a) => [
    { img: 't1', title: { en: 'Island hopping day', es: 'Día de islas' }, sub: { en: 'Saturday · Guide: Rafael', es: 'Sábado · Guía: Rafael' }, bar: 0.8, right: '24/30' },
    { img: 't2', title: { en: 'Waterfall expedition', es: 'Expedición a la cascada' }, sub: { en: 'Thursday · Guide: Marta', es: 'Jueves · Guía: Marta' }, bar: 1, right: { en: 'Full', es: 'Lleno' }, tone: 'warn' },
    { img: 't3', title: { en: 'Colonial town walk', es: 'Recorrido colonial' }, sub: { en: 'Sunday · Guide: Leo', es: 'Domingo · Guía: Leo' }, bar: 0.45, right: '9/20' }] },
  perks: [['users', { en: 'Seat control', es: 'Control de cupos' }, { en: 'Live seats per departure.', es: 'Cupos en vivo por salida.' }],
    ['card', { en: 'Deposits online', es: 'Abonos en línea' }, { en: 'Card, Pago Móvil or USDT.', es: 'Tarjeta, Pago Móvil o USDT.' }],
    ['chat', { en: 'Guide on WhatsApp', es: 'Guía por WhatsApp' }, { en: 'Reminders and meeting point sent automatically.', es: 'Recordatorios y punto de encuentro automáticos.' }]],
  seed: (a) => [['Familia Rondón', 'r1', 'dep', 4], ['Camila Pérez', 'r2', 'conf', 2], ['Jorge Linares', 'r3', 'new', 3], ['Isabel Mora', 'r6', 'new', 2], ['Grupo Uni Andes', 'r4', 'dep', 12]]
    .map(([name, item, status, p], i) => { const x = a.item(item); return { id: a.uid(), item, name, phone: '+58 416 000 0000', detail: `${a.date(a.day(5 + i * 2))} · ${p} pax`, total: x.price * p, status, at: new Date(Date.now() - (i + 1) * 5e6).toISOString() }; }),
}""")

# ---------------------------------------------------------------- Ride-hailing (Ridery / Uber style)
DEMOS['rides'] = dict(
    title='Rueda', desc='Live demo of the Sylkit ride-hailing system: rider app with live prices, driver dispatch, trips and payments.',
    photos={'hero': 'city-night:13', 'moto': 'delivery-rider:4', 'eco': 'cars:3', 'comfort': 'cars:9', 'xl': 'cars:2', 'premium': 'cars:14', 'ella': 'ride-driver:9',
            'd1': 'ride-driver:0', 'd2': 'ride-driver:5', 'd3': 'ride-driver:12', 'd4': 'ride-driver:3'},
    cfg="""{
  id: 'rides', version: 1, ref: 'rides',
  theme: { primary: '#111827', primaryD: '#000000', soft: '#f3f4f6', fonts: 'family=Inter:wght@400;600;700;800;900' },
  brand: { name: 'Rueda', mark: 'R' },
  hero: { photo: 'hero', eyebrow: { en: 'Caracas · Valencia · Maracaibo', es: 'Caracas · Valencia · Maracaibo' },
    title: { en: 'Where to? A safe ride in minutes', es: '¿A dónde vas? Un viaje seguro en minutos' },
    lead: { en: 'Fixed price before you ride, verified drivers and live trip sharing. Pay with Pago Móvil, card, cash or USDT.', es: 'Precio fijo antes de viajar, conductores verificados y viaje compartido en vivo. Paga con Pago Móvil, tarjeta, efectivo o USDT.' },
    search: [{ name: 'from', label: { en: 'Pick-up', es: 'Origen' }, value: 'Altamira, Caracas' }, { name: 'to', label: { en: 'Destination', es: 'Destino' }, value: 'CCCT, Chuao' }],
    cta: { en: 'See prices', es: 'Ver precios' } },
  catalog: { title: { en: 'Choose your ride', es: 'Elige tu viaje' }, lead: { en: 'Prices for this trip (8.4 km · about 18 min). Tap to request; the driver dashboard gets it instantly.', es: 'Precios para este viaje (8,4 km · unos 18 min). Toca para pedir; el panel de despacho lo recibe al instante.' },
    filters: [['car', { en: 'Cars', es: 'Carros' }], ['moto', 'Moto']],
    items: [
      { id: 'k1', cat: 'moto', photo: 'moto', title: 'Rueda Moto', meta: { en: '1 seat · arrives in 2 min', es: '1 puesto · llega en 2 min' }, price: 2.5, tag: { en: 'Fastest', es: 'Más rápido' } },
      { id: 'k2', cat: 'car', photo: 'eco', title: 'Rueda Economy', meta: { en: '4 seats · arrives in 4 min', es: '4 puestos · llega en 4 min' }, price: 4.8, tag: { en: 'Best price', es: 'Mejor precio' } },
      { id: 'k3', cat: 'car', photo: 'comfort', title: 'Rueda Comfort', meta: { en: 'Newer cars, top drivers · 5 min', es: 'Carros nuevos, mejores conductores · 5 min' }, price: 6.9 },
      { id: 'k4', cat: 'car', photo: 'xl', title: 'Rueda XL', meta: { en: '6 seats, room for luggage · 7 min', es: '6 puestos, espacio para maletas · 7 min' }, price: 8.5 },
      { id: 'k5', cat: 'car', photo: 'ella', title: 'Rueda Ella', meta: { en: 'Women drivers for women riders · 6 min', es: 'Conductoras para pasajeras · 6 min' }, price: 5.2 },
      { id: 'k6', cat: 'car', photo: 'premium', title: 'Rueda Premium', meta: { en: 'Executive sedans, airport ready', es: 'Sedanes ejecutivos, ideal aeropuerto' }, price: 14 },
    ] },
  book: { button: { en: 'Request', es: 'Pedir' }, confirm: { en: 'Confirm ride', es: 'Confirmar viaje' },
    fields: [{ name: 'from', label: { en: 'Pick-up', es: 'Origen' }, value: 'Altamira, Caracas' }, { name: 'to', label: { en: 'Destination', es: 'Destino' }, value: 'CCCT, Chuao' },
      { name: 'pay', label: { en: 'Payment', es: 'Pago' }, type: 'select', options: ['Pago Móvil', 'Card', 'Cash', 'USDT'] }],
    total: (x) => x.price, detail: (x, v) => `${v.from} → ${v.to} · ${v.pay}` },
  flow: [{ id: 'req', label: { en: 'Requested', es: 'Solicitados' } }, { id: 'acc', label: { en: 'Driver on the way', es: 'Conductor en camino' }, verb: { en: 'Assign driver', es: 'Asignar' }, tone: 'warn' },
    { id: 'trip', label: { en: 'On trip', es: 'En viaje' }, verb: { en: 'Start trip', es: 'Iniciar' }, tone: 'info' }, { id: 'done', label: { en: 'Completed', es: 'Completados' }, verb: { en: 'Complete', es: 'Finalizar' } }],
  dashTitle: { en: 'Dispatch', es: 'Despacho' }, dashLead: { en: 'Every ride from request to drop-off; drivers and riders are tracked live and paid automatically.', es: 'Cada viaje desde la solicitud hasta el destino; conductores y pasajeros con seguimiento en vivo y pago automático.' },
  stats: (a) => { const r = a.db.records; return [[{ en: 'Trips today', es: 'Viajes hoy' }, String(1284 + r.length)], [{ en: 'Drivers online', es: 'Conductores activos' }, '312'],
    [{ en: 'Avg. pick-up time', es: 'Tiempo de llegada' }, '4.2 min'], [{ en: 'Gross today', es: 'Facturado hoy' }, a.money(7930 + r.reduce((s, x) => s + x.total, 0))]]; },
  side: { title: { en: 'Top drivers this week', es: 'Mejores conductores de la semana' }, rows: (a) => [
    { img: 'd1', title: 'José M. · Comfort', sub: { en: '142 trips · 4.98 ★', es: '142 viajes · 4,98 ★' }, right: { en: 'Online', es: 'Activo' }, tone: 'ok' },
    { img: 'd2', title: 'Luis R. · Economy', sub: { en: '131 trips · 4.95 ★', es: '131 viajes · 4,95 ★' }, right: { en: 'On trip', es: 'En viaje' }, tone: 'info' },
    { img: 'd4', title: 'Andrea P. · Ella', sub: { en: '118 trips · 4.99 ★', es: '118 viajes · 4,99 ★' }, right: { en: 'Online', es: 'Activa' }, tone: 'ok' },
    { img: 'd3', title: 'Carlos T. · XL', sub: { en: '97 trips · 4.93 ★', es: '97 viajes · 4,93 ★' }, right: { en: 'Offline', es: 'Inactivo' } }] },
  perks: [['shield', { en: 'Verified drivers', es: 'Conductores verificados' }, { en: 'ID, license and car checked.', es: 'Cédula, licencia y vehículo revisados.' }],
    ['pin', { en: 'Share your trip', es: 'Comparte tu viaje' }, { en: 'Family follows you live.', es: 'Tu familia te sigue en vivo.' }],
    ['card', { en: 'Fixed prices', es: 'Precio fijo' }, { en: 'You know the price before you ride.', es: 'Sabes el precio antes de viajar.' }]],
  seed: (a) => [['Gabriela L.', 'k2', 'trip', 'Las Mercedes → Sambil', 3], ['Pedro R.', 'k1', 'acc', 'Chacaíto → La Candelaria', 1], ['Mariana O.', 'k5', 'req', 'El Hatillo → Altamira', 0], ['Jorge S.', 'k6', 'done', 'Maiquetía → La Castellana', 40], ['Ana T.', 'k3', 'done', 'Chuao → Los Palos Grandes', 22]]
    .map(([name, item, status, detail, min]) => { const x = a.item(item); return { id: a.uid(), item, name, phone: '+58 414 000 0000', detail, total: x.price, status, at: new Date(Date.now() - min * 6e4).toISOString() }; }),
}""")

# ---------------------------------------------------------------- Food & market delivery app (Yummy style)
DEMOS['eats'] = dict(
    title='Antojo', desc='Live demo of the Sylkit delivery app: many restaurants, markets and pharmacies, orders, riders and payments in one app.',
    photos={'hero': 'tacos:0', 'r1': 'burger:3', 'r2': 'pizza:1', 'r3': 'sushi:12', 'r4': 'tacos:2', 'r5': 'fried-chicken:3', 'r6': 'bowl:2', 'r7': 'horno-bread:0', 'm1': 'minimarket:1', 'm2': 'pharmacy:4', 'rider': 'delivery-rider:0'},
    cfg="""{
  id: 'eats', version: 1, ref: 'eats',
  theme: { primary: '#e11d48', primaryD: '#be123c', soft: '#fff1f3', fonts: 'family=Inter:wght@400;600;700;800;900' },
  brand: { name: 'Antojo', mark: 'A' },
  hero: { photo: 'hero', eyebrow: { en: 'Restaurants · Market · Pharmacy', es: 'Restaurantes · Mercado · Farmacia' },
    title: { en: 'Everything you crave, delivered', es: 'Todo lo que se te antoja, a domicilio' },
    lead: { en: '120 restaurants, supermarkets and pharmacies in one app. Track your rider live and pay your way.', es: '120 restaurantes, supermercados y farmacias en una sola app. Sigue a tu motorizado en vivo y paga como quieras.' },
    search: [{ name: 'addr', label: { en: 'Deliver to', es: 'Entregar en' }, value: 'Los Palos Grandes, Caracas' },
      { name: 'kind', label: { en: 'Looking for', es: 'Busco' }, type: 'select', options: [['all', { en: 'Everything', es: 'Todo' }], ['food', { en: 'Restaurants', es: 'Restaurantes' }], ['market', { en: 'Market & pharmacy', es: 'Mercado y farmacia' }]] }],
    cta: { en: 'Find', es: 'Buscar' }, onSearch: (v, a) => { a.db.cat = v.kind; } },
  catalog: { title: { en: 'Near you', es: 'Cerca de ti' }, lead: { en: 'Tap a store to order. Each store gets the order on its tablet; riders are assigned automatically.', es: 'Toca una tienda para pedir. Cada local recibe el pedido en su tablet y el motorizado se asigna solo.' },
    filters: [['food', { en: 'Restaurants', es: 'Restaurantes' }], ['market', { en: 'Market & pharmacy', es: 'Mercado y farmacia' }]],
    items: [
      { id: 'e1', cat: 'food', photo: 'r1', title: 'Burger Garage', meta: { en: 'Burgers · 25–35 min · $1.50 delivery', es: 'Hamburguesas · 25–35 min · delivery $1,50' }, price: 9, unit: { en: 'avg. order', es: 'pedido prom.' }, tag: { en: 'Free delivery', es: 'Delivery gratis' } },
      { id: 'e2', cat: 'food', photo: 'r2', title: 'Forno Napoli', meta: { en: 'Pizza · 30–40 min · $2 delivery', es: 'Pizza · 30–40 min · delivery $2' }, price: 14, unit: { en: 'avg. order', es: 'pedido prom.' } },
      { id: 'e3', cat: 'food', photo: 'r3', title: 'Kaito Sushi', meta: { en: 'Sushi · 35–45 min · $2 delivery', es: 'Sushi · 35–45 min · delivery $2' }, price: 22, unit: { en: 'avg. order', es: 'pedido prom.' }, tag: { en: '20% off', es: '20% dcto.' } },
      { id: 'e4', cat: 'food', photo: 'r4', title: 'Taquería Lupe', meta: { en: 'Mexican · 20–30 min · $1.50 delivery', es: 'Mexicana · 20–30 min · delivery $1,50' }, price: 10, unit: { en: 'avg. order', es: 'pedido prom.' } },
      { id: 'e5', cat: 'food', photo: 'r5', title: 'Pollo Crocante', meta: { en: 'Chicken · 20–30 min · $1 delivery', es: 'Pollo · 20–30 min · delivery $1' }, price: 11, unit: { en: 'avg. order', es: 'pedido prom.' } },
      { id: 'e6', cat: 'food', photo: 'r6', title: 'Green Bowl', meta: { en: 'Healthy · 25–35 min · $1.50 delivery', es: 'Saludable · 25–35 min · delivery $1,50' }, price: 12, unit: { en: 'avg. order', es: 'pedido prom.' } },
      { id: 'e7', cat: 'food', photo: 'r7', title: 'Panadería Real', meta: { en: 'Bakery & coffee · 15–25 min', es: 'Panadería y café · 15–25 min' }, price: 6, unit: { en: 'avg. order', es: 'pedido prom.' } },
      { id: 'e8', cat: 'market', photo: 'm1', title: 'Mercado Fresco', meta: { en: 'Groceries · delivery in 45 min', es: 'Víveres · entrega en 45 min' }, price: 35, unit: { en: 'avg. order', es: 'pedido prom.' }, tag: { en: 'New', es: 'Nuevo' } },
      { id: 'e9', cat: 'market', photo: 'm2', title: 'Farmacia San Rafael', meta: { en: 'Pharmacy · 30 min · open 24 h', es: 'Farmacia · 30 min · abierta 24 h' }, price: 15, unit: { en: 'avg. order', es: 'pedido prom.' } },
    ] },
  book: { button: { en: 'Order', es: 'Pedir' }, confirm: { en: 'Place order', es: 'Hacer pedido' },
    fields: [{ name: 'items', label: { en: 'What do you want?', es: '¿Qué quieres?' }, value: '2 × combo' }, { name: 'pay', label: { en: 'Payment', es: 'Pago' }, type: 'select', options: ['Pago Móvil', 'Card', 'Cash', 'USDT'] }],
    total: (x) => x.price + 1.5, detail: (x, v) => `${v.items} · ${v.pay}` },
  flow: [{ id: 'new', label: { en: 'New orders', es: 'Nuevos' } }, { id: 'prep', label: { en: 'Preparing', es: 'Preparando' }, verb: { en: 'Store accepts', es: 'Local acepta' }, tone: 'warn' },
    { id: 'road', label: { en: 'Rider on the way', es: 'En camino' }, verb: { en: 'Assign rider', es: 'Asignar motorizado' }, tone: 'info' }, { id: 'done', label: { en: 'Delivered', es: 'Entregados' }, verb: { en: 'Delivered', es: 'Entregado' } }],
  dashTitle: { en: 'Operations center', es: 'Centro de operaciones' }, dashLead: { en: 'All stores, orders and riders in one place, with commissions calculated per store.', es: 'Todos los locales, pedidos y motorizados en un solo lugar, con la comisión calculada por local.' },
  stats: (a) => { const r = a.db.records; return [[{ en: 'Orders today', es: 'Pedidos hoy' }, String(2140 + r.length)], [{ en: 'Active stores', es: 'Locales activos' }, '126'],
    [{ en: 'Riders online', es: 'Motorizados activos' }, '184'], [{ en: 'Commission today', es: 'Comisión hoy' }, a.money(4120 + r.reduce((s, x) => s + x.total * 0.15, 0))]]; },
  side: { title: { en: 'Top stores today', es: 'Locales top de hoy' }, rows: (a) => [
    { img: 'r1', title: 'Burger Garage', sub: { en: '214 orders · 4.8 ★', es: '214 pedidos · 4,8 ★' }, bar: 1 },
    { img: 'r2', title: 'Forno Napoli', sub: { en: '168 orders · 4.7 ★', es: '168 pedidos · 4,7 ★' }, bar: 0.78 },
    { img: 'm1', title: 'Mercado Fresco', sub: { en: '133 orders · 4.9 ★', es: '133 pedidos · 4,9 ★' }, bar: 0.62 },
    { img: 'r3', title: 'Kaito Sushi', sub: { en: '97 orders · 4.8 ★', es: '97 pedidos · 4,8 ★' }, bar: 0.45 }] },
  perks: [['truck', { en: 'Live tracking', es: 'Seguimiento en vivo' }, { en: 'See your rider on the map.', es: 'Ve a tu motorizado en el mapa.' }],
    ['card', { en: 'All payments', es: 'Todos los pagos' }, { en: 'Pago Móvil, card, cash or USDT.', es: 'Pago Móvil, tarjeta, efectivo o USDT.' }],
    ['star', { en: 'Rewards', es: 'Recompensas' }, { en: 'Points and free delivery days.', es: 'Puntos y días de delivery gratis.' }]],
  seed: (a) => [['Valentina S.', 'e1', 'road', '2 × combo · Pago Móvil', 12], ['Ricardo D.', 'e8', 'prep', 'Weekly groceries · Card', 6], ['Paola M.', 'e3', 'new', 'Sushi 32 pcs · USDT', 1], ['Hugo S.', 'e5', 'done', 'Family bucket · Cash', 55], ['Elena B.', 'e9', 'prep', 'Medicines · Pago Móvil', 4]]
    .map(([name, item, status, detail, min]) => { const x = a.item(item); return { id: a.uid(), item, name, phone: '+58 424 000 0000', detail, total: x.price + 1.5, status, at: new Date(Date.now() - min * 6e4).toISOString() }; }),
}""")

# ---------------------------------------------------------------- Flights & travel agency
DEMOS['flights'] = dict(
    title='Vuela Travel', desc='Live demo of the Sylkit travel agency system: flight search, tickets, vacation packages, tours and payments.',
    photos={'hero': 'airplane:3', 'f1': 'madrid:0', 'f2': 'miami:2', 'f3': 'bogota:10', 'f4': 'panama-city:1', 'p1': 'cancun:7', 'p2': 'punta-cana:9', 'p3': 'island:11', 'p4': 'waterfall:3', 'air': 'airport:10', 'plane': 'airplane:5'},
    cfg="""{
  id: 'flights', version: 1, ref: 'flights',
  theme: { primary: '#2563eb', primaryD: '#1d4ed8', soft: '#eff6ff', fonts: 'family=Inter:wght@400;600;700;800;900' },
  brand: { name: 'Vuela Travel', mark: 'V' },
  hero: { photo: 'hero', eyebrow: { en: 'Flights · Vacation packages · Tours', es: 'Vuelos · Paquetes vacacionales · Tours' },
    title: { en: 'Your next trip, booked in minutes', es: 'Tu próximo viaje, reservado en minutos' },
    lead: { en: 'Compare flights, buy your ticket and add hotel, transfers and tours. Pay in installments with card, Pago Móvil or USDT.', es: 'Compara vuelos, compra tu boleto y suma hotel, traslados y tours. Paga en cuotas con tarjeta, Pago Móvil o USDT.' },
    search: [{ name: 'from', label: { en: 'From', es: 'Desde' }, value: 'Caracas (CCS)' }, { name: 'to', label: { en: 'To', es: 'Hacia' }, type: 'select', options: [['all', { en: 'Anywhere', es: 'Cualquier destino' }], ['flight', { en: 'Flights only', es: 'Solo vuelos' }], ['pack', { en: 'Vacation packages', es: 'Paquetes' }]] },
      { name: 'date', label: { en: 'Departure', es: 'Salida' }, type: 'date', value: (a) => a.day(21) }, { name: 'pax', label: { en: 'Travelers', es: 'Pasajeros' }, type: 'number', value: 2, min: 1 }],
    cta: { en: 'Search', es: 'Buscar' }, onSearch: (v, a) => { a.db.cat = v.to; } },
  catalog: { title: { en: 'Deals from Caracas', es: 'Ofertas desde Caracas' }, lead: { en: 'Round-trip prices per person, taxes included. Book now and the ticket is issued by our agents.', es: 'Precios ida y vuelta por persona, impuestos incluidos. Reserva y nuestros agentes emiten el boleto.' },
    filters: [['flight', { en: 'Flights', es: 'Vuelos' }], ['pack', { en: 'Packages', es: 'Paquetes' }]],
    items: [
      { id: 'v1', cat: 'flight', photo: 'f1', title: { en: 'Caracas → Madrid', es: 'Caracas → Madrid' }, meta: { en: 'Direct · 9 h 05 min · 23 kg bag', es: 'Directo · 9 h 05 min · maleta 23 kg' }, price: 890, unit: { en: 'round trip', es: 'ida y vuelta' }, tag: { en: 'Best seller', es: 'Más vendido' } },
      { id: 'v2', cat: 'flight', photo: 'f2', title: { en: 'Caracas → Miami', es: 'Caracas → Miami' }, meta: { en: '1 stop · 6 h 40 min', es: '1 escala · 6 h 40 min' }, price: 540, unit: { en: 'round trip', es: 'ida y vuelta' } },
      { id: 'v3', cat: 'flight', photo: 'f3', title: { en: 'Caracas → Bogotá', es: 'Caracas → Bogotá' }, meta: { en: 'Direct · 2 h 10 min', es: 'Directo · 2 h 10 min' }, price: 310, unit: { en: 'round trip', es: 'ida y vuelta' } },
      { id: 'v4', cat: 'flight', photo: 'f4', title: { en: 'Caracas → Panama City', es: 'Caracas → Panamá' }, meta: { en: 'Direct · 2 h 25 min', es: 'Directo · 2 h 25 min' }, price: 380, unit: { en: 'round trip', es: 'ida y vuelta' }, tag: { en: '6 seats left', es: 'Quedan 6' } },
      { id: 'v5', cat: 'pack', photo: 'p1', title: { en: 'Cancún all-inclusive · 5 nights', es: 'Cancún todo incluido · 5 noches' }, meta: { en: 'Flight + resort + transfers', es: 'Vuelo + resort + traslados' }, price: 1290, unit: { en: '/person', es: '/persona' }, tag: { en: 'Installments', es: 'En cuotas' } },
      { id: 'v6', cat: 'pack', photo: 'p2', title: { en: 'Punta Cana resort · 4 nights', es: 'Punta Cana resort · 4 noches' }, meta: { en: 'Flight + all-inclusive hotel', es: 'Vuelo + hotel todo incluido' }, price: 990, unit: { en: '/person', es: '/persona' } },
      { id: 'v7', cat: 'pack', photo: 'p3', title: { en: 'Los Roques escape · 3 days', es: 'Escapada a Los Roques · 3 días' }, meta: { en: 'Small plane + inn + boat tours', es: 'Avioneta + posada + paseos en lancha' }, price: 650, unit: { en: '/person', es: '/persona' } },
      { id: 'v8', cat: 'pack', photo: 'p4', title: { en: 'Canaima & Angel Falls · 3 days', es: 'Canaima y Salto Ángel · 3 días' }, meta: { en: 'Flights + camp + guide', es: 'Vuelos + campamento + guía' }, price: 720, unit: { en: '/person', es: '/persona' } },
    ] },
  book: { button: { en: 'Book', es: 'Reservar' }, confirm: { en: 'Book & hold price 24 h', es: 'Reservar y congelar precio 24 h' },
    fields: [{ name: 'date', label: { en: 'Departure', es: 'Salida' }, type: 'date', value: (a) => a.day(21) }, { name: 'pax', label: { en: 'Travelers', es: 'Pasajeros' }, type: 'number', min: 1, value: 2 },
      { name: 'cls', label: { en: 'Class', es: 'Clase' }, type: 'select', options: [['1', { en: 'Economy', es: 'Económica' }], ['2.4', { en: 'Business', es: 'Ejecutiva' }]] }],
    total: (x, v) => x.price * Math.max(1, Number(v.pax) || 1) * (x.cat === 'flight' ? Number(v.cls || 1) : 1), detail: (x, v, a) => `${a.date(v.date)} · ${Math.max(1, Number(v.pax) || 1)} pax` },
  flow: [{ id: 'held', label: { en: 'Price held', es: 'Reservados' } }, { id: 'paid', label: { en: 'Paid', es: 'Pagados' }, verb: { en: 'Payment in', es: 'Pago recibido' }, tone: 'info' },
    { id: 'ticket', label: { en: 'Ticketed', es: 'Emitidos' }, verb: { en: 'Issue ticket', es: 'Emitir boleto' } }],
  dashTitle: { en: 'Agency desk', es: 'Mostrador de la agencia' }, dashLead: { en: 'Bookings, payments, ticket issuing and itineraries for every traveler.', es: 'Reservas, pagos, emisión de boletos e itinerarios para cada viajero.' },
  stats: (a) => { const r = a.db.records; return [[{ en: 'Travelers this month', es: 'Viajeros del mes' }, String(418 + r.length * 2)], [{ en: 'Sales this month', es: 'Ventas del mes' }, a.money(186400 + r.reduce((s, x) => s + x.total, 0))],
    [{ en: 'Tickets to issue', es: 'Boletos por emitir' }, String(r.filter((x) => x.status === 'paid').length + 3)], [{ en: 'Avg. margin', es: 'Margen promedio' }, '11%']]; },
  side: { title: { en: 'Departures this week', es: 'Salidas esta semana' }, rows: (a) => [
    { img: 'plane', title: 'CCS → MAD · Thu 08:40', sub: { en: '12 travelers · all checked in', es: '12 viajeros · todos con check-in' }, right: { en: 'On time', es: 'A tiempo' }, tone: 'ok' },
    { img: 'p1', title: { en: 'Cancún group · Sat', es: 'Grupo Cancún · Sáb' }, sub: { en: '24 travelers · transfers booked', es: '24 viajeros · traslados listos' }, right: { en: 'Confirmed', es: 'Confirmado' }, tone: 'info' },
    { img: 'air', title: 'CCS → PTY · Sun 07:15', sub: { en: '5 travelers · 2 missing passports', es: '5 viajeros · faltan 2 pasaportes' }, right: { en: 'Pending', es: 'Pendiente' }, tone: 'warn' }] },
  perks: [['card', { en: 'Pay in installments', es: 'Paga en cuotas' }, { en: 'Up to 6 payments before you fly.', es: 'Hasta 6 pagos antes de volar.' }],
    ['shield', { en: 'Real agents', es: 'Agentes reales' }, { en: 'Help with visas, changes and refunds.', es: 'Ayuda con visas, cambios y reembolsos.' }],
    ['globe', { en: 'Every airline', es: 'Todas las aerolíneas' }, { en: 'We compare fares for you.', es: 'Comparamos tarifas por ti.' }]],
  seed: (a) => [['Familia Rondón', 'v5', 'paid', 4], ['Camila Pérez', 'v1', 'ticket', 1], ['Jorge Linares', 'v3', 'held', 2], ['Isabel Mora', 'v7', 'held', 2], ['Grupo Uni Andes', 'v8', 'paid', 10]]
    .map(([name, item, status, p], i) => { const x = a.item(item); return { id: a.uid(), item, name, phone: '+58 416 000 0000', detail: `${a.date(a.day(14 + i * 3))} · ${p} pax`, total: x.price * p, status, at: new Date(Date.now() - (i + 1) * 4e6).toISOString() }; }),
}""")


def main():
    for demo, d in DEMOS.items():
        photos = {k: photo(p)[:3] for k, p in d['photos'].items()}
        html = PAGE.format(title=d['title'], desc=d['desc'], photos=json.dumps(photos, ensure_ascii=False), cfg=d['cfg'])
        out = ROOT / 'public' / 'demos' / demo / 'index.html'
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding='utf-8')
        print('built', demo, len(photos), 'photos')


if __name__ == '__main__':
    main()
