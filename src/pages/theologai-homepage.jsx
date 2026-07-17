import { lazy, Suspense, useMemo, useState } from "react";

const DonationExperience = lazy(() => import("../components/DonationExperience"));

const REMOTE_ENDPOINT = "https://mcp.theologai.xyz/mcp";
const FIRST_PROMPT = "Use TheologAI to trace the language and argument of John 1:1. Show which sources support each claim.";

const HOSTED_CONFIG = `{
  "mcpServers": {
    "theologai": {
      "type": "url",
      "url": "${REMOTE_ENDPOINT}"
    }
  }
}`;

const LOCAL_BUILD = `git clone https://github.com/TJ-Frederick/TheologAI.git
cd TheologAI
npm ci
npm run data:verify-sources
npm run build:db
npm run build`;

const LOCAL_CONFIG = `{
  "mcpServers": {
    "theologai": {
      "command": "node",
      "args": ["/absolute/path/to/TheologAI/dist/index.js"]
    }
  }
}`;

const CLIENTS = [
  { id: "claude", label: "Claude" },
  { id: "claude-code", label: "Claude Code" },
  { id: "codex", label: "Codex" },
  { id: "other", label: "Other clients" },
];

const WORKFLOWS = [
  {
    number: "01",
    title: "Passage exegesis",
    description: "Move from the text to language, parallels, commentary, and historical witnesses without losing the thread.",
    steps: ["Text", "Morphology", "Commentary", "Sources"],
  },
  {
    number: "02",
    title: "Original-language study",
    description: "Study one Greek or Hebrew token in its verse with morphology, lexical evidence, usage, and clear limits.",
    steps: ["Token", "Lemma", "Usage", "Synthesis"],
  },
  {
    number: "03",
    title: "Primary-source research",
    description: "Survey creeds, confessions, and catechisms, then hand exact sections back to your client as evidence.",
    steps: ["Query", "Survey", "Sections", "Evidence"],
  },
];

const TOOL_GROUPS = [
  {
    symbol: "§",
    title: "Scripture",
    description: "Eight translations, ranked discovery leads, and source-attested parallel groups.",
    tools: ["bible_lookup", "bible_cross_references", "parallel_passages"],
  },
  {
    symbol: "λ",
    title: "Biblical languages",
    description: "Strong’s entries, verse morphology, and contextual Greek or Hebrew word studies.",
    tools: ["original_language_lookup", "bible_verse_morphology", "original_language_study"],
  },
  {
    symbol: "¶",
    title: "Commentary & sources",
    description: "Classic commentary alongside a locally indexed historical collection.",
    tools: ["commentary_lookup", "classic_text_lookup", "primary_source_search"],
  },
  {
    symbol: "◇",
    title: "Project support",
    description: "Structured, voluntary donation options and bounded on-chain receipt evidence.",
    tools: ["donation_config", "verify_donation"],
  },
];

const DEMOS = [
  {
    id: "passage",
    label: "Passage exegesis",
    prompt: "Trace the argument and language of John 1:1.",
    tool: "passage-exegesis",
    content: (
      <>
        <div className="result-heading">
          <span>John 1:1</span>
          <span className="source-pill">4 sources attached</span>
        </div>
        <blockquote className="verse-quote">
          “In the beginning was the Word, and the Word was with God, and the Word was God.”
          <cite>KJV · public domain</cite>
        </blockquote>
        <div className="language-row">
          <span className="greek-word">λόγος</span>
          <span><strong>G3056</strong><small>noun · nominative · singular · masculine</small></span>
          <span><strong>logos</strong><small>word, statement, account</small></span>
        </div>
        <div className="evidence-list">
          <span><i>01</i> Bible text retrieved with translation provenance</span>
          <span><i>02</i> Morphology separated from lexical evidence</span>
          <span><i>03</i> Commentary labeled by work and coverage</span>
        </div>
      </>
    ),
  },
  {
    id: "word",
    label: "Word study",
    prompt: "Study the Hebrew word translated “shepherd” in Psalm 23:1.",
    tool: "word-study",
    content: (
      <>
        <div className="result-heading">
          <span>Psalm 23:1 · רֹעִי</span>
          <span className="source-pill">evidence bounded</span>
        </div>
        <div className="word-study-grid">
          <div><small>Lemma</small><strong>רעה</strong><span>H7462</span></div>
          <div><small>Form</small><strong>participle</strong><span>Qal · masculine singular</span></div>
          <div><small>Context</small><strong>my shepherd</strong><span>suffix retained in verse analysis</span></div>
        </div>
        <p className="result-note">Lexicon, morphology, and contextual synthesis remain visibly separate so your client can reason from the evidence.</p>
      </>
    ),
  },
  {
    id: "sources",
    label: "Historical sources",
    prompt: "Compare how historic confessions describe justification.",
    tool: "primary-source-research",
    content: (
      <>
        <div className="result-heading">
          <span>Work-diverse survey</span>
          <span className="source-pill">exact sections linked</span>
        </div>
        <div className="document-list">
          <div><span>Westminster Confession</span><small>Chapter XI · Of Justification</small></div>
          <div><span>Augsburg Confession</span><small>Article IV · Of Justification</small></div>
          <div><span>Thirty-Nine Articles</span><small>Article XI · Of the Justification of Man</small></div>
        </div>
        <p className="result-note">Search snippets guide discovery; selected local sections become the evidence your client reads and cites.</p>
      </>
    ),
  },
];

function Brand({ footer = false }) {
  return (
    <a className={`brand ${footer ? "brand-footer" : ""}`} href="#top" aria-label="TheologAI home">
      <span className="brand-mark" aria-hidden="true">
        <img src="/favicon.svg" alt="" />
      </span>
      <span>Theolog<em>AI</em></span>
    </a>
  );
}

function CodeBlock({ children, copyKey, copiedKey, onCopy, compact = false }) {
  return (
    <div className={`code-block ${compact ? "code-block-compact" : ""}`}>
      <button type="button" className="copy-button" onClick={() => onCopy(String(children), copyKey)}>
        {copiedKey === copyKey ? "Copied ✓" : "Copy"}
      </button>
      <pre>{children}</pre>
    </div>
  );
}

function EndpointBlock({ copiedKey, onCopy }) {
  return (
    <div className="endpoint-block">
      <span>{REMOTE_ENDPOINT}</span>
      <button type="button" onClick={() => onCopy(REMOTE_ENDPOINT, "endpoint")}>
        {copiedKey === "endpoint" ? "Copied ✓" : "Copy endpoint"}
      </button>
    </div>
  );
}

function FirstPrompt({ copiedKey, onCopy }) {
  return (
    <div className="first-prompt">
      <div>
        <span>After connecting</span>
        <strong>Try your first research prompt</strong>
      </div>
      <p>“{FIRST_PROMPT}”</p>
      <button type="button" onClick={() => onCopy(FIRST_PROMPT, "first-prompt")}>
        {copiedKey === "first-prompt" ? "Copied ✓" : "Copy prompt"}
      </button>
    </div>
  );
}

function DonationLoading({ onClose }) {
  return (
    <div className="donate-overlay" onClick={onClose}>
      <div className="donate-modal donate-loading" role="dialog" aria-modal="true" aria-label="Loading donation options" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="donate-close" aria-label="Close donation dialog" onClick={onClose}>×</button>
        <span className="eyebrow">Community-supported</span>
        <p>Loading secure donation options…</p>
      </div>
    </div>
  );
}

function HostedInstructions({ client, copiedKey, onCopy }) {
  if (client === "claude") {
    return (
      <div className="install-detail">
        <div className="recommended-line"><span>Recommended</span> Native remote connector</div>
        <EndpointBlock copiedKey={copiedKey} onCopy={onCopy} />
        <ol className="install-steps">
          <li><span>1</span><p>In Claude, open <strong>Customize → Connectors</strong>.</p></li>
          <li><span>2</span><p>Select <strong>+ → Add custom connector</strong>.</p></li>
          <li><span>3</span><p>Name it “TheologAI,” paste the endpoint, and add it.</p></li>
          <li><span>4</span><p>Enable TheologAI from <strong>+ → Connectors</strong> in a conversation.</p></li>
        </ol>
        <p className="install-footnote">Works across Claude web, Desktop, Cowork, and mobile. Team and Enterprise connectors may require an owner.</p>
      </div>
    );
  }

  if (client === "codex") {
    return (
      <div className="install-detail">
        <p className="install-intro">Add the hosted server with one command:</p>
        <CodeBlock copyKey="codex-hosted" copiedKey={copiedKey} onCopy={onCopy} compact>
          codex mcp add theologai --url {REMOTE_ENDPOINT}
        </CodeBlock>
        <ol className="install-steps install-steps-short">
          <li><span>1</span><p>Or open <strong>Settings → MCP servers → Add server</strong>.</p></li>
          <li><span>2</span><p>Choose <strong>Streamable HTTP</strong>, enter the endpoint, then restart.</p></li>
        </ol>
        <p className="install-footnote">The Codex app, CLI, and IDE extension share the same MCP configuration.</p>
      </div>
    );
  }

  if (client === "claude-code") {
    return (
      <div className="install-detail">
        <p className="install-intro">Add the hosted server to Claude Code for every project:</p>
        <CodeBlock copyKey="claude-code-hosted" copiedKey={copiedKey} onCopy={onCopy} compact>
          claude mcp add --transport http --scope user theologai {REMOTE_ENDPOINT}
        </CodeBlock>
        <ol className="install-steps install-steps-short">
          <li><span>1</span><p>Run the command in your terminal, then open Claude Code.</p></li>
          <li><span>2</span><p>Use <strong>/mcp</strong> to confirm TheologAI is connected.</p></li>
        </ol>
        <p className="install-footnote">The user scope makes TheologAI available across your Claude Code projects.</p>
      </div>
    );
  }

  return (
    <div className="install-detail">
      <p className="install-intro">Use the canonical Streamable HTTP endpoint in any compatible MCP client.</p>
      <CodeBlock copyKey="hosted-json" copiedKey={copiedKey} onCopy={onCopy}>
        {HOSTED_CONFIG}
      </CodeBlock>
      <p className="install-footnote">No authentication is required. The server is anonymous, stateless, and exposes read-only tools.</p>
    </div>
  );
}

function LocalInstructions({ client, copiedKey, onCopy }) {
  const connection = useMemo(() => {
    if (client === "claude-code") {
      return {
        label: "Then connect Claude Code over stdio",
        key: "claude-code-local",
        code: "claude mcp add --scope user theologai-local -- node /absolute/path/to/TheologAI/dist/index.js",
      };
    }
    if (client === "codex") {
      return {
        label: "Then connect Codex over stdio",
        key: "codex-local",
        code: "codex mcp add theologai-local -- node /absolute/path/to/TheologAI/dist/index.js",
      };
    }
    return {
      label: client === "claude" ? "Then add the local server to Claude Desktop" : "Then configure your client over stdio",
      key: "local-json",
      code: LOCAL_CONFIG,
    };
  }, [client]);

  return (
    <div className="install-detail">
      <div className="requirements" aria-label="Local requirements">
        <span>Node 22</span><span>npm</span><span>sqlite3</span>
      </div>
      <p className="install-intro local-intro">Run the source library on your own machine in three stages:</p>
      <ol className="local-overview">
        <li><span>1</span>Clone the repository and install its dependencies.</li>
        <li><span>2</span>Verify the pinned sources and build the local database.</li>
        <li><span>3</span>Connect your MCP client to the built server.</li>
      </ol>
      <details className="local-guide">
        <summary>
          <span>View the full local install guide</span>
          <small>Commands and client configuration</small>
        </summary>
        <div className="local-guide-content">
          <p className="install-intro">Clone, verify, and build:</p>
          <CodeBlock copyKey="local-build" copiedKey={copiedKey} onCopy={onCopy}>
            {LOCAL_BUILD}
          </CodeBlock>
          <p className="install-intro install-intro-spaced">{connection.label}:</p>
          <CodeBlock copyKey={connection.key} copiedKey={copiedKey} onCopy={onCopy} compact>
            {connection.code}
          </CodeBlock>
          <p className="install-footnote">Replace the example path with the repository’s absolute path. Local mode uses direct stdio transport and includes MCP logging.</p>
        </div>
      </details>
    </div>
  );
}

function InstallPanel({ mode, setMode, client, setClient, copiedKey, onCopy }) {
  return (
    <div className="install-panel" id="install">
      <div className="ornament-corner ornament-corner-top" aria-hidden="true" />
      <div className="ornament-corner ornament-corner-bottom" aria-hidden="true" />
      <div className="install-panel-header">
        <div>
          <span className="eyebrow">Start here</span>
          <h2>{mode === "hosted" ? "Connect in under a minute" : "Run TheologAI locally"}</h2>
        </div>
        <span className="free-badge">Free &amp; open source</span>
      </div>

      <div className="mode-switch" role="tablist" aria-label="Installation mode">
        <button type="button" role="tab" aria-selected={mode === "hosted"} className={mode === "hosted" ? "active" : ""} onClick={() => setMode("hosted")}>
          <span className="mode-icon">⌁</span><span><strong>Hosted MCP</strong><small>Fastest setup</small></span>
        </button>
        <button type="button" role="tab" aria-selected={mode === "local"} className={mode === "local" ? "active" : ""} onClick={() => setMode("local")}>
          <span className="mode-icon">⌘</span><span><strong>Run locally</strong><small>Privacy &amp; control</small></span>
        </button>
      </div>

      <div className="client-tabs" role="tablist" aria-label="MCP client">
        {CLIENTS.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={client === item.id} className={client === item.id ? "active" : ""} onClick={() => setClient(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      {mode === "hosted" ? (
        <HostedInstructions client={client} copiedKey={copiedKey} onCopy={onCopy} />
      ) : (
        <LocalInstructions client={client} copiedKey={copiedKey} onCopy={onCopy} />
      )}

      <FirstPrompt copiedKey={copiedKey} onCopy={onCopy} />

      <div className="trust-row">
        <span>◇ No account</span><span>◇ No API key</span><span>◇ Read-only tools</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [installMode, setInstallMode] = useState("hosted");
  const [client, setClient] = useState("claude");
  const [copiedKey, setCopiedKey] = useState("");
  const [activeDemo, setActiveDemo] = useState("passage");
  const [showDonate, setShowDonate] = useState(false);

  const copyText = (text, key) => {
    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    };

    setCopiedKey(key);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    window.setTimeout(() => setCopiedKey(""), 1800);
  };

  const currentDemo = DEMOS.find((demo) => demo.id === activeDemo) || DEMOS[0];

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="site-shell" id="top">
        <header className="site-header">
          <Brand />
          <nav aria-label="Main navigation">
            <a href="#workflows">Workflows</a>
            <a href="#tools">Tools</a>
            <a href="#sources">Sources</a>
            <a href="#install">Install</a>
          </nav>
          <a className="header-github" href="https://github.com/TJ-Frederick/TheologAI" target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </header>

        <main id="main">
          <section className="hero-section">
            <div className="marginalia" aria-hidden="true"><span>Ps.</span><strong>119:105</strong></div>
            <div className="hero-copy">
              <div className="hero-kicker"><span className="status-dot" /> Open-source MCP server</div>
              <h1>Ground your AI in <em>Scripture</em> and primary sources.</h1>
              <p>
                MCP lets your AI use external research tools directly inside the conversation. TheologAI gives Claude, Claude Code, Codex, and other MCP clients eleven read-only tools for Bible text, Greek and Hebrew, commentary, and historical theology.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#demo">See what it returns <span>→</span></a>
                <a className="button button-secondary" href="#workflows">Explore the research path</a>
              </div>
              <div className="hero-proof">
                <div><strong>11</strong><span>research tools</span></div>
                <div><strong>6</strong><span>guided workflows</span></div>
                <div><strong>17</strong><span>historical documents</span></div>
              </div>
            </div>

            <InstallPanel
              mode={installMode}
              setMode={setInstallMode}
              client={client}
              setClient={setClient}
              copiedKey={copiedKey}
              onCopy={copyText}
            />
          </section>

          <section className="section workflows-section" id="workflows">
            <div className="section-heading split-heading">
              <div>
                <span className="eyebrow">Guided research</span>
                <h2>One question. A grounded research path.</h2>
              </div>
              <p>TheologAI helps your client gather evidence in a disciplined order, then keeps sources and interpretive limits visible in the result.</p>
            </div>
            <div className="workflow-grid">
              {WORKFLOWS.map((workflow) => (
                <article className="workflow-card" key={workflow.number}>
                  <span className="workflow-number">{workflow.number}</span>
                  <h3>{workflow.title}</h3>
                  <p>{workflow.description}</p>
                  <div className="workflow-steps">
                    {workflow.steps.map((step, index) => <span key={step}>{step}{index < workflow.steps.length - 1 && <i>→</i>}</span>)}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section demo-section" id="demo" aria-labelledby="demo-title">
            <div className="section-heading">
              <span className="eyebrow">Inside your MCP client</span>
              <h2 id="demo-title">Evidence that arrives organized.</h2>
              <p>Not a second chat interface—structured research returned directly inside the client you already use.</p>
            </div>
            <div className="research-demo">
              <div className="demo-sidebar">
                <span className="demo-sidebar-label">Guided workflows</span>
                <div className="demo-tabs" role="tablist" aria-label="Research examples">
                  {DEMOS.map((demo) => (
                    <button type="button" role="tab" aria-selected={activeDemo === demo.id} className={activeDemo === demo.id ? "active" : ""} key={demo.id} onClick={() => setActiveDemo(demo.id)}>
                      <span>{demo.label}</span><small>{demo.tool}</small>
                    </button>
                  ))}
                </div>
                <div className="demo-source-note"><span>◇</span> Structured output with source-local provenance</div>
              </div>
              <div className="demo-main">
                <div className="demo-prompt"><span>Prompt</span><p>{currentDemo.prompt}</p></div>
                <div className="demo-result" key={currentDemo.id}>{currentDemo.content}</div>
              </div>
            </div>
          </section>

          <section className="section tools-section" id="tools">
            <div className="section-heading split-heading">
              <div>
                <span className="eyebrow">The full registry</span>
                <h2>Eleven tools, one research surface.</h2>
              </div>
              <p>Each tool is bounded, read-only, and designed to preserve the difference between retrieved evidence and interpretation.</p>
            </div>
            <div className="tool-groups">
              {TOOL_GROUPS.map((group) => (
                <article className="tool-group" key={group.title}>
                  <div className="tool-symbol" aria-hidden="true">{group.symbol}</div>
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                  <ul>{group.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
                </article>
              ))}
            </div>
          </section>

          <section className="section sources-section" id="sources">
            <div className="sources-panel">
              <div className="sources-copy">
                <span className="eyebrow">Sources before synthesis</span>
                <h2>A library with its labels still attached.</h2>
                <p>Bible text, morphology, lexicons, commentary, and historical documents arrive with source-aware metadata. TheologAI makes uncertainty visible instead of filling the gap.</p>
                <a href="https://github.com/TJ-Frederick/TheologAI#content-scope-and-provenance" target="_blank" rel="noreferrer">Read the source and provenance notes <span>↗</span></a>
              </div>
              <div className="source-ledger">
                <div><span>Scripture</span><strong>8 translations</strong><small>verse-level retrieval and comparison</small></div>
                <div><span>Languages</span><strong>447,748 rows</strong><small>indexed STEPBible morphology</small></div>
                <div><span>Historical</span><strong>17 documents</strong><small>creeds, confessions, and catechisms</small></div>
                <div><span>Parallels</span><strong>2,193 groups</strong><small>UBS source-attested passage groups</small></div>
              </div>
            </div>
          </section>

          <section className="support-strip" aria-labelledby="support-title">
            <div>
              <span className="eyebrow">Community-supported</span>
              <h2 id="support-title">Keep the hosted server open and free.</h2>
              <p>Donations help cover infrastructure and future source work. They never unlock features.</p>
            </div>
            <button type="button" className="button button-secondary support-button" onClick={() => setShowDonate(true)}>Support TheologAI</button>
          </section>
        </main>

        <footer className="site-footer">
          <Brand footer />
          <p>Open-source, AI-native Bible study infrastructure.</p>
          <div>
            <a href="#install">Install</a>
            <a href="https://github.com/TJ-Frederick/TheologAI" target="_blank" rel="noreferrer">GitHub</a>
            <button type="button" onClick={() => setShowDonate(true)}>Donate</button>
          </div>
        </footer>
      </div>

      {showDonate && (
        <Suspense fallback={<DonationLoading onClose={() => setShowDonate(false)} />}>
          <DonationExperience onClose={() => setShowDonate(false)} />
        </Suspense>
      )}
    </>
  );
}
