"""Website and mobile app templates (architecture and real estate), used by build_store_templates.py.
Each website has a matching app with the same brand, so a client can buy both."""

WEB_PRODUCT = "sitio-web-para-negocios"
APP_PRODUCT = "app-movil-a-medida"

# ---------- Real estate (Habitat) ----------
HABITAT_VARS = {"bg": "#ffffff", "surface": "#ffffff", "soft": "#f2f5f4", "text": "#0f2a2e", "muted": "#5f7377", "line": "rgba(15,42,46,.10)",
                "accent": "#0f766e", "accent-ink": "#ffffff", "accent-soft": "#e6f4f1", "hero-bg": "#0b2a2c", "hero-ink": "#ffffff", "page": "#e8f0ee",
                "r": "14px", "r-lg": "20px", "r-btn": "12px", "font": "'Plus Jakarta Sans',sans-serif", "head": "'Plus Jakarta Sans',sans-serif", "head-w": "800", "head-ls": "-0.03em"}
HABITAT_FONTS = "family=Plus+Jakarta+Sans:wght@400;500;600;700;800"
HABITAT_PAL = {"sky1": "#dbeaf0", "sky2": "#f5efe6", "sun": "#f2b880", "ground": "#cfd9cf", "walls": ["#f6f3ee", "#e6dfd3", "#d5ccbd"],
               "accent": ["#1f3b3d", "#9b6a49", "#0f766e"], "glass": "#9cc3cf", "tree": "#5e8c6a"}
RE_TYPES = [{"id": "apto", "n": ["Apartamentos", "Apartments"]}, {"id": "casa", "n": ["Casas", "Houses"]},
            {"id": "oficina", "n": ["Oficinas", "Offices"]}, {"id": "local", "n": ["Locales", "Retail"]}]
RE_BADGES = {"new": ["Nuevo", "New"], "hot": ["Destacado", "Featured"], "drop": ["Rebajado", "Price drop"]}
RE_AGENTS = [["Carolina Méndez", ["Asesora inmobiliaria", "Real estate agent"], "👩🏽‍💼"], ["Andrés Pacheco", ["Asesor de ventas", "Sales agent"], "👨🏻‍💼"],
             ["Gabriela Torres", ["Alquileres", "Rentals"], "👩🏻‍💼"], ["Luis Herrera", ["Avalúos y legal", "Valuation & legal"], "👨🏾‍💼"]]
RE_ITEMS = [
    {"t": ["Apartamento con vista al Ávila", "Apartment with Ávila views"], "type": "apto", "op": "sale", "price": 98000, "city": "Caracas", "beds": 3, "baths": 2, "area": 120, "park": 2, "badge": "hot", "k": "tower", "s": 11,
     "d": ["Piso alto, cocina abierta, balcón y vigilancia 24 horas. A pasos del metro y de centros comerciales.", "High floor, open kitchen, balcony and 24-hour security. Steps from the metro and malls."],
     "feats": [["Balcón", "Balcony"], ["Planta eléctrica", "Backup power"], ["Tanque de agua", "Water tank"], ["Gimnasio", "Gym"]]},
    {"t": ["Casa familiar con jardín", "Family house with garden"], "type": "casa", "op": "sale", "price": 185000, "city": "Valencia", "beds": 4, "baths": 3, "area": 260, "park": 3, "badge": "new", "k": "house", "s": 14,
     "d": ["Casa de dos plantas en urbanización cerrada, jardín amplio, terraza techada y cuarto de servicio.", "Two-story house in a gated community, large garden, covered terrace and maid's room."],
     "feats": [["Jardín", "Garden"], ["Terraza", "Terrace"], ["Urbanización cerrada", "Gated community"], ["Pozo de agua", "Water well"]]},
    {"t": ["Penthouse frente al mar", "Beachfront penthouse"], "type": "apto", "op": "sale", "price": 240000, "city": "Lechería", "beds": 3, "baths": 3, "area": 210, "park": 2, "k": "modern", "s": 17,
     "d": ["Dos niveles, terraza con jacuzzi y vista directa al mar. Edificio con piscina y marina.", "Two levels, terrace with hot tub and direct sea views. Building with pool and marina."],
     "feats": [["Vista al mar", "Sea view"], ["Jacuzzi", "Hot tub"], ["Piscina", "Pool"], ["Marina", "Marina"]]},
    {"t": ["Casa moderna en El Hatillo", "Modern house in El Hatillo"], "type": "casa", "op": "sale", "price": 320000, "city": "Caracas", "beds": 4, "baths": 4, "area": 380, "park": 4, "badge": "drop", "k": "modern", "s": 23,
     "d": ["Diseño contemporáneo con ventanales, doble altura y piscina. Rodeada de verde y a 15 minutos de la ciudad.", "Contemporary design with large windows, double height and pool. Surrounded by green, 15 minutes from the city."],
     "feats": [["Piscina", "Pool"], ["Doble altura", "Double height"], ["Paneles solares", "Solar panels"], ["Estudio", "Study"]]},
    {"t": ["Apartamento amoblado", "Furnished apartment"], "type": "apto", "op": "rent", "price": 650, "city": "Caracas", "beds": 2, "baths": 2, "area": 85, "park": 1, "badge": "new", "k": "interior", "s": 29,
     "d": ["Listo para mudarse: amoblado, con línea blanca e internet. Contrato mínimo de 6 meses.", "Move-in ready: furnished, with appliances and internet. Minimum 6-month lease."],
     "feats": [["Amoblado", "Furnished"], ["Internet", "Internet"], ["Línea blanca", "Appliances"]]},
    {"t": ["Casa en alquiler con piscina", "House for rent with pool"], "type": "casa", "op": "rent", "price": 1400, "city": "Maracay", "beds": 3, "baths": 3, "area": 240, "park": 2, "k": "house", "s": 31,
     "d": ["Casa de una planta, piscina y parrillera. Ideal para familias, cerca de colegios.", "Single-story house with pool and grill. Ideal for families, near schools."],
     "feats": [["Piscina", "Pool"], ["Parrillera", "Grill"], ["Cerca de colegios", "Near schools"]]},
    {"t": ["Oficina en torre empresarial", "Office in business tower"], "type": "oficina", "op": "rent", "price": 900, "city": "Caracas", "area": 110, "park": 2, "badge": "hot", "k": "tower", "s": 37,
     "d": ["Planta libre, recepción, aire central y planta eléctrica. Edificio con seguridad y estacionamiento de visitantes.", "Open floor, reception, central air and backup power. Building with security and visitor parking."],
     "feats": [["Aire central", "Central air"], ["Planta eléctrica", "Backup power"], ["Recepción", "Reception"]]},
    {"t": ["Local comercial a pie de calle", "Street-level retail space"], "type": "local", "op": "rent", "price": 1100, "city": "Valencia", "area": 140, "park": 0, "k": "modern", "s": 41,
     "d": ["Vitrina amplia en avenida de alto tráfico. Baño, depósito y santamaría eléctrica.", "Large storefront on a high-traffic avenue. Restroom, storage and electric shutter."],
     "feats": [["Alto tráfico", "High traffic"], ["Depósito", "Storage"], ["Vitrina", "Storefront"]]},
    {"t": ["Apartamento para estrenar", "Brand-new apartment"], "type": "apto", "op": "sale", "price": 72000, "city": "Mérida", "beds": 2, "baths": 2, "area": 78, "park": 1, "k": "tower", "s": 43,
     "d": ["Edificio nuevo con vista a la montaña, acabados de primera y áreas verdes.", "New building with mountain views, quality finishes and green areas."],
     "feats": [["Vista a la montaña", "Mountain view"], ["Áreas verdes", "Green areas"], ["Para estrenar", "Brand new"]]},
    {"t": ["Local en centro comercial", "Mall retail unit"], "type": "local", "op": "sale", "price": 65000, "city": "Lechería", "area": 60, "park": 0, "k": "interior", "s": 47,
     "d": ["Local en pasillo principal, ideal para tienda o café. Aire acondicionado y alto flujo de visitantes.", "Unit on the main aisle, ideal for a shop or café. Air conditioning and high foot traffic."],
     "feats": [["Pasillo principal", "Main aisle"], ["Aire acondicionado", "Air conditioning"]]},
]
RE_QUOTES = [[["Vendimos nuestro apartamento en tres semanas. Muy profesionales.", "We sold our apartment in three weeks. Very professional."], "Familia Rojas · Caracas"],
             [["Encontré mi oficina sin perder tiempo en visitas inútiles.", "I found my office without wasting time on pointless visits."], "Rafael M. · Valencia"],
             [["Nos acompañaron en todo el papeleo legal.", "They guided us through all the legal paperwork."], "Ana y José · Lechería"]]
RE_CONTACT_LINES = ["Av. Francisco de Miranda, Caracas", "+58 412 000 0000", "hola@habitat.com"]

# ---------- Architecture (Plano) ----------
PLANO_VARS = {"bg": "#f4f2ee", "surface": "#fbfaf7", "soft": "#e9e5de", "text": "#161514", "muted": "#6d6862", "line": "rgba(22,21,20,.12)",
              "accent": "#c2552d", "accent-ink": "#ffffff", "accent-soft": "#ebe5dc", "hero-bg": "#161514", "hero-ink": "#f4f2ee", "page": "#e7e3dc",
              "r": "3px", "r-lg": "6px", "r-btn": "3px", "font": "'Inter',sans-serif", "head": "'Space Grotesk',sans-serif", "head-w": "600", "head-ls": "-0.04em"}
PLANO_FONTS = "family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700"
PLANO_PAL = {"sky1": "#e8e6e1", "sky2": "#f4f2ee", "sun": "#d9825b", "ground": "#d6d0c6", "walls": ["#f4f1ea", "#e2ddd3", "#c9c2b6"],
             "accent": ["#1d1c1a", "#8e6448", "#c2552d"], "glass": "#a9b9bf", "tree": "#7d8b70"}
AR_TYPES = [{"id": "residencial", "n": ["Residencial", "Residential"]}, {"id": "comercial", "n": ["Comercial", "Commercial"]},
            {"id": "interiores", "n": ["Interiores", "Interiors"]}, {"id": "remodelacion", "n": ["Remodelación", "Renovation"]}]
SVC = {"arq": ["Arquitectura", "Architecture"], "int": ["Interiorismo", "Interior design"], "obra": ["Dirección de obra", "Construction management"],
       "3d": ["Render 3D", "3D renders"], "perm": ["Permisos", "Permits"], "pais": ["Paisajismo", "Landscaping"]}
AR_ITEMS = [
    {"t": ["Casa Altamira", "Altamira House"], "type": "residencial", "city": "Caracas", "year": 2025, "area": 320, "k": "modern", "s": 5, "svc": [SVC["arq"], SVC["int"], SVC["obra"]],
     "d": ["Vivienda unifamiliar en ladera: volúmenes escalonados que miran al Ávila, patio central y mucha luz natural.", "Hillside family home: stepped volumes facing the Ávila, a central courtyard and plenty of daylight."],
     "feats": [["Patio central", "Central courtyard"], ["Ventilación cruzada", "Cross ventilation"], ["Madera local", "Local timber"]]},
    {"t": ["Torre Mirador", "Mirador Tower"], "type": "comercial", "city": "Valencia", "year": 2024, "area": 4800, "k": "tower", "s": 8, "svc": [SVC["arq"], SVC["perm"], SVC["obra"]],
     "d": ["Edificio de oficinas de 12 pisos con fachada de vidrio de control solar y planta baja comercial.", "12-story office building with a solar-control glass facade and retail on the ground floor."],
     "feats": [["Fachada eficiente", "Efficient facade"], ["Planta libre", "Open floors"], ["Terraza verde", "Green roof"]]},
    {"t": ["Loft La Castellana", "La Castellana Loft"], "type": "interiores", "city": "Caracas", "year": 2024, "area": 140, "k": "interior", "s": 13, "svc": [SVC["int"], SVC["3d"]],
     "d": ["Interiorismo cálido para un loft de doble altura: madera, tonos tierra y muebles a medida.", "Warm interior design for a double-height loft: timber, earthy tones and custom furniture."],
     "feats": [["Muebles a medida", "Custom furniture"], ["Iluminación cálida", "Warm lighting"]]},
    {"t": ["Casa del Lago", "Lake House"], "type": "residencial", "city": "Mérida", "year": 2023, "area": 410, "k": "house", "s": 19, "svc": [SVC["arq"], SVC["pais"], SVC["obra"]],
     "d": ["Casa de montaña con techos inclinados, chimenea central y grandes ventanales hacia el lago.", "Mountain home with pitched roofs, a central fireplace and large windows facing the lake."],
     "feats": [["Chimenea", "Fireplace"], ["Paisajismo nativo", "Native landscaping"], ["Vista al lago", "Lake view"]]},
    {"t": ["Oficinas Brisa", "Brisa Offices"], "type": "comercial", "city": "Lechería", "year": 2025, "area": 900, "k": "modern", "s": 22, "svc": [SVC["arq"], SVC["int"]],
     "d": ["Sede corporativa junto al mar con terrazas de trabajo, celosías de madera y patio de árboles.", "Seaside headquarters with work terraces, timber screens and a tree courtyard."],
     "feats": [["Celosías", "Timber screens"], ["Terrazas", "Terraces"], ["Ahorro energético", "Energy saving"]]},
    {"t": ["Remodelación Los Palos Grandes", "Los Palos Grandes Renovation"], "type": "remodelacion", "city": "Caracas", "year": 2023, "area": 180, "k": "interior", "s": 26, "svc": [SVC["int"], SVC["obra"]],
     "d": ["Apartamento de los años 70 transformado: cocina abierta, baños nuevos y pisos de madera.", "A 1970s apartment transformed: open kitchen, new bathrooms and wood floors."],
     "feats": [["Cocina abierta", "Open kitchen"], ["Baños nuevos", "New bathrooms"]]},
    {"t": ["Casa Patio", "Patio House"], "type": "residencial", "city": "Maracay", "year": 2022, "area": 260, "k": "modern", "s": 33, "svc": [SVC["arq"], SVC["3d"], SVC["perm"]],
     "d": ["Casa de una planta organizada alrededor de un patio con árbol de mango y piscina estrecha.", "Single-story house organized around a courtyard with a mango tree and a lap pool."],
     "feats": [["Patio con árbol", "Tree courtyard"], ["Piscina", "Pool"]]},
    {"t": ["Café Origen", "Origen Café"], "type": "interiores", "city": "Caracas", "year": 2024, "area": 95, "k": "interior", "s": 39, "svc": [SVC["int"], SVC["3d"]],
     "d": ["Cafetería de especialidad con barra de terrazo, plantas y luz cálida para quedarse.", "Specialty café with a terrazzo bar, plants and warm light that invites you to stay."],
     "feats": [["Terrazo", "Terrazzo"], ["Mobiliario a medida", "Custom furniture"]]},
]
AR_SERVICES = [["📐", SVC["arq"], ["Casas, edificios y locales desde la idea hasta los planos finales.", "Homes, buildings and shops from idea to final drawings."]],
               ["🛋️", SVC["int"], ["Espacios cálidos y funcionales, con muebles a medida.", "Warm, functional spaces with custom furniture."]],
               ["🏗️", SVC["obra"], ["Supervisamos tu obra para que se construya como se diseñó.", "We supervise your build so it matches the design."]],
               ["🧊", SVC["3d"], ["Mira tu proyecto terminado antes de construirlo.", "See your project finished before it's built."]],
               ["📋", SVC["perm"], ["Gestionamos permisos y trámites con la alcaldía.", "We handle permits and paperwork with the city."]],
               ["🌿", SVC["pais"], ["Jardines y exteriores con plantas nativas.", "Gardens and outdoor spaces with native plants."]]]
AR_TEAM = [["Valeria Ruiz", ["Arquitecta, socia fundadora", "Architect, founding partner"], "👩🏻‍🎨"], ["Diego Salas", ["Arquitecto, director de obra", "Architect, site director"], "👷🏽‍♂️"],
           ["Mónica Ibarra", ["Interiorista", "Interior designer"], "👩🏾‍🎨"], ["Tomás León", ["Visualización 3D", "3D visualization"], "🧑🏻‍💻"]]

APP_FEATS_RE = [["Búsqueda con filtros de compra y alquiler", "Search with buy and rent filters"], ["Favoritos guardados en el teléfono", "Favorites saved on the phone"],
                ["Agenda de visitas con día y hora", "Visit booking with day and time"], ["Contacto directo con el asesor por WhatsApp", "Direct WhatsApp contact with the agent"],
                ["Para iPhone y Android", "For iPhone and Android"]]
APP_FEATS_AR = [["Portafolio de proyectos con filtros", "Project portfolio with filters"], ["Cotizador paso a paso", "Step-by-step quote builder"],
                ["Seguimiento de obra: etapas, novedades y pagos", "Build tracking: phases, updates and payments"], ["Solicitudes directo a tu WhatsApp", "Requests straight to your WhatsApp"],
                ["Para iPhone y Android", "For iPhone and Android"]]

WEB_TEMPLATES = [
    {
        "slug": "plano", "name": "Plano", "mark": "P", "kind": "website", "sector": "architecture", "product": WEB_PRODUCT, "pair": "plano-app", "mode": "architecture",
        "tagline": ["Estudio de arquitectura", "Architecture studio"],
        "blurb": ["Sobria y editorial, para estudios de arquitectura, interiorismo y constructoras.", "Clean and editorial, for architecture, interior design and construction firms."],
        "fonts": PLANO_FONTS, "vars": PLANO_VARS, "pal": PLANO_PAL, "types": AR_TYPES, "items": AR_ITEMS, "codePrefix": "PR",
        "nav": [["work", ["Proyectos", "Work"]], ["services", ["Servicios", "Services"]], ["process", ["Proceso", "Process"]], ["studio", ["Estudio", "Studio"]], ["contact", ["Contacto", "Contact"]]],
        "navTitle": ["Estudio", "Studio"], "cta": ["Agendar consulta", "Book a consultation"],
        "hero": {"layout": "statement", "kick": ["Arquitectura · Interiorismo · Obra", "Architecture · Interiors · Build"], "title": ["Espacios<br>que se viven.", "Spaces<br>made to be lived in."],
                 "lead": ["Diseñamos casas, oficinas e interiores con luz, materiales honestos y cuidado en cada detalle.", "We design homes, offices and interiors with light, honest materials and care in every detail."],
                 "cta": ["Ver proyectos", "See our work"], "cta2": ["Hablemos de tu proyecto", "Let's talk about your project"], "art": {"k": "modern", "s": 3}},
        "itemsTitle": ["Proyectos seleccionados", "Selected work"], "itemsLead": ["Una muestra de lo que hemos construido en los últimos años.", "A selection of what we've built in recent years."],
        "stats": [["12", ["años de experiencia", "years of experience"]], ["140+", ["proyectos entregados", "projects delivered"]], ["38.000", ["m² construidos", "m² built"]], ["4,9 ★", ["satisfacción de clientes", "client rating"]]],
        "servicesTitle": ["Servicios", "Services"], "servicesLead": ["Te acompañamos desde el primer boceto hasta la entrega de llaves.", "We're with you from the first sketch to handing over the keys."], "services": AR_SERVICES,
        "processTitle": ["Cómo trabajamos", "How we work"],
        "process": [[["Consulta", "Consultation"], ["Escuchamos tu idea, tu terreno y tu presupuesto.", "We listen to your idea, site and budget."]],
                    [["Anteproyecto", "Concept"], ["Bocetos, plantas y renders para decidir juntos.", "Sketches, plans and renders to decide together."]],
                    [["Proyecto", "Design"], ["Planos completos, permisos y presupuesto de obra.", "Full drawings, permits and construction budget."]],
                    [["Obra", "Build"], ["Dirección de obra hasta la entrega.", "Construction management through handover."]]],
        "teamTitle": ["El estudio", "The studio"], "teamLead": ["Un equipo pequeño que cuida cada proyecto como propio.", "A small team that treats every project as its own."], "team": AR_TEAM,
        "quotesTitle": ["Clientes", "Clients"],
        "quotes": [[["Entendieron exactamente cómo queríamos vivir. La casa es mejor de lo que imaginamos.", "They understood exactly how we wanted to live. The house is better than we imagined."], "Familia Rodríguez · Casa Altamira"],
                   [["Cumplieron el presupuesto y los tiempos de la obra. Muy recomendados.", "They kept to the budget and the schedule. Highly recommended."], "Grupo Brisa · Oficinas"],
                   [["Nuestro café ahora es el lugar donde todos quieren quedarse.", "Our café is now the place everyone wants to stay."], "Café Origen"]],
        "contact": {"title": ["Hablemos de tu proyecto", "Let's talk about your project"], "lead": ["Cuéntanos qué quieres construir y te respondemos en 24 horas.", "Tell us what you want to build and we'll reply within 24 hours."],
                    "lines": ["Av. Luis Roche, Altamira, Caracas", "+58 412 000 0000", "estudio@plano.com"],
                    "fields": [{"l": ["Tipo de proyecto", "Project type"], "v": [["Casa nueva", "New house"], ["Remodelación", "Renovation"], ["Interiorismo", "Interior design"], ["Local u oficina", "Shop or office"]]},
                               {"l": ["Presupuesto aproximado", "Approximate budget"], "v": [["Hasta $10.000", "Up to $10,000"], ["$10.000 a $50.000", "$10,000 to $50,000"], ["$50.000 a $150.000", "$50,000 to $150,000"], ["Más de $150.000", "Over $150,000"]]}]},
        "about": ["Estudio de arquitectura e interiorismo en Caracas. Diseñamos y construimos espacios para vivir mejor.", "Architecture and interior design studio in Caracas. We design and build spaces for better living."],
    },
    {
        "slug": "habitat", "name": "Habitat", "mark": "H", "kind": "website", "sector": "realestate", "product": WEB_PRODUCT, "pair": "habitat-app", "mode": "realestate",
        "tagline": ["Inmobiliaria", "Real estate agency"],
        "blurb": ["Clara y confiable, para inmobiliarias y asesores: buscador, fichas y visitas por WhatsApp.", "Clear and trustworthy, for agencies and agents: search, listings and WhatsApp visits."],
        "fonts": HABITAT_FONTS, "vars": HABITAT_VARS, "pal": HABITAT_PAL, "types": RE_TYPES, "items": RE_ITEMS, "badges": RE_BADGES, "codePrefix": "H",
        "searchHint": ["Zona o palabra clave", "Area or keyword"],
        "nav": [["listings", ["Propiedades", "Properties"]], ["services", ["Servicios", "Services"]], ["agents", ["Asesores", "Agents"]], ["contact", ["Contacto", "Contact"]]],
        "navTitle": ["Inmobiliaria", "Agency"], "cta": ["Vender mi inmueble", "Sell my property"],
        "hero": {"layout": "search", "kick": ["Compra · Alquiler · Venta", "Buy · Rent · Sell"], "title": ["Encuentra el lugar<br>donde empieza todo.", "Find the place<br>where it all begins."],
                 "lead": ["Casas, apartamentos, oficinas y locales verificados, con asesoría de principio a fin.", "Verified houses, apartments, offices and retail, with guidance from start to finish."], "art": {"k": "house", "s": 9}},
        "itemsTitle": ["Propiedades disponibles", "Available properties"], "itemsLead": ["Inmuebles verificados por nuestro equipo, con fotos y precios reales.", "Properties verified by our team, with real photos and prices."],
        "stats": [["350+", ["inmuebles vendidos", "properties sold"]], ["15", ["años en el mercado", "years in the market"]], ["6", ["ciudades", "cities"]], ["24 h", ["respuesta garantizada", "guaranteed reply"]]],
        "servicesTitle": ["Te ayudamos a", "We help you"], "services": [
            ["🏷️", ["Vender tu inmueble", "Sell your property"], ["Fotos profesionales, publicación y filtro de compradores serios.", "Professional photos, listing and screening of serious buyers."]],
            ["🔑", ["Alquilar sin estrés", "Rent stress-free"], ["Buscamos inquilinos verificados y preparamos el contrato.", "We find verified tenants and prepare the lease."]],
            ["📊", ["Saber cuánto vale", "Know what it's worth"], ["Avalúo con precios reales de la zona.", "Valuation using real local prices."]],
            ["⚖️", ["Papeleo legal", "Legal paperwork"], ["Documentos, registro y notaría con abogados aliados.", "Documents, registry and notary with partner lawyers."]],
            ["🏦", ["Financiamiento", "Financing"], ["Te orientamos con créditos y formas de pago.", "Guidance on loans and payment options."]],
            ["📍", ["Encontrar tu zona", "Find your area"], ["Te mostramos lo mejor de cada sector según tu estilo de vida.", "We show you the best of each area for your lifestyle."]]],
        "teamTitle": ["Nuestros asesores", "Our agents"], "teamLead": ["Personas reales que te acompañan en cada visita.", "Real people who go with you to every visit."], "team": RE_AGENTS,
        "quotesTitle": ["Clientes felices", "Happy clients"], "quotes": RE_QUOTES,
        "contact": {"title": ["¿Quieres vender o alquilar?", "Want to sell or rent?"], "lead": ["Déjanos tus datos y un asesor te contacta hoy mismo.", "Leave your details and an agent will contact you today."],
                    "lines": RE_CONTACT_LINES,
                    "fields": [{"l": ["Quiero", "I want to"], "v": [["Vender", "Sell"], ["Alquilar mi inmueble", "Rent out my property"], ["Comprar", "Buy"], ["Alquilar para vivir", "Rent a home"]]},
                               {"l": ["Tipo de inmueble", "Property type"], "v": [["Apartamento", "Apartment"], ["Casa", "House"], ["Oficina", "Office"], ["Local", "Retail"]]}]},
        "about": ["Inmobiliaria con asesores certificados: compra, venta y alquiler de inmuebles verificados.", "Agency with certified agents: buying, selling and renting verified properties."],
    },
]

APP_TEMPLATES = [
    {
        "slug": "habitat-app", "name": "Habitat", "mark": "H", "kind": "app", "sector": "realestate", "product": APP_PRODUCT, "pair": "habitat", "mode": "realestate",
        "tagline": ["App inmobiliaria", "Real estate app"],
        "blurb": ["Tu inmobiliaria en el teléfono de tus clientes: buscan, guardan favoritos y agendan visitas.", "Your agency on your clients' phones: they search, save favorites and book visits."],
        "fonts": HABITAT_FONTS, "vars": HABITAT_VARS, "pal": HABITAT_PAL, "types": RE_TYPES, "items": RE_ITEMS, "badges": RE_BADGES, "agents": RE_AGENTS,
        "greeting": ["Hola, María 👋", "Hi, María 👋"], "headline": ["Encuentra tu hogar ideal", "Find your ideal home"], "userEmoji": "👩🏽", "features": APP_FEATS_RE,
    },
    {
        "slug": "plano-app", "name": "Plano", "mark": "P", "kind": "app", "sector": "architecture", "product": APP_PRODUCT, "pair": "plano", "mode": "architecture",
        "tagline": ["App de arquitectura y obra", "Architecture & build app"],
        "blurb": ["Para estudios y constructoras: portafolio, cotizador y seguimiento de obra para tus clientes.", "For studios and builders: portfolio, quote builder and build tracking for your clients."],
        "fonts": PLANO_FONTS, "vars": PLANO_VARS, "pal": PLANO_PAL, "types": AR_TYPES, "items": AR_ITEMS, "features": APP_FEATS_AR,
        "greeting": ["Estudio de arquitectura", "Architecture studio"],
        "hero": {"title": ["Diseñamos espacios para vivir mejor", "We design spaces for better living"], "lead": ["Cotiza tu proyecto en 2 minutos.", "Get a quote for your project in 2 minutes."], "k": "modern", "s": 3},
        "services": [["🏡", ["Casa nueva", "New house"], ["Del boceto a la obra", "From sketch to build"]], ["🔨", ["Remodelación", "Renovation"], ["Renueva tu espacio", "Refresh your space"]],
                     ["🛋️", ["Interiorismo", "Interior design"], ["Muebles a medida", "Custom furniture"]], ["🏢", ["Locales y oficinas", "Shops & offices"], ["Espacios que venden", "Spaces that sell"]]],
        "quote": [
            {"id": "type", "q": ["¿Qué quieres construir?", "What do you want to build?"], "short": ["Proyecto", "Project"],
             "opts": [["🏡", ["Casa nueva", "New house"], "residencial"], ["🔨", ["Remodelación", "Renovation"], "remodelacion"], ["🛋️", ["Interiorismo", "Interior design"], "interiores"], ["🏢", ["Local u oficina", "Shop or office"], "comercial"]]},
            {"id": "area", "q": ["¿Qué tamaño tiene?", "How big is it?"], "short": ["Área", "Area"],
             "opts": [["📏", ["Menos de 80 m²", "Under 80 m²"]], ["📐", ["80 a 150 m²", "80 to 150 m²"]], ["🏠", ["150 a 300 m²", "150 to 300 m²"]], ["🏰", ["Más de 300 m²", "Over 300 m²"]]]},
            {"id": "budget", "q": ["¿Cuál es tu presupuesto?", "What's your budget?"], "short": ["Presupuesto", "Budget"],
             "opts": [["💵", ["Hasta $10.000", "Up to $10,000"]], ["💰", ["$10.000 a $50.000", "$10,000 to $50,000"]], ["🏦", ["$50.000 a $150.000", "$50,000 to $150,000"]], ["💎", ["Más de $150.000", "Over $150,000"]]]},
            {"id": "when", "q": ["¿Cuándo quieres empezar?", "When do you want to start?"], "short": ["Inicio", "Start"],
             "opts": [["⚡", ["Lo antes posible", "As soon as possible"]], ["📅", ["En 1 a 3 meses", "In 1 to 3 months"]], ["🗓️", ["En 3 a 6 meses", "In 3 to 6 months"]], ["🤔", ["Solo estoy explorando", "Just exploring"]]]},
        ],
        "obra": {"name": ["Casa Rodríguez", "Rodríguez House"], "address": "El Hatillo, Caracas", "progress": 62, "k": "house", "s": 21,
                 "nextVisit": ["Jueves 6 de noviembre, 9:00 am", "Thursday, November 6, 9:00 am"],
                 "phases": [[["Diseño y planos", "Design & drawings"], ["Completado · ago 2026", "Done · Aug 2026"], "done"], [["Permisos", "Permits"], ["Completado · sep 2026", "Done · Sep 2026"], "done"],
                            [["Estructura", "Structure"], ["En curso · 70%", "In progress · 70%"], "now"], [["Acabados", "Finishes"], ["Desde dic 2026", "From Dec 2026"], ""], [["Entrega", "Handover"], ["Febrero 2027", "February 2027"], ""]],
                 "updates": [[["Vaciado de la losa del segundo piso", "Second-floor slab poured"], ["Hace 2 días", "2 days ago"], "house", 23], [["Llegaron las ventanas de aluminio", "Aluminum windows delivered"], ["Hace 1 semana", "1 week ago"], "modern", 25],
                             [["Aprobada la paleta de colores", "Color palette approved"], ["Hace 2 semanas", "2 weeks ago"], "interior", 27]],
                 "payments": [[["Anticipo (30%)", "Deposit (30%)"], 18000, "paid"], [["Avance de estructura", "Structure milestone"], 15000, "paid"], [["Acabados", "Finishes"], 15000, "due"], [["Entrega", "Handover"], 12000, "due"]]},
    },
]
