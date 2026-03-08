import os
import textwrap
import imaw

def get_multiline_input(prompt_text):
    print(f"\n{prompt_text}")
    print("(Type your response, then press Enter twice to submit)")
    lines = []
    while True:
        line = input()
        if not line:
            if not lines:
                print("Input cannot be empty. Please try again.")
                continue
            break
        lines.append(line)
    return "\n".join(lines)

def main():
    print("==========================================================")
    print("  IMAW Interactive Prototyper - Testing the Framework")
    print("==========================================================")
    print("Welcome! This tool allows you to feed custom concepts into")
    print("the 3-agent Isomorphic Multi-Agent Workflow pipeline.")
    
    while True:
        source_concept = get_multiline_input(
            "📝 STEP 1: Enter your Source Concept.\n"
            "   (e.g., 'How a 4-stroke engine works' or paste in highly technical text)"
        )
        
        target_metaphor = get_multiline_input(
            "🎨 STEP 2: Enter your Target Metaphor.\n"
            "   (e.g., 'A busy commercial kitchen' or 'The Wild West')"
        )
        
        print("\n⏳ Starting the IMAW Pipeline...\n")
        
        try:
            print("--- EXECUTING IMAW PIPELINE ---")
            print("Processing Decomposition, Mapping, and Synthesis...")
            results = imaw.IMAWOrchestrator.generate_lesson(source_concept, target_metaphor)
            abstract_schema_json = results["abstract_schema"]
            mapping_json = results["mapping"]
            final_lesson = results["lesson"]
            print("✓ Lesson Complete")
            
            print("\n==========================================================")
            print("                    FINAL IMAW LESSON                     ")
            print("==========================================================")
            print(textwrap.indent(final_lesson, "    "))
            print("==========================================================\n")
            
            # Save the experiment in a dedicated folder
            import time
            import re
            
            # Create a clean folder name based on timestamp and metaphor
            timestamp = int(time.time())
            clean_title = re.sub(r'[^a-zA-Z0-9]', '_', target_metaphor.split()[0].lower()[:15])
            exp_dir = f"outputs/experiment_{timestamp}_{clean_title}"
            os.makedirs(exp_dir, exist_ok=True)
            
            # Save each step individually
            with open(os.path.join(exp_dir, "0_inputs.txt"), "w") as f:
                f.write(f"SOURCE CONCEPT:\n{source_concept}\n\nTARGET METAPHOR:\n{target_metaphor}\n")
                
            with open(os.path.join(exp_dir, "1_abstract_schema_from_agent_1.json"), "w") as f:
                f.write(abstract_schema_json)
                
            with open(os.path.join(exp_dir, "2_isomorphic_mapping_from_agent_2.json"), "w") as f:
                f.write(mapping_json)
                
            with open(os.path.join(exp_dir, "3_final_lesson_from_agent_3.md"), "w") as f:
                f.write(f"# IMAW Final Lesson\n\n**Metaphor:** {target_metaphor}\n\n---\n\n{final_lesson}")
                
            print(f"💾 Full experiment trace saved to folder: {exp_dir}/")
            print(f"   ↳ Check '1_abstract_schema_from_agent_1.json' to see what Agent 2 received.")
            print(f"   ↳ Check '2_isomorphic_mapping_from_agent_2.json' to see what Agent 3 received.")
            
            print("\n==========================================================")
            print("  PHASE 2: THE ISOMORPHIC CONVERSATIONAL TUTOR")
            print("==========================================================")
            print("The system is now holding the mapping structure in memory.")
            print("You may ask follow-up questions within the metaphor.")
            print("(Type 'exit' to end the chat and start a new concept)\n")
            
            chat_transcript_path = os.path.join(exp_dir, "4_tutor_chat_transcript.md")
            with open(chat_transcript_path, "w") as f:
                f.write(f"# IMAW Tutor Chat Transcript\n\n**Metaphor:** {target_metaphor}\n\n---\n\n")

            session = imaw.TutorSession(source_concept, target_metaphor, abstract_schema_json, mapping_json)

            while True:
                user_q = get_multiline_input(">>> Ask a follow-up question (or 'exit' to reset): ")
                if user_q.strip().lower() == 'exit':
                    break
                    
                print("\n⏳ Tutor is thinking (Double-Translation Pipeline)...")
                try:
                    tutor_reply = session.add_user_message(user_q)
                    
                    print(f"\n================ TUTOR REPLY ================\n")
                    print(textwrap.indent(tutor_reply, "    "))
                    print("\n==============================================\n")
                    
                    # Log the conversation
                    with open(chat_transcript_path, "a") as f:
                        f.write(f"**USER:** {user_q}\n\n")
                        f.write(f"**TUTOR:** {tutor_reply}\n\n---\n\n")
                        
                except Exception as chat_err:
                    print(f"\n❌ Chat Error: {chat_err}")
                    
        except Exception as e:
            print(f"\n❌ An error occurred during the pipeline: {e}")
            
        again = input("\nWould you like to run another translation? (y/n): ").strip().lower()
        if again != 'y':
            print("Exiting interactive tester. Goodbye!")
            break

if __name__ == "__main__":
    main()
