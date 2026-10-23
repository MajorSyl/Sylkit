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
export const CARE_MONTHS = 3; // after year 1, optional care plan (hosting, updates, support) = monthly price × 3 per year

export const addonCatalog: Record<string, Addon> = {
  "extra_mailboxes": {"id": "extra_mailboxes", "name": {"es": "+5 correos adicionales", "en": "+5 email addresses"}, "desc": {"es": "Cinco direcciones de correo más con tu dominio.", "en": "Five more email addresses on your domain."}, "kind": "monthly", "price": 3, "perUnit": true},
  "domain_transfer": {"id": "domain_transfer", "name": {"es": "Traer un dominio que ya tienes", "en": "Move a domain you already own"}, "desc": {"es": "Lo transferimos a nuestra gestión; sigue siendo tuyo.", "en": "We transfer it into our management; it stays yours."}, "kind": "one_time", "price": 15, "perUnit": false},
  "site_migration": {"id": "site_migration", "name": {"es": "Mudanza de tu sitio actual", "en": "Move your current site"}, "desc": {"es": "Traemos tu sitio desde tu hosting actual sin perder nada.", "en": "We move your site from your current host without losing anything."}, "kind": "one_time", "price": 50, "perUnit": false},
  "extra_branch": {
    "id": "extra_branch",
    "name": {
      "es": "Sucursal adicional",
      "en": "Extra branch"
    },
    "desc": {
      "es": "Otra tienda o sede usando el mismo sistema.",
      "en": "Another store or location on the same system."
    },
    "kind": "monthly",
    "price": 10,
    "perUnit": true
  },
  "extra_users": {
    "id": "extra_users",
    "name": {
      "es": "Paquete de 5 usuarios",
      "en": "5 extra users"
    },
    "desc": {
      "es": "5 personas más con su propio usuario.",
      "en": "5 more people with their own login."
    },
    "kind": "monthly",
    "price": 5,
    "perUnit": true
  },
  "whatsapp_alerts": {
    "id": "whatsapp_alerts",
    "name": {
      "es": "Notificaciones por WhatsApp",
      "en": "WhatsApp notifications"
    },
    "desc": {
      "es": "Avisos automáticos por WhatsApp a ti o a tus clientes.",
      "en": "Automatic WhatsApp alerts to you or your customers."
    },
    "kind": "monthly",
    "price": 10,
    "perUnit": false
  },
  "mobile_app": {
    "id": "mobile_app",
    "name": {
      "es": "App móvil para tu equipo (Android/iOS)",
      "en": "Staff mobile app (Android/iOS)"
    },
    "desc": {
      "es": "Tu equipo usa el sistema desde su teléfono.",
      "en": "Your team uses the system from their phones."
    },
    "kind": "monthly",
    "price": 10,
    "perUnit": false
  },
  "fiscal_printer": {
    "id": "fiscal_printer",
    "name": {
      "es": "Conexión con impresora fiscal",
      "en": "Fiscal printer connection"
    },
    "desc": {
      "es": "Imprime facturas fiscales desde el sistema.",
      "en": "Print fiscal receipts from the system."
    },
    "kind": "one_time",
    "price": 80,
    "perUnit": false
  },
  "data_import": {
    "id": "data_import",
    "name": {
      "es": "Carga de tus datos desde Excel",
      "en": "Import your data from Excel"
    },
    "desc": {
      "es": "Pasamos tus productos y clientes de Excel al sistema.",
      "en": "We move your products and customers from Excel into the system."
    },
    "kind": "one_time",
    "price": 50,
    "perUnit": false
  },
  "onsite_training": {
    "id": "onsite_training",
    "name": {
      "es": "Capacitación presencial (por sesión)",
      "en": "On-site training (per session)"
    },
    "desc": {
      "es": "Vamos a tu negocio y entrenamos a tu equipo.",
      "en": "We visit your business and train your team."
    },
    "kind": "one_time",
    "price": 40,
    "perUnit": true
  },
  "custom_report": {
    "id": "custom_report",
    "name": {
      "es": "Reporte a medida",
      "en": "Custom report"
    },
    "desc": {
      "es": "Un reporte diseñado para lo que necesitas ver.",
      "en": "A report designed around what you need to see."
    },
    "kind": "one_time",
    "price": 60,
    "perUnit": true
  },
  "api_integration": {
    "id": "api_integration",
    "name": {
      "es": "Integración con otro sistema",
      "en": "Integration with another system"
    },
    "desc": {
      "es": "Conectamos con tu contabilidad, banco u otro sistema.",
      "en": "We connect it to your accounting, bank or another system."
    },
    "kind": "one_time",
    "price": 150,
    "perUnit": false
  },
  "custom_domain": {
    "id": "custom_domain",
    "name": {
      "es": "Dominio propio (.com)",
      "en": "Your own domain (.com)"
    },
    "desc": {
      "es": "tunegocio.com registrado a tu nombre, conectado y renovado por nosotros.",
      "en": "yourbusiness.com registered in your name, connected and renewed by us."
    },
    "kind": "monthly",
    "price": 2,
    "perUnit": false
  },
  "business_email": {
    "id": "business_email",
    "name": {
      "es": "Correo empresarial con tu dominio",
      "en": "Business email on your domain"
    },
    "desc": {
      "es": "Correos como ventas@tunegocio.com.",
      "en": "Emails like sales@yourbusiness.com."
    },
    "kind": "one_time",
    "price": 40,
    "perUnit": false
  },
  "seo_pack": {
    "id": "seo_pack",
    "name": {
      "es": "Google Business y SEO inicial",
      "en": "Google Business profile and SEO setup"
    },
    "desc": {
      "es": "Apareces en Google Maps y en las búsquedas.",
      "en": "Show up on Google Maps and in searches."
    },
    "kind": "one_time",
    "price": 80,
    "perUnit": false
  },
  "extra_pages": {
    "id": "extra_pages",
    "name": {
      "es": "Página adicional",
      "en": "Extra page"
    },
    "desc": {
      "es": "Una página más en tu sitio.",
      "en": "One more page on your site."
    },
    "kind": "one_time",
    "price": 30,
    "perUnit": true
  },
  "online_payments": {
    "id": "online_payments",
    "name": {
      "es": "Pagos en línea (USDT o tarjeta)",
      "en": "Online payments (USDT or card)"
    },
    "desc": {
      "es": "Tus clientes pagan directamente en el sitio.",
      "en": "Customers pay directly on your site."
    },
    "kind": "one_time",
    "price": 120,
    "perUnit": false
  },
  "store_publishing": {
    "id": "store_publishing",
    "name": {
      "es": "Publicación en Play Store y App Store",
      "en": "Publishing on Play Store and App Store"
    },
    "desc": {
      "es": "La subimos a las tiendas con tu cuenta.",
      "en": "We publish it to the stores under your account."
    },
    "kind": "one_time",
    "price": 150,
    "perUnit": false
  },
  "extra_screens": {
    "id": "extra_screens",
    "name": {
      "es": "Pantalla adicional",
      "en": "Extra screen"
    },
    "desc": {
      "es": "Una pantalla más en tu app.",
      "en": "One more screen in your app."
    },
    "kind": "one_time",
    "price": 60,
    "perUnit": true
  },
  "extra_conversations": {
    "id": "extra_conversations",
    "name": {
      "es": "+1.000 conversaciones al mes",
      "en": "+1,000 conversations/month"
    },
    "desc": {
      "es": "Más mensajes atendidos cada mes.",
      "en": "More messages answered each month."
    },
    "kind": "monthly",
    "price": 15,
    "perUnit": true
  },
  "custom_branding": {
    "id": "custom_branding",
    "name": {
      "es": "Tu logo y colores",
      "en": "Your logo and colors"
    },
    "desc": {
      "es": "El sistema con la identidad de tu marca.",
      "en": "The system with your brand identity."
    },
    "kind": "one_time",
    "price": 40,
    "perUnit": false
  },
  "priority_support": {
    "id": "priority_support",
    "name": {
      "es": "Soporte prioritario",
      "en": "Priority support"
    },
    "desc": {
      "es": "Respuesta en menos de 2 horas, también fines de semana.",
      "en": "Replies within 2 hours, weekends included."
    },
    "kind": "monthly",
    "price": 15,
    "perUnit": false
  }
};

export const pricingBySlug: Record<string, Pricing> = {
  "dominio-y-correo": {"group": "domain", "billing": ["yearly"], "plans": [{"id": "starter", "name": {"es": "Solo dominio", "en": "Domain only"}, "monthly": 2.5, "setup": 0, "includes": [{"es": ".com, .net o .org registrado a tu nombre", "en": ".com, .net or .org registered in your name"}, {"es": "Lo conectamos a tu sitio o sistema", "en": "We connect it to your site or system"}, {"es": "Renovación automática: nunca se vence por olvido", "en": "Auto-renewal, it never expires by accident"}, {"es": "Transferencia gratis si te vas", "en": "Free transfer if you ever leave"}], "popular": false}, {"id": "business", "name": {"es": "Dominio + correo", "en": "Domain + email"}, "monthly": 6, "setup": 40, "includes": [{"es": "Tu dominio a tu nombre", "en": "Your domain in your name"}, {"es": "Hasta 5 correos (ventas@tunegocio.com)", "en": "Up to 5 email addresses (sales@yourbusiness.com)"}, {"es": "Configurado en tu teléfono y computadora", "en": "Set up on your phone and computer"}, {"es": "Protección contra spam y virus", "en": "Spam and virus protection"}], "popular": true}, {"id": "pro", "name": {"es": "Dominio + correo + página", "en": "Domain + email + page"}, "monthly": 10, "setup": 120, "includes": [{"es": "Todo lo de Dominio + correo", "en": "Everything in Domain + email"}, {"es": "Página web de 1 sección con botón de WhatsApp", "en": "1-page website with WhatsApp button"}, {"es": "Perfil de Google Business", "en": "Google Business profile"}, {"es": "Soporte prioritario", "en": "Priority support"}], "popular": false}], "addons": ["extra_mailboxes", "domain_transfer", "seo_pack", "priority_support"]},
  "hosting-web": {"group": "hosting", "billing": ["yearly", "monthly"], "plans": [{"id": "starter", "name": {"es": "Básico", "en": "Basic"}, "monthly": 5, "setup": 30, "includes": [{"es": "Página o sitio estático", "en": "Landing page or static site"}, {"es": "SSL gratis y red global rápida", "en": "Free SSL and fast global network"}, {"es": "Monitoreo de disponibilidad", "en": "Uptime monitoring"}, {"es": "Soporte por correo", "en": "Email support"}], "popular": false}, {"id": "business", "name": {"es": "Negocio", "en": "Business"}, "monthly": 10, "setup": 50, "includes": [{"es": "Sitio con formularios o base de datos pequeña", "en": "Site with forms or a small database"}, {"es": "Copias de seguridad semanales", "en": "Weekly backups"}, {"es": "Actualizaciones y arreglos mensuales", "en": "Monthly updates and fixes"}, {"es": "Soporte por WhatsApp", "en": "WhatsApp support"}], "popular": true}, {"id": "pro", "name": {"es": "Pro", "en": "Pro"}, "monthly": 20, "setup": 80, "includes": [{"es": "App web o tienda en línea", "en": "Web app or online store"}, {"es": "Copias de seguridad diarias", "en": "Daily backups"}, {"es": "Monitoreo de seguridad", "en": "Security monitoring"}, {"es": "Soporte prioritario", "en": "Priority support"}], "popular": false}], "addons": ["site_migration", "custom_domain", "business_email", "seo_pack", "priority_support"]},
  "alertas-de-vencimiento": {
    "group": "system",
    "plans": [
      {
        "id": "starter",
        "name": {
          "es": "Inicial",
          "en": "Starter"
        },
        "monthly": 15,
        "setup": 50,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 29,
        "setup": 100,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 49,
        "setup": 150,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 15,
        "setup": 50,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 29,
        "setup": 100,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 49,
        "setup": 150,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 15,
        "setup": 50,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 29,
        "setup": 100,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 49,
        "setup": 150,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 25,
        "setup": 80,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 45,
        "setup": 150,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 69,
        "setup": 250,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 25,
        "setup": 80,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 45,
        "setup": 150,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 79,
        "setup": 250,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 19,
        "setup": 60,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 35,
        "setup": 120,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 59,
        "setup": 200,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 12,
        "setup": 40,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 25,
        "setup": 80,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 39,
        "setup": 120,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 15,
        "setup": 50,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 29,
        "setup": 100,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 49,
        "setup": 150,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 19,
        "setup": 60,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 35,
        "setup": 120,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 59,
        "setup": 200,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 29,
        "setup": 100,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 59,
        "setup": 200,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 99,
        "setup": 350,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 15,
        "setup": 50,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 29,
        "setup": 100,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 49,
        "setup": 150,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 9,
        "setup": 30,
        "includes": [
          {
            "es": "1 sucursal · hasta 3 usuarios",
            "en": "1 branch · up to 3 users"
          },
          {
            "es": "Todas las funciones principales",
            "en": "All core features"
          },
          {
            "es": "Soporte por WhatsApp en horario laboral",
            "en": "WhatsApp support in business hours"
          },
          {
            "es": "Actualizaciones incluidas",
            "en": "Updates included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 19,
        "setup": 60,
        "includes": [
          {
            "es": "Hasta 3 sucursales · 10 usuarios",
            "en": "Up to 3 branches · 10 users"
          },
          {
            "es": "Reportes avanzados",
            "en": "Advanced reports"
          },
          {
            "es": "Capacitación en línea para tu equipo",
            "en": "Online training for your team"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 35,
        "setup": 100,
        "includes": [
          {
            "es": "Sucursales y usuarios ilimitados",
            "en": "Unlimited branches and users"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
          },
          {
            "es": "Copias de seguridad diarias",
            "en": "Daily backups"
          },
          {
            "es": "Todo lo del plan Negocio",
            "en": "Everything in Business"
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
          "en": "Starter"
        },
        "monthly": 12,
        "setup": 80,
        "includes": [
          {
            "es": "Hasta 50 productos",
            "en": "Up to 50 products"
          },
          {
            "es": "Pedidos por WhatsApp",
            "en": "Orders via WhatsApp"
          },
          {
            "es": "Hosting y SSL incluidos",
            "en": "Hosting and SSL included"
          },
          {
            "es": "Panel de pedidos",
            "en": "Orders panel"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 25,
        "setup": 150,
        "includes": [
          {
            "es": "Hasta 500 productos",
            "en": "Up to 500 products"
          },
          {
            "es": "Control de existencias",
            "en": "Stock control"
          },
          {
            "es": "Cupones de descuento",
            "en": "Discount coupons"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 45,
        "setup": 250,
        "includes": [
          {
            "es": "Productos ilimitados",
            "en": "Unlimited products"
          },
          {
            "es": "Varios vendedores o sucursales",
            "en": "Multiple sellers or branches"
          },
          {
            "es": "Reportes de ventas",
            "en": "Sales reports"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
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
          "en": "Starter"
        },
        "monthly": 8,
        "setup": 120,
        "includes": [
          {
            "es": "Sitio de 1 página",
            "en": "1-page site"
          },
          {
            "es": "Hosting y SSL incluidos",
            "en": "Hosting and SSL included"
          },
          {
            "es": "Botón de WhatsApp",
            "en": "WhatsApp button"
          },
          {
            "es": "1 cambio al mes",
            "en": "1 change per month"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 12,
        "setup": 200,
        "includes": [
          {
            "es": "Hasta 5 páginas",
            "en": "Up to 5 pages"
          },
          {
            "es": "Formulario de contacto",
            "en": "Contact form"
          },
          {
            "es": "Estadísticas de visitas",
            "en": "Visitor analytics"
          },
          {
            "es": "3 cambios al mes",
            "en": "3 changes per month"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 19,
        "setup": 350,
        "includes": [
          {
            "es": "Hasta 10 páginas, tienda o reservas",
            "en": "Up to 10 pages, store or bookings"
          },
          {
            "es": "Posicionamiento básico en Google",
            "en": "Basic Google SEO"
          },
          {
            "es": "Cambios ilimitados",
            "en": "Unlimited changes"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
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
          "en": "Starter"
        },
        "monthly": 10,
        "setup": 150,
        "includes": [
          {
            "es": "Sitio de 1 página",
            "en": "1-page site"
          },
          {
            "es": "Hosting y SSL incluidos",
            "en": "Hosting and SSL included"
          },
          {
            "es": "Botón de WhatsApp",
            "en": "WhatsApp button"
          },
          {
            "es": "1 cambio al mes",
            "en": "1 change per month"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 15,
        "setup": 300,
        "includes": [
          {
            "es": "Hasta 5 páginas",
            "en": "Up to 5 pages"
          },
          {
            "es": "Formulario de contacto",
            "en": "Contact form"
          },
          {
            "es": "Estadísticas de visitas",
            "en": "Visitor analytics"
          },
          {
            "es": "3 cambios al mes",
            "en": "3 changes per month"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 25,
        "setup": 500,
        "includes": [
          {
            "es": "Hasta 10 páginas, tienda o reservas",
            "en": "Up to 10 pages, store or bookings"
          },
          {
            "es": "Posicionamiento básico en Google",
            "en": "Basic Google SEO"
          },
          {
            "es": "Cambios ilimitados",
            "en": "Unlimited changes"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
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
          "en": "Starter"
        },
        "monthly": 25,
        "setup": 900,
        "includes": [
          {
            "es": "App sencilla (hasta 5 pantallas)",
            "en": "Simple app (up to 5 screens)"
          },
          {
            "es": "Android",
            "en": "Android"
          },
          {
            "es": "Base de datos y hosting",
            "en": "Database and hosting"
          },
          {
            "es": "Mantenimiento incluido",
            "en": "Maintenance included"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 45,
        "setup": 1800,
        "includes": [
          {
            "es": "Hasta 12 pantallas",
            "en": "Up to 12 screens"
          },
          {
            "es": "Android y iOS",
            "en": "Android and iOS"
          },
          {
            "es": "Panel de administración",
            "en": "Admin panel"
          },
          {
            "es": "Notificaciones push",
            "en": "Push notifications"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 79,
        "setup": 3500,
        "includes": [
          {
            "es": "Pantallas ilimitadas",
            "en": "Unlimited screens"
          },
          {
            "es": "Android, iOS y web",
            "en": "Android, iOS and web"
          },
          {
            "es": "Integraciones con tus sistemas",
            "en": "Integrations with your systems"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
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
          "en": "Starter"
        },
        "monthly": 29,
        "setup": 100,
        "includes": [
          {
            "es": "Hasta 500 conversaciones al mes",
            "en": "Up to 500 conversations/month"
          },
          {
            "es": "1 número de WhatsApp",
            "en": "1 WhatsApp number"
          },
          {
            "es": "Entrenado con la información de tu negocio",
            "en": "Trained on your business information"
          },
          {
            "es": "Panel de conversaciones",
            "en": "Conversations panel"
          }
        ],
        "popular": false
      },
      {
        "id": "business",
        "name": {
          "es": "Negocio",
          "en": "Business"
        },
        "monthly": 59,
        "setup": 200,
        "includes": [
          {
            "es": "Hasta 2.000 conversaciones al mes",
            "en": "Up to 2,000 conversations/month"
          },
          {
            "es": "Toma pedidos y reservas",
            "en": "Takes orders and bookings"
          },
          {
            "es": "Pasa a una persona cuando hace falta",
            "en": "Hands over to a person when needed"
          },
          {
            "es": "Todo lo del plan Inicial",
            "en": "Everything in Starter"
          }
        ],
        "popular": true
      },
      {
        "id": "pro",
        "name": {
          "es": "Pro",
          "en": "Pro"
        },
        "monthly": 99,
        "setup": 350,
        "includes": [
          {
            "es": "Hasta 5.000 conversaciones al mes",
            "en": "Up to 5,000 conversations/month"
          },
          {
            "es": "Varios números y canales",
            "en": "Multiple numbers and channels"
          },
          {
            "es": "Integración con tu sistema",
            "en": "Integration with your system"
          },
          {
            "es": "Soporte prioritario",
            "en": "Priority support"
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
