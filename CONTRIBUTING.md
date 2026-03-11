# Contributing to IMAW

First off, thank you for considering contributing to IMAW! It's people like you that make the open-source AI community such a fantastic place to learn, inspire, and create.

## Principles of the IMAW Architecture

Before contributing, please review the core philosophy of this library in the `README.md`. The primary goal of IMAW is enforcing **Contextual Blindness** to eliminate structural hallucination. 

When submitting PRs (Pull Requests) to the core agents, please ensure:
1. **Agent 1 (Decomposition)** remains completely unaware of Target Metaphors.
2. **Agent 2 (Mapping)** receives only abstract mathematical schemas, never the original text.
3. **Agent 3 (Compiler)** is not allowed to generate technical vocabulary from the original source.

## How Can I Contribute?

### Reporting Bugs
If you find a bug (e.g., an LLM hallucination leaking through the pipeline, or a Pydantic schema validation failure), please open an Issue. Include:
* Your Python version.
* The specific LLM model used (e.g., `gemini-2.5-pro`).
* The `source_concept` and `target_metaphor` that triggered the failure.
* The exact error output or hallucinated text.

### Suggesting Enhancements
We are particularly interested in enhancements surrounding:
* Expanding the supported LLM providers beyond Google GenAI.
* Improving the semantic parsing capabilities of Agent 1.
* Optimizing the latency of the `TutorSession` double-translation loop.

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. Install the development dependencies and ensure your code passes local tests.
3. If you've added code that should be tested, add tests.
4. Update the documentation (including `README.md` or Docstrings) if you've changed the API.
5. Create a PR detailing the problem your code solves.

## Development Setup

```bash
git clone https://github.com/creativeAlgebra/isomorphic-multi-agent-workflow.git
cd isomorphic-multi-agent-workflow
python -m venv venv
source venv/bin/activate
pip install -e .
```
