"""Generates the store template preview pages (public/preview/<slug>/index.html) and the
template list the site reads (src/data/storeTemplates.ts).

Every template is original Sylkit work: same storefront engine (public/_store), different
colors, fonts, hero layout, categories and sample products. Run: python3 scripts/build_store_templates.py
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Defaults that fit small shops in Venezuela and Latin America; each template can override.
PAY = ["Pago Móvil", "Zelle", "USDT (Binance)", ["Efectivo", "Cash"], ["Tarjeta", "Card"]]
DELIVERY = [
    {"id": "local", "n": ["Delivery en la ciudad", "City delivery"], "fee": 3},
    {"id": "ship", "n": ["Envío nacional", "Nationwide shipping"], "fee": 6},
    {"id": "pickup", "n": ["Retiro en tienda", "Store pickup"], "fee": 0},
]
CONTACT = ["Caracas, Venezuela", "+58 412 000 0000", ["Lun a sáb · 9 am a 7 pm", "Mon to Sat · 9 am to 7 pm"]]


def perks(ship, pay="Pago Móvil, Zelle, USDT o efectivo", pay_en="Pago Móvil, Zelle, USDT or cash"):
    return [
        ["🚚", ship[0], ship[1]],
        ["💳", ["Paga como prefieras", "Pay your way"], [pay, pay_en]],
        ["💬", ["Atención por WhatsApp", "WhatsApp support"], ["Te respondemos rápido, antes y después de tu compra.", "Quick answers before and after you buy."]],
    ]


TEMPLATES = [
    {
        "slug": "lumen", "name": "Lumen", "mark": "L", "sector": "fashion",
        "tagline": ["Moda y ropa", "Fashion & clothing"],
        "blurb": ["Elegante y editorial, para tiendas de ropa y boutiques.", "Elegant and editorial, for clothing stores and boutiques."],
        "fonts": "family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@500;600;700",
        "vars": {"bg": "#faf8f5", "surface": "#ffffff", "soft": "#efebe5", "text": "#141414", "muted": "#6f6a63", "line": "rgba(20,20,20,.10)",
                 "accent": "#141414", "accent-ink": "#ffffff", "accent-soft": "#f1ede7", "r": "4px", "r-lg": "6px", "r-btn": "0px", "r-cat": "4px",
                 "font": "'Inter',sans-serif", "head": "'Playfair Display',serif", "head-w": "600", "head-ls": "-0.01em", "art-ratio": "3 / 4"},
        "art": ["#e8dfd3", "#d9cfc1", "#ece6dc", "#cfc4b5", "#e4d8cc"],
        "annc": ["Envío gratis en compras desde $60 · Cambios en 7 días", "Free shipping on orders over $60 · 7-day exchanges"],
        "cats": [{"id": "mujer", "n": ["Mujer", "Women"], "em": "👗", "a": "#e8dfd3"}, {"id": "hombre", "n": ["Hombre", "Men"], "em": "👔", "a": "#d9cfc1"},
                 {"id": "zapatos", "n": ["Zapatos", "Shoes"], "em": "👠", "a": "#ece6dc"}, {"id": "bolsos", "n": ["Bolsos", "Bags"], "em": "👜", "a": "#cfc4b5"},
                 {"id": "accesorios", "n": ["Accesorios", "Accessories"], "em": "🕶️", "a": "#e4d8cc"}],
        "options": {"size": {"l": ["Talla", "Size"], "v": ["XS", "S", "M", "L", "XL"], "def": 2}, "shoe": {"l": ["Talla", "Size"], "v": ["36", "37", "38", "39", "40"], "def": 2}},
        "desc": {"mujer": ["Tela suave y fresca, corte que favorece. Lávala a mano o en ciclo delicado.", "Soft, breathable fabric with a flattering cut. Hand or gentle wash."],
                 "hombre": ["Algodón de buena caída para el día a día y la oficina.", "Well-draped cotton for everyday and office wear."],
                 "zapatos": ["Cómodos desde el primer día, con plantilla acolchada.", "Comfortable from day one, with a cushioned insole."],
                 "bolsos": ["Espacioso y resistente, con cierre y bolsillo interno.", "Roomy and sturdy, with a zip and inner pocket."],
                 "accesorios": ["El detalle que completa tu look.", "The detail that finishes your look."]},
        "products": [
            ["Vestido de lino", "Linen dress", "mujer", 34, {"em": "👗", "opt": "size", "badge": "new"}],
            ["Blusa satinada", "Satin blouse", "mujer", 22, {"em": "👚", "opt": "size"}],
            ["Falda midi", "Midi skirt", "mujer", 26, {"em": "👗", "opt": "size", "old": 32, "badge": "sale"}],
            ["Bikini clásico", "Classic bikini", "mujer", 24, {"em": "👙", "opt": "size"}],
            ["Camisa Oxford", "Oxford shirt", "hombre", 28, {"em": "👔", "opt": "size"}],
            ["Jean recto", "Straight jeans", "hombre", 30, {"em": "👖", "opt": "size", "badge": "hot"}],
            ["Franela básica", "Basic tee", "hombre", 12, {"em": "👕", "opt": "size"}],
            ["Tacón cuadrado", "Block heels", "zapatos", 42, {"em": "👠", "opt": "shoe"}],
            ["Sandalia plana", "Flat sandals", "zapatos", 25, {"em": "👡", "opt": "shoe", "old": 30, "badge": "sale"}],
            ["Bolso tote", "Tote bag", "bolsos", 38, {"em": "👜", "badge": "new"}],
            ["Cartera de mano", "Clutch", "bolsos", 27, {"em": "👛", "stock": 0}],
            ["Lentes de sol", "Sunglasses", "accesorios", 18, {"em": "🕶️"}],
        ],
        "hero": {"layout": "editorial", "eyebrow": ["Colección otoño", "Autumn collection"], "title": ["Nueva<br>temporada", "New<br>season"],
                 "lead": ["Piezas atemporales en telas naturales. Pide por WhatsApp y recibe en tu casa.", "Timeless pieces in natural fabrics. Order on WhatsApp, delivered to your door."],
                 "cta2": {"t": ["Ver vestidos", "See dresses"], "cat": "mujer"}, "art": ["p0", "p4"]},
        "gridTitle": ["Lo más nuevo", "Just in"],
        "perks": perks([["Envíos a todo el país", "Nationwide shipping"], ["Gratis desde $60. Delivery en Caracas el mismo día.", "Free over $60. Same-day delivery in Caracas."]]),
        "quotes": [[["La calidad de la tela es increíble y llegó en un día.", "The fabric quality is amazing and it arrived in a day."], "Andrea R. · Caracas"],
                   [["Pedí por WhatsApp y me ayudaron con la talla. Perfecto.", "I ordered on WhatsApp and they helped with my size. Perfect."], "Mariana G. · Valencia"],
                   [["Ya es mi tienda de confianza para regalos.", "It's my go-to store for gifts now."], "Luis P. · Maracaibo"]],
        "about": ["Boutique de moda con piezas atemporales y envíos a toda Venezuela.", "Fashion boutique with timeless pieces, shipping across Venezuela."],
    },
    {
        "slug": "rose", "name": "Rosé", "mark": "R", "sector": "beauty",
        "tagline": ["Belleza y cosméticos", "Beauty & cosmetics"],
        "blurb": ["Suave y luminosa, para maquillaje, skincare y perfumería.", "Soft and bright, for makeup, skincare and fragrance."],
        "fonts": "family=DM+Sans:wght@400;600;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700",
        "vars": {"bg": "#fff7f8", "surface": "#ffffff", "soft": "#ffe9ee", "text": "#3a1f2b", "muted": "#8a6b77", "line": "rgba(58,31,43,.10)",
                 "accent": "#d6457a", "accent-ink": "#ffffff", "accent-soft": "#ffeef3", "sale": "#d6457a", "r": "18px", "r-lg": "28px", "r-btn": "999px",
                 "font": "'DM Sans',sans-serif", "head": "'Fraunces',serif", "head-w": "600", "head-ls": "-0.01em"},
        "art": ["#ffd9e2", "#fde2d4", "#f9d0dc", "#ffe6ec", "#f6dccf"],
        "annc": ["💗 Muestra gratis en cada pedido · Productos 100% originales", "💗 Free sample with every order · 100% authentic products"],
        "cats": [{"id": "maquillaje", "n": ["Maquillaje", "Makeup"], "em": "💄", "a": "#ffd9e2"}, {"id": "skincare", "n": ["Skincare", "Skincare"], "em": "🧴", "a": "#fde2d4"},
                 {"id": "perfumes", "n": ["Perfumes", "Fragrance"], "em": "🌸", "a": "#f9d0dc"}, {"id": "unas", "n": ["Uñas", "Nails"], "em": "💅", "a": "#ffe6ec"},
                 {"id": "cabello", "n": ["Cabello", "Hair"], "em": "🎀", "a": "#f6dccf"}],
        "options": {"shade": {"l": ["Tono", "Shade"], "v": [["Claro", "Light"], ["Medio", "Medium"], ["Canela", "Tan"], ["Oscuro", "Deep"]], "def": 1},
                    "ml": {"l": ["Tamaño", "Size"], "v": ["30 ml", "50 ml", "100 ml"], "def": 1}},
        "desc": {"maquillaje": ["Larga duración, acabado natural y no reseca.", "Long-wearing, natural finish, never drying."],
                 "skincare": ["Fórmula suave para uso diario, apta para piel sensible.", "Gentle daily formula, suitable for sensitive skin."],
                 "perfumes": ["Notas florales y frescas que duran todo el día.", "Fresh floral notes that last all day."],
                 "unas": ["Color intenso y brillo de salón en casa.", "Rich color and salon shine at home."],
                 "cabello": ["Cuida y da brillo sin apelmazar.", "Nourishes and adds shine without weighing hair down."]},
        "products": [
            ["Labial mate", "Matte lipstick", "maquillaje", 9, {"em": "💄", "opt": "shade", "badge": "hot"}],
            ["Base líquida", "Liquid foundation", "maquillaje", 16, {"em": "🧴", "opt": "shade"}],
            ["Paleta de sombras", "Eyeshadow palette", "maquillaje", 19, {"em": "🎨", "old": 24, "badge": "sale"}],
            ["Rímel volumen", "Volume mascara", "maquillaje", 11, {"em": "✨"}],
            ["Sérum vitamina C", "Vitamin C serum", "skincare", 21, {"em": "🧪", "badge": "new"}],
            ["Crema hidratante", "Moisturizer", "skincare", 17, {"em": "🧴"}],
            ["Protector solar", "Sunscreen SPF 50", "skincare", 14, {"em": "☀️"}],
            ["Agua de rosas", "Rose eau de parfum", "perfumes", 35, {"em": "🌹", "opt": "ml"}],
            ["Body mist vainilla", "Vanilla body mist", "perfumes", 12, {"em": "🌸", "old": 15, "badge": "sale"}],
            ["Esmalte gel", "Gel polish", "unas", 7, {"em": "💅"}],
            ["Kit de manicure", "Manicure kit", "unas", 15, {"em": "💅", "stock": 0}],
            ["Aceite capilar", "Hair oil", "cabello", 13, {"em": "🎀"}],
        ],
        "hero": {"layout": "banner", "bg": "linear-gradient(135deg,#d6457a,#f08aa8)", "ink": "#ffffff", "eyebrow": ["Glow de temporada", "Seasonal glow"],
                 "title": ["Tu rutina,<br>tu brillo", "Your routine,<br>your glow"], "lead": ["Maquillaje y skincare originales con envío a domicilio.", "Authentic makeup and skincare, delivered to your door."],
                 "cta2": {"t": ["Ver skincare", "See skincare"], "cat": "skincare"}, "art": ["p0", "p4", "p7"]},
        "gridTitle": ["Favoritos", "Favorites"],
        "perks": perks([["Envío rápido", "Fast delivery"], ["Delivery en tu ciudad y envíos a todo el país.", "City delivery and nationwide shipping."]]),
        "quotes": [[["Todo original y bien empacado. El sérum es otro nivel.", "Everything authentic and well packed. The serum is next level."], "Valentina S. · Caracas"],
                   [["Me ayudaron a elegir el tono de base por WhatsApp.", "They helped me pick my foundation shade on WhatsApp."], "Daniela M. · Barquisimeto"],
                   [["Mi pedido llegó con una muestra de regalo 💗", "My order came with a free sample 💗"], "Karla V. · Mérida"]],
        "about": ["Belleza original para tu rutina diaria, con asesoría por WhatsApp.", "Authentic beauty for your daily routine, with advice on WhatsApp."],
    },
    {
        "slug": "volt", "name": "Volt", "mark": "V", "sector": "electronics",
        "tagline": ["Tecnología y celulares", "Tech & phones"],
        "blurb": ["Oscura y moderna, para celulares, accesorios y electrónica.", "Dark and modern, for phones, accessories and electronics."],
        "fonts": "family=Space+Grotesk:wght@400;500;600;700",
        "vars": {"bg": "#0b0d12", "surface": "#141821", "soft": "#1b2030", "text": "#f2f5fa", "muted": "#8a93a6", "line": "rgba(255,255,255,.10)",
                 "accent": "#22d3ee", "accent-ink": "#06121a", "accent-soft": "#121c27", "sale": "#ff4d6d", "r": "14px", "r-lg": "20px", "r-btn": "12px", "r-cat": "16px",
                 "font": "'Space Grotesk',sans-serif", "head": "'Space Grotesk',sans-serif", "head-w": "700", "head-ls": "-0.03em"},
        "art": ["#1b2233", "#1e2a3a", "#222036", "#17283a", "#1f2630"],
        "annc": ["⚡ Garantía de 3 meses en todos los equipos · Envío gratis desde $80", "⚡ 3-month warranty on every device · Free shipping over $80"],
        "cats": [{"id": "celulares", "n": ["Celulares", "Phones"], "em": "📱"}, {"id": "audio", "n": ["Audio", "Audio"], "em": "🎧"},
                 {"id": "cargadores", "n": ["Cargadores", "Chargers"], "em": "🔌"}, {"id": "relojes", "n": ["Smartwatch", "Smartwatches"], "em": "⌚"},
                 {"id": "gaming", "n": ["Gaming", "Gaming"], "em": "🎮"}, {"id": "laptops", "n": ["Laptops", "Laptops"], "em": "💻"}],
        "options": {"gb": {"l": ["Almacenamiento", "Storage"], "v": ["128 GB", "256 GB", "512 GB"], "def": 0},
                    "color": {"l": ["Color", "Color"], "v": [["Negro", "Black"], ["Blanco", "White"], ["Azul", "Blue"]], "def": 0}},
        "desc": {"celulares": ["Nuevo, liberado y con garantía. Incluye cargador y forro.", "New, unlocked and under warranty. Charger and case included."],
                 "audio": ["Sonido nítido, buena batería y conexión estable.", "Crisp sound, long battery and a stable connection."],
                 "cargadores": ["Carga rápida certificada, segura para tu equipo.", "Certified fast charging, safe for your device."],
                 "relojes": ["Mide pasos, sueño y ritmo cardíaco. Resistente al agua.", "Tracks steps, sleep and heart rate. Water resistant."],
                 "gaming": ["Respuesta rápida y comodidad para largas partidas.", "Fast response and comfort for long sessions."],
                 "laptops": ["Rápida y liviana para estudiar o trabajar.", "Fast and light for study or work."]},
        "products": [
            ["Teléfono Nova 5G", "Nova 5G phone", "celulares", 289, {"em": "📱", "opt": "gb", "badge": "new"}],
            ["Teléfono Lite", "Lite phone", "celulares", 159, {"em": "📱", "opt": "color", "old": 189, "badge": "sale"}],
            ["Audífonos inalámbricos", "Wireless earbuds", "audio", 39, {"em": "🎧", "old": 56, "badge": "sale"}],
            ["Audífonos over-ear", "Over-ear headphones", "audio", 69, {"em": "🎧", "opt": "color"}],
            ["Corneta portátil", "Portable speaker", "audio", 45, {"em": "🔊"}],
            ["Cargador rápido 33W", "33W fast charger", "cargadores", 15, {"em": "🔌", "badge": "hot"}],
            ["Power bank 20.000 mAh", "20,000 mAh power bank", "cargadores", 29, {"em": "🔋"}],
            ["Smartwatch Fit", "Fit smartwatch", "relojes", 55, {"em": "⌚", "opt": "color"}],
            ["Control inalámbrico", "Wireless controller", "gaming", 42, {"em": "🎮"}],
            ["Teclado mecánico", "Mechanical keyboard", "gaming", 58, {"em": "⌨️", "stock": 0}],
            ["Laptop Air 14", "Air 14 laptop", "laptops", 549, {"em": "💻"}],
            ["Mouse gamer", "Gaming mouse", "gaming", 19, {"em": "🖱️"}],
        ],
        "hero": {"layout": "promo", "bg": "linear-gradient(140deg,#0e7490,#1e3a8a 70%)", "ink": "#ffffff", "eyebrow": ["Nuevo lanzamiento", "New release"],
                 "title": ["Nova 5G.<br>Más rápido.", "Nova 5G.<br>Just faster."], "lead": ["Liberado, con garantía y envío a todo el país.", "Unlocked, under warranty, shipped nationwide."],
                 "cta": ["Comprar ahora", "Buy now"], "art": ["p0"],
                 "tiles": [{"t": ["Audífonos inalámbricos", "Wireless earbuds"], "s": ["Hasta -30%", "Up to 30% off"], "em": "🎧", "a": "#1e2a3a", "cat": "audio"},
                           {"t": ["Smartwatch y fitness", "Smartwatch & fitness"], "s": ["Desde $55", "From $55"], "em": "⌚", "a": "#222036", "cat": "relojes"}]},
        "gridTitle": ["Más vendidos", "Best sellers"],
        "perks": [["🛡️", ["Garantía real", "Real warranty"], ["3 meses en equipos, 1 mes en accesorios.", "3 months on devices, 1 month on accessories."]],
                  ["🚚", ["Envíos a todo el país", "Nationwide shipping"], ["Gratis desde $80. Delivery el mismo día en la ciudad.", "Free over $80. Same-day city delivery."]],
                  ["💬", ["Soporte técnico", "Tech support"], ["Te ayudamos a configurar tu equipo por WhatsApp.", "We help you set up your device on WhatsApp."]]],
        "quotes": [[["El teléfono llegó sellado y con factura. Todo en orden.", "The phone arrived sealed with an invoice. All good."], "José A. · Caracas"],
                   [["Los audífonos suenan increíble por el precio.", "The earbuds sound amazing for the price."], "Gabriel T. · Puerto La Cruz"],
                   [["Pagué con USDT y me lo enviaron el mismo día.", "Paid with USDT and they shipped it the same day."], "Ana L. · Valencia"]],
        "about": ["Celulares, audio y accesorios originales con garantía y soporte técnico.", "Authentic phones, audio and accessories with warranty and tech support."],
    },
    {
        "slug": "horno", "name": "Horno", "mark": "H", "sector": "food",
        "tagline": ["Panadería y comida", "Bakery & food"],
        "blurb": ["Cálida y apetitosa, para panaderías, dulcerías y comida.", "Warm and appetizing, for bakeries, sweets and food."],
        "fonts": "family=Nunito:wght@400;600;700;800&family=Fredoka:wght@500;600;700",
        "vars": {"bg": "#fffaf2", "surface": "#ffffff", "soft": "#f6ead8", "text": "#3b2416", "muted": "#8b6f5c", "line": "rgba(59,36,22,.12)",
                 "accent": "#c2410c", "accent-ink": "#ffffff", "accent-soft": "#fdf0e0", "r": "20px", "r-lg": "28px", "r-btn": "999px",
                 "font": "'Nunito',sans-serif", "head": "'Fredoka',sans-serif", "head-w": "700", "head-ls": "-0.01em"},
        "art": ["#fde3c4", "#f9d6a8", "#fbe7cf", "#f4d2b0", "#fde9d6"],
        "annc": ["🥐 Pide antes de las 4 pm y recibe hoy mismo", "🥐 Order before 4 pm, get it today"],
        "cats": [{"id": "panes", "n": ["Panes", "Breads"], "em": "🥖", "a": "#fde3c4"}, {"id": "tortas", "n": ["Tortas", "Cakes"], "em": "🎂", "a": "#f9d6a8"},
                 {"id": "dulces", "n": ["Dulces", "Sweets"], "em": "🍩", "a": "#fbe7cf"}, {"id": "salados", "n": ["Salados", "Savory"], "em": "🥐", "a": "#f4d2b0"},
                 {"id": "bebidas", "n": ["Bebidas", "Drinks"], "em": "☕", "a": "#fde9d6"}],
        "options": {"cake": {"l": ["Tamaño", "Size"], "v": [["Personal", "Personal"], ["Mediana (10 pers.)", "Medium (serves 10)"], ["Grande (20 pers.)", "Large (serves 20)"]], "def": 1}},
        "desc": {"panes": ["Horneado cada mañana con masa madre.", "Baked every morning with sourdough."],
                 "tortas": ["Hecha por encargo. Escribe en notas el mensaje para la torta.", "Made to order. Add your cake message in the notes."],
                 "dulces": ["Dulce artesanal, perfecto para compartir.", "Handmade treat, perfect for sharing."],
                 "salados": ["Recién salido del horno, crujiente por fuera.", "Fresh from the oven, crispy outside."],
                 "bebidas": ["Preparada al momento.", "Made fresh to order."]},
        "products": [
            ["Pan de masa madre", "Sourdough loaf", "panes", 4.5, {"em": "🍞", "badge": "hot"}],
            ["Canilla", "Baguette", "panes", 1.5, {"em": "🥖"}],
            ["Torta de chocolate", "Chocolate cake", "tortas", 18, {"em": "🎂", "opt": "cake", "badge": "hot"}],
            ["Cheesecake de fresa", "Strawberry cheesecake", "tortas", 22, {"em": "🍰", "opt": "cake"}],
            ["Donas glaseadas (6)", "Glazed donuts (6)", "dulces", 7, {"em": "🍩", "old": 9, "badge": "sale"}],
            ["Galletas de avena (12)", "Oat cookies (12)", "dulces", 5, {"em": "🍪"}],
            ["Cupcakes (4)", "Cupcakes (4)", "dulces", 8, {"em": "🧁", "badge": "new"}],
            ["Cachito de jamón", "Ham croissant roll", "salados", 2, {"em": "🥐"}],
            ["Pastelitos (6)", "Savory pastries (6)", "salados", 6, {"em": "🥟"}],
            ["Pizza familiar", "Family pizza", "salados", 12, {"em": "🍕", "stock": 0}],
            ["Café con leche", "Café latte", "bebidas", 2.5, {"em": "☕"}],
            ["Jugo natural", "Fresh juice", "bebidas", 3, {"em": "🧃"}],
        ],
        "hero": {"layout": "banner", "bg": "#c2410c", "ink": "#fffaf2", "eyebrow": ["Recién horneado", "Freshly baked"],
                 "title": ["Del horno<br>a tu mesa", "From our oven<br>to your table"], "lead": ["Panes, tortas y dulces artesanales. Pide hoy y recibe caliente.", "Handmade breads, cakes and sweets. Order today, delivered warm."],
                 "cta2": {"t": ["Encargar torta", "Order a cake"], "cat": "tortas"}, "art": ["p0", "p2", "p4"]},
        "gridTitle": ["Del día", "Today's bakes"],
        "delivery": [{"id": "local", "n": ["Delivery (zona centro)", "Delivery (downtown)"], "fee": 2}, {"id": "far", "n": ["Delivery (otras zonas)", "Delivery (other areas)"], "fee": 4},
                     {"id": "pickup", "n": ["Retiro en tienda", "Store pickup"], "fee": 0}],
        "perks": perks([["Entrega el mismo día", "Same-day delivery"], ["Pide antes de las 4 pm. Tortas con 24 h de anticipación.", "Order before 4 pm. Cakes need 24 h notice."]]),
        "quotes": [[["La torta de chocolate fue la estrella del cumpleaños.", "The chocolate cake was the star of the birthday."], "Patricia H. · Caracas"],
                   [["El pan de masa madre llega calentico. Lo pido cada semana.", "The sourdough arrives warm. I order it every week."], "Ricardo F. · Los Teques"],
                   [["Pedir por WhatsApp es facilísimo.", "Ordering on WhatsApp is so easy."], "Camila O. · Caracas"]],
        "about": ["Panadería artesanal: horneamos cada mañana y llevamos a tu puerta.", "Artisan bakery: we bake every morning and bring it to your door."],
    },
    {
        "slug": "fresco", "name": "Fresco", "mark": "F", "sector": "grocery",
        "tagline": ["Minimarket y víveres", "Grocery & minimarket"],
        "blurb": ["Clara y práctica, para minimarkets, abastos y fruterías.", "Clean and practical, for minimarkets, groceries and produce."],
        "fonts": "family=Manrope:wght@400;600;700;800",
        "vars": {"bg": "#f7faf5", "surface": "#ffffff", "soft": "#eaf3e4", "text": "#13261a", "muted": "#5d7264", "line": "rgba(19,38,26,.10)",
                 "accent": "#16a34a", "accent-ink": "#ffffff", "accent-soft": "#e7f6ec", "sale": "#e5484d", "r": "16px", "r-lg": "22px", "r-btn": "12px", "r-cat": "18px",
                 "font": "'Manrope',sans-serif", "head": "'Manrope',sans-serif", "head-w": "800", "head-ls": "-0.03em"},
        "art": ["#e6f4dc", "#fdf1d6", "#e4f0f7", "#fbe4e1", "#eef2d9"],
        "annc": ["🛒 Delivery gratis en compras desde $30 · Llegamos en 1 hora", "🛒 Free delivery over $30 · At your door in 1 hour"],
        "cats": [{"id": "frutas", "n": ["Frutas", "Fruit"], "em": "🍎", "a": "#fbe4e1"}, {"id": "verduras", "n": ["Verduras", "Vegetables"], "em": "🥕", "a": "#e6f4dc"},
                 {"id": "lacteos", "n": ["Lácteos", "Dairy"], "em": "🥛", "a": "#e4f0f7"}, {"id": "despensa", "n": ["Despensa", "Pantry"], "em": "🍚", "a": "#fdf1d6"},
                 {"id": "bebidas", "n": ["Bebidas", "Drinks"], "em": "🧃", "a": "#eef2d9"}, {"id": "limpieza", "n": ["Limpieza", "Cleaning"], "em": "🧼", "a": "#e4f0f7"}],
        "desc": {"frutas": ["Fresca y seleccionada a mano cada día.", "Fresh and hand-picked every day."], "verduras": ["Directo del productor a tu cocina.", "Straight from the farm to your kitchen."],
                 "lacteos": ["Siempre refrigerado hasta tu puerta.", "Kept cold all the way to your door."], "despensa": ["Lo básico de tu cocina, al mejor precio.", "Kitchen basics at the best price."],
                 "bebidas": ["Bien fría, lista para tomar.", "Ice cold and ready to drink."], "limpieza": ["Rinde más y cuida tu hogar.", "Goes further and keeps your home clean."]},
        "products": [
            ["Manzanas", "Apples", "frutas", 3.2, {"em": "🍎", "unit": "kg"}],
            ["Cambur", "Bananas", "frutas", 1.4, {"em": "🍌", "unit": "kg", "old": 1.8, "badge": "sale"}],
            ["Aguacate", "Avocado", "frutas", 2.5, {"em": "🥑", "unit": "kg"}],
            ["Tomates", "Tomatoes", "verduras", 2.1, {"em": "🍅", "unit": "kg"}],
            ["Zanahorias", "Carrots", "verduras", 1.6, {"em": "🥕", "unit": "kg"}],
            ["Leche entera 1 L", "Whole milk 1 L", "lacteos", 1.9, {"em": "🥛"}],
            ["Queso blanco", "White cheese", "lacteos", 6.5, {"em": "🧀", "unit": "kg", "badge": "hot"}],
            ["Huevos (cartón de 30)", "Eggs (tray of 30)", "lacteos", 5.8, {"em": "🥚"}],
            ["Arroz 1 kg", "Rice 1 kg", "despensa", 1.5, {"em": "🍚"}],
            ["Harina de maíz 1 kg", "Corn flour 1 kg", "despensa", 1.3, {"em": "🌽", "badge": "hot"}],
            ["Café molido 500 g", "Ground coffee 500 g", "despensa", 5.5, {"em": "☕", "badge": "new"}],
            ["Refresco 2 L", "Soda 2 L", "bebidas", 2.2, {"em": "🥤"}],
            ["Jabón líquido", "Liquid detergent", "limpieza", 4.9, {"em": "🧼", "stock": 0}],
        ],
        "hero": {"layout": "promo", "bg": "linear-gradient(140deg,#166534,#16a34a)", "ink": "#ffffff", "eyebrow": ["Mercado del día", "Today's market"],
                 "title": ["Tu mercado,<br>en 1 hora", "Your groceries,<br>in 1 hour"], "lead": ["Frutas, verduras y víveres frescos con delivery a tu casa.", "Fresh produce and pantry staples delivered home."],
                 "cta": ["Hacer mi mercado", "Start shopping"], "art": ["p0"],
                 "tiles": [{"t": ["Frutas de temporada", "Seasonal fruit"], "s": ["Hasta -20%", "Up to 20% off"], "em": "🍉", "a": "#fbe4e1", "cat": "frutas"},
                           {"t": ["Despensa básica", "Pantry basics"], "s": ["Precios de mayor", "Wholesale prices"], "em": "🛒", "a": "#fdf1d6", "cat": "despensa"}]},
        "gridTitle": ["Ofertas y básicos", "Deals and basics"],
        "delivery": [{"id": "local", "n": ["Delivery (1 hora)", "Delivery (1 hour)"], "fee": 2}, {"id": "pickup", "n": ["Retiro en tienda", "Store pickup"], "fee": 0}],
        "perks": perks([["Delivery en 1 hora", "1-hour delivery"], ["Gratis desde $30 en la zona.", "Free over $30 in our area."]]),
        "quotes": [[["Hago el mercado de la semana desde el teléfono. Todo fresco.", "I do my weekly shop from my phone. Everything's fresh."], "Yolanda C. · Caracas"],
                   [["Llegó en menos de una hora y con buen cambio.", "Arrived in under an hour, with correct change."], "Pedro M. · Guarenas"],
                   [["Los precios son mejores que en el súper.", "Prices are better than the supermarket."], "Elena B. · Caracas"]],
        "about": ["Minimarket de barrio con delivery rápido: frescos, víveres y limpieza.", "Neighborhood minimarket with fast delivery: fresh food, pantry and cleaning."],
    },
    {
        "slug": "aurum", "name": "Aurum", "mark": "A", "sector": "jewelry",
        "tagline": ["Joyería y relojes", "Jewelry & watches"],
        "blurb": ["Refinada y clásica, para joyerías, relojes y regalos.", "Refined and classic, for jewelry, watches and gifts."],
        "fonts": "family=Jost:wght@400;500;600;700&family=Cormorant+Garamond:wght@500;600;700",
        "vars": {"bg": "#fbfaf7", "surface": "#ffffff", "soft": "#f1ede4", "text": "#13203b", "muted": "#6b7280", "line": "rgba(19,32,59,.10)",
                 "accent": "#13203b", "accent-ink": "#f3e2b8", "accent-soft": "#f3efe6", "sale": "#a3292a", "r": "2px", "r-lg": "4px", "r-btn": "2px", "r-cat": "999px",
                 "font": "'Jost',sans-serif", "head": "'Cormorant Garamond',serif", "head-w": "600", "head-ls": "0", "art-ratio": "4 / 5"},
        "art": ["#efe6d3", "#e9dfca", "#f2ead9", "#e3d6bc", "#ece3d0"],
        "annc": ["Plata 925 y oro laminado con certificado · Empaque de regalo incluido", "925 silver and gold-plated, certified · Gift box included"],
        "cats": [{"id": "anillos", "n": ["Anillos", "Rings"], "em": "💍"}, {"id": "collares", "n": ["Collares", "Necklaces"], "em": "📿"},
                 {"id": "aretes", "n": ["Aretes", "Earrings"], "em": "💎"}, {"id": "relojes", "n": ["Relojes", "Watches"], "em": "⌚"},
                 {"id": "regalos", "n": ["Regalos", "Gifts"], "em": "🎁"}],
        "options": {"ring": {"l": ["Talla", "Ring size"], "v": ["5", "6", "7", "8", "9"], "def": 2},
                    "metal": {"l": ["Metal", "Metal"], "v": [["Plata 925", "925 silver"], ["Oro laminado", "Gold-plated"]], "def": 0}},
        "desc": {"anillos": ["Hecho a mano, con certificado de autenticidad.", "Handmade, with a certificate of authenticity."],
                 "collares": ["Cadena ajustable y cierre seguro.", "Adjustable chain and secure clasp."],
                 "aretes": ["Hipoalergénicos, cómodos para todo el día.", "Hypoallergenic and comfortable all day."],
                 "relojes": ["Maquinaria japonesa y un año de garantía.", "Japanese movement and a one-year warranty."],
                 "regalos": ["Llega en caja de regalo con tarjeta.", "Arrives in a gift box with a card."]},
        "products": [
            ["Anillo solitario", "Solitaire ring", "anillos", 48, {"em": "💍", "opt": "ring", "badge": "hot"}],
            ["Anillo de compromiso", "Engagement ring", "anillos", 120, {"em": "💍", "opt": "ring", "badge": "new"}],
            ["Collar de perlas", "Pearl necklace", "collares", 55, {"em": "📿", "opt": "metal"}],
            ["Cadena con dije", "Pendant chain", "collares", 32, {"em": "📿", "opt": "metal", "old": 40, "badge": "sale"}],
            ["Aretes de brillante", "Stud earrings", "aretes", 28, {"em": "💎", "opt": "metal"}],
            ["Argollas", "Hoop earrings", "aretes", 24, {"em": "💎", "opt": "metal"}],
            ["Reloj clásico", "Classic watch", "relojes", 89, {"em": "⌚"}],
            ["Reloj dorado", "Gold watch", "relojes", 135, {"em": "⌚", "stock": 0}],
            ["Set de regalo", "Gift set", "regalos", 65, {"em": "🎁", "badge": "new"}],
            ["Corona de novia", "Bridal tiara", "regalos", 75, {"em": "👑"}],
        ],
        "hero": {"layout": "split", "eyebrow": ["Colección Aurum", "The Aurum collection"], "title": ["Brillo que<br>se queda", "A shine<br>that stays"],
                 "lead": ["Joyas en plata 925 y oro laminado, listas para regalar.", "Jewelry in 925 silver and gold plate, ready to gift."], "cta2": {"t": ["Ver anillos", "See rings"], "cat": "anillos"},
                 "art": ["p1", "p2", "p6"]},
        "gridTitle": ["Piezas destacadas", "Featured pieces"],
        "perks": [["🎁", ["Listo para regalar", "Ready to gift"], ["Caja, tarjeta y lazo sin costo extra.", "Box, card and ribbon at no extra cost."]],
                  ["📜", ["Certificado", "Certified"], ["Cada pieza con su certificado de autenticidad.", "Every piece comes with a certificate."]],
                  ["💬", ["Asesoría personal", "Personal advice"], ["Te ayudamos con tallas y grabados por WhatsApp.", "Help with sizes and engraving on WhatsApp."]]],
        "quotes": [[["Le regalé el collar a mi mamá y quedó encantada.", "I gave my mom the necklace and she loved it."], "Fernando D. · Caracas"],
                   [["El anillo de compromiso es precioso. ¡Dijo que sí!", "The engagement ring is gorgeous. She said yes!"], "Miguel A. · Valencia"],
                   [["Excelente atención y el empaque es muy elegante.", "Excellent service and the packaging is so elegant."], "Sofía R. · Lechería"]],
        "about": ["Joyería fina en plata y oro laminado, con asesoría y empaque de regalo.", "Fine jewelry in silver and gold plate, with advice and gift wrapping."],
    },
    {
        "slug": "nido", "name": "Nido", "mark": "N", "sector": "home",
        "tagline": ["Hogar y decoración", "Home & decor"],
        "blurb": ["Serena y natural, para decoración, muebles y artículos del hogar.", "Calm and natural, for decor, furniture and homeware."],
        "fonts": "family=Inter:wght@400;600;700&family=DM+Serif+Display",
        "vars": {"bg": "#f5f3ee", "surface": "#ffffff", "soft": "#e8e4da", "text": "#2b2a26", "muted": "#77736a", "line": "rgba(43,42,38,.10)",
                 "accent": "#5f7a61", "accent-ink": "#ffffff", "accent-soft": "#e9ede4", "sale": "#b4532a", "r": "10px", "r-lg": "14px", "r-btn": "999px", "r-cat": "14px",
                 "font": "'Inter',sans-serif", "head": "'DM Serif Display',serif", "head-w": "400", "head-ls": "-0.01em", "art-ratio": "4 / 5"},
        "art": ["#dfe4d8", "#e9dccd", "#d9d4c7", "#ece4d6", "#d5dccf"],
        "annc": ["Envío gratis en muebles · Arma tu espacio con asesoría gratis", "Free shipping on furniture · Free styling advice"],
        "cats": [{"id": "sala", "n": ["Sala", "Living room"], "em": "🛋️", "a": "#dfe4d8"}, {"id": "cocina", "n": ["Cocina", "Kitchen"], "em": "🍳", "a": "#e9dccd"},
                 {"id": "deco", "n": ["Decoración", "Decor"], "em": "🖼️", "a": "#d9d4c7"}, {"id": "luz", "n": ["Iluminación", "Lighting"], "em": "💡", "a": "#ece4d6"},
                 {"id": "aromas", "n": ["Aromas", "Scents"], "em": "🕯️", "a": "#d5dccf"}],
        "options": {"color": {"l": ["Color", "Color"], "v": [["Arena", "Sand"], ["Salvia", "Sage"], ["Terracota", "Terracotta"]], "def": 0}},
        "desc": {"sala": ["Materiales nobles y diseño que dura.", "Quality materials and lasting design."], "cocina": ["Práctico y bonito para cocinar a diario.", "Practical and pretty for everyday cooking."],
                 "deco": ["El toque que hace tu casa tuya.", "The touch that makes your home yours."], "luz": ["Luz cálida que transforma cualquier rincón.", "Warm light that transforms any corner."],
                 "aromas": ["Cera natural y aroma que llena el espacio.", "Natural wax with a room-filling scent."]},
        "products": [
            ["Sofá de dos puestos", "Two-seater sofa", "sala", 420, {"em": "🛋️", "opt": "color", "badge": "new"}],
            ["Silla de madera", "Wooden chair", "sala", 85, {"em": "🪑"}],
            ["Juego de ollas", "Cookware set", "cocina", 64, {"em": "🍳", "old": 79, "badge": "sale"}],
            ["Vajilla de cerámica (16 pzas)", "Ceramic dinnerware (16 pcs)", "cocina", 48, {"em": "🍽️"}],
            ["Cuadro abstracto", "Abstract art print", "deco", 36, {"em": "🖼️"}],
            ["Espejo redondo", "Round mirror", "deco", 52, {"em": "🪞", "badge": "hot"}],
            ["Planta artificial", "Faux plant", "deco", 22, {"em": "🪴"}],
            ["Lámpara de mesa", "Table lamp", "luz", 39, {"em": "💡", "opt": "color"}],
            ["Velas aromáticas (3)", "Scented candles (3)", "aromas", 18, {"em": "🕯️", "badge": "hot"}],
            ["Cojines decorativos (2)", "Throw pillows (2)", "sala", 26, {"em": "🛏️", "opt": "color", "stock": 0}],
        ],
        "hero": {"layout": "editorial", "eyebrow": ["Hogar Nido", "Nido home"], "title": ["Espacios que<br>abrazan", "Spaces that<br>feel like home"],
                 "lead": ["Muebles y decoración con materiales naturales. Te asesoramos gratis.", "Furniture and decor in natural materials. Free styling advice."],
                 "cta2": {"t": ["Ver decoración", "See decor"], "cat": "deco"}, "art": ["p0", "p7"]},
        "gridTitle": ["Para tu casa", "For your home"],
        "perks": perks([["Envío gratis en muebles", "Free furniture delivery"], ["Lo llevamos e instalamos en tu casa.", "We deliver and set it up in your home."]]),
        "quotes": [[["El sofá es comodísimo y llegó armado.", "The sofa is so comfy and arrived assembled."], "Laura P. · Caracas"],
                   [["Me ayudaron a elegir colores para mi sala. Quedó hermosa.", "They helped me pick colors for my living room. It looks beautiful."], "Carmen Q. · San Cristóbal"],
                   [["Las velas huelen delicioso y duran mucho.", "The candles smell lovely and last ages."], "Isabel N. · Caracas"]],
        "about": ["Muebles, decoración y aromas para un hogar cálido y natural.", "Furniture, decor and scents for a warm, natural home."],
    },
    {
        "slug": "patitas", "name": "Patitas", "mark": "P", "sector": "pets",
        "tagline": ["Mascotas", "Pet supplies"],
        "blurb": ["Alegre y cercana, para pet shops, alimento y accesorios.", "Cheerful and friendly, for pet shops, food and accessories."],
        "fonts": "family=Nunito:wght@400;600;700;800&family=Baloo+2:wght@600;700;800",
        "vars": {"bg": "#fffdf5", "surface": "#ffffff", "soft": "#fff3c9", "text": "#2a2116", "muted": "#7c6f5b", "line": "rgba(42,33,22,.10)",
                 "accent": "#f59e0b", "accent-ink": "#2a2116", "accent-soft": "#fff3d6", "sale": "#e5484d", "r": "22px", "r-lg": "30px", "r-btn": "999px",
                 "font": "'Nunito',sans-serif", "head": "'Baloo 2',sans-serif", "head-w": "800", "head-ls": "-0.01em"},
        "art": ["#ffe8a8", "#d8f0e4", "#ffd9c7", "#dce8ff", "#f6e0ff"],
        "annc": ["🐾 Delivery gratis de alimento desde $35", "🐾 Free pet food delivery over $35"],
        "cats": [{"id": "perros", "n": ["Perros", "Dogs"], "em": "🐶", "a": "#ffe8a8"}, {"id": "gatos", "n": ["Gatos", "Cats"], "em": "🐱", "a": "#d8f0e4"},
                 {"id": "alimento", "n": ["Alimento", "Food"], "em": "🦴", "a": "#ffd9c7"}, {"id": "juguetes", "n": ["Juguetes", "Toys"], "em": "🎾", "a": "#dce8ff"},
                 {"id": "higiene", "n": ["Higiene", "Grooming"], "em": "🛁", "a": "#f6e0ff"}],
        "options": {"kg": {"l": ["Presentación", "Bag size"], "v": ["1 kg", "4 kg", "10 kg"], "def": 1},
                    "size": {"l": ["Talla", "Size"], "v": ["S", "M", "L"], "def": 1}},
        "desc": {"perros": ["Cómodo, resistente y fácil de lavar.", "Comfy, durable and easy to wash."], "gatos": ["Pensado para gatos curiosos.", "Made for curious cats."],
                 "alimento": ["Nutrición completa recomendada por veterinarios.", "Complete nutrition recommended by vets."],
                 "juguetes": ["Horas de diversión, materiales seguros.", "Hours of fun, safe materials."], "higiene": ["Limpio, suave y con olor rico.", "Clean, soft and smelling great."]},
        "products": [
            ["Alimento adulto perro", "Adult dog food", "alimento", 12, {"em": "🦴", "opt": "kg", "badge": "hot"}],
            ["Alimento gato", "Cat food", "alimento", 11, {"em": "🐟", "opt": "kg"}],
            ["Snacks dentales", "Dental treats", "alimento", 5, {"em": "🦴", "old": 6.5, "badge": "sale"}],
            ["Cama acolchada", "Cushioned bed", "perros", 29, {"em": "🛏️", "opt": "size"}],
            ["Collar y correa", "Collar and leash", "perros", 14, {"em": "🦮", "opt": "size"}],
            ["Rascador", "Scratching post", "gatos", 24, {"em": "🐱", "badge": "new"}],
            ["Arena para gatos", "Cat litter", "gatos", 8, {"em": "🪣"}],
            ["Pelota mordedora", "Chew ball", "juguetes", 6, {"em": "🎾"}],
            ["Cuerda de juego", "Rope toy", "juguetes", 7, {"em": "🧶"}],
            ["Champú suave", "Gentle shampoo", "higiene", 9, {"em": "🧴"}],
            ["Transportadora", "Pet carrier", "perros", 38, {"em": "🧳", "stock": 0}],
        ],
        "hero": {"layout": "split", "eyebrow": ["Pet shop", "Pet shop"], "title": ["Todo para<br>tu peludo", "Everything for<br>your best friend"],
                 "lead": ["Alimento, juguetes y accesorios con delivery a tu casa.", "Food, toys and accessories delivered to your home."], "cta2": {"t": ["Ver alimento", "See food"], "cat": "alimento"},
                 "art": ["p0", "p5", "p7"]},
        "gridTitle": ["Favoritos de la manada", "Pack favorites"],
        "perks": perks([["Delivery de alimento", "Food delivery"], ["Gratis desde $35. Te recordamos cuando se esté acabando.", "Free over $35. We remind you when you're running low."]]),
        "quotes": [[["Mi perrita ama la cama. Llegó el mismo día.", "My dog loves the bed. It arrived the same day."], "Gabriela L. · Caracas"],
                   [["Me avisan cuando se acaba el alimento. ¡Genial!", "They remind me when the food runs out. Great!"], "Jorge S. · Valencia"],
                   [["Buenos precios y atención con mucho cariño.", "Good prices and caring service."], "Natalia V. · Maracay"]],
        "about": ["Pet shop con alimento, juguetes y accesorios, y delivery a domicilio.", "Pet shop with food, toys and accessories, delivered home."],
    },
]

SECTORS = {
    "fashion": ["Moda", "Fashion"], "beauty": ["Belleza", "Beauty"], "electronics": ["Tecnología", "Electronics"], "food": ["Comida", "Food"],
    "grocery": ["Víveres", "Grocery"], "jewelry": ["Joyería", "Jewelry"], "home": ["Hogar", "Home"], "pets": ["Mascotas", "Pets"],
    "architecture": ["Arquitectura", "Architecture"], "realestate": ["Inmobiliaria", "Real estate"],
    "education": ["Educación", "Education"],
}
KINDS = [{"id": "store", "name": ["Tiendas en línea", "Online stores"]}, {"id": "website", "name": ["Sitios web", "Websites"]}, {"id": "app", "name": ["Apps móviles", "Mobile apps"]}]
STORE_PRODUCT = "tienda-online-whatsapp"

HEAD = """<!doctype html>
<html lang="es" translate="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="google" content="notranslate"><meta name="theme-color" content="{bg}">
<title>{name} · {kind} · Sylkit</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
"""
PAGES = {
    "store": HEAD + """<link rel="stylesheet" href="/_store/store.css"></head><body>
<script src="/_store/store.js"></script>
<script>SylStore.create({cfg});</script>
</body></html>
""",
    "website": HEAD + """<link rel="stylesheet" href="/_site/site.css"></head><body>
<script src="/_site/art.js"></script><script src="/_site/site.js"></script>
<script>SylSite.create({cfg});</script>
</body></html>
""",
    "app": HEAD + """<link rel="stylesheet" href="/_app/app.css"></head><body>
<script src="/_site/art.js"></script><script src="/_app/app.js"></script>
<script>SylApp.create({cfg});</script>
</body></html>
""",
}
KIND_LABEL = {"store": "Plantilla de tienda", "website": "Plantilla de sitio web", "app": "Plantilla de app"}

# Colors for the gallery card when a template has no product palette of its own.
def card_colors(v):
    return {"bg": v["bg"], "text": v["text"], "accent": v["accent"], "accentInk": v["accent-ink"], "soft": v["soft"]}


def main():
    from template_data_web_app import APP_TEMPLATES, WEB_TEMPLATES
    from template_data_figma import FIGMA_TEMPLATES

    for t in TEMPLATES:
        t.setdefault("kind", "store")
        t.setdefault("product", STORE_PRODUCT)
    listing = []
    for t in TEMPLATES + WEB_TEMPLATES + APP_TEMPLATES + FIGMA_TEMPLATES:
        kind = t["kind"]
        cfg = {k: v for k, v in t.items() if k not in ("sector", "blurb", "kind", "pair")}
        if kind == "store":
            cfg.setdefault("payments", PAY)
            cfg.setdefault("delivery", DELIVERY)
            cfg.setdefault("contact", CONTACT)
        if kind == "app":
            cfg["blurb"] = t["blurb"]
        out = ROOT / "public" / "preview" / t["slug"] / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        if not t.get("custom"):  # custom = hand-built preview page (see template_data_figma.py)
          out.write_text(PAGES[kind].format(bg=t["vars"]["bg"], name=t["name"], kind=KIND_LABEL[kind], desc=f'{t["name"]}: {t["blurb"][0]}',
                                          cfg=json.dumps(cfg, ensure_ascii=False, separators=(",", ":"))), encoding="utf-8")
        listing.append({
            "slug": t["slug"], "name": t["name"], "kind": kind, "product": t["product"], "pair": t.get("pair"),
            "sector": t["sector"], "sectorName": SECTORS[t["sector"]], "tagline": t["tagline"], "blurb": t["blurb"],
            "colors": card_colors(t["vars"]),
            **({"credit": t["credit"]} if t.get("credit") else {}),
        })
    ts = (
        "// Generated by scripts/build_store_templates.py. Edit the script, not this file.\n"
        "// Design templates for online stores, websites and mobile apps: original Sylkit designs, plus a few\n"
        "// adapted from free Figma Community files (CC BY 4.0) that carry a `credit` for the original designer.\n"
        "// Live previews at /preview/<slug>/; screenshots at /shots/templates/<slug>-desktop.webp and -phone.webp.\n\n"
        "export type TemplateKind = 'store' | 'website' | 'app';\n"
        "export type StoreTemplate = {\n"
        "  slug: string; name: string; kind: TemplateKind; product: string; pair: string | null;\n"
        "  sector: string; sectorName: [string, string]; tagline: [string, string]; blurb: [string, string];\n"
        "  colors: { bg: string; text: string; accent: string; accentInk: string; soft: string };\n"
        "  credit?: { author: string; url: string; work: string; source: string; license: string };\n"
        "};\n\n"
        f"export const storeTemplates: StoreTemplate[] = {json.dumps(listing, ensure_ascii=False, indent=2)};\n\n"
        f"export const templateKinds: {{ id: TemplateKind; name: [string, string] }}[] = {json.dumps(KINDS, ensure_ascii=False)};\n\n"
        f"export const templateSectors: {{ id: string; name: [string, string] }}[] = {json.dumps([{'id': k, 'name': v} for k, v in SECTORS.items()], ensure_ascii=False)};\n\n"
        f"export const STORE_PRODUCT = '{STORE_PRODUCT}';\n"
        "export const getTemplate = (slug?: string | null) => storeTemplates.find((t) => t.slug === slug);\n"
        "// Templates that can be picked for a product (online store, business website, mobile app).\n"
        "export const templatesFor = (product?: string | null) => storeTemplates.filter((t) => t.product === product);\n"
    )
    (ROOT / "src" / "data" / "storeTemplates.ts").write_text(ts, encoding="utf-8")
    print(f"Built {len(listing)} templates")


if __name__ == "__main__":
    main()
