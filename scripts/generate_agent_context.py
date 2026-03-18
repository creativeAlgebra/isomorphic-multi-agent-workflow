import os
import argparse
from pathlib import Path

# NOTE: This uses the Google GenAI SDK as it is the default for IMAW
from google import genai
from google.genai import types

def get_client() -> genai.Client:
    api_key = os.environ.get("GOOGLE_GENAI_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_GENAI_API_KEY environment variable is not set.")
    return genai.Client(api_key=api_key)

def generate_summary(client: genai.Client, content: str, folder_name: str, lens_prompt: str) -> str:
    """
    Calls the LLM to generate a single markdown summary for the folder content.
    The 'lens_prompt' dictates how the LLM should interpret the files.
    """
    system_instruction = (
        f"You are evaluating the contents of a directory named '{folder_name}'.\n"
        f"Your task is to summarize this folder based on the following lens:\n"
        f"LENS: {lens_prompt}\n\n"
        "Return ONLY the markdown content. Do not include markdown code block backticks around the entire response."
    )
    
    # We use gemini-2.5-flash as it is extremely fast and cheap for bulk summarization tasks
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=content,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2, # Low temperature for more analytical/factual summaries
        )
    )
    
    return response.text

def process_directory(client: genai.Client, directory: Path, lens_prompt: str, output_filename: str):
    """
    Processes a directory bottom-up.
    Reads all relevant files + immediate children summaries to generate its own summary.
    """
    # 1. Walk bottom-up
    for root, dirs, files in os.walk(directory, topdown=False):
        current_dir = Path(root)
        
        # Skip hidden directories like .git, node_modules, or virtual environments
        if any(part.startswith('.') for part in current_dir.parts) or 'node_modules' in current_dir.parts or 'venv' in current_dir.parts:
            continue
            
        print(f"Processing: {current_dir.relative_to(directory) if current_dir != directory else '/'}")
        
        compiled_content = []
        
        # 2. Gather child folder summaries (The Cascading Rollup)
        # We only care about the summaries of our direct children, not their raw code.
        for d in dirs:
            child_dir = current_dir / d
            child_summary = child_dir / output_filename
            if child_summary.exists():
                compiled_content.append(f"--- FOLDER SUMMARY: {d}/ ---\n")
                with open(child_summary, 'r', encoding='utf-8') as f:
                    compiled_content.append(f.read())
                compiled_content.append("\n" + "="*40 + "\n")
                
        # 3. Gather local file content (The Leaf Nodes)
        for file in files:
            # Skip the output file itself to avoid infinite feedback loops
            if file == output_filename:
                continue
                
            # Only process specific file types (adjust as needed)
            if file.endswith(('.py', '.js', '.ts', '.tsx', '.jsx', '.md', '.html', '.css', '.json')):
                file_path = current_dir / file
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        file_body = f.read()
                        
                        # Simple length truncation to prevent massive minified files breaking context
                        if len(file_body) > 20000:
                            file_body = file_body[:20000] + "\n...[TRUNCATED]..."
                            
                        compiled_content.append(f"--- SOURCE FILE: {file} ---\n")
                        compiled_content.append(file_body)
                        compiled_content.append("\n" + "="*40 + "\n")
                except Exception as e:
                    print(f"  Skipping {file}: {e}")
                    
        if not compiled_content:
            print("  No relevant content found. Skipping.")
            continue
            
        full_text = "\n".join(compiled_content)
        
        # 4. Generate the new summary
        print("  Generating summary...")
        try:
            summary = generate_summary(client, full_text, current_dir.name, lens_prompt)
            
            output_path = current_dir / output_filename
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(summary)
            print(f"  -> Saved {output_filename}")
        except Exception as e:
            print(f"  ! Error generating summary: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cascading Semantic Rollup Script")
    parser.add_argument("--dir", type=str, default=".", help="Root directory to start the bottom-up rollup")
    parser.add_argument(
        "--lens", 
        type=str, 
        default="Summarize the architectural purpose, dependencies, and core responsibilities of this directory. Detail what these files do.", 
        help="The prompt 'lens' through which the LLM should evaluate the content."
    )
    parser.add_argument("--output", type=str, default=".agent_context.md", help="The name of the generated context files.")
    
    args = parser.parse_args()
    
    try:
        genai_client = get_client()
        target_dir = Path(args.dir).resolve()
        
        print("==================================================")
        print(f"Starting Cascading Rollup in: {target_dir}")
        print(f"Applying Lens: '{args.lens}'")
        print("==================================================\n")
        
        process_directory(genai_client, target_dir, args.lens, args.output)
        
        print("\nRollup Complete.")
    except Exception as e:
        print(f"Fatal Error: {e}")
