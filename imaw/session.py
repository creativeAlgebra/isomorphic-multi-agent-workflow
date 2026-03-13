from .agents.tutor import get_chat_response, detect_out_of_schema, expand_schema

class TutorSession:
    """
    Manages the conversational Phase 2 state of an IMAW workflow.
    Once a lesson is generated, this class is instantiated to hold the 
    mapping logic in memory, allowing users to chat within the metaphor.
    
    Supports Adaptive Schema Expansion: when a user asks about material
    beyond the original source, the session runs a scoped mini-pipeline
    to decompose + map only the new sub-concepts, preserving Contextual
    Blindness and appending new entries to the mapping dictionary.
    """
    def __init__(self, source_concept: str, target_metaphor: str, 
                 abstract_schema: str, mapping: str,
                 auto_expand: bool = True):
        self.source_concept = source_concept
        self.target_metaphor = target_metaphor
        self.abstract_schema = abstract_schema
        self.mapping = mapping
        self.chat_history = []
        self.auto_expand = auto_expand
        self.expansion_log = []  # Track all schema expansions for debugging
        
    def add_user_message(self, message: str) -> str:
        """
        Processes a single user message through the double-translation logic.
        If auto_expand is enabled, detects out-of-schema questions and
        expands the mapping dictionary before responding.
        """
        # Append to history
        self.chat_history.append(f"User Question: {message}")
        
        # We need the full chat context to pass to the tutor agents
        chat_context = "\n".join(self.chat_history)
        
        # Execute the double translation
        results = get_chat_response(
            chat_context, 
            self.source_concept, 
            self.target_metaphor, 
            self.mapping
        )
        
        # Check for out-of-schema material and expand if needed
        if self.auto_expand:
            schema_check = detect_out_of_schema(
                results["technical_answer"],
                self.abstract_schema,
                self.source_concept
            )
            
            if schema_check.get("out_of_schema", False):
                new_material = schema_check.get("new_source_material", "")
                if new_material:
                    expansion = expand_schema(
                        new_material,
                        self.abstract_schema,
                        self.mapping,
                        self.target_metaphor
                    )
                    
                    # Update session state with expanded schema + mapping
                    self.abstract_schema = expansion["expanded_schema"]
                    self.mapping = expansion["expanded_mapping"]
                    
                    # Log the expansion
                    self.expansion_log.append({
                        "turn": len(self.chat_history),
                        "trigger": message,
                        "new_entities": expansion["new_entities_added"],
                        "explanation": schema_check.get("explanation", ""),
                    })
                    
                    # Re-run the forward translation with the expanded mapping
                    # so the response uses the new vocabulary
                    results = get_chat_response(
                        chat_context,
                        self.source_concept,
                        self.target_metaphor,
                        self.mapping  # Now expanded
                    )
        
        tutor_response = results["tutor_reply"]
        self.chat_history.append(f"Tutor Analogy Answer: {tutor_response}")
        
        return tutor_response
    
    def get_expansion_log(self) -> list:
        """Returns the log of all schema expansions that occurred during the session."""
        return self.expansion_log
    
    def get_current_mapping(self) -> str:
        """Returns the current (potentially expanded) mapping dictionary."""
        return self.mapping
    
    def get_raw_state(self) -> dict:
        """Helper to retrieve internal agent outputs for debugging."""
        return {
            "source": self.source_concept,
            "metaphor": self.target_metaphor,
            "schema": self.abstract_schema,
            "mapping": self.mapping,
            "history": self.chat_history,
            "expansions": self.expansion_log,
        }
