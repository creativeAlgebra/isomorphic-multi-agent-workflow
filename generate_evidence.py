import os
import json
import time
from imaw.agents import get_client, MODEL_NAME
from imaw.orchestrator import IMAWOrchestrator

def get_standard_llm_response(source_concept: str, target_metaphor: str) -> str:
    """Simulates a standard user asking a chatbot to explain a concept using a metaphor."""
    client = get_client()
    
    prompt = (
        f"You are an expert educator. I need you to explain a complex high-stakes enterprise topic to me.\n\n"
        f"Here is the technical topic:\n{source_concept}\n\n"
        f"I want you to explain this entire topic perfectly using the following metaphor:\n{target_metaphor}\n\n"
        "Make sure to map the actors and the rules accurately into a cohesive, engaging lesson."
    )
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )
    return response.text

def process_grading(source_concept: str, target_metaphor: str, text_to_grade: str, approach_name: str) -> dict:
    client = get_client()
    
    grading_prompt = f"""
You are an expert AI auditor assessing "Generative Control Architectures". Your task is to evaluate an AI-generated explanation for strict structural and contextual adherence.

Original Technical Source:
{source_concept}

Target Metaphor Domain:
{target_metaphor}

Generated Output to Evaluate ({approach_name}):
{text_to_grade}

Evaluate the generated output on two specific metrics. Provide a JSON response with the following keys exactly:
1. "contextual_leakage_score": (0 to 100). Higher is better. 100 means zero technical jargon "leaked" into the metaphor. 0 means it failed completely to maintain the metaphorical disguise.
2. "structural_fidelity_score": (0 to 100). Higher is better. 100 means every single operational rule and relationship from the technical source was perfectly mapped without omission or hallucination.
3. "failure_diagnostics": A short string explaining specifically where and how the output failed (e.g., "Leaked the word 'node'", or "Missed the rule about scheduling"). If it scored 100 on both, say "Perfect adherence."
4. "tagged_output": The exact original text of the "Generated Output", but MUST be rewritten to wrap any blatantly translated technical terms (like Node, Pod, CPU, etc) from the technical source in an XML tag: `<leak>term</leak>`. If no leakage occurred, return the original text unmodified.

Return ONLY valid JSON.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=grading_prompt,
        config={
            "response_mime_type": "application/json"
        }
    )
    try:
        return json.loads(response.text)
    except BaseException as e:
        print(f"Error parsing grading JSON: {e}")
        return {
            "contextual_leakage_score": 0,
            "structural_fidelity_score": 0,
            "failure_diagnostics": "Failed to parse grading output.",
            "tagged_output": text_to_grade
        }


def main():
    print("==========================================================")
    print("  IMAW Evidence Generator: Enterprise Control Architecture")
    print("==========================================================")
    
    # High-stakes enterprise scenario: Kubernetes Architecture
    source_concept = (
        "Kubernetes Cluster Architecture: "
        "1. Control Plane: Manages the worker nodes and the Pods in the cluster. It consists of several components. "
        "2. kube-apiserver: The frontend for the Kubernetes control plane. It exposes the Kubernetes API. "
        "3. etcd: Consistent and highly-available key value store used as Kubernetes' backing store for all cluster data. "
        "4. kube-scheduler: Watches for newly created Pods with no assigned node, and selects a node for them to run on based on resource requirements. "
        "5. kube-controller-manager: Runs controller processes (like Node controller, Job controller) to regulate state. "
        "6. Worker Nodes: The machines (VMs or physical) that run the containerized applications. "
        "7. kubelet: An agent that runs on each node in the cluster, ensuring containers are running in a Pod. "
        "8. Pod: The smallest deployable units of computing that you can create and manage in Kubernetes. "
        "Rule: The scheduler cannot place a Pod on a node if the node lacks the designated CPU/Memory resources."
    )
    
    # Target Metaphor
    target_metaphor = "Running a massive, complex 19th-century luxury hotel (like The Grand Budapest Hotel)."
    
    print(f"\n[Source Concept]:\n{source_concept[:100]}...\n")
    print(f"[Target Metaphor Context]:\n{target_metaphor}\n")

    # --- EXPERIMENT A: STANDARD MONOLITHIC LLM ---
    print("\n⏳ Running Experiment A: Standard Monolithic LLM Single Prompt...")
    standard_lesson = get_standard_llm_response(source_concept, target_metaphor)
    print("✓ Standard LLM Generation Complete")
    
    print("⏳ Grading Standard LLM...")
    standard_grades = process_grading(source_concept, target_metaphor, standard_lesson, "Monolithic LLM")

    # --- EXPERIMENT B: IMAW PIPELINE ---
    print("\n⏳ Running Experiment B: The 3-Agent IMAW Pipeline...")
    imaw_results = IMAWOrchestrator.generate_lesson(source_concept, target_metaphor)
    imaw_lesson = imaw_results["lesson"]
    print("✓ IMAW Pipeline Generation Complete")
    
    print("⏳ Grading IMAW Pipeline...")
    imaw_grades = process_grading(source_concept, target_metaphor, imaw_lesson, "IMAW Semantic Firewall")

    # Save outputs for the website
    os.makedirs("/tmp/evidence", exist_ok=True)
    
    # JSON Data for frontend EvidenceViewer.jsx
    evidence_data = {
        "scenario": "Kubernetes Cluster Architecture",
        "source_concept": source_concept,
        "metaphor": target_metaphor,
        "standard_llm": {
            "raw_output": standard_lesson,
            "grades": standard_grades
        },
        "imaw_pipeline": {
            "raw_output": imaw_lesson,
            "abstract_schema": imaw_results["abstract_schema"],
            "isomorphic_mapping": imaw_results["mapping"],
            "grades": imaw_grades
        }
    }
    
    with open("/tmp/evidence/evidence_data.json", "w") as f:
        json.dump(evidence_data, f, indent=2)

    # Markdown Report
    with open("/tmp/evidence/evidence_report.md", "w") as f:
        f.write("# Empirical Evidence Report: Generative Control Architecture\n\n")
        f.write(f"**Enterprise Scenario:** Kubernetes Architecture\n")
        f.write(f"**Target Metaphor:** {target_metaphor}\n\n")
        f.write("---\n\n## Experiment A: Monolithic LLM Failure\n")
        f.write(f"**Contextual Leakage Score:** {standard_grades['contextual_leakage_score']}/100\n")
        f.write(f"**Structural Fidelity Score:** {standard_grades['structural_fidelity_score']}/100\n")
        f.write(f"**Diagnostics:** {standard_grades['failure_diagnostics']}\n\n")
        f.write("### Raw Output\n\n" + standard_lesson + "\n\n")
        
        f.write("---\n\n## Experiment B: IMAW Architectural Success\n")
        f.write(f"**Contextual Leakage Score:** {imaw_grades['contextual_leakage_score']}/100\n")
        f.write(f"**Structural Fidelity Score:** {imaw_grades['structural_fidelity_score']}/100\n")
        f.write(f"**Diagnostics:** {imaw_grades['failure_diagnostics']}\n\n")
        f.write("### Phase 1: Pure Logic Extraction (Decomposition)\n```json\n" + imaw_results["abstract_schema"] + "\n```\n\n")
        f.write("### Phase 2: Domain Translation (Mapmaker)\n```json\n" + imaw_results["mapping"] + "\n```\n\n")
        f.write("### Phase 3: Synthesized Output (Storyteller)\n\n" + imaw_lesson)
        
    print("\n💾 Empirical evidence generated and saved to: /tmp/evidence/")
    print("\n--- GRADING SUMMARY ---")
    print("Standard LLM:")
    print(f"  Leakage Score: {standard_grades['contextual_leakage_score']}")
    print(f"  Fidelity Score: {standard_grades['structural_fidelity_score']}")
    print("IMAW:")
    print(f"  Leakage Score: {imaw_grades['contextual_leakage_score']}")
    print(f"  Fidelity Score: {imaw_grades['structural_fidelity_score']}")

if __name__ == "__main__":
    main()
