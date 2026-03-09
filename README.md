# Isomorphic Multi-Agent Workflow (IMAW)

**Enterprise-grade framework for preventing structural corruption in AI-generated explanations.**

[![Website](https://img.shields.io/badge/Website-imaw.creativealgebra.com-black)](https://creativealgebra.com)
[![Status](https://img.shields.io/badge/Status-Experimental-yellow)](#)

When AI maps complex knowledge onto metaphors, technical facts and creative narratives contaminate each other. IMAW is the architectural solution to this **Contextual Leakage**. By enforcing strict isolation through a 3-agent pipeline, IMAW guarantees mathematically rigid semantic firewalls, ensuring identical logic across discrete domains without hallucinating or leaking jargon.

## The Problem: The Monolith Trap

Monolithic LLMs process structure and language in the same pass. When asked to translate a complex concept (e.g., Kubernetes architecture) into an analogous domain (e.g., Hotel Management), the original technical jargon inevitably "leaks" into the generated output. The result is a broken analogy—a "Hotel Desk (`kube-apiserver`)"—which breaks immersion and fails as a standalone pedagogical tool.

## The Solution: Generative Control Architecture

IMAW enforces strict **Contextual Blindness**. The workflow is physically separated into three fiercely isolated agents:

1.  **Decomposition (Agent 1):** Extracts pure structural logic (Entities, Relationships, Rules) into an abstract JSON schema. *Blind to the target metaphor.*
2.  **Mapping (Agent 2):** Builds a 1:1 mathematical dictionary translating abstract entities to the new metaphor domain. *Blind to the original source text.*
3.  **Synthesis (Agent 3):** Assembles the final narrative using ONLY the target metaphor and the mapped logic rules. *Zero chance of leakage.*

## Documentation

- [Getting Started](docs/GETTING_STARTED.md): Quickstart guide and API setup.
- [Architecture Details](docs/ARCHITECTURE.md): Deep dive into the 3-Agent methodology.
- [Full Research Paper](paper.md): Read the complete theoretical framework and empirical proof.

## Performance: The Empirical Proof

In rigorous testing across multiple domains (Organizational Change, Global Supply Chain, Material Science), the monolithic LLMs (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro) completely failed to prevent Contextual Leakage. 

The IMAW pipeline achieved absolute isolation, consistently scoring **100/100** for both Structural Fidelity and Contextual De-duplication.

*See `imaw_prototype/generate_evidence.py` to run the empirical test suite yourself.*