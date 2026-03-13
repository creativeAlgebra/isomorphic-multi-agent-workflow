import json
from . import get_client, MODEL_NAME

def get_chat_response(user_question: str, source_concept: str, target_metaphor: str, mapping_json: str) -> dict:
    """
    Executes the double-translation loop to maintain the isomorphic illusion.
    Returns a dict with all three stages of the translation for logging purposes,
    plus an 'out_of_schema' flag indicating if the question went beyond the
    current mapping dictionary.
    """
    client = get_client()

    # Step 1: Reverse Translation (Metaphor -> Abstract Logic)
    reverse_prompt = (
        f"You are an Isomorphic Reverse-Translator.\n\n"
        f"Here is the established mapping dictionary between Abstract Schema -> Target Metaphor:\n"
        f"```json\n{mapping_json}\n```\n\n"
        f"The user is immersed in the target metaphor ('{target_metaphor}') and just asked this question:\n"
        f"USER: \"{user_question}\"\n\n"
        f"Task: Translate this question backwards into the Abstract Schema terminology used in the mapping dictionary. "
        f"Strip out all metaphorical flavor and return only the raw, abstract operational question."
    )
    
    reverse_res = client.models.generate_content(model=MODEL_NAME, contents=reverse_prompt)
    abstract_question = reverse_res.text.strip()
    
    # Step 2: Technical Oracle (Abstract Logic -> Technical Truth)
    # The Oracle also determines if the question goes beyond the original source.
    oracle_prompt = (
        f"You are a Technical Factual Oracle.\n\n"
        f"Here is the absolute factual truth regarding the original source concept:\n"
        f"```text\n{source_concept}\n```\n\n"
        f"Based ONLY on the mechanics defined in the source concept above, answer the following abstract question accurately:\n"
        f"ABSTRACT QUESTION: \"{abstract_question}\"\n\n"
        f"Task: Provide the pure technical answer. If the answer is not explicitly detailed in the source concept, "
        f"extrapolate a highly logical, mechanically sound answer based on standard industry/factual truths related to the domain."
    )
    
    oracle_res = client.models.generate_content(model=MODEL_NAME, contents=oracle_prompt)
    technical_answer = oracle_res.text.strip()
    
    # Step 3: Forward Translation (Technical Truth -> Metaphor)
    forward_prompt = (
        f"You are an Isomorphic Forward-Translator and Tutor.\n\n"
        f"Here is the established mapping dictionary (Abstract Schema -> Target Metaphor):\n"
        f"```json\n{mapping_json}\n```\n\n"
        f"The user is operating under this Target Metaphor: {target_metaphor}\n"
        f"Their original question was: \"{user_question}\"\n\n"
        f"Here is the absolute technical truth regarding their question:\n"
        f"```text\n{technical_answer}\n```\n\n"
        f"Task: Translate the technical truth into a response that directly answers the user's question, "
        f"but strictly conforms to the Target Metaphor. Use the mapping dictionary to ensure structural fidelity. "
        f"NEVER break character. NEVER reference real-world technology, architecture, businesses, etc. "
        f"Speak as an immersive tutor within the metaphor."
    )
    
    forward_res = client.models.generate_content(model=MODEL_NAME, contents=forward_prompt)
    tutor_reply = forward_res.text.strip()
    
    return {
        "abstract_question": abstract_question,
        "technical_answer": technical_answer,
        "tutor_reply": tutor_reply,
    }


def detect_out_of_schema(technical_answer: str, abstract_schema: str, source_concept: str) -> dict:
    """
    Analyzes the Oracle's technical answer to determine if it references
    entities or concepts NOT present in the current abstract schema.
    
    Returns:
        dict with keys:
            - out_of_schema: bool
            - new_source_material: str (the new sub-concept text to decompose, or empty)
            - explanation: str
    """
    client = get_client()

    prompt = (
        f"You are a Schema Coverage Auditor.\n\n"
        f"Here is the current abstract schema that was extracted from the original source:\n"
        f"```json\n{abstract_schema}\n```\n\n"
        f"Here is the original source concept:\n"
        f"```text\n{source_concept}\n```\n\n"
        f"The Technical Oracle just produced this answer to a follow-up question:\n"
        f"```text\n{technical_answer}\n```\n\n"
        f"Task: Determine if the Oracle's answer introduces NEW entities, relationships, or concepts "
        f"that are NOT already represented in the current abstract schema.\n\n"
        f"If the answer only elaborates on existing schema entities, respond with out_of_schema: false.\n"
        f"If the answer introduces genuinely new entities or sub-systems not in the schema, respond with "
        f"out_of_schema: true and extract the new sub-concept material as concise, factual source text.\n\n"
        f"Return ONLY valid JSON:\n"
        f'{{\n'
        f'    "out_of_schema": true or false,\n'
        f'    "new_source_material": "The new factual content to decompose (empty string if not out_of_schema)",\n'
        f'    "explanation": "Why this is or is not out of schema"\n'
        f'}}'
    )

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config={"response_mime_type": "application/json"}
    )

    try:
        return json.loads(response.text)
    except Exception as e:
        return {
            "out_of_schema": False,
            "new_source_material": "",
            "explanation": f"Schema detection parse error: {e}",
        }


def expand_schema(new_source_material: str, existing_abstract_schema: str,
                   existing_mapping_json: str, target_metaphor: str) -> dict:
    """
    Runs a scoped mini-pipeline to expand the mapping dictionary with
    new entities derived from out-of-schema material.

    Uses Contextual Blindness: 
      1. Decompose ONLY the new sub-concept (blind to metaphor)
      2. Map the new abstract entities into the existing metaphor (blind to source)
      3. Merge new mappings into the existing dictionary

    Returns:
        dict with keys:
            - expanded_schema: str (the original + new abstract entities as JSON)
            - expanded_mapping: str (the original + new mapping entries as JSON)
            - new_entities_added: list[str] (names of newly mapped entities)
    """
    from .decomposition import decompose
    from .mapping import map_isomorphism

    # Step 1: Decompose only the new sub-concept (blind to metaphor)
    new_abstract_json = decompose(new_source_material)

    # Step 2: Map the new abstract entities into the target metaphor,
    # providing the existing mapping as context so new entries follow
    # the same stylistic conventions.
    client = get_client()

    expansion_prompt = (
        f"You are the Mapping Expansion Agent in an Isomorphic Multi-Agent Workflow.\n\n"
        f"Here is the EXISTING mapping dictionary that is already in use:\n"
        f"```json\n{existing_mapping_json}\n```\n\n"
        f"Here are NEW abstract entities that need to be added to the mapping:\n"
        f"```json\n{new_abstract_json}\n```\n\n"
        f"Target Metaphor: {target_metaphor}\n\n"
        f"Task: Create mapping entries for ONLY the new entities. Follow the exact stylistic "
        f"conventions of the existing mapping — same naming patterns, same tone, same metaphor domain. "
        f"Do NOT duplicate any entities already in the existing mapping.\n\n"
        f"Return ONLY a valid JSON object with these keys:\n"
        f'{{\n'
        f'    "new_entity_mappings": [\n'
        f'        {{"abstract_entity": "...", "metaphorical_entity": "..."}}\n'
        f'    ],\n'
        f'    "new_translated_rules": ["rule 1 in metaphor terms", "rule 2..."]\n'
        f'}}'
    )

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=expansion_prompt,
        config={"response_mime_type": "application/json"}
    )

    try:
        new_mappings = json.loads(response.text)
    except Exception:
        # Fallback: return originals unchanged
        return {
            "expanded_schema": existing_abstract_schema,
            "expanded_mapping": existing_mapping_json,
            "new_entities_added": [],
        }

    # Step 3: Merge new mappings into existing
    try:
        existing_mapping = json.loads(existing_mapping_json)
    except Exception:
        existing_mapping = {"entity_mappings": [], "translated_rules": []}

    try:
        existing_schema = json.loads(existing_abstract_schema)
    except Exception:
        existing_schema = {"entities": [], "relationships": [], "rules": []}

    try:
        new_schema = json.loads(new_abstract_json)
    except Exception:
        new_schema = {"entities": [], "relationships": [], "rules": []}

    # Merge entities
    existing_entity_names = {e.get("abstract_entity", e) if isinstance(e, dict) else e 
                            for e in existing_mapping.get("entity_mappings", [])}
    
    new_entities_added = []
    for entry in new_mappings.get("new_entity_mappings", []):
        if entry.get("abstract_entity") not in existing_entity_names:
            existing_mapping.setdefault("entity_mappings", []).append(entry)
            new_entities_added.append(
                f"{entry['abstract_entity']} → {entry['metaphorical_entity']}"
            )

    # Merge rules
    for rule in new_mappings.get("new_translated_rules", []):
        existing_mapping.setdefault("translated_rules", []).append(rule)

    # Merge schema entities
    existing_schema_entities = set(existing_schema.get("entities", []))
    for entity in new_schema.get("entities", []):
        if entity not in existing_schema_entities:
            existing_schema.setdefault("entities", []).append(entity)

    for rule in new_schema.get("rules", []):
        existing_schema.setdefault("rules", []).append(rule)

    return {
        "expanded_schema": json.dumps(existing_schema, indent=2),
        "expanded_mapping": json.dumps(existing_mapping, indent=2),
        "new_entities_added": new_entities_added,
    }
