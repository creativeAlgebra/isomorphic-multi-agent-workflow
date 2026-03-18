# Contributing to IMAW

Thank you for considering contributing to IMAW! This project explores **Generative Control Architecture** — designing AI systems where reliability comes from structure, not instruction.

## Core Architecture Constraints

Before contributing, please review the [Architecture Deep Dive](docs/ARCHITECTURE.md). The primary goal is enforcing **Contextual Blindness** to prevent Semantic Leakage. When submitting PRs to the core agents, please ensure:

1. **Agent 1 (Decompose)** remains blind to the target metaphor.
2. **Agent 2 (Map)** receives only the abstract schema and target metaphor — never the original source concept.
3. **Agent 3 (Synthesize)** is blind to both the original source concept and the raw abstract schema.
4. **Agent 4 (Decode Key)** is the *only* agent with full context — this is intentional.
5. **Tutor agents** (Double-Translation Loop) maintain information isolation during reverse-translate, oracle, and forward-translate steps.

## How Can I Contribute?

### Reporting Bugs

If you find a bug (e.g., jargon leaking through the pipeline, a schema detection failure, or an expansion error), please open an Issue. Include:
* Your Python version and provider/model used.
* The `source_concept` and `target_metaphor` that triggered the failure.
* The exact error output or leaked text.

### Suggesting Enhancements

We are particularly interested in:
* **Decomposition edge cases** — Improving Agent 1's handling of highly abstract or recursive concepts (e.g., Gödel's theorem, self-referential systems).
* **Decode Key quality assessment** — Measuring mapping completeness, bridging clarity, and net pedagogical value.
* **Alternative schema representations** — Exploring approaches beyond the Entities/Relationships/Rules format for edge-case concepts.
* **Validation gate tuning** — Reducing false positives/negatives in the v1.1 decomposition validation gate.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. Install dependencies: `pip install -e .`
3. If you've added code that should be tested, add tests.
4. Update documentation (including `README.md` or docstrings) if you've changed the API.
5. Create a PR detailing the problem your code solves.

## Development Setup

```bash
git clone https://github.com/creativeAlgebra/isomorphic-multi-agent-workflow.git
cd isomorphic-multi-agent-workflow
python -m venv venv
source venv/bin/activate
pip install -e .
```
