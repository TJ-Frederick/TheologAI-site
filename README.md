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

## Client setup instructions

The installation panel in `src/pages/theologai-homepage.jsx` includes hosted setup
for Claude, ChatGPT, Gemini, Perplexity, Claude Code, Codex, Cursor, VS Code/Copilot,
and Gemini CLI. Each named client links to its official setup guide. Instructions
were checked on September 29, 2026; update the displayed checked date when reviewing them.

The primary choices are Claude, ChatGPT, Gemini, and Perplexity. Claude Code,
Codex, and Gemini CLI appear beside Chat within their corresponding family.
Cursor, VS Code/Copilot, and generic MCP instructions are under More clients.

Use client-specific configuration formats: Cursor uses `mcpServers` with `url`,
VS Code uses `servers` with `type: "http"`, and Gemini CLI uses its own CLI commands.
The generic guide provides the Streamable HTTP endpoint rather than a universal JSON schema.
Merge entries into existing configs to preserve other servers.

ChatGPT's web setup uses developer mode and a personal plugin installed in Work;
availability depends on account and workspace policy. Gemini's consumer custom-app
setup currently has age, region, language, activity, and account restrictions.
Perplexity's hosted guide requires an eligible paid plan. TheologAI itself requires
no account, API key, or authentication.

Direct local setup is provided for Claude Desktop, Claude Code, Codex, Cursor,
VS Code, and Gemini CLI. ChatGPT desktop shares the local Codex configuration;
ChatGPT web and Gemini web/mobile do not launch the local stdio command.

To verify edits, run `npm run build`, check every client in both installation
modes, and check the wrapping client tabs and copy buttons at desktop and mobile widths.
Client documentation changes independently of TheologAI; verify official sources
before changing plan availability or menu paths.

## Agent discovery

Static files in `public/` are copied into the production build and can be read
without executing JavaScript:

- `/llms.txt`: concise project summary and links to agent-readable documentation.
- `/index.md`: capabilities, tool names, research guidance, and project links.
- `/connect.md`: hosted connection details, client setup, and MCP discovery steps.
- `/robots.txt` and `/sitemap.xml`: crawler guidance and the canonical homepage.

The HTML links to the Markdown overview and `llms.txt`, and includes a no-JavaScript
connection summary with the MCP endpoint. These are discovery aids; an agent
still needs an MCP-capable client and permission to configure a connection.

Keep the static docs and interactive client guide in sync when changing endpoints,
tools, setup steps, or account restrictions. Fetch each static file when checking a
build: a `200` response containing the SPA's HTML is not a valid documentation file.
Use the live MCP `tools/list` response as the authority for tool schemas.

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
