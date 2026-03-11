<p align="center">
  <img src="hero-square.png" alt="IMAW — Isomorphic Multi-Agent Workflow" width="600">
</p>

<h1 align="center">Isomorphic Multi-Agent Workflow (IMAW)</h1>

<p align="center">
  <strong>A Generative Control Architecture that prevents structural corruption in AI-generated explanations.</strong>
</p>

<p align="center">
  <a href="https://creativealgebra.com"><img src="https://img.shields.io/badge/Website-creativealgebra.com-black" alt="Website"></a>
  <a href="#"><img src="https://img.shields.io/badge/Status-Experimental-yellow" alt="Status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Python-3.10+-green" alt="Python 3.10+"></a>
</p>

---

When AI maps complex knowledge onto metaphors, technical facts and creative narratives contaminate each other — a phenomenon called **Contextual Leakage**. IMAW is the architectural solution. By enforcing strict isolation through a multi-agent pipeline, IMAW guarantees mathematically rigid semantic firewalls: identical logic across discrete domains, zero hallucinated jargon.

## Quickstart

```bash
# 1. Clone
git clone https://github.com/creativeAlgebra/isomorphic-multi-agent-workflow.git
cd isomorphic-multi-agent-workflow

# 2. Create a virtual environment
python3 -m venv venv && source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
pip install -e .

# 4. Set your API key (Google Gemini)
export GOOGLE_GENAI_API_KEY='your-key-here'

# 5. Launch the CLI
python cli.py
```

That's it. The CLI will walk you through everything.

## What the CLI Does

The interactive CLI presents two modes:

| Mode | What It Does |
|------|-------------|
| **🔬 See It Work** | Runs a pre-loaded example (TCP/IP → Castle Diplomacy) through the live 4-agent pipeline, then lets you inspect every artifact. |
| **🎓 Explore a Topic** | Enter your own source concept and target metaphor, run the pipeline, then chat with the Isomorphic Tutor using the Double-Translation Loop. |

After a pipeline run, the **Session Menu** lets you:
- Inspect each agent's output (abstract schema, mapping dictionary, final lesson, decode key)
- View what each agent received (prompt summaries for full transparency)
- Continue exploring via the **Double-Translation Loop** tutor chat
- Export the entire session to disk

## Architecture: The 3+1 Agent Pipeline

The core insight is **Contextual Blindness** — physically separating the workflow so no single agent can cross-pollinate domains.

```
┌─────────────────────┐
│   Source Concept     │
│   (e.g., TCP/IP)    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Agent 1: Decompose │  Strips all domain jargon → pure abstract schema
│  (Blind to target)  │  Output: entities, relationships, rules (JSON)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Agent 2: Map       │  Builds 1:1 translation dictionary
│  (Blind to source)  │  Abstract entities → metaphor entities
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Agent 3: Synthesize│  Assembles lesson entirely within the metaphor
│  (Blind to source   │  Zero chance of leakage
│   AND schema)       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Agent 4: Decode Key│  Side-by-side Rosetta Stone mapping
│  (Full context)     │  metaphor ↔ reality
└─────────────────────┘
```

## Project Structure

```
isomorphic-multi-agent-workflow/
├── cli.py                  # Interactive terminal UI (Rich + InquirerPy)
├── setup.py                # pip install -e .
├── requirements.txt        # Runtime dependencies
├── generate_evidence.py    # Empirical test suite (IMAW vs monolithic LLM)
├── agents/                 # Individual agent implementations
│   ├── decomposition.py    # Agent 1 — structural extraction
│   ├── mapping.py          # Agent 2 — isomorphic translation
│   ├── compiler.py         # Agent 3 — narrative synthesis
│   ├── decode_key.py       # Agent 4 — side-by-side decode key
│   └── tutor.py            # Double-Translation Loop tutor
├── imaw/                   # Core library (importable package)
│   ├── orchestrator.py     # Pipeline orchestration
│   └── session.py          # TutorSession state management
├── docs/
│   ├── GETTING_STARTED.md  # Setup guide
│   └── ARCHITECTURE.md     # Deep dive into methodology
├── CONTRIBUTING.md         # How to contribute
└── LICENSE                 # MIT
```

## Empirical Results

In rigorous testing across multiple domains (Organizational Change, Global Supply Chain, Material Science), monolithic LLMs (GPT-4o, Claude 3.5 Sonnet, Gemini 2.0 Pro) completely failed to prevent Contextual Leakage.

The IMAW pipeline achieved **absolute isolation**, consistently scoring **100/100** for both Structural Fidelity and Contextual De-duplication.

Run the evidence suite yourself:

```bash
python generate_evidence.py
```

## Links

- 🌐 [Website](https://creativealgebra.com) — Interactive demo with the full pipeline running in-browser
- 📄 [Architecture Deep Dive](docs/ARCHITECTURE.md) — Technical methodology
- 🤝 [Contributing](CONTRIBUTING.md) — How to help

## License

[MIT](LICENSE) — Copyright (c) 2026 The IMAW Project