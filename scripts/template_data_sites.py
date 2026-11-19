"""Professional & organization website templates (engine public/_web/web.js), ordered by demand:
the first ones are what most clients ask for. Real photos only (picks "query:index", see
scripts/template_photos.py). Built into public/preview/<slug>/ by build_store_templates.py."""


def E(en, es):
    return {'en': en, 'es': es}


PERSONAL = 'sitio-web-personal'
BUSINESS = 'sitio-web-para-negocios'
FONT = 'family=Inter:wght@400;500;600;700;800'
SERIF = 'family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700'

SECTORS = {
    'legal': ['Legal', 'Legal'], 'health': ['Salud', 'Health'], 'finance': ['Contabilidad', 'Accounting'], 'consulting': ['Consultoría', 'Consulting'],
    'tech': ['Tecnología', 'Technology'], 'trades': ['Oficios', 'Trades'], 'corporate': ['Empresas', 'Companies'], 'nonprofit': ['ONG', 'Nonprofit'],
    'community': ['Clubes', 'Clubs'], 'government': ['Gobierno', 'Government'], 'sports': ['Deportes', 'Sports'], 'music': ['Música', 'Music'],
    'creative': ['Creativos', 'Creatives'], 'faith': ['Iglesias', 'Churches'], 'fitness': ['Fitness', 'Fitness'],
}


def contact(lines, topics=None, title=E('Talk to us', 'Hablemos'), lead=None, button=None):
    s = {'type': 'contact', 'title': title, 'lines': lines}
    if lead: s['lead'] = lead
    if topics: s['topics'] = topics
    if button: s['button'] = button
    return s


CCS = ['pin', E('Av. Francisco de Miranda, Caracas', 'Av. Francisco de Miranda, Caracas')]
PHONE = ['phone', E('+58 412 000 0000 · WhatsApp', '+58 412 000 0000 · WhatsApp')]
HOURS = ['clock', E('Mon–Fri 8:00–18:00 · Sat 9:00–13:00', 'Lun–Vie 8:00–18:00 · Sáb 9:00–13:00')]

SITES = [
    # 1 ---------------------------------------------------------------- Law firm
    dict(slug='lex', name='Ávila & Rojas', mark='ÁR', product=BUSINESS, sector='legal',
         tagline=['Bufete de abogados', 'Law firm'], blurb=['Serio y elegante, para bufetes y abogados independientes.', 'Serious and elegant, for law firms and independent lawyers.'],
         vars={'bg': '#ffffff', 'text': '#111827', 'accent': '#7c2d12', 'accent-ink': '#ffffff', 'soft': '#f6f3ef'},
         theme={'accent': '#8a3b1c', 'soft': '#f6f3ef', 'fonts': SERIF, 'head': "'Playfair Display',serif", 'headW': '700', 'ls': '-0.01em', 'r': '6px', 'rBtn': '4px'},
         photos={'hero': 'law-office:0', 'about': 'law-office:11', 'p1': 'lawyer:3', 'p2': 'lawyer:13', 'p3': 'lawyer:6', 'p4': 'lawyer:14', 'docs': 'legal-docs:6',
                 's1': 'legal-docs:0', 's2': 'legal-docs:4', 's3': 'law-office:5', 'band': 'law-office:2'},
         cfg=dict(nav=[['practice', E('Practice areas', 'Áreas')], ['team', E('Lawyers', 'Abogados')], ['contact', E('Contact', 'Contacto')]],
                  navCta={'t': E('Book a consultation', 'Agendar consulta')},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Corporate · Civil · Labor · Family', 'Mercantil · Civil · Laboral · Familia'),
                       'title': E('Clear legal advice that protects what you built', 'Asesoría legal clara que protege lo que construiste'),
                       'lead': E('Twenty years defending companies and families in Venezuela. First consultation in 48 hours.', 'Veinte años defendiendo empresas y familias en Venezuela. Primera consulta en 48 horas.'),
                       'cta': {'t': E('Book a consultation', 'Agendar consulta')}, 'cta2': {'t': E('Practice areas', 'Áreas de práctica'), 'href': '#practice'},
                       'badges': [['shield', E('Strict confidentiality', 'Confidencialidad total')], ['award', E('20+ years', '20+ años')], ['globe', E('English & Spanish', 'Español e inglés')]]},
                      {'type': 'stats', 'items': [['1,200+', E('Cases closed', 'Casos cerrados')], ['20', E('Years of practice', 'Años de ejercicio')], ['94%', E('Favorable outcomes', 'Resultados favorables')], ['48 h', E('First answer', 'Primera respuesta')]]},
                      {'type': 'cards', 'id': 'practice', 'eyebrow': E('Practice areas', 'Áreas de práctica'), 'title': E('We handle it from start to finish', 'Lo llevamos de principio a fin'),
                       'items': [{'photo': 's1', 'title': E('Corporate & contracts', 'Mercantil y contratos'), 'text': E('Company setup, shareholder agreements, contracts and compliance.', 'Constitución de empresas, actas, contratos y cumplimiento.')},
                                 {'photo': 's2', 'title': E('Labor law', 'Derecho laboral'), 'text': E('Hiring, dismissals, labor inspections and settlements.', 'Contrataciones, despidos, inspectorías y liquidaciones.')},
                                 {'photo': 'docs', 'title': E('Real estate & notary', 'Inmobiliario y notaría'), 'text': E('Purchase, sale, leases and title checks.', 'Compraventa, arrendamientos y revisión de documentos.')},
                                 {'photo': 's3', 'title': E('Family & succession', 'Familia y sucesiones'), 'text': E('Divorce, custody, wills and inheritances.', 'Divorcios, custodia, testamentos y herencias.')}]},
                      {'type': 'about', 'photo': 'about', 'eyebrow': E('Our firm', 'El bufete'), 'title': E('Partners who answer the phone', 'Socios que contestan el teléfono'),
                       'text': E('Every case is led by a partner, with a written plan, clear fees and updates every week.', 'Cada caso lo dirige un socio, con un plan escrito, honorarios claros y avances cada semana.'),
                       'points': [E('Fixed fees agreed in writing', 'Honorarios fijos por escrito'), E('Online case tracking for clients', 'Seguimiento del caso en línea'), E('Offices in Caracas and Valencia', 'Oficinas en Caracas y Valencia')]},
                      {'type': 'team', 'alt': True, 'eyebrow': E('Lawyers', 'Abogados'), 'title': E('The team behind your case', 'El equipo detrás de tu caso'),
                       'people': [{'name': 'Andrés Ávila', 'role': E('Managing partner · Corporate', 'Socio director · Mercantil'), 'photo': 'p1'}, {'name': 'Mariana Rojas', 'role': E('Partner · Labor', 'Socia · Laboral'), 'photo': 'p2'},
                                  {'name': 'Daniel Pérez', 'role': E('Associate · Real estate', 'Asociado · Inmobiliario'), 'photo': 'p3'}, {'name': 'Laura Méndez', 'role': E('Associate · Family', 'Asociada · Familia'), 'photo': 'p4'}]},
                      {'type': 'quotes', 'title': E('What clients say', 'Lo que dicen los clientes'), 'items': [[E('They solved a labor claim we had been fighting for two years.', 'Resolvieron un reclamo laboral que llevábamos dos años peleando.'), 'Distribuidora Andina'], [E('Clear, fast and always available on WhatsApp.', 'Claros, rápidos y siempre disponibles por WhatsApp.'), 'Carolina G.'], [E('Our company setup was done in two weeks.', 'Constituimos la empresa en dos semanas.'), 'Grupo Norte']]},
                      contact([CCS, PHONE, HOURS], topics=[E('Corporate', 'Mercantil'), E('Labor', 'Laboral'), E('Real estate', 'Inmobiliario'), E('Family', 'Familia')], title=E('Book a consultation', 'Agenda una consulta'))],
                  footer=E('Attorneys at law · Caracas', 'Abogados · Caracas'))),

    # 2 ---------------------------------------------------------------- Doctor / medical practice
    dict(slug='vital', name='Dra. Sofía Marín', mark='SM', product=PERSONAL, sector='health',
         tagline=['Consultorio médico', 'Doctor & medical practice'], blurb=['Cercano y confiable, para médicos, especialistas y consultorios.', 'Warm and trustworthy, for doctors, specialists and practices.'],
         vars={'bg': '#ffffff', 'text': '#0f172a', 'accent': '#0e7490', 'accent-ink': '#ffffff', 'soft': '#ecf8fb'},
         theme={'accent': '#0e7490', 'soft': '#ecf8fb', 'fonts': FONT, 'r': '16px'},
         photos={'hero': 'doctor:1', 'about': 'clinic-room:6', 's1': 'doctor:6', 's2': 'clinic-room:3', 's3': 'medical-team:0', 's4': 'clinic-room:5', 'band': 'clinic-room:0', 'g1': 'clinic-room:2'},
         cfg=dict(nav=[['services', E('Services', 'Servicios')], ['about', E('About', 'Sobre mí')], ['contact', E('Appointments', 'Citas')]], navCta={'t': E('Book an appointment', 'Pedir cita')},
                  sections=[
                      {'type': 'hero', 'layout': 'split', 'photo': 'hero', 'eyebrow': E('Internal medicine · Cardiology', 'Medicina interna · Cardiología'),
                       'title': E('Care that listens, medicine that explains', 'Atención que escucha, medicina que explica'),
                       'lead': E('Check-ups, heart health and chronic disease follow-up. Book online and get a WhatsApp reminder.', 'Chequeos, salud del corazón y control de enfermedades crónicas. Reserva en línea y recibe recordatorio por WhatsApp.'),
                       'cta': {'t': E('Book an appointment', 'Pedir cita')}, 'cta2': {'t': E('Services', 'Servicios'), 'href': '#services'},
                       'badges': [['award', E('15 years of practice', '15 años de experiencia')], ['heart', E('2,000+ patients', '2.000+ pacientes')]]},
                      {'type': 'cards', 'alt': True, 'eyebrow': E('Services', 'Servicios'), 'title': E('How I can help', 'Cómo te puedo ayudar'),
                       'items': [{'photo': 's1', 'title': E('General check-up', 'Chequeo general'), 'text': E('Full exam, lab orders and a clear plan.', 'Examen completo, laboratorios y un plan claro.'), 'price': E('From $40', 'Desde $40')},
                                 {'photo': 's2', 'title': E('Heart health', 'Salud cardiovascular'), 'text': E('ECG, blood pressure and risk assessment.', 'Electrocardiograma, tensión y evaluación de riesgo.'), 'price': E('From $55', 'Desde $55')},
                                 {'photo': 's3', 'title': E('Chronic care', 'Control de crónicos'), 'text': E('Diabetes and hypertension follow-up every month.', 'Seguimiento mensual de diabetes e hipertensión.'), 'price': E('From $35', 'Desde $35')},
                                 {'photo': 's4', 'title': E('Online consultation', 'Consulta en línea'), 'text': E('Video call with prescription by email.', 'Videollamada con récipe por correo.'), 'price': E('From $30', 'Desde $30')}]},
                      {'type': 'about', 'photo': 'about', 'eyebrow': E('About', 'Sobre mí'), 'title': E('Dr. Sofía Marín, MD', 'Dra. Sofía Marín'),
                       'text': E('Internist with a cardiology fellowship. I take time to explain every result and answer questions after the visit.', 'Médica internista con especialización en cardiología. Me tomo el tiempo de explicar cada resultado y responder dudas después de la consulta.'),
                       'points': [E('Member of the Venezuelan Society of Cardiology', 'Miembro de la Sociedad Venezolana de Cardiología'), E('Appointments the same week', 'Citas en la misma semana'), E('Results and reports sent online', 'Resultados e informes en línea')]},
                      {'type': 'quotes', 'alt': True, 'title': E('Patients say', 'Lo que dicen los pacientes'), 'items': [[E('She explained everything with patience. I finally understand my treatment.', 'Me explicó todo con paciencia. Por fin entiendo mi tratamiento.'), 'Rosa P.'], [E('Booking online took one minute.', 'Reservar en línea tomó un minuto.'), 'Luis G.'], [E('Excellent doctor and a very clean office.', 'Excelente doctora y un consultorio impecable.'), 'Carmen D.']]},
                      contact([['pin', E('Centro Médico Vida, Floor 3, Office 12', 'Centro Médico Vida, Piso 3, Consultorio 12')], PHONE, HOURS], topics=[E('Check-up', 'Chequeo'), E('Heart health', 'Cardiología'), E('Follow-up', 'Control'), E('Online', 'En línea')], title=E('Book an appointment', 'Pide tu cita'))],
                  footer=E('Internal medicine & cardiology', 'Medicina interna y cardiología'))),

    # 3 ---------------------------------------------------------------- Accounting & tax
    dict(slug='cifra', name='Cifra Contadores', mark='C', product=BUSINESS, sector='finance',
         tagline=['Contabilidad e impuestos', 'Accounting & tax advisory'], blurb=['Ordenado y confiable, para contadores y asesores fiscales.', 'Orderly and reliable, for accountants and tax advisors.'],
         vars={'bg': '#ffffff', 'text': '#0b1324', 'accent': '#15803d', 'accent-ink': '#ffffff', 'soft': '#effaf3'},
         theme={'accent': '#15803d', 'soft': '#effaf3', 'fonts': FONT, 'r': '12px'},
         photos={'hero': 'finance-team:10', 'about': 'tax:12', 's1': 'tax:3', 's2': 'tax:7', 's3': 'finance-team:14', 's4': 'tax:10', 'p1': 'portrait-pro:0', 'p2': 'portrait-pro:5', 'p3': 'portrait-pro:14', 'band': 'tax:0'},
         cfg=dict(nav=[['services', E('Services', 'Servicios')], ['team', E('Team', 'Equipo')], ['contact', E('Contact', 'Contacto')]], navCta={'t': E('Free review', 'Revisión gratis')},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Accounting · Tax · Payroll', 'Contabilidad · Impuestos · Nómina'),
                       'title': E('Your books in order. Your taxes on time.', 'Tus libros al día. Tus impuestos a tiempo.'),
                       'lead': E('Monthly accounting, VAT and income tax filings, payroll and audits for small and medium businesses.', 'Contabilidad mensual, declaraciones de IVA e ISLR, nómina y auditorías para pymes.'),
                       'cta': {'t': E('Get a free review', 'Revisión gratis')}, 'cta2': {'t': E('Our services', 'Servicios'), 'href': '#services'},
                       'badges': [['check', E('No missed deadlines', 'Sin multas por atraso')], ['file', E('Monthly reports', 'Reportes mensuales')]]},
                      {'type': 'stats', 'items': [['180+', E('Companies served', 'Empresas atendidas')], ['0', E('Late filings in 2025', 'Declaraciones tardías en 2025')], ['12', E('Accountants', 'Contadores')], ['24 h', E('Reply time', 'Tiempo de respuesta')]]},
                      {'type': 'cards', 'eyebrow': E('Services', 'Servicios'), 'title': E('Everything your company needs', 'Todo lo que tu empresa necesita'),
                       'items': [{'photo': 's1', 'title': E('Monthly accounting', 'Contabilidad mensual'), 'text': E('Books, bank reconciliation and financial statements.', 'Libros, conciliaciones y estados financieros.'), 'price': E('From $120/month', 'Desde $120/mes')},
                                 {'photo': 's2', 'title': E('Tax filings', 'Declaraciones de impuestos'), 'text': E('VAT, income tax, municipal taxes and withholdings.', 'IVA, ISLR, impuestos municipales y retenciones.'), 'price': E('From $80/month', 'Desde $80/mes')},
                                 {'photo': 's3', 'title': E('Payroll & HR', 'Nómina y RR. HH.'), 'text': E('Payslips, social security and benefits.', 'Recibos, seguro social y prestaciones.'), 'price': E('From $5/employee', 'Desde $5/empleado')},
                                 {'photo': 's4', 'title': E('Audits & advisory', 'Auditorías y asesoría'), 'text': E('Financial audits, budgets and tax planning.', 'Auditorías, presupuestos y planificación fiscal.'), 'price': E('Quoted', 'A convenir')}]},
                      {'type': 'about', 'photo': 'about', 'eyebrow': E('Why Cifra', 'Por qué Cifra'), 'title': E('Numbers you can understand', 'Números que entiendes'),
                       'text': E('Each client has an accountant who knows the business and sends a one-page summary every month.', 'Cada cliente tiene un contador que conoce el negocio y envía un resumen de una página cada mes.'),
                       'points': [E('Calendar of every tax deadline', 'Calendario de cada vencimiento'), E('Documents shared online, no paper', 'Documentos en línea, sin papel'), E('Registered public accountants', 'Contadores públicos colegiados')]},
                      {'type': 'team', 'alt': True, 'title': E('Your accountants', 'Tus contadores'), 'people': [{'name': 'Gabriela Díaz', 'role': E('Founder · Public accountant', 'Fundadora · Contadora pública'), 'photo': 'p1'}, {'name': 'José Ramírez', 'role': E('Tax manager', 'Gerente de impuestos'), 'photo': 'p2'}, {'name': 'Ana Torres', 'role': E('Payroll lead', 'Líder de nómina'), 'photo': 'p3'}]},
                      contact([CCS, PHONE, ['mail', E('hello@cifra.com', 'hola@cifra.com')]], topics=[E('Monthly accounting', 'Contabilidad mensual'), E('Taxes', 'Impuestos'), E('Payroll', 'Nómina'), E('Audit', 'Auditoría')], title=E('Get a free review', 'Pide una revisión gratis'))],
                  footer=E('Accounting & tax advisory', 'Contabilidad y asesoría fiscal'))),

    # 4 ---------------------------------------------------------------- Consultant
    dict(slug='norte', name='Carlos Medina', mark='CM', product=PERSONAL, sector='consulting',
         tagline=['Consultor de negocios', 'Business consultant'], blurb=['Directo y profesional, para consultores, coaches y asesores.', 'Direct and professional, for consultants, coaches and advisors.'],
         vars={'bg': '#ffffff', 'text': '#0f172a', 'accent': '#1d4ed8', 'accent-ink': '#ffffff', 'soft': '#eff4ff'},
         theme={'accent': '#1d4ed8', 'soft': '#eff4ff', 'fonts': FONT},
         photos={'hero': 'portrait-pro:6', 'about': 'consultant:13', 's1': 'consultant:8', 's2': 'consultant:4', 's3': 'consultant:14', 'band': 'consultant:0', 'g1': 'consultant:11'},
         cfg=dict(nav=[['services', E('Services', 'Servicios')], ['about', E('About', 'Sobre mí')], ['contact', E('Contact', 'Contacto')]], navCta={'t': E('Book a call', 'Agendar llamada')},
                  sections=[
                      {'type': 'hero', 'layout': 'split', 'photo': 'hero', 'eyebrow': E('Strategy · Pricing · Operations', 'Estrategia · Precios · Operaciones'),
                       'title': E('I help growing businesses sell more and waste less', 'Ayudo a empresas en crecimiento a vender más y desperdiciar menos'),
                       'lead': E('90-day programs with measurable goals. Former operations director with 12 years in retail and logistics.', 'Programas de 90 días con metas medibles. Ex director de operaciones con 12 años en retail y logística.'),
                       'cta': {'t': E('Book a free call', 'Agendar llamada gratis')}, 'cta2': {'t': E('How I work', 'Cómo trabajo'), 'href': '#services'},
                       'badges': [['chart', E('+28% average sales growth', '+28% de crecimiento promedio')], ['users', E('60+ companies', '60+ empresas')]]},
                      {'type': 'cards', 'alt': True, 'title': E('How I can help', 'Cómo te puedo ayudar'),
                       'items': [{'photo': 's1', 'title': E('Growth diagnostic', 'Diagnóstico de crecimiento'), 'text': E('Two weeks to find where you lose money and customers.', 'Dos semanas para encontrar dónde pierdes dinero y clientes.'), 'price': E('$450', '$450')},
                                 {'photo': 's2', 'title': E('90-day program', 'Programa de 90 días'), 'text': E('Weekly sessions, dashboard and a team action plan.', 'Sesiones semanales, tablero y plan de acción para el equipo.'), 'price': E('$1,800', '$1.800')},
                                 {'photo': 's3', 'title': E('Workshops', 'Talleres'), 'text': E('Sales and pricing workshops for your team.', 'Talleres de ventas y precios para tu equipo.'), 'price': E('From $300', 'Desde $300')}]},
                      {'type': 'about', 'photo': 'about', 'title': E('About Carlos', 'Sobre Carlos'), 'text': E('MBA, former operations director. I work with a handful of clients at a time so each one gets real attention.', 'MBA y ex director de operaciones. Trabajo con pocos clientes a la vez para dar atención real a cada uno.'),
                       'points': [E('Results measured every month', 'Resultados medidos cada mes'), E('In person or online', 'Presencial o en línea'), E('English, Spanish and Portuguese', 'Español, inglés y portugués')]},
                      {'type': 'quotes', 'alt': True, 'title': E('Results', 'Resultados'), 'items': [[E('We raised margins 9 points in one quarter.', 'Subimos el margen 9 puntos en un trimestre.'), 'Farmacia Sol'], [E('Our team finally knows its numbers.', 'Por fin el equipo conoce sus números.'), 'Grupo Andes'], [E('Practical, direct and worth every dollar.', 'Práctico, directo y vale cada dólar.'), 'Hotel Litoral']]},
                      contact([PHONE, ['mail', E('carlos@medina.consulting', 'carlos@medina.consulting')], ['globe', E('Online worldwide', 'En línea a todo el mundo')]], title=E('Book a free 20-minute call', 'Agenda una llamada gratis de 20 minutos'))],
                  footer=E('Business consulting', 'Consultoría de negocios'))),

    # 5 ---------------------------------------------------------------- IT specialist
    dict(slug='nodo', name='Nodo IT', mark='N', product=PERSONAL, sector='tech',
         tagline=['Especialista en TI', 'IT specialist'], blurb=['Moderno y oscuro, para técnicos de TI, programadores y soporte.', 'Modern and dark, for IT technicians, developers and support.'],
         vars={'bg': '#0c0d10', 'text': '#f3f4f6', 'accent': '#22d3ee', 'accent-ink': '#06202a', 'soft': '#111318'},
         theme={'accent': '#22d3ee', 'accentInk': '#06202a', 'dark': True, 'fonts': 'family=Inter:wght@400;600;700;800&family=Space+Grotesk:wght@600;700', 'head': "'Space Grotesk',sans-serif", 'headW': '700'},
         photos={'hero': 'it-server:1', 'about': 'developer:4', 's1': 'developer:5', 's2': 'it-server:3', 's3': 'developer:14', 's4': 'developer:0', 'g1': 'it-server:0', 'g2': 'developer:13'},
         cfg=dict(nav=[['services', E('Services', 'Servicios')], ['about', E('About', 'Sobre mí')], ['contact', E('Support', 'Soporte')]], navCta={'t': E('Get support', 'Pedir soporte')},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Networks · Servers · Security · Support', 'Redes · Servidores · Seguridad · Soporte'),
                       'title': E('IT that just works, for offices and stores', 'TI que simplemente funciona, para oficinas y tiendas'),
                       'lead': E('Networks, backups, security and help desk. Monthly plans or one-time jobs, on-site or remote.', 'Redes, respaldos, seguridad y mesa de ayuda. Planes mensuales o trabajos puntuales, en sitio o remoto.'),
                       'cta': {'t': E('Get support', 'Pedir soporte')}, 'cta2': {'t': E('Plans', 'Planes'), 'href': '#services'},
                       'badges': [['clock', E('Response in 2 hours', 'Respuesta en 2 horas')], ['shield', E('Backups every night', 'Respaldos cada noche')]]},
                      {'type': 'cards', 'title': E('What I do', 'Lo que hago'),
                       'items': [{'photo': 's1', 'title': E('Help desk', 'Mesa de ayuda'), 'text': E('Remote fixes for computers, printers and email.', 'Soporte remoto de equipos, impresoras y correo.'), 'price': E('From $90/month', 'Desde $90/mes')},
                                 {'photo': 's2', 'title': E('Networks & Wi-Fi', 'Redes y Wi-Fi'), 'text': E('Cabling, routers and fast Wi-Fi in every room.', 'Cableado, routers y Wi-Fi rápido en cada espacio.'), 'price': E('Quoted', 'A convenir')},
                                 {'photo': 's3', 'title': E('Security & backups', 'Seguridad y respaldos'), 'text': E('Antivirus, firewall and nightly cloud backups.', 'Antivirus, firewall y respaldos en la nube.'), 'price': E('From $40/month', 'Desde $40/mes')},
                                 {'photo': 's4', 'title': E('Web & software', 'Web y software'), 'text': E('Websites, business systems and integrations.', 'Sitios web, sistemas y integraciones.'), 'price': E('Quoted', 'A convenir')}]},
                      {'type': 'about', 'photo': 'about', 'title': E('Certified, local, on call', 'Certificado, local y disponible'), 'text': E('Network and cloud certified technician with 10 years supporting clinics, schools and shops.', 'Técnico certificado en redes y nube con 10 años dando soporte a clínicas, colegios y comercios.'),
                       'points': [E('Cisco & Google Cloud certified', 'Certificado Cisco y Google Cloud'), E('Monthly report of every ticket', 'Reporte mensual de cada ticket'), E('Remote and on-site', 'Remoto y en sitio')]},
                      {'type': 'gallery', 'alt': True, 'title': E('Recent work', 'Trabajos recientes'), 'photos': ['g1', 'g2', 's2', 's1', 's4']},
                      contact([PHONE, ['mail', E('support@nodo.it', 'soporte@nodo.it')], HOURS], topics=[E('Help desk', 'Mesa de ayuda'), E('Network', 'Red'), E('Security', 'Seguridad'), E('Web', 'Web')], title=E('Open a support request', 'Abre una solicitud de soporte'))],
                  footer=E('IT services', 'Servicios de TI'))),

    # 6 ---------------------------------------------------------------- Dentist
    dict(slug='sonrisa', name='Sonrisa Dental', mark='S', product=BUSINESS, sector='health',
         tagline=['Clínica dental', 'Dental clinic'], blurb=['Limpio y luminoso, para odontólogos y clínicas dentales.', 'Clean and bright, for dentists and dental clinics.'],
         vars={'bg': '#ffffff', 'text': '#0f172a', 'accent': '#0891b2', 'accent-ink': '#ffffff', 'soft': '#ecfeff'},
         theme={'accent': '#0891b2', 'soft': '#ecfeff', 'fonts': FONT, 'r': '18px', 'rBtn': '999px'},
         photos={'hero': 'dentist:1', 'about': 'dentist:3', 's1': 'dentist:15', 's2': 'dentist:11', 's3': 'dentist:12', 's4': 'dentist:9', 'p1': 'doctor:0', 'p2': 'doctor:2', 'p3': 'doctor:10'},
         cfg=dict(nav=[['services', E('Treatments', 'Tratamientos')], ['team', E('Dentists', 'Odontólogos')], ['contact', E('Book', 'Reservar')]], navCta={'t': E('Book a visit', 'Reservar cita')},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Family dentistry · Orthodontics · Implants', 'Odontología familiar · Ortodoncia · Implantes'),
                       'title': E('A smile you will want to show', 'Una sonrisa que vas a querer mostrar'),
                       'lead': E('Modern equipment, painless treatments and payment plans. Book online in a minute.', 'Equipos modernos, tratamientos sin dolor y planes de pago. Reserva en línea en un minuto.'),
                       'cta': {'t': E('Book a visit', 'Reservar cita')}, 'cta2': {'t': E('Treatments', 'Tratamientos'), 'href': '#services'}},
                      {'type': 'cards', 'alt': True, 'title': E('Treatments', 'Tratamientos'),
                       'items': [{'photo': 's1', 'title': E('Cleaning & check-up', 'Limpieza y control'), 'text': E('Every six months, for the whole family.', 'Cada seis meses, para toda la familia.'), 'price': E('$35', '$35')},
                                 {'photo': 's2', 'title': E('Orthodontics', 'Ortodoncia'), 'text': E('Braces and clear aligners with monthly plans.', 'Brackets y alineadores con planes mensuales.'), 'price': E('From $60/month', 'Desde $60/mes')},
                                 {'photo': 's3', 'title': E('Whitening', 'Blanqueamiento'), 'text': E('Visible results in one session.', 'Resultados visibles en una sesión.'), 'price': E('$120', '$120')},
                                 {'photo': 's4', 'title': E('Implants', 'Implantes'), 'text': E('Permanent replacement for missing teeth.', 'Reemplazo permanente de piezas perdidas.'), 'price': E('Quoted', 'A convenir')}]},
                      {'type': 'team', 'title': E('Our dentists', 'Nuestros odontólogos'), 'people': [{'name': 'Dra. Valeria Gómez', 'role': E('Orthodontist', 'Ortodoncista'), 'photo': 'p1'}, {'name': 'Dr. Javier Ruiz', 'role': E('Implantologist', 'Implantólogo'), 'photo': 'p2'}, {'name': 'Dra. Paola León', 'role': E('Pediatric dentist', 'Odontopediatra'), 'photo': 'p3'}]},
                      {'type': 'about', 'photo': 'about', 'title': E('Comfort first', 'Primero tu comodidad'), 'text': E('Digital X-rays, sterilized tools and a team that explains every step.', 'Rayos X digitales, instrumental esterilizado y un equipo que explica cada paso.'), 'points': [E('Payment plans', 'Planes de pago'), E('Emergencies the same day', 'Emergencias el mismo día'), E('Reminders by WhatsApp', 'Recordatorios por WhatsApp')]},
                      contact([CCS, PHONE, HOURS], topics=[E('Check-up', 'Control'), E('Orthodontics', 'Ortodoncia'), E('Whitening', 'Blanqueamiento'), E('Emergency', 'Emergencia')], title=E('Book your visit', 'Reserva tu cita'))],
                  footer=E('Dental clinic', 'Clínica dental'))),

    # 7 ---------------------------------------------------------------- Corporate firm
    dict(slug='grupo', name='Grupo Meridian', mark='GM', product=BUSINESS, sector='corporate',
         tagline=['Empresa corporativa', 'Corporate firm'], blurb=['Sobrio y corporativo, para empresas, holdings y firmas.', 'Sober and corporate, for companies, holdings and firms.'],
         vars={'bg': '#ffffff', 'text': '#0b1324', 'accent': '#0f2a4a', 'accent-ink': '#ffffff', 'soft': '#f3f5f8'},
         theme={'accent': '#0f2a4a', 'soft': '#f3f5f8', 'fonts': FONT, 'r': '8px', 'rBtn': '6px'},
         photos={'hero': 'lib:architecture:6', 'about': 'consultant:10', 's1': 'lib:corporate:4', 's2': 'lib:architecture:7', 's3': 'finance-team:6', 's4': 'lib:corporate:7',
                 'p1': 'portrait-pro:2', 'p2': 'portrait-pro:13', 'p3': 'portrait-pro:8', 'p4': 'portrait-pro:1'},
         cfg=dict(nav=[['services', E('What we do', 'Qué hacemos')], ['team', E('Leadership', 'Directiva')], ['contact', E('Contact', 'Contacto')]], navCta={'t': E('Contact us', 'Contáctanos')},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Investment · Logistics · Real estate', 'Inversiones · Logística · Inmobiliaria'),
                       'title': E('Building lasting value across the region', 'Creamos valor duradero en la región'),
                       'lead': E('A group of companies with 30 years of operations, 1,400 employees and a commitment to doing business the right way.', 'Un grupo de empresas con 30 años de operaciones, 1.400 empleados y el compromiso de hacer negocios correctamente.'),
                       'cta': {'t': E('Our companies', 'Nuestras empresas'), 'href': '#services'}, 'cta2': {'t': E('Contact', 'Contacto')}},
                      {'type': 'stats', 'items': [['30', E('Years', 'Años')], ['1,400', E('Employees', 'Empleados')], ['6', E('Countries', 'Países')], ['$240M', E('Annual revenue', 'Facturación anual')]]},
                      {'type': 'cards', 'title': E('Our companies', 'Nuestras empresas'), 'items': [
                          {'photo': 's1', 'meta': E('Investment', 'Inversiones'), 'title': 'Meridian Capital', 'text': E('Private equity for mid-size companies.', 'Capital privado para empresas medianas.')},
                          {'photo': 's2', 'meta': E('Real estate', 'Inmobiliaria'), 'title': 'Meridian Properties', 'text': E('Offices and residential towers.', 'Oficinas y torres residenciales.')},
                          {'photo': 's3', 'meta': E('Services', 'Servicios'), 'title': 'Meridian Advisory', 'text': E('Finance, legal and HR shared services.', 'Servicios compartidos de finanzas, legal y RR. HH.')},
                          {'photo': 's4', 'meta': E('Technology', 'Tecnología'), 'title': 'Meridian Digital', 'text': E('Software and data for the group and clients.', 'Software y datos para el grupo y sus clientes.')}]},
                      {'type': 'team', 'alt': True, 'title': E('Leadership', 'Directiva'), 'people': [{'name': 'Ricardo Salas', 'role': E('Chief executive', 'Presidente ejecutivo'), 'photo': 'p1'}, {'name': 'Elena Brito', 'role': E('Chief financial officer', 'Directora de finanzas'), 'photo': 'p2'}, {'name': 'Tomás Ruiz', 'role': E('Chief operating officer', 'Director de operaciones'), 'photo': 'p3'}, {'name': 'Isabel Mora', 'role': E('General counsel', 'Consultora jurídica'), 'photo': 'p4'}]},
                      {'type': 'about', 'photo': 'about', 'title': E('Governance & responsibility', 'Gobierno corporativo y responsabilidad'), 'text': E('Independent board, audited accounts and a community program in every city where we operate.', 'Junta independiente, cuentas auditadas y un programa comunitario en cada ciudad donde operamos.')},
                      contact([CCS, PHONE, ['mail', E('info@meridian.group', 'info@meridian.group')]], topics=[E('Investors', 'Inversionistas'), E('Partnerships', 'Alianzas'), E('Careers', 'Empleo'), E('Press', 'Prensa')])],
                  footer=E('Group of companies', 'Grupo de empresas'))),
]
# The organization and creative sites (NGO, club, government, football, musician, fashion designer,
# photographer, church, electrician, personal trainer) are added by template_data_sites_more.py.
try:
    from template_data_sites_more import MORE_SITES
    SITES += MORE_SITES
except ImportError:
    pass
try:
    from template_data_sites_pro import PRO_SITES, SECTORS_PRO
    SITES += PRO_SITES
    SECTORS.update(SECTORS_PRO)
except ImportError:
    pass
