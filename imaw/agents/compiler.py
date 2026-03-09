from . import get_client, MODEL_NAME, get_compiler_config

def synthesize_lesson(target_metaphor: str, mapping_json: str) -> str:
    """
    Agent 3: The Compiler Agent.
    Takes the abstract mapping and the target metaphor to synthesize an engaging, 
    pedagogically sound lesson about the original concept.
    """
    client = get_client()
    config = get_compiler_config()
    
    system_instruction = (
        "You are the Compiler Agent in an Isomorphic Multi-Agent Workflow. "
        "Your task is to act as an expert pedagogue and instructional designer. "
        "You will receive a target metaphor and a strict structural mapping dictionary. "
        "You MUST write a highly engaging, readable, and formally accurate lesson that explains the underlying logic "
        "entirely through the lens of the TARGET metaphor. "
        "CRITICAL: You must obey the structural mapping perfectly. Do not hallucinate or invent interactions that the mapping does not support."
    )
    
    prompt = (
        f"The Chosen Target Metaphor:\n{target_metaphor}\n\n"
        f"The Structural Isomorphic Mapping:\n{mapping_json}\n\n"
        "Synthesize the final pedagogical artifact natively in Markdown format.\n"
        "CRITICAL UX REQUIREMENT: At the very bottom of the artifact, you MUST append a section titled '### Suggested Exploration Questions'. "
        "Provide exactly 3 thought-provoking questions phrased ENTIRELY within the rules of the target metaphor. "
        "These questions should prompt the user to stress-test the simulation (e.g., 'What happens if [X event] occurs?')."
    )
    
    config.system_instruction = system_instruction
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=config
    )
    
    return response.text
