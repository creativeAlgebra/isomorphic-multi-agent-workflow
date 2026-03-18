import React, { useState, useEffect } from 'react';
import { WorkbenchProvider, useWorkbench, PRELOADED_EXAMPLE } from '../lib/workbenchStore';
import { PROVIDERS, getStoredProvider, getStoredApiKey, setStoredApiKey, setStoredProvider } from '../lib/apiProviders';
import AgentExplorer from './AgentExplorer';
import DocumentWorkspace from './DocumentWorkspace';
import CommandChat from './CommandChat';
import HelpTour from './HelpTour';
import '../workbench.css';

function WorkbenchInner() {
    const { state, dispatch } = useWorkbench();

    // API Key — provider-aware
    const [provider, setProviderLocal] = useState(getStoredProvider);
    const [apiKey, setApiKeyLocal] = useState(() => getStoredApiKey(getStoredProvider()));
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [showTour, setShowTour] = useState(false);

    const activeConfig = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

    const handleProviderChange = (id) => {
        setProviderLocal(id);
        setStoredProvider(id);
        setApiKeyLocal(getStoredApiKey(id));
    };
    const handleApiKeyChange = (key) => {
        setApiKeyLocal(key);
        setStoredApiKey(provider, key);
    };

    // Intro modal — show once on first visit
    const [showIntro, setShowIntro] = useState(() => !localStorage.getItem('wb_intro_dismissed_v3'));
    const dismissIntro = () => {
        localStorage.setItem('wb_intro_dismissed_v3', '1');
        setShowIntro(false);
    };
    const loadExample = () => {
        dispatch({ type: 'LOAD_PRELOADED_EXAMPLE', payload: PRELOADED_EXAMPLE });
        localStorage.setItem('wb_intro_dismissed_v3', '1');
        setShowIntro(false);
    };

    return (
        <div className="wb-root">

            {/* IDE Toolbar */}
            <div className="wb-toolbar">
                <div className="wb-toolbar-section wb-toolbar-left">
                    <span className="wb-toolbar-label">Agent Explorer</span>
                </div>
                <div className="wb-toolbar-section wb-toolbar-center">
                    <span className="wb-toolbar-label">Document Workspace</span>
                </div>
                <div className="wb-toolbar-section wb-toolbar-right">
                    <span className="wb-toolbar-label">Command Chat</span>
                    <div className="wb-toolbar-spacer"></div>
                    <button
                        className={`wb-help-btn ${showTour ? 'wb-help-btn-active' : ''}`}
                        onClick={() => setShowTour(!showTour)}
                        title="Toggle guided tour"
                    >
                        ?
                    </button>
                    {apiKey ? (
                        <button className="wb-key-badge" onClick={() => setShowKeyInput(!showKeyInput)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                            {activeConfig.label} Key Set
                        </button>
                    ) : (
                        <button className="wb-key-badge wb-key-missing" onClick={() => setShowKeyInput(true)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                            Set API Key
                        </button>
                    )}
                </div>
            </div>

            {/* Intro Modal — first visit only */}
            {showIntro && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                }}>
                    <div style={{
                        background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 16, maxWidth: 520, width: '90%', padding: '36px 32px',
                        color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                    }}>
                        <div style={{ fontSize: 28, marginBottom: 4 }}>🎛️</div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#fff' }}>
                            The Enterprise Mixing Board for AI State
                        </h2>

                        <p style={{ fontSize: 14, lineHeight: 1.7, color: '#94a3b8', marginBottom: 8 }}>
                            Don't settle for black-box generation. Pause the pipeline, audit the JSON logic, and steer the state translation with diagnosable, human-in-the-loop validation.
                        </p>

                        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#64748b', marginBottom: 24 }}>
                            Load a worked enterprise example to explore the exact JSON output, or supply your own API key to orchestrate a new logic translation.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button
                                onClick={loadExample}
                                style={{
                                    width: '100%', padding: '12px 0',
                                    background: '#E8722A', color: '#fff',
                                    border: 'none', borderRadius: 8,
                                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#d4651f'}
                                onMouseLeave={(e) => e.target.style.background = '#E8722A'}
                            >
                                Load Example: Legal MSA → Sales Playbook
                            </button>
                            <button
                                onClick={dismissIntro}
                                style={{
                                    width: '100%', padding: '10px 0',
                                    background: 'transparent', color: '#94a3b8',
                                    border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8,
                                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => { e.target.style.borderColor = 'rgba(148,163,184,0.4)'; e.target.style.color = '#e2e8f0'; }}
                                onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(148,163,184,0.2)'; e.target.style.color = '#94a3b8'; }}
                            >
                                Start from scratch →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* API Key Input Overlay */}
            {showKeyInput && (
                <div className="wb-key-overlay">
                    <div className="wb-key-dialog">
                        <h3>API Key</h3>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                            {PROVIDERS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleProviderChange(p.id)}
                                    style={{
                                        flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 600,
                                        border: '1px solid', borderRadius: 6, cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        background: provider === p.id ? '#fff' : 'transparent',
                                        color: provider === p.id ? '#0f172a' : '#94a3b8',
                                        borderColor: provider === p.id ? '#e2e8f0' : 'rgba(148,163,184,0.2)',
                                    }}
                                >
                                    {p.icon} {p.label}
                                </button>
                            ))}
                        </div>
                        <p>Your key is stored locally and sent directly to {activeConfig.label}. It never touches any server.</p>
                        <input
                            type="password"
                            className="wb-input"
                            placeholder={activeConfig.placeholder}
                            value={apiKey}
                            onChange={(e) => handleApiKeyChange(e.target.value)}
                            autoFocus
                        />
                        {activeConfig.corsWarning && (
                            <p style={{ fontSize: 11, color: '#b45309', marginTop: 8 }}>
                                ⚠️ Anthropic blocks direct browser requests (CORS). A proxy is required.
                            </p>
                        )}
                        <div className="wb-key-actions">
                            <button className="wb-key-save" onClick={() => setShowKeyInput(false)}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3-Panel Layout */}
            <div className="wb-layout">
                <AgentExplorer />
                <DocumentWorkspace />
                <CommandChat />
            </div>

            {/* Help Tour */}
            <HelpTour active={showTour} onClose={() => setShowTour(false)} />
        </div>
    );
}

export default function WorkbenchLite() {
    return (
        <WorkbenchProvider>
            <WorkbenchInner />
        </WorkbenchProvider>
    );
}
