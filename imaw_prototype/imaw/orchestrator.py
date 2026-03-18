from .agents.decomposition import decompose
from .agents.mapping import map_isomorphism
from .agents.compiler import synthesize_operational_output
from .agents.decode_key import generate_decode_key
from .agents.validation import validate_decomposition
from .agents.vocabulary import extract_vocabulary

class IMAWOrchestrator:
    """
    The orchestrator manages the rigid Contextual Blindness pipeline for one-shot generations.
    It passes data sequentially through the agent chain:
      0. Vocabulary  — extracts domain-specific terms from source (v1.2)
      1. Decompose   — strips domain jargon to pure abstract schema
      1.5 Validate   — gate that rejects schemas containing source jargon
      2. Map         — builds 1:1 translation dictionary (blind to source)
      3. Synthesize   — assembles operational output within the metaphor (blind to source)
      4. Decode Key   — generates the Rosetta Stone bridging artifact
    """
    @staticmethod
    def generate_operational_output_stage1(source_logic: str, target_domain: str,
                               use_vocabulary_extraction: bool = True) -> dict:
        """Runs the pipeline up to the Mapping phase (Agent 2)."""
        domain_vocabulary = extract_vocabulary(source_logic) if use_vocabulary_extraction else None
        abstract_schema_json = decompose(source_logic)
        abstract_schema_json = validate_decomposition(
            source_logic, abstract_schema_json,
            domain_vocabulary=domain_vocabulary
        )
        mapping_json = map_isomorphism(abstract_schema_json, target_domain)
        
        return {
            "abstract_schema": abstract_schema_json,
            "mapping": mapping_json,
            "domain_vocabulary": domain_vocabulary,
        }

    @staticmethod
    def generate_operational_output_stage2(source_logic: str, target_domain: str, mapping_json: str,
                               include_decode_key: bool = True) -> dict:
        """Runs the Synthesis (with Contextual Anchoring) and Decode Key phases."""
        final_operational_output = synthesize_operational_output(target_domain, mapping_json, source_logic=source_logic)
        decode_key = generate_decode_key(
            source_logic, target_domain, mapping_json, final_operational_output
        ) if include_decode_key else None
        
        return {
            "operational output": final_operational_output,
            "decode_key": decode_key,
        }

    @staticmethod
    def generate_operational_output(source_logic: str, target_domain: str,
                        include_decode_key: bool = True,
                        use_vocabulary_extraction: bool = True) -> dict:
        """
        Executes the entire IMAW pipeline from start to finish continuously.
        """
        stage1_results = IMAWOrchestrator.generate_operational_output_stage1(
            source_logic, target_domain, use_vocabulary_extraction
        )
        
        # In strict one-shot mode, we pass None for source_logic to maintain absolute blindness.
        final_operational_output = synthesize_operational_output(target_domain, stage1_results["mapping"])
        
        decode_key = None
        if include_decode_key:
            decode_key = generate_decode_key(
                source_logic, target_domain, stage1_results["mapping"], final_operational_output
            )

        return {
            "operational_output": final_operational_output,
            "abstract_schema": stage1_results["abstract_schema"],
            "mapping": stage1_results["mapping"],
            "decode_key": decode_key,
            "domain_vocabulary": stage1_results["domain_vocabulary"],
        }

# For simpler top-level use cases
def generate_operational_output(source_logic: str, target_domain: str) -> str:
    result = IMAWOrchestrator.generate_operational_output(source_logic, target_domain, include_decode_key=False)
    return result["operational_output"]

