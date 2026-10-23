# Sylkit: Project Documentation

**Owner:** Sylvanus Fannah · **Site:** https://sylkit.com · **Last updated:** 23 October 2026

Sylkit is an international marketplace where businesses buy ready-made software (POS, pharmacy, clinic, inventory and more), order custom systems, apps and websites, and get domains, business email and hosting. Clients pay in local ways: Pago Móvil, USDT, Orange Money.

---

## 1. What is live today

| Area | Status |
|---|---|
| Marketplace site (sylkit.com) | Live: catalog, search, categories, product pages |
| Product catalog | 19 products in 10 categories |
| Live demos | 15 demos on their own subdomains, each with its own brand and theme, reset daily |
| Price calculator | Live on every product page: plans, extras, yearly/monthly/buy once |
| Quotes and orders | Live: request → order number → tracking page → quote → accept → pay → deliver |
| Admin panel (sylkit.com/admin) | Live: orders, quotes, statuses, prices, extras, payment methods |
| Domains & hosting (sylkit.com/domains) | Live: domain search with real availability check |
| Email notifications | Built; waiting on a Resend API key |
| Language | English by default; switches to Spanish automatically from the browser language or the country. No toggle. |

---

## 2. Technology

| Layer | Tool |
|---|---|
| App | Expo Router (React Native for web), static export |
| Hosting | Cloudflare Workers + static assets, worker name `sylkit` |
| Deploys | Automatic: every push to `main` on GitHub `MajorSyl/Sylkit` builds and deploys on Cloudflare |
| Database and auth | Supabase project `chcljhwcvzlmxrrhetfv` (account fannah2026) |
| Emails | Supabase edge function `notify` → Resend, sent from `no-reply@sylkit.com` |
| Domain | sylkit.com on Cloudflare (account fannah2026) |
| Node | 22 (required by the build) |

### The edge worker (`worker/index.js`)
- Serves the site.
- Maps each demo subdomain (`pos.sylkit.com`, `farmacia.sylkit.com`…) to its demo folder.
- Sets a country cookie, `sk_cc`, used for language detection.
- **`/api/domain?name=xyz`** checks .com/.net/.org availability through the official registry servers (RDAP; no key, no cost).
- A daily cron job pings Supabase so the free database never pauses.

### Main folders
```
app/              pages: home, product/[slug], quote, track, domains, admin/*
src/components/   Header, Footer, ProductCard, PricingCalculator, DomainPicker,
                  EstimateBreakdown, QuoteForm, AdminGate…
src/data/         products.ts and pricing.ts (fallback copies of the catalog and prices)
src/lib/          supabase, catalog, pricing (calculator rules), status
public/_kit/      demo engine (kit.js, kit.css)
public/demos/     the 15 live demos
worker/index.js   Cloudflare worker
```

---

## 3. Database (Supabase)

| Table | Holds |
|---|---|
| `products` | Catalog, both languages, `pricing` (plans + allowed extras + billing options), `price_from`, `demo_url` |
| `addons` | The extra features and their prices |
| `orders` | Each request: customer, product, `config` (plan, billing, extras, domain), `estimate`, `estimated_total`, quote, payment, status |
| `order_events` | History shown to the customer and the admin |
| `payment_methods` | The payment details customers see after accepting a quote |
| `notifications` | Email log, prevents duplicates |
| `app_config` | Site URL, admin email, notify URL |
| `admins` | Who can open the admin |

**Server functions**
- `create_order`: validates and saves a request, rate-limited to 5 per hour per email.
- `price_estimate`: recalculates every price on the server, so nobody can change a total by editing the link.
- `get_order`: returns a customer's tracking page.
- `is_admin`: checks whether the signed-in user is an admin.

**Order statuses:** new → quoted → accepted → payment_submitted → paid → in_progress → delivered (or cancelled).

---

## 4. Pricing rules

One rule set, applied in the browser and again in the database:

- **Monthly total** = plan monthly price + monthly extras × quantity
- **One-time total** = plan setup + one-time extras × quantity
- **Yearly billing (default):** monthly total × 10 (2 months free)
- **Monthly billing:** monthly total each month
- **Buy once:** license = monthly total × 30 (≈ 2.5 years), plus one-time items. Includes 12 months of hosting, support and updates. From year 2 there's an optional care plan at monthly total × 3 per year.
- **Due today** = one-time total + first subscription payment (or the license)

Domain products are yearly only. Hosting is yearly or monthly, with no buy-once option.

### Plans (monthly price / one-time setup, USD)

| Product | Starter | Business | Pro | Demo |
|---|---|---|---|---|
| Expiry Alerts | 15 / 50 | 29 / 100 | 49 / 150 | alertas.sylkit.com |
| Point of Sale (POS) | 15 / 50 | 29 / 100 | 49 / 150 | pos.sylkit.com |
| Inventory Control | 15 / 50 | 29 / 100 | 49 / 150 | inventario.sylkit.com |
| Pharmacy: sales & expiry | 25 / 80 | 45 / 150 | 69 / 250 | farmacia.sylkit.com |
| Clinic: appointments & records | 25 / 80 | 45 / 150 | 79 / 250 | clinica.sylkit.com |
| Restaurant: QR menu & kitchen | 19 / 60 | 35 / 120 | 59 / 200 | restaurante.sylkit.com |
| Salon & barbershop | 12 / 40 | 25 / 80 | 39 / 120 | salon.sylkit.com |
| Car workshop | 15 / 50 | 29 / 100 | 49 / 150 | taller.sylkit.com |
| Home services | 19 / 60 | 35 / 120 | 59 / 200 | servicios.sylkit.com |
| School management | 29 / 100 | 59 / 200 | 99 / 350 | escuela.sylkit.com |
| Payroll & attendance | 15 / 50 | 29 / 100 | 49 / 150 | nomina.sylkit.com |
| Invoicing & collections | 9 / 30 | 19 / 60 | 35 / 100 | facturas.sylkit.com |
| Online store with WhatsApp | 12 / 80 | 25 / 150 | 45 / 250 | tienda.sylkit.com |
| Personal website | 8 / 120 | 12 / 200 | 19 / 350 | portafolio.sylkit.com |
| Business Website | 10 / 150 | 15 / 300 | 25 / 500 | n/a |
| Custom Mobile App | 25 / 900 | 45 / 1,800 | 79 / 3,500 | n/a |
| AI Assistant | 29 / 100 | 59 / 200 | 99 / 350 | asistente.sylkit.com |
| **Domain and business email** (yearly only) | 1.50 / 0 → **$15/yr** | 5 / 30 → **$50/yr** | 9 / 100 → **$90/yr** | n/a |
| **Website hosting** | 5 / 30 | 10 / 50 | 20 / 80 | n/a |

Example: POS Business, yearly, with 2 extra branches, a fiscal printer and 1 training session = **$710 today, then $490 a year**.

### Extras (add-ons)

| Extra | Price | Type |
|---|---|---|
| Extra branch | $10 | per month, per unit |
| 5 extra users | $5 | per month, per unit |
| WhatsApp notifications | $10 | per month |
| Staff mobile app | $10 | per month |
| Your own domain (.com) | $1.50 | per month |
| +1,000 AI conversations | $15 | per month, per unit |
| +5 email addresses | $3 | per month, per unit |
| Priority support | $15 | per month |
| Fiscal printer connection | $80 | one-time |
| Import data from Excel | $50 | one-time |
| On-site training | $40 | one-time, per session |
| Custom report | $60 | one-time, per unit |
| Integration with another system | $150 | one-time |
| Business email on your domain | $40 | one-time |
| Google Business and SEO setup | $80 | one-time |
| Extra page | $30 | one-time, per unit |
| Online payments | $120 | one-time |
| Play Store / App Store publishing | $150 | one-time |
| Extra app screen | $60 | one-time, per unit |
| Your logo and colors | $40 | one-time |
| Move a domain you already own | $15 | one-time |
| Move your current site | $50 | one-time |

All prices can be edited in **Admin → Products**, and changes go live straight away.

---

## 5. Domains & hosting business

### How a client buys
1. They search their business name on sylkit.com/domains.
2. They see .com/.net/.org marked Available or Taken.
3. They pick **Domain only** or **With email**, add extras and send the request.
4. On any system or website, they choose their web address: a free `name.sylkit.com`, a new domain (adds the domain extra), or a domain they already own (connected for free).

### Costs and profit (approximate)

| Item | Your cost | Client pays | Profit |
|---|---|---|---|
| .com domain | ~$10.46/yr (Cloudflare at cost) | $15/yr | ~$4.50/yr |
| Domain + 5 emails | ~$10.46/yr (Zoho free plan*) | $50/yr + $30 setup | ~$70 year 1, ~$40/yr after |
| Domain + email + page | ~$10.46/yr | $90/yr + $100 setup | ~$180 year 1, ~$80/yr after |
| Website hosting | ~$0 (Cloudflare free plan) | $5–20/mo + setup | nearly all |

\* Check Zoho's current free-plan limits before the first email sale. If it no longer covers 5 addresses, each address costs about $1 a month.

The domain is the hook that brings a business in. The profit comes from email, websites and systems sold afterwards.

### Rules
- The domain is registered **in the client's name**. Sylkit manages it.
- It's renewed while the client pays, with auto-renew on and a reminder 30 days before expiry.
- If the client leaves, it's transferred to them **free**. Never hold a domain hostage: it breaks registry rules and ruins your reputation.
- Collect payment **before** registering or renewing.
- Only .com/.net/.org are sold at these prices. Local endings (.com.ve, .sl…) are quoted by WhatsApp.
- **Later:** join a reseller program (Namecheap, ResellerClub or Openprovider) for automatic registration and more endings.

### Steps for each domain order
1. Confirm payment.
2. Register the domain in Cloudflare with the client as owner, and turn on auto-renew.
3. Set up Zoho email and connect it on the client's phone.
4. Mark the order Delivered in the admin.
5. Record the renewal date.

---

## 6. Who is responsible for what

**Model A, Sylkit hosts:** all subscriptions, plus buy-once during year 1 or with the care plan.
**Model B, client hosts:** buy-once without the care plan, after year 1.

| Area | Sylkit | Client |
|---|---|---|
| Domain | Registers and renews it (if bought), in the client's name | Owns it |
| Hosting | Servers, uptime, SSL (Model A) | Their own server (Model B) |
| Client's infrastructure | n/a | Internet, power, computers, phones, printers, scanners |
| Crashes | Fixes bugs in its own code, free while paying (A) or for 90 days after handover (B) | Problems they cause (devices, internet, deleted data), fixed as paid work |
| Data | Daily backups and restores | Entering data correctly |
| Security | Secure code, updates, encryption; tells the client within 72 hours of an incident, then restores and fixes | Strong passwords, no shared logins, removing staff who leave, clean devices |

**Contract rules to include**
- **Response time:** Starter next business day, Business same day, Pro 2 hours.
- **Uptime:** target 99.5%. If missed, the remedy is free service days, never cash.
- **Liability:** capped at what the client paid in the last 12 months. No liability for lost sales or profits.
- **Late payment:** 15 days' grace, then suspension. Data kept 60 days, with an export on request.

*Have a lawyer review the agreement before large contracts.*

---

## 7. Payments

| Stage | Methods |
|---|---|
| 1 (now) | Pago Móvil, USD cash, USDT (Binance Pay ID or TRC20/BEP20 address), Orange Money (Sierra Leone), Zelle only if it's your own account |
| 2 | Crypto gateway (NOWPayments) |
| 3 | Merchant of record, a US LLC + Stripe, or a Sierra Leone company + Flutterwave |

Never share private keys or seed phrases, only wallet addresses. Enter real payment details in **Admin → Products → Payment methods**.

---

## 8. Business email (Zoho, being set up)

Addresses: `sylvanus@`, `hello@`, `support@`, `billing@`, `no-reply@sylkit.com`.
Once Zoho is set up, add its DNS records in Cloudflare and change the admin email to `sylvanus@sylkit.com`.

---

## 9. Running the admin
1. Go to **sylkit.com/admin**, create your account, and get it activated as an admin.
2. **Orders:** new requests arrive with the plan, extras, web address and total already calculated. The quote amount, item list (in the client's language) and a 14-day validity are filled in for you. Review, then send.
3. **Statuses:** confirm payment, mark in progress, mark delivered, post updates the client sees.
4. **Products:** edit plan prices, extra prices, product visibility and payment details.

---

## 10. Pending

| Task | Waiting on |
|---|---|
| Payment details (USDT address and network, Binance Pay ID, Pago Móvil, Orange Money) | Sylvanus |
| Zoho DNS records → add in Cloudflare | Sylvanus |
| Resend API key → turns on emails | Sylvanus |
| Admin account → activate as admin | Sylvanus |
| Make the `total1` repo private and change the exposed password | Sylvanus (security, urgent) |
| Terms of Service page + checkbox on the quote form | Ready to build |
| Client agreement document | Ready to write |
| Nightly automatic backups of client data | Ready to build (needed before the first real client) |
| Supabase paid plan (~$25/mo) once there are 3+ system clients | Later |
| Domain reseller program | Later, once volume grows |
| Automated "executive" routines (Chief of Staff, CTO…) | Offered |
| Sales materials (WhatsApp scripts, flyer, target list) | Offered |

---

## 11. Growth plan (next 30 days)
- Sell before building more. Goal: **3 paying clients**.
- Visit 10 pharmacies or bodegas in Caracas and show the demos on your phone.
- Message 20 businesses in Sierra Leone about Domain + email.
- Bundle services so clients stay because it's easy: yearly billing, renewal reminders that show the value, free transfer out.
- Keep test order SK-1002 cancelled; it was an automated pricing test.
