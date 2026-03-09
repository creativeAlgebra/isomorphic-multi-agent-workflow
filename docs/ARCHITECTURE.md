# IMAW Architecture: The Semantic Firewall

The core innovation of the Isomorphic Multi-Agent Workflow (IMAW) is architectural constraint. 

A standard monolithic LLM handles structure and narrative expression concurrently, causing the domains to fuse and technical jargon to "leak." IMAW prevents this phenomenon—termed **Contextual Leakage**—by strictly isolating the workflow entirely.

## The 3-Agent Pipeline

### Agent 1: The Decomposition Agent
The first agent extracts pure structural logic from the source domain.
- **Input:** Source Concept.
- **Process:** It strips away all domain-specific vocabulary and metaphors.
- **Output:** An abstract JSON schema comprising `entities`, `relationships`, and `rules`.
- *Architecture Note: This agent is intentionally blind to the Target Metaphor.*

```json
// Example Output (Agent 1)
{
  "entities": ["Control Plane", "Execution Node", "Workload Unit"],
  "rules": ["A Workload Unit must be assigned to an Execution Node."]
}
```

### Agent 2: The Mapping Agent
The second agent handles the mathematically rigorous translation.
- **Input:** Abstract JSON schema + Target Metaphor.
- **Process:** It builds a 1:1 conceptual dictionary mapping the abstract logic onto the new metaphor.
- **Output:** An isomorphic mapping dictionary in JSON format.
- *Architecture Note: This agent is intentionally blind to the original Source Concept.*

```json
// Example Output (Agent 2)
{
  "entity_mappings": [
    { "abstract_entity": "Control Plane", "metaphorical_entity": "Hotel Management Office" },
    { "abstract_entity": "Execution Node", "metaphorical_entity": "Hotel Floor" }
  ]
}
```

### Agent 3: The Synthesizing Compiler
The final agent generates the narrative output using the constrained dictionary.
- **Input:** Target Metaphor + Isomorphic Mapping.
- **Process:** Assemble the final narrative strictly adhering to the JSON mapping rules.
- **Output:** Fluid, narrative prose that perfectly obeys the underlying structural logic.
- *Architecture Note: This agent is intentionally blind to the original Source Concept.*

The final output is logically identical to the abstract schema but possesses none of the original vocabulary—a perfect semantic firewall.
