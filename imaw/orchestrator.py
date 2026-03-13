from .agents.decomposition import decompose
from .agents.mapping import map_isomorphism
from .agents.compiler import synthesize_lesson
from .agents.decode_key import generate_decode_key

class IMAWOrchestrator:
    """
    The orchestrator manages the rigid Contextual Blindness pipeline for one-shot generations.
    It passes data sequentially through the 4-agent chain:
      1. Decompose  — strips domain jargon to pure abstract schema
      2. Map        — builds 1:1 translation dictionary (blind to source)
      3. Synthesize  — assembles lesson within the metaphor (blind to source)
      4. Decode Key  — generates the Rosetta Stone bridging artifact
    """
    @staticmethod
    def generate_lesson(source_concept: str, target_metaphor: str, include_decode_key: bool = True) -> dict:
        """
        Executes the entire IMAW pipeline from start to finish.
        
        Args:
            source_concept: The technical or complex idea to be taught.
            target_metaphor: The creative domain to map the concept onto.
            include_decode_key: If True, generates the Decode Key (Agent 4).
                Set to False for leakage-testing scenarios where only
                the metaphorical output matters.
            
        Returns:
            dict with keys: lesson, abstract_schema, mapping, decode_key (or None).
        """
        # Agent 1: Pure logical extraction (blind to target metaphor)
        abstract_schema_json = decompose(source_concept)
        
        # Agent 2: Domain translation mapping (blind to source concept)
        mapping_json = map_isomorphism(abstract_schema_json, target_metaphor)
        
        # Agent 3: Synthesized output (blind to source concept)
        final_lesson = synthesize_lesson(target_metaphor, mapping_json)
        
        # Agent 4: Decode Key — Rosetta Stone pedagogical artifact (full context)
        decode_key = None
        if include_decode_key:
            decode_key = generate_decode_key(
                source_concept, target_metaphor, mapping_json, final_lesson
            )
        
        return {
            "lesson": final_lesson,
            "abstract_schema": abstract_schema_json,
            "mapping": mapping_json,
            "decode_key": decode_key,
        }

# For simpler top-level use cases
def generate_lesson(source_concept: str, target_metaphor: str) -> str:
    result = IMAWOrchestrator.generate_lesson(source_concept, target_metaphor, include_decode_key=False)
    return result["lesson"]
