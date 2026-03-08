import json
from pydantic import BaseModel, Field
from typing import List, Dict

from . import get_client, MODEL_NAME, get_structured_config

class Relationship(BaseModel):
    source_entity: str = Field(description="The abstract name of the entity initiating the relationship")
    target_entity: str = Field(description="The abstract name of the entity receiving the relationship")
    interaction: str = Field(description="The formal definition of how they interact (e.g., 'transfers resource to', 'blocks access for')")

class AbstractSchema(BaseModel):
    entities: List[str] = Field(description="A list of generic, domain-agnostic names for the primary actors/objects (e.g., 'Entity A', 'Node 1', 'Resource X')")
    relationships: List[Relationship] = Field(description="The formal interactions between the entities")
    rules: List[str] = Field(description="The underlying constraints and inviolable rules that govern the system (e.g., 'Entity A cannot act until Node 1 grants permission')")

def decompose(source_concept: str) -> str:
    """
    Agent 1: The Decomposition Agent.
    Strips away all domain-specific nouns/jargon and extracts pure relational logic.
    """
    client = get_client()
    config = get_structured_config(AbstractSchema)
    
    system_instruction = (
        "You are the Decomposition Agent in an Isomorphic Multi-Agent Workflow. "
        "Your sole task is to ingest a complex source concept and strip away EVERY trace of its specific domain context, "
        "vocabulary, and jargon. You must reduce the concept entirely to pure abstract structural logic. "
        "Identify the core entities using generic labels (e.g., 'Entity Alpha', 'System Node', 'Resource B'), "
        "define how they interact, and list the inviolable rules governing their behavior."
    )
    
    prompt = f"Decompose the following source concept:\n\n{source_concept}"
    
    config.system_instruction = system_instruction
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=config
    )
    
    return response.text
