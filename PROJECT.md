# Sylkit: Project Documentation

**Owner:** Sylvanus Fannah · **Site:** https://sylkit.com · **Business email:** sylvanus@sylkit.com · **Last updated:** 1 November 2026

Sylkit sells four things:
1. **Software for your business:** ready-made systems (POS, pharmacy, clinic, inventory…) used by subscription or bought once. Sylkit keeps ownership and maintains them.
2. **Domains & websites:** domains registered in the client's name, business email, website hosting.
3. **Own a business (startups):** whole online businesses built by Sylkit and sold outright. Only Sylkit sells there.
4. **Sylkit Shield (security):** security checks, fixes and monitoring for websites, apps and business systems (/security).

Clients pay by **card (Stripe)**, **USDT (automatic, via NOWPayments)** or manual methods. **Pago Móvil (Banco Mercantil)** is shown only to clients in Venezuela. **Zelle is not accepted** (switched off 2 Nov 2026).

---

## Brand (chosen 30 Oct 2026)

- **Logo:** the kit, a cube whose blue lid lifts off, plus the lowercase wordmark **sylkit**. The cube is the symbol, so it is never shown as an "S" next to the name. Component: `src/components/Logo.tsx`.
- **Files:** `public/brand/` (mark SVGs, 512px icon, WhatsApp/Instagram profile pictures in light and dark), `public/favicon.svg`, `public/apple-touch-icon.png`.
- **Colors:** graphite #1D1D1F, silver #F5F5F7, white, and Sylkit Blue #2558E8 only on the lid and main actions.
- Design canvas with all explored directions: Claude artifact "Sylkit Tech Logos".

## Latest updates (1 November 2026)
- **Catalog as a showroom:** the home page shows systems and design templates as big screenshot cards (name, category, price, "+" to buy), with a category dropdown with counts, sort, filters (live demo, Web, Android, iOS), one search bar and a large/grid view toggle. Domains and hosting stay out of the grid; they have their own entry and page.
- **Design templates:** 12 original designs: 8 online stores, 2 websites (architecture, real estate) and 2 matching mobile apps, at /templates with live previews.
- **Customer support:** help widget on every page (quick answers, AI assistant, talk to a person, track order, WhatsApp) and an inbox at Admin → Support. The header's WhatsApp button is now "Help".
- **Checkout:** one-page Shopify-style checkout, order page and printable invoice; "I already have a domain" now checks the domain is valid.
- **Portuguese:** the whole site follows the visitor's language (English, Spanish, Portuguese).

## 1. What is live

| Area | Status |
|---|---|
| Site (sylkit.com) | ✅ Catalog shown as a showroom of screenshot cards (category dropdown, sort, filters, search, large/grid view), product pages with real screenshots. Domains and hosting are kept out of the card grid |
| Catalog | ✅ 19 products in 10 categories |
| Live demos | ✅ 15 demos on their own subdomains (pos.sylkit.com…), each with its own brand, reset daily |
| Price calculator | ✅ Plans, extras and quantities; yearly / monthly / buy once; web address picker |
| **Direct checkout** | ✅ Fixed-price plans: Buy now → checkout → pay → track |
| Custom quotes | ✅ Custom projects: request → admin quote → accept → pay |
| **Crypto payments (USDT)** | ✅ NOWPayments, live mode, TRC20 and BEP20; confirmed automatically |
| Manual payments | ✅ Client chooses a method and reports the reference; admin confirms |
| Domains & hosting (/domains) | ✅ Live availability check for .com/.net/.org |
| Sylkit Shield (/security) | ✅ Security page, global price ladder, booking form → saved as a quote request (source `shield:<plan>`) |
| **Customer support (help widget + /admin/support)** | ✅ Chat bubble on every public page: quick answers, AI assistant (live catalog and prices, hands off to a person), "talk to a person" tickets, order tracking and WhatsApp. Tickets and replies live in Cloudflare D1 `sylkit-support` (worker `worker/support.js`); you reply from Admin → Support. Office hours Mon–Sat 9–18 Caracas. Phone push ✅ (`NTFY_TOPIC` set; subscribe to the topic in the ntfy app). ⏳ Still needs `ANTHROPIC_API_KEY` (AI assistant; until then the widget answers common questions itself) and `RESEND_API_KEY` (emails to you and to customers). Test: `node --no-warnings worker/test/support.test.mjs` |
| **Design templates (/templates)** | ✅ 12 original designs in three kinds. **Online stores** (8, product `tienda-online-whatsapp`): Lumen, Rosé, Volt, Horno, Fresco, Aurum, Nido, Patitas. **Websites** (product `sitio-web-para-negocios`): Plano (architecture), Habitat (real estate). **Mobile apps** (product `app-movil-a-medida`): Habitat app (search, favorites, visit booking), Plano app (portfolio, quote wizard, build tracking). Each website has a matching app. Live previews at /preview/<slug>/; picked on the product page or at checkout and saved on the order (`config.template`). Source: `scripts/build_store_templates.py` + `scripts/template_data_web_app.py` → `public/preview/`, `src/data/storeTemplates.ts`; engines in `public/_store/`, `public/_site/` (with `art.js` building illustrations) and `public/_app/` |
| Startups (/startups) | ⏸️ Paused 29 Oct 2026 to focus on selling. Code kept in `/paused`; /startups redirects home |
| Admin (/admin) | ✅ Orders, quotes, statuses, prices, extras, payment methods, marketplace |
| Business email | ✅ Zoho Mail on sylkit.com (MX, SPF, DKIM, DMARC set) |
| Automatic emails to clients | ⏳ Built; needs a Resend API key |
| Language | ✅ English, Spanish and Portuguese, chosen automatically: (1) `?lang=pt|es|en` in the link (remembered on that device), (2) the visitor's browser languages in their order, (3) their country from Cloudflare (`sk_cc` cookie: BR/PT/AO/MZ… → Portuguese, Spanish-speaking countries → Spanish), (4) English. No toggle, no location permission. Stripe's pages use the browser language (`locale: auto`). Live demos are still English/Spanish only. |

---

## 2. Technology

| Layer | Tool |
|---|---|
| App | Expo Router (React Native for web), static export |
| Hosting | Cloudflare Worker `sylkit` + static assets (account fannah2026) |
| Deploys | Automatic: every push to `main` on GitHub `MajorSyl/Sylkit` |
| Database and auth | Supabase project `chcljhwcvzlmxrrhetfv` (account fannah2026) |
| Crypto payments | NOWPayments API (live) |
| Email | Zoho Mail (people); Resend for automatic emails from `no-reply@sylkit.com` |
| Node | 22 (required by the build) |

### Worker (`worker/index.js` + `payments.js`, `stripe.js`, `orders.js`, `support.js`)
| Route | What it does |
|---|---|
| `/` and pages | Serves the site |
| `*.sylkit.com` demo subdomains | Serves each live demo |
| `GET /api/domain?name=x` | Domain availability via registry RDAP (free, no key) |
| `POST /api/pay/checkout` | Fixed-price order → confirmed at the server-calculated total |
| `POST /api/pay/create` | Creates a NOWPayments payment (price read from the database, never the browser); reuses an open one |
| `GET /api/pay/status?t=` | Current payment status; catches up if a webhook was missed |
| `POST /api/pay/ipn` | NOWPayments webhook; HMAC-SHA512 signature verified before any update |
| `GET /api/pay/health` | Shows whether keys are bound and accepted, coins enabled, minimums. Never shows key values |
| `/api/support/status`, `/ai`, `/ticket`, `/thread`, `/message` | Help widget: office hours, AI assistant answers, customer messages (rate-limited per visitor) |
| `/api/support/admin/*` | Support inbox for Admin → Support; checks the Supabase session is an admin |
| Daily cron | Pings Supabase so the free database never pauses |

### Cloudflare secrets (Worker → Settings → Variables and Secrets, type **Secret**)
| Name | Purpose |
|---|---|
| `NOWPAYMENTS_API_KEY` | NOWPayments live API key |
| `NOWPAYMENTS_IPN_SECRET` | Verifies NOWPayments webhooks |
| `SUPABASE_SERVICE_ROLE_KEY` | Lets the worker update orders after payment |
| `NOWPAYMENTS_SANDBOX` (optional, plain) | `true` switches to the NOWPayments test server |
| `NTFY_TOPIC` | ✅ Set. Phone push for new support messages (free ntfy app). Keep the topic name private |
| `ANTHROPIC_API_KEY` | ⏳ Turns on the AI assistant in the help widget (Claude Haiku 5.5, prepaid credits) |
| `RESEND_API_KEY` | ⏳ Emails: new-message alerts to you and your replies to customers |
| `SUPPORT_EMAIL` (optional, plain) | Where support alerts go (default sylvanus@sylkit.com) |

The support inbox is stored in the Cloudflare **D1** database `sylkit-support` (binding `SUPPORT_DB` in `wrangler.jsonc`).

`wrangler.jsonc` has `keep_vars: true`, so deploys never erase dashboard variables. **Never put keys in Build variables** (they're not available at runtime).

### Folders
```
app/                pages: index, product/[slug], checkout, order, invoice, quote, track, domains,
                    templates, security, admin/{index,order,products,listings,support}
src/components/     Header, Footer, Showroom (card catalog), HelpWidget (support), CheckoutFlow,
                    PlanCards, DomainPicker, CryptoPay, QuoteForm, AdminGate…
src/data/           products.ts, pricing.ts (fallback copies of catalog and prices)
src/lib/            supabase, catalog, pricing, listings, status
public/shots/       product screenshots and covers (webp)
public/demos/       the 15 live demos;  public/_kit/ demo engine
public/preview/     the 12 design templates; engines in public/_store, public/_site, public/_app
scripts/            build_store_templates.py (+ template_data_web_app.py) generates the templates
worker/             index.js, payments.js, stripe.js, orders.js, support.js; tests in worker/test/
supabase/           marketplace.sql (to apply)
```

---

## 3. How a client buys

### Fixed-price plans (systems, domains, hosting): Shopify-style, 4 steps
A step bar (Plan › Details › Payment › Done) sits at the top of every buying page.
1. **Plan** (product page): plan cards + yearly / monthly / buy-once switch → **Choose plan**.
2. **Details** (`/checkout`): one page. Left: contact (email, name, WhatsApp, business, country), web address, extras (folded), payment method. Right: order summary with "Total today" and renewal date (folds into a bar on phones). One button: **Pay $X**.
   - Payment methods come from `/api/order/methods` (card if `STRIPE_SECRET_KEY` is set, USDT if NOWPayments is set) plus the active rows in `payment_methods` (Pago Móvil, Binance Pay…). `src/lib/payOptions.ts` hides Pago Móvil unless the client is in Venezuela (Cloudflare `sk_cc=VE` cookie, Caracas time zone, or "Venezuela" typed as the country). Pago Móvil details are edited in Admin → Products and are not kept in this public repo.
3. **Payment**: card goes straight to Stripe's secure page; USDT and manual methods open the order page with only the chosen method (USDT address, or the method's details + a reference field). "Use a different payment method" switches.
4. **Done** (`/order?t=…`): "Thank you, name! Your payment is confirmed", what happens next (payment → setup → ready), order summary, **View invoice**, card/subscription management, activity.
- **Invoice** (`/invoice?t=…`): printable invoice (Print / Save as PDF), PAID or UNPAID stamp; card orders also link Stripe's official invoice PDF. Data from `GET /api/order/invoice?t=` (worker, service role, token holder only).
- Old `/track?t=…` and `/quote?product=…&plan=…` links still work (they open the new pages).

### Custom projects
Request a quote → admin sends price → client accepts → pays (same payment box) → delivery.

**Order statuses:** new → quoted → accepted → payment_submitted → paid → in_progress → delivered (or cancelled).

---

## 4. Pricing rules (browser and database use the same rules)

- **Monthly total** = plan monthly + monthly extras × quantity
- **One-time total** = plan setup + one-time extras × quantity
- **Yearly (default):** monthly × 10 (2 months free)
- **Monthly:** monthly total each month
- **Buy once:** license = monthly × 30 + one-time items; includes 12 months of support; optional care plan from year 2 = monthly × 3 per year
- **Due today** = one-time + first payment (or license)
- Domains are yearly only; hosting is yearly or monthly.

### Plans (monthly / one-time setup, USD)

Prices set on 2 Nov 2026 (`supabase/price_update_2026-11-02.sql`, replaces the 30 Oct 3% raise). Domains, hosting, extras and Shield were not changed. Yearly = monthly × 10, buy once = monthly × 30 (+ care from year 2 = monthly × 3/yr). Business is the recommended plan everywhere.

| Product | Starter | Business | Pro |
|---|---|---|---|
| **Pharmacy** | 29 / 79 | 49 / 129 | 79 / 199 |
| Expiry Alerts, POS, Inventory, Car workshop, Payroll | 19 / 59 | 35 / 119 | 59 / 179 |
| Clinic | 29 / 99 | 49 / 149 | 89 / 279 |
| Restaurant, Home services | 25 / 79 | 39 / 129 | 69 / 199 |
| Salon & barbershop | 19 / 59 | 29 / 99 | 49 / 149 |
| School management | 35 / 119 | 69 / 219 | 119 / 399 |
| Invoicing | 15 / 49 | 25 / 79 | 45 / 129 |
| Online store | 19 / 99 | 35 / 179 | 59 / 279 |
| Personal website | 12 / 149 | 19 / 249 | 29 / 399 |
| Business website | 15 / 179 | 25 / 349 | 39 / 549 |
| Custom mobile app | 29 / 999 | 49 / 1,999 | 89 / 3,799 |
| AI assistant | 35 / 119 | 69 / 219 | 119 / 399 |
| **Domain & business email** (yearly) | **$15/yr**, no setup | **$50/yr** + $30 | **$90/yr** + $100 |
| **Website hosting** | 5 / 30 | 10 / 50 | 20 / 80 |

### Pharmacy packaging (founding offer)
- **First 10 founding pharmacies:** setup fee waived ($0), free data import + training, 60-day guarantee, price locked for 12 months. Shown on the site as the badge "10 founding pharmacies: $0 setup" and in the product description. Checkout still charges the normal setup, so for a founding pharmacy set the order total in Admin (or send a custom quote) with setup at $0.
- **Recommended plan:** Business.
- **Support levels:** Starter → reply by the next business day · Business → same day during office hours · Pro → highest priority during office hours. Office hours: Mon–Sat 9:00–18:00 Caracas.
- **Bring your own AI:** Pharmacy and Clinic (Business, Pro) and the Pro plan of the other business systems say customers can connect their own AI (Claude, OpenAI or other) with their API key for advanced features.

### Extras
Monthly: extra branch $10 · 5 extra users $5 · WhatsApp alerts $10 · staff mobile app $10 · own domain $1.50 · +1,000 AI conversations $15 · +5 email addresses $3 · priority support $15.
One-time: fiscal printer $80 · Excel import $50 · on-site training $40 · custom report $60 · integration $150 · business email $40 · Google/SEO $80 · extra page $30 · online payments $120 · store publishing $150 · extra app screen $60 · logo & colors $40 · domain transfer $15 · site migration $50.

All prices are editable in **Admin → Products**.

---

## 5. Domains, email and hosting

**Client's web address options:** free `name.sylkit.com` · new .com/.net/.org (registered in the client's name) · a domain they already own (connected free).

| Item | Cost to Sylkit | Client pays | Profit |
|---|---|---|---|
| .com domain | ~$10.46/yr (Cloudflare at cost) | $15/yr | ~$4.50/yr |
| Domain + 5 emails | ~$10.46/yr (Zoho free plan*) | $50/yr + $30 | ~$70 yr 1, ~$40/yr after |
| Domain + email + page | ~$10.46/yr | $90/yr + $100 | ~$180 yr 1, ~$80/yr after |
| Hosting | ~$0 (Cloudflare) | $5–20/mo + setup | almost all |

\* Confirm Zoho's free plan still covers 5 addresses before the first email sale.

**Rules:** domain always in the client's name · auto-renew on · reminder 30 days before expiry · free transfer if they leave (never hold a domain hostage) · collect payment before registering · local endings (.com.ve, .sl) quoted by WhatsApp.

**Per order:** confirm payment → register in Cloudflare with client as owner → set up Zoho email → mark Delivered → record renewal date.

---

## 6. Startups marketplace (only Sylkit sells) · PAUSED

Paused on 29 Oct 2026 to focus on getting paying clients. To bring it back, move `paused/startups.tsx` and `paused/startup.tsx` back into `app/` and restore the menu link.


- **/startups:** businesses built by Sylkit, sold outright (code, brand, domain, users, revenue). Filters by category and budget, "Recently sold".
- **/startup?s=slug:** facts (price, revenue, profit, multiple, users, age), what's included, demo, "Request details" / "Make an offer".
- **Admin → Marketplace → New listing:** you create every listing; buyer inquiries appear under each listing.
- **Never sell ownership** of a system you also rent to clients. Startups are separate products with their own brand.
- Model: build → get real users and revenue (3–6 months) → sell. Never list fake numbers.

---

## 7. Sylkit Shield (security service)

- **Page:** `/security` (`app/security.tsx`); prices and plans in `src/data/shield.ts`.
- **Booking:** the form calls `create_order` with no product; details start with `[Sylkit Shield] Plan: …` and `p_source` is `shield:<plan id>`. Bookings appear in **Admin** with the other quotes; send the price and the client pays on the order page as usual.
- **Rule:** never test a system before the client signs the scope agreement (the form only records that they claim authorization).
- **Prices (USD, one list for everyone):** Snapshot free · Starter Scan $49 · Essential Audit $199 · Pro Audit $499 · Business Audit from $999 · Single Fix from $29 · Critical Fix Bundle $149 · Full Hardening quoted · Care Basic $19/mo · Care Standard $49/mo · Care Pro $99/mo (yearly = 10 months).

## 8. Responsibilities (put in the client agreement)

| Area | Sylkit | Client |
|---|---|---|
| Domain | Registers/renews in client's name | Owns it |
| Hosting | Servers, uptime, SSL | Own server only if bought once without care plan |
| Client infrastructure | n/a | Internet, power, devices, printers, scanners |
| Bugs | Fixes own code while paying (90 days after handover if bought once) | Problems they cause = paid work |
| Data | Daily backups and restores | Correct data entry |
| Security | Secure code, updates; notify within 72 h of an incident | Passwords, staff access, clean devices |

Response time: Starter next business day · Business same day · Pro 2 hours. Uptime target 99.5% (remedy = free days). Liability capped at 12 months of fees. Late payment: 15 days grace, then suspension; data kept 60 days. *Have a lawyer review before large contracts.*

---

## 9. Email and DNS (sylkit.com on Cloudflare)

| Record | Value |
|---|---|
| MX | mx.zoho.com (10), mx2.zoho.com (20), mx3.zoho.com (50) |
| SPF (TXT @) | `v=spf1 include:zohomail.com ~all` |
| DKIM (TXT `zmail._domainkey`) | Zoho key |
| DMARC (TXT `_dmarc`) | `v=DMARC1; p=none` |
| Zoho verification (TXT @) | `zoho-verification=zb08865506.zmverify.zoho.com` |

Mailboxes (Zoho free plan, up to 5): sylvanus@ (admin), hello@, support@, billing@. Zoho login: sylvanusfannah@yahoo.com.

---

## 10. Pending

| Task | Who |
|---|---|
| **Test payment:** buy "Domain only ($15)", pay with USDT, check the order turns Paid | Sylvanus |
| Set the **payout wallet** in NOWPayments; delete the old API key | Sylvanus |
| **Reconnect Supabase connector** with fannah2026 (it's on the other account) | Sylvanus |
| Then: apply `supabase/marketplace.sql`, send order alerts to sylvanus@sylkit.com, activate admin login | Claude |
| Manual payment details (Pago Móvil, Binance Pay ID, Orange Money) in Admin → Products | Sylvanus |
| Resend API key → automatic client emails and support emails | Sylvanus |
| `ANTHROPIC_API_KEY` in Cloudflare → AI assistant in the help widget (buy ~$5 of credits) | Sylvanus |
| Install the ntfy app and subscribe to the support topic → phone alerts | Sylvanus |
| Send a test message from the help bubble and reply from Admin → Support | Sylvanus |
| Terms of Service page + client agreement | Claude (ready) |
| Nightly backups of client data, before the first real client | Claude (ready) |
| QR code for the crypto address | Claude (optional) |
| Make the **total1** repo private; change exposed passwords | Sylvanus (security) |

---

## 11. Focus (next 90 days)
- Sell before building more. Goal: **3 paying clients**.
- One niche first: **pharmacies in Caracas**, with the "Farmacia Sin Pérdidas" offer (free import + training, 60-day guarantee, 10 founding spots).
- 20 outreach actions a day; follow up 3–5 times.
- Domain + email as the easy first sale, especially in Sierra Leone.
- Protect time and health: fixed weekly Sylkit blocks.

## Translations

Every visible text is written as `{ en, es, pt }` (objects) or `tx(english, spanish, portuguese)` (inline). When adding text, always write all three.
The database stores English and Spanish only: products, plans and extras get their Portuguese from the bundled copy in `src/data/` while the English still matches (see `src/lib/catalog.ts`, `rowToAddon`, `src/lib/names.ts`). If you change a product's English text in Admin, also update its Portuguese in `src/data/products.ts` or `src/data/pricing.ts`.
