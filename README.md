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

## Custom Domains

The public services use separate hostnames so Cloudflare Pages and the MCP Workers
have unambiguous routing ownership:

| Address | Owner | Purpose |
| --- | --- | --- |
| `https://theologai.xyz` | Cloudflare Pages project `theologai` | Canonical website, donation UI, and Pages Functions |
| `https://mcp.theologai.xyz/mcp` | Production MCP Worker | Canonical production MCP endpoint |
| `https://preview-mcp.theologai.xyz/mcp` | Preview MCP Worker | Preview-only MCP endpoint |

Do not attach an `/mcp*` Worker route to the website apex. The Pages custom domain
owns `theologai.xyz`, while each MCP Worker owns its distinct subdomain.

The original Cloudflare hostnames remain compatibility aliases and rollback paths:

- `https://theologai.pages.dev/` — website alias
- `https://theologai.tjfrederick.workers.dev/mcp` — production MCP alias
- `https://theologai-preview.tjfrederick.workers.dev/mcp` — preview MCP alias

If a custom-domain route has a problem, clients can temporarily switch back to the
corresponding alias without changing the Pages project, Worker deployment, or D1
binding. Removing an alias is a separate, explicitly approved operation.
