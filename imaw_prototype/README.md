# Inspectable Multi-Agent Workflow (IMAW)

*A state-bound AI pipeline that safely translates complex corporate logic across domains via auditable JSON state mapping—localizing the unpredictable hallucinations of standard RAG into a diagnosable state.*

Standard RAG (Retrieval-Augmented Generation) models summarize text and improvise facts. IMAW forces AI to commit to a strict, human-auditable JSON artifact *before* generating text. It extracts pure logic, allows human-in-the-loop state management, and synthesizes fluid outputs structurally bound to your constraints. 

**Avoid the RAG Trap:** Safely translate a 50-page Legal MSA into a Sales Playbook with explicit, node-level traceability back to the source text. 

## The Enterprise Pipeline (Stateful Translation)

IMAW distributes cross-domain translation across four isolated agents:
1. **Decompose:** Ingests dense source documents (e.g., Legal, Architecture) and strips raw syntax to build a pure abstract logic graph (JSON).
2. **Map (Data Isolation):** A blinded agent maps the abstract logic 1:1 into the target domain (e.g., Sales, Compliance), building a strict translation dictionary.
3. **HITL Orchestration:** The pipeline pauses. The Subject Matter Expert reviews and approves the JSON state—your "mixing board" for AI control.
4. **Synthesize & Decode:** The engine generates the final output strictly bound to the approved dictionary, alongside a **Decode Key** that traces every generated sentence back to the original source clause.

## Quickstart

```bash
# 1. Clone & Install
git clone https://github.com/creativeAlgebra/isomorphic-multi-agent-workflow.git
cd isomorphic-multi-agent-workflow/imaw_prototype
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pip install -e .

# 2. Set your API key (Provider Agnostic: Gemini, OpenAI, Anthropic, Groq)
export GOOGLE_GENAI_API_KEY='your-key-here'

# 3. Launch the Orchestrator CLI
python cli.py
```

## Features
* **State-Bound Generation:** Highly constrained outputs. By forcing the final agent to generate strictly from the approved JSON state graph, structural drift is localized and easily caught.
* **The Decode Key:** Transparent, step-by-step audit trails that allow compliance and legal teams to verify the origin of every generated claim.
* **Cross-Domain Chat:** Query the engine in either the source or target domain; the Double-Translation Loop ensures the state logic never breaks.