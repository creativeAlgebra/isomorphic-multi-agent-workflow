#!/usr/bin/env python3
"""
IMAW CLI — Interactive terminal interface for the Isomorphic Multi-Agent Workflow.
Inspired by the Claude Code UX: branded welcome screen, arrow-key menus, rich output.

Usage:
    python cli.py
"""

import os
import sys
import textwrap
import time
import re
import threading

# ── Rich + InquirerPy Imports ──────────────────────────────────────────────
try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.markdown import Markdown
    from rich.syntax import Syntax
    from rich.text import Text
    from rich.rule import Rule
    from rich.spinner import Spinner
    from rich.live import Live
    from rich.table import Table
    from rich.theme import Theme
    from rich import box
    HAS_RICH = True
except ImportError:
    HAS_RICH = False

try:
    from InquirerPy import inquirer
    from InquirerPy.separator import Separator
    HAS_INQUIRER = True
except ImportError:
    HAS_INQUIRER = False

# ── IMAW Engine Imports ───────────────────────────────────────────────────
import imaw

# ── Constants ─────────────────────────────────────────────────────────────
VERSION = imaw.__version__

AMBER = "#D4845A"

LOGO = """
 ██╗███╗   ███╗ █████╗ ██╗    ██╗
 ██║████╗ ████║██╔══██╗██║    ██║
 ██║██╔████╔██║███████║██║ █╗ ██║
 ██║██║╚██╔╝██║██╔══██║██║███╗██║
 ██║██║ ╚═╝ ██║██║  ██║╚███╔███╔╝
 ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝
"""

DEMO_SOURCE = (
    "The TCP/IP Handshake (Three-way Handshake). "
    "A client node sends a SYN (synchronize) packet to the server to initiate a connection. "
    "The server receives the SYN and responds with a SYN-ACK (synchronize-acknowledge) packet. "
    "Finally, the client receives the SYN-ACK and sends an ACK (acknowledge) packet back to the server. "
    "Only after these three steps are complete is a secure, reliable communication channel established."
)
DEMO_TARGET = "Formal diplomacy and negotiation between two rival medieval castles across a valley."


# ══════════════════════════════════════════════════════════════════════════
# CONSOLE SETUP
# ══════════════════════════════════════════════════════════════════════════

if HAS_RICH:
    custom_theme = Theme({
        "info": "bold bright_cyan",
        "warning": "bold yellow",
        "danger": "bold red",
        "success": "bold green",
        "muted": "dim white",
        "highlight": "bold white",
        "agent": "bold magenta",
    })
    console = Console(theme=custom_theme)
else:
    console = None


# ══════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════

# Step-aware witticisms per agent
AGENT_QUIPS = {
    "decompose": [
        "Stripping domain vocabulary",
        "Extracting pure relational logic",
        "Reducing to abstract skeleton",
        "Identifying entities and rules",
    ],
    "mapping": [
        "Building 1:1 translation dictionary",
        "Projecting entities onto the metaphor",
        "Ensuring isomorphic fidelity",
        "Verifying structural preservation",
    ],
    "synthesis": [
        "Assembling narrative from mapped logic",
        "Enforcing zero-leakage synthesis",
        "Composing the lesson in-character",
        "Weaving metaphor around structure",
    ],
    "decode_key": [
        "Building the Rosetta Stone",
        "Mapping metaphor back to reality",
        "Creating the side-by-side guide",
        "Bridging two worlds",
    ],
    "tutor": [
        "Reverse-translating your question",
        "Consulting the technical oracle",
        "Forward-translating into metaphor",
        "Staying in character",
    ],
}


def run_with_dots(label: str, quip_key: str, func, *args, **kwargs):
    """
    Run `func` in a background thread while animating dots + a witty message.
    Dots cycle one-by-one:  ·  →  ··  →  ···  →  (blank)  →  repeat
    Returns the function's result. Raises any exception from the function.
    """
    import random
    quips = AGENT_QUIPS.get(quip_key, ["Working"])
    quip = random.choice(quips)

    result_box = [None]
    error_box = [None]
    done = threading.Event()

    def worker():
        try:
            result_box[0] = func(*args, **kwargs)
        except Exception as e:
            error_box[0] = e
        finally:
            done.set()

    t = threading.Thread(target=worker, daemon=True)
    t.start()

    # ANSI colors: bold magenta for label, bold white for text, bright cyan for dots
    MAGENTA = "\033[1;35m"
    WHITE = "\033[1;37m"
    CYAN = "\033[1;96m"
    RESET = "\033[0m"

    dot_frames = ["", "·", "··", "···"]
    frame = 0
    while not done.is_set():
        dots = dot_frames[frame % 4]
        pad = " " * (3 - len(dots))
        line = f"\r  {MAGENTA}{label}{RESET}  {WHITE}{quip}{RESET} {CYAN}{dots}{pad}{RESET}"
        sys.stdout.write(line)
        sys.stdout.flush()
        frame += 1
        done.wait(timeout=0.4)

    # Clear the dots line
    sys.stdout.write("\r" + " " * 80 + "\r")
    sys.stdout.flush()

    if error_box[0]:
        raise error_box[0]

    return result_box[0]


def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


def check_api_key() -> bool:
    """Returns True if the API key is set."""
    return bool(os.environ.get("GOOGLE_GENAI_API_KEY"))


def get_input(prompt_text: str, hint: str = "") -> str:
    """Get a single-line input from the user. Clear and obvious: type, press Enter."""
    if HAS_RICH:
        console.print(f"\n[highlight]{prompt_text}[/highlight]")
        if hint:
            console.print(f"[muted]  {hint}[/muted]")
    else:
        print(f"\n{prompt_text}")
        if hint:
            print(f"  {hint}")

    result = input("  › ").strip()

    if not result:
        if HAS_RICH:
            console.print("[warning]Input cannot be empty. Try again.[/warning]")
        else:
            print("Input cannot be empty. Try again.")
        return get_input(prompt_text, hint)

    return result


def run_pipeline_with_progress(source: str, target: str) -> dict:
    """Run the full IMAW pipeline (4 agents) with animated per-agent loading."""
    from agents.decomposition import decompose
    from agents.mapping import map_isomorphism
    from agents.compiler import synthesize_lesson
    from agents.decode_key import generate_decode_key

    def done_msg(msg: str):
        if HAS_RICH:
            console.print(f"  [success]{msg}[/success]")
        else:
            print(f"  {msg}")

    def fail_msg(msg: str):
        if HAS_RICH:
            console.print(f"  [danger]{msg}[/danger]")
        else:
            print(f"  {msg}")

    if HAS_RICH:
        console.print(Rule("[agent]IMAW Pipeline[/agent]", style="magenta"))
    else:
        print("\n── IMAW Pipeline ──")

    # ── Agent 1: Decomposition ──
    try:
        abstract_schema_json = run_with_dots("Agent 1 ⬡", "decompose", decompose, source)
    except Exception as e:
        fail_msg(f"✗ Agent 1 failed: {e}")
        raise
    done_msg("✓ Agent 1 — Decomposition complete")

    # ── Agent 2: Mapping ──
    try:
        mapping_json = run_with_dots("Agent 2 ⬡", "mapping", map_isomorphism, abstract_schema_json, target)
    except Exception as e:
        fail_msg(f"✗ Agent 2 failed: {e}")
        raise
    done_msg("✓ Agent 2 — Mapping complete")

    # ── Agent 3: Synthesis ──
    try:
        final_lesson = run_with_dots("Agent 3 ⬡", "synthesis", synthesize_lesson, target, mapping_json)
    except Exception as e:
        fail_msg(f"✗ Agent 3 failed: {e}")
        raise
    done_msg("✓ Agent 3 — Synthesis complete")

    # ── Agent 4: Decode Key ──
    try:
        decode_key = run_with_dots("Agent 4 ⬡", "decode_key", generate_decode_key, source, target, mapping_json, final_lesson)
    except Exception as e:
        fail_msg(f"✗ Agent 4 failed: {e}")
        raise
    done_msg("✓ Agent 4 — Decode Key complete")

    if HAS_RICH:
        console.print("[success]\n✓ Pipeline complete.[/success]\n")
    else:
        print("\n✓ Pipeline complete.\n")

    # Build prompt summaries for transparency
    prompt_summaries = (
        f"── Agent 1 (Decomposition) ──\n"
        f"Received: The raw source concept ({len(source)} chars).\n"
        f"Task: Strip all domain jargon → output pure abstract schema (entities, relationships, rules).\n"
        f"Blind to: Target metaphor.\n\n"
        f"── Agent 2 (Mapping) ──\n"
        f"Received: Abstract schema from Agent 1 + target metaphor name.\n"
        f"Task: Build a 1:1 translation dictionary mapping abstract entities → metaphor entities.\n"
        f"Blind to: Original source concept.\n\n"
        f"── Agent 3 (Synthesis) ──\n"
        f"Received: Target metaphor + mapping dictionary from Agent 2.\n"
        f"Task: Compose a pedagogical lesson entirely within the metaphor.\n"
        f"Blind to: Original source concept AND abstract schema.\n\n"
        f"── Agent 4 (Decode Key) ──\n"
        f"Received: Source concept, metaphor, mapping dictionary, and final lesson.\n"
        f"Task: Generate side-by-side reference mapping metaphor elements back to reality.\n"
    )

    return {
        "lesson": final_lesson,
        "abstract_schema": abstract_schema_json,
        "mapping": mapping_json,
        "decode_key": decode_key,
        "prompt_summaries": prompt_summaries,
    }


def display_artifact(title: str, content: str, lang: str = "json"):
    """Display a pipeline artifact in a styled panel."""
    if HAS_RICH:
        if lang == "markdown":
            renderable = Markdown(content)
        elif lang == "json":
            renderable = Syntax(content, "json", theme="monokai", word_wrap=True)
        else:
            renderable = Text(content)
        console.print(Panel(renderable, title=f"[agent]{title}[/agent]", border_style="magenta", padding=(1, 2)))
    else:
        print(f"\n{'─' * 60}")
        print(f"  {title}")
        print(f"{'─' * 60}")
        print(textwrap.indent(content, "    "))
        print(f"{'─' * 60}\n")


def save_experiment(source: str, target: str, results: dict, chat_log: list | None = None) -> str:
    """Persist all pipeline artifacts to an outputs/ folder. Returns the folder path."""
    os.makedirs("outputs", exist_ok=True)
    timestamp = int(time.time())
    clean_title = re.sub(r"[^a-zA-Z0-9]", "_", target.split()[0].lower()[:15])
    exp_dir = f"outputs/experiment_{timestamp}_{clean_title}"
    os.makedirs(exp_dir, exist_ok=True)

    with open(os.path.join(exp_dir, "0_inputs.txt"), "w") as f:
        f.write(f"SOURCE CONCEPT:\n{source}\n\nTARGET METAPHOR:\n{target}\n")
    with open(os.path.join(exp_dir, "0_prompt_summaries.txt"), "w") as f:
        f.write(results.get("prompt_summaries", ""))
    with open(os.path.join(exp_dir, "1_abstract_schema.json"), "w") as f:
        f.write(results["abstract_schema"])
    with open(os.path.join(exp_dir, "2_isomorphic_mapping.json"), "w") as f:
        f.write(results["mapping"])
    with open(os.path.join(exp_dir, "3_final_lesson.md"), "w") as f:
        f.write(f"# IMAW Lesson\n\n**Metaphor:** {target}\n\n---\n\n{results['lesson']}")
    with open(os.path.join(exp_dir, "4_decode_key.md"), "w") as f:
        f.write(f"# Decode Key\n\n**Source:** {source[:80]}...\n**Metaphor:** {target}\n\n---\n\n{results.get('decode_key', '')}")

    if chat_log:
        with open(os.path.join(exp_dir, "5_tutor_chat.md"), "w") as f:
            f.write(f"# Tutor Chat Transcript\n\n**Metaphor:** {target}\n\n---\n\n")
            for entry in chat_log:
                f.write(entry)

    return exp_dir


# ══════════════════════════════════════════════════════════════════════════
# WELCOME SCREEN
# ══════════════════════════════════════════════════════════════════════════

def show_welcome():
    """Render the branded welcome + API key status in a single box."""
    clear_screen()

    if HAS_RICH:
        api_line = (
            f"[green]●[/green] [{AMBER}]API Key detected[/{AMBER}]  [dim](GOOGLE_GENAI_API_KEY)[/dim]"
            if check_api_key()
            else f"[red]●[/red] [{AMBER}]No API Key found[/{AMBER}]  [dim]Set GOOGLE_GENAI_API_KEY[/dim]"
        )
        box_content = (
            f"[bold {AMBER}]{LOGO}[/bold {AMBER}]"
            f"  [{AMBER}]Isomorphic Multi-Agent Workflow[/{AMBER}]\n"
            f"  [dim]v{VERSION}  •  Contextual Blindness Engine[/dim]\n\n"
            f"  {api_line}"
        )
        console.print(Panel(
            box_content,
            box=box.HEAVY,
            border_style=AMBER,
            expand=False,
            padding=(1, 4),
        ))
        print()
    else:
        api_status = "● API Key detected (GOOGLE_GENAI_API_KEY)" if check_api_key() else "✗ No API Key — Set GOOGLE_GENAI_API_KEY"
        print("┏" + "━" * 58 + "┓")
        for line in LOGO.strip().split("\n"):
            print(f"┃  {line:<56}┃")
        print(f"┃{'':58}┃")
        print(f"┃  {'Isomorphic Multi-Agent Workflow':<56}┃")
        print(f"┃  {f'v{VERSION}  •  Contextual Blindness Engine':<56}┃")
        print(f"┃{'':58}┃")
        print(f"┃  {api_status:<56}┃")
        print("┗" + "━" * 58 + "┛")
        print()


# ══════════════════════════════════════════════════════════════════════════
# MAIN MENU
# ══════════════════════════════════════════════════════════════════════════

def main_menu() -> str:
    """Present the main menu via numbered input. Returns the user's choice."""
    menu_text = (
        "  [1]  🔬  See It Work      —  Run a demo through the full pipeline\n"
        "  [2]  🎓  Explore a Topic  —  Translate your own concept\n"
        "  [0]  ❌  Exit"
    )

    if HAS_RICH:
        console.print(Panel(
            menu_text,
            title="[agent]What would you like to do?[/agent]",
            border_style="magenta",
            padding=(1, 2),
        ))
    else:
        print("\n  What would you like to do?\n")
        print("    [1]  See It Work")
        print("    [2]  Explore a Topic")
        print("    [0]  Exit")

    while True:
        pick = input("\n  Enter choice › ").strip()
        if pick == "1":
            return "demo"
        elif pick == "2":
            return "tutor"
        elif pick == "0":
            return "exit"
        if HAS_RICH:
            console.print("[warning]  Invalid choice. Enter 0-2.[/warning]")
        else:
            print("  Invalid choice. Enter 0-2.")


# ══════════════════════════════════════════════════════════════════════════
# TUTOR CHAT (reusable)
# ══════════════════════════════════════════════════════════════════════════

def run_tutor_chat(source, target, results, chat_log):
    """Run the Double-Translation Loop chat session. Appends to chat_log in-place."""
    if HAS_RICH:
        console.print(Rule("[agent]Isomorphic Tutor — Double-Translation Loop[/agent]", style="magenta"))
        console.print(
            "[info]The mapping structure is loaded in memory.\n"
            "Ask follow-up questions and the tutor will respond strictly within the metaphor.\n"
            "Type [bold]exit[/bold] or [bold]quit[/bold] to return.[/info]\n"
        )
    else:
        print("\n" + "=" * 60)
        print("  ISOMORPHIC TUTOR — Double-Translation Loop")
        print("=" * 60)
        print("The mapping structure is loaded in memory.")
        print("Ask follow-up questions within the metaphor.")
        print("Type 'exit' or 'quit' to return.\n")

    session = imaw.TutorSession(
        source, target, results["abstract_schema"], results["mapping"]
    )

    while True:
        if HAS_RICH:
            console.print("[highlight]you >[/highlight] ", end="")
        else:
            print("you > ", end="")

        try:
            user_q = input().strip()
        except (EOFError, KeyboardInterrupt):
            break

        if not user_q:
            continue
        if user_q.lower() in ("exit", "quit"):
            break

        try:
            reply = run_with_dots("Tutor ⬡", "tutor", session.add_user_message, user_q)
        except Exception as e:
            if HAS_RICH:
                console.print(f"  [danger]Error: {e}[/danger]")
            else:
                print(f"Error: {e}")
            continue

        if HAS_RICH:
            console.print(Panel(
                Markdown(reply),
                title="[agent]Tutor[/agent]",
                border_style="magenta",
                padding=(1, 2),
            ))
        else:
            print(f"\n{'=' * 50}")
            print(f"  Tutor:")
            print(textwrap.indent(reply, "    "))
            print(f"{'=' * 50}\n")

        chat_log.append(f"**You:** {user_q}\n\n**Tutor:** {reply}\n\n---\n\n")


# ══════════════════════════════════════════════════════════════════════════
# SESSION MENU (artifacts + chat + export)
# ══════════════════════════════════════════════════════════════════════════

def inspect_artifacts(source, target, results, chat_log):
    """Browse artifacts, launch tutor chat, or export session."""
    menu_text = (
        "  [1]  Prompt Summaries    (What each agent received)\n"
        "  [2]  Abstract Schema     (Agent 1 — Decomposition)\n"
        "  [3]  Mapping Dictionary  (Agent 2 — Mapping)\n"
        "  [4]  Final Lesson        (Agent 3 — Synthesis)\n"
        "  [5]  Decode Key          (Agent 4 — Side-by-Side Guide)\n"
        "  [6]  Show All Artifacts\n"
        "  [7]  Continue Exploring  (Double-Translation Loop)\n"
        "  [8]  Export Session      (Save all files to folder)\n"
        "  [0]  Back to Main Menu"
    )

    while True:
        if HAS_RICH:
            console.print(Panel(
                menu_text,
                title="[agent]Session Menu[/agent]",
                border_style="magenta",
                padding=(1, 2),
            ))
        else:
            print("\n  Session Menu:")
            print(menu_text)

        pick = input("\n  Enter choice > ").strip()

        if pick == "0":
            break
        elif pick == "1":
            display_artifact("Prompt Summaries", results.get("prompt_summaries", "N/A"), "text")
        elif pick == "2":
            display_artifact("Agent 1 — Abstract Schema", results["abstract_schema"], "json")
        elif pick == "3":
            display_artifact("Agent 2 — Mapping Dictionary", results["mapping"], "json")
        elif pick == "4":
            display_artifact("Agent 3 — Final Lesson", results["lesson"], "markdown")
        elif pick == "5":
            display_artifact("Agent 4 — Decode Key", results.get("decode_key", "N/A"), "markdown")
        elif pick == "6":
            display_artifact("Prompt Summaries", results.get("prompt_summaries", "N/A"), "text")
            display_artifact("Agent 1 — Abstract Schema", results["abstract_schema"], "json")
            display_artifact("Agent 2 — Mapping Dictionary", results["mapping"], "json")
            display_artifact("Agent 3 — Final Lesson", results["lesson"], "markdown")
            display_artifact("Agent 4 — Decode Key", results.get("decode_key", "N/A"), "markdown")
        elif pick == "7":
            run_tutor_chat(source, target, results, chat_log)
        elif pick == "8":
            exp_dir = save_experiment(source, target, results, chat_log if chat_log else None)
            abs_path = os.path.abspath(exp_dir)
            if HAS_RICH:
                console.print(f"\n[success]Exported to:[/success] [highlight]{abs_path}/[/highlight]")
                file_list = "inputs, prompts, schema, mapping, lesson, decode_key"
                if chat_log:
                    file_list += ", chat"
                console.print(f"[muted]   Files: {file_list}[/muted]\n")
            else:
                print(f"\nExported to: {abs_path}/")
                print(f"   Files: inputs, prompts, schema, mapping, lesson, decode_key" + (", chat" if chat_log else "") + "\n")
        else:
            if HAS_RICH:
                console.print("[warning]  Invalid choice. Enter 0-8.[/warning]")
            else:
                print("  Invalid choice. Enter 0-8.")


# ══════════════════════════════════════════════════════════════════════════
# DEMO MODE
# ══════════════════════════════════════════════════════════════════════════

def demo_mode():
    """Run the hardcoded example through the live pipeline."""
    if HAS_RICH:
        console.print(Rule("[agent]Demo Mode[/agent]", style="magenta"))
        console.print(Panel(
            f"[highlight]Source:[/highlight] {DEMO_SOURCE}\n\n"
            f"[highlight]Target:[/highlight] {DEMO_TARGET}",
            title="[info]Pre-loaded Example[/info]",
            border_style="dim",
            padding=(1, 2),
        ))
    else:
        print("\n" + "=" * 60)
        print("  DEMO MODE")
        print("=" * 60)
        print(f"\n  Source: {DEMO_SOURCE}")
        print(f"  Target: {DEMO_TARGET}\n")

    results = run_pipeline_with_progress(DEMO_SOURCE, DEMO_TARGET)
    display_artifact("Agent 3 — Final Lesson", results["lesson"], "markdown")

    chat_log = []
    inspect_artifacts(DEMO_SOURCE, DEMO_TARGET, results, chat_log)


# ══════════════════════════════════════════════════════════════════════════
# TUTOR MODE
# ══════════════════════════════════════════════════════════════════════════

def tutor_mode():
    """Full pipeline + Session Menu with artifacts, chat, and export."""
    if HAS_RICH:
        console.print(Rule("[agent]Explore a Topic[/agent]", style="magenta"))
    else:
        print("\n" + "=" * 60)
        print("  EXPLORE A TOPIC")
        print("=" * 60)

    # ── Gather inputs with confirmation loop ──
    while True:
        source = get_input(
            "STEP 1 — Enter your Source Concept",
            hint="e.g., 'How a 4-stroke engine works' or a technical description"
        )
        target = get_input(
            "STEP 2 — Enter your Target Metaphor",
            hint="e.g., 'A busy commercial kitchen' or 'The Wild West'"
        )

        # Show confirmation
        confirm_text = (
            f"  Source:   {source}\n"
            f"  Metaphor: {target}"
        )
        if HAS_RICH:
            console.print(Panel(
                confirm_text,
                title="[info]Confirm Your Inputs[/info]",
                border_style="dim",
                padding=(1, 2),
            ))
        else:
            print(f"\n  Source:   {source}")
            print(f"  Metaphor: {target}\n")

        confirm_menu = "  [1] Run Pipeline    [2] Re-enter    [0] Cancel"
        if HAS_RICH:
            console.print(f"[muted]{confirm_menu}[/muted]")
        else:
            print(confirm_menu)

        pick = input("\n  Enter choice > ").strip()
        if pick == "1":
            break  # proceed to pipeline
        elif pick == "0":
            return  # back to main menu
        # else: loop back to re-enter

        if HAS_RICH:
            console.print("[info]Let's try again.[/info]\n")
        else:
            print("  Let's try again.\n")

    results = run_pipeline_with_progress(source, target)
    display_artifact("Agent 3 — Final Lesson", results["lesson"], "markdown")

    chat_log = []
    inspect_artifacts(source, target, results, chat_log)



# ══════════════════════════════════════════════════════════════════════════
# MAIN LOOP
# ══════════════════════════════════════════════════════════════════════════

def main():
    # Pre-flight: check for rich/inquirer
    if not HAS_RICH:
        print("[!] 'rich' not installed. Install with: pip install rich")
        print("    Running in plain-text fallback mode.\n")
    if not HAS_INQUIRER:
        print("[!] 'InquirerPy' not installed. Install with: pip install InquirerPy")
        print("    Running with numbered menus as fallback.\n")

    while True:
        show_welcome()

        # Pre-flight: API key
        if not check_api_key():
            if HAS_RICH:
                console.print(Panel(
                    "[danger]GOOGLE_GENAI_API_KEY is not set.[/danger]\n\n"
                    "[muted]export GOOGLE_GENAI_API_KEY='your-key-here'[/muted]",
                    title="⚠️  Missing API Key",
                    border_style="red",
                    padding=(1, 2),
                ))
            else:
                print("⚠️  GOOGLE_GENAI_API_KEY is not set.")
                print("   export GOOGLE_GENAI_API_KEY='your-key-here'\n")
            input("Press Enter to exit...")
            sys.exit(1)

        try:
            choice = main_menu()
        except KeyboardInterrupt:
            print()
            break

        if choice == "demo":
            try:
                demo_mode()
            except KeyboardInterrupt:
                if HAS_RICH:
                    console.print("\n[warning]Demo interrupted.[/warning]")
                else:
                    print("\nDemo interrupted.")
        elif choice == "tutor":
            try:
                tutor_mode()
            except KeyboardInterrupt:
                if HAS_RICH:
                    console.print("\n[warning]Tutor session interrupted.[/warning]")
                else:
                    print("\nTutor session interrupted.")
        elif choice == "exit":
            break

    if HAS_RICH:
        console.print("\n[muted]Goodbye.[/muted]\n")
    else:
        print("\nGoodbye.\n")


if __name__ == "__main__":
    main()
