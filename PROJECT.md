# Sylkit: Project Documentation

**Owner:** Sylvanus Fannah · **Site:** https://sylkit.com · **Business email:** sylvanus@sylkit.com · **Last updated:** 25 October 2026

Sylkit sells four things:
1. **Software for your business:** ready-made systems (POS, pharmacy, clinic, inventory…) used by subscription or bought once. Sylkit keeps ownership and maintains them.
2. **Domains & websites:** domains registered in the client's name, business email, website hosting.
3. **Own a business (startups):** whole online businesses built by Sylkit and sold outright. Only Sylkit sells there.
4. **Sylkit Shield (security):** security checks, fixes and monitoring for websites, apps and business systems (/security).

Clients pay with **USDT (automatic, via NOWPayments)**, Pago Móvil or other manual methods.

---

## 1. What is live

| Area | Status |
|---|---|
| Site (sylkit.com) | ✅ Catalog, search, categories, product pages with real screenshots |
| Catalog | ✅ 19 products in 10 categories |
| Live demos | ✅ 15 demos on their own subdomains (pos.sylkit.com…), each with its own brand, reset daily |
| Price calculator | ✅ Plans, extras and quantities; yearly / monthly / buy once; web address picker |
| **Direct checkout** | ✅ Fixed-price plans: Buy now → checkout → pay → track |
| Custom quotes | ✅ Custom projects: request → admin quote → accept → pay |
| **Crypto payments (USDT)** | ✅ NOWPayments, live mode, TRC20 and BEP20; confirmed automatically |
| Manual payments | ✅ Client chooses a method and reports the reference; admin confirms |
| Domains & hosting (/domains) | ✅ Live availability check for .com/.net/.org |
| Sylkit Shield (/security) | ✅ Security page, global price ladder, booking form → saved as a quote request (source `shield:<plan>`) |
| Startups (/startups) | ⏸️ Paused 29 Oct 2026 to focus on selling. Code kept in `/paused`; /startups redirects home |
| Admin (/admin) | ✅ Orders, quotes, statuses, prices, extras, payment methods, marketplace |
| Business email | ✅ Zoho Mail on sylkit.com (MX, SPF, DKIM, DMARC set) |
| Automatic emails to clients | ⏳ Built; needs a Resend API key |
| Language | ✅ English by default; Spanish automatically from browser language or country. No toggle. |

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

### Worker (`worker/index.js` + `worker/payments.js`)
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
| Daily cron | Pings Supabase so the free database never pauses |

### Cloudflare secrets (Worker → Settings → Variables and Secrets, type **Secret**)
| Name | Purpose |
|---|---|
| `NOWPAYMENTS_API_KEY` | NOWPayments live API key |
| `NOWPAYMENTS_IPN_SECRET` | Verifies NOWPayments webhooks |
| `SUPABASE_SERVICE_ROLE_KEY` | Lets the worker update orders after payment |
| `NOWPAYMENTS_SANDBOX` (optional, plain) | `true` switches to the NOWPayments test server |

`wrangler.jsonc` has `keep_vars: true`, so deploys never erase dashboard variables. **Never put keys in Build variables** (they're not available at runtime).

### Folders
```
app/                pages: index, product/[slug], quote (checkout), track, domains,
                    startups, startup, admin/{index,order,products,listings}
src/components/     Header, Footer, ProductCard, PricingCalculator, DomainPicker, CryptoPay,
                    EstimateBreakdown, QuoteForm, ListingCard, AdminGate…
src/data/           products.ts, pricing.ts (fallback copies of catalog and prices)
src/lib/            supabase, catalog, pricing, listings, status
public/shots/       product screenshots and covers (webp)
public/demos/       the 15 live demos;  public/_kit/ demo engine
worker/             index.js, payments.js, test/payments.test.mjs (29 checks)
supabase/           marketplace.sql (to apply)
```

---

## 3. How a client buys

### Fixed-price plans (systems, domains, hosting)
1. **Product page:** choose plan, billing, extras, web address. The total updates live. **Buy now.**
2. **Checkout (step 1 of 2):** order summary + name, email, WhatsApp. **Continue to payment.**
3. **Order page (step 2 of 2):** "Order SK-xxxx confirmed". Payment box on top:
   - **Pay with crypto (USDT):** choose TRC20 or BEP20 → exact amount + deposit address (copy buttons) → status: waiting → confirming → **confirmed**. Order turns **Paid** automatically.
   - **Or another way:** choose a manual method and report the reference; admin confirms.
4. Client follows progress on the same page until delivery.

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
| Product | Starter | Business | Pro |
|---|---|---|---|
| Expiry Alerts, POS, Inventory, Car workshop, Payroll | 15 / 50 | 29 / 100 | 49 / 150 |
| Pharmacy | 25 / 80 | 45 / 150 | 69 / 250 |
| Clinic | 25 / 80 | 45 / 150 | 79 / 250 |
| Restaurant, Home services | 19 / 60 | 35 / 120 | 59 / 200 |
| Salon & barbershop | 12 / 40 | 25 / 80 | 39 / 120 |
| School management | 29 / 100 | 59 / 200 | 99 / 350 |
| Invoicing | 9 / 30 | 19 / 60 | 35 / 100 |
| Online store | 12 / 80 | 25 / 150 | 45 / 250 |
| Personal website | 8 / 120 | 12 / 200 | 19 / 350 |
| Business website | 10 / 150 | 15 / 300 | 25 / 500 |
| Custom mobile app | 25 / 900 | 45 / 1,800 | 79 / 3,500 |
| AI assistant | 29 / 100 | 59 / 200 | 99 / 350 |
| **Domain & business email** (yearly) | **$15/yr**, no setup | **$50/yr** + $30 | **$90/yr** + $100 |
| **Website hosting** | 5 / 30 | 10 / 50 | 20 / 80 |

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
| Resend API key → automatic client emails | Sylvanus |
| Terms of Service page + client agreement | Claude (ready) |
| Nightly backups of client data, before the first real client | Claude (ready) |
| QR code for the crypto address | Claude (optional) |
| Home page with three clear doors: Software · Domains & websites · Own a business | Claude (offered) |
| Make the **total1** repo private; change exposed passwords | Sylvanus (security) |

---

## 11. Focus (next 90 days)
- Sell before building more. Goal: **3 paying clients**.
- One niche first: **pharmacies in Caracas**, with the "Farmacia Sin Pérdidas" offer (free import + training, 60-day guarantee, 10 founding spots).
- 20 outreach actions a day; follow up 3–5 times.
- Domain + email as the easy first sale, especially in Sierra Leone.
- Protect time and health: fixed weekly Sylkit blocks.
