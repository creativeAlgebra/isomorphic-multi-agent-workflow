# [IMAW Falsification Report]
> 100% Structural Fidelity, 0% Semantic Leakage — Falsified

## 1. Contextual Blindness Mathematical Guarantee
**Finding: Falsified.**
"Contextual Blindness" mathematically guarantees zero leakage *only if the intervening state objects are perfectly sanitized*. While it is true that Agent 3 (Synthesis) is strictly blind to the source—receiving only the JSON mapping and `source_logic=None` within the one-shot `IMAWOrchestrator.generate_operational_output()`, the guarantee collapses if the schema itself is contaminated.

The pipeline logic breaks down at the **Decomposition and Validation stages** (Agents 1 and 1.5). Because jargon like "biomarker", "Adverse Reaction", and "Clinical Trial Protocol" are not reliably caught by the Validation Gate, they survive into the `abstract_schema` and subsequently the `mapping` dictionary. Agent 3 then dutifully generates those exact words because they were embedded in its instructions via the mapping. The architecture does *not* mathematically guarantee zero leakage, as the gatekeepers (Agents 0 and 1.5) are probabilistic LLM calls susceptible to error. 

## 2. Independent Monolithic Baseline testing
**Finding: 33% Leakage Rate (Match)**
We ran the Monolithic Control against the 3 Enterprise Test Concepts using Gemini 2.5 Pro. The monolithic model achieved a 33% leakage rate (1 out of 3 leaked).
- **Concept 1 (Legal -> Sales):** LEAKED the word "capped" (Failure)
- **Concept 2 (AWS -> SOC2):** Clean (Success)
- **Concept 3 (Medical -> Consumer):** Clean (Success)

## 3. The IMAW Framework Empirical Falsification
**Finding: 33% Leakage Rate (Falsified)**
The human engineer claimed a 0% leakage rate for the IMAW engine on this enterprise test suite. In our independent run, the IMAW pipeline achieved a 33% Leakage rate.
- **Concept 1:** Clean (Success)
- **Concept 2:** Clean (Success)
- **Concept 3 (Medical -> Consumer):** LEAKED semantic jargon: `Clinical Trial Protocol; Therapeutic Efficacy Endpoint; biomarker; Adverse Reaction; Withdrawal Criterion`

**Conclusion:** 
The core empirical claim is falsified. The 4-agent state-passing pipeline does not currently eliminate leakage. The strict mechanical rules rely on perfect jargon sanitization prior to mapping, which the current LLM vocabulary-extractor and validator steps fail to provide unconditionally.
