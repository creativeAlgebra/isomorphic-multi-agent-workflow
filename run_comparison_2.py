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
    print("  IMAW vs Standard LLM: Experiment 2 (Predictive Supply Chain)")
    print("==========================================================")
    
    # 1. Complex Source Concept: Predictive AI in Supply Chain Logistics
    source_concept = (
        "Implementing an AI-driven Predictive Maintenance and Logistics System for a Global Manufacturing Enterprise. "
        "1. IoT Sensor Integration: Sensors are installed on all manufacturing machines to constantly transmit real-time vibration, temperature, and output data to a central data lake. "
        "2. Anomaly Detection Engine: The AI continually monitors the data lake, learning the 'baseline normal' operating parameters of each machine. "
        "3. Failure Prediction: When the AI detects a subtle deviation from the baseline (an anomaly), it cross-references historical failure data to predict an imminent machine breakdown before it happens. "
        "4. Automated Supply Chain Trigger: Upon predicting a failure, the AI automatically pings the inventory database to check for replacement parts. "
        "5. Preemptive Dispatch: If the part is in stock, the system automatically generates a work order and routes a maintenance crew to fix the machine during a planned downtime window, preventing catastrophic halting of the assembly line. "
        "6. Vendor Reorder: If the part is not in stock, the AI automatically submits an emergency purchase order to the external vendor to rush the part via the fastest shipping route."
    )
    
    # 2. Target Metaphor
    target_metaphor = "A Roman General (Legatus) attempting to maintain the combat readiness of his legions stationed across the vast, hostile frontiers of Britannia using a network of scouts and specialized smiths."
    
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
    os.makedirs("outputs/comparative_experiment_2", exist_ok=True)
    
    with open("outputs/comparative_experiment_2/A_IMAW_Output_SupplyChain.md", "w") as f:
        f.write("# Experiment A: IMAW 3-Agent Pipeline Output (Supply Chain)\n\n")
        f.write("### Decomposed Schema (Agent 1)\n```json\n" + abstract_schema + "\n```\n\n")
        f.write("### Isomorphic Mapping (Agent 2)\n```json\n" + mapping + "\n```\n\n")
        f.write("### Final Lesson (Agent 3)\n---\n\n" + imaw_lesson)
        
    with open("outputs/comparative_experiment_2/B_Standard_LLM_Output_SupplyChain.md", "w") as f:
        f.write("# Experiment B: Standard Single Prompt Output (Supply Chain)\n\n---\n\n" + standard_lesson)
        
    print("\n💾 Experiment artifacts saved to: outputs/comparative_experiment_2/")

if __name__ == "__main__":
    main()
