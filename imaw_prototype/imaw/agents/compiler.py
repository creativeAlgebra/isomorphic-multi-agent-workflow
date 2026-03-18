from . import get_client, MODEL_NAME, get_compiler_config

def synthesize_operational_output(target_domain: str, mapping_json: str, source_logic: str | None = None) -> str:
    """
    Agent 3: The Compiler Agent.
    Takes the abstract mapping and the target domain to synthesize an engaging, 
    pedagogically sound operational output about the original concept.
    If source_logic is provided, it uses it for explicit parenthetical "anchoring".
    """
    client = get_client()
    config = get_compiler_config()
    
    system_instruction = (
        "You are the Compiler Agent in an Isomorphic Multi-Agent Workflow. "
        "Your task is to act as an expert pedagogue and instructional designer. "
        "You will receive a target domain and a strict structural mapping dictionary. "
        "You MUST write a highly engaging, readable, and formally accurate operational output that explains the underlying logic "
        "entirely through the lens of the TARGET metaphor. "
        "CRITICAL: You must obey the structural mapping perfectly. Do not hallucinate or invent interactions that the mapping does not support."
    )

    if source_logic:
        system_instruction += (
            " \n\nCONTEXTUAL ANCHORING INSTRUCTION:\n"
            "You have been provided with the original source logic. You must use this ONLY to 'anchor' the jargon into the narrative. "
            "When you explain a metaphorical step that directly corresponds to a technical term from the source, "
            "include the real technical term in parentheses (e.g., 'The Lead Explorer gathered the tribal elders (Form a Guiding Coalition)'). "
            "Do NOT let the source logic derail the metaphorical narrative; use it solely for explicit parenthetical bridging."
        )
    
    prompt = f"The Chosen Target Domain:\n{target_domain}\n\n"
    if source_logic:
        prompt += f"The Original Source Logic:\n{source_logic}\n\n"

    prompt += (
        f"The Structural Isomorphic Mapping:\n{mapping_json}\n\n"
        "Synthesize the final operational brief natively in Markdown format.\n"
        "CRITICAL UX REQUIREMENT: At the very bottom of the artifact, you MUST append a section titled '### Suggested Exploration Questions'. "
        "Provide exactly 3 thought-provoking questions phrased ENTIRELY within the rules of the target domain. "
        "These questions should prompt the user to stress-test the simulation (e.g., 'What happens if [X event] occurs?')."
    )
    
    config.system_instruction = system_instruction
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=config
    )
    
    return response.text
