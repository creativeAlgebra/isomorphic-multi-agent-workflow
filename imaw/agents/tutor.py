import json
from . import get_client, MODEL_NAME

def get_chat_response(user_question: str, source_concept: str, target_metaphor: str, mapping_json: str) -> dict:
    """
    Executes the double-translation loop to maintain the isomorphic illusion.
    Returns a dict with all three stages of the translation for logging purposes.
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
        "tutor_reply": tutor_reply
    }
