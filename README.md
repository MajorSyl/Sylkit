# Sylkit

Marketplace for ready-made and custom business software. Built with Expo (React Native) + Expo Router: one codebase for web (sylkit.com) and, later, iOS/Android.

## Run locally

```bash
npm install
npm run web
```

## Edit products and prices

All products live in `src/data/products.ts`. Set `priceFrom` to a number (USD per year) to show a price, or leave it `null` to show "Price on request".

## Deploy (Cloudflare Workers, static assets)

- Build command: `npx expo export --platform web`
- Deploy command: `npx wrangler deploy` (config in `wrangler.jsonc`, serves `dist`)
- Node version comes from `.node-version`

Every push to `main` redeploys sylkit.com.
