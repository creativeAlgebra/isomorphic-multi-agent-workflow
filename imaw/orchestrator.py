from .agents.decomposition import decompose
from .agents.mapping import map_isomorphism
from .agents.compiler import synthesize_lesson

class IMAWOrchestrator:
    """
    The orchestrator manages the rigid Contextual Blindness pipeline for one-shot generations.
    It passes data sequentially through the 3-agent chain.
    """
    @staticmethod
    def generate_lesson(source_concept: str, target_metaphor: str) -> dict:
        """
        Executes the entire IMAW pipeline from start to finish.
        
        Args:
            source_concept (str): The technical or complex idea to be taught.
            target_metaphor (str): The creative domain to map the concept onto.
            
        Returns:
            dict: The resulting lesson, the mapping logic, and the abstract schema.
        """
        # Phase 1: Pure logical extraction
        abstract_schema_json = decompose(source_concept)
        
        # Phase 2: Domain translation mapping
        mapping_json = map_isomorphism(abstract_schema_json, target_metaphor)
        
        # Phase 3: Synthesized output
        final_lesson = synthesize_lesson(source_concept, target_metaphor, mapping_json)
        
        return {
            "lesson": final_lesson,
            "abstract_schema": abstract_schema_json,
            "mapping": mapping_json
        }

# For simpler top-level use cases
def generate_lesson(source_concept: str, target_metaphor: str) -> str:
    result = IMAWOrchestrator.generate_lesson(source_concept, target_metaphor)
    return result["lesson"]
