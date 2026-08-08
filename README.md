# Opp-Send

Opportunity Send is a compassionate productivity system for job seekers, powered by a browser-dwelling creature that consumes corporate opportunity slop.

## What is here

- `apps/web` — the first interactive dashboard prototype
- `apps/extension` — the working Chrome side-panel extension
- `packages/shared` — shared opportunity shapes and demo data

## Run the dashboard

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The production check is `npm run build`.

## Load the extension

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select `apps/extension`.
5. Open a LinkedIn job listing and click the Opp-Send toolbar icon.

The extension currently stores captured opportunities locally in Chrome. The dashboard includes a paste-import bridge until account sync and the backend exist.

## Current product boundary

This is a functional experience prototype, not a production service. There is no authentication, cloud database, scraping service, Glassdoor/Reddit enrichment, or AI email generation yet. Those require deliberate privacy, sourcing, and reliability work.
