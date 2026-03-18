import React, { useState, useRef, useCallback } from 'react';
import { useWorkbench, selectAgents, selectExecutionMode, selectTemplates, IMAW_TEMPLATE } from '../lib/workbenchStore';

const AGENT_COLORS = ['#89b4fa', '#cba6f7', '#a6e3a1', '#f9e2af', '#fab387', '#f38ba8', '#74c7ec', '#94e2d5'];

export default function AgentExplorer() {
    const { state, dispatch } = useWorkbench();
    const agents = selectAgents(state);
    const executionMode = selectExecutionMode(state);
    const templates = selectTemplates(state);
    const selectedAgentId = state.ui.selectedAgentId;
    const phaseStatuses = state.ui.phaseStatuses;

    const [dragOverId, setDragOverId] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const dragItem = useRef(null);

    // ── Drag-to-reorder ──
    const handleDragStart = useCallback((e, agentId) => {
        dragItem.current = agentId;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', agentId);
    }, []);

    const handleDragOver = useCallback((e, agentId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverId(agentId);
    }, []);

    const handleDrop = useCallback((e, targetId) => {
        e.preventDefault();
        setDragOverId(null);
        const sourceId = dragItem.current;
        if (!sourceId || sourceId === targetId) return;
        const ids = agents.map(a => a.id);
        const fromIdx = ids.indexOf(sourceId);
        const toIdx = ids.indexOf(targetId);
        ids.splice(fromIdx, 1);
        ids.splice(toIdx, 0, sourceId);
        dispatch({ type: 'REORDER_AGENTS', payload: { agentIds: ids } });
        dragItem.current = null;
    }, [agents, dispatch]);

    const handleDragEnd = useCallback(() => {
        setDragOverId(null);
        dragItem.current = null;
    }, []);

    // ── Context menu (delete) ──
    const handleContextMenu = useCallback((e, agentId) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, agentId });
    }, []);

    const handleDelete = useCallback(() => {
        if (contextMenu) {
            dispatch({ type: 'DELETE_AGENT', payload: { id: contextMenu.agentId } });
            setContextMenu(null);
        }
    }, [contextMenu, dispatch]);

    // ── Add new agent ──
    const handleAddAgent = useCallback(() => {
        dispatch({ type: 'ADD_AGENT', payload: { name: 'New Agent', role: '', instructions: '' } });
    }, [dispatch]);

    // ── Template selection ──
    const handleLoadTemplate = useCallback((template) => {
        dispatch({ type: 'LOAD_TEMPLATE', payload: template });
        setShowTemplates(false);
    }, [dispatch]);

    // ── Status indicator ──
    const getStatusIndicator = (agentId) => {
        const phase = phaseStatuses[agentId];
        const status = phase?.status || 'idle';
        if (status === 'complete') return <span className="wb-status-dot wb-status-complete">✓</span>;
        if (status === 'running') return <span className="wb-status-dot wb-status-running" />;
        if (status === 'error') return <span className="wb-status-dot" style={{ background: '#f38ba8' }}>✕</span>;
        return <span className="wb-status-dot wb-status-idle" />;
    };

    const getAgentColor = (idx) => AGENT_COLORS[idx % AGENT_COLORS.length];

    return (
        <div className="wb-panel wb-explorer" onClick={() => { setContextMenu(null); setShowTemplates(false); }}>
            {/* Add Agent Button */}
            <button
                className="wb-add-agent-btn"
                onClick={(e) => { e.stopPropagation(); handleAddAgent(); }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Agent
            </button>

            {/* Agent List */}
            <div className="wb-explorer-list">
                {agents.map((agent, idx) => (
                    <button
                        key={agent.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, agent.id)}
                        onDragOver={(e) => handleDragOver(e, agent.id)}
                        onDrop={(e) => handleDrop(e, agent.id)}
                        onDragEnd={handleDragEnd}
                        onContextMenu={(e) => handleContextMenu(e, agent.id)}
                        onClick={() => dispatch({ type: 'SELECT_AGENT', payload: agent.id })}
                        className={`wb-agent-item ${selectedAgentId === agent.id ? 'wb-agent-selected' : ''} ${dragOverId === agent.id ? 'wb-agent-dragover' : ''}`}
                    >
                        <div className="wb-agent-order" style={{ color: getAgentColor(idx) }}>{idx + 1}</div>
                        <div className="wb-agent-info">
                            <span className="wb-agent-name">{agent.name}</span>
                            <span className="wb-agent-subtitle">{agent.role || 'No role set'}</span>
                        </div>
                        {getStatusIndicator(agent.id)}
                    </button>
                ))}
            </div>

            {/* Footer — execution mode + template */}
            <div className="wb-explorer-footer">
                <div className="wb-pipeline-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6,9 12,15 18,9" />
                    </svg>
                    <span style={{ textTransform: 'capitalize' }}>{executionMode} Pipeline</span>
                </div>
                <div style={{ position: 'relative' }}>
                    <button
                        className="wb-template-btn"
                        onClick={(e) => { e.stopPropagation(); setShowTemplates(!showTemplates); }}
                        title="Load template"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                        </svg>
                    </button>
                    {showTemplates && (
                        <div className="wb-template-dropdown" onClick={(e) => e.stopPropagation()}>
                            <div className="wb-template-header">Templates</div>
                            {templates.map((t, i) => (
                                <button key={t.id || i} className="wb-template-item" onClick={() => handleLoadTemplate(t)}>
                                    <span>{t.name}</span>
                                    <span className="wb-template-count">{t.agents.length} agents</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="wb-context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x, position: 'fixed' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={handleDelete} className="wb-context-item wb-context-danger">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                        Delete Agent
                    </button>
                </div>
            )}
        </div>
    );
}
