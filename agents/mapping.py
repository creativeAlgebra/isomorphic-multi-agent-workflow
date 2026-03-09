import json
from pydantic import BaseModel, Field
from typing import Dict, List

from . import get_client, MODEL_NAME, get_structured_config

class EntityMapping(BaseModel):
    abstract_entity: str = Field(description="The generic entity name from the Decomposition phase")
    metaphorical_entity: str = Field(description="The equivalent entity mapped perfectly into the new target metaphor")

class MappedSchema(BaseModel):
    entity_mappings: List[EntityMapping] = Field(description="The translated vocabulary for the entities")
    translated_rules: List[str] = Field(description="The abstract rules rewritten using the new metaphorical vocabulary, proving the logic still holds")

def map_isomorphism(abstract_schema_json: str, target_metaphor: str) -> str:
    """
    Agent 2: The Mapping Agent.
    Takes the abstract relational logic and projects it perfectly onto a new target metaphor.
    """
    client = get_client()
    config = get_structured_config(MappedSchema)
    
    system_instruction = (
        "You are the Mapping Agent in an Isomorphic Multi-Agent Workflow. "
        "You will receive an abstract logical schema (Entities, Relationships, Rules) and a Target Metaphor. "
        "Your task is to instantiate the abstract structure within the new metaphorical vocabulary. "
        "CRITICALLY: You must maintain perfect structural ISOMORPHISM. The new metaphor must perfectly obey the abstract rules "
        "without logical contradictions. Be highly creative in your mapping, but unimaginative in your logic."
    )
    
    prompt = (
        f"Abstract Schema:\n{abstract_schema_json}\n\n"
        f"Target Metaphor Context: {target_metaphor}\n\n"
        "Generate the strict mapping dictionary and prove the rules hold."
    )
    
    config.system_instruction = system_instruction
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=config
    )
    
    return response.text
