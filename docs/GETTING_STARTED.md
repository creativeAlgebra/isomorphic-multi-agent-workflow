# Getting Started with IMAW

The Isomorphic Multi-Agent Workflow (IMAW) is an orchestration layer for generating high-fidelity structural metaphors without contextual leakage.

## Prerequisites

- Python 3.10+
- A Google Gemini API Key (`GEMINI_API_KEY`)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/creativeAlgebra/isomorphic-multi-agent-workflow.git
   cd isomorphic-multi-agent-workflow
   ```

2. **Set up the environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r imaw_prototype/requirements.txt
   ```

3. **Configure the API Key:**
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```

## Running the Empirical Proof

The easiest way to see IMAW's generative control architecture in action is to run the empirical test suite:

```bash
cd imaw_prototype
python generate_evidence.py
```

This script will run a high-stakes enterprise scenario (e.g., Kubernetes Cluster Architecture) through both a standard monolithic LLM and the IMAW 3-agent pipeline. It will output both JSON data and Markdown transcripts demonstrating IMAW's semantic firewall against Contextual Leakage.

## Using IMAW in Your Own Projects

To implement the IMAW `IMAWOrchestrator` in your codebase:

```python
from imaw_prototype.imaw.orchestrator import IMAWOrchestrator

# 1. Define your original technical concept
source_concept = """
Your complex technical documentation or problem statement here.
"""

# 2. Define the target metaphor
target_metaphor = """
A completely unrelated, engaging narrative constraint (e.g., A Roman Legion).
"""

# 3. Generate the rigidly controlled translation
results = IMAWOrchestrator.generate_lesson(source_concept, target_metaphor)

# 4. View the strictly isolated semantic output
print(results["lesson"])
```
