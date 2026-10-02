# TheologAI

> Ground your AI in Scripture, biblical languages, commentary, and historical primary sources.

TheologAI provides research tools inside your existing AI client. It is a free, open-source MCP server, rather than a separate chat application.

## Connect

- Website: https://theologai.xyz/
- Hosted MCP endpoint: https://mcp.theologai.xyz/mcp
- Transport: Streamable HTTP
- Authentication: none; no TheologAI account or API key
- [Connection guide](https://theologai.xyz/connect.md)
- [Interactive client setup](https://theologai.xyz/#install)

Claude, ChatGPT, Gemini, and Perplexity have hosted MCP setup flows, subject to their own account and workspace restrictions. Claude Code, Codex, Gemini CLI, Cursor, and VS Code/Copilot also have client-specific setup instructions. A client must support MCP and allow the connection before it can use TheologAI.

## Research tools

The live MCP tools/list response is authoritative for current schemas, descriptions, and availability. At the September 29, 2026 review, the server advertised eleven read-only tools:

- bible_lookup: Retrieve Bible passages and compare translations.
- bible_cross_references: Retrieve ranked leads for related verses.
- parallel_passages: Retrieve source-attested parallel passage groups.
- original_language_lookup: Look up Strong's entries or search Greek and Hebrew lexical evidence.
- bible_verse_morphology: Retrieve grammatical analysis of a verse's words.
- original_language_study: Study a Greek or Hebrew token in its verse.
- commentary_lookup: Retrieve available commentary for a verse or chapter.
- classic_text_lookup: Browse or retrieve indexed historical works and sections.
- primary_source_search: Search the indexed historical collection.
- donation_config: Retrieve voluntary donation options.
- verify_donation: Retrieve bounded evidence about a donation transaction.

## Research approach

For passage study, begin with the Bible text, examine language and parallels, then retrieve commentary and historical witnesses relevant to the question. Cite retrieved sources and retain their translation, work, and section identifiers. Treat cross-reference leads and search snippets as discovery aids; retrieve the underlying material before relying on it as evidence. State gaps in coverage rather than filling them with invented source claims.

Example prompt: "Use TheologAI to trace the language and argument of John 1:1. Show which sources support each claim."

## Project

- [Source code, local installation, and provenance](https://github.com/TJ-Frederick/TheologAI)
- [Agent documentation index](https://theologai.xyz/llms.txt)

Donations are voluntary and do not unlock features. TheologAI's read-only donation tools do not initiate payments.
