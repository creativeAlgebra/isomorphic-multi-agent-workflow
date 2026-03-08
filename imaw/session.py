from .agents.tutor import get_chat_response

class TutorSession:
    """
    Manages the conversational Phase 2 state of an IMAW workflow.
    Once a lesson is generated, this class is instantiated to hold the 
    mapping logic in memory, allowing users to chat within the metaphor.
    """
    def __init__(self, source_concept: str, target_metaphor: str, abstract_schema: str, mapping: str):
        self.source_concept = source_concept
        self.target_metaphor = target_metaphor
        self.abstract_schema = abstract_schema
        self.mapping = mapping
        self.chat_history = []
        
    def add_user_message(self, message: str) -> str:
        """
        Processes a single user message through the double-translation logic.
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
        
        tutor_response = results["tutor_reply"]
        
        self.chat_history.append(f"Tutor Analogy Answer: {tutor_response}")
        
        return tutor_response
    
    def get_raw_state(self) -> dict:
        """Helper to retrieve internal agent outputs for debugging."""
        return {
            "source": self.source_concept,
            "metaphor": self.target_metaphor,
            "history": self.chat_history
        }
