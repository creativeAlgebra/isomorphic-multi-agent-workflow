import time
import os
from google import genai

def generate_deep_research_paper():
    api_key = os.environ.get("GOOGLE_GENAI_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_GENAI_API_KEY is not set.")
    
    # Initialize the client
    client = genai.Client(api_key=api_key)
    
    topic = (
        "Isomorphic Multi-Agent Workflows (IMAW) vs Monolithic Large Language Models "
        "in solving the Expression-Structure Feedback Loop and maintaining strict pedagogical "
        "and structural fidelity when generating creative metaphors for complex technical concepts."
    )
    
    print(f"Starting deep research on: {topic}")
    
    prompt = (
        f"Research and write a comprehensive, rigorous academic paper on: {topic}. "
        f"The paper must evaluate the structural limitations of monolithic LLMs (hallucinations, breaking character) "
        f"and the mechanical benefits of separating logic extraction from creative synthesis using constrained multi-agent workflows (Contextual Blindness). "
        f"Please format the absolute final output perfectly in Markdown, and explicitly ensure it includes the following sections:\n"
        f"1. Executive Summary\n"
        f"2. Methodology\n"
        f"3. References (cited sources or authoritative theories relevant to these concepts)\n"
    )

    try:
        # Start the research task in the background
        interaction = client.interactions.create(
            input=prompt,
            agent='deep-research-pro-preview-12-2025',
            background=True,
            store=True
        )

        print(f"Research started! Interaction ID: {interaction.id}")

        # Poll for the results
        while True:
            try:
                # Retrieve the latest status of the interaction
                current_interaction = client.interactions.get(interaction.id)
                status = current_interaction.status
            except Exception as poll_e:
                print(f"[{time.strftime('%X')}] Encountered polling error (likely 403 API delay). Retrying in 15s...")
                time.sleep(15)
                continue
            
            if status == "COMPLETED":
                print("\n=== Research Complete ===")
                final_text = current_interaction.outputs[-1].text
                
                # Save the output to a file
                output_path = "outputs/deep_research_paper.md"
                with open(output_path, "w") as f:
                    f.write(final_text)
                print(f"\nSaved final research paper to {output_path}")
                break
                
            elif status == "FAILED":
                print(f"\nResearch failed: {current_interaction.error}")
                break
                
            print(f"[{time.strftime('%X')}] Research in progress (Status: {status})... checking again in 15 seconds.")
            time.sleep(15)
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Ensure outputs directory exists
    os.makedirs("outputs", exist_ok=True)
    generate_deep_research_paper()
