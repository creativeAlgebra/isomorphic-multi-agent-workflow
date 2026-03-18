import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useWorkbench, selectAgents, selectAgent, selectOutputs, selectExecutionMode } from '../lib/workbenchStore';
// ConstellationCanvas removed — feature sunset in Workbench overhaul

const AGENT_COLORS = ['#89b4fa', '#cba6f7', '#a6e3a1', '#f9e2af', '#fab387', '#f38ba8', '#74c7ec', '#94e2d5'];
const CONTEXT_MODES = [
    { value: 'inherit_previous', label: 'Previous agent output', desc: 'Receives the output of the agent directly above' },
    { value: 'original_only', label: 'Original input only', desc: 'Only sees the raw user input' },
    { value: 'specific_agents', label: 'Specific agents', desc: 'Choose which agent outputs to receive' },
    { value: 'cumulative', label: 'Everything so far', desc: 'All prior agent outputs combined' },
];

export default function DocumentWorkspace() {
    const { state, dispatch } = useWorkbench();
    const agents = selectAgents(state);
    const selectedAgentId = state.ui.selectedAgentId;
    const selectedAgent = selectedAgentId ? selectAgent(state, selectedAgentId) : null;
    const activeTab = state.ui.activeTab;
    const pipelineStatus = state.ui.pipelineStatus;
    const outputs = selectOutputs(state);
    const executionMode = selectExecutionMode(state);
    const input = state.artifacts.input;

    const [outputMode, setOutputMode] = useState('simple');
    const [activeOutputAgent, setActiveOutputAgent] = useState(null);

    const agentIdx = selectedAgent ? agents.findIndex(a => a.id === selectedAgent.id) : -1;
    const agentColor = agentIdx >= 0 ? AGENT_COLORS[agentIdx % AGENT_COLORS.length] : '#89b4fa';

    const handleTabChange = (tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });

    // Agent config updates
    const updateField = (field, value) => {
        dispatch({ type: 'UPDATE_AGENT', payload: { id: selectedAgentId, updates: { [field]: value } } });
    };
    const updateContextRule = (updates) => {
        dispatch({ type: 'UPDATE_AGENT', payload: { id: selectedAgentId, updates: { contextRule: { ...selectedAgent.contextRule, ...updates } } } });
    };

    return (
        <div className="wb-panel wb-workspace">
            {/* Tab Bar */}
            <div className="wb-panel-header wb-tab-bar">
                <button className={`wb-tab ${activeTab === 'input' ? 'wb-tab-active' : ''}`} onClick={() => handleTabChange('input')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    Input
                </button>
                <button className={`wb-tab ${activeTab === 'output' ? 'wb-tab-active' : ''}`} onClick={() => handleTabChange('output')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                    Output
                </button>
                <button className={`wb-tab ${activeTab === 'agent-config' ? 'wb-tab-active' : ''}`} onClick={() => handleTabChange('agent-config')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                    Agent Config
                </button>
            </div>

            {/* Tab Content */}
            <div className="wb-workspace-content">

                {/* ── Input Tab ─────────────────────────────────────── */}
                {activeTab === 'input' && (
                    <div className="wb-input-tab">
                        <div className="wb-field-group">
                            <label className="wb-label">Source Concept</label>
                            <textarea
                                className="wb-textarea"
                                rows={8}
                                placeholder="Paste your corporate documentation here... (e.g., Master Services Agreement, AWS Architecture Docs, Clinical Trial Data)"
                                value={input.sourceConcept}
                                onChange={(e) => dispatch({ type: 'SET_INPUT', payload: { sourceConcept: e.target.value } })}
                            />
                        </div>
                        <div className="wb-field-group">
                            <label className="wb-label">Target Metaphor</label>
                            <input
                                type="text"
                                className="wb-input"
                                placeholder="e.g., A pirate ship crew, a medieval kingdom, a jazz ensemble"
                                value={input.targetMetaphor}
                                onChange={(e) => dispatch({ type: 'SET_INPUT', payload: { targetMetaphor: e.target.value } })}
                            />
                        </div>
                    </div>
                )}

                {/* ── Output Tab ────────────────────────────────────── */}
                {activeTab === 'output' && (
                    <div className="wb-output-tab">
                        {pipelineStatus === 'idle' && outputs.length === 0 && (
                            <div className="wb-empty-state">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                <p>Run the pipeline to see output here.</p>
                            </div>
                        )}

                        {pipelineStatus === 'running' && (
                            <div className="wb-loading-state">
                                <div className="wb-spinner" />
                                <p>Pipeline executing…</p>
                            </div>
                        )}

                        {(pipelineStatus === 'done' || pipelineStatus === 'error') && outputs.length > 0 && (
                            <div>
                                {/* Mode toggle */}
                                <div className="wb-output-toggle">
                                    <button className={`wb-toggle-btn ${outputMode === 'simple' ? 'wb-toggle-active' : ''}`} onClick={() => setOutputMode('simple')}>Final</button>
                                    <button className={`wb-toggle-btn ${outputMode === 'advanced' ? 'wb-toggle-active' : ''}`} onClick={() => setOutputMode('advanced')}>Per Agent</button>
                                </div>

                                {outputMode === 'simple' && (
                                    <div className="wb-markdown-output">
                                        {/* Show the last agent's output as final */}
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{outputs[outputs.length - 1]?.content || ''}</ReactMarkdown>
                                    </div>
                                )}

                                {outputMode === 'advanced' && (
                                    <div className="wb-phase-outputs">
                                        {/* Agent output tabs */}
                                        <div className="wb-agent-output-tabs">
                                            {agents.map((agent, idx) => {
                                                const hasOutput = outputs.find(o => o.agentId === agent.id);
                                                if (!hasOutput) return null;
                                                return (
                                                    <button
                                                        key={agent.id}
                                                        className={`wb-agent-output-tab ${(activeOutputAgent || outputs[0]?.agentId) === agent.id ? 'wb-agent-output-tab-active' : ''}`}
                                                        style={{ borderColor: AGENT_COLORS[idx % AGENT_COLORS.length] }}
                                                        onClick={() => setActiveOutputAgent(agent.id)}
                                                    >
                                                        {agent.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {/* Active agent output */}
                                        {(() => {
                                            const targetId = activeOutputAgent || outputs[0]?.agentId;
                                            const output = outputs.find(o => o.agentId === targetId);
                                            if (!output) return null;
                                            // Try JSON pretty-print first
                                            let content = output.content;
                                            try { content = JSON.stringify(JSON.parse(content), null, 2); } catch { /* not JSON */ }
                                            const isJson = content !== output.content;
                                            return isJson
                                                ? <pre className="wb-code-block">{content}</pre>
                                                : <div className="wb-markdown-output"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></div>;
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {pipelineStatus === 'error' && outputs.length === 0 && (
                            <div className="wb-error-state">
                                <span>❌</span>
                                <p>An error occurred during pipeline execution.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Agent Config Tab ──────────────────────────────── */}
                {activeTab === 'agent-config' && (
                    <div className="wb-config-tab">
                        {selectedAgent ? (
                            <>
                                {/* Header */}
                                <div className="wb-config-header">
                                    <div className="wb-config-dot" style={{ background: agentColor }} />
                                    <div style={{ flex: 1 }}>
                                        <input
                                            className="wb-config-agent-name-input"
                                            value={selectedAgent.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                            placeholder="Agent Name"
                                        />
                                        <input
                                            className="wb-config-agent-role-input"
                                            value={selectedAgent.role}
                                            onChange={(e) => updateField('role', e.target.value)}
                                            placeholder="Role description"
                                        />
                                    </div>
                                </div>

                                {/* System Prompt */}
                                <label className="wb-label">System Prompt</label>
                                <textarea
                                    className="wb-textarea wb-code-editor"
                                    rows={12}
                                    value={selectedAgent.instructions}
                                    onChange={(e) => updateField('instructions', e.target.value)}
                                    placeholder="Enter the system prompt for this agent..."
                                />




                                {/* Model & Temperature */}
                                <div className="wb-config-row">
                                    <div className="wb-field-group" style={{ flex: 1 }}>
                                        <label className="wb-label">Model</label>
                                        <select
                                            className="wb-select"
                                            value={selectedAgent.model}
                                            onChange={(e) => updateField('model', e.target.value)}
                                        >
                                            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                        </select>
                                    </div>
                                    <div className="wb-field-group" style={{ flex: 1 }}>
                                        <label className="wb-label">Temperature: {selectedAgent.temperature.toFixed(1)}</label>
                                        <input
                                            type="range"
                                            className="wb-range"
                                            min="0" max="2" step="0.1"
                                            value={selectedAgent.temperature}
                                            onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>

                                {/* Context Routing */}
                                <div className="wb-context-routing">
                                    <label className="wb-label">Context Routing</label>
                                    <p className="wb-config-hint" style={{ marginBottom: '8px' }}>What input does this agent see?</p>
                                    <div className="wb-context-options">
                                        {CONTEXT_MODES.map(cm => (
                                            <label key={cm.value} className="wb-context-option">
                                                <input
                                                    type="radio"
                                                    name={`ctx-${selectedAgentId}`}
                                                    checked={selectedAgent.contextRule.mode === cm.value}
                                                    onChange={() => updateContextRule({ mode: cm.value })}
                                                />
                                                <div>
                                                    <span className="wb-context-label">{cm.label}</span>
                                                    <span className="wb-context-desc">{cm.desc}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Specific agents multi-select */}
                                    {selectedAgent.contextRule.mode === 'specific_agents' && (
                                        <div className="wb-specific-agents">
                                            <label className="wb-label" style={{ marginTop: '8px' }}>Select source agents:</label>
                                            {agents.filter(a => a.id !== selectedAgentId).map(a => (
                                                <label key={a.id} className="wb-context-option" style={{ paddingBlock: '4px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAgent.contextRule.sources.includes(a.id)}
                                                        onChange={(e) => {
                                                            const sources = e.target.checked
                                                                ? [...selectedAgent.contextRule.sources, a.id]
                                                                : selectedAgent.contextRule.sources.filter(id => id !== a.id);
                                                            updateContextRule({ sources });
                                                        }}
                                                    />
                                                    <span className="wb-context-label">{a.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <p className="wb-config-hint">Changes take effect on the next pipeline run.</p>
                            </>
                        ) : (
                            <div className="wb-empty-state">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                                    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                                <p>Select an agent from the Explorer to view its configuration.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
