# TheologAI Site

Homepage and USDC donation page for TheologAI — a Bible study MCP server.

Built with Vite + React 18, deployed on Cloudflare Pages.

## Setup

```bash
npm install
```

### Replace placeholders

Search for `YOUR_` in the codebase and replace:

- `0xYOUR_WALLET_ADDRESS` — your USDC recipient wallet address (in `src/config.js`, `functions/api/donation-config.js`, `functions/api/verify-payment.js`)
- `YOUR_WALLETCONNECT_PROJECT_ID` — get one from [cloud.walletconnect.com](https://cloud.walletconnect.com) (in `src/config.js`)

## Development

```bash
# Frontend only (hot reload, no Functions)
npm run dev

# Full stack (frontend + Pages Functions)
npm run dev:full

# Preview production build with Functions
npm run build && npm run preview
```

## Deploy

```bash
npm run deploy
```

This builds the site and deploys to Cloudflare Pages via Wrangler.

## Custom Domain Route Splitting

Once you have a custom domain (e.g., theologai.com) pointed at this Pages project:

1. Go to Cloudflare Dashboard > Workers & Pages > your MCP Worker
2. Add a route: `theologai.com/mcp*` > theologai-mcp-worker
3. The Pages project handles everything else automatically

Routes:
- `theologai.com/` — This Pages project (homepage)
- `theologai.com/donate` — This Pages project (donate page)
- `theologai.com/api/*` — Pages Functions (auto-routed from /functions dir)
- `theologai.com/mcp` — Your existing MCP Worker
