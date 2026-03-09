import os
from pydantic import BaseModel, Field

# Ensure the client is accessible
from google import genai
from google.genai import types

def get_client() -> genai.Client:
    api_key = os.environ.get("GOOGLE_GENAI_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_GENAI_API_KEY is not set in the environment.")
    return genai.Client(api_key=api_key)

MODEL_NAME = 'gemini-2.5-pro'

# Standard config for structured output agents
def get_structured_config(schema: type[BaseModel]) -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema,
        temperature=0.1 # Low temp for strict structural adherence
    )

# Standard config for the final compiler agent
def get_compiler_config() -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        temperature=0.7 # Higher temp for creative synthesis
    )
