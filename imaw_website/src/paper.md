
### **Designing and Validating a Generative Control Architecture for Safe Pedagogical Translation**

**Author:** [Randall Garcia](https://www.linkedin.com/in/garciarandall/)  
**Published:** March 8, 2026  
**Revised:** March 13, 2026

### **Abstract**

Large Language Models (LLMs) are increasingly deployed in educational technology to generate analogy-based explanations of complex topics. However, when tasked with translating a technical concept into a creative metaphor, standard LLMs produce opaque outputs: the resulting text cannot be inspected, edited, or structurally verified. If the analogy breaks down — through **Semantic Leakage** (source-domain jargon bleeding into the narrative) or structural infidelity — the failure is invisible and unrecoverable. This paper introduces the **Isomorphic Multi-Agent Workflow (IMAW)**, a Generative Control Architecture that gives practitioners structured, navigable control over metaphor construction through a design principle called **Contextual Blindness** — the physical isolation of agents so that no single agent handles both the technical source and the creative output simultaneously. The architecture employs a four-agent pipeline (Decompose, Map, Synthesize, Decode Key) that produces inspectable intermediate artifacts — an abstract schema, a locked translation dictionary, and a decode key — at each stage. It extends to an interactive **Double-Translation Loop** for sustained, multi-turn educational dialogue within the metaphor. We present automated empirical validation comparing the IMAW pipeline against a monolithic LLM across 50 diverse concepts, graded by an independent LLM-as-Judge using both binary and calibrated two-tier assessment rubrics. We posit three core claims: (1) IMAW converts opaque, probabilistic failure into localized, diagnosable failure — enabling targeted remediation that monolithic architectures cannot support; (2) IMAW trades computational efficiency for structural inspectability and iterative improvability; and (3) the Double-Translation Loop enables sustained, safe, multi-turn educational roleplay.

---

### **1. Introduction**

When a Large Language Model is asked to explain a complex concept through the lens of a metaphor, it produces a single block of text — an essay. The analogy may be well-written and structurally sound. But the output is *opaque*: there is no mapping dictionary the practitioner can inspect, no structural schema they can audit, no decode key they can hand a learner as a reference card. If the analogy breaks down — through vocabulary contamination, structural drift, or a mapping that doesn't hold — the failure is invisible. The practitioner's only recourse is to re-roll the entire prompt and hope for a better result.

This is the fundamental limitation of monolithic LLM-based metaphor generation. The problem is not that the model produces *bad* analogies — frontier models are often impressively good — but that it produces *disposable* ones. The output cannot be decomposed into inspectable parts, edited at the mapping level, or reused across conversational turns with guaranteed consistency. The metaphor is a black box with a single surface: the essay.

During the development of this architecture, we encountered a specific symptom of this opacity: **Semantic Leakage** — source-domain jargon bleeding into the metaphorical narrative (e.g., *"The Concierge Desk (`kube-apiserver`) handles all requests"*). In educational contexts, this breaks the cognitive scaffolding the metaphor was designed to provide. Leakage prompted the initial design of the multi-agent pipeline, but as the work progressed, it became clear that leakage is a symptom of a deeper structural problem — the absence of inspectable intermediate artifacts — not the central problem itself.

This paper proposes the **Isomorphic Multi-Agent Workflow (IMAW)** as a **Generative Control Architecture** that addresses this structural gap. The workflow is *isomorphic* in the mathematical sense: the Decomposition Agent extracts a domain-agnostic relational structure — entities, relationships, and rules — that serves as the structural invariant, and the Mapping Agent constructs a structure-preserving bijection onto the target metaphor. The entities and vocabulary change; the relational architecture does not. The 1:1 mapping dictionary produced at each run is, formally, the isomorphism function — and its existence as an inspectable artifact is what makes the translation auditable. Rather than relying on a single model to produce an opaque essay, IMAW distributes the translation task across four physically isolated agents, each operating in a restricted context through a design principle called **Contextual Blindness**. The architecture produces inspectable intermediate artifacts at every stage — an abstract schema, a locked translation dictionary, a synthesized lesson, and a decode key — giving practitioners structured, navigable control over the entire metaphor-construction process. When something goes wrong, the failure is localized to a specific agent and a specific artifact, enabling targeted remediation rather than wholesale regeneration.

This paper proceeds as follows: Section 2 details the four-agent pipeline, the artifact set it produces, and the Double-Translation Loop. Section 3 provides the theoretical framework grounded in information theory and transformer attention mechanics. Section 4 presents our core claims. Section 5 reports empirical validation across 50 concepts. Section 6 addresses limitations and future research.

---

### **2. Methodology: The IMAW Generative Control Architecture**

The IMAW architecture operationalizes the principle of **Contextual Blindness** through a four-agent pipeline executed in strict sequence. Each agent receives only the inputs necessary for its task and is explicitly denied access to information that could contaminate its output. This approach is analogous to prompt chaining in production LLM systems, but with a critical addition: the chain enforces information isolation between stages, not merely sequential processing.

**2.1. Agent 1: The Decomposition Agent (Decompose)**

The first agent ingests the source concept — the complex technical material to be taught — and produces a pure abstract schema. Its task is to strip all domain-specific vocabulary and surface-level details, extracting only the underlying relational structure.

*   **Input:** Complex technical text (the source concept).
*   **Constraint:** Blind to the target metaphor. It does not know what the abstraction will be mapped onto.
*   **Output:** A domain-agnostic JSON schema defining Entities, Relationships, and Rules. For example, "kube-scheduler" becomes "Assignment Unit"; "Pod" becomes "Task Package."

**2.2. Agent 2: The Mapping Agent (Map)**

The Mapping Agent receives the abstract schema from Agent 1 and the target metaphor description. It builds a strict 1:1 translation dictionary mapping every abstract entity to a metaphorical equivalent.

*   **Input:** Abstract JSON schema + Target Metaphor description.
*   **Constraint:** Blind to the original source concept. It never sees the technical domain, only the abstraction. It cannot introduce source-domain vocabulary because it has never been exposed to it.
*   **Output:** A mapping dictionary (e.g., "Assignment Unit" → "Head Butler"; "Task Package" → "Guest Suite Reservation").

**2.3. Agent 3: The Synthesis Agent (Synthesize)**

The Synthesis Agent receives the mapping dictionary and the target metaphor. It assembles the final pedagogical lesson entirely within the metaphor's vocabulary, bound strictly by the mappings.

*   **Input:** Mapping dictionary + Target Metaphor.
*   **Constraint:** Blind to the original source concept and the raw abstract schema. It writes using only the translated vocabulary.
*   **Output:** A complete pedagogical artifact — a lesson, narrative, or interactive scenario — expressed entirely in the metaphor's language.

**2.4. Agent 4: The Decode Key Agent (New)**

The Decode Key Agent possesses full context: the source concept, the metaphor, the mapping dictionary, and the synthesized lesson. Its purpose is to generate the **Rosetta Stone** — a pedagogical artifact that bridges the metaphor back to reality.

*   **Input:** Source concept + Target metaphor + Mapping dictionary + Synthesized lesson.
*   **Output:** A decode key document containing:
    1.  **Quick Reference Table:** A two-column table mapping every metaphorical entity back to its technical equivalent.
    2.  **Annotated Summary:** A plain-language paragraph explaining the concept using both the metaphor and the real terminology side by side.
    3.  **Key Takeaways:** 3–4 structural insights for the learner to retain.

The Decode Key is the only artifact in the pipeline that intentionally contains source-domain vocabulary. It serves as the exit ramp — the point at which the learner transitions from metaphorical reasoning to domain-specific understanding.

**2.5. The Double-Translation Loop (Interactive Tutor)**

Beyond one-shot lesson generation, the IMAW architecture supports sustained multi-turn conversation within the metaphor through the **Double-Translation Loop**. When a user asks a follow-up question in the metaphor's language, the system:

1.  **Reverse-translates** the question from the metaphor back to the abstract schema using the mapping dictionary.
2.  **Queries a Technical Oracle** — an agent with access to the source concept — that answers the abstract question based on factual domain knowledge.
3.  **Forward-translates** the technical answer back into the metaphor using the mapping dictionary.

The user never leaves the metaphor. The system maintains structural fidelity across an arbitrary number of conversational turns without leaking source-domain terminology.

**2.6. Cognitive Constraint: Target Domain Familiarity**

Effective analogy-based learning requires that the target metaphor itself is well understood by the learner. The IMAW architecture therefore introduces the constraint of **Target Domain Familiarity**: the system must explicitly select (or ask the user to provide) a metaphor that the learner already deeply understands. This reduces cognitive load by ensuring the learner is not simultaneously decoding a novel metaphor *and* a novel concept. Learning is isolated to the *structure* of the new concept, delivered through a familiar representational medium.

**2.7. The Artifact Set**

The IMAW pipeline produces four distinct, inspectable artifacts — each serving a specific function that a monolithic LLM essay cannot replicate:

1.  **Abstract Schema** (Agent 1 output). A domain-agnostic JSON structure of entities, relationships, and rules — the structural skeleton of the source concept, stripped of all domain-specific vocabulary. The schema enables **structural auditing**: a practitioner can verify that the decomposition captured the right relational structure before any metaphor is applied. If an entity was not fully abstracted, this is where the failure is visible.

2.  **Mapping Dictionary** (Agent 2 output). A strict 1:1 translation table mapping every abstract entity to a metaphorical equivalent. The dictionary enables **consistency over time**: once "Assignment Unit" is mapped to "Head Butler," that mapping is locked for the entire session — including all follow-up turns in the Double-Translation Loop. The dictionary is editable: a practitioner can swap a mapping they dislike and re-run only the downstream stages.

3.  **Synthesized Lesson** (Agent 3 output). The pedagogical output — a complete narrative written entirely in the metaphor's vocabulary, bound by the mapping dictionary. This is the artifact the learner reads. Unlike a monolithic essay, it is *derived from* the schema and dictionary, meaning its provenance is fully traceable.

4.  **Decode Key** (Agent 4 output). A "Rosetta Stone" reference card that bridges the metaphor back to reality — the only artifact in the pipeline that intentionally contains source-domain terminology. It includes a quick-reference table, an annotated summary, and key takeaways. The decode key serves as the **exit ramp**: the point at which the learner transitions from metaphorical reasoning to domain-specific understanding.

Taken together, these four artifacts constitute a *system*, not an essay. They are what make the metaphor inspectable, editable, and persistent across conversational turns — properties that a single monolithic LLM output, regardless of its quality, cannot provide.

---

### **3. Theoretical Framework: Contextual Blindness and Attention Isolation**

The effectiveness of the IMAW architecture can be understood through the lens of information theory and the attention mechanism that underlies modern transformer-based LLMs.

**3.1. Why Monolithic Prompting Fails**

In a standard transformer, the self-attention mechanism computes a weighted sum over all tokens in the context window. When a monolithic prompt contains both the source concept ("kube-scheduler," "Pod," "etcd") and the instruction to generate a metaphorical narrative, all source-domain tokens are present in the attention context during every generation step. The model's next-token prediction is influenced by the full statistical profile of these technical tokens, creating a persistent gravitational pull toward source-domain vocabulary.

This is not a prompting failure — it is an inherent property of how attention distributes information. No amount of instruction ("Do not use technical terms") can override the fact that those terms are present and actively attended to during generation. The model must actively suppress high-probability tokens that are directly relevant to the concepts it is reasoning about — a task that becomes progressively harder as the source domain grows more complex.

**3.2. Contextual Blindness as Information Isolation**

Contextual Blindness addresses this problem by constraining the mechanism, not by fighting it. By physically isolating agents into separate API calls with restricted inputs, the architecture reduces the surface area for Semantic Leakage — though it does not eliminate it entirely, since Agent 1's abstract labels can carry semantic fingerprints of the source domain (see Section 6.4):

*   **Agent 1 (Decompose)** has access to source-domain tokens but no target-metaphor tokens. It produces abstract outputs that are, by construction, free of both source and target vocabulary.
*   **Agent 2 (Map)** has access to abstract tokens and target-metaphor tokens, but no source-domain tokens. It cannot produce source-domain vocabulary because those tokens are not in its context window.
*   **Agent 3 (Synthesize)** has access to mapping dictionary tokens and target-metaphor tokens only. Again, source-domain tokens are absent from its attention context.

Each agent operates in a truncated information space. Semantic Leakage requires source-domain tokens to be present in the context during narrative generation. The four-agent pipeline ensures this co-occurrence never happens (except intentionally in Agent 4, the Decode Key).

**3.3. The Cost of Safety**

Contextual Blindness is not free. The four-agent pipeline requires four separate API calls where a monolithic approach requires one. This introduces additional latency and token overhead. However, we argue this is a necessary and acceptable trade-off: the pipeline trades computational efficiency for architectural control over the translation process — producing inspectable, editable intermediate artifacts (schema, mapping dictionary, decode key) that a monolithic approach cannot provide. This is analogous to how financial systems accept slower settlement times in exchange for auditability and error traceability.

---

### **4. Core Claims**

Based on the architectural design and theoretical framework, this research posits three central claims.

**Claim 1: IMAW converts opaque, probabilistic failure into localized, diagnosable failure.**

The Contextual Blindness architecture enforces information isolation across the pipeline: the Synthesis Agent never receives source-domain tokens and therefore cannot blend source vocabulary into the metaphorical output. However, if the upstream Decomposition Agent fails to fully abstract a compound technical term, that term propagates through the pipeline undetected. The critical distinction from a monolithic approach is that this failure is **localized** — it traces to a specific agent stage and a specific schema entity — rather than emerging opaquely from the model's attention distribution. IMAW does not guarantee zero leakage; it guarantees that when leakage occurs, it is diagnosable and amenable to targeted remediation (e.g., tighter decomposition prompts, validation gates between stages, or vocabulary filters).

**Claim 2: IMAW trades computational efficiency for structural inspectability and iterative improvability.**

The four-agent pipeline is inherently slower and more expensive than a single monolithic prompt. Each concept requires at minimum four API calls (Decompose, Map, Synthesize, Decode Key) compared to one. We accept this trade-off because it produces what a monolithic approach cannot: inspectable intermediate artifacts at every stage. A practitioner can examine the abstract schema, audit the translation dictionary, and verify the decode key — and when something goes wrong, they can edit a specific mapping rather than re-rolling the entire output. The cost structure is predictable and linear.

**Claim 3: The Double-Translation Loop enables sustained, safe, multi-turn educational roleplay.**

The interactive extension of the architecture — three-step reverse-translate, oracle-query, forward-translate — allows students to ask follow-up questions within the metaphor and receive structurally faithful answers without ever being exposed to source-domain vocabulary. This transforms the system from a one-shot lesson generator into a persistent, immersive educational environment.

---

### **5. Empirical Validation: Automated A/B Testing**

The experiments reported in this section were originally designed to measure Semantic Leakage rates — with the hypothesis that Contextual Blindness would produce measurably lower leakage than a monolithic approach. The results did not confirm that hypothesis cleanly: IMAW did not consistently outperform the monolithic baseline on raw leakage rates (see Section 5.3). What the experiments *did* reveal, however, is the architecture's more fundamental contribution: **diagnosability and structural transparency**. When IMAW fails, the failure traces to a specific agent stage and a specific schema entity — enabling targeted remediation that is architecturally impossible in a monolithic pipeline. The experiments also surfaced critical insights about grader calibration and the distinction between genuine vocabulary contamination and the structural resemblance that faithful translation *should* produce. We present the results as they were obtained, with this framing in mind.

To empirically validate the architectural claims, an automated A/B test was designed comparing a Monolithic LLM against the four-agent IMAW pipeline across 50 diverse source concepts.

#### 5.1 Experimental Design

*   **Test Corpus:** 50 source concepts spanning 12 domain categories: infrastructure, finance, biology, networking, physics, law, chemistry, strategy, computer science theory, social science, arts, and ecology. Each concept includes explicit entities, relationships, and at least one operational rule to provide meaningful structural complexity.
*   **Control (Monolithic LLM):** A single LLM call using best-practice prompting: Chain-of-Thought reasoning, explicit instructions to avoid technical terms, and structured output guidance. This is not a strawman — it represents the strongest reasonable single-prompt approach.
*   **Experimental (IMAW Pipeline):** The four-agent pipeline described in Section 2, with the Decode Key omitted from grading (since it intentionally reveals source terms).
*   **Automated Grader (LLM-as-Judge):** An independent LLM prompt evaluates each output for binary Semantic Leakage: *"Does the final metaphorical lesson contain ANY explicit vocabulary from the original source domain? Provide YES/NO and list the leaked words."*

#### 5.2 Binary Grader Results

The binary LLM-as-Judge grader evaluated each output for the presence of *any* explicit source-domain vocabulary:

| Metric | Monolithic LLM | IMAW Pipeline |
|--------|---------------|---------------|
| Semantic Leakage Rate | 60% (30/50) | 66% (33/50) |
| Clean Generations | 20/50 | 17/50 |

These headline numbers present an immediate paradox: the IMAW pipeline — architecturally designed to prevent Semantic Leakage through Contextual Blindness — appears to perform *worse* than the monolithic control. This counterintuitive result prompted a deeper investigation into the grader's sensitivity and the nature of the flagged vocabulary.

#### 5.3 Grader Calibration: Binary vs. Two-Tier Assessment

Manual inspection of the binary grader's output revealed a significant measurement artifact. Of IMAW's 33 flagged outputs, many were flagged for words that are generic English vocabulary ("cycle," "reduced," "conflict") or structural parallels that reflect *correct translation* — the intended behavior of the pipeline — rather than vocabulary contamination. The binary grader, by design, cannot distinguish between a genuine jargon leak ("kube-scheduler" appearing in a hotel metaphor) and a structural echo ("cycle" appearing in a printing-press metaphor about PCR).

To address this, we introduced a **calibrated two-tier rubric** and re-graded all 50 concept pairs:

*   **Hard Leakage:** A specific source-domain technical term appears verbatim in the metaphorical output. These are unambiguous jargon with no natural place in the target domain (e.g., "API Gateway," "azeotrope," "prior art").
*   **Soft Resemblance:** The output structurally mirrors the source concept's logic but uses generic English vocabulary or words natural to the target metaphor. This is the *intended outcome* of faithful structural translation, not a failure.

| Metric | Monolithic LLM | IMAW Pipeline |
|--------|---------------|---------------|
| Binary Leakage Rate | 60% (30/50) | 66% (33/50) |
| **Hard Leakage Rate (Calibrated)** | **10% (5/50)** | **30% (15/50)** |
| Soft Resemblance (Reclassified) | 25/50 | 18/50 |

> **A note on variability:** These results reflect a single 50-concept run. LLM outputs are non-deterministic; subsequent runs on the same corpus have shown different leakage distributions (e.g., a 14-concept subset rerun showed higher Hard Leakage rates for both pipelines). The headline percentages should be read as directional indicators of architectural behavior, not as stable benchmarks. The more durable finding is the *type* of failure each architecture produces, not the rate.

The calibrated results reveal three important findings:

**Finding 1: Binary grading inflates leakage rates for both pipelines.** The monolithic pipeline's true Hard Leakage rate is 10% — five-sixths of its binary flags were Soft Resemblance (generic words like "resources," "routed," "deposit," "Handshake" that exist naturally in both domains). The IMAW pipeline's rate drops from 66% to 30%, with 18 of its 33 flags reclassified.

**Finding 2: IMAW's Hard Leakage is qualitatively different from monolithic leakage — and this is the architecture's core contribution.** When the monolithic pipeline leaks, it tends to use generic boundary-vocabulary (words that exist in both domains). When the IMAW pipeline leaks, it introduces *specific technical identifiers* — "API Gateway," "Artifact; Gate," "Demand; Supply," "Process Node; Data Packet." Critically, each of these failures traces to a specific agent stage: the Decomposition Agent failed to fully abstract a compound term, and that term propagated downstream. A practitioner can inspect the abstract schema, identify the leaked entity, fix it, and re-run only the downstream stages. With a monolithic pipeline, the same failure is invisible — buried in the model's attention distribution with no path to targeted remediation.

**Finding 3: Binary leakage detection is methodologically insufficient for evaluating multi-agent translation systems.** The binary grader's inability to distinguish structural fidelity from vocabulary contamination renders it unreliable as a sole evaluation metric. Future work on generative control architectures should adopt multi-tier assessment rubrics that separate genuine jargon leakage from the structural resemblance that faithful translation *should* produce.

These findings validate Claim 1: the IMAW pipeline does not guarantee lower leakage rates than a monolithic approach, but it converts opaque, probabilistic failure into localized, diagnosable failure. The pipeline's Hard Leakage traces entirely to an upstream bottleneck in the Decomposition Agent — a specific, addressable failure mode discussed in Section 6.4. More importantly, IMAW produces structural artifacts (schema, mapping dictionary, decode key) that a monolithic pipeline cannot: these artifacts make the translation process inspectable, editable, and improvable. This diagnostic specificity and structural transparency — not raw leakage rate — is the architecture's core contribution.

#### 5.4 Efficiency Trade-off

| Metric | Monolithic (50 concepts) | IMAW (50 concepts) | Total |
|--------|--------------------------|---------------------|-------|
| API Calls per Concept | 1 (generation) + 1 (grading) | 4 (generation) + 1 (grading) | 200 + 63 (calibration) |
| Total Latency | — | — | 5,555s + 741s |
| Input Tokens | — | — | 144,828 |
| Output Tokens | — | — | 58,827 |
| Estimated Cost | — | — | $0.91 |

The data confirms Claim 2: the IMAW pipeline requires approximately 4× the API calls and proportional latency compared to the monolithic approach. The total cost for generating, grading, and calibrating 50 concepts across both pipelines was under $1.00 — demonstrating that the computational overhead of Contextual Blindness, while real, is economically manageable even at research scale.

#### 5.5 Case Studies

To illustrate the qualitative difference, we present three representative case studies drawn from the 50-concept corpus. Note that LLM outputs are non-deterministic; these examples reflect a single run and may vary across executions. The purpose is to illustrate the *type* of output each architecture produces, not to claim deterministic superiority.

**Case Study A: Kubernetes Cluster Architecture → 19th-Century Luxury Hotel**

The monolithic LLM, despite explicit instructions, produced outputs such as *"The Concierge Desk (`kube-apiserver`) handles all requests"* — directly embedding technical identifiers inside the metaphor. The IMAW pipeline produced a fully immersive hotel narrative where the "Head Butler" assigns arriving "Guest Reservations" to available "Wings." Critically, the IMAW run also produced an inspectable mapping dictionary and decode key — artifacts that allow a practitioner to verify every translation and identify any entity that was not fully abstracted.

**Case Study B: Supply Chain Predictive AI → Roman Legatus in Britannia**

The monolithic output contained *"The Legions & Their Equipment: The individual manufacturing machines"* — a direct source-to-metaphor annotation that violates the metaphor's autonomy. The IMAW pipeline produced a narrative where the Legatus dispatches *"Requisition Missives to the Provincial Fabrica"* — a structurally faithful translation of automated purchase orders. The mapping dictionary makes each translation decision explicit and auditable.

**Case Study C: Ceramics in Architecture → Stellar Evolution**

The monolithic output produced *"The dense crystalline lattice of the modern ceramic facade acts like the star's collapsing core"* — placing physical building components inside a cosmic metaphor. The IMAW pipeline translated "ceramic cladding" to "Stellar Core" and "HVAC system" to "Stellar Fusion Engine," producing a lesson about energy cycling in stellar evolution. The decode key provided a complete bridge back to the architectural domain, giving the learner a clear exit ramp from the metaphor to the real-world concept.

---

### **6. Limitations, Future Research, and Known Constraints**

**6.1. Computational Cost**

The most significant practical limitation is cost. The four-agent pipeline requires a minimum of four API calls per concept, plus three additional calls per conversational turn in the Double-Translation Loop. For high-volume EdTech deployments, this overhead is non-trivial. Future work should explore caching strategies (reusing decomposition and mapping results across sessions) and model-size optimization (using smaller, faster models for the Map and Synthesize stages while reserving larger models for Decomposition).

**6.2. Grader Reliability**

The LLM-as-Judge methodology, while scalable, introduces its own reliability concerns. The grader's binary Semantic Leakage assessment depends on its ability to distinguish between genuinely leaked source-domain terms and generic vocabulary that naturally appears in both domains (e.g., "system," "process," "rule"). Future work should calibrate the grader against human annotations on a subset of outputs.

**6.3. Target Domain Familiarity Measurement**

The current architecture assumes Target Domain Familiarity but does not measure it. A learner who is unfamiliar with the target metaphor will derive less benefit from the translation. Future systems should incorporate a brief familiarity assessment before selecting or confirming the metaphor.

**6.4. Decomposition Agent as Upstream Bottleneck**

The empirical results (Section 5.3) confirm that the Decomposition Agent is the single point of failure for Semantic Leakage in the pipeline. Highly abstract or recursive concepts may resist clean decomposition into the Entities/Relationships/Rules schema, and compound technical terms ("API Gateway," "prior art") are frequently passed through as atomic schema entities rather than being abstracted.

As of **v1.1**, the pipeline deploys a **Decomposition Validation Gate** between Agent 1 and Agent 2: an independent LLM-Judge checks the decomposed schema for source-domain vocabulary and remediates any leaked terms before they propagate downstream. This is the type of targeted, surgical fix that the multi-agent architecture uniquely enables — a fix that is architecturally impossible in a monolithic pipeline. Future work should investigate alternative schema representations for edge-case concepts and measure the gate's impact on Hard Leakage rates.

**6.5. Decode Key Quality and the Artifact-Set Thesis**

The empirical results in Section 5 demonstrate that IMAW's core value is not leakage *prevention* — the pipeline does not consistently outperform a monolithic approach on raw leakage rates — but rather *structural transparency*: the production of inspectable, editable intermediate artifacts at every pipeline stage. The **Decode Key** (Agent 4) is the most pedagogically significant of these artifacts, bridging the metaphor back to reality. It is intentionally excluded from leakage grading because it is designed to contain source-domain terminology.

The Decode Key's pedagogical value is a distinct and measurable property, and we believe it represents the strongest axis for future validation. Specifically:

*   **Mapping Completeness:** Does the Decode Key account for every entity present in the abstract schema? Missing mappings leave the learner with metaphorical concepts they cannot resolve back to the source domain.
*   **Bridging Clarity:** Can a reader unambiguously trace from each metaphorical term to its real-world counterpart? Ambiguous or overly abstract bridging language may introduce a second layer of confusion.
*   **Net Pedagogical Value:** Does the complete IMAW artifact set — (clean metaphorical lesson + mapping dictionary + Decode Key) — produce better comprehension outcomes than a monolithic LLM explanation alone? This comparison would require human evaluation or a carefully designed comprehension rubric graded by LLM-as-Judge.

This line of research would extend the validation from *leakage measurement* to *learning efficacy* — the question that matters most to practitioners. The preliminary evidence suggests that the artifact set itself (a structured schema, a locked translation dictionary, and an explicit decode key) constitutes a qualitatively different kind of output than a monolithic essay, regardless of leakage rates. Evaluating this difference is the natural next step.

**6.6. Adaptive Schema Expansion (Implemented)**

Without expansion, the Double-Translation Loop operates on a **frozen mapping dictionary** — the schema and 1:1 translations established during the initial pipeline run are never updated. When a learner asks a follow-up question that falls within the original source material, the system handles it cleanly: the Technical Oracle answers from its source context, and the forward-translator renders the answer through the existing mappings.

However, when a learner asks about something *beyond* the original source — a natural and desirable behavior in curious students — the frozen system's safety guarantee weakens. The Oracle extrapolates an answer, but the forward-translator must improvise new metaphorical terms without the protection of Contextual Blindness. These ad-hoc terms are generated by an agent with full context (source + metaphor), reintroducing the exact co-occurrence condition that the pipeline was designed to eliminate.

The reference implementation addresses this with **Adaptive Schema Expansion** (enabled by default via `auto_expand=True`), which triggers a targeted mini-pipeline when an out-of-schema question is detected:

1.  A **Schema Coverage Auditor** analyzes the Oracle's technical answer against the current abstract schema and determines whether it introduces entities not already represented.
2.  If new material is detected, a scoped Decomposition step extracts *only* the new sub-concept into abstract entities — blind to the target metaphor.
3.  A **Mapping Expansion Agent** extends the existing dictionary with new entries, following the conventions and stylistic patterns already established (e.g., if the metaphor is a cooking show, new entities are mapped to kitchen-domain equivalents). This agent is blind to the original source concept.
4.  The forward-translator re-renders the answer using the *expanded* dictionary.

The expanded dictionary persists for the remainder of the session, allowing all subsequent turns to reference the new mappings. All expansions are logged for debugging and auditability. This approach preserves the Contextual Blindness guarantee for dynamically introduced material, turning the Double-Translation Loop from a fixed-scope responder into a genuinely adaptive pedagogical system.

The implementation is available in the reference codebase: `imaw/session.py` (session management and expansion orchestration) and `agents/tutor.py` (schema detection, expansion pipeline, and double-translation logic).

---

### **Appendix A: Methodology for Reproducing Experiments**

The experiments below were designed to measure Semantic Leakage rates. As discussed in Section 5, the results revealed the architecture's contribution to be diagnosability and structural transparency rather than raw leakage reduction. We include the full methodology for reproducibility.

The testing framework used for the empirical validation (Section 5) is fully automated and available as open-source Python code.

**Repository:** [github.com/creativeAlgebra/imaw-prototype](https://github.com/creativeAlgebra/imaw-prototype)

**A.1 Running the Evidence Generator**

```bash
# Install dependencies
pip install -r requirements.txt

# Full 50-concept A/B test
python generate_evidence.py

# Smoke test (2 concepts only)
python generate_evidence.py --dry-run

# Custom count
python generate_evidence.py --count 10

# Use a different provider
python generate_evidence.py --provider openai --model gpt-4o
```

**A.2 The Monolithic Control Pipeline**

The control condition uses a single, best-practice prompt with Chain-of-Thought instructions:

> *You are an expert educator specializing in analogy-based teaching. Explain the following technical concept ENTIRELY through a metaphor. The final output must be a lesson written 100% inside the metaphor — do NOT reference the original technical domain at any point. [Source Concept] [Target Metaphor]. First, internally identify key entities, relationships, and rules. Map each to a metaphorical equivalent. Write the lesson using ONLY metaphorical terms.*

**A.3 The 4-Agent IMAW Pipeline**

The experimental pipeline instantiates four separate API calls with strict structured output:

1.  **Agent 0 (Vocabulary Extraction, v1.2):** Input: Source Concept. Output: Domain-specific vocabulary blocklist. Used by Agent 1.5 for targeted validation.
2.  **Agent 1 (Decompose):** Input: Source Concept. Output: JSON schema (entities, relationships, rules). Blind to target metaphor.
3.  **Agent 1.5 (Validate, v1.1):** Input: Source Concept + Abstract Schema + Vocabulary Blocklist. Checks for leaked source-domain vocabulary. Remediates if found.
4.  **Agent 2 (Map):** Input: Abstract JSON + Target Metaphor. Output: Translation dictionary. Blind to source concept.
5.  **Agent 3 (Synthesize):** Input: Translation dictionary + Target Metaphor. Output: Pedagogical lesson. Blind to source concept.
6.  **Agent 4 (Decode Key):** Input: All previous outputs + Source Concept. Output: Rosetta Stone reference document.

**A.4 Calibrated Re-Grading**

```bash
# Re-grade an existing evidence CSV with calibrated two-tier rubric
python generate_evidence.py --regrade evidence/evidence_results_20260313_130608.csv
```

**A.5 The Automated Grader**

An independent LLM call evaluates each output for binary Semantic Leakage:

> *Does the final metaphorical lesson contain ANY explicit vocabulary from the original source domain? Provide YES/NO and list the leaked words.*