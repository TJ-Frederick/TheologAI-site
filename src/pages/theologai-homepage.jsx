import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ─── DATA ────────────────────────────────────────────────────────────────────

const TOOLS = [
  { id: "bible_lookup", name: "Bible Lookup", icon: "📖", desc: "8 translations, verse-level precision" },
  { id: "morphology", name: "Greek/Hebrew Morphology", icon: "𝛢", desc: "Word-by-word grammatical parsing" },
  { id: "commentary", name: "Commentary", icon: "✍", desc: "6 classic commentators" },
  { id: "cross_refs", name: "Cross-References", icon: "🔗", desc: "Community-ranked related passages" },
  { id: "original_lang", name: "Original Language", icon: "λ", desc: "Strong's lexicon with extended data" },
  { id: "parallel", name: "Parallel Passages", icon: "⇄", desc: "Synoptic, quotation & thematic links" },
  { id: "classic_texts", name: "Classic Texts", icon: "📜", desc: "Creeds, confessions, catechisms & CCEL" },
];

const TRANSLATIONS = ["ESV", "NET", "KJV", "WEB", "BSB", "ASV", "YLT", "DBY"];
const COMMENTATORS = ["Matthew Henry", "Jamieson-Fausset-Brown", "Adam Clarke", "John Gill", "Keil-Delitzsch", "Tyndale"];

const DEMOS = [
  {
    id: "compare",
    label: "Compare Translations",
    prompt: "Look up John 1:1-3 in ESV and KJV",
    tool: "bible_lookup",
    result: {
      type: "translation_compare",
      reference: "John 1:1–3",
      translations: {
        ESV: "[1] In the beginning was the Word, and the Word was with God, and the Word was God. [2] He was in the beginning with God. [3] All things were made through him, and without him was not any thing made that was made.",
        KJV: "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made."
      }
    }
  },
  {
    id: "morphology",
    label: "Greek Morphology",
    prompt: "Parse the Greek of John 1:1 word by word",
    tool: "bible_verse_morphology",
    result: {
      type: "morphology",
      reference: "John 1:1",
      words: [
        { text: "Ἐν", lemma: "ἐν", strongs: "G1722", morph: "Preposition", gloss: "In [the]" },
        { text: "ἀρχῇ", lemma: "ἀρχή", strongs: "G0746", morph: "Noun, Dat, Sg, Fem", gloss: "beginning" },
        { text: "ἦν", lemma: "εἰμί", strongs: "G1510", morph: "Verb, Impf, Act, Ind", gloss: "was" },
        { text: "ὁ", lemma: "ὁ", strongs: "G3588", morph: "Art, Nom, Sg, Masc", gloss: "the" },
        { text: "λόγος", lemma: "λόγος", strongs: "G3056", morph: "Noun, Nom, Sg, Masc", gloss: "Word" },
        { text: "καὶ", lemma: "καί", strongs: "G2532", morph: "Conjunction", gloss: "and" },
        { text: "ὁ", lemma: "ὁ", strongs: "G3588", morph: "Art, Nom, Sg, Masc", gloss: "the" },
        { text: "λόγος", lemma: "λόγος", strongs: "G3056", morph: "Noun, Nom, Sg, Masc", gloss: "Word" },
        { text: "ἦν", lemma: "εἰμί", strongs: "G1510", morph: "Verb, Impf, Act, Ind", gloss: "was" },
        { text: "πρὸς", lemma: "πρός", strongs: "G4314", morph: "Preposition", gloss: "with" },
        { text: "τὸν", lemma: "ὁ", strongs: "G3588", morph: "Art, Acc, Sg, Masc", gloss: "the" },
        { text: "θεόν", lemma: "θεός", strongs: "G2316", morph: "Noun, Acc, Sg, Masc", gloss: "God" },
        { text: "καὶ", lemma: "καί", strongs: "G2532", morph: "Conjunction", gloss: "and" },
        { text: "θεὸς", lemma: "θεός", strongs: "G2316", morph: "Noun, Nom, Sg, Masc", gloss: "God" },
        { text: "ἦν", lemma: "εἰμί", strongs: "G1510", morph: "Verb, Impf, Act, Ind", gloss: "was" },
        { text: "ὁ", lemma: "ὁ", strongs: "G3588", morph: "Art, Nom, Sg, Masc", gloss: "the" },
        { text: "λόγος", lemma: "λόγος", strongs: "G3056", morph: "Noun, Nom, Sg, Masc", gloss: "Word" },
      ]
    }
  },
  {
    id: "commentary",
    label: "Classic Commentary",
    prompt: "What does Matthew Henry say about Romans 8:28?",
    tool: "commentary_lookup",
    result: {
      type: "commentary",
      reference: "Romans 8:28",
      commentator: "Matthew Henry",
      text: "The apostle here suggests two privileges more to which true Christians are entitled: the help of the Spirit in prayer. While we are in this world, hoping and waiting for what we see not, we must be praying. Hope supposes desire, and that desire offered up to God is prayer; we groan. Now observe — our weakness in prayer: We know not what we should pray for as we ought. As to the matter of our requests, we know not what to ask. We are not competent judges of our own condition."
    }
  },
  {
    id: "crossrefs",
    label: "Cross-References",
    prompt: "Find cross-references for Psalm 23:1",
    tool: "bible_cross_references",
    result: {
      type: "cross_refs",
      reference: "Psalm 23:1",
      refs: [
        { ref: "Philippians 4:19", votes: 409, text: "And my God will supply every need of yours according to his riches in glory in Christ Jesus." },
        { ref: "John 10:11", votes: 351, text: "I am the good shepherd. The good shepherd lays down his life for the sheep." },
        { ref: "Isaiah 40:11", votes: 259, text: "He will tend his flock like a shepherd; he will gather the lambs in his arms." },
        { ref: "John 10:27-30", votes: 252, text: "My sheep hear my voice, and I know them, and they follow me." },
        { ref: "John 10:14", votes: 210, text: "I am the good shepherd. I know my own and my own know me." },
      ]
    }
  },
  {
    id: "lexicon",
    label: "Word Study",
    prompt: "Look up the Greek word agapaō (G25)",
    tool: "original_language_lookup",
    result: {
      type: "lexicon",
      strongs: "G25",
      lemma: "ἀγαπάω",
      translit: "agapáō",
      pronunciation: "ag-ap-ah'-o",
      definition: "to love (in a social or moral sense)",
      language: "Greek"
    }
  }
];

const MCP_CONFIG = `{
  "mcpServers": {
    "theologai": {
      "type": "url",
      "url": "https://theologai.tjfrederick.workers.dev/mcp"
    }
  }
}`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function AnimatedIn({ children, delay = 0, className = "" }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`
    }}>
      {children}
    </div>
  );
}

function DemoResult({ demo }) {
  const r = demo.result;
  if (r.type === "translation_compare") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase" }}>{r.reference}</div>
        {Object.entries(r.translations).map(([t, text]) => (
          <div key={t}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginBottom: 6, letterSpacing: "0.05em" }}>{t}</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, lineHeight: 1.7, color: "var(--text)" }}>{text}</div>
          </div>
        ))}
      </div>
    );
  }
  if (r.type === "morphology") {
    return (
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 12 }}>{r.reference} — Greek Analysis</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Greek", "Lemma", "Strong's", "Morphology", "Gloss"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.words.map((w, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "5px 10px", fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--gold)" }}>{w.text}</td>
                  <td style={{ padding: "5px 10px", fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--text-secondary)" }}>{w.lemma}</td>
                  <td style={{ padding: "5px 10px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{w.strongs}</td>
                  <td style={{ padding: "5px 10px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)" }}>{w.morph}</td>
                  <td style={{ padding: "5px 10px", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>{w.gloss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>Source: STEPBible TAGNT — CC BY 4.0 (Tyndale House, Cambridge)</div>
      </div>
    );
  }
  if (r.type === "commentary") {
    return (
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 4 }}>{r.reference}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>{r.commentator}</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, lineHeight: 1.8, color: "var(--text)", fontStyle: "italic" }}>"{r.text}"</div>
        <div style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>Public Domain</div>
      </div>
    );
  }
  if (r.type === "cross_refs") {
    return (
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 16 }}>Cross-References for {r.reference}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {r.refs.map((ref, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                minWidth: 44, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--surface-alt)", borderRadius: 6,
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold)"
              }}>{ref.votes}</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--text)", marginBottom: 2 }}>{ref.ref}</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{ref.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (r.type === "lexicon") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 36, color: "var(--gold)" }}>{r.lemma}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{r.strongs}</span>
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text)" }}>{r.translit}</strong> — /{r.pronunciation}/
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--text)", lineHeight: 1.6 }}>{r.definition}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>Source: Strong's Concordance — Public Domain (OpenScriptures)</div>
      </div>
    );
  }
  return null;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function TheologAIHomepage() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [typing, setTyping] = useState(false);
  const [showResult, setShowResult] = useState(true);
  const [copied, setCopied] = useState(false);
  const [hoveredTool, setHoveredTool] = useState(null);

  useEffect(() => {
    setShowResult(false);
    setTyping(true);
    const t1 = setTimeout(() => setTyping(false), 800);
    const t2 = setTimeout(() => setShowResult(true), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [activeDemo]);

  const copyConfig = () => {
    navigator.clipboard.writeText(MCP_CONFIG);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');

        :root {
          --font-serif: 'Cormorant Garamond', Georgia, serif;
          --font-display: 'DM Sans', system-ui, sans-serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
          --font-hero: 'Instrument Serif', serif;

          --bg: #0C0E12;
          --bg-alt: #111318;
          --surface: #161920;
          --surface-alt: #1C1F28;
          --border: #2A2D38;
          --border-subtle: #1E2129;
          --text: #E8E4DD;
          --text-secondary: #A8A49C;
          --muted: #6B6760;
          --gold: #C9A86C;
          --gold-dim: #8B7644;
          --gold-glow: rgba(201, 168, 108, 0.08);
          --accent: #7B9EA8;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
        }

        ::selection {
          background: var(--gold);
          color: var(--bg);
        }

        .page-wrapper {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Grain overlay */
        .page-wrapper::before {
          content: '';
          position: fixed;
          inset: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 999;
        }

        .hero {
          padding: 100px 24px 80px;
          text-align: center;
          position: relative;
        }

        .hero::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border: 1px solid var(--border);
          border-radius: 100px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.06em;
          margin-bottom: 32px;
          background: var(--surface);
        }

        .hero-badge .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .hero h1 {
          font-family: var(--font-hero);
          font-size: clamp(48px, 8vw, 88px);
          font-weight: 400;
          line-height: 1.05;
          color: var(--text);
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        .hero h1 em {
          color: var(--gold);
          font-style: italic;
        }

        .hero-sub {
          font-family: var(--font-body);
          font-size: 17px;
          color: var(--text-secondary);
          max-width: 520px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: var(--gold);
          color: var(--bg);
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: transparent;
          color: var(--text);
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 500;
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-secondary:hover { border-color: var(--gold-dim); color: var(--gold); }

        /* Sections */
        .section {
          padding: 80px 24px;
          max-width: 1080px;
          margin: 0 auto;
        }

        .section-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--gold);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .section-title {
          font-family: var(--font-hero);
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 400;
          color: var(--text);
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }

        .section-desc {
          font-size: 15px;
          color: var(--text-secondary);
          max-width: 560px;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        /* Demo */
        .demo-tabs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .demo-tab {
          padding: 7px 16px;
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--muted);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .demo-tab:hover { color: var(--text); border-color: var(--gold-dim); }
        .demo-tab.active { background: var(--gold-glow); color: var(--gold); border-color: var(--gold-dim); }

        .demo-window {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .demo-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
        }

        .demo-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--border);
        }

        .demo-prompt {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .demo-prompt-icon {
          font-size: 14px;
          color: var(--accent);
        }

        .demo-prompt-text {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--text);
        }

        .demo-body {
          padding: 20px;
          min-height: 200px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }
        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--muted);
          animation: typingDot 1s ease-in-out infinite;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.15s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.3s; }

        @keyframes typingDot {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* Tools grid */
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 10px;
        }

        .tool-card {
          padding: 16px;
          background: var(--surface);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          cursor: default;
          transition: all 0.25s;
        }
        .tool-card:hover { border-color: var(--gold-dim); background: var(--surface-alt); }

        .tool-icon {
          font-size: 20px;
          margin-bottom: 8px;
          display: block;
        }

        .tool-name {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }

        .tool-desc {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.4;
        }

        /* Coverage */
        .coverage-row {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .coverage-block h4 {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .coverage-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .coverage-tag {
          padding: 4px 10px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-secondary);
          background: var(--surface);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
        }

        /* Setup */
        .setup-steps {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .setup-step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .step-num {
          min-width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gold-glow);
          border: 1px solid var(--gold-dim);
          border-radius: 8px;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--gold);
          font-weight: 500;
        }

        .step-content h4 {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }

        .step-content p {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .code-block {
          position: relative;
          background: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px;
          margin-top: 12px;
          overflow-x: auto;
        }

        .code-block pre {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
          white-space: pre;
        }

        .code-block .copy-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 10px;
          font-family: var(--font-mono);
          font-size: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--muted);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .code-block .copy-btn:hover { color: var(--gold); border-color: var(--gold-dim); }

        /* Comparison */
        .compare-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 24px;
        }
        @media (max-width: 640px) { .compare-grid { grid-template-columns: 1fr; } }

        .compare-card {
          padding: 24px;
          border-radius: 10px;
          border: 1px solid var(--border);
        }
        .compare-card.without { background: var(--bg-alt); }
        .compare-card.with { background: var(--gold-glow); border-color: var(--gold-dim); }

        .compare-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .compare-text {
          font-family: var(--font-serif);
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-secondary);
        }
        .compare-card.with .compare-text { color: var(--text); }

        /* Donate */
        .donate-section {
          text-align: center;
          padding: 80px 24px;
          max-width: 600px;
          margin: 0 auto;
        }

        .donate-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          background: linear-gradient(135deg, var(--gold-dim), var(--gold));
          color: var(--bg);
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }
        .donate-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201, 168, 108, 0.2); }

        /* Footer */
        .footer {
          padding: 40px 24px;
          text-align: center;
          border-top: 1px solid var(--border-subtle);
        }

        .footer-text {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--muted);
        }

        /* Divider */
        .divider {
          width: 80px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
          margin: 0 auto;
        }
      `}</style>

      <div className="page-wrapper">
        {/* ── HERO ── */}
        <header className="hero">
          <AnimatedIn>
            <div className="hero-badge">
              <span className="dot" />
              MCP Server
            </div>
          </AnimatedIn>
          <AnimatedIn delay={100}>
            <h1>Theolog<em>AI</em></h1>
          </AnimatedIn>
          <AnimatedIn delay={200}>
            <p className="hero-sub">
              AI-native Bible study infrastructure. Plug into Claude, Cursor, or any MCP client
              and get scholarly-grade tools — translations, commentaries, Greek & Hebrew parsing, and more.
            </p>
          </AnimatedIn>
          <AnimatedIn delay={300}>
            <div className="hero-actions">
              <a href="#setup" className="btn-primary">Add to Claude →</a>
              <a href="#demo" className="btn-secondary">See it work</a>
            </div>
          </AnimatedIn>
        </header>

        {/* ── WHY ── */}
        <section className="section" id="why">
          <AnimatedIn>
            <div className="section-label">The Problem</div>
            <div className="section-title">AI hallucinates theology</div>
            <div className="section-desc">
              Without grounded sources, language models guess at verse references,
              fabricate commentary, and can't parse a single Greek word. TheologAI fixes that.
            </div>
          </AnimatedIn>
          <AnimatedIn delay={100}>
            <div className="compare-grid">
              <div className="compare-card without">
                <div className="compare-label" style={{ color: "var(--muted)" }}>Claude without TheologAI</div>
                <div className="compare-text">
                  "The Greek word for love in John 3:16 is <em>agape</em>, which generally means unconditional love.
                  I believe the Strong's number is around G26 or G25..."
                </div>
              </div>
              <div className="compare-card with">
                <div className="compare-label" style={{ color: "var(--gold)" }}>Claude with TheologAI</div>
                <div className="compare-text">
                  "<strong>G25 ἀγαπάω</strong> (agapáō) — 'to love in a social or moral sense.'
                  Verb, Active, Indicative. Appears 143× in the NT. Per Strong's Concordance via OpenScriptures."
                </div>
              </div>
            </div>
          </AnimatedIn>
        </section>

        <div className="divider" />

        {/* ── DEMO ── */}
        <section className="section" id="demo">
          <AnimatedIn>
            <div className="section-label">Live Examples</div>
            <div className="section-title">See what the tools return</div>
            <div className="section-desc">
              Pre-baked outputs from real tool calls. This is exactly what Claude sees when
              it invokes TheologAI.
            </div>
          </AnimatedIn>
          <AnimatedIn delay={100}>
            <div className="demo-tabs">
              {DEMOS.map((d, i) => (
                <button key={d.id} className={`demo-tab ${activeDemo === i ? "active" : ""}`} onClick={() => setActiveDemo(i)}>
                  {d.label}
                </button>
              ))}
            </div>
            <div className="demo-window">
              <div className="demo-header">
                <div className="demo-dot" />
                <div className="demo-dot" />
                <div className="demo-dot" />
              </div>
              <div className="demo-prompt">
                <span className="demo-prompt-icon">▶</span>
                <span className="demo-prompt-text">{DEMOS[activeDemo].prompt}</span>
              </div>
              <div className="demo-body">
                {typing ? (
                  <div className="typing-indicator"><span /><span /><span /></div>
                ) : showResult ? (
                  <div style={{ opacity: 1, animation: "fadeIn 0.4s ease" }}>
                    <DemoResult demo={DEMOS[activeDemo]} />
                  </div>
                ) : null}
              </div>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          </AnimatedIn>
        </section>

        <div className="divider" />

        {/* ── TOOLS ── */}
        <section className="section" id="tools">
          <AnimatedIn>
            <div className="section-label">7 Tools</div>
            <div className="section-title">The full toolkit</div>
            <div className="section-desc">
              Each tool is an MCP endpoint that any compatible client can call.
            </div>
          </AnimatedIn>
          <AnimatedIn delay={100}>
            <div className="tools-grid">
              {TOOLS.map(t => (
                <div key={t.id} className="tool-card" onMouseEnter={() => setHoveredTool(t.id)} onMouseLeave={() => setHoveredTool(null)}>
                  <span className="tool-icon">{t.icon}</span>
                  <div className="tool-name">{t.name}</div>
                  <div className="tool-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </AnimatedIn>
          <AnimatedIn delay={200}>
            <div className="coverage-row">
              <div className="coverage-block">
                <h4>Translations</h4>
                <div className="coverage-tags">
                  {TRANSLATIONS.map(t => <span key={t} className="coverage-tag">{t}</span>)}
                </div>
              </div>
              <div className="coverage-block">
                <h4>Commentators</h4>
                <div className="coverage-tags">
                  {COMMENTATORS.map(c => <span key={c} className="coverage-tag">{c}</span>)}
                </div>
              </div>
            </div>
          </AnimatedIn>
        </section>

        <div className="divider" />

        {/* ── SETUP ── */}
        <section className="section" id="setup">
          <AnimatedIn>
            <div className="section-label">Get Started</div>
            <div className="section-title">Add to Claude in 30 seconds</div>
          </AnimatedIn>
          <AnimatedIn delay={100}>
            <div className="setup-steps">
              <div className="setup-step">
                <div className="step-num">1</div>
                <div className="step-content">
                  <h4>Open Claude Settings</h4>
                  <p>Go to Settings → Integrations → MCP Servers in Claude Desktop or claude.ai.</p>
                </div>
              </div>
              <div className="setup-step">
                <div className="step-num">2</div>
                <div className="step-content">
                  <h4>Add the server config</h4>
                  <p>Paste this into your MCP configuration:</p>
                  <div className="code-block">
                    <button className="copy-btn" onClick={copyConfig}>{copied ? "Copied ✓" : "Copy"}</button>
                    <pre>{MCP_CONFIG}</pre>
                  </div>
                </div>
              </div>
              <div className="setup-step">
                <div className="step-num">3</div>
                <div className="step-content">
                  <h4>Start asking</h4>
                  <p>Try: "Look up the Greek morphology of John 1:1" or "What does John Gill say about Romans 9:18?"</p>
                </div>
              </div>
            </div>
          </AnimatedIn>
        </section>

        <div className="divider" />

        {/* ── DONATE ── */}
        <section className="donate-section" id="donate">
          <AnimatedIn>
            <div className="section-label">Support the Project</div>
            <div className="section-title" style={{ marginBottom: 16 }}>Keep TheologAI running</div>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 32 }}>
              TheologAI is free to use. Donations help cover server costs and fund
              new features — more translations, more commentators, systematic theology search.
            </p>
            <Link to="/donate" className="donate-btn">
              <span style={{ fontSize: 18 }}>◈</span> Donate with USDC
            </Link>
            <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
              Stablecoins on Base · x402 compatible
            </div>
          </AnimatedIn>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-text">
            TheologAI — AI-native Bible study infrastructure
          </div>
        </footer>
      </div>
    </>
  );
}
