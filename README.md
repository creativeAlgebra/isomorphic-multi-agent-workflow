<p align="center">
  <img src="hero-square.png" alt="IMAW — Isomorphic Multi-Agent Workflow" width="600">
</p>

<h1 align="center">Isomorphic Multi-Agent Workflow (IMAW)</h1>

<p align="center">
  <strong>A Generative Control Architecture that prevents structural corruption in AI-generated explanations.</strong>
</p>

<p align="center">
  <a href="https://controlarc.com"><img src="https://img.shields.io/badge/Website-controlarc.com-black" alt="Website"></a>
  <a href="#"><img src="https://img.shields.io/badge/Status-Experimental-yellow" alt="Status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Python-3.10+-green" alt="Python 3.10+"></a>
</p>

---

When AI explains a complex system through a metaphor, source-domain jargon almost always leaks into the output — a phenomenon researchers call **semantic leakage**. The analogy starts well but breaks down as technical terms contaminate the narrative. Generative Control Architecture prevents this by splitting the translation across isolated agents, each blind to the others' domain vocabulary. The result is a metaphor with structural fidelity: you can reason inside it and trust what you find.

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

# 4. Set your API key (pick ONE)
export GOOGLE_GENAI_API_KEY='your-key-here'   # Google Gemini (default)
# export OPENAI_API_KEY='sk-...'              # OpenAI
# export ANTHROPIC_API_KEY='sk-ant-...'       # Anthropic
# export GROQ_API_KEY='gsk_...'               # Groq (fast + free tier)
# export MISTRAL_API_KEY='...'                # Mistral
# export DEEPSEEK_API_KEY='...'               # DeepSeek

# 5. Launch the CLI
python cli.py
```

That's it. The CLI will auto-detect your key and walk you through everything.

## Supported Providers

| Provider | Env Var | Default Model | Notes |
|---|---|---|---|
| Google Gemini | `GOOGLE_GENAI_API_KEY` | `gemini-2.5-pro` | Default, native structured output |
| OpenAI | `OPENAI_API_KEY` | `gpt-4o` | JSON mode via response_format |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-4-20250514` | JSON via system prompt |
| Groq | `GROQ_API_KEY` | `llama-3.3-70b-versatile` | Blazing fast, free tier |
| Mistral | `MISTRAL_API_KEY` | `mistral-large-latest` | OpenAI-compatible |
| DeepSeek | `DEEPSEEK_API_KEY` | `deepseek-chat` | OpenAI-compatible |

If multiple keys are set, the CLI will ask you to choose.

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

## Architecture: The Multi-Agent Pipeline

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

## Early Results

In initial testing across domains including Kubernetes architecture, Organizational Change, and Supply Chain logistics, a standard monolithic LLM prompt consistently exhibited Contextual Leakage — technical jargon bleeding into the metaphorical output.

The IMAW pipeline achieved **consistent isolation**, scoring **100/100** for Structural Fidelity in every test case. The architectural separation, not any single model's capability, is what enforces the constraint.

> Testing has been conducted primarily on Gemini. We expect similar results across providers due to the pipeline's model-agnostic design, and are actively expanding validation.

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