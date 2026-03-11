import os
import json
from pydantic import BaseModel, Field

# ── Provider Registry ────────────────────────────────────────────────────

PROVIDERS = {
    'gemini': {
        'label': 'Google Gemini',
        'env_var': 'GOOGLE_GENAI_API_KEY',
        'default_model': 'gemini-2.5-pro',
    },
    'openai': {
        'label': 'OpenAI',
        'env_var': 'OPENAI_API_KEY',
        'default_model': 'gpt-4o',
        'base_url': None,
    },
    'anthropic': {
        'label': 'Anthropic',
        'env_var': 'ANTHROPIC_API_KEY',
        'default_model': 'claude-sonnet-4-20250514',
    },
    'groq': {
        'label': 'Groq',
        'env_var': 'GROQ_API_KEY',
        'default_model': 'llama-3.3-70b-versatile',
        'base_url': 'https://api.groq.com/openai/v1',
    },
    'mistral': {
        'label': 'Mistral',
        'env_var': 'MISTRAL_API_KEY',
        'default_model': 'mistral-large-latest',
        'base_url': 'https://api.mistral.ai/v1',
    },
    'deepseek': {
        'label': 'DeepSeek',
        'env_var': 'DEEPSEEK_API_KEY',
        'default_model': 'deepseek-chat',
        'base_url': 'https://api.deepseek.com',
    },
}


# ── Unified response wrapper ────────────────────────────────────────────

class _UnifiedResponse:
    """Mimics the Gemini response shape: response.text"""
    def __init__(self, text: str):
        self.text = text


class _UnifiedModels:
    """Mimics client.models.generate_content() interface."""

    def __init__(self, provider: str, api_key: str):
        self._provider = provider
        self._api_key = api_key

    def generate_content(self, *, model: str, contents: str, config=None) -> _UnifiedResponse:
        if self._provider == 'gemini':
            return self._call_gemini(model, contents, config)
        elif self._provider == 'anthropic':
            return self._call_anthropic(model, contents, config)
        else:
            # OpenAI and all OpenAI-compatible (groq, mistral, deepseek)
            return self._call_openai_compat(model, contents, config)

    # ── Gemini (native SDK) ──────────────────────────────────────────
    def _call_gemini(self, model, contents, config):
        from google import genai
        from google.genai import types as genai_types

        client = genai.Client(api_key=self._api_key)
        return client.models.generate_content(
            model=model, contents=contents, config=config
        )

    # ── OpenAI + compatible (Groq, Mistral, DeepSeek) ────────────────
    def _call_openai_compat(self, model, contents, config):
        from openai import OpenAI

        provider_info = PROVIDERS.get(self._provider, PROVIDERS['openai'])
        base_url = provider_info.get('base_url')

        client_kwargs = {'api_key': self._api_key}
        if base_url:
            client_kwargs['base_url'] = base_url

        client = OpenAI(**client_kwargs)

        # Build messages
        messages = []
        system_text = getattr(config, 'system_instruction', None) if config else None
        if system_text:
            messages.append({'role': 'system', 'content': system_text})

        # Handle structured output: inject schema into system prompt
        response_schema = getattr(config, 'response_schema', None) if config else None
        json_mode = False
        if response_schema:
            schema_json = response_schema.model_json_schema()
            schema_hint = (
                f"\n\nYou MUST respond with valid JSON matching this exact schema:\n"
                f"```json\n{json.dumps(schema_json, indent=2)}\n```\n"
                f"Return ONLY the JSON object, no markdown fencing."
            )
            if messages and messages[0]['role'] == 'system':
                messages[0]['content'] += schema_hint
            else:
                messages.insert(0, {'role': 'system', 'content': schema_hint})
            json_mode = True
        elif getattr(config, 'response_mime_type', None) == 'application/json' if config else False:
            json_mode = True

        messages.append({'role': 'user', 'content': contents})

        temperature = getattr(config, 'temperature', 0.7) if config else 0.7

        kwargs = {
            'model': model,
            'messages': messages,
            'temperature': temperature,
        }
        if json_mode:
            kwargs['response_format'] = {'type': 'json_object'}

        response = client.chat.completions.create(**kwargs)
        text = response.choices[0].message.content

        return _UnifiedResponse(text)

    # ── Anthropic ────────────────────────────────────────────────────
    def _call_anthropic(self, model, contents, config):
        from anthropic import Anthropic

        client = Anthropic(api_key=self._api_key)

        system_text = getattr(config, 'system_instruction', None) if config else None
        system_parts = system_text or ''

        # Handle structured output
        response_schema = getattr(config, 'response_schema', None) if config else None
        if response_schema:
            schema_json = response_schema.model_json_schema()
            schema_hint = (
                f"\n\nYou MUST respond with valid JSON matching this exact schema:\n"
                f"```json\n{json.dumps(schema_json, indent=2)}\n```\n"
                f"Return ONLY the JSON object, no markdown fencing."
            )
            system_parts += schema_hint

        temperature = getattr(config, 'temperature', 0.7) if config else 0.7

        response = client.messages.create(
            model=model,
            max_tokens=8192,
            system=system_parts if system_parts else "You are a helpful assistant.",
            messages=[{'role': 'user', 'content': contents}],
            temperature=temperature,
        )

        text = response.content[0].text
        return _UnifiedResponse(text)


# ── Unified Client ───────────────────────────────────────────────────────

class UnifiedClient:
    """Drop-in replacement for genai.Client with unified provider support."""

    def __init__(self, provider: str, api_key: str):
        self.provider = provider
        self.api_key = api_key
        self.models = _UnifiedModels(provider, api_key)


# ── Global state + factory ───────────────────────────────────────────────

_client = None
_active_provider = 'gemini'
MODEL_NAME = 'gemini-2.5-pro'


def configure(provider: str = 'gemini', api_key: str = None, model: str = None):
    """Configures the global API client for any supported provider."""
    global _client, _active_provider, MODEL_NAME

    _active_provider = provider
    provider_info = PROVIDERS.get(provider)
    if not provider_info:
        raise ValueError(f"Unknown provider '{provider}'. Supported: {', '.join(PROVIDERS.keys())}")

    if api_key is None:
        api_key = os.environ.get(provider_info['env_var'])
    if not api_key:
        raise ValueError(
            f"API key not found for {provider_info['label']}. "
            f"Set {provider_info['env_var']} or pass api_key= to configure()."
        )

    MODEL_NAME = model or provider_info['default_model']
    _client = UnifiedClient(provider, api_key)


def get_client() -> UnifiedClient:
    """Returns the globally configured unified client."""
    global _client
    if _client is None:
        configure()  # Attempt to auto-configure from env (defaults to gemini)
    return _client


# ── Config helpers (shared by agents) ────────────────────────────────────
# These return config objects. For Gemini, they're native types.
# For other providers, UnifiedClient reads the attributes directly.

class _GenericConfig:
    """Lightweight config object used when the Gemini SDK isn't the active provider."""
    def __init__(self, temperature=0.7, response_mime_type=None, response_schema=None, system_instruction=None):
        self.temperature = temperature
        self.response_mime_type = response_mime_type
        self.response_schema = response_schema
        self.system_instruction = system_instruction


def get_structured_config(schema: type[BaseModel]):
    if _active_provider == 'gemini':
        from google.genai import types
        return types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
            temperature=0.1
        )
    return _GenericConfig(
        temperature=0.1,
        response_mime_type="application/json",
        response_schema=schema,
    )


def get_compiler_config():
    if _active_provider == 'gemini':
        from google.genai import types
        return types.GenerateContentConfig(temperature=0.7)
    return _GenericConfig(temperature=0.7)
