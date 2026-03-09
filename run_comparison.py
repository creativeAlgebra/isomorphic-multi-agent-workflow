import os
import textwrap
from agents.decomposition import decompose
from agents.mapping import map_isomorphism
from agents.compiler import synthesize_lesson
from agents import get_client, MODEL_NAME

def get_standard_llm_response(source_concept: str, target_metaphor: str) -> str:
    """Simulates a standard user asking a chatbot to explain a concept using a metaphor."""
    client = get_client()
    
    prompt = (
        f"You are an expert educator. I need you to explain a complex topic to me.\n\n"
        f"Here is the topic:\n{source_concept}\n\n"
        f"I want you to explain this entire topic perfectly using the following metaphor:\n{target_metaphor}\n\n"
        "Make sure to map the actors and the rules accurately into a cohesive, engaging lesson."
    )
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )
    return response.text

def main():
    print("==========================================================")
    print("  IMAW vs Standard LLM: Comparative Experiment Runner")
    print("==========================================================")
    
    # 1. Complex Source Concept: AI Change Management (Kotter's 8-Step Model applied to AI)
    source_concept = (
        "Implementing Enterprise AI using Kotter's 8-Step Change Management Model. "
        "1. Create Urgency: Leadership must highlight the existential threat of falling behind in AI. "
        "2. Form a Guiding Coalition: Assemble a cross-functional team of AI champions (IT, Legal, Operations). "
        "3. Create a Vision: Define exactly what 'AI-enabled' looks like for the company's future. "
        "4. Communicate the Vision: Broadcast the AI strategy to all employees constantly. "
        "5. Empower Action: Remove legacy data silos and bureaucratic red tape blocking AI pilots. "
        "6. Create Quick Wins: Launch small, highly visible AI tools (like an internal chatbot) that immediately save time. "
        "7. Build on the Change: Use the momentum from quick wins to tackle larger, systemic AI integrations. "
        "8. Anchor in Culture: Update hiring practices and KPIs so AI fluency becomes a core company value."
    )
    
    # 2. Target Metaphor
    target_metaphor = "Leading a team of Victorian-era explorers attempting to map an uncharted, magical jungle."
    
    print(f"\n[Source Concept]:\n{source_concept[:100]}...\n")
    print(f"[Target Metaphor Context]:\n{target_metaphor}\n")

    # --- EXPERIMENT A: IMAW PIPELINE ---
    print("\n⏳ Running Experiment A: The 3-Agent IMAW Pipeline...")
    try:
        abstract_schema = decompose(source_concept)
        mapping = map_isomorphism(abstract_schema, target_metaphor)
        imaw_lesson = synthesize_lesson(target_metaphor, mapping)
        print("✓ IMAW Pipeline Complete")
    except Exception as e:
        print(f"IMAW Error: {e}")
        return

    # --- EXPERIMENT B: STANDARD MONOLITHIC LLM ---
    print("\n⏳ Running Experiment B: Standard Monolithic LLM Single Prompt...")
    try:
        standard_lesson = get_standard_llm_response(source_concept, target_metaphor)
        print("✓ Standard LLM Complete")
    except Exception as e:
        print(f"Standard LLM Error: {e}")
        return

    # Save outputs for comparison
    os.makedirs("outputs/comparative_experiment", exist_ok=True)
    
    with open("outputs/comparative_experiment/A_IMAW_Output.md", "w") as f:
        f.write("# Experiment A: IMAW 3-Agent Pipeline Output\n\n")
        f.write("### Decomposed Schema (Agent 1)\n```json\n" + abstract_schema + "\n```\n\n")
        f.write("### Isomorphic Mapping (Agent 2)\n```json\n" + mapping + "\n```\n\n")
        f.write("### Final Lesson (Agent 3)\n---\n\n" + imaw_lesson)
        
    with open("outputs/comparative_experiment/B_Standard_LLM_Output.md", "w") as f:
        f.write("# Experiment B: Standard Single Prompt Output\n\n---\n\n" + standard_lesson)
        
    print("\n💾 Experiment artifacts saved to: outputs/comparative_experiment/")

if __name__ == "__main__":
    main()
