# Connect to TheologAI

> Add free Bible study and theological research tools to an MCP-capable AI client.

Reviewed September 29, 2026. Client interfaces and account eligibility may change; follow the official links below for current requirements.

## Connection details

| Setting | Value |
| --- | --- |
| Name | TheologAI |
| Server URL | https://mcp.theologai.xyz/mcp |
| Transport | Streamable HTTP |
| Authentication | None |
| TheologAI account or API key | Not required |
| Cost | Free; donations are voluntary |

Use the full HTTPS URL, including /mcp. The website apex, https://theologai.xyz/, is not the MCP endpoint. A normal browser GET is not a substitute for the MCP initialization handshake. No local server installation is needed for hosted setup.

## Chat clients

- Claude: Customize → Connectors → + → Add custom connector. Paste the server URL, name it TheologAI, and add it. Enable it from + → Connectors in a conversation. Team and Enterprise owners must first add the connector for their organization. [Official Claude guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).
- ChatGPT: Enable Developer mode in Settings → Security and login. In Plugins, select + and create a connection using the server URL and no authentication. Install the resulting personal plugin, then select it with @ in a Work chat. Developer mode depends on account and workspace policy. [Official OpenAI guide](https://developers.openai.com/plugins/quickstart).
- Gemini: On gemini.google.com, open Settings → Connected Apps, add a custom app, and enter the server URL. Select Next and complete setup; select the app with @ in chat. Currently requires a personal Google Account, age 18+, US location, English, and Keep Activity enabled. [Official Gemini guide](https://support.google.com/gemini/answer/17209137?co=GENIE.Platform%3DDesktop&hl=en-GA).
- Perplexity: Account settings → Connectors → + Custom connector → Remote. Enter the server URL, set authentication to None and transport to Streamable HTTP, acknowledge the notice, add the connector, and enable it. Requires an eligible paid plan; organizational permissions apply. [Official Perplexity guide](https://www.perplexity.ai/help-center/en/articles/13915507-adding-custom-remote-connectors).

## Coding clients

Claude Code:

```sh
claude mcp add --transport http --scope user theologai https://mcp.theologai.xyz/mcp
```

Codex:

```sh
codex mcp add theologai --url https://mcp.theologai.xyz/mcp
```

Gemini CLI:

```sh
gemini mcp add --transport http --scope user theologai https://mcp.theologai.xyz/mcp
```

For Cursor, merge this into ~/.cursor/mcp.json or the project's .cursor/mcp.json:

```json
{
  "mcpServers": {
    "theologai": {
      "url": "https://mcp.theologai.xyz/mcp"
    }
  }
}
```

For VS Code/Copilot, merge this into the project's .vscode/mcp.json:

```json
{
  "servers": {
    "theologai": {
      "type": "http",
      "url": "https://mcp.theologai.xyz/mcp"
    }
  }
}
```

Preserve other configured servers. Restart the client if needed, confirm TheologAI is connected, and enable its tools. [The interactive guide](https://theologai.xyz/#install) includes client-specific verification and local installation instructions.

## Programmatic agents

Use an MCP SDK's Streamable HTTP client with the server URL above. Initialize the connection, accept a mutually supported protocol version, send notifications/initialized, and discover the current tool schemas using tools/list. The SDK should handle protocol headers and JSON or event-stream responses.

The server is stateless and anonymous. An authorization token is not needed. Call tools through MCP tools/call, rather than inventing REST paths such as /bible_lookup. Tool availability and schemas come from the live server; this document does not replace protocol discovery.

A first read-only call, after initialization and schema discovery:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "bible_lookup",
    "arguments": {
      "reference": "John 1:1",
      "translation": "KJV"
    }
  }
}
```

An agent that can read these docs but cannot add MCP connections can provide the endpoint and setup steps to its user. Reading a webpage does not itself install a connection or grant tool access.

- [Capabilities and research guidance](https://theologai.xyz/index.md)
- [Source code and provenance](https://github.com/TJ-Frederick/TheologAI)
