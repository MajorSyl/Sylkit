import type { LegalDoc } from '../components/LegalPage';

// Terms, Privacy and Refund policy for sylkit.com, in English and Spanish.
// Keep these in line with how Sylkit actually sells (see src/lib/pricing.ts) and update `updated` when anything changes.

const UPDATED = '2026-10-29';
const CONTACT = {
  es: 'Correo: hello@sylkit.com · Facturación: billing@sylkit.com · Soporte: support@sylkit.com · WhatsApp: +1 (646) 934-8752.',
  en: 'Email: hello@sylkit.com · Billing: billing@sylkit.com · Support: support@sylkit.com · WhatsApp: +1 (646) 934-8752.',
};

export const terms: LegalDoc = {
  updated: UPDATED,
  title: { es: 'Términos del servicio', en: 'Terms of service' },
  intro: {
    es: 'Estos términos aplican a todo lo que compras o pides en sylkit.com: sistemas listos, sistemas personalizados, sitios web, apps, dominios, correo y hosting. Al hacer un pedido o pagar, aceptas estos términos.',
    en: 'These terms apply to everything you buy or order on sylkit.com: ready-made systems, custom systems, websites, apps, domains, email and hosting. By placing an order or paying, you agree to these terms.',
  },
  sections: [
    {
      h: { es: 'Quiénes somos', en: 'Who we are' },
      p: [
        {
          es: 'Sylkit es una tienda en línea de software para negocios. Creamos, instalamos, alojamos y mantenemos los sistemas que vendemos. En estos términos, "Sylkit", "nosotros" se refiere a quien opera sylkit.com, y "tú" al cliente que hace el pedido.',
          en: 'Sylkit is an online store for business software. We build, set up, host and maintain the systems we sell. In these terms, "Sylkit", "we" and "us" mean the operator of sylkit.com, and "you" means the customer placing the order.',
        },
        CONTACT,
      ],
    },
    {
      h: { es: 'Pedidos y precios', en: 'Orders and prices' },
      p: [
        {
          es: 'Los precios están en dólares estadounidenses (USD) salvo que se indique otra moneda. Los planes con precio fijo se confirman al total calculado en el momento del pedido. Los proyectos a medida se cotizan primero; la cotización indica el precio, lo que incluye y su fecha de vencimiento.',
          en: 'Prices are in US dollars (USD) unless another currency is shown. Fixed-price plans are confirmed at the total calculated when you order. Custom projects are quoted first; the quote states the price, what is included and when it expires.',
        },
        {
          es: 'Empezamos a trabajar cuando tu pago está confirmado. Puedes seguir el estado de tu pedido en su página de seguimiento.',
          en: 'We start work once your payment is confirmed. You can follow your order on its tracking page.',
        },
      ],
    },
    {
      h: { es: 'Formas de pago', en: 'How you pay' },
      p: [
        {
          es: 'Aceptamos tarjeta (procesada por Stripe), criptomonedas como USDT (procesadas por NOWPayments) y los métodos manuales indicados en tu pedido, como Pago Móvil o transferencia. Nunca vemos ni guardamos los datos completos de tu tarjeta.',
          en: 'We accept card (processed by Stripe), cryptocurrency such as USDT (processed by NOWPayments) and the manual methods shown on your order, such as Pago Móvil or bank transfer. We never see or store your full card details.',
        },
      ],
    },
    {
      h: { es: 'Suscripciones y renovación', en: 'Subscriptions and renewal' },
      p: [
        {
          es: 'Los planes anuales y mensuales son suscripciones. Si pagas con tarjeta, se renuevan automáticamente al final de cada periodo al precio de tu plan, hasta que canceles. Si pagas por otro medio, te enviamos un aviso y una factura antes de la renovación.',
          en: 'Yearly and monthly plans are subscriptions. If you pay by card, they renew automatically at the end of each period at your plan price until you cancel. If you pay another way, we send you a reminder and an invoice before renewal.',
        },
        {
          es: 'La cuota de instalación y los extras de pago único se cobran solo una vez, con el primer pago. Si cambiamos el precio de un plan, te avisamos al menos 30 días antes de tu próxima renovación.',
          en: 'Setup fees and one-time extras are charged once, with the first payment. If we change a plan price, we tell you at least 30 days before your next renewal.',
        },
        {
          es: 'Puedes cancelar en cualquier momento desde la página de tu pedido o escribiéndonos. El servicio sigue activo hasta el final del periodo ya pagado.',
          en: 'You can cancel at any time from your order page or by contacting us. Your service stays active until the end of the period you have already paid for.',
        },
      ],
    },
    {
      h: { es: 'Pago único (licencia)', en: 'Buy once (license)' },
      p: [
        {
          es: 'Con la opción de pago único recibes una licencia para usar el sistema, con los primeros 12 meses de hosting, soporte y actualizaciones incluidos. Después del primer año puedes contratar el plan de mantenimiento anual opcional.',
          en: 'With the buy-once option you get a license to use the system, with the first 12 months of hosting, support and updates included. After the first year you can add the optional yearly care plan.',
        },
      ],
    },
    {
      h: { es: 'Tus datos y tu contenido', en: 'Your data and content' },
      p: [
        {
          es: 'La información que guardas en tu sistema (productos, clientes, ventas) es tuya. La usamos solo para darte el servicio. Si te vas, te entregamos una copia de tus datos si la pides dentro de los 30 días siguientes al fin del servicio.',
          en: 'The information you store in your system (products, customers, sales) belongs to you. We use it only to provide the service. If you leave, we give you a copy of your data if you ask within 30 days after the service ends.',
        },
        {
          es: 'Los dominios se registran a tu nombre. Si dejas Sylkit, te transferimos el dominio sin costo.',
          en: 'Domains are registered in your name. If you leave Sylkit, we transfer the domain to you at no cost.',
        },
      ],
    },
    {
      h: { es: 'Uso aceptable', en: 'Acceptable use' },
      p: [
        {
          es: 'No puedes usar nuestros sistemas para actividades ilegales, fraude, spam o para vender productos prohibidos. Podemos suspender el servicio si se usa de esa forma, después de avisarte cuando sea posible.',
          en: 'You may not use our systems for illegal activity, fraud, spam or to sell prohibited goods. We may suspend the service if it is used that way, after warning you where possible.',
        },
      ],
    },
    {
      h: { es: 'Disponibilidad y soporte', en: 'Availability and support' },
      p: [
        {
          es: 'Hacemos lo posible para que tus sistemas funcionen sin interrupciones y hacemos copias de seguridad, pero no podemos garantizar que nunca haya fallas. El soporte se da por correo y WhatsApp, normalmente en menos de un día hábil.',
          en: 'We work to keep your systems running without interruption and keep backups, but we cannot guarantee they will never fail. Support is by email and WhatsApp, usually within one business day.',
        },
        {
          es: 'En la medida que la ley lo permita, nuestra responsabilidad total ante ti se limita a lo que nos pagaste en los últimos 12 meses.',
          en: 'To the extent the law allows, our total liability to you is limited to what you paid us in the previous 12 months.',
        },
      ],
    },
    {
      h: { es: 'Demos', en: 'Demos' },
      p: [
        {
          es: 'Las demos en los subdominios de sylkit.com son gratis, usan datos de ejemplo y se reinician cada día. No guardes información real en ellas.',
          en: 'The demos on sylkit.com subdomains are free, use sample data and reset every day. Do not enter real information in them.',
        },
      ],
    },
    {
      h: { es: 'Cambios a estos términos', en: 'Changes to these terms' },
      p: [
        {
          es: 'Podemos actualizar estos términos. Publicaremos la nueva versión en esta página con su fecha. Los cambios importantes te los avisaremos por correo.',
          en: 'We may update these terms. We will post the new version on this page with its date, and tell you by email about important changes.',
        },
      ],
    },
  ],
};

export const privacy: LegalDoc = {
  updated: UPDATED,
  title: { es: 'Política de privacidad', en: 'Privacy policy' },
  intro: {
    es: 'Esta política explica qué datos personales recogemos en sylkit.com, para qué los usamos y qué puedes hacer con ellos.',
    en: 'This policy explains what personal data we collect on sylkit.com, what we use it for and what you can do about it.',
  },
  sections: [
    {
      h: { es: 'Qué recogemos', en: 'What we collect' },
      p: [
        {
          es: 'Cuando haces un pedido o pides una cotización: tu nombre, correo, teléfono o WhatsApp, el nombre y tipo de tu negocio, y los detalles del pedido. Cuando pagas: el método, la referencia y el estado del pago. Los datos de tu tarjeta los recibe directamente Stripe; nosotros nunca los vemos.',
          en: 'When you place an order or ask for a quote: your name, email, phone or WhatsApp, your business name and type, and the order details. When you pay: the method, reference and status of the payment. Your card details go directly to Stripe; we never see them.',
        },
        {
          es: 'Al visitar el sitio: tu país aproximado (para mostrar el idioma correcto) y datos técnicos básicos que guardan nuestros proveedores de hosting por seguridad.',
          en: 'When you visit the site: your approximate country (to show the right language) and basic technical data our hosting providers keep for security.',
        },
      ],
    },
    {
      h: { es: 'Para qué lo usamos', en: 'How we use it' },
      p: [
        {
          es: 'Para preparar tu cotización, entregar y mantener tu sistema, cobrar y renovar tu plan, darte soporte y enviarte avisos sobre tu pedido. No vendemos tus datos ni los usamos para publicidad de terceros.',
          en: 'To prepare your quote, deliver and maintain your system, charge and renew your plan, support you and send you updates about your order. We do not sell your data or use it for third-party advertising.',
        },
      ],
    },
    {
      h: { es: 'Con quién lo compartimos', en: 'Who we share it with' },
      p: [
        {
          es: 'Solo con los proveedores que necesitamos para operar: Stripe (pagos con tarjeta), NOWPayments (pagos con cripto), Supabase (base de datos), Cloudflare (hosting y dominios) y Zoho (correo). Cada uno trata tus datos según su propia política de privacidad. También podemos compartir datos si la ley nos lo exige.',
          en: 'Only with the providers we need to operate: Stripe (card payments), NOWPayments (crypto payments), Supabase (database), Cloudflare (hosting and domains) and Zoho (email). Each handles your data under its own privacy policy. We may also share data when the law requires it.',
        },
      ],
    },
    {
      h: { es: 'Los datos dentro de tu sistema', en: 'Data inside your system' },
      p: [
        {
          es: 'La información que tu negocio guarda en el sistema que te vendemos (por ejemplo, tus clientes o ventas) es tuya. La guardamos y procesamos solo para darte el servicio y no la usamos para nada más.',
          en: 'The information your business stores in the system we sell you (for example your customers or sales) belongs to you. We store and process it only to provide the service and do not use it for anything else.',
        },
      ],
    },
    {
      h: { es: 'Cookies', en: 'Cookies' },
      p: [
        {
          es: 'Usamos una cookie (sk_cc) que guarda tu país durante 30 días para elegir el idioma, y el almacenamiento del navegador para recordar preferencias simples. No usamos cookies de publicidad.',
          en: 'We use one cookie (sk_cc) that stores your country for 30 days to choose the language, and browser storage to remember simple preferences. We do not use advertising cookies.',
        },
      ],
    },
    {
      h: { es: 'Cuánto tiempo lo guardamos', en: 'How long we keep it' },
      p: [
        {
          es: 'Guardamos los datos de pedidos y pagos mientras tengas un servicio activo y el tiempo que exijan las leyes contables y fiscales. Después los borramos o los anonimizamos.',
          en: 'We keep order and payment data while you have an active service and for as long as accounting and tax laws require. After that we delete or anonymize it.',
        },
      ],
    },
    {
      h: { es: 'Tus derechos', en: 'Your rights' },
      p: [
        {
          es: 'Puedes pedirnos una copia de tus datos, corregirlos o borrarlos (salvo lo que debamos conservar por ley). Escríbenos a hello@sylkit.com y respondemos en un máximo de 30 días.',
          en: 'You can ask us for a copy of your data, to correct it or to delete it (except what we must keep by law). Email hello@sylkit.com and we will reply within 30 days.',
        },
        CONTACT,
      ],
    },
  ],
};

export const refunds: LegalDoc = {
  updated: UPDATED,
  title: { es: 'Reembolsos y cancelación', en: 'Refunds and cancellation' },
  intro: {
    es: 'Queremos que estés contento con lo que compras. Así funcionan las cancelaciones y los reembolsos en Sylkit.',
    en: 'We want you to be happy with what you buy. This is how cancellations and refunds work at Sylkit.',
  },
  sections: [
    {
      h: { es: 'Cancelar una suscripción', en: 'Cancelling a subscription' },
      p: [
        {
          es: 'Puedes cancelar tu plan anual o mensual en cualquier momento: con el botón "Gestionar suscripción" en la página de tu pedido (si pagaste con tarjeta) o escribiéndonos. No hay penalidad. Tu sistema sigue funcionando hasta el final del periodo pagado y después no se renueva.',
          en: 'You can cancel your yearly or monthly plan at any time: with the "Manage subscription" button on your order page (if you paid by card) or by contacting us. There is no penalty. Your system keeps working until the end of the paid period and then does not renew.',
        },
      ],
    },
    {
      h: { es: 'Garantía de 14 días', en: '14-day guarantee' },
      p: [
        {
          es: 'Si no estás satisfecho, puedes pedir el reembolso completo de tu primer pago dentro de los 14 días siguientes, siempre que todavía no hayamos entregado tu sistema funcionando. Si ya lo entregamos, te devolvemos el primer pago menos la cuota de instalación.',
          en: 'If you are not satisfied, you can ask for a full refund of your first payment within 14 days, as long as we have not yet delivered your working system. If we have already delivered it, we refund the first payment minus the setup fee.',
        },
      ],
    },
    {
      h: { es: 'Renovaciones', en: 'Renewals' },
      p: [
        {
          es: 'Si se te cobró una renovación que no querías, escríbenos dentro de los 7 días siguientes y la reembolsamos completa si no has usado el servicio en el nuevo periodo. Después de ese plazo, las renovaciones no son reembolsables, pero puedes cancelar para que no se repita.',
          en: 'If you were charged for a renewal you did not want, contact us within 7 days and we refund it in full if you have not used the service in the new period. After that, renewals are not refundable, but you can cancel so it does not happen again.',
        },
      ],
    },
    {
      h: { es: 'Pago único y proyectos a medida', en: 'Buy once and custom projects' },
      p: [
        {
          es: 'Licencias de pago único: aplica la misma garantía de 14 días. Proyectos a medida (apps, sitios, sistemas personalizados): la cotización indica las etapas de entrega. Si cancelas antes de empezar, te devolvemos todo; si cancelas a mitad del proyecto, te devolvemos la parte del trabajo que no se ha hecho.',
          en: 'Buy-once licenses: the same 14-day guarantee applies. Custom projects (apps, websites, custom systems): the quote lists the delivery stages. If you cancel before we start, we refund everything; if you cancel part way through, we refund the share of the work not yet done.',
        },
      ],
    },
    {
      h: { es: 'Dominios', en: 'Domains' },
      p: [
        {
          es: 'Una vez registrado un dominio, el registro no se puede deshacer, así que su costo no es reembolsable. El dominio sigue siendo tuyo y te lo transferimos gratis si lo pides.',
          en: 'Once a domain is registered, the registration cannot be undone, so its cost is not refundable. The domain remains yours and we transfer it to you free if you ask.',
        },
      ],
    },
    {
      h: { es: 'Errores de cobro', en: 'Billing mistakes' },
      p: [
        {
          es: 'Si te cobramos dos veces o un monto equivocado, te devolvemos la diferencia completa, sin importar cuánto tiempo haya pasado.',
          en: 'If we charged you twice or the wrong amount, we refund the difference in full, however long ago it happened.',
        },
      ],
    },
    {
      h: { es: 'Cómo pedir un reembolso', en: 'How to ask for a refund' },
      p: [
        {
          es: 'Escribe a billing@sylkit.com o por WhatsApp con tu número de pedido. Respondemos en un máximo de 2 días hábiles.',
          en: 'Email billing@sylkit.com or message us on WhatsApp with your order number. We reply within 2 business days.',
        },
        {
          es: 'Devolvemos el dinero por el mismo medio que usaste. Tarjeta: el banco suele mostrarlo en 5 a 10 días hábiles. Cripto: lo enviamos a la dirección que nos indiques, en la misma moneda y red, descontando la comisión de la red. Métodos manuales: por el mismo método.',
          en: 'We refund to the same method you used. Card: your bank usually shows it within 5 to 10 business days. Crypto: we send it to the address you give us, in the same coin and network, minus the network fee. Manual methods: back through the same method.',
        },
        CONTACT,
      ],
    },
  ],
};
