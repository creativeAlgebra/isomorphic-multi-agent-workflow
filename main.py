import os
from agents.decomposition import decompose
from agents.mapping import map_isomorphism
from agents.compiler import synthesize_lesson

def main():
    print("==================================================")
    print(" Isomorphic Multi-Agent Workflow (IMAW) Prototype ")
    print("==================================================")
    
    # 1. Define the Source Concept
    source_concept = (
        "The TCP/IP Handshake (Three-way Handshake). "
        "A client node sends an SYN (synchronize) packet to the server to initiate a connection. "
        "The server receives the SYN and responds with an SYN-ACK (synchronize-acknowledge) packet. "
        "Finally, the client receives the SYN-ACK and sends an ACK (acknowledge) packet back to the server. "
        "Only after these three steps are complete is a secure, reliable communication channel established."
    )
    print(f"\n[Source Concept]:\n{source_concept}")
    
    # 2. Define the Target Metaphor
    target_metaphor = "Formal diplomacy and negotiation between two rival medieval castles across a valley."
    print(f"\n[Target Metaphor Context]:\n{target_metaphor}")
    
    print("\n--- PHASE 1: THE DECOMPOSITION AGENT ---")
    print("Extracting pure abstract relational logic...")
    abstract_schema_json = decompose(source_concept)
    print(">> Decomposition Output (Abstract Schema):")
    print(abstract_schema_json)
    
    print("\n--- PHASE 2: THE MAPPING AGENT ---")
    print("Instantiating abstract logic into the target metaphor...")
    mapping_json = map_isomorphism(abstract_schema_json, target_metaphor)
    print(">> Mapping Output (Isomorphic Dictionary):")
    print(mapping_json)
    
    print("\n--- PHASE 3: THE COMPILER AGENT ---")
    print("Synthesizing final pedagogical artifact...")
    final_lesson = synthesize_lesson(source_concept, target_metaphor, mapping_json)
    
    print("\n==================================================")
    print("                FINAL IMAW LESSON                 ")
    print("==================================================")
    print(final_lesson)
    
    # Save the output
    os.makedirs("outputs", exist_ok=True)
    with open("outputs/tcp_ip_castle_diplomacy.md", "w") as f:
        f.write("# TCP/IP Handshake via Castle Diplomacy\n\n")
        f.write(f"**Source Concept:** {source_concept}\n\n")
        f.write(f"**Target Metaphor:** {target_metaphor}\n\n")
        f.write("---\n\n")
        f.write("## Phase 1: Structural Extraction (Decomposition)\n```json\n")
        f.write(abstract_schema_json)
        f.write("\n```\n\n")
        f.write("## Phase 2: Structural Translation (Mapping)\n```json\n")
        f.write(mapping_json)
        f.write("\n```\n\n")
        f.write("---\n\n")
        f.write(final_lesson)
    
    print("\n[✔] Artifact saved to outputs/tcp_ip_castle_diplomacy.md")

if __name__ == "__main__":
    main()
