# Agent Context: IMAW (Isomorphic Multi-Agent Workflow)

## Project Overview
IMAW is a research-backed methodology and software framework designed for high-fidelity conceptual translation. It solves **Semantic Leakage** (where technical terms contaminate analogies) using a 4-agent pipeline built around **Contextual Blindness**. This pipeline isolates domains (source vs. metaphor) so no single AI agent can cross-pollinate jargon, generating structured and inspectable artifacts instead of monolithic essays.

### The 4-Agent Pipeline
1. **Agent 1: Decompose** - Extracts pure abstract schema (blind to target metaphor).
*(v1.1 features an LLM-Judge at Agent 1.5 to validate and remediate jargon)*
2. **Agent 2: Map** - Builds a 1:1 translation dictionary (blind to source concept).
3. **Agent 3: Synthesize** - Assembles the explanation entirely within the metaphor.
4. **Agent 4: Decode Key** - Acts as a Rosetta Stone side-by-side mapping.

The system also heavily leans on the **Double-Translation Loop** for conversational pedagogy and **Adaptive Schema Expansion** allowing dynamic tutoring without breaking context.

## Project Structure
The repository is split into the following main functional areas:

- **`imaw_prototype/`**
  - The core Python implementation and CLI (`cli.py`).
  - Contains empirical validation pipelines (`generate_evidence.py`, `test_corpus.py`).
  - Architecture relies heavily on modularizing agents (`agents/` directory) and strict package boundaries (`imaw/` module).
  
- **`imaw_website/`**
  - The presentation and marketing website.
  - **Stack**: Node.js >= 18, React 19, Vite, and tailwindcss v4.
  - **Styles**: Leverages 'OpenAI Minimalist' web presentation standards prioritizing high-craft visual interfaces.

- **Root Documents**
  - `final_imaw_research_paper.md` & `theoretical_imaw_research_paper.md`
  - `imaw_investor_presentation.md`

## Tech Stack & Key Technologies
- **Prototype Engine**: Python 3.10+, Multi-LLM provider compatibility (Gemini [Default], OpenAI, Anthropic, Groq).
- **Web Frontend**: React 19, Vite, Tailwind v4, React Markdown.

## Agent Persona & User Directives
- **Primary Persona**: **SHIP-IT PROTOTYPER**. Act as a senior full-stack prototype engineer.
- **Goal**: Build fast, secure MVPs with minimal scope creep and production-grade defaults.
- When working in `imaw_prototype/`, ensure modifications rigorously respect the *Contextual Blindness* separation between agents to avoid reintroducing Semantic Leakage.
- When working in `imaw_website/`, adhere strictly to React 19 patterns and Tailwind v4 CSS-first architecture. Follow the principle of high-craft, "Practical Luxury" visual interfaces.
