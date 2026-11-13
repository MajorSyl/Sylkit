// Plans and add-ons for every product. Generated from one source so the website,
// the database and the price calculator always agree. Prices are in USD.
// Edit live prices in the admin panel; this file is the fallback when the database is unreachable.
import type { Text } from '../i18n';

export type AddonKind = 'monthly' | 'one_time';
export type Addon = { id: string; name: Text; desc: Text; kind: AddonKind; price: number; perUnit: boolean };
export type Plan = { id: string; name: Text; monthly: number; setup: number; includes: Text[]; popular?: boolean };
export type Pricing = { group: string; plans: Plan[]; addons: string[]; billing?: ('yearly' | 'monthly' | 'once')[] };

export const ANNUAL_MONTHS = 10; // pay yearly: 12 months for the price of 10
export const ONCE_MONTHS = 30; // buy once: license = monthly price × 30 (≈ 2.5 years), includes the first 12 months of hosting, support and updates
export const CARE_MONTHS = 5; // after year 1, optional care plan (hosting, updates, support) = monthly price × 5 per year

export const addonCatalog: Record<string, Addon> = {
  "extra_mailboxes": {"id": "extra_mailboxes", "name": {"es": "+5 correos adicionales", "en": "+5 email addresses", "pt": "+5 endereços de e-mail"}, "desc": {"es": "Cinco direcciones de correo más con tu dominio.", "en": "Five more email addresses on your domain.", "pt": "Mais cinco endereços de e-mail no seu domínio."}, "kind": "monthly", "price": 3, "perUnit": true},
  "domain_transfer": {"id": "domain_transfer", "name": {"es": "Traer un dominio que ya tienes", "en": "Move a domain you already own", "pt": "Trazer um domínio que você já tem"}, "desc": {"es": "Lo transferimos a nuestra gestión; sigue siendo tuyo.", "en": "We transfer it into our management; it stays yours.", "pt": "Transferimos para nossa gestão; continua sendo seu."}, "kind": "one_time", "price": 15, "perUnit": false},
  "site_migration": {"id": "site_migration", "name": {"es": "Mudanza de tu sitio actual", "en": "Move your current site", "pt": "Migrar seu site atual"}, "desc": {"es": "Traemos tu sitio desde tu hosting actual sin perder nada.", "en": "We move your site from your current host without losing anything.", "pt": "Mudamos seu site da hospedagem atual sem perder nada."}, "kind": "one_time", "price": 50, "perUnit": false},
  "extra_branch": {
    "id": "extra_branch",
    "name": {
      "es": "Sucursal adicional",
      "en": "Extra branch", "pt": "Filial extra"
    },
    "desc": {
      "es": "Otra tienda o sede usando el mismo sistema.",
      "en": "Another store or location on the same system.", "pt": "Outra loja ou unidade no mesmo sistema."
    },
    "kind": "monthly",
    "price": 15,
    "perUnit": true
  },
  "extra_users": {
    "id": "extra_users",
    "name": {
      "es": "Paquete de 5 usuarios",
      "en": "5 extra users", "pt": "5 usuários extras"
    },
    "desc": {
      "es": "5 personas más con su propio usuario.",
      "en": "5 more people with their own login.", "pt": "Mais 5 pessoas com seu próprio login."
    },
    "kind": "monthly",
    "price": 5,
    "perUnit": true
  },
  "whatsapp_alerts": {
    "id": "whatsapp_alerts",
    "name": {
      "es": "Notificaciones por WhatsApp",
      "en": "WhatsApp notifications", "pt": "Notificações por WhatsApp"
    },
    "desc": {
      "es": "Avisos automáticos por WhatsApp a ti o a tus clientes.",
      "en": "Automatic WhatsApp alerts to you or your customers.", "pt": "Alertas automáticos por WhatsApp para você ou seus clientes."
    },
    "kind": "monthly",
    "price": 10,
    "perUnit": false
  },
  "mobile_app": {
    "id": "mobile_app",
    "name": {
      "es": "App móvil para tu equipo (Android/iOS)",
      "en": "Staff mobile app (Android/iOS)", "pt": "App móvel para a equipe (Android/iOS)"
    },
    "desc": {
      "es": "Tu equipo usa el sistema desde su teléfono.",
      "en": "Your team uses the system from their phones.", "pt": "Sua equipe usa o sistema pelo celular."
    },
    "kind": "monthly",
    "price": 10,
    "perUnit": false
  },
  "fiscal_printer": {
    "id": "fiscal_printer",
    "name": {
      "es": "Conexión con impresora fiscal",
      "en": "Fiscal printer connection", "pt": "Conexão com impressora fiscal"
    },
    "desc": {
      "es": "Imprime facturas fiscales desde el sistema.",
      "en": "Print fiscal receipts from the system.", "pt": "Imprima cupons fiscais pelo sistema."
    },
    "kind": "one_time",
    "price": 80,
    "perUnit": false
  },
  "data_import": {
    "id": "data_import",
    "name": {
      "es": "Carga de tus datos desde Excel",
      "en": "Import your data from Excel", "pt": "Importar seus dados do Excel"
    },
    "desc": {
      "es": "Pasamos tus productos y clientes de Excel al sistema.",
      "en": "We move your products and customers from Excel into the system.", "pt": "Passamos seus produtos e clientes do Excel para o sistema."
    },
    "kind": "one_time",
    "price": 75,
    "perUnit": false
  },
  "onsite_training": {
    "id": "onsite_training",
    "name": {
      "es": "Capacitación presencial (por sesión)",
      "en": "On-site training (per session)", "pt": "Treinamento presencial (por sessão)"
    },
    "desc": {
      "es": "Vamos a tu negocio y entrenamos a tu equipo.",
      "en": "We visit your business and train your team.", "pt": "Visitamos seu negócio e treinamos sua equipe."
    },
    "kind": "one_time",
    "price": 60,
    "perUnit": true
  },
  "custom_report": {
    "id": "custom_report",
    "name": {
      "es": "Reporte a medida",
      "en": "Custom report", "pt": "Relatório personalizado"
    },
    "desc": {
      "es": "Un reporte diseñado para lo que necesitas ver.",
      "en": "A report designed around what you need to see.", "pt": "Um relatório feito para mostrar o que você precisa ver."
    },
    "kind": "one_time",
    "price": 60,
    "perUnit": true
  },
  "api_integration": {
    "id": "api_integration",
    "name": {
      "es": "Integración con otro sistema",
      "en": "Integration with another system", "pt": "Integração com outro sistema"
    },
    "desc": {
      "es": "Conectamos con tu contabilidad, banco u otro sistema.",
      "en": "We connect it to your accounting, bank or another system.", "pt": "Conectamos à sua contabilidade, banco ou outro sistema."
    },
    "kind": "one_time",
    "price": 250,
    "perUnit": false
  },
  "custom_domain": {
    "id": "custom_domain",
    "name": {
      "es": "Dominio propio (.com)",
      "en": "Your own domain (.com)", "pt": "Seu próprio domínio (.com)"
    },
    "desc": {
      "es": "tunegocio.com registrado a tu nombre, conectado y renovado por nosotros.",
      "en": "yourbusiness.com registered in your name, connected and renewed by us.", "pt": "seunegocio.com registrado em seu nome, conectado e renovado por nós."
    },
    "kind": "monthly",
    "price": 1.5,
    "perUnit": false
  },
  "business_email": {
    "id": "business_email",
    "name": {
      "es": "Correo empresarial con tu dominio",
      "en": "Business email on your domain", "pt": "E-mail profissional no seu domínio"
    },
    "desc": {
      "es": "Correos como ventas@tunegocio.com.",
      "en": "Emails like sales@yourbusiness.com.", "pt": "E-mails como vendas@seunegocio.com."
    },
    "kind": "one_time",
    "price": 40,
    "perUnit": false
  },
  "seo_pack": {
    "id": "seo_pack",
    "name": {
      "es": "Google Business y SEO inicial",
      "en": "Google Business profile and SEO setup", "pt": "Perfil no Google Empresa e SEO"
    },
    "desc": {
      "es": "Apareces en Google Maps y en las búsquedas.",
      "en": "Show up on Google Maps and in searches.", "pt": "Apareça no Google Maps e nas buscas."
    },
    "kind": "one_time",
    "price": 120,
    "perUnit": false
  },
  "extra_pages": {
    "id": "extra_pages",
    "name": {
      "es": "Página adicional",
      "en": "Extra page", "pt": "Página extra"
    },
    "desc": {
      "es": "Una página más en tu sitio.",
      "en": "One more page on your site.", "pt": "Mais uma página no seu site."
    },
    "kind": "one_time",
    "price": 40,
    "perUnit": true
  },
  "online_payments": {
    "id": "online_payments",
    "name": {
      "es": "Pagos en línea (USDT o tarjeta)",
      "en": "Online payments (USDT or card)", "pt": "Pagamentos online (USDT ou cartão)"
    },
    "desc": {
      "es": "Tus clientes pagan directamente en el sitio.",
      "en": "Customers pay directly on your site.", "pt": "Seus clientes pagam direto no seu site."
    },
    "kind": "one_time",
    "price": 150,
    "perUnit": false
  },
  "store_publishing": {
    "id": "store_publishing",
    "name": {
      "es": "Publicación en Play Store y App Store",
      "en": "Publishing on Play Store and App Store", "pt": "Publicação na Play Store e App Store"
    },
    "desc": {
      "es": "La subimos a las tiendas con tu cuenta.",
      "en": "We publish it to the stores under your account.", "pt": "Publicamos nas lojas com a sua conta."
    },
    "kind": "one_time",
    "price": 250,
    "perUnit": false
  },
  "extra_screens": {
    "id": "extra_screens",
    "name": {
      "es": "Pantalla adicional",
      "en": "Extra screen", "pt": "Tela extra"
    },
    "desc": {
      "es": "Una pantalla más en tu app.",
      "en": "One more screen in your app.", "pt": "Mais uma tela no seu app."
    },
    "kind": "one_time",
    "price": 60,
    "perUnit": true
  },
  "extra_conversations": {
    "id": "extra_conversations",
    "name": {
      "es": "+1.000 conversaciones al mes",
      "en": "+1,000 conversations/month", "pt": "+1.000 conversas/mês"
    },
    "desc": {
      "es": "Más mensajes atendidos cada mes.",
      "en": "More messages answered each month.", "pt": "Mais mensagens respondidas por mês."
    },
    "kind": "monthly",
    "price": 15,
    "perUnit": true
  },
  "custom_branding": {
    "id": "custom_branding",
    "name": {
      "es": "Tu logo y colores",
      "en": "Your logo and colors", "pt": "Seu logo e suas cores"
    },
    "desc": {
      "es": "El sistema con la identidad de tu marca.",
      "en": "The system with your brand identity.", "pt": "O sistema com a identidade da sua marca."
    },
    "kind": "one_time",
    "price": 40,
    "perUnit": false
  },
  "priority_support": {
    "id": "priority_support",
    "name": {
      "es": "Soporte prioritario",
      "en": "Priority support", "pt": "Suporte prioritário"
    },
    "desc": {
      "es": "Respuesta en menos de 2 horas, también fines de semana.",
      "en": "Replies within 2 hours, weekends included.", "pt": "Respostas em até 2 horas, inclusive fins de semana."
    },
    "kind": "monthly",
    "price": 25,
    "perUnit": false
  }
};

export const pricingBySlug: Record<string, Pricing> = {
  "web-con-ia": {"group": "aibuilder", "billing": ["monthly", "yearly"], "plans": [{"id": "starter", "name": {"es": "Web con IA", "en": "AI website", "pt": "Site com IA"}, "monthly": 7, "setup": 0, "includes": [{"es": "Tu web en tunombre.sylkit.com, con SSL", "en": "Your site on yourname.sylkit.com, with SSL", "pt": "Seu site em seunome.sylkit.com, com SSL"}, {"es": "Botón de WhatsApp en todas las páginas", "en": "WhatsApp button on every page", "pt": "Botão de WhatsApp em todas as páginas"}, {"es": "Cambios ilimitados con IA (uso justo)", "en": "Changes with AI anytime (fair use)", "pt": "Mudanças com IA quando quiser (uso justo)"}, {"es": "Agrega tu propio .com cuando quieras", "en": "Add your own .com whenever you want", "pt": "Adicione seu próprio .com quando quiser"}], "popular": true}], "addons": []},
  "dominio-y-correo": {"group": "domain", "billing": ["yearly"], "plans": [{"id": "starter", "name": {"es": "Solo dominio", "en": "Domain only", "pt": "Só domínio"}, "monthly": 1.5, "setup": 0, "includes": [{"es": ".com, .net o .org registrado a tu nombre", "en": ".com, .net or .org registered in your name", "pt": ".com, .net ou .org registrado em seu nome"}, {"es": "Lo conectamos a tu sitio o sistema", "en": "We connect it to your site or system", "pt": "Conectamos ao seu site ou sistema"}, {"es": "Renovación automática: nunca se vence por olvido", "en": "Auto-renewal, it never expires by accident", "pt": "Renovação automática, nunca vence por esquecimento"}, {"es": "Transferencia gratis si te vas", "en": "Free transfer if you ever leave", "pt": "Transferência grátis se você sair"}], "popular": false}, {"id": "business", "name": {"es": "Dominio + correo", "en": "Domain + email", "pt": "Domínio + e-mail"}, "monthly": 5, "setup": 30, "includes": [{"es": "Tu dominio a tu nombre", "en": "Your domain in your name", "pt": "Seu domínio em seu nome"}, {"es": "Hasta 5 correos (ventas@tunegocio.com)", "en": "Up to 5 email addresses (sales@yourbusiness.com)", "pt": "Até 5 endereços de e-mail (vendas@seunegocio.com)"}, {"es": "Configurado en tu teléfono y computadora", "en": "Set up on your phone and computer", "pt": "Configurado no seu celular e computador"}, {"es": "Protección contra spam y virus", "en": "Spam and virus protection", "pt": "Proteção contra spam e vírus"}], "popular": true}, {"id": "pro", "name": {"es": "Dominio + correo + página", "en": "Domain + email + page", "pt": "Domínio + e-mail + página"}, "monthly": 9, "setup": 100, "includes": [{"es": "Todo lo de Dominio + correo", "en": "Everything in Domain + email", "pt": "Tudo do Domínio + e-mail"}, {"es": "Página web de 1 sección con botón de WhatsApp", "en": "1-page website with WhatsApp button", "pt": "Site de 1 página com botão de WhatsApp"}, {"es": "Perfil de Google Business", "en": "Google Business profile", "pt": "Perfil no Google Empresa"}, {"es": "Soporte prioritario", "en": "Priority support", "pt": "Suporte prioritário"}], "popular": false}], "addons": ["extra_mailboxes", "domain_transfer", "seo_pack", "priority_support"]},
  "hosting-web": {"group": "hosting", "billing": ["yearly", "monthly"], "plans": [{"id": "starter", "name": {"es": "Básico", "en": "Basic", "pt": "Básico"}, "monthly": 7, "setup": 30, "includes": [{"es": "Página o sitio estático", "en": "Landing page or static site", "pt": "Página de destino ou site estático"}, {"es": "SSL gratis y red global rápida", "en": "Free SSL and fast global network", "pt": "SSL grátis e rede global rápida"}, {"es": "Monitoreo de disponibilidad", "en": "Uptime monitoring", "pt": "Monitoramento de disponibilidade"}, {"es": "Soporte por correo", "en": "Email support", "pt": "Suporte por e-mail"}], "popular": false}, {"id": "business", "name": {"es": "Negocio", "en": "Business", "pt": "Negócio"}, "monthly": 15, "setup": 50, "includes": [{"es": "Sitio con formularios o base de datos pequeña", "en": "Site with forms or a small database", "pt": "Site com formulários ou um pequeno banco de dados"}, {"es": "Copias de seguridad semanales", "en": "Weekly backups", "pt": "Backups semanais"}, {"es": "Actualizaciones y arreglos mensuales", "en": "Monthly updates and fixes", "pt": "Atualizações e correções mensais"}, {"es": "Soporte por WhatsApp", "en": "WhatsApp support", "pt": "Suporte por WhatsApp"}], "popular": true}, {"id": "pro", "name": {"es": "Pro", "en": "Pro", "pt": "Pro"}, "monthly": 29, "setup": 80, "includes": [{"es": "App web o tienda en línea", "en": "Web app or online store", "pt": "App web ou loja online"}, {"es": "Copias de seguridad diarias", "en": "Daily backups", "pt": "Backups diários"}, {"es": "Monitoreo de seguridad", "en": "Security monitoring", "pt": "Monitoramento de segurança"}, {"es": "Soporte prioritario", "en": "Priority support", "pt": "Suporte prioritário"}], "popular": false}], "addons": ["site_migration", "custom_domain", "business_email", "seo_pack", "priority_support"]},
  "alertas-de-vencimiento": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 19,
        "setup": 59,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours", "pt": "Suporte por WhatsApp em horário comercial"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 45,
        "setup": 119,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 79,
        "setup": 179,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "punto-de-venta": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 19,
        "setup": 59,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours", "pt": "Suporte por WhatsApp em horário comercial"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 45,
        "setup": 119,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 79,
        "setup": 179,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "fiscal_printer",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "control-de-inventario": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 19,
        "setup": 59,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours", "pt": "Suporte por WhatsApp em horário comercial"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 45,
        "setup": 119,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 79,
        "setup": 179,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "farmacia-pos": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 29,
        "setup": 79,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte: respuesta el siguiente día hábil",
            "en": "Support: reply by the next business day", "pt": "Suporte: resposta no próximo dia útil"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 49,
        "setup": 129,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Soporte el mismo día en horario laboral",
            "en": "Same-day support during office hours", "pt": "Suporte no mesmo dia em horário comercial"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 79,
        "setup": 199,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte con máxima prioridad en horario laboral",
            "en": "Highest-priority support during office hours", "pt": "Suporte com prioridade máxima em horário comercial"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "fiscal_printer",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "clinica-citas-historias": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 35,
        "setup": 99,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours", "pt": "Suporte por WhatsApp em horário comercial"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 59,
        "setup": 149,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 99,
        "setup": 279,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "restaurante-menu-qr": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 25,
        "setup": 79,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours", "pt": "Suporte por WhatsApp em horário comercial"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 49,
        "setup": 129,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 89,
        "setup": 199,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "fiscal_printer",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "salon-barberia-reservas": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 19,
        "setup": 59,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours", "pt": "Suporte por WhatsApp em horário comercial"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 45,
        "setup": 99,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 79,
        "setup": 149,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "taller-mecanico": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 19,
        "setup": 59,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours", "pt": "Suporte por WhatsApp em horário comercial"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 45,
        "setup": 119,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 79,
        "setup": 179,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "servicios-a-domicilio": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 25,
        "setup": 79,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours", "pt": "Suporte por WhatsApp em horário comercial"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 49,
        "setup": 129,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 89,
        "setup": 199,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "gestion-escolar": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 35,
        "setup": 119,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours", "pt": "Suporte por WhatsApp em horário comercial"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 69,
        "setup": 219,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 119,
        "setup": 399,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "nomina-asistencia": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 19,
        "setup": 59,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours", "pt": "Suporte por WhatsApp em horário comercial"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 45,
        "setup": 119,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 79,
        "setup": 179,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "facturacion": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 19,
        "setup": 49,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users", "pt": "1 unidade · até 3 usuários"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features", "pt": "Todas as funções principais"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours", "pt": "Suporte por WhatsApp em horário comercial"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included", "pt": "Atualizações incluídas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 45,
        "setup": 79,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users", "pt": "Até 3 unidades · 10 usuários"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports", "pt": "Relatórios avançados"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team", "pt": "Treinamento online para sua equipe"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 79,
        "setup": 129,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users", "pt": "Unidades e usuários ilimitados"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups", "pt": "Backups diários"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business", "pt": "Tudo do Negócio"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "extra_branch",
      "extra_users",
      "whatsapp_alerts",
      "mobile_app",
      "data_import",
      "onsite_training",
      "custom_report",
      "api_integration",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  },
  "tienda-online-whatsapp": {
    "group": "store",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 19,
        "setup": 99,
        "includes": [
          {
            "es": "Hasta 50 productos",
            "en": "Up to 50 products", "pt": "Até 50 produtos"
          },
          {
            "es": "Pedidos por WhatsApp",
            "en": "Orders via WhatsApp", "pt": "Pedidos por WhatsApp"
          },
          {
            "es": "Hosting y SSL incluidos",
            "en": "Hosting and SSL included", "pt": "Hospedagem e SSL incluídos"
          },
          {
            "es": "Panel de pedidos",
            "en": "Orders panel", "pt": "Painel de pedidos"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 45,
        "setup": 179,
        "includes": [
          {
            "es": "Hasta 500 productos",
            "en": "Up to 500 products", "pt": "Até 500 produtos"
          },
          {
            "es": "Control de existencias",
            "en": "Stock control", "pt": "Controle de estoque"
          },
          {
            "es": "Cupones de descuento",
            "en": "Discount coupons", "pt": "Cupons de desconto"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 79,
        "setup": 279,
        "includes": [
          {
            "es": "Productos ilimitados",
            "en": "Unlimited products", "pt": "Produtos ilimitados"
          },
          {
            "es": "Varios vendedores o sucursales",
            "en": "Multiple sellers or branches", "pt": "Vários vendedores ou unidades"
          },
          {
            "es": "Reportes de ventas",
            "en": "Sales reports", "pt": "Relatórios de vendas"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "data_import",
      "api_integration",
      "custom_domain",
      "business_email",
      "seo_pack",
      "online_payments",
      "priority_support"
    ]
  },
  "sitio-web-personal": {
    "group": "web",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 12,
        "setup": 149,
        "includes": [
          {
            "es": "Sitio de 1 página",
            "en": "1-page site", "pt": "Site de 1 página"
          },
          {
            "es": "Hosting y SSL incluidos",
            "en": "Hosting and SSL included", "pt": "Hospedagem e SSL incluídos"
          },
          {
            "es": "Botón de WhatsApp",
            "en": "WhatsApp button", "pt": "Botão de WhatsApp"
          },
          {
            "es": "1 cambio al mes",
            "en": "1 change per month", "pt": "1 alteração por mês"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 19,
        "setup": 249,
        "includes": [
          {
            "es": "Hasta 5 páginas",
            "en": "Up to 5 pages", "pt": "Até 5 páginas"
          },
          {
            "es": "Formulario de contacto",
            "en": "Contact form", "pt": "Formulário de contato"
          },
          {
            "es": "Estadísticas de visitas",
            "en": "Visitor analytics", "pt": "Estatísticas de visitantes"
          },
          {
            "es": "3 cambios al mes",
            "en": "3 changes per month", "pt": "3 alterações por mês"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 29,
        "setup": 449,
        "includes": [
          {
            "es": "Hasta 10 páginas, tienda o reservas",
            "en": "Up to 10 pages, store or bookings", "pt": "Até 10 páginas, loja ou agendamentos"
          },
          {
            "es": "Posicionamiento básico en Google",
            "en": "Basic Google SEO", "pt": "SEO básico no Google"
          },
          {
            "es": "Cambios ilimitados",
            "en": "Unlimited changes", "pt": "Alterações ilimitadas"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "custom_domain",
      "business_email",
      "seo_pack",
      "extra_pages",
      "online_payments",
      "priority_support"
    ]
  },
  "sitio-web-para-negocios": {
    "group": "web",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 15,
        "setup": 199,
        "includes": [
          {
            "es": "Sitio de 1 página",
            "en": "1-page site", "pt": "Site de 1 página"
          },
          {
            "es": "Hosting y SSL incluidos",
            "en": "Hosting and SSL included", "pt": "Hospedagem e SSL incluídos"
          },
          {
            "es": "Botón de WhatsApp",
            "en": "WhatsApp button", "pt": "Botão de WhatsApp"
          },
          {
            "es": "1 cambio al mes",
            "en": "1 change per month", "pt": "1 alteração por mês"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 25,
        "setup": 399,
        "includes": [
          {
            "es": "Hasta 5 páginas",
            "en": "Up to 5 pages", "pt": "Até 5 páginas"
          },
          {
            "es": "Formulario de contacto",
            "en": "Contact form", "pt": "Formulário de contato"
          },
          {
            "es": "Estadísticas de visitas",
            "en": "Visitor analytics", "pt": "Estatísticas de visitantes"
          },
          {
            "es": "3 cambios al mes",
            "en": "3 changes per month", "pt": "3 alterações por mês"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 39,
        "setup": 699,
        "includes": [
          {
            "es": "Hasta 10 páginas, tienda o reservas",
            "en": "Up to 10 pages, store or bookings", "pt": "Até 10 páginas, loja ou agendamentos"
          },
          {
            "es": "Posicionamiento básico en Google",
            "en": "Basic Google SEO", "pt": "SEO básico no Google"
          },
          {
            "es": "Cambios ilimitados",
            "en": "Unlimited changes", "pt": "Alterações ilimitadas"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "custom_domain",
      "business_email",
      "seo_pack",
      "extra_pages",
      "online_payments",
      "priority_support"
    ]
  },
  "app-movil-a-medida": {
    "group": "app",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 29,
        "setup": 1499,
        "includes": [
          {
            "es": "App sencilla (hasta 5 pantallas)",
            "en": "Simple app (up to 5 screens)", "pt": "App simples (até 5 telas)"
          },
          {
            "es": "Android",
            "en": "Android", "pt": "Android"
          },
          {
            "es": "Base de datos y hosting",
            "en": "Database and hosting", "pt": "Banco de dados e hospedagem"
          },
          {
            "es": "Mantenimiento incluido",
            "en": "Maintenance included", "pt": "Manutenção incluída"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 49,
        "setup": 2999,
        "includes": [
          {
            "es": "Hasta 12 pantallas",
            "en": "Up to 12 screens", "pt": "Até 12 telas"
          },
          {
            "es": "Android y iOS",
            "en": "Android and iOS", "pt": "Android e iOS"
          },
          {
            "es": "Panel de administración",
            "en": "Admin panel", "pt": "Painel de administração"
          },
          {
            "es": "Notificaciones push",
            "en": "Push notifications", "pt": "Notificações push"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 89,
        "setup": 5999,
        "includes": [
          {
            "es": "Pantallas ilimitadas",
            "en": "Unlimited screens", "pt": "Telas ilimitadas"
          },
          {
            "es": "Android, iOS y web",
            "en": "Android, iOS and web", "pt": "Android, iOS e web"
          },
          {
            "es": "Integraciones con tus sistemas",
            "en": "Integrations with your systems", "pt": "Integrações com seus sistemas"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "store_publishing",
      "extra_screens",
      "custom_branding",
      "priority_support"
    ]
  },
  "asistente-ia-para-negocios": {
    "group": "ai",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter", "pt": "Inicial"
        },
        "monthly": 35,
        "setup": 119,
        "includes": [
          {
            "es": "Hasta 500 conversaciones al mes",
            "en": "Up to 500 conversations/month", "pt": "Até 500 conversas/mês"
          },
          {
            "es": "1 número de WhatsApp",
            "en": "1 WhatsApp number", "pt": "1 número de WhatsApp"
          },
          {
            "es": "Entrenado con la información de tu negocio",
            "en": "Trained on your business information", "pt": "Treinado com as informações do seu negócio"
          },
          {
            "es": "Panel de conversaciones",
            "en": "Conversations panel", "pt": "Painel de conversas"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business", "pt": "Negócio"
        },
        "monthly": 69,
        "setup": 219,
        "includes": [
          {
            "es": "Hasta 2.000 conversaciones al mes",
            "en": "Up to 2,000 conversations/month", "pt": "Até 2.000 conversas/mês"
          },
          {
            "es": "Toma pedidos y reservas",
            "en": "Takes orders and bookings", "pt": "Recebe pedidos e agendamentos"
          },
          {
            "es": "Pasa a una persona cuando hace falta",
            "en": "Hands over to a person when needed", "pt": "Passa para uma pessoa quando necessário"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter", "pt": "Tudo do Inicial"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro", "pt": "Pro"
        },
        "monthly": 119,
        "setup": 399,
        "includes": [
          {
            "es": "Hasta 5.000 conversaciones al mes",
            "en": "Up to 5,000 conversations/month", "pt": "Até 5.000 conversas/mês"
          },
          {
            "es": "Varios números y canales",
            "en": "Multiple numbers and channels", "pt": "Vários números e canais"
          },
          {
            "es": "Integración con tu sistema",
            "en": "Integration with your system", "pt": "Integração com seu sistema"
          },
          {
            "es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API",
            "en": "Connect your own AI (Claude, OpenAI or other) with your API key", "pt": "Conecte sua própria IA (Claude, OpenAI ou outra) com sua chave de API"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support", "pt": "Suporte prioritário"
          }
        ],
        "popular": false
      }
    ],
    "addons": [
      "onsite_training",
      "api_integration",
      "extra_conversations",
      "custom_branding",
      "custom_domain",
      "priority_support"
    ]
  }
};
