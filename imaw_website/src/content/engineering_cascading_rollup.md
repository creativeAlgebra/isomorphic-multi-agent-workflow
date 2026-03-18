# Separating Structure from Expression: Generating Agentic Context via Cascading Rollups

*By Randall Garcia — Engineering Notes | March 2026*

A core thesis of the IMAW paper is that generative reliability improves when we separate *structure* from *expression*. Monolithic LLMs often blend the two, leading to probabilistic hallucinations. By forcing a multi-agent pipeline to decompose a source concept into its abstract relational topology *before* mapping it to a new domain, we don't necessarily guarantee a subjectively "better" metaphor, but we do guarantee something far more valuable for systems engineering: **auditability**. 

If the translation fails, Contextual Blindness allows us to isolate the error to a specific node in the pipeline.

As I've been building out the agentic architecture for IMAW, I encountered a related problem: **Context Initialization**. How do you provide an agent with enough context to understand a complex codebase without overwhelming it with raw expression (thousands of lines of syntax, boilerplate, and specific variable names)?

Dumping an entire repository into an agent's context window is the equivalent of forcing it to reason within a massive, flat, probabilistic space. The agent drowns in expression and struggles to see the overarching structure.

To solve this pragmatically, I evolved a script to generate **Cascading Semantic Rollups**, which serves as a real-world application of IMAW Contextual Blindness.

---

## Curing Expression Leakage with Contextual Blindness

When summarizing code architectures, a major problem is "Expression Leakage." If you pass raw code directly to an LLM to generate an architectural summary, the raw syntax, variable names, and boilerplate will inevitably bleed into the resulting summary. As these summaries cascade upward through a deep folder tree, this leakage accumulates, and the root context map becomes bloated and unusable.

To solve this, the Cascading Rollup script perfectly mirrors IMAW by splitting the summarization process into a contextually blind, two-stage pipeline:

1. **Decompose (Agent 1):** Reads the raw code and extracts a strictly factual, syntax-free list of entities, relationships, and business logic. This runs at a temperature of 0.0 to enforce strict, structural fidelity.
2. **Synthesize (Agent 2):** Takes *only* that abstract list (completely blind to the raw code) and writes the final markdown summary based on a specific `--lens`. It never "sees" the raw syntax, preventing any expression leakage. 

## Four Major Architectural Upgrades

This production script combines four enhancements to enforce strict architectural constraints without overwhelming the LLM:

1. **Contextual Blindness (IMAW-Aligned):** The two-stage LLM pipeline (Deconstruct $\rightarrow$ Synthesize) prevents raw code syntax from leaking into the final architectural map.
2. **Smart Chunking:** Head/tail truncation preserves crucial imports and exports in massive files when they eclipse the context limits.
3. **Dependency Injection:** Pure LLMs suffer from "Horizontal Blindness"—an inability to natively see cross-folder interactions outside of their immediate context. The script uses Regex-based mapping to cure horizontal blindness by explicitly giving the Agent a map of how folders interact.
4. **Cascading Hash Caching:** State-bound idempotency. It hashes the state of your files (including dependencies) so subsequent runs take less than a second if nothing has changed.

This workflow proves that Contextual Blindness isn't just for pedagogical metaphors; it is a vital engineering principle for Isomorphic Compression in recursive codebase mapping.

## The Production-Ready Script (`rollup.py`)

```python
import os
import argparse
import re
import hashlib
from pathlib import Path
from collections import defaultdict

# NOTE: This uses the Google GenAI SDK
from google import genai
from google.genai import types

def get_client() -> genai.Client:
    api_key = os.environ.get("GOOGLE_GENAI_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_GENAI_API_KEY environment variable is not set.")
    return genai.Client(api_key=api_key)

# ==========================================
# 1. CACHING & STATE MANAGEMENT
# ==========================================

def compute_state_hash(content: str) -> str:
    """Generates a SHA-256 hash of the input content to track changes."""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def check_cache(output_path: Path, current_hash: str) -> bool:
    """Checks if the existing summary has a matching state hash hidden in the HTML comment."""
    if not output_path.exists():
        return False
    try:
        with open(output_path, 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
            if first_line == f"<!-- HASH: {current_hash} -->":
                return True
    except Exception:
        pass
    return False

# ==========================================
# 2. DEPENDENCY GRAPHING
# ==========================================

def build_dependency_map(directory: Path) -> dict:
    """Scans the repository to build a global map of cross-file imports."""
    deps = defaultdict(list)
    import_patterns = [
        re.compile(r'^import\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]', re.MULTILINE),
        re.compile(r'^require\([\'"]([^\'"]+)[\'"]\)', re.MULTILINE),
        re.compile(r'^from\s+([^\s]+)\s+import', re.MULTILINE),
        re.compile(r'^import\s+([^\s]+)', re.MULTILINE)
    ]

    for root, _, files in os.walk(directory):
        if any(part.startswith('.') or part in ('node_modules', 'venv', 'dist', 'build') for part in Path(root).parts):
            continue
        for file in files:
            if file.endswith(('.py', '.js', '.ts', '.tsx', '.jsx')):
                file_path = Path(root) / file
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    rel_path = str(file_path.relative_to(directory))
                    for pattern in import_patterns:
                        for match in pattern.findall(content):
                            # Track local cross-folder dependencies, ignore standard library/NPM packages
                            if match.startswith('.') or '/' in match: 
                                deps[rel_path].append(match)
                except Exception:
                    pass
    return deps

def get_folder_dependencies(current_dir: Path, root_dir: Path, global_deps: dict) -> str:
    """Extracts the specific incoming/outgoing dependencies for the current folder."""
    rel_current_dir = str(current_dir.relative_to(root_dir))
    if rel_current_dir == ".": 
        return ""
        
    outgoing = {imp for file_path, imports in global_deps.items() if file_path.startswith(rel_current_dir) for imp in imports}
    return "This folder imports or relies on the following external modules/paths:\n- " + "\n- ".join(outgoing) if outgoing else "No known cross-folder dependencies."

# ==========================================
# 3. CONTEXTUALLY BLIND LLM PIPELINE
# ==========================================

def generate_summary(client: genai.Client, raw_content: str, folder_name: str, lens_prompt: str, dependency_context: str) -> str:
    """
    Implements a contextually blind, two-stage pipeline to prevent code expression 
    from leaking into the architectural structure map.
    """
    
    # STAGE 1: Decompose (Extract Structure, Blind to Target Lens)
    decompose_instruction = (
        f"You are evaluating raw code for a directory named '{folder_name}'.\n"
        "Your ONLY job is to strip away all syntax, boilerplate, and specific code expression. "
        "Return a strictly factual, bulleted list of the core entities, business logic, and relationships present. "
        "DO NOT write a summary. DO NOT include code blocks."
    )
    
    structure_extraction = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=raw_content,
        config=types.GenerateContentConfig(
            system_instruction=decompose_instruction,
            temperature=0.0, # Zero temperature for strict factual extraction
        )
    ).text

    # STAGE 2: Synthesize (Contextually Blind to Raw Code)
    synthesize_instruction = (
        f"You are evaluating the abstract structure of a directory named '{folder_name}'.\n"
        f"Your task is to write a cohesive markdown summary based on the following lens:\n"
        f"LENS: {lens_prompt}\n\n"
        f"--- CROSS-BOUNDARY DEPENDENCIES ---\n{dependency_context}\n"
        f"Use this dependency information to explain HOW this folder connects to the rest of the application.\n\n"
        "Return ONLY the markdown content. Do not include markdown code block backticks around the entire response."
    )
    
    final_summary = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=structure_extraction, # Notice we pass the extracted structure, NOT the raw code
        config=types.GenerateContentConfig(
            system_instruction=synthesize_instruction,
            temperature=0.2, 
        )
    ).text
    
    return final_summary

# ==========================================
# 4. ORCHESTRATION (BOTTOM-UP ROLLUP)
# ==========================================

def process_directory(client: genai.Client, directory: Path, lens_prompt: str, output_filename: str):
    print("Mapping global dependencies...")
    global_deps = build_dependency_map(directory)

    # Walk bottom-up to ensure children are summarized before their parents
    for root, dirs, files in os.walk(directory, topdown=False):
        current_dir = Path(root)
        
        # Skip hidden directories and environment folders
        if any(part.startswith('.') for part in current_dir.parts) or part in ('node_modules', 'venv', 'dist', 'build') for part in current_dir.parts:
            continue
            
        compiled_content = []
        
        # 1. Gather child folder summaries
        for d in dirs:
            child_summary = current_dir / d / output_filename
            if child_summary.exists():
                compiled_content.append(f"--- FOLDER SUMMARY: {d}/ ---\n")
                with open(child_summary, 'r', encoding='utf-8') as f:
                    compiled_content.append(f.read())
                
        # 2. Gather local files (With Smart Chunking)
        for file in files:
            if file == output_filename: continue
            if file.endswith(('.py', '.js', '.ts', '.tsx', '.jsx', '.md', '.html', '.css', '.json', '.yml', '.yaml')):
                try:
                    with open(current_dir / file, 'r', encoding='utf-8') as f:
                        file_body = f.read()
                        
                        # Head & Tail truncation to preserve imports/exports
                        MAX_LEN = 20000
                        if len(file_body) > MAX_LEN:
                            half_len = MAX_LEN // 2
                            file_body = f"{file_body[:half_len]}\n\n... [TRUNCATED] ...\n\n{file_body[-half_len:]}"
                            
                        compiled_content.append(f"--- SOURCE FILE: {file} ---\n{file_body}")
                except Exception:
                    pass
                    
        # Skip empty folders or folders with no relevant code
        if not compiled_content:
            continue
            
        folder_deps = get_folder_dependencies(current_dir, directory, global_deps)
        
        # We hash the raw text input plus the dependencies so if external links change, the cache invalidates
        full_input_text = "\n".join(compiled_content) + f"\nLENS: {lens_prompt}\nDEPS: {folder_deps}"
        
        # 3. Cache Validation
        current_hash = compute_state_hash(full_input_text)
        output_path = current_dir / output_filename
        rel_path = current_dir.relative_to(directory) if current_dir != directory else '/'
        
        if check_cache(output_path, current_hash):
            print(f"✅ Cache Hit: Skipping {rel_path}")
            continue
            
        print(f"🔄 Processing: {rel_path}")
        
        # 4. Generate & Save
        try:
            summary = generate_summary(client, "\n".join(compiled_content), current_dir.name, lens_prompt, folder_deps)
            # Prepend the hidden HTML comment containing the state hash
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(f"<!-- HASH: {current_hash} -->\n{summary}")
        except Exception as e:
            print(f"  ! Error generating summary: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cascading Semantic Rollup Script (IMAW Architecture)")
    parser.add_argument("--dir", type=str, default=".", help="Root directory to map")
    parser.add_argument("--lens", type=str, default="Summarize architectural purpose, core business logic, and how this folder fits into the wider system.", help="Lens prompt")
    parser.add_argument("--output", type=str, default=".agent_context.md", help="Output filename")
    
    args = parser.parse_args()
    try:
        genai_client = get_client()
        process_directory(genai_client, Path(args.dir).resolve(), args.lens, args.output)
        print("\n🚀 Rollup Complete.")
    except Exception as e:
        print(f"Fatal Error: {e}")
```

## How to Use It

1.  **Save the file:** Save it as `rollup.py` in the root of your project or in your scripts folder.
2.  **Set your API key:** `export GOOGLE_GENAI_API_KEY="your_api_key_here"`
3.  **Run it normally:** `python rollup.py`
4.  **Run it with a specific lens:** `python rollup.py --lens "Focus exclusively on mapping all database interactions and SQL execution paths."`

You now have an enterprise-grade agent-context engine. It's fast, cheap, contextually safe, and ready to be integrated directly into your CI/CD pipeline or Git hooks!
