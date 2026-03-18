import React, { useState } from 'react';

function formatMs(ms) {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

const PHASE_META = [
    { id: 'decomposition', name: 'Decomposition', label: 'Phase 1', color: '#89b4fa' },
    { id: 'mapping', name: 'Mapping', label: 'Phase 2', color: '#cba6f7' },
    { id: 'synthesis', name: 'Synthesis', label: 'Phase 3', color: '#a6e3a1' },
];

export default function ExecutionLog({ phases, pipelineStatus, onRunPipeline, isRunnable }) {
    const [expandedPhase, setExpandedPhase] = useState(null);

    const getStatusIcon = (status) => {
        if (status === 'complete') return <span className="wb-exec-icon wb-exec-complete">✓</span>;
        if (status === 'running') return <span className="wb-exec-icon wb-exec-running"><span className="wb-mini-spinner" /></span>;
        return <span className="wb-exec-icon wb-exec-pending">○</span>;
    };

    return (
        <div className="wb-panel wb-execution">

            <div className="wb-exec-content">
                {/* Run Button */}
                <button
                    className="wb-run-btn"
                    disabled={!isRunnable || pipelineStatus === 'running'}
                    onClick={onRunPipeline}
                >
                    {pipelineStatus === 'running' ? (
                        <>
                            <span className="wb-mini-spinner" />
                            Executing…
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            Run Pipeline
                        </>
                    )}
                </button>

                {/* Execution Mode Badge */}
                <div className="wb-exec-mode">
                    <span className="wb-exec-mode-badge">Sequential</span>
                    <span className="wb-exec-mode-label">Execution Mode</span>
                </div>

                {/* Phase List */}
                <div className="wb-phase-list">
                    {PHASE_META.map((meta) => {
                        const phase = phases[meta.id] || {};
                        const isExpanded = expandedPhase === meta.id && phase.status === 'complete';
                        return (
                            <div key={meta.id} className="wb-phase-item">
                                <button
                                    className="wb-phase-row"
                                    onClick={() => phase.status === 'complete' && setExpandedPhase(isExpanded ? null : meta.id)}
                                    disabled={phase.status !== 'complete'}
                                >
                                    {getStatusIcon(phase.status)}
                                    <div className="wb-phase-info">
                                        <span className="wb-phase-label" style={{ color: meta.color }}>{meta.label}</span>
                                        <span className="wb-phase-name">{meta.name}</span>
                                    </div>
                                    <span className="wb-phase-time">{formatMs(phase.elapsed)}</span>
                                    {phase.status === 'complete' && (
                                        <svg
                                            className={`wb-phase-chevron ${isExpanded ? 'wb-chevron-open' : ''}`}
                                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="wb-phase-detail">
                                        <div className="wb-detail-section">
                                            <span className="wb-detail-label">Prompt Sent</span>
                                            <pre className="wb-detail-code">{phase.prompt}</pre>
                                        </div>
                                        <div className="wb-detail-section">
                                            <span className="wb-detail-label">Response Received</span>
                                            <pre className="wb-detail-code">{phase.response}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
