"""
Agent 0: Domain Vocabulary Extractor (v1.2)

Extracts an explicit list of domain-specific terms from the source logic
BEFORE decomposition begins. This list is passed to the Validation Gate
as a precise blocklist, replacing the gate's previous reliance on general
LLM judgment about what constitutes "jargon."

Design rationale:
  - The v1.1 Validation Gate missed terms like "verdict" and "testimony"
    because it was guessing whether words were domain-specific jargon.
  - Agent 0 reads the source logic and produces an explicit inventory
    of every term that belongs specifically to that domain.
  - The gate can then check the abstract schema against THIS LIST rather
    than asking "does this look like jargon?"

Contextual Blindness: Agent 0 only sees the source logic (same as Agent 1).
This does NOT violate information isolation — downstream agents (2, 3) still
never see the source material.
"""

import json
from . import get_client, MODEL_NAME


def extract_vocabulary(source_logic: str) -> list[str]:
    """
    Agent 0: Extracts all domain-specific terms from a source logic.

    Returns a list of strings — every word or phrase that is specific to
    the source domain and should NOT appear in a domain-agnostic abstract schema.

    Args:
        source_logic: The original technical/complex concept text.

    Returns:
        List of domain-specific terms (e.g., ["kube-scheduler", "Pod", "etcd"]).
    """
    client = get_client()

    prompt = f"""You are a domain vocabulary extraction specialist.

TASK: Read the following source logic and extract EVERY term, phrase, or proper noun 
that is specific to this domain. These are words that would not appear in a generic, 
domain-agnostic description of the same underlying logic.

SOURCE CONCEPT:
{source_logic}

RULES:
1. Include all technical jargon, acronyms, and domain-specific terms.
2. Include proper nouns and branded terms.
3. Include compound phrases that carry domain-specific meaning 
   (e.g., "voir dire", "case-in-chief", "kube-scheduler", "Cooper pairs").
4. Include terms that COULD be generic English but carry specific technical meaning 
   in this domain (e.g., "verdict" in law, "catalyst" in chemistry, "pod" in Kubernetes).
5. Do NOT include truly generic words like "system", "process", "component", "unit".
6. Be exhaustive — it is better to over-include than under-include.

Return ONLY valid JSON:
{{
    "domain": "brief domain label (e.g., 'law', 'chemistry', 'infrastructure')",
    "terms": ["list", "of", "every", "domain-specific", "term"]
}}"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config={"response_mime_type": "application/json"}
    )

    try:
        result = json.loads(response.text)
        terms = result.get("terms", [])
        domain = result.get("domain", "unknown")
        print(f"  🔍 Agent 0 extracted {len(terms)} domain terms ({domain})")
        return terms
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"  ⚠ Agent 0 vocabulary extraction failed: {e}")
        return []
