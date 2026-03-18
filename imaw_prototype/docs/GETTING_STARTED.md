# Getting Started with IMAW

The Isomorphic Multi-Agent Workflow (IMAW) is a Generative Control Architecture that prevents Semantic Leakage in AI-generated explanations by enforcing Contextual Blindness across a 4-agent pipeline.

## Prerequisites

- Python 3.10+
- An API key from any supported provider (see below)

## Supported Providers

| Provider | Env Var | Default Model |
|---|---|---|
| Google Gemini | `GOOGLE_GENAI_API_KEY` | `gemini-2.5-pro` |
| OpenAI | `OPENAI_API_KEY` | `gpt-4o` |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-4-20250514` |
| Groq | `GROQ_API_KEY` | `llama-3.3-70b-versatile` |
| Mistral | `MISTRAL_API_KEY` | `mistral-large-latest` |
| DeepSeek | `DEEPSEEK_API_KEY` | `deepseek-chat` |

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/creativeAlgebra/isomorphic-multi-agent-workflow.git
   cd isomorphic-multi-agent-workflow
   ```

2. **Set up the environment:**
   ```bash
   python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   pip install -e .
   ```

3. **Set your API key (pick one):**
   ```bash
   export GOOGLE_GENAI_API_KEY="your-key-here"   # Google Gemini (default)
   # export OPENAI_API_KEY="sk-..."              # OpenAI
   # export ANTHROPIC_API_KEY="sk-ant-..."       # Anthropic
   ```

## Running the CLI

```bash
python cli.py
```

The CLI presents two modes:

| Mode | What It Does |
|------|-------------|
| **🔬 See It Work** | Runs a pre-loaded example through the live 4-agent pipeline, then lets you inspect every artifact. |
| **🎓 Explore a Topic** | Enter your own source concept and target metaphor, run the pipeline, then chat with the Isomorphic Tutor. |

## Running the Empirical Test Suite

```bash
# Smoke test (2 concepts)
python generate_evidence.py --dry-run

# Full 50-concept A/B test
python generate_evidence.py

# Calibrated re-grading (Hard Leakage vs Soft Resemblance)
python generate_evidence.py --regrade evidence/evidence_results_20260313_130608.csv
```

## Using IMAW as a Library

```python
from imaw.orchestrator import IMAWOrchestrator

source_concept = "Your complex technical concept here."
target_metaphor = "An unrelated, engaging metaphor (e.g., A 19th-Century Luxury Hotel)."

results = IMAWOrchestrator.generate_lesson(source_concept, target_metaphor)

print(results["lesson"])        # The metaphorical lesson (Agent 3 output)
print(results["decode_key"])    # The Rosetta Stone (Agent 4 output)
```

For sustained conversation after lesson generation, use `TutorSession`:

```python
from imaw.session import TutorSession

session = TutorSession(
    source_concept=source_concept,
    target_metaphor=target_metaphor,
    abstract_schema=results["abstract_schema"],
    mapping=results["mapping"],
    auto_expand=True  # Adaptive Schema Expansion (default)
)

response = session.add_user_message("What does the Head Butler do when a Wing is full?")
print(response)
```

> Full architecture details: [docs/ARCHITECTURE.md](ARCHITECTURE.md)
> Paper and empirical results: [controlarc.com](https://controlarc.com)
