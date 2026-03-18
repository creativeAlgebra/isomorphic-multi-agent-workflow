"""
Agent 1.5: The Decomposition Validation Gate (v1.2)

Inspects the Decomposition Agent's output schema for leaked source-domain
vocabulary. If any entity label, relationship description, or rule contains
verbatim technical jargon from the source logic, the decomposition is
rejected and re-run with a stricter prompt.

v1.1: Used general LLM judgment to detect "jargon."
v1.2: Accepts an explicit domain vocabulary blocklist from Agent 0.
      Checks schema text against the blocklist first (fast string match),
      then sends any hits + the full schema to the LLM judge for
      confirmation and remediation.
"""

import json
from . import get_client, MODEL_NAME


def _fast_blocklist_check(schema_text: str, domain_vocabulary: list[str]) -> list[str]:
    """
    Fast string-match: checks if any domain vocabulary term appears in the schema text.
    Case-insensitive. Returns list of matched terms.
    """
    schema_lower = schema_text.lower()
    hits = []
    for term in domain_vocabulary:
        if term.lower() in schema_lower:
            hits.append(term)
    return hits


def validate_decomposition(source_logic: str, abstract_schema_json: str,
                           domain_vocabulary: list[str] = None,
                           max_retries: int = 2) -> str:
    """
    Validates that a decomposed schema contains no source-domain jargon.

    v1.2: If domain_vocabulary is provided (from Agent 0), uses fast blocklist
    matching first, then LLM-judge confirmation. If not provided, falls back
    to pure LLM judgment (v1.1 behavior).

    Args:
        source_logic: The original technical concept (for reference).
        abstract_schema_json: The JSON output from Agent 1 (Decompose).
        domain_vocabulary: Optional list of domain-specific terms from Agent 0.
        max_retries: Number of times to re-run decomposition on failure.

    Returns:
        The validated (or remediated) abstract schema JSON string.
    """
    client = get_client()

    # ── v1.2: Fast blocklist check (if Agent 0 provided vocabulary) ──
    blocklist_hits = []
    if domain_vocabulary:
        blocklist_hits = _fast_blocklist_check(abstract_schema_json, domain_vocabulary)
        if not blocklist_hits:
            # No hits on the blocklist — schema is likely clean
            # Still run LLM judge as a safety net, but with lower urgency
            pass

    # ── LLM-Judge validation ──
    vocab_context = ""
    if domain_vocabulary:
        vocab_context = f"""
DOMAIN VOCABULARY BLOCKLIST (from Agent 0):
{json.dumps(domain_vocabulary)}

FAST-CHECK HITS (terms found in schema):
{json.dumps(blocklist_hits) if blocklist_hits else "None — but verify manually."}
"""

    validation_prompt = f"""You are a strict validation gate in a multi-agent pipeline.

Your task: check whether the following abstract schema contains ANY leaked source-domain vocabulary from the original concept.

ORIGINAL SOURCE CONCEPT:
{source_logic}

ABSTRACT SCHEMA (from Decomposition Agent):
{abstract_schema_json}
{vocab_context}
RULES:
1. Every entity label MUST be generic and domain-agnostic (e.g., "Entity Alpha", "System Node", "Resource B").
2. Entity labels like "API Gateway", "kube-scheduler", "azeotrope", "Cooper pairs", "prior art" are FAILURES — these are source-domain technical terms that should have been abstracted away.
3. Relationship descriptions and rules must use generic language, not source-specific jargon.
4. Words like "entity", "node", "resource", "system", "process", "agent" are ACCEPTABLE — they are generic.
5. Compound technical terms from the source domain are the primary failure mode.
6. If a DOMAIN VOCABULARY BLOCKLIST was provided, any term from that list appearing in the schema is an automatic failure.

Return ONLY valid JSON:
{{
    "is_clean": true or false,
    "leaked_terms": ["list", "of", "leaked", "terms"],
    "explanation": "Brief explanation."
}}"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=validation_prompt,
        config={"response_mime_type": "application/json"}
    )

    try:
        result = json.loads(response.text)
    except (json.JSONDecodeError, AttributeError):
        # If we can't parse the validation result, pass through
        return abstract_schema_json

    if result.get("is_clean", True):
        return abstract_schema_json

    # ── Schema failed validation — remediate ──
    leaked = result.get("leaked_terms", [])
    print(f"  ⚠ Validation gate caught leaked terms: {leaked}")
    print(f"    Remediating schema (stripping jargon)...")

    vocab_hint = ""
    if domain_vocabulary:
        vocab_hint = f"""
DOMAIN VOCABULARY BLOCKLIST (ensure NONE of these appear in the output):
{json.dumps(domain_vocabulary)}
"""

    remediation_prompt = f"""You are the Decomposition Remediation Agent.

The following abstract schema was rejected because it contains source-domain vocabulary
that should have been abstracted away.

REJECTED SCHEMA:
{abstract_schema_json}

LEAKED TERMS FOUND:
{json.dumps(leaked)}
{vocab_hint}
YOUR TASK:
1. Replace every leaked term with a generic, domain-agnostic label.
2. "API Gateway" → "Interface Node" or "Entry Point Alpha"
3. "kube-scheduler" → "Assignment Controller" or "Allocation Agent"
4. "verdict" → "Final Decision" or "Outcome Declaration"
5. Preserve ALL structural relationships and rules — only change the labels.
6. Double-check that NO term from the blocklist remains in the output.
7. Return the corrected schema in the EXACT same JSON format.

Return ONLY the corrected JSON schema, nothing else."""

    remediation_response = client.models.generate_content(
        model=MODEL_NAME,
        contents=remediation_prompt,
        config={"response_mime_type": "application/json"}
    )

    remediated_schema = remediation_response.text
    print(f"    ✓ Schema remediated successfully.")
    return remediated_schema

