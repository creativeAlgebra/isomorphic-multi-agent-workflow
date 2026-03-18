import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useWorkbench, selectConstellation } from '../lib/workbenchStore';
import { FRAGMENT_COLORS } from '../lib/constellationResolver';

// ── ConstellationCanvas ─────────────────────────────────────────────────
// A spatial prompt composer embedded in the Agent Config tab.
// Fragments = draggable personality nodes, operators = Blend/Amplify/Negate.

export default function ConstellationCanvas({ agentId }) {
    const { state, dispatch } = useWorkbench();
    const constellation = selectConstellation(state, agentId);
    const { fragments, connections, resolvedText } = constellation;

    const [isExpanded, setIsExpanded] = useState(true);
    const [newFragLabel, setNewFragLabel] = useState('');
    const [showAddInput, setShowAddInput] = useState(false);
    const [dragging, setDragging] = useState(null); // { fragmentId, offsetX, offsetY }
    const [connecting, setConnecting] = useState(null); // { sourceId, mouseX, mouseY }
    const [contextMenu, setContextMenu] = useState(null); // { fragmentId, x, y }
    const [selectedId, setSelectedId] = useState(null);

    // ── Edit Modal state ─────────────────────────────────────────────────
    const [editModal, setEditModal] = useState(null); // { fragmentId, label, description }

    const svgRef = useRef(null);
    const inputRef = useRef(null);

    // Focus add input when shown
    useEffect(() => {
        if (showAddInput && inputRef.current) inputRef.current.focus();
    }, [showAddInput]);

    // Close context menu on click outside
    useEffect(() => {
        const handler = () => setContextMenu(null);
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, []);

    // ── Fragment CRUD ────────────────────────────────────────────────────
    const addFragment = () => {
        if (!newFragLabel.trim()) return;
        dispatch({ type: 'ADD_FRAGMENT', payload: { agentId, label: newFragLabel.trim() } });
        setNewFragLabel('');
        setShowAddInput(false);
    };

    const deleteFragment = (fragId) => {
        dispatch({ type: 'DELETE_FRAGMENT', payload: { agentId, fragmentId: fragId } });
        setContextMenu(null);
        if (selectedId === fragId) setSelectedId(null);
    };

    const setOperator = (fragId, op) => {
        const frag = fragments.find(f => f.id === fragId);
        const newOp = frag?.operator === op ? 'none' : op;
        dispatch({ type: 'SET_FRAGMENT_OPERATOR', payload: { agentId, fragmentId: fragId, operator: newOp } });
        setContextMenu(null);
    };

    const openEditModal = (fragId) => {
        const frag = fragments.find(f => f.id === fragId);
        if (frag) {
            setEditModal({
                fragmentId: fragId,
                label: frag.label,
                description: frag.description || '',
            });
        }
        setContextMenu(null);
    };

    const saveEditModal = () => {
        if (editModal && editModal.label.trim()) {
            dispatch({
                type: 'UPDATE_FRAGMENT',
                payload: {
                    agentId,
                    fragmentId: editModal.fragmentId,
                    updates: {
                        label: editModal.label.trim(),
                        description: editModal.description.trim(),
                    },
                },
            });
        }
        setEditModal(null);
    };

    const cancelEditModal = () => setEditModal(null);

    const clearCanvas = () => {
        if (fragments.length === 0) return;
        dispatch({ type: 'CLEAR_CONSTELLATION', payload: { agentId } });
    };

    // ── Drag Handling ────────────────────────────────────────────────────
    const getSVGPoint = useCallback((e) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    const onFragMouseDown = (e, fragId) => {
        if (e.button === 2) return; // right click handled by context menu
        e.stopPropagation();
        const frag = fragments.find(f => f.id === fragId);
        if (!frag) return;
        const pt = getSVGPoint(e);
        setDragging({ fragmentId: fragId, offsetX: pt.x - frag.position.x, offsetY: pt.y - frag.position.y });
        setSelectedId(fragId);
    };

    const onMouseMove = useCallback((e) => {
        if (dragging) {
            const pt = getSVGPoint(e);
            const x = Math.max(0, Math.min(500, pt.x - dragging.offsetX));
            const y = Math.max(0, Math.min(250, pt.y - dragging.offsetY));
            dispatch({ type: 'UPDATE_FRAGMENT', payload: { agentId, fragmentId: dragging.fragmentId, updates: { position: { x, y } } } });
        }
        if (connecting) {
            const pt = getSVGPoint(e);
            setConnecting(prev => ({ ...prev, mouseX: pt.x, mouseY: pt.y }));
        }
    }, [dragging, connecting, agentId, dispatch, getSVGPoint]);

    const onMouseUp = useCallback(() => {
        setDragging(null);
        setConnecting(null);
    }, []);

    // ── Connection Drag ──────────────────────────────────────────────────
    const onConnectorMouseDown = (e, fragId) => {
        e.stopPropagation();
        const pt = getSVGPoint(e);
        setConnecting({ sourceId: fragId, mouseX: pt.x, mouseY: pt.y });
    };

    const onFragMouseUp = (e, fragId) => {
        if (connecting && connecting.sourceId !== fragId) {
            dispatch({ type: 'ADD_CONNECTION', payload: { agentId, sourceFragmentId: connecting.sourceId, targetFragmentId: fragId } });
        }
        setConnecting(null);
    };

    // ── Context Menu ─────────────────────────────────────────────────────
    const onContextMenu = (e, fragId) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ fragmentId: fragId, x: e.clientX, y: e.clientY });
    };

    // ── Bezier Helper ────────────────────────────────────────────────────
    const getBezierPath = (x1, y1, x2, y2) => {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const dx = Math.abs(x2 - x1) * 0.3;
        return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    };

    const fragWidth = (frag) => Math.max(100, frag.label.length * 8 + 32);
    const fragCenter = (frag) => ({ x: frag.position.x + fragWidth(frag) / 2, y: frag.position.y + 16 });

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="constellation-section">
            <div className="constellation-header" onClick={() => setIsExpanded(!isExpanded)}>
                <span className="constellation-toggle">{isExpanded ? '▾' : '▸'}</span>
                <span className="constellation-title">Constellation</span>
                <span className="constellation-badge">optional</span>
            </div>

            {isExpanded && (
                <div className="constellation-helper">
                    Add personality traits that shape this agent's voice. Double-click any node to edit it.
                </div>
            )}

            {isExpanded && (
                <>
                    <div className="constellation-canvas-wrapper">
                        <svg
                            ref={svgRef}
                            className="constellation-svg"
                            viewBox="0 0 500 250"
                            onMouseMove={onMouseMove}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseUp}
                            onClick={() => { setSelectedId(null); setContextMenu(null); }}
                        >
                            {/* Grid dots */}
                            <defs>
                                <pattern id="grid-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.06)" />
                                </pattern>
                            </defs>
                            <rect width="500" height="250" fill="url(#grid-dots)" />

                            {/* Connection lines */}
                            {connections.map(conn => {
                                const src = fragments.find(f => f.id === conn.sourceFragmentId);
                                const tgt = fragments.find(f => f.id === conn.targetFragmentId);
                                if (!src || !tgt) return null;
                                const s = fragCenter(src);
                                const t = fragCenter(tgt);
                                return (
                                    <g key={conn.id}>
                                        <path
                                            d={getBezierPath(s.x, s.y, t.x, t.y)}
                                            stroke="rgba(137,180,250,0.4)"
                                            strokeWidth="2"
                                            fill="none"
                                            strokeDasharray="6 3"
                                        />
                                        <text
                                            x={(s.x + t.x) / 2}
                                            y={(s.y + t.y) / 2 - 6}
                                            textAnchor="middle"
                                            fill="rgba(137,180,250,0.6)"
                                            fontSize="8"
                                            fontWeight="600"
                                            letterSpacing="1"
                                        >BLEND</text>
                                    </g>
                                );
                            })}

                            {/* Active connection drag line */}
                            {connecting && (() => {
                                const src = fragments.find(f => f.id === connecting.sourceId);
                                if (!src) return null;
                                const s = fragCenter(src);
                                return (
                                    <line
                                        x1={s.x} y1={s.y}
                                        x2={connecting.mouseX} y2={connecting.mouseY}
                                        stroke="rgba(137,180,250,0.5)"
                                        strokeWidth="2"
                                        strokeDasharray="4 4"
                                    />
                                );
                            })()}

                            {/* Fragments */}
                            {fragments.map((frag, idx) => {
                                const color = FRAGMENT_COLORS[idx % FRAGMENT_COLORS.length];
                                const isAmplified = frag.operator === 'amplify';
                                const isNegated = frag.operator === 'negate';
                                const isSelected = selectedId === frag.id;
                                const opacity = isNegated ? 0.35 : 1;
                                const w = fragWidth(frag);
                                const hasDesc = frag.description && frag.description.trim();

                                return (
                                    <g
                                        key={frag.id}
                                        transform={`translate(${frag.position.x}, ${frag.position.y})`}
                                        opacity={opacity}
                                        style={{ cursor: 'grab' }}
                                        onMouseDown={(e) => onFragMouseDown(e, frag.id)}
                                        onMouseUp={(e) => onFragMouseUp(e, frag.id)}
                                        onContextMenu={(e) => onContextMenu(e, frag.id)}
                                        onDoubleClick={() => openEditModal(frag.id)}
                                    >
                                        {/* Glow for amplified */}
                                        {isAmplified && (
                                            <rect
                                                x="-4" y="-4"
                                                width={w + 8} height="40"
                                                rx="18"
                                                fill="none"
                                                stroke={color}
                                                strokeWidth="2"
                                                className="constellation-glow"
                                            />
                                        )}

                                        {/* Fragment pill background */}
                                        <rect
                                            width={w} height="32"
                                            rx="16"
                                            fill={isSelected ? color : `${color}22`}
                                            stroke={color}
                                            strokeWidth={isSelected ? "2" : "1"}
                                        />

                                        {/* Fragment label */}
                                        <text
                                            x={w / 2} y="20"
                                            textAnchor="middle"
                                            fill={isSelected ? '#0f172a' : '#e2e8f0'}
                                            fontSize="11"
                                            fontWeight="500"
                                            style={{ pointerEvents: 'none', textDecoration: isNegated ? 'line-through' : 'none' }}
                                        >
                                            {frag.label}
                                        </text>

                                        {/* Description indicator dot */}
                                        {hasDesc && (
                                            <circle
                                                cx={w / 2} cy="30"
                                                r="2"
                                                fill={color}
                                                opacity="0.7"
                                            />
                                        )}

                                        {/* Operator badge */}
                                        {isAmplified && (
                                            <text x={w - 10} y="8" fill={color} fontSize="12" fontWeight="bold">↑</text>
                                        )}
                                        {isNegated && (
                                            <text x={w - 10} y="8" fill="#f87171" fontSize="12" fontWeight="bold">⊘</text>
                                        )}

                                        {/* Connection handle (right edge) */}
                                        <circle
                                            cx={w} cy="16" r="5"
                                            fill={color}
                                            opacity="0"
                                            style={{ cursor: 'crosshair' }}
                                            onMouseDown={(e) => onConnectorMouseDown(e, frag.id)}
                                        />
                                        <circle
                                            cx={w} cy="16" r="4"
                                            fill="none"
                                            stroke={color}
                                            strokeWidth="1.5"
                                            opacity={isSelected ? "0.8" : "0"}
                                            style={{ pointerEvents: 'none' }}
                                            className="constellation-handle"
                                        />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Context Menu */}
                        {contextMenu && (
                            <div
                                className="constellation-context-menu"
                                style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button onClick={() => openEditModal(contextMenu.fragmentId)}>✏️ Edit</button>
                                <button onClick={() => setOperator(contextMenu.fragmentId, 'amplify')}>
                                    ↑ {fragments.find(f => f.id === contextMenu.fragmentId)?.operator === 'amplify' ? 'Un-amplify' : 'Amplify'}
                                </button>
                                <button onClick={() => setOperator(contextMenu.fragmentId, 'negate')}>
                                    ⊘ {fragments.find(f => f.id === contextMenu.fragmentId)?.operator === 'negate' ? 'Un-negate' : 'Negate'}
                                </button>
                                <hr />
                                <button className="danger" onClick={() => deleteFragment(contextMenu.fragmentId)}>🗑 Delete</button>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="constellation-controls">
                        {showAddInput ? (
                            <div className="constellation-add-form">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="constellation-add-input"
                                    placeholder="e.g. academic rigor, playful, concise…"
                                    value={newFragLabel}
                                    onChange={(e) => setNewFragLabel(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') addFragment(); if (e.key === 'Escape') setShowAddInput(false); }}
                                />
                                <button className="constellation-btn constellation-btn-confirm" onClick={addFragment}>Add</button>
                                <button className="constellation-btn" onClick={() => setShowAddInput(false)}>Cancel</button>
                            </div>
                        ) : (
                            <div className="constellation-actions">
                                <button className="constellation-btn constellation-btn-primary" onClick={() => setShowAddInput(true)}>
                                    + Add Fragment
                                </button>
                                {fragments.length > 0 && (
                                    <button className="constellation-btn constellation-btn-muted" onClick={clearCanvas}>
                                        Clear Canvas
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {resolvedText && (
                        <div className="constellation-preview">
                            <label className="constellation-preview-label">Preview: resolved output</label>
                            <p className="constellation-preview-text">
                                <strong>Personality & Style:</strong> {resolvedText}
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* ── Edit Fragment Modal ─────────────────────────────────────── */}
            {editModal && (
                <div className="constellation-modal-overlay" onClick={cancelEditModal}>
                    <div className="constellation-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="constellation-modal-title">Edit Fragment</h3>

                        <label className="constellation-modal-label">Name</label>
                        <input
                            type="text"
                            className="constellation-modal-input"
                            value={editModal.label}
                            onChange={(e) => setEditModal(prev => ({ ...prev, label: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) saveEditModal(); }}
                            autoFocus
                        />

                        <label className="constellation-modal-label">
                            Description
                            <span className="constellation-modal-hint">Add context about how this trait should influence the agent</span>
                        </label>
                        <textarea
                            className="constellation-modal-textarea"
                            value={editModal.description}
                            onChange={(e) => setEditModal(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="e.g. Use short, punchy sentences. Avoid jargon. Prefer metaphors from nature."
                            rows={4}
                        />

                        <div className="constellation-modal-actions">
                            <button className="constellation-btn constellation-btn-primary" onClick={saveEditModal}>
                                Save
                            </button>
                            <button className="constellation-btn" onClick={cancelEditModal}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
