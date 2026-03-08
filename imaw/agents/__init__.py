import os
from pydantic import BaseModel, Field

# Ensure the client is accessible
from google import genai
from google.genai import types

_client = None
MODEL_NAME = 'gemini-2.5-pro'

def configure(api_key: str = None, model: str = None):
    """Configures the global API client and model choice for the IMAW system."""
    global _client, MODEL_NAME
    if api_key is None:
        api_key = os.environ.get("GOOGLE_GENAI_API_KEY")
    if not api_key:
        raise ValueError("API Key not found. Please specify it using imaw.configure(api_key='...') or set GOOGLE_GENAI_API_KEY in the environment.")
    
    _client = genai.Client(api_key=api_key)
    
    if model:
        MODEL_NAME = model

def get_client() -> genai.Client:
    """Returns the globally configured Google GenAI client."""
    global _client
    if _client is None:
        configure() # Attempt to load from env automatically
    return _client

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
