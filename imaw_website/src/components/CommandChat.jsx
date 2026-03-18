import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useWorkbench, selectAgents, selectExecutionMode, selectMetaMode, selectChatHistory, selectInput, selectTutor, selectOutputs } from '../lib/workbenchStore';
import { runPipelineV2 } from '../lib/pipelineEngineV2';
import { callLLM, getStoredProvider, getStoredApiKey } from '../lib/apiProviders';
import { createTutorSession, sendTutorMessage, detectOutOfSchema, expandSchema } from '../lib/tutorEngine';

const EXEC_MODES = ['sequential', 'parallel', 'hybrid'];
const META_MODES = ['orchestrated', 'autopilot'];

function formatMs(ms) {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

// ── NL Command Parser ───────────────────────────────────────────────────
function parseCommand(text) {
    const t = text.toLowerCase().trim();

    if (/^(run|execute|go|run it|run pipeline|run the pipeline)$/i.test(t)) return { type: 'RUN' };

    const createMatch = text.match(/(?:make|create|add)\s+(?:a\s+)?(?:new\s+)?agent\s+(?:called\s+|named\s+)?["']?([^"']+?)["']?\s+(?:that|to|which)\s+(.+)/i);
    if (createMatch) return { type: 'CREATE_AGENT', name: createMatch[1].trim(), description: createMatch[2].trim() };

    const deleteMatch = text.match(/(?:delete|remove)\s+(?:the\s+)?(?:agent\s+)?["']?([^"']+?)["']?\s*$/i);
    if (deleteMatch) return { type: 'DELETE_AGENT', name: deleteMatch[1].trim() };

    const moveMatch = text.match(/(?:move|put)\s+(?:the\s+)?["']?([^"']+?)["']?\s+(?:before|above)\s+(?:the\s+)?["']?([^"']+?)["']?\s*$/i);
    if (moveMatch) return { type: 'REORDER', source: moveMatch[1].trim(), target: moveMatch[2].trim() };

    if (/switch\s+to\s+parallel/i.test(t)) return { type: 'SET_MODE', mode: 'parallel' };
    if (/switch\s+to\s+sequential/i.test(t)) return { type: 'SET_MODE', mode: 'sequential' };
    if (/switch\s+to\s+hybrid/i.test(t)) return { type: 'SET_MODE', mode: 'hybrid' };

    const saveMatch = text.match(/save\s+(?:this\s+)?(?:as\s+)?(?:a\s+)?template\s+(?:called\s+|named\s+)?["']?(.+?)["']?\s*$/i);
    if (saveMatch) return { type: 'SAVE_TEMPLATE', name: saveMatch[1].trim() };

    const updateMatch = text.match(/update\s+(?:the\s+)?["']?([^"']+?)["']?\s+(?:to|so that)\s+(.+)/i);
    if (updateMatch) return { type: 'UPDATE_AGENT', name: updateMatch[1].trim(), description: updateMatch[2].trim() };

    return null;
}

function findAgentByName(agents, name) {
    const lower = name.toLowerCase();
    return agents.find(a => a.name.toLowerCase() === lower)
        || agents.find(a => a.name.toLowerCase().includes(lower));
}

export default function CommandChat() {
    const { state, dispatch } = useWorkbench();
    const agents = selectAgents(state);
    const executionMode = selectExecutionMode(state);
    const metaMode = selectMetaMode(state);
    const chatHistory = selectChatHistory(state);
    const input = selectInput(state);
    const tutor = selectTutor(state);
    const outputs = selectOutputs(state);
    const phaseStatuses = state.ui.phaseStatuses;
    const pipelineStatus = state.ui.pipelineStatus;

    const [chatInput, setChatInput] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const chatEndRef = useRef(null);
    const provider = getStoredProvider();
    const apiKey = getStoredApiKey(provider);

    // Merged chat: command history + tutor history
    const mergedHistory = tutor.active ? tutor.chatHistory : chatHistory;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mergedHistory, phaseStatuses]);

    const addMessage = useCallback((role, content, type = 'message') => {
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role, content, type } });
    }, [dispatch]);

    const addTutorMsg = useCallback((role, content) => {
        dispatch({ type: 'ADD_TUTOR_MESSAGE', payload: { role, content } });
    }, [dispatch]);

    // ── Initialize tutor after pipeline completes ──
    const initTutor = useCallback(() => {
        if (!input.sourceConcept || outputs.length === 0) return;

        // Find decomposition and mapping outputs to feed the tutor session
        const decompOutput = outputs.find(o => o.agentId === 'decomposition');
        const mappingOutput = outputs.find(o => o.agentId === 'mapping');

        if (!decompOutput || !mappingOutput) {
            addMessage('system', '⚠️ Oracle requires decomposition and mapping state JSON. Run the pipeline first.');
            return;
        }

        const session = createTutorSession(
            input.sourceConcept,
            input.targetMetaphor,
            decompOutput.content,
            mappingOutput.content
        );

        dispatch({ type: 'INIT_TUTOR_SESSION', payload: session });
    }, [input, outputs, dispatch, addMessage]);

    // ── Auto-init tutor when pipeline completes or on mount with existing results ──
    const tutorInitAttempted = useRef(false);
    useEffect(() => {
        if (pipelineStatus === 'done' && !tutor.active && !tutor.session && outputs.length >= 3 && !tutorInitAttempted.current) {
            tutorInitAttempted.current = true;
            initTutor();
        }
        // Reset the flag if pipeline status goes back to idle/running
        if (pipelineStatus !== 'done') {
            tutorInitAttempted.current = false;
        }
    }, [pipelineStatus, outputs.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Execute pipeline ──
    const handleRunPipeline = useCallback(async () => {
        if (!apiKey) {
            addMessage('system', '⚠️ Set your API key first (toolbar badge).');
            return;
        }
        if (!input.sourceConcept.trim()) {
            addMessage('system', '⚠️ Enter a source concept in the Input tab first.');
            return;
        }

        // Clear tutor if re-running
        dispatch({ type: 'CLEAR_TUTOR_SESSION' });

        addMessage('system', `▶ Running ${executionMode} pipeline with ${agents.length} agents…`);
        dispatch({ type: 'SET_PIPELINE_STATUS', payload: 'running' });
        dispatch({ type: 'RESET_PHASE_STATUSES' });
        dispatch({ type: 'RESET_OUTPUTS' });
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'output' });

        try {
            const results = await runPipelineV2(provider, apiKey, state.pipeline, input, (update) => {
                dispatch({ type: 'SET_PHASE_STATUS', payload: update });
                if (update.status === 'complete') {
                    dispatch({ type: 'ADD_AGENT_OUTPUT', payload: { agentId: update.agentId, content: update.response, timestamp: Date.now() } });
                }
            });

            dispatch({ type: 'SET_PIPELINE_STATUS', payload: 'done' });
            addMessage('system', `✓ Pipeline complete — ${results.length} agent(s) finished. State-Bound Oracle activating…`);
        } catch (err) {
            dispatch({ type: 'SET_PIPELINE_STATUS', payload: 'error' });
            addMessage('system', `❌ Pipeline error: ${err.message}`);
        }
    }, [provider, apiKey, agents, executionMode, input, state.pipeline, dispatch, addMessage]);

    // ── Handle tutor message ──
    const handleTutorSend = useCallback(async (text) => {
        if (!tutor.session || !apiKey) return;

        addTutorMsg('user', text);
        dispatch({ type: 'SET_TUTOR_LOADING', payload: true });

        try {
            const result = await sendTutorMessage(
                tutor.session, text, provider, apiKey,
                (step) => {
                    // Could add step-by-step indicators here in future
                }
            );

            addTutorMsg('tutor', result.tutorReply);

            // ── Adaptive Schema Expansion ──
            try {
                const schemaCheck = await detectOutOfSchema(
                    result.technicalAnswer,
                    tutor.session.abstractSchema,
                    tutor.session.sourceConcept,
                    provider, apiKey
                );

                if (schemaCheck.out_of_schema && schemaCheck.new_source_material) {
                    addTutorMsg('system', '🔄 Expanding state graph — your query introduced out-of-bounds operational scope…');

                    const expansion = await expandSchema(
                        schemaCheck.new_source_material,
                        tutor.session.abstractSchema,
                        tutor.session.mapping,
                        tutor.session.targetMetaphor,
                        provider, apiKey
                    );

                    dispatch({
                        type: 'UPDATE_TUTOR_SESSION',
                        payload: {
                            abstractSchema: expansion.expandedSchema,
                            mapping: expansion.expandedMapping,
                        },
                    });

                    if (expansion.newEntitiesAdded.length > 0) {
                        addTutorMsg('system', `✓ Schema expanded: +${expansion.newEntitiesAdded.length} entities (${expansion.newEntitiesAdded.join(', ')})`);
                    }
                }
            } catch {
                // Schema expansion is best-effort — don't break the conversation
            }
        } catch (err) {
            addTutorMsg('system', `❌ Oracle error: ${err.message}`);
        } finally {
            dispatch({ type: 'SET_TUTOR_LOADING', payload: false });
        }
    }, [tutor.session, provider, apiKey, dispatch, addTutorMsg]);

    // ── Handle chat submit (routes to command parser OR tutor) ──
    const handleSend = useCallback(async () => {
        const text = chatInput.trim();
        if (!text) return;
        setChatInput('');

        // In tutor mode, send to the double-translation loop
        if (tutor.active) {
            handleTutorSend(text);
            return;
        }

        // Otherwise, command mode
        addMessage('user', text);
        const cmd = parseCommand(text);

        if (!cmd) {
            addMessage('assistant', "I didn't understand that command. Try:\n• \"Make a new agent called X that does Y\"\n• \"Delete agent X\"\n• \"Switch to parallel\"\n• \"Run pipeline\"\n• \"Save as template called X\"");
            return;
        }

        switch (cmd.type) {
            case 'RUN':
                handleRunPipeline();
                break;

            case 'CREATE_AGENT': {
                addMessage('assistant', `Creating agent "${cmd.name}"…`);
                let instructions = `You are the ${cmd.name} agent. ${cmd.description}`;
                if (apiKey) {
                    try {
                        instructions = await callLLM(provider, apiKey,
                            'You generate system prompts for AI agents. Given a name and description, write a concise, focused system prompt. Return ONLY the system prompt text, nothing else.',
                            `Agent name: ${cmd.name}\nWhat it should do: ${cmd.description}`,
                            0.7, false
                        );
                    } catch { /* fallback to simple prompt */ }
                }
                dispatch({ type: 'ADD_AGENT', payload: { name: cmd.name, role: cmd.description, instructions } });
                addMessage('assistant', `✓ Agent "${cmd.name}" created and added to the pipeline.`);
                break;
            }

            case 'DELETE_AGENT': {
                const agent = findAgentByName(agents, cmd.name);
                if (agent) {
                    dispatch({ type: 'DELETE_AGENT', payload: { id: agent.id } });
                    addMessage('assistant', `✓ Deleted agent "${agent.name}".`);
                } else {
                    addMessage('assistant', `Agent "${cmd.name}" not found.`);
                }
                break;
            }

            case 'UPDATE_AGENT': {
                const agent = findAgentByName(agents, cmd.name);
                if (agent) {
                    let newInstructions = agent.instructions;
                    if (apiKey) {
                        try {
                            newInstructions = await callLLM(provider, apiKey,
                                'You modify AI agent system prompts. Given the current prompt and a requested change, return ONLY the updated system prompt text.',
                                `Current prompt:\n${agent.instructions}\n\nRequested change: ${cmd.description}`,
                                0.5, false
                            );
                        } catch { /* keep existing */ }
                    }
                    dispatch({ type: 'UPDATE_AGENT', payload: { id: agent.id, updates: { instructions: newInstructions } } });
                    addMessage('assistant', `✓ Updated "${agent.name}" system prompt.`);
                } else {
                    addMessage('assistant', `Agent "${cmd.name}" not found.`);
                }
                break;
            }

            case 'REORDER': {
                const sourceAgent = findAgentByName(agents, cmd.source);
                const targetAgent = findAgentByName(agents, cmd.target);
                if (sourceAgent && targetAgent) {
                    const ids = agents.map(a => a.id);
                    const fromIdx = ids.indexOf(sourceAgent.id);
                    const toIdx = ids.indexOf(targetAgent.id);
                    ids.splice(fromIdx, 1);
                    ids.splice(toIdx, 0, sourceAgent.id);
                    dispatch({ type: 'REORDER_AGENTS', payload: { agentIds: ids } });
                    addMessage('assistant', `✓ Moved "${sourceAgent.name}" before "${targetAgent.name}".`);
                } else {
                    addMessage('assistant', `Couldn't find the agents. Available: ${agents.map(a => a.name).join(', ')}`);
                }
                break;
            }

            case 'SET_MODE':
                dispatch({ type: 'SET_EXECUTION_MODE', payload: cmd.mode });
                addMessage('assistant', `✓ Switched to ${cmd.mode} execution.`);
                break;

            case 'SAVE_TEMPLATE':
                dispatch({ type: 'SAVE_TEMPLATE', payload: { name: cmd.name } });
                addMessage('assistant', `✓ Template "${cmd.name}" saved with ${agents.length} agents.`);
                break;

            default:
                addMessage('assistant', "Command recognized but not yet implemented.");
        }
    }, [chatInput, tutor.active, agents, provider, apiKey, dispatch, addMessage, handleRunPipeline, handleTutorSend]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ── Execution status cards ──
    const renderPhaseCards = () => {
        const sorted = [...agents].sort((a, b) => a.position - b.position);
        const activePhases = sorted.filter(a => phaseStatuses[a.id]);
        if (activePhases.length === 0) return null;

        return (
            <div className="wb-exec-status-cards">
                {activePhases.map(agent => {
                    const phase = phaseStatuses[agent.id];
                    return (
                        <div key={agent.id} className={`wb-exec-card wb-exec-card-${phase.status}`}>
                            <span className="wb-exec-card-name">{agent.name}</span>
                            <span className="wb-exec-card-status">
                                {phase.status === 'complete' && `✓ ${formatMs(phase.elapsed)}`}
                                {phase.status === 'running' && <><span className="wb-mini-spinner" /> running</>}
                                {phase.status === 'error' && '✕ error'}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="wb-panel wb-command-chat">
            {/* Top bar — mode + exec toggles + tutor indicator */}
            <div className="wb-chat-toolbar">
                {tutor.active ? (
                    /* Tutor mode header */
                    <div className="wb-chat-toggle-group" style={{ flex: 1 }}>
                        <span className="wb-chat-toggle-label" style={{ color: '#a6e3a1', fontWeight: 600 }}>🎓 Tutor Active</span>
                        <span style={{ fontSize: 10, color: '#64748b', marginLeft: 4 }}>Double-Translation Loop</span>
                    </div>
                ) : (
                    /* Command mode toggles */
                    <>
                        <div className="wb-chat-toggle-group">
                            <span className="wb-chat-toggle-label">Mode</span>
                            <div className="wb-chat-toggle">
                                {META_MODES.map(m => (
                                    <button
                                        key={m}
                                        className={`wb-chat-toggle-btn ${metaMode === m ? 'wb-chat-toggle-active' : ''}`}
                                        onClick={() => dispatch({ type: 'SET_META_MODE', payload: m })}
                                    >
                                        {m.charAt(0).toUpperCase() + m.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="wb-chat-toggle-group">
                            <span className="wb-chat-toggle-label">Exec</span>
                            <div className="wb-chat-toggle">
                                {EXEC_MODES.map(m => (
                                    <button
                                        key={m}
                                        className={`wb-chat-toggle-btn ${executionMode === m ? 'wb-chat-toggle-active' : ''}`}
                                        onClick={() => dispatch({ type: 'SET_EXECUTION_MODE', payload: m })}
                                    >
                                        {m.charAt(0).toUpperCase() + m.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Tutor toggle / settings */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {tutor.active && (
                        <button
                            className="wb-chat-settings-btn"
                            onClick={() => dispatch({ type: 'CLEAR_TUTOR_SESSION' })}
                            title="Exit tutor mode"
                            style={{ fontSize: 10, color: '#94a3b8' }}
                        >
                            ✕ Exit Tutor
                        </button>
                    )}
                    {!tutor.active && pipelineStatus === 'done' && (
                        <button
                            className="wb-chat-settings-btn"
                            onClick={initTutor}
                            title="Activate tutor chat"
                            style={{ fontSize: 10, color: '#a6e3a1' }}
                        >
                            🎓 Tutor
                        </button>
                    )}
                    {!tutor.active && (
                        <button className="wb-chat-settings-btn" onClick={() => setShowSettings(!showSettings)} title="Iteration Policy">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Settings dropdown */}
            {showSettings && !tutor.active && (
                <div className="wb-settings-panel">
                    <label className="wb-label">Iteration Policy</label>
                    {['rerun_all', 'rerun_downstream', 'manual'].map(p => (
                        <label key={p} className="wb-context-option" style={{ paddingBlock: '4px' }}>
                            <input
                                type="radio"
                                name="iter-policy"
                                checked={state.pipeline.iterationPolicy === p}
                                onChange={() => dispatch({ type: 'SET_ITERATION_POLICY', payload: p })}
                            />
                            <span className="wb-context-label" style={{ textTransform: 'capitalize' }}>{p.replace(/_/g, ' ')}</span>
                        </label>
                    ))}
                </div>
            )}

            {/* Chat history */}
            <div className="wb-chat-history">
                {mergedHistory.length === 0 && (
                    <div className="wb-chat-welcome">
                        <p className="wb-chat-welcome-title">Command Chat</p>
                        <p className="wb-chat-welcome-hint">Type a command or click Run Pipeline.</p>
                        <div className="wb-chat-examples">
                            <code>"Make a new agent called Editor that checks for clarity"</code>
                            <code>"Switch to parallel"</code>
                            <code>"Run pipeline"</code>
                            <code>"Save as template called My Config"</code>
                        </div>
                    </div>
                )}
                {mergedHistory.map((msg, i) => (
                    <div key={i} className={`wb-chat-msg wb-chat-msg-${msg.role}`}>
                        <span className="wb-chat-msg-role">
                            {msg.role === 'user' ? '>' : msg.role === 'tutor' ? '🎓' : msg.role === 'system' ? '⚙' : '◆'}
                        </span>
                        {msg.role === 'tutor' ? (
                            <span className="wb-chat-msg-text wb-tutor-reply">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                            </span>
                        ) : (
                            <span className="wb-chat-msg-text">{msg.content}</span>
                        )}
                    </div>
                ))}
                {tutor.loading && (
                    <div className="wb-chat-msg wb-chat-msg-system">
                        <span className="wb-chat-msg-role">🎓</span>
                        <span className="wb-chat-msg-text" style={{ color: '#94a3b8' }}>
                            <span className="wb-mini-spinner" /> Translating through the double-translation loop…
                        </span>
                    </div>
                )}
                {!tutor.active && renderPhaseCards()}
                <div ref={chatEndRef} />
            </div>

            {/* Bottom input */}
            <div className="wb-chat-input-area">
                {!tutor.active && (
                    <button
                        className="wb-run-btn"
                        disabled={pipelineStatus === 'running'}
                        onClick={handleRunPipeline}
                    >
                        {pipelineStatus === 'running' ? (
                            <><span className="wb-mini-spinner" /> Running…</>
                        ) : (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg> Run Pipeline</>
                        )}
                    </button>
                )}
                <div className="wb-chat-input-row">
                    <input
                        type="text"
                        className="wb-chat-text-input"
                        placeholder={tutor.active ? "Ask a question within the metaphor…" : "Type a command…"}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={tutor.loading}
                    />
                    <button className="wb-chat-send-btn" onClick={handleSend} disabled={!chatInput.trim() || tutor.loading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
