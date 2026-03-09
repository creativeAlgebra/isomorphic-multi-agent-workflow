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
    print("  IMAW vs Standard LLM: Experiment 3 (Ceramics in Arch)")
    print("==========================================================")
    
    # 1. Complex Source Concept: Innovation of Ceramics in Modern Architecture
    source_concept = (
        "The evolution of ceramics in modern architecture from passive cladding to active environmental systems. "
        "1. Material Composition Shift: Traditional ceramics relied on simple clay fired at low temperatures for static weatherproofing. Modern architectural ceramics integrate advanced polymers and metallic oxides, fired at ultra-high temperatures to create hyper-dense structural skins. "
        "2. Thermal Regulation: These new ceramic facades act as dynamic thermal sinks. During peak solar radiation, the dense crystalline lattice absorbs and traps heat. "
        "3. Passive Cooling Release: As external temperatures drop at night, the ceramic structurally re-emits the stored thermal energy back into the environment, drastically reducing the building's reliance on HVAC cooling systems. "
        "4. Photocatalytic Air Purification: Many modern ceramic panels are coated with titanium dioxide. When exposed to UV light, this coating triggers a photocatalytic reaction. "
        "5. Toxin Neutralization: The reaction breaks down nitrogen oxides (smog) near the building into harmless inert salts, which are then washed away by rain, effectively making the building an active air-purifying agent. "
        "6. Digital Fabrication: The complex geometries required to maximize the surface area for these thermal and chemical reactions are no longer hand-molded, but generated via parametric design algorithms and 3D-printed, allowing for bespoke, hyper-optimized facades tailored to the specific micro-climate of the building site."
    )
    
    # 2. Target Metaphor: Lifecycle of a star and nebula
    target_metaphor = "The lifecycle of a star, from a stable main-sequence sun to a volatile supernova that seeds a surrounding nebula with new, complex elements."
    
    print(f"\n[Source Concept]:\n{source_concept[:100]}...\n")
    print(f"[Target Metaphor Context]:\n{target_metaphor}\n")

    # --- EXPERIMENT A: IMAW PIPELINE ---
    print("\n⏳ Running Experiment A: The 3-Agent IMAW Pipeline...")
    try:
        abstract_schema = decompose(source_concept)
        mapping = map_isomorphism(abstract_schema, target_metaphor)
        imaw_lesson = synthesize_lesson(source_concept, target_metaphor, mapping)
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
    os.makedirs("outputs/comparative_experiment_3", exist_ok=True)
    
    with open("outputs/comparative_experiment_3/A_IMAW_Output_Ceramics.md", "w") as f:
        f.write("# Experiment A: IMAW 3-Agent Pipeline Output (Ceramics in Architecture)\n\n")
        f.write("### Decomposed Schema (Agent 1)\n```json\n" + abstract_schema + "\n```\n\n")
        f.write("### Isomorphic Mapping (Agent 2)\n```json\n" + mapping + "\n```\n\n")
        f.write("### Final Lesson (Agent 3)\n---\n\n" + imaw_lesson)
        
    with open("outputs/comparative_experiment_3/B_Standard_LLM_Output_Ceramics.md", "w") as f:
        f.write("# Experiment B: Standard Single Prompt Output (Ceramics in Architecture)\n\n---\n\n" + standard_lesson)
        
    print("\n💾 Experiment artifacts saved to: outputs/comparative_experiment_3/")

if __name__ == "__main__":
    main()
