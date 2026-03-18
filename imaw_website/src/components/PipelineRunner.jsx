import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PROVIDERS, callLLM, getStoredProvider, setStoredProvider, getStoredApiKey, setStoredApiKey } from '../lib/apiProviders';

// ── Agent System Prompts (ported from Python) ──────────────────────────
const DECOMPOSITION_SYSTEM = `You are the Decomposition Agent in an Isomorphic Multi-Agent Workflow. Your sole task is to ingest a complex source concept and strip away EVERY trace of its specific domain context, vocabulary, and jargon. You must reduce the concept entirely to pure abstract structural logic. Identify the core entities using generic labels (e.g., 'Entity Alpha', 'System Node', 'Resource B'), define how they interact, and list the inviolable rules governing their behavior.

Return a JSON object with exactly these keys:
- "entities": array of generic, domain-agnostic names
- "relationships": array of objects with "source_entity", "target_entity", "interaction"
- "rules": array of constraint strings

Return ONLY valid JSON.`;

const MAPPING_SYSTEM = `You are the Mapping Agent in an Isomorphic Multi-Agent Workflow. You will receive an abstract logical schema (Entities, Relationships, Rules) and a Target Metaphor. Your task is to instantiate the abstract structure within the new metaphorical vocabulary. CRITICALLY: You must maintain strict structural ISOMORPHISM. The new metaphor must rigorously obey the abstract rules without logical contradictions. Be highly creative in your mapping, but unimaginative in your logic.

Return a JSON object with exactly these keys:
- "entity_mappings": array of objects with "abstract_entity" and "metaphorical_entity"
- "translated_rules": array of the abstract rules rewritten using the new metaphorical vocabulary

Return ONLY valid JSON.`;

const COMPILER_SYSTEM = `You are the Compiler Agent in an Isomorphic Multi-Agent Workflow. Your task is to act as an expert pedagogue and instructional designer. You will receive a target metaphor and a strict structural mapping dictionary. You MUST write a highly engaging, readable, and formally accurate lesson that explains the underlying logic entirely through the lens of the TARGET metaphor. CRITICAL: You must strictly adhere to the structural mapping. Do not invent interactions that the mapping does not support.`;

const DECODE_KEY_SYSTEM = `You are the Decode Key Agent in an Isomorphic Multi-Agent Workflow. Your task is to generate a clear, side-by-side translation guide so the reader can connect every metaphorical element back to its real-world counterpart. This is the "Rosetta Stone" for the lesson.

Format the output as a clean Markdown table with these columns:
| Metaphorical Element | Real Concept | Role in the System |

Follow the table with a brief "How to Read This" paragraph explaining what isomorphic mapping means in plain language.`;

// ── Component ──────────────────────────────────────────────────────────
export default function PipelineRunner() {
    const [provider, setProviderState] = useState(getStoredProvider);
    const [apiKey, setApiKeyState] = useState(() => getStoredApiKey(getStoredProvider()));

    const setProvider = (id) => {
        setProviderState(id);
        setStoredProvider(id);
        setApiKeyState(getStoredApiKey(id));
    };
    const setApiKey = (key) => {
        setApiKeyState(key);
        setStoredApiKey(provider, key);
    };

    const activeProviderConfig = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

    // Wizard step: 'source' | 'metaphor' | 'confirm' | 'running' | 'results'
    const [step, setStep] = useState('source');
    const [sourceConcept, setSourceConcept] = useState('');
    const [targetMetaphor, setTargetMetaphor] = useState('');

    // Pipeline state
    const [phase, setPhase] = useState('idle'); // idle | decomposing | mapping | compiling | decoding | done | error
    const [abstractSchema, setAbstractSchema] = useState(null);
    const [mapping, setMapping] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [decodeKey, setDecodeKey] = useState(null);
    const [error, setError] = useState(null);

    // Results tab: 'lesson' | 'decode' | 'schema' | 'chat'
    const [resultsTab, setResultsTab] = useState('lesson');

    // Tutor chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, chatLoading]);

    // ── LLM API Helper (provider-aware) ─────────────────────────────────
    const callProvider = async (systemPrompt, userPrompt, temperature = 0.2, jsonMode = false) => {
        return callLLM(provider, apiKey, systemPrompt, userPrompt, temperature, jsonMode);
    };

    // ── Run the 4-Agent Pipeline ───────────────────────────────────────
    const runPipeline = async () => {
        setStep('running');
        setError(null);
        setAbstractSchema(null);
        setMapping(null);
        setLesson(null);
        setDecodeKey(null);
        setChatMessages([]);
        setResultsTab('lesson');

        try {
            // Phase 1: Decomposition
            setPhase('decomposing');
            const schemaRaw = await callProvider(
                DECOMPOSITION_SYSTEM,
                `Decompose the following source concept:\n\n${sourceConcept}`,
                0.1, true
            );
            setAbstractSchema(schemaRaw);

            // Phase 2: Mapping
            setPhase('mapping');
            const mappingRaw = await callProvider(
                MAPPING_SYSTEM,
                `Abstract Schema:\n${schemaRaw}\n\nTarget Metaphor Context: ${targetMetaphor}\n\nGenerate the strict mapping dictionary and prove the rules hold.`,
                0.1, true
            );
            setMapping(mappingRaw);

            // Phase 3: Compilation
            setPhase('compiling');
            const lessonRaw = await callProvider(
                COMPILER_SYSTEM,
                `The Chosen Target Metaphor:\n${targetMetaphor}\n\nThe Structural Isomorphic Mapping:\n${mappingRaw}\n\nSynthesize the final pedagogical artifact natively in Markdown format.\nCRITICAL UX REQUIREMENT: At the very bottom of the artifact, you MUST append a section titled '### Suggested Exploration Questions'. Provide exactly 3 thought-provoking questions phrased ENTIRELY within the rules of the target metaphor. These questions should prompt the user to stress-test the simulation.`,
                0.7, false
            );
            setLesson(lessonRaw);

            // Phase 4: Decode Key
            setPhase('decoding');
            const decodeRaw = await callProvider(
                DECODE_KEY_SYSTEM,
                `Source Concept:\n${sourceConcept}\n\nTarget Metaphor: ${targetMetaphor}\n\nIsomorphic Mapping:\n${mappingRaw}\n\nGenerated Lesson (for reference):\n${lessonRaw}\n\nGenerate the Decode Key — a comprehensive side-by-side translation guide.`,
                0.3, false
            );
            setDecodeKey(decodeRaw);

            setPhase('done');
            setStep('results');
        } catch (err) {
            setError(err.message);
            setPhase('error');
            setStep('running');
        }
    };

    // ── Tutor Chat (Double-Translation Loop) ───────────────────────────
    const handleTutorSend = async (e) => {
        e?.preventDefault();
        if (!chatInput.trim() || chatLoading) return;

        const userMsg = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatLoading(true);

        try {
            const reversePrompt = `You are an Isomorphic Reverse-Translator.\n\nHere is the established mapping dictionary between Abstract Schema -> Target Metaphor:\n\`\`\`json\n${mapping}\n\`\`\`\n\nThe user is immersed in the target metaphor ('${targetMetaphor}') and just asked this question:\nUSER: "${userMsg}"\n\nTask: Translate this question backwards into the Abstract Schema terminology used in the mapping dictionary. Strip out all metaphorical flavor and return only the raw, abstract operational question.`;
            const abstractQ = await callProvider('', reversePrompt, 0.2);

            const oraclePrompt = `You are a Technical Factual Oracle.\n\nHere is the absolute factual truth regarding the original source concept:\n\`\`\`text\n${sourceConcept}\n\`\`\`\n\nBased ONLY on the mechanics defined in the source concept above, answer the following abstract question accurately:\nABSTRACT QUESTION: "${abstractQ}"\n\nTask: Provide the pure technical answer.`;
            const techAnswer = await callProvider('', oraclePrompt, 0.2);

            const forwardPrompt = `You are an Isomorphic Forward-Translator and Tutor.\n\nHere is the established mapping dictionary (Abstract Schema -> Target Metaphor):\n\`\`\`json\n${mapping}\n\`\`\`\n\nThe user is operating under this Target Metaphor: ${targetMetaphor}\nTheir original question was: "${userMsg}"\n\nHere is the absolute technical truth regarding their question:\n\`\`\`text\n${techAnswer}\n\`\`\`\n\nTask: Translate the technical truth into a response that directly answers the user's question, but strictly conforms to the Target Metaphor. Use the mapping dictionary to ensure structural fidelity. NEVER break character. NEVER reference real-world technology, architecture, businesses, etc. Speak as an immersive tutor within the metaphor.`;
            const tutorReply = await callProvider('', forwardPrompt, 0.7);

            setChatMessages(prev => [...prev, { role: 'assistant', text: tutorReply }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', text: `❌ Error: ${err.message}` }]);
        } finally {
            setChatLoading(false);
        }
    };

    // ── Download Session ───────────────────────────────────────────────
    const downloadSession = () => {
        const sections = [
            `# ControlArc Session Export\n\n---\n`,
            `## Inputs\n- **Source Concept:** ${sourceConcept}\n- **Target Metaphor:** ${targetMetaphor}\n\n---\n`,
            `## Agent 1 — Abstract Schema\n\`\`\`json\n${abstractSchema ? JSON.stringify(JSON.parse(abstractSchema), null, 2) : 'N/A'}\n\`\`\`\n\n---\n`,
            `## Agent 2 — Isomorphic Mapping\n\`\`\`json\n${mapping ? JSON.stringify(JSON.parse(mapping), null, 2) : 'N/A'}\n\`\`\`\n\n---\n`,
            `## Agent 3 — Final Lesson\n${lesson || 'N/A'}\n\n---\n`,
            `## Agent 4 — Decode Key\n${decodeKey || 'N/A'}\n\n---\n`,
        ];
        if (chatMessages.length > 0) {
            sections.push(`## Tutor Chat Log\n`);
            chatMessages.forEach(m => {
                sections.push(`**${m.role === 'user' ? 'You' : 'Tutor'}:** ${m.text}\n\n`);
            });
        }
        const blob = new Blob([sections.join('\n')], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `imaw-session-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Start Over ─────────────────────────────────────────────────────
    const startOver = () => {
        setStep('source');
        setPhase('idle');
        setSourceConcept('');
        setTargetMetaphor('');
        setAbstractSchema(null);
        setMapping(null);
        setLesson(null);
        setDecodeKey(null);
        setError(null);
        setChatMessages([]);
        setChatInput('');
    };

    // ── Phase status helpers ───────────────────────────────────────────
    const phaseOrder = ['decomposing', 'mapping', 'compiling', 'decoding', 'done'];
    const phaseIndex = phaseOrder.indexOf(phase);
    const getPhaseStatus = (idx) => {
        if (phase === 'idle') return 'pending';
        if (phaseIndex > idx || phase === 'done') return 'done';
        if (phaseIndex === idx) return 'active';
        return 'pending';
    };
    const agentLabels = ['Decompose', 'Map', 'Synthesize', 'Decode Key'];
    const agentQuips = [
        'Extracting structural logic…',
        'Building isomorphic mapping…',
        'Synthesizing the lesson…',
        'Building the Rosetta Stone…',
    ];

    // ── Stepper state mapping ──────────────────────────────────────────
    const journeySteps = [
        { key: 'input', label: 'Enter Details' },
        { key: 'decompose', label: 'Decompose' },
        { key: 'map', label: 'Map' },
        { key: 'synthesize', label: 'Synthesize' },
        { key: 'decode', label: 'Decode Key' },
    ];
    const getJourneyIndex = () => {
        if (step === 'results') return 5; // all done
        if (phase === 'decoding') return 4;
        if (phase === 'compiling') return 3;
        if (phase === 'mapping') return 2;
        if (phase === 'decomposing') return 1;
        return 0; // input phase (source, metaphor, confirm)
    };
    const journeyIndex = getJourneyIndex();

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <div>
            {/* ── Persistent Pipeline Stepper ──────────────────── */}
            <div className="mb-8">
                <div className="flex items-center gap-1">
                    {journeySteps.map((s, idx) => {
                        const isDone = journeyIndex > idx;
                        const isActive = journeyIndex === idx;
                        return (
                            <React.Fragment key={s.key}>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                                        isDone ? 'bg-green-500 text-white' :
                                        isActive ? 'bg-[#0f172a] text-white' :
                                        'bg-gray-200 text-gray-400'
                                    } ${isActive && phase !== 'idle' ? 'animate-pulse' : ''}`}>
                                        {isDone ? (
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        ) : idx + 1}
                                    </div>
                                    <span className={`text-xs font-medium hidden sm:inline transition-colors duration-300 ${
                                        isDone ? 'text-green-600' :
                                        isActive ? 'text-[#0f172a] font-semibold' :
                                        'text-gray-400'
                                    }`}>{s.label}</span>
                                </div>
                                {idx < journeySteps.length - 1 && (
                                    <div className={`flex-1 h-px mx-1.5 transition-colors duration-500 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* ── Intro + API Key for first-time visitors ──────── */}
            {!apiKey && (
                <div className="mb-6 space-y-5">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-[#0f172a] mb-2">How this works</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            Describe a concept you want to understand and choose a metaphor. Isolated agents will decompose the concept,
                            build a structural translation, synthesize a lesson, and generate a decode key — each one blind to the others' domain.
                            Then chat with a tutor that reasons entirely within the metaphor.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { num: '1', title: 'Decompose', desc: 'Strip domain jargon → abstract logic' },
                                { num: '2', title: 'Map', desc: '1:1 translation dictionary' },
                                { num: '3', title: 'Synthesize', desc: 'Lesson in pure metaphor' },
                                { num: '4', title: 'Decode Key', desc: 'Rosetta Stone back to reality' },
                            ].map(a => (
                                <div key={a.num} className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs font-bold mx-auto mb-2">{a.num}</div>
                                    <p className="text-xs font-semibold text-[#0f172a] mb-0.5">{a.title}</p>
                                    <p className="text-[11px] text-gray-500 leading-snug">{a.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Provider Selector ── */}
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Choose your AI provider</label>
                            <div className="flex bg-white rounded-lg border border-gray-200 p-1 gap-1">
                                {PROVIDERS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setProvider(p.id)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                                            provider === p.id
                                                ? 'bg-[#0f172a] text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-sm">{p.icon}</span>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Enter your {activeProviderConfig.label} API Key
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={activeProviderConfig.placeholder}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Your key stays in your browser. It's sent directly to {activeProviderConfig.label} — never to our servers.
                            </p>
                            {activeProviderConfig.corsWarning && (
                                <p className="text-xs text-amber-700 mt-2 bg-amber-100 px-3 py-2 rounded-lg">
                                    ⚠️ Anthropic's API blocks direct browser requests (CORS). This provider requires a proxy server to work.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 1: Source Concept ─────────────────────────────── */}
            {step === 'source' && apiKey && (
                <div className="space-y-5">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs font-bold">1</div>
                            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Describe your source concept</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">The concept, system, or process you want translated. Can be as brief or as detailed as you like.</p>
                        <textarea
                            value={sourceConcept}
                            onChange={(e) => setSourceConcept(e.target.value)}
                            rows={6}
                            placeholder="e.g., Master Services Agreement, AWS Architecture Docs, FDA Clinical Trial Data"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none leading-relaxed"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setStep('metaphor')}
                            disabled={!sourceConcept.trim()}
                            className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Next
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Target Metaphor ───────────────────────────── */}
            {step === 'metaphor' && (
                <div className="space-y-5">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs font-bold">2</div>
                            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Choose a target metaphor</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">A world, scenario, or system for the translation. The more concrete and specific, the stronger the structural mapping.</p>
                        <input
                            type="text"
                            value={targetMetaphor}
                            onChange={(e) => setTargetMetaphor(e.target.value)}
                            placeholder="e.g., A pirate ship crew, a medieval kingdom, a jazz ensemble, the Wild West..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter' && targetMetaphor.trim()) setStep('confirm'); }}
                        />
                    </div>
                    <div className="flex justify-between">
                        <button
                            onClick={() => setStep('source')}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Back
                        </button>
                        <button
                            onClick={() => setStep('confirm')}
                            disabled={!targetMetaphor.trim()}
                            className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Next
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 3: Confirmation ──────────────────────────────── */}
            {step === 'confirm' && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Confirm Your Inputs</h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Source Concept</p>
                                <p className="text-sm text-gray-800 leading-relaxed">{sourceConcept}</p>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Target Metaphor</p>
                                <p className="text-sm text-gray-800">{targetMetaphor}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={runPipeline}
                            className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Generate Lesson
                        </button>
                        <button
                            onClick={() => setStep('source')}
                            className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                        >
                            Re-enter
                        </button>
                    </div>
                </div>
            )}

            {/* ── RUNNING: Pipeline Progress ────────────────────────── */}
            {step === 'running' && phase !== 'error' && (
                <div className="space-y-6">

                    {/* Active phase quip */}
                    <div className="flex items-center gap-3 py-5 px-5 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-[#0f172a] rounded-full animate-spin flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-gray-800">
                                Agent {phaseIndex + 1}: {agentLabels[phaseIndex] || 'Processing'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{agentQuips[phaseIndex] || 'Working…'}</p>
                        </div>
                    </div>

                    {/* Show completed phases */}
                    {abstractSchema && (
                        <details className="group">
                            <summary className="text-xs font-semibold text-green-600 uppercase tracking-widest cursor-pointer hover:text-green-700">✓ Phase 1 — Abstract Schema</summary>
                            <div className="mt-2 bg-gray-900 rounded-xl p-4 overflow-x-auto text-xs text-green-400 font-mono max-h-40 overflow-y-auto">
                                <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(abstractSchema), null, 2)}</pre>
                            </div>
                        </details>
                    )}
                    {mapping && (
                        <details className="group">
                            <summary className="text-xs font-semibold text-green-600 uppercase tracking-widest cursor-pointer hover:text-green-700">✓ Phase 2 — Isomorphic Mapping</summary>
                            <div className="mt-2 bg-gray-900 rounded-xl p-4 overflow-x-auto text-xs text-green-400 font-mono max-h-40 overflow-y-auto">
                                <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(mapping), null, 2)}</pre>
                            </div>
                        </details>
                    )}
                    {lesson && (
                        <details className="group">
                            <summary className="text-xs font-semibold text-green-600 uppercase tracking-widest cursor-pointer hover:text-green-700">✓ Phase 3 — Lesson Compiled</summary>
                            <p className="mt-2 text-xs text-gray-500 italic">Lesson ready. Generating Decode Key…</p>
                        </details>
                    )}
                </div>
            )}

            {/* ── ERROR STATE ───────────────────────────────────────── */}
            {phase === 'error' && (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                    <p className="text-sm text-red-700 font-medium mb-4">❌ {error}</p>
                    <div className="flex items-center justify-center gap-3">
                        <button onClick={() => { setPhase('idle'); runPipeline(); }} className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                            Retry
                        </button>
                        <button onClick={startOver} className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:text-gray-900 transition-colors">
                            Start Over
                        </button>
                    </div>
                </div>
            )}

            {/* ── RESULTS: Tabbed Session View ──────────────────────── */}
            {step === 'results' && (
                <div className="space-y-4">
                    {/* Header + actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            {[
                                { key: 'lesson', label: 'Lesson' },
                                { key: 'decode', label: 'Decode Key' },
                                { key: 'schema', label: 'Schema & Mapping' },
                                { key: 'chat', label: 'Continue Exploring' },
                            ].map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => setResultsTab(t.key)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                        resultsTab === t.key ? 'bg-white text-[#0f172a] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={downloadSession}
                                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Download
                            </button>
                            <button
                                onClick={startOver}
                                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Start Over
                            </button>
                        </div>
                    </div>

                    {/* ── Lesson Tab ── */}
                    {resultsTab === 'lesson' && (
                        <div className="prose prose-gray max-w-none bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson}</ReactMarkdown>
                        </div>
                    )}

                    {/* ── Decode Key Tab ── */}
                    {resultsTab === 'decode' && (
                        <div className="prose prose-gray max-w-none bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{decodeKey || 'Decode Key not available.'}</ReactMarkdown>
                        </div>
                    )}

                    {/* ── Schema & Mapping Tab ── */}
                    {resultsTab === 'schema' && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Agent 1 — Abstract Schema</p>
                                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto text-xs text-green-400 font-mono max-h-64 overflow-y-auto">
                                    <pre className="whitespace-pre-wrap">{abstractSchema ? JSON.stringify(JSON.parse(abstractSchema), null, 2) : 'N/A'}</pre>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-2">Agent 2 — Isomorphic Mapping</p>
                                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto text-xs text-green-400 font-mono max-h-64 overflow-y-auto">
                                    <pre className="whitespace-pre-wrap">{mapping ? JSON.stringify(JSON.parse(mapping), null, 2) : 'N/A'}</pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Continue Exploring (Tutor Chat) Tab ── */}
                    {resultsTab === 'chat' && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                                <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest">Continue Exploring</p>
                                <p className="text-xs text-gray-500 mt-0.5">Ask follow-up questions. The tutor reasons and responds entirely within the metaphor.</p>
                            </div>
                            <div className="p-5 space-y-4 max-h-96 overflow-y-auto bg-white">
                                {chatMessages.length === 0 && !chatLoading && (
                                    <p className="text-sm text-gray-400 text-center py-8 italic">Ask a question to start exploring…</p>
                                )}
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                                            msg.role === 'user'
                                                ? 'bg-[#0f172a] text-white rounded-br-sm'
                                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                        }`}>
                                            <div className="prose prose-sm max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown></div>
                                        </div>
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={handleTutorSend} className="flex gap-2 p-4 border-t border-gray-200 bg-gray-50">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask a question within the metaphor…"
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button type="submit" disabled={chatLoading || !chatInput.trim()} className="px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-30">
                                    Send
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
