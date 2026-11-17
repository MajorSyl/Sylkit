"""Organization, community and creative website templates (engine public/_web/web.js):
NGO, social club, government portal, football club, electrician, musician, fashion designer,
photographer, church, personal trainer. Same format as template_data_sites.py."""
from template_data_sites import BUSINESS, PERSONAL, FONT, SERIF, E, contact, CCS, PHONE, HOURS

MORE_SITES = [
    # ---------------------------------------------------------------- NGO
    dict(slug='ngo', name='Manos Unidas', mark='MU', product=BUSINESS, sector='nonprofit',
         tagline=['ONG y fundaciones', 'NGO & foundations'], blurb=['Cálido y transparente, para ONG, fundaciones y causas sociales.', 'Warm and transparent, for NGOs, foundations and social causes.'],
         vars={'bg': '#ffffff', 'text': '#13201a', 'accent': '#ea580c', 'accent-ink': '#ffffff', 'soft': '#fff6ef'},
         theme={'accent': '#ea580c', 'soft': '#fff6ef', 'fonts': FONT, 'r': '16px', 'rBtn': '999px'},
         photos={'hero': 'india-kids:0', 'about': 'india-volunteers:14', 's1': 'india-kids:3', 's2': 'india-school:0', 's3': 'india-volunteers:9', 'n1': 'india-volunteers:7', 'n2': 'india-school:2', 'n3': 'india-volunteers:2', 'band': 'india-kids:14',
                 'g1': 'india-kids:4', 'g2': 'india-village:3', 'g3': 'india-kids:6', 'g4': 'india-volunteers:1'},
         cfg=dict(topbar=E('Every $10 gives a child school supplies for a month', 'Cada $10 dan útiles escolares a un niño por un mes'),
                  nav=[['programs', E('Programs', 'Programas')], ['news', E('News', 'Noticias')], ['contact', E('Volunteer', 'Voluntariado')]], navCta={'t': E('Donate', 'Donar'), 'href': '#donate'},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Education · Nutrition · Health', 'Educación · Nutrición · Salud'),
                       'title': E('Every child deserves a fair start', 'Todo niño merece un buen comienzo'),
                       'lead': E('We run school meals, tutoring and health days in 14 communities. 92 cents of every dollar goes to programs.', 'Llevamos comedores escolares, refuerzo y jornadas de salud a 14 comunidades. 92 centavos de cada dólar van a los programas.'),
                       'cta': {'t': E('Donate now', 'Donar ahora'), 'href': '#donate'}, 'cta2': {'t': E('Become a volunteer', 'Ser voluntario')}},
                      {'type': 'stats', 'items': [['12,400', E('Children reached', 'Niños atendidos')], ['14', E('Communities', 'Comunidades')], ['380', E('Volunteers', 'Voluntarios')], ['92%', E('Goes to programs', 'Va a programas')]]},
                      {'type': 'cards', 'id': 'programs', 'title': E('Our programs', 'Nuestros programas'), 'items': [
                          {'photo': 's1', 'title': E('School meals', 'Comedores escolares'), 'text': E('A hot lunch every school day for 3,000 children.', 'Almuerzo caliente cada día escolar para 3.000 niños.')},
                          {'photo': 's2', 'title': E('Tutoring', 'Refuerzo escolar'), 'text': E('Reading and math support after school.', 'Apoyo en lectura y matemáticas después de clases.')},
                          {'photo': 's3', 'title': E('Health days', 'Jornadas de salud'), 'text': E('Check-ups, vaccines and dental care in every community.', 'Chequeos, vacunas y odontología en cada comunidad.')}]},
                      {'type': 'band', 'id': 'donate', 'photo': 'band', 'title': E('Your donation, fully tracked', 'Tu donación, con seguimiento'), 'text': E('Give once or monthly by card, PayPal or transfer and receive a report of what your gift achieved.', 'Dona una vez o cada mes con tarjeta, PayPal o transferencia y recibe un informe de lo que lograste.'), 'cta': E('Donate', 'Donar')},
                      {'type': 'cards', 'id': 'news', 'alt': True, 'title': E('Latest news', 'Noticias'), 'items': [
                          {'photo': 'n1', 'meta': E('Oct 28', '28 oct'), 'title': E('New school kitchen opens in Varanasi', 'Abre un nuevo comedor en Varanasi'), 'text': E('Built with 120 volunteers in three weekends.', 'Construido con 120 voluntarios en tres fines de semana.')},
                          {'photo': 'n2', 'meta': E('Oct 12', '12 oct'), 'title': E('1,000 backpacks delivered', '1.000 morrales entregados'), 'text': E('Thanks to our corporate partners.', 'Gracias a nuestras empresas aliadas.')},
                          {'photo': 'n3', 'meta': E('Sep 30', '30 sep'), 'title': E('2025 transparency report', 'Informe de transparencia 2025'), 'text': E('Audited accounts and results, open to everyone.', 'Cuentas auditadas y resultados, abiertos a todos.')}]},
                      {'type': 'gallery', 'title': E('In the field', 'En el terreno'), 'photos': ['g1', 'g2', 'g3', 'g4', 's1']},
                      contact([['pin', E('Lajpat Nagar, New Delhi, India', 'Lajpat Nagar, Nueva Delhi, India')], ['phone', E('+91 98 0000 0000 · WhatsApp', '+91 98 0000 0000 · WhatsApp')], ['mail', E('volunteer@manosunidas.org', 'voluntarios@manosunidas.org')]], topics=[E('Volunteer', 'Voluntariado'), E('Donate', 'Donar'), E('Partner company', 'Empresa aliada')], title=E('Join us', 'Súmate'))],
                  footer=E('Nonprofit foundation · Registered charity', 'Fundación sin fines de lucro'))),

    # ---------------------------------------------------------------- Social club (Rotary-style)
    dict(slug='club', name='Club Social Altamar', mark='CA', product=BUSINESS, sector='community',
         tagline=['Club social y de servicio', 'Social & service club'], blurb=['Institucional y cercano, para clubes de servicio, rotarios, leones y asociaciones.', 'Institutional and friendly, for service clubs, Rotary, Lions and associations.'],
         vars={'bg': '#ffffff', 'text': '#0f1d3a', 'accent': '#17458f', 'accent-ink': '#ffffff', 'soft': '#f2f5fb'},
         theme={'accent': '#17458f', 'soft': '#f2f5fb', 'fonts': SERIF, 'head': "'Playfair Display',serif", 'headW': '700', 'ls': '-0.01em', 'crest': True},
         photos={'hero': 'club-service:14', 'about': 'club-service:6', 's1': 'club-service:1', 's2': 'club-service:3', 's3': 'club-service:0', 'e1': 'club-service:4', 'e2': 'club-service:12', 'e3': 'club-service:15',
                 'p1': 'portrait-pro:12', 'p2': 'portrait-pro:9', 'p3': 'portrait-pro:14', 'p4': 'portrait-pro:5', 'band': 'club-service:8'},
         cfg=dict(nav=[['projects', E('Projects', 'Proyectos')], ['events', E('Events', 'Eventos')], ['team', E('Board', 'Junta')], ['contact', E('Join', 'Únete')]], navCta={'t': E('Become a member', 'Hazte socio')},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Service above self · Since 1978', 'Dar de sí antes de pensar en sí · Desde 1978'),
                       'title': E('Friends who serve their community', 'Amigos que sirven a su comunidad'),
                       'lead': E('Weekly meetings, service projects and fellowship. Find our next meeting and the projects you can join.', 'Reuniones semanales, proyectos de servicio y compañerismo. Conoce la próxima reunión y los proyectos en los que puedes participar.'),
                       'cta': {'t': E('Join a meeting', 'Ven a una reunión')}, 'cta2': {'t': E('Our projects', 'Proyectos'), 'href': '#projects'}},
                      {'type': 'stats', 'items': [['48', E('Members', 'Socios')], ['47', E('Years of service', 'Años de servicio')], ['22', E('Projects this year', 'Proyectos este año')], ['$86K', E('Raised for causes', 'Recaudado para causas')]]},
                      {'type': 'cards', 'id': 'projects', 'title': E('Service projects', 'Proyectos de servicio'), 'items': [
                          {'photo': 's1', 'title': E('Clean water for schools', 'Agua potable para escuelas'), 'text': E('Filters installed in 12 public schools.', 'Filtros instalados en 12 escuelas públicas.')},
                          {'photo': 's2', 'title': E('Youth leadership', 'Liderazgo juvenil'), 'text': E('Mentoring and scholarships for 60 students.', 'Mentoría y becas para 60 estudiantes.')},
                          {'photo': 's3', 'title': E('Annual charity gala', 'Gala benéfica anual'), 'text': E('Our biggest fundraiser for local hospitals.', 'Nuestra mayor recaudación para hospitales locales.')}]},
                      {'type': 'cards', 'id': 'events', 'alt': True, 'title': E('Upcoming events', 'Próximos eventos'), 'items': [
                          {'photo': 'e1', 'meta': E('Nov 28 · 7:00 pm', '28 nov · 7:00 pm'), 'title': E('Charity gala dinner', 'Cena de gala benéfica'), 'text': E('Hotel Altamira · Tickets $60', 'Hotel Altamira · Entradas $60')},
                          {'photo': 'e2', 'meta': E('Dec 6 · 8:00 am', '6 dic · 8:00 am'), 'title': E('Community health day', 'Jornada de salud'), 'text': E('Free check-ups in La Vega.', 'Chequeos gratuitos en La Vega.')},
                          {'photo': 'e3', 'meta': E('Every Tuesday · 7:00 pm', 'Cada martes · 7:00 pm'), 'title': E('Weekly meeting', 'Reunión semanal'), 'text': E('Guests always welcome.', 'Los invitados siempre son bienvenidos.')}]},
                      {'type': 'team', 'title': E('Board of directors 2026–27', 'Junta directiva 2026–27'), 'people': [{'name': 'María Fernanda Ruiz', 'role': E('President', 'Presidenta'), 'photo': 'p1'}, {'name': 'Jorge Linares', 'role': E('Secretary', 'Secretario'), 'photo': 'p2'}, {'name': 'Ana Castillo', 'role': E('Treasurer', 'Tesorera'), 'photo': 'p3'}, {'name': 'Luis Herrera', 'role': E('Public image', 'Imagen pública'), 'photo': 'p4'}]},
                      {'type': 'band', 'photo': 'band', 'title': E('Make a difference with us', 'Haz la diferencia con nosotros'), 'text': E('Come to a meeting as our guest. Membership is open to people who want to serve.', 'Ven a una reunión como invitado. La membresía está abierta a quienes quieren servir.'), 'cta': E('Become a member', 'Hazte socio')},
                      contact([['pin', E('Meetings: Hotel Altamira, Tuesdays 7:00 pm', 'Reuniones: Hotel Altamira, martes 7:00 pm')], PHONE, ['mail', E('info@clubaltamar.org', 'info@clubaltamar.org')]], topics=[E('Membership', 'Membresía'), E('Projects', 'Proyectos'), E('Sponsorship', 'Patrocinio')], title=E('Join us', 'Únete'))],
                  footer=E('Service club · Chartered 1978', 'Club de servicio · Fundado en 1978'))),

    # ---------------------------------------------------------------- Government portal
    dict(slug='gov', name='Alcaldía de Valle Verde', mark='VV', product=BUSINESS, sector='government',
         tagline=['Portal de gobierno', 'Government portal'], blurb=['Claro y accesible, para alcaldías, gobernaciones e instituciones públicas.', 'Clear and accessible, for city halls, ministries and public institutions.'],
         vars={'bg': '#ffffff', 'text': '#0b1b33', 'accent': '#0b5394', 'accent-ink': '#ffffff', 'soft': '#f1f5fa'},
         theme={'accent': '#0b5394', 'soft': '#f1f5fa', 'fonts': FONT, 'r': '10px', 'rBtn': '8px', 'crest': True},
         photos={'hero': 'gov-building:8', 'about': 'city-aerial:2', 'n1': 'public-office:14', 'n2': 'city-aerial:13', 'n3': 'gov-building:4', 'band': 'city-aerial:8', 'p1': 'portrait-pro:2', 'p2': 'portrait-pro:13', 'p3': 'portrait-pro:8'},
         cfg=dict(topbar=E('Official portal of the Municipality of Valle Verde · Citizen line 0800-VALLE', 'Portal oficial del Municipio Valle Verde · Línea ciudadana 0800-VALLE'),
                  nav=[['services', E('Services', 'Trámites')], ['news', E('News', 'Noticias')], ['team', E('Government', 'Gobierno')], ['contact', E('Contact', 'Contacto')]], navCta={'t': E('Online services', 'Trámites en línea'), 'href': '#services'},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Municipal government', 'Gobierno municipal'),
                       'title': E('Your city hall, open 24 hours online', 'Tu alcaldía, abierta 24 horas en línea'),
                       'lead': E('Pay taxes, request permits and certificates, and report problems on your street without lines.', 'Paga impuestos, solicita permisos y certificados y reporta problemas de tu calle sin colas.'),
                       'cta': {'t': E('Start a request', 'Iniciar trámite'), 'href': '#services'}, 'cta2': {'t': E('Report a problem', 'Reportar un problema')}},
                      {'type': 'cards', 'id': 'services', 'title': E('Online services', 'Trámites en línea'), 'lead': E('Most requests are answered in 3 working days.', 'La mayoría de las solicitudes se responden en 3 días hábiles.'), 'items': [
                          {'icon': 'file', 'title': E('Property tax', 'Inmuebles urbanos'), 'text': E('Check your balance and pay online.', 'Consulta tu saldo y paga en línea.')},
                          {'icon': 'building', 'title': E('Business license', 'Licencia de actividades económicas'), 'text': E('Apply or renew your license.', 'Solicita o renueva tu licencia.')},
                          {'icon': 'home', 'title': E('Building permits', 'Permisos de construcción'), 'text': E('Submit plans and track approval.', 'Consigna planos y sigue la aprobación.')},
                          {'icon': 'users', 'title': E('Certificates', 'Constancias'), 'text': E('Residence and solvency certificates.', 'Constancias de residencia y solvencia.')},
                          {'icon': 'tool', 'title': E('Report a problem', 'Reportar un problema'), 'text': E('Potholes, lighting, garbage and water.', 'Huecos, alumbrado, basura y agua.')},
                          {'icon': 'calendar', 'title': E('Book an appointment', 'Cita en taquilla'), 'text': E('Skip the line at the citizen office.', 'Evita la cola en atención al ciudadano.')}]},
                      {'type': 'stats', 'items': [['48,000', E('Online requests in 2025', 'Trámites en línea en 2025')], ['3 days', E('Average reply', 'Respuesta promedio')], ['1,250', E('Street repairs done', 'Reparaciones de calles')], ['24/7', E('Portal availability', 'Disponibilidad del portal')]]},
                      {'type': 'cards', 'id': 'news', 'alt': True, 'title': E('City news', 'Noticias del municipio'), 'items': [
                          {'photo': 'n1', 'meta': E('Nov 14', '14 nov'), 'title': E('New citizen service office opens', 'Abre nueva oficina de atención al ciudadano'), 'text': E('Longer hours and online appointments.', 'Más horario y citas en línea.')},
                          {'photo': 'n2', 'meta': E('Nov 3', '3 nov'), 'title': E('Street lighting plan reaches 40 neighborhoods', 'Plan de alumbrado llega a 40 sectores'), 'text': E('2,300 new LED lights installed.', '2.300 nuevas luminarias LED.')},
                          {'photo': 'n3', 'meta': E('Oct 22', '22 oct'), 'title': E('2027 budget open for consultation', 'Presupuesto 2027 en consulta pública'), 'text': E('Send your proposals until December 1.', 'Envía tus propuestas hasta el 1 de diciembre.')}]},
                      {'type': 'team', 'title': E('Municipal government', 'Gobierno municipal'), 'people': [{'name': 'Ricardo Salas', 'role': E('Mayor', 'Alcalde'), 'photo': 'p1'}, {'name': 'Elena Brito', 'role': E('Secretary of government', 'Secretaria de gobierno'), 'photo': 'p2'}, {'name': 'Tomás Ruiz', 'role': E('Public works', 'Obras públicas'), 'photo': 'p3'}]},
                      contact([['pin', E('City Hall, Plaza Bolívar, Valle Verde', 'Palacio Municipal, Plaza Bolívar, Valle Verde')], ['phone', E('Citizen line 0800-VALLE', 'Línea ciudadana 0800-VALLE')], HOURS], topics=[E('Taxes', 'Tributos'), E('Permits', 'Permisos'), E('Complaint', 'Denuncia'), E('Other', 'Otro')], title=E('Citizen service', 'Atención al ciudadano'))],
                  footer=E('Official portal · Municipality of Valle Verde', 'Portal oficial · Municipio Valle Verde'))),

    # ---------------------------------------------------------------- Football club
    dict(slug='fc', name='Deportivo Ávila FC', mark='DA', product=BUSINESS, sector='sports',
         tagline=['Club de fútbol', 'Football club'], blurb=['Enérgico y oscuro, para clubes de fútbol, academias y ligas.', 'Bold and dark, for football clubs, academies and leagues.'],
         vars={'bg': '#0c0d10', 'text': '#f3f4f6', 'accent': '#facc15', 'accent-ink': '#111111', 'soft': '#111318'},
         theme={'accent': '#facc15', 'accentInk': '#111111', 'dark': True, 'crest': True, 'fonts': 'family=Inter:wght@400;600;700&family=Oswald:wght@600;700', 'head': "'Oswald',sans-serif", 'headW': '700', 'ls': '0'},
         photos={'hero': 'football-match:0', 'about': 'football-youth:9', 'n1': 'football-team:6', 'n2': 'football-youth:14', 'n3': 'football-match:11', 'band': 'football-match:14',
                 'p1': 'football-team:9', 'g1': 'football-match:2', 'g2': 'football-team:11', 'g3': 'football-youth:4', 'g4': 'football-match:7'},
         cfg=dict(nav=[['fixtures', E('Fixtures', 'Partidos')], ['news', E('News', 'Noticias')], ['academy', E('Academy', 'Academia')], ['contact', E('Tickets', 'Entradas')]], navCta={'t': E('Buy tickets', 'Comprar entradas')},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Liga FUTVE · Season 2026', 'Liga FUTVE · Temporada 2026'),
                       'title': E('One city. One shirt. One passion.', 'Una ciudad. Una camiseta. Una pasión.'),
                       'lead': E('Fixtures, tickets, club news and our youth academy, all in one place.', 'Partidos, entradas, noticias del club y nuestra academia, todo en un solo lugar.'),
                       'cta': {'t': E('Buy tickets', 'Comprar entradas')}, 'cta2': {'t': E('Fixtures', 'Calendario'), 'href': '#fixtures'}},
                      {'type': 'table', 'id': 'fixtures', 'title': E('Fixtures & results', 'Calendario y resultados'), 'rows': [
                          [E('Sat 22 Nov', 'Sáb 22 nov'), 'Deportivo Ávila', '19:00', 'Caracas FC', E('Brígido Iriarte', 'Brígido Iriarte'), E('Tickets', 'Entradas')],
                          [E('Sun 16 Nov', 'Dom 16 nov'), 'Deportivo Ávila', '2 – 1', 'Monagas SC', E('Home', 'Local'), E('Win', 'Victoria'), 'win'],
                          [E('Sat 8 Nov', 'Sáb 8 nov'), 'Zamora FC', '0 – 0', 'Deportivo Ávila', E('Away', 'Visitante'), E('Draw', 'Empate')],
                          [E('Sat 1 Nov', 'Sáb 1 nov'), 'Deportivo Ávila', '3 – 1', 'Carabobo FC', E('Home', 'Local'), E('Win', 'Victoria'), 'win']]},
                      {'type': 'cards', 'id': 'news', 'alt': True, 'title': E('Club news', 'Noticias del club'), 'items': [
                          {'photo': 'n1', 'meta': E('Match report', 'Crónica'), 'title': E('Late winner keeps us top of the table', 'Gol al final nos mantiene líderes'), 'text': E('A header in minute 88 sealed the derby.', 'Un cabezazo al 88 selló el clásico.')},
                          {'photo': 'n2', 'meta': E('Academy', 'Academia'), 'title': E('U-15 team wins regional cup', 'La sub-15 gana la copa regional'), 'text': E('Five academy players called to the national team.', 'Cinco jugadores convocados a la selección.')},
                          {'photo': 'n3', 'meta': E('Club', 'Club'), 'title': E('Season tickets on sale', 'Abonos a la venta'), 'text': E('Save 30% and get priority at every home game.', 'Ahorra 30% y ten prioridad en cada partido en casa.')}]},
                      {'type': 'about', 'id': 'academy', 'photo': 'about', 'eyebrow': E('Youth academy', 'Academia'), 'title': E('Train with the club, ages 6 to 17', 'Entrena con el club, de 6 a 17 años'),
                       'text': E('Licensed coaches, three sessions a week and a clear path to the first team.', 'Entrenadores licenciados, tres sesiones por semana y un camino claro al primer equipo.'), 'points': [E('Trials every month', 'Pruebas cada mes'), E('Scholarships for talent', 'Becas por talento'), E('Monthly fee $35', 'Mensualidad $35')]},
                      {'type': 'gallery', 'title': E('Matchday', 'Día de partido'), 'photos': ['g1', 'g2', 'g3', 'g4', 'p1']},
                      contact([['pin', E('Stadium: Av. Principal, Caracas', 'Estadio: Av. Principal, Caracas')], PHONE, ['mail', E('tickets@deportivoavila.com', 'entradas@deportivoavila.com')]], topics=[E('Tickets', 'Entradas'), E('Season ticket', 'Abono'), E('Academy trial', 'Prueba de academia'), E('Sponsorship', 'Patrocinio')], title=E('Tickets & club office', 'Entradas y oficina del club'))],
                  footer=E('Professional football club · Founded 1996', 'Club de fútbol profesional · Fundado en 1996'))),

    # ---------------------------------------------------------------- Electrician
    dict(slug='chispa', name='Chispa Electricidad', mark='CH', product=PERSONAL, sector='trades',
         tagline=['Electricista', 'Electrician'], blurb=['Práctico y directo, para electricistas, plomeros y técnicos.', 'Practical and direct, for electricians, plumbers and technicians.'],
         vars={'bg': '#ffffff', 'text': '#111827', 'accent': '#f59e0b', 'accent-ink': '#111111', 'soft': '#fff8e8'},
         theme={'accent': '#f59e0b', 'accentInk': '#111111', 'soft': '#fff8e8', 'fonts': FONT, 'r': '12px'},
         photos={'hero': 'home-repair:0', 'about': 'home-repair:9', 's1': 'home-repair:13', 's2': 'home-repair:1', 's3': 'home-repair:6', 's4': 'home-repair:12', 'g1': 'home-repair:3', 'g2': 'home-repair:4', 'g3': 'home-repair:10', 'g4': 'home-repair:15'},
         cfg=dict(nav=[['services', E('Services', 'Servicios')], ['gallery', E('Work', 'Trabajos')], ['contact', E('Quote', 'Cotizar')]], navCta={'t': E('Call now', 'Llamar ahora')},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Homes · Shops · Offices · 24h emergencies', 'Hogares · Comercios · Oficinas · Emergencias 24h'),
                       'title': E('Safe electrical work, done right the first time', 'Trabajos eléctricos seguros, bien hechos a la primera'),
                       'lead': E('Certified electrician with 15 years of experience. Free quotes by WhatsApp and a 6-month warranty on every job.', 'Electricista certificado con 15 años de experiencia. Presupuesto gratis por WhatsApp y 6 meses de garantía en cada trabajo.'),
                       'cta': {'t': E('Get a free quote', 'Presupuesto gratis')}, 'cta2': {'t': E('Services', 'Servicios'), 'href': '#services'},
                       'badges': [['shield', E('6-month warranty', 'Garantía de 6 meses')], ['clock', E('24h emergencies', 'Emergencias 24h')], ['bolt', E('Certified', 'Certificado')]]},
                      {'type': 'cards', 'alt': True, 'title': E('Services', 'Servicios'), 'items': [
                          {'photo': 's1', 'title': E('Breaker panels', 'Tableros eléctricos'), 'text': E('Installation, upgrades and labeling.', 'Instalación, actualización y rotulado.'), 'price': E('From $60', 'Desde $60')},
                          {'photo': 's2', 'title': E('Wiring & outlets', 'Cableado y tomas'), 'text': E('New points, rewiring and repairs.', 'Puntos nuevos, recableado y reparaciones.'), 'price': E('From $15 per point', 'Desde $15 por punto')},
                          {'photo': 's3', 'title': E('Fault finding', 'Diagnóstico de fallas'), 'text': E('We find shorts and power losses fast.', 'Encontramos cortos y fallas rápido.'), 'price': E('$25 visit', '$25 la visita')},
                          {'photo': 's4', 'title': E('Generators & solar', 'Plantas y solar'), 'text': E('Transfer switches, inverters and batteries.', 'Transferencias, inversores y baterías.'), 'price': E('Quoted', 'A convenir')}]},
                      {'type': 'gallery', 'title': E('Recent jobs', 'Trabajos recientes'), 'photos': ['g1', 'g2', 'g3', 'g4', 'about']},
                      {'type': 'quotes', 'alt': True, 'title': E('Customers say', 'Lo que dicen los clientes'), 'items': [[E('Came the same night and fixed our panel.', 'Vino esa misma noche y arregló el tablero.'), 'Panadería Real'], [E('Clean work and a fair price.', 'Trabajo limpio y precio justo.'), 'María L.'], [E('Installed our inverter in one day.', 'Instaló nuestro inversor en un día.'), 'Clínica Norte']]},
                      contact([PHONE, ['pin', E('Caracas and Miranda', 'Caracas y Miranda')], ['clock', E('Every day · Emergencies 24h', 'Todos los días · Emergencias 24h')]], topics=[E('Emergency', 'Emergencia'), E('New installation', 'Instalación nueva'), E('Repair', 'Reparación'), E('Solar', 'Solar')], title=E('Free quote', 'Presupuesto gratis'))],
                  footer=E('Certified electrician', 'Electricista certificado'))),
]

MORE_SITES += [
    # ---------------------------------------------------------------- Personal trainer
    dict(slug='coach', name='Coach Daniela', mark='CD', product=PERSONAL, sector='fitness',
         tagline=['Entrenador personal', 'Personal trainer'], blurb=['Energético y directo, para entrenadores, coaches y nutricionistas.', 'Energetic and direct, for trainers, coaches and nutritionists.'],
         vars={'bg': '#ffffff', 'text': '#111111', 'accent': '#e11d48', 'accent-ink': '#ffffff', 'soft': '#fff1f3'},
         theme={'accent': '#e11d48', 'soft': '#fff1f3', 'fonts': 'family=Inter:wght@400;600;700;800;900', 'headW': '900', 'r': '14px', 'rBtn': '999px'},
         photos={'hero': 'fitness-class:15', 'about': 'fitness-class:14', 's1': 'fitness-class:2', 's2': 'fitness-class:13', 's3': 'fitness-class:5', 'g1': 'gym:6', 'g2': 'fitness-class:3', 'g3': 'gym:0', 'g4': 'fitness-class:12'},
         cfg=dict(nav=[['services', E('Programs', 'Programas')], ['about', E('About', 'Sobre mí')], ['contact', E('Start', 'Empezar')]], navCta={'t': E('Free first session', 'Primera sesión gratis')},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Strength · Fat loss · Online coaching', 'Fuerza · Pérdida de grasa · Coaching en línea'),
                       'title': E('Get strong. Feel great. Stay consistent.', 'Ponte fuerte. Siéntete bien. Sé constante.'),
                       'lead': E('Personal training in the gym or online, with a plan built around your schedule and real food.', 'Entrenamiento personal en el gym o en línea, con un plan hecho a tu horario y comida real.'),
                       'cta': {'t': E('Book a free session', 'Reserva una sesión gratis')}, 'cta2': {'t': E('Programs', 'Programas'), 'href': '#services'},
                       'badges': [['award', E('Certified trainer', 'Entrenadora certificada')], ['users', E('300+ clients', '300+ clientes')]]},
                      {'type': 'cards', 'alt': True, 'title': E('Programs', 'Programas'), 'items': [
                          {'photo': 's1', 'title': E('1:1 training', 'Entrenamiento 1:1'), 'text': E('3 sessions a week at the gym.', '3 sesiones por semana en el gym.'), 'price': E('$120/month', '$120/mes')},
                          {'photo': 's2', 'title': E('Small groups', 'Grupos pequeños'), 'text': E('Train with 3–5 people and save.', 'Entrena con 3–5 personas y ahorra.'), 'price': E('$60/month', '$60/mes')},
                          {'photo': 's3', 'title': E('Online coaching', 'Coaching en línea'), 'text': E('App workouts, weekly check-ins and nutrition.', 'Rutinas en app, revisión semanal y nutrición.'), 'price': E('$45/month', '$45/mes')}]},
                      {'type': 'about', 'photo': 'about', 'title': E('Hi, I am Daniela', 'Hola, soy Daniela'), 'text': E('Sports science graduate and certified strength coach. I help busy people train smart and build habits that last.', 'Licenciada en ciencias del deporte y coach de fuerza certificada. Ayudo a personas ocupadas a entrenar inteligente y crear hábitos que duran.'),
                       'points': [E('Progress tracked every week', 'Progreso medido cada semana'), E('Plans for every level', 'Planes para todos los niveles'), E('WhatsApp support', 'Soporte por WhatsApp')]},
                      {'type': 'gallery', 'alt': True, 'title': E('Training', 'Entrenamientos'), 'photos': ['g1', 'g2', 'g3', 'g4', 's2']},
                      {'type': 'quotes', 'title': E('Client results', 'Resultados'), 'items': [[E('Down 9 kg and stronger than ever.', 'Bajé 9 kg y estoy más fuerte que nunca.'), 'Andreína G.'], [E('Finally a plan I can follow.', 'Por fin un plan que puedo seguir.'), 'Miguel O.'], [E('The online program fits my travel.', 'El programa en línea se adapta a mis viajes.'), 'Patricia V.']]},
                      contact([PHONE, ['pin', E('IronCore Gym, Altamira · and online', 'IronCore Gym, Altamira · y en línea')], ['clock', E('Mon–Sat 6:00–21:00', 'Lun–Sáb 6:00–21:00')]], topics=[E('1:1 training', 'Entrenamiento 1:1'), E('Group', 'Grupo'), E('Online', 'En línea')], title=E('Book your free session', 'Reserva tu sesión gratis'))],
                  footer=E('Personal trainer', 'Entrenadora personal'))),
]

MORE_SITES += [
    # ---------------------------------------------------------------- Musician
    dict(slug='ritmo', name='Leo Rivas', mark='LR', product=PERSONAL, sector='music',
         tagline=['Músico y artista', 'Musician & artist'], blurb=['Oscuro y escénico, para músicos, bandas, DJs y cantantes.', 'Dark and stage-ready, for musicians, bands, DJs and singers.'],
         vars={'bg': '#0c0d10', 'text': '#f3f4f6', 'accent': '#a855f7', 'accent-ink': '#ffffff', 'soft': '#111318'},
         theme={'accent': '#a855f7', 'dark': True, 'fonts': 'family=Inter:wght@400;600;700&family=Bebas+Neue', 'head': "'Bebas Neue',sans-serif", 'headW': '400', 'ls': '0.01em'},
         photos={'hero': 'musician-stage:6', 'about': 'singer-guitar:8', 's1': 'musician-stage:4', 's2': 'music-studio:12', 's3': 'singer-guitar:7', 'e1': 'musician-stage:1', 'e2': 'musician-stage:13', 'e3': 'musician-stage:10',
                 'g1': 'musician-stage:2', 'g2': 'music-studio:0', 'g3': 'singer-guitar:4', 'g4': 'musician-stage:15', 'band': 'musician-stage:11'},
         cfg=dict(nav=[['shows', E('Shows', 'Conciertos')], ['about', E('Bio', 'Bio')], ['services', E('Bookings', 'Contrataciones')], ['contact', E('Contact', 'Contacto')]], navCta={'t': E('Book Leo', 'Contratar')},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('New single “Caracas de noche” out now', 'Nuevo sencillo “Caracas de noche” ya disponible'),
                       'title': E('Live music that people remember', 'Música en vivo que la gente recuerda'),
                       'lead': E('Singer-songwriter and guitarist. Concerts, weddings, corporate events and studio sessions.', 'Cantautor y guitarrista. Conciertos, bodas, eventos corporativos y sesiones de estudio.'),
                       'cta': {'t': E('Book a show', 'Contratar un show')}, 'cta2': {'t': E('Upcoming shows', 'Próximos conciertos'), 'href': '#shows'}},
                      {'type': 'table', 'id': 'shows', 'title': E('Upcoming shows', 'Próximos conciertos'), 'rows': [
                          [E('Fri 28 Nov', 'Vie 28 nov'), 'Caracas', '21:00', 'Teatro Chacao', E('Acoustic tour', 'Gira acústica'), E('Tickets', 'Entradas')],
                          [E('Sat 6 Dec', 'Sáb 6 dic'), 'Valencia', '20:00', 'Sala Unión', E('Full band', 'Con banda'), E('Tickets', 'Entradas')],
                          [E('Fri 19 Dec', 'Vie 19 dic'), 'Maracaibo', '21:30', 'Vereda del Lago', E('Christmas show', 'Show navideño'), E('Sold out', 'Agotado')]]},
                      {'type': 'about', 'photo': 'about', 'title': E('About Leo', 'Sobre Leo'), 'text': E('Twelve years on stage, two albums and more than 400 live shows across Venezuela and Colombia.', 'Doce años en escena, dos discos y más de 400 conciertos en Venezuela y Colombia.'),
                       'points': [E('2 studio albums', '2 discos de estudio'), E('1.2M streams', '1,2 M de reproducciones'), E('Bilingual repertoire', 'Repertorio bilingüe')]},
                      {'type': 'cards', 'alt': True, 'title': E('Book Leo', 'Contrata a Leo'), 'items': [
                          {'photo': 's1', 'title': E('Concerts & festivals', 'Conciertos y festivales'), 'text': E('Solo acoustic or with a 5-piece band.', 'Acústico o con banda de 5 músicos.')},
                          {'photo': 's2', 'title': E('Studio sessions', 'Sesiones de estudio'), 'text': E('Guitar and vocals for your recordings.', 'Guitarra y voces para tus grabaciones.')},
                          {'photo': 's3', 'title': E('Guitar lessons', 'Clases de guitarra'), 'text': E('In person or online, all levels.', 'Presenciales o en línea, todos los niveles.')}]},
                      {'type': 'gallery', 'title': E('Live', 'En vivo'), 'photos': ['g1', 'g2', 'g3', 'g4', 'e1']},
                      contact([PHONE, ['mail', E('booking@leorivas.com', 'booking@leorivas.com')], ['music', E('Spotify · YouTube · Apple Music', 'Spotify · YouTube · Apple Music')]], topics=[E('Concert', 'Concierto'), E('Wedding', 'Boda'), E('Corporate event', 'Evento corporativo'), E('Lessons', 'Clases')], title=E('Bookings', 'Contrataciones'))],
                  footer=E('Singer-songwriter', 'Cantautor'))),

    # ---------------------------------------------------------------- Fashion designer
    dict(slug='atelier', name='Valentina Rossi', mark='VR', product=PERSONAL, sector='creative',
         tagline=['Diseñadora de moda', 'Fashion designer'], blurb=['Editorial y elegante, para diseñadores, modistas y marcas de autor.', 'Editorial and elegant, for designers, tailors and independent labels.'],
         vars={'bg': '#fbf9f6', 'text': '#141414', 'accent': '#141414', 'accent-ink': '#ffffff', 'soft': '#f1ece5'},
         theme={'accent': '#141414', 'bg': '#fbf9f6', 'soft': '#f1ece5', 'fonts': SERIF, 'head': "'Playfair Display',serif", 'headW': '600', 'ls': '-0.01em', 'r': '2px', 'rBtn': '0px'},
         photos={'hero': 'runway:2', 'about': 'designer-studio:0', 's1': 'designer-studio:10', 's2': 'fabrics:0', 's3': 'designer-studio:15', 'g1': 'runway:6', 'g2': 'runway:5', 'g3': 'runway:9', 'g4': 'fabrics:12', 'g5': 'runway:3'},
         cfg=dict(nav=[['gallery', E('Collections', 'Colecciones')], ['about', E('Atelier', 'Atelier')], ['services', E('Bespoke', 'A medida')], ['contact', E('Appointments', 'Citas')]], navCta={'t': E('Book a fitting', 'Agendar prueba')},
                  sections=[
                      {'type': 'hero', 'layout': 'split', 'photo': 'hero', 'eyebrow': E('Autumn / Winter 2026 collection', 'Colección otoño / invierno 2026'),
                       'title': E('Garments made for the woman who wears them', 'Prendas hechas para la mujer que las lleva'),
                       'lead': E('Ready-to-wear, bridal and made-to-measure pieces, designed and sewn in our Caracas atelier.', 'Prêt-à-porter, novias y piezas a medida, diseñadas y cosidas en nuestro atelier de Caracas.'),
                       'cta': {'t': E('Book a fitting', 'Agendar prueba')}, 'cta2': {'t': E('See the collection', 'Ver colección'), 'href': '#gallery'}},
                      {'type': 'gallery', 'title': E('Collections', 'Colecciones'), 'photos': ['g1', 'g2', 'g3', 'g5', 'g4']},
                      {'type': 'about', 'photo': 'about', 'eyebrow': E('The atelier', 'El atelier'), 'title': E('Every piece starts with a sketch and a conversation', 'Cada pieza empieza con un boceto y una conversación'),
                       'text': E('Trained in Milan, Valentina designs small collections and custom pieces with natural fabrics and careful finishing.', 'Formada en Milán, Valentina diseña colecciones pequeñas y piezas a medida con telas naturales y acabados cuidados.')},
                      {'type': 'cards', 'alt': True, 'title': E('Bespoke services', 'Servicios a medida'), 'items': [
                          {'photo': 's1', 'title': E('Made to measure', 'A medida'), 'text': E('Three fittings, delivered in four weeks.', 'Tres pruebas, entrega en cuatro semanas.'), 'price': E('From $280', 'Desde $280')},
                          {'photo': 's2', 'title': E('Bridal', 'Novias'), 'text': E('Your dress designed with you from the first sketch.', 'Tu vestido diseñado contigo desde el primer boceto.'), 'price': E('From $900', 'Desde $900')},
                          {'photo': 's3', 'title': E('Alterations', 'Arreglos'), 'text': E('Perfect fit for pieces you already love.', 'El ajuste perfecto para piezas que ya amas.'), 'price': E('From $25', 'Desde $25')}]},
                      contact([['pin', E('Atelier in Las Mercedes, Caracas · by appointment', 'Atelier en Las Mercedes, Caracas · con cita')], PHONE, ['mail', E('atelier@valentinarossi.com', 'atelier@valentinarossi.com')]], topics=[E('Made to measure', 'A medida'), E('Bridal', 'Novias'), E('Collection', 'Colección')], title=E('Book a fitting', 'Agenda una prueba'))],
                  footer=E('Fashion designer · Atelier', 'Diseñadora de moda · Atelier'))),

    # ---------------------------------------------------------------- Photographer
    dict(slug='lente', name='Lente Studio', mark='L', product=PERSONAL, sector='creative',
         tagline=['Fotógrafo', 'Photographer'], blurb=['Minimalista y visual, para fotógrafos y videógrafos.', 'Minimal and visual, for photographers and videographers.'],
         vars={'bg': '#ffffff', 'text': '#111111', 'accent': '#111111', 'accent-ink': '#ffffff', 'soft': '#f4f4f4'},
         theme={'accent': '#111111', 'soft': '#f4f4f4', 'fonts': 'family=Inter:wght@400;500;600;700&family=DM+Serif+Display', 'head': "'DM Serif Display',serif", 'headW': '400', 'ls': '0', 'r': '4px', 'rBtn': '999px'},
         photos={'hero': 'photographer:2', 'about': 'photographer:8', 's1': 'wedding:5', 's2': 'photographer:9', 's3': 'wedding:6', 'g1': 'wedding:4', 'g2': 'wedding:10', 'g3': 'wedding:13', 'g4': 'wedding:2', 'g5': 'wedding:14'},
         cfg=dict(nav=[['gallery', E('Portfolio', 'Portafolio')], ['services', E('Packages', 'Paquetes')], ['contact', E('Book', 'Reservar')]], navCta={'t': E('Check my date', 'Consultar fecha')},
                  sections=[
                      {'type': 'hero', 'layout': 'split', 'photo': 'hero', 'eyebrow': E('Weddings · Portraits · Brands', 'Bodas · Retratos · Marcas'),
                       'title': E('Honest photos of the moments that matter', 'Fotos honestas de los momentos que importan'),
                       'lead': E('Wedding and portrait photographer based in Caracas, available across Venezuela and abroad.', 'Fotógrafo de bodas y retratos en Caracas, disponible en toda Venezuela y el exterior.'),
                       'cta': {'t': E('Check my date', 'Consultar fecha')}, 'cta2': {'t': E('Portfolio', 'Portafolio'), 'href': '#gallery'}},
                      {'type': 'gallery', 'title': E('Portfolio', 'Portafolio'), 'photos': ['g1', 'g2', 'g3', 'g4', 'g5']},
                      {'type': 'cards', 'alt': True, 'title': E('Packages', 'Paquetes'), 'items': [
                          {'photo': 's1', 'title': E('Weddings', 'Bodas'), 'text': E('Full day, two photographers, online gallery.', 'Día completo, dos fotógrafos, galería en línea.'), 'price': E('From $1,200', 'Desde $1.200')},
                          {'photo': 's2', 'title': E('Portraits & brands', 'Retratos y marcas'), 'text': E('Studio or location, 20 edited photos.', 'Estudio o exteriores, 20 fotos editadas.'), 'price': E('From $150', 'Desde $150')},
                          {'photo': 's3', 'title': E('Engagements', 'Compromisos'), 'text': E('A relaxed session before the big day.', 'Una sesión relajada antes del gran día.'), 'price': E('From $220', 'Desde $220')}]},
                      {'type': 'about', 'photo': 'about', 'title': E('Behind the camera', 'Detrás de la cámara'), 'text': E('I photograph people as they are. Ten years, 180 weddings and a style that stays timeless.', 'Fotografío a las personas como son. Diez años, 180 bodas y un estilo que no pasa de moda.')},
                      contact([PHONE, ['mail', E('hello@lente.studio', 'hola@lente.studio')], ['camera', E('@lente.studio', '@lente.studio')]], topics=[E('Wedding', 'Boda'), E('Portrait', 'Retrato'), E('Brand', 'Marca')], title=E('Check my date', 'Consulta tu fecha'))],
                  footer=E('Photography studio', 'Estudio de fotografía'))),

    # ---------------------------------------------------------------- Church
    dict(slug='fe', name='Iglesia Vida Nueva', mark='VN', product=BUSINESS, sector='faith',
         tagline=['Iglesia', 'Church'], blurb=['Acogedor y claro, para iglesias, parroquias y ministerios.', 'Welcoming and clear, for churches, parishes and ministries.'],
         vars={'bg': '#ffffff', 'text': '#1c1917', 'accent': '#7c3aed', 'accent-ink': '#ffffff', 'soft': '#f5f3ff'},
         theme={'accent': '#6d28d9', 'soft': '#f5f3ff', 'fonts': SERIF, 'head': "'Playfair Display',serif", 'headW': '700', 'ls': '-0.01em', 'crest': True},
         photos={'hero': 'church:2', 'about': 'church-building:6', 's1': 'church:6', 's2': 'church:8', 's3': 'church:15', 'e1': 'church:1', 'e2': 'church:11', 'e3': 'church-building:2', 'band': 'church-building:9'},
         cfg=dict(nav=[['services', E('Gatherings', 'Reuniones')], ['events', E('Events', 'Eventos')], ['contact', E('Visit', 'Visítanos')]], navCta={'t': E('Plan your visit', 'Planifica tu visita')},
                  sections=[
                      {'type': 'hero', 'photo': 'hero', 'eyebrow': E('Sundays 9:00 and 11:30 · Wednesdays 7:00 pm', 'Domingos 9:00 y 11:30 · Miércoles 7:00 pm'),
                       'title': E('A place to belong', 'Un lugar al cual pertenecer'),
                       'lead': E('Worship, community and care for every age. Come as you are; there is a seat for you.', 'Adoración, comunidad y cuidado para todas las edades. Ven como eres; hay un lugar para ti.'),
                       'cta': {'t': E('Plan your visit', 'Planifica tu visita')}, 'cta2': {'t': E('Watch online', 'Ver en línea'), 'href': '#services'}},
                      {'type': 'cards', 'id': 'services', 'title': E('Gatherings', 'Reuniones'), 'items': [
                          {'photo': 's1', 'title': E('Sunday services', 'Servicios dominicales'), 'text': E('9:00 and 11:30, also streamed live.', '9:00 y 11:30, también en vivo por internet.')},
                          {'photo': 's2', 'title': E('Small groups', 'Grupos en casas'), 'text': E('Weekly groups in every neighborhood.', 'Grupos semanales en cada sector.')},
                          {'photo': 's3', 'title': E('Youth night', 'Noche de jóvenes'), 'text': E('Fridays 7:00 pm for ages 14–25.', 'Viernes 7:00 pm, de 14 a 25 años.')}]},
                      {'type': 'cards', 'id': 'events', 'alt': True, 'title': E('Upcoming events', 'Próximos eventos'), 'items': [
                          {'photo': 'e1', 'meta': E('Dec 7', '7 dic'), 'title': E('Christmas concert', 'Concierto navideño'), 'text': E('Choir and orchestra, free entry.', 'Coro y orquesta, entrada libre.')},
                          {'photo': 'e2', 'meta': E('Dec 14', '14 dic'), 'title': E('Food drive', 'Jornada de alimentos'), 'text': E('Help us pack 500 food bags.', 'Ayúdanos a armar 500 bolsas de comida.')},
                          {'photo': 'e3', 'meta': E('Jan 10', '10 ene'), 'title': E('Family retreat', 'Retiro familiar'), 'text': E('A weekend in the mountains.', 'Un fin de semana en la montaña.')}]},
                      {'type': 'band', 'photo': 'band', 'title': E('Need prayer or someone to talk to?', '¿Necesitas oración o alguien con quien hablar?'), 'text': E('Our pastoral team answers every message personally.', 'Nuestro equipo pastoral responde cada mensaje personalmente.'), 'cta': E('Send a request', 'Enviar petición')},
                      contact([['pin', E('Av. Libertador, Caracas', 'Av. Libertador, Caracas')], PHONE, ['clock', E('Office Tue–Fri 9:00–17:00', 'Oficina mar–vie 9:00–17:00')]], topics=[E('First visit', 'Primera visita'), E('Prayer request', 'Petición de oración'), E('Volunteer', 'Servir'), E('Donation', 'Ofrenda')], title=E('Plan your visit', 'Planifica tu visita'))],
                  footer=E('Church community', 'Comunidad de fe'))),
]

MORE_SITES += [
    # ---------------------------------------------------------------- Model (personal portfolio)
    dict(slug='muse', name='Ariana Vega', mark='AV', product=PERSONAL, sector='creative',
         tagline=['Modelo', 'Model portfolio'], blurb=['Editorial y oscuro, para modelos, actrices, influencers y artistas.', 'Editorial and dark, for models, actresses, influencers and artists.'],
         vars={'bg': '#0c0c0d', 'text': '#f5f5f5', 'accent': '#e8d5b5', 'accent-ink': '#111111', 'soft': '#141416'},
         theme={'accent': '#e8d5b5', 'accentInk': '#111111', 'dark': True, 'fonts': 'family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,500', 'head': "'Playfair Display',serif", 'headW': '600', 'ls': '-0.01em', 'r': '2px', 'rBtn': '0px'},
         photos={'hero': 'model-studio-solo:6', 'about': 'model-studio-solo:8', 'g1': 'model-studio-solo:3', 'g2': 'model-studio-solo:4', 'g3': 'model-studio-solo:10', 'g4': 'model-studio-solo:12', 'g5': 'model-studio-solo:13',
                 's1': 'model-studio-solo:5', 's2': 'model-studio-solo:4', 's3': 'model-studio-solo:12'},
         cfg=dict(nav=[['gallery', E('Portfolio', 'Portafolio')], ['about', E('About', 'Sobre mí')], ['services', E('Work', 'Trabajos')], ['contact', E('Book', 'Contratar')]], navCta={'t': E('Book Ariana', 'Contratar')},
                  sections=[
                      {'type': 'hero', 'layout': 'split', 'photo': 'hero', 'eyebrow': E('Model · Caracas · Available worldwide', 'Modelo · Caracas · Disponible internacionalmente'),
                       'title': E('Ariana Vega', 'Ariana Vega'),
                       'lead': E('Editorial, commercial and runway model. Represented by Élite Models; direct bookings welcome.', 'Modelo editorial, comercial y de pasarela. Representada por Élite Models; también acepto reservas directas.'),
                       'cta': {'t': E('Book Ariana', 'Contratar a Ariana')}, 'cta2': {'t': E('Portfolio', 'Portafolio'), 'href': '#gallery'}},
                      {'type': 'stats', 'items': [['1.77 m', E('Height', 'Estatura')], ['83 · 61 · 89', E('Measurements (cm)', 'Medidas (cm)')], ['38 EU', E('Shoe size', 'Calzado')], [E('Brown / curly', 'Castaño / rizado'), E('Hair', 'Cabello')]]},
                      {'type': 'gallery', 'title': E('Portfolio', 'Portafolio'), 'photos': ['g1', 'g2', 'g3', 'g4', 'g5']},
                      {'type': 'about', 'photo': 'about', 'eyebrow': E('About', 'Sobre mí'), 'title': E('Seven years in front of the camera', 'Siete años frente a la cámara'),
                       'text': E('Campaigns for fashion and beauty brands in Venezuela, Colombia and Spain, plus runway at Caracas Fashion Week.', 'Campañas para marcas de moda y belleza en Venezuela, Colombia y España, y pasarela en Caracas Fashion Week.'),
                       'points': [E('Fluent in Spanish and English', 'Español e inglés fluido'), E('Valid passport, ready to travel', 'Pasaporte vigente, lista para viajar'), E('Comp card and video on request', 'Comp card y video a solicitud')]},
                      {'type': 'cards', 'id': 'services', 'alt': True, 'title': E('Available for', 'Disponible para'), 'items': [
                          {'photo': 's1', 'title': E('Editorial & campaigns', 'Editorial y campañas'), 'text': E('Fashion and beauty shoots, print and digital.', 'Sesiones de moda y belleza, impreso y digital.')},
                          {'photo': 's2', 'title': E('Runway & events', 'Pasarela y eventos'), 'text': E('Shows, launches and brand events.', 'Desfiles, lanzamientos y eventos de marca.')},
                          {'photo': 's3', 'title': E('Content & UGC', 'Contenido y UGC'), 'text': E('Reels and product content for social media.', 'Reels y contenido de producto para redes.')}]},
                      {'type': 'quotes', 'title': E('Worked with', 'Han trabajado conmigo'), 'items': [[E('Professional, punctual and full of ideas on set.', 'Profesional, puntual y llena de ideas en el set.'), 'Maison Valeria'], [E('Our best-performing campaign this year.', 'Nuestra campaña con mejores resultados del año.'), 'Rosé Beauty'], [E('A natural on the runway.', 'Natural en la pasarela.'), 'Caracas Fashion Week']]},
                      contact([['mail', E('bookings@arianavega.com', 'bookings@arianavega.com')], PHONE, ['camera', E('@ariana.vega', '@ariana.vega')]], topics=[E('Campaign', 'Campaña'), E('Runway', 'Pasarela'), E('Content', 'Contenido'), E('Other', 'Otro')], title=E('Bookings', 'Contrataciones'))],
                  footer=E('Model · Represented by Élite Models', 'Modelo · Representada por Élite Models'))),
]
