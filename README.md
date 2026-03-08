# IMAW: Isomorphic Multi-Agent Workflows

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Python Version](https://img.shields.io/badge/python-3.10+-blue.svg)

**IMAW** is a cognitive Python framework designed to solve the "Expression-Structure Feedback Loop" (LLM Hallucination) during complex concept translation.

When standard Large Language Models (LLMs) are asked to explain dense technical, organizational, or logical concepts using creative metaphors, they inevitably suffer from cognitive overload—breaking the metaphor to insert technical jargon, or mutating the technical rules to fit the narrative.

IMAW solves this by enforcing **Contextual Blindness** across a rigid, three-agent assembly line.

---

## 🧠 The 3-Agent Architecture

The library physically separates logic extraction, analogical mapping, and pedagogical synthesis to guarantee 100% structural fidelity.

1.  **Agent 1: Decomposition (The Abstractor)**
    *   Ingests complex technical source text.
    *   Strips away all domain-specific vocabulary and context.
    *   *Output:* Pure mathematical/relational rules (JSON).
2.  **Agent 2: Mapping (The Translator)**
    *   Ingests the sterile logic from Agent 1.
    *   Maps the logic 1:1 onto a new Target Metaphor.
    *   *Constraint:* Operates completely blind to the original source text.
3.  **Agent 3: Synthesis (The Storyteller)**
    *   Synthesizes the final educational narrative.
    *   *Constraint:* Strictly bound by the mathematically verified mapping generated in Step 2.

## 📦 Installation

*(Pending PyPI Publication)*

For now, you can install the library locally for development:

```bash
git clone https://github.com/your-org/imaw.git
cd imaw
pip install -e .
```

Ensure you have your Google GenAI API key configured:
```bash
export GOOGLE_GENAI_API_KEY="your_api_key_here"
```

## 🚀 Quickstart

IMAW supports both static generation (Phase 1) and stateful conversational tutors (Phase 2).

### 1. Generate a Static Lesson

```python
import imaw

# A complex source concept
source = """
The TCP/IP Three-Way Handshake establishes a reliable connection.
Step 1: Client sends SYN.
Step 2: Server receives SYN, replies with SYN-ACK.
Step 3: Client receives SYN-ACK, replies with ACK. Connection established.
"""

# A wildly different target metaphor
metaphor = "Formal 18th-century ballroom diplomacy."

# Run the 3-Agent Pipeline
print("Processing Decomposition, Mapping, and Synthesis...")
results = imaw.IMAWOrchestrator.generate_lesson(source_concept=source, target_metaphor=metaphor)

print(results["lesson"])
```

### 2. The Isomorphic Conversational Tutor

Maintain the isomorphic illusion in a live chat by utilizing the Double-Translation Loop.

```python
import imaw

# Assuming 'results' dictionary from the static generation above...
session = imaw.TutorSession(
    source_concept=results["source"], 
    target_metaphor=results["metaphor"],
    abstract_schema=results["abstract_schema"], 
    mapping=results["mapping"]
)

# Ask a question strictly within the metaphor
tutor_reply = session.add_user_message("What happens if the second courier drops his parchment in a puddle?")
print(tutor_reply)
```

## 🔬 Core Validation

IMAW has been empirically validated to maintain structural fidelity across diverse domains where monolithic zero-shot LLMs catastrophically fail:
*   **Organizational Strategy:** Kotter's 8-Step Change Management
*   **Computational Logistics:** Predictive Supply Chain AI
*   **Physical Sciences:** Atmospheric Architecture and Thermal Dynamics

## 🤝 Contributing

We welcome contributions from the community. Please see `CONTRIBUTING.md` for guidelines on how to submit pull requests, report bugs, and suggest new features.

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
