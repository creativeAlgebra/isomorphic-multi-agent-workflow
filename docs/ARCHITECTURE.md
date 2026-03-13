# IMAW Architecture: Contextual Blindness

The core innovation of the Isomorphic Multi-Agent Workflow (IMAW) is **Contextual Blindness** — physically isolating agents so that no single agent handles both the source concept and the metaphorical output simultaneously.

A standard monolithic LLM processes both domains in the same attention context, causing source-domain jargon to contaminate the metaphorical narrative — a failure mode called **Semantic Leakage**. IMAW eliminates the mechanism that causes this by restricting what each agent can see.

> Full theoretical framework and empirical validation: [controlarc.com](https://controlarc.com)

## The 4-Agent Pipeline

```
Source Concept
      │
      ▼
┌─────────────────────┐
│  Agent 1: Decompose │  Strips all domain jargon → pure abstract schema
│  (Blind to target)  │  Output: entities, relationships, rules (JSON)
└────────┬────────────┘
         │
         ▼
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
  Validation Gate       LLM-Judge checks schema for leaked source jargon
  (v1.1)                Remediates if found before passing downstream
└ ─ ─ ─ ─ ┬ ─ ─ ─ ─ ─┘
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
│  (Blind to source   │  Uses only the mapped vocabulary
│   AND schema)       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Agent 4: Decode Key│  Generates a "Rosetta Stone" — side-by-side
│  (Full context)     │  mapping of metaphor ↔ reality
└─────────────────────┘
```

### Agent 1: The Decomposition Agent

Extracts pure structural logic from the source domain.
- **Input:** Source Concept.
- **Constraint:** Blind to the target metaphor. It does not know what the abstraction will be mapped onto.
- **Output:** A domain-agnostic JSON schema defining entities, relationships, and rules.

```json
{
  "entities": ["Assignment Unit", "Execution Node", "Task Package"],
  "relationships": ["Assignment Unit dispatches Task Packages to Execution Nodes"],
  "rules": ["A Task Package must be assigned to exactly one Execution Node."]
}
```

### Validation Gate (v1.1)

An LLM-Judge sits between Agent 1 and Agent 2. It checks the decomposed schema for any remaining source-domain vocabulary. If leaked terms are found (e.g., "kube-scheduler" instead of "Assignment Unit"), the schema is remediated before being passed downstream. This targeted fix is only possible because the pipeline architecture makes the upstream failure localized and diagnosable.

### Agent 2: The Mapping Agent

Builds a strict 1:1 translation dictionary.
- **Input:** Abstract JSON schema + Target Metaphor.
- **Constraint:** Blind to the original source concept. It cannot introduce source-domain vocabulary because it has never seen it.
- **Output:** An isomorphic mapping dictionary.

```json
{
  "entity_mappings": [
    { "abstract_entity": "Assignment Unit", "metaphorical_entity": "Head Butler" },
    { "abstract_entity": "Execution Node", "metaphorical_entity": "Hotel Wing" },
    { "abstract_entity": "Task Package", "metaphorical_entity": "Guest Reservation" }
  ]
}
```

### Agent 3: The Synthesis Agent

Generates the final pedagogical artifact entirely within the metaphor's vocabulary.
- **Input:** Mapping dictionary + Target Metaphor.
- **Constraint:** Blind to the original source concept and the raw abstract schema.
- **Output:** A complete lesson, narrative, or interactive scenario expressed entirely in the metaphor's language.

### Agent 4: The Decode Key Agent

Has full context — source, metaphor, mapping, and synthesized lesson. Generates a **Rosetta Stone**: a reference artifact bridging the metaphor back to reality.
- **Output:** Quick reference table, annotated summary, and key structural takeaways.

The Decode Key is the only artifact in the pipeline that intentionally contains source-domain vocabulary. It serves as the exit ramp for the learner.

## The Double-Translation Loop

Beyond one-shot lesson generation, IMAW supports sustained multi-turn conversation within the metaphor:

1. **Reverse-translate** — The user's question is mapped backwards through the translation dictionary into abstract schema terms.
2. **Technical Oracle** — An agent with access to the source concept answers the abstract question with factual accuracy.
3. **Forward-translate** — The technical answer is rendered back into the metaphor using the same mapping dictionary.

The mapping dictionary stays **frozen** throughout the conversation, guaranteeing structural consistency across an arbitrary number of turns.

## Adaptive Schema Expansion

When a user asks about material beyond the original source, the system detects the out-of-schema question and triggers a **scoped mini-pipeline**:

1. A Schema Coverage Auditor identifies new entities not in the current schema.
2. A scoped Decomposition step extracts only the new sub-concept (blind to metaphor).
3. A Mapping Expansion Agent extends the existing dictionary following established conventions (blind to source).
4. The forward-translator responds using the expanded dictionary.

The expanded mapping persists for the remainder of the session. Contextual Blindness is preserved even for dynamically introduced material. Enabled by default via `auto_expand=True`.

## Key Implementation Files

| File | Purpose |
|------|---------|
| `agents/decomposition.py` | Agent 1 — structural extraction |
| `agents/mapping.py` | Agent 2 — isomorphic translation |
| `agents/compiler.py` | Agent 3 — narrative synthesis |
| `agents/decode_key.py` | Agent 4 — Rosetta Stone generation |
| `agents/tutor.py` | Double-Translation Loop + Adaptive Schema Expansion |
| `imaw/orchestrator.py` | Pipeline orchestration with v1.1 validation gate |
| `imaw/session.py` | TutorSession — mutable mapping, auto-expand, logging |
| `imaw/agents/validation.py` | Decomposition validation gate (v1.1) |
