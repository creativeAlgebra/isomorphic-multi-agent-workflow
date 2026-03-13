from . import get_client, MODEL_NAME, get_compiler_config


def generate_decode_key(source_concept: str, target_metaphor: str, mapping_json: str, final_lesson: str) -> str:
    """
    Agent 4: The Decode Key Generator.
    Produces a side-by-side translation guide that maps every metaphorical element
    back to its real-world counterpart, making the lesson a complete teaching tool.
    """
    client = get_client()
    config = get_compiler_config()

    system_instruction = (
        "You are the Decode Key Generator in an Isomorphic Multi-Agent Workflow. "
        "Your task is to create a clear, scannable reference document that bridges "
        "a metaphorical lesson back to the original real-world concept. "
        "This document should let a learner read the metaphor AND understand "
        "exactly what each element represents in reality."
    )

    prompt = (
        f"Original Source Concept:\n{source_concept}\n\n"
        f"Target Metaphor:\n{target_metaphor}\n\n"
        f"Structural Mapping Dictionary:\n{mapping_json}\n\n"
        f"Final Metaphorical Lesson:\n{final_lesson}\n\n"
        "Generate a DECODE KEY document in Markdown with these sections:\n\n"
        "1. **Quick Reference Table**: A two-column table mapping every metaphorical entity/term "
        "to its real-world equivalent (e.g., 'The Herald → SYN Packet').\n\n"
        "2. **Annotated Summary**: A short paragraph (3-5 sentences) that re-states the core lesson "
        "in plain language, explicitly naming both the metaphor AND the real concept side-by-side.\n\n"
        "3. **Key Takeaways**: 3-4 bullet points summarizing the most important structural insights "
        "the learner should retain, written clearly without jargon.\n\n"
        "Keep the document concise and highly scannable. This is a reference card, not an essay."
    )

    config.system_instruction = system_instruction

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=config
    )

    return response.text
