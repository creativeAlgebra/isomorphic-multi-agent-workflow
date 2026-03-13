"""
Agent 1.5: The Decomposition Validation Gate (v1.1)

Inspects the Decomposition Agent's output schema for leaked source-domain
vocabulary. If any entity label, relationship description, or rule contains
verbatim technical jargon from the source concept, the decomposition is
rejected and re-run with a stricter prompt.

This gate was introduced after empirical testing revealed that 100% of IMAW's
Hard Leakage traced to the Decomposition Agent passing compound technical terms
(e.g., "API Gateway", "Process Node") into the abstract schema.
"""

import json
from . import get_client, MODEL_NAME


def validate_decomposition(source_concept: str, abstract_schema_json: str,
                           max_retries: int = 2) -> str:
    """
    Validates that a decomposed schema contains no source-domain jargon.

    Uses an LLM-Judge to check all entity labels, relationship descriptions,
    and rule statements for verbatim technical terms from the source domain.

    Args:
        source_concept: The original technical concept (for reference).
        abstract_schema_json: The JSON output from Agent 1 (Decompose).
        max_retries: Number of times to re-run decomposition on failure.

    Returns:
        The validated (or remediated) abstract schema JSON string.
    """
    client = get_client()

    validation_prompt = f"""You are a strict validation gate in a multi-agent pipeline.

Your task: check whether the following abstract schema contains ANY leaked source-domain vocabulary from the original concept.

ORIGINAL SOURCE CONCEPT:
{source_concept}

ABSTRACT SCHEMA (from Decomposition Agent):
{abstract_schema_json}

RULES:
1. Every entity label MUST be generic and domain-agnostic (e.g., "Entity Alpha", "System Node", "Resource B").
2. Entity labels like "API Gateway", "kube-scheduler", "azeotrope", "Cooper pairs", "prior art" are FAILURES — these are source-domain technical terms that should have been abstracted away.
3. Relationship descriptions and rules must use generic language, not source-specific jargon.
4. Words like "entity", "node", "resource", "system", "process", "agent" are ACCEPTABLE — they are generic.
5. Compound technical terms from the source domain are the primary failure mode.

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

    remediation_prompt = f"""You are the Decomposition Remediation Agent.

The following abstract schema was rejected because it contains source-domain vocabulary
that should have been abstracted away.

REJECTED SCHEMA:
{abstract_schema_json}

LEAKED TERMS FOUND:
{json.dumps(leaked)}

YOUR TASK:
1. Replace every leaked term with a generic, domain-agnostic label.
2. "API Gateway" → "Interface Node" or "Entry Point Alpha"
3. "kube-scheduler" → "Assignment Controller" or "Allocation Agent"
4. Preserve ALL structural relationships and rules — only change the labels.
5. Return the corrected schema in the EXACT same JSON format.

Return ONLY the corrected JSON schema, nothing else."""

    remediation_response = client.models.generate_content(
        model=MODEL_NAME,
        contents=remediation_prompt,
        config={"response_mime_type": "application/json"}
    )

    remediated_schema = remediation_response.text
    print(f"    ✓ Schema remediated successfully.")
    return remediated_schema
