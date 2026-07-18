# Mobius Landing Page

Public front door for [mobius-substrate.com](https://mobius-substrate.com).

The root route (`/`) is a **server-rendered journey landing** (Pulse · Chambers · HIVE) that works without JavaScript. Builder.io visual editing remains available for other paths via `app/[...page]/page.tsx`.

## Vercel

Set the project **Root Directory** to `apps/mobius-landing`. The app uses **Node 22** via `.nvmrc` because `@builder.io/react` depends on `isolated-vm`, which does not ship prebuilt binaries for Node 24 on Vercel. CI continues to run on Node 20 at the monorepo root.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   # or from repo root:
   npm install --workspace=mobius-landing
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   
   Then add your Builder.io Public API Key:
   - Get it from Builder.io → Space Settings → API Keys
   - Add to `.env.local`: `NEXT_PUBLIC_BUILDER_API_KEY=your_key_here`

3. **Run development server:**
   ```bash
   npm run dev
   ```
   
   Visit http://localhost:3009

## Builder.io Setup

1. **Create a Builder.io account** (if you don't have one)
   - Sign up at https://builder.io

2. **Create a Page model:**
   - In Builder.io, go to Models → Create Model
   - Name: "Page"
   - Type: Page
   - Enable URL targeting

3. **Create your landing page:**
   - Create a new Page entry
   - Set URL path to "/"
   - Drag and drop custom components:
     - `MobiusHero` - Hero section with title, subtitle, CTA
     - `MiiTicker` - Live Mobius Integrity Index display
     - `FeatureGrid` - Feature cards grid
     - `MobiusCTA` - Call-to-action section
     - `MobiusFooter` - Footer component

4. **Publish:**
   - Click Publish in Builder.io
   - Your page will be live at http://localhost:3009

## Custom Components

All components are registered with Builder.io and can be edited visually:

- **MobiusHero**: Hero section with fractal background option
- **MiiTicker**: Live MII display with auto-refresh (15s)
- **MobiusCTA**: Call-to-action section
- **FeatureGrid**: Grid of feature cards
- **MobiusFooter**: Footer component

## API Routes

### `/api/mii`
Returns live Mobius Integrity Index data.

**Query params:**
- `env` (optional): Environment (default: 'prod')

**Response:**
```json
{
  "mii": 0.987,
  "env": "prod",
  "source": "pulse",
  "updatedAt": "2025-01-27T12:00:00.000Z"
}
```

**Data sources (in order of preference):**
1. `MOBIUS_PULSE_URL` - Mobius Pulse API endpoint
2. `PROM_URL` + `MII_PROMQL` - Prometheus query
3. Mock value (dev fallback)

### `/api/revalidate`
Webhook endpoint for Builder.io to trigger cache revalidation.

**Query params:**
- `secret`: Revalidation secret (from `REVALIDATE_SECRET` env var)

## Webhook Setup (Optional)

To enable automatic cache revalidation when content is published:

1. In Builder.io → Webhooks
2. Add webhook:
   - Event: "Published Content"
   - URL: `https://your-domain.com/api/revalidate?secret=your_secret`
   - Method: POST

## Environment Variables

- `NEXT_PUBLIC_BUILDER_API_KEY` - Builder.io Public API Key (required)
- `REVALIDATE_SECRET` - Secret for revalidation webhook (optional)
- `MOBIUS_PULSE_URL` - Mobius Pulse API endpoint (optional)
- `PROM_URL` - Prometheus URL (optional)
- `MII_PROMQL` - Prometheus query for MII (optional)

## Deployment

This app uses Next.js App Router with ISR (Incremental Static Regeneration):
- Pages revalidate every 30-60 seconds
- Builder.io content updates appear automatically
- No redeploy needed for content changes

## Architecture

- **Next.js 14** with App Router
- **Builder.io React SDK** for visual editing
- **ISR** for performance and freshness
- **Custom components** registered with Builder.io
- **Live data** via API routes

## Notes

- The landing page is fully editable in Builder.io without code changes
- Custom components maintain type safety and can be extended
- MII ticker auto-refreshes every 15 seconds
- All components are responsive and dark-mode optimized
