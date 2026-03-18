import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Help Tour Configuration ──────────────────────────────────────────────
// Each hotspot has a CSS selector target, position offsets, and explainer text.
const TOUR_STOPS = [
    {
        id: 1,
        selector: '.wb-panel.wb-explorer',
        label: 'Agent Explorer',
        description: 'Browse, add, and select agents in your pipeline. Click an agent to configure it in the Document Workspace.',
        anchor: 'top-left',  // where the badge sits relative to the section
    },
    {
        id: 2,
        selector: '.wb-panel.wb-workspace',
        label: 'Document Workspace',
        description: 'Configure the selected agent — set its name, role, and system prompt. The Constellation section below lets you visually compose personality traits.',
        anchor: 'top-left',
    },
    {
        id: 3,
        selector: '.constellation-section',
        label: 'Constellation Canvas',
        description: 'A visual prompt composer. Add personality fragments (nodes), drag them around, and double-click to add detailed descriptions. Connected traits blend together. The resolved output merges with the system prompt.',
        anchor: 'top-left',
    },
    {
        id: 4,
        selector: '.wb-panel.wb-command-chat',
        label: 'Command Chat',
        description: 'Chat with your agents here. Type a message and the pipeline will run each agent in sequence, producing a final synthesized response.',
        anchor: 'top-left',
    },
    {
        id: 5,
        selector: '.wb-key-badge, .wb-key-missing',
        label: 'API Key',
        description: 'Set your Gemini API key here. It\'s stored locally in your browser and sent directly to Google — never touches any server.',
        anchor: 'bottom-left',
    },
];

export default function HelpTour({ active, onClose }) {
    const [activeStop, setActiveStop] = useState(null);
    const [positions, setPositions] = useState([]);
    const overlayRef = useRef(null);

    // Calculate badge positions
    const computePositions = useCallback(() => {
        const result = [];
        for (const stop of TOUR_STOPS) {
            const el = document.querySelector(stop.selector);
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            let x, y;
            switch (stop.anchor) {
                case 'top-left':
                    x = rect.left + 16;
                    y = rect.top + 16;
                    break;
                case 'top-right':
                    x = rect.right - 32;
                    y = rect.top + 16;
                    break;
                case 'bottom-left':
                    x = rect.left - 8;
                    y = rect.bottom + 8;
                    break;
                default:
                    x = rect.left + 16;
                    y = rect.top + 16;
            }
            result.push({
                ...stop,
                x,
                y,
                rect,
            });
        }
        setPositions(result);
    }, []);

    useEffect(() => {
        if (!active) {
            setActiveStop(null);
            setPositions([]);
            return;
        }
        computePositions();
        const handleResize = () => computePositions();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [active, computePositions]);

    // Close on Escape
    useEffect(() => {
        if (!active) return;
        const handler = (e) => {
            if (e.key === 'Escape') {
                setActiveStop(null);
                onClose();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [active, onClose]);

    if (!active || positions.length === 0) return null;

    const handleBadgeClick = (e, stopId) => {
        e.stopPropagation();
        setActiveStop(prev => prev === stopId ? null : stopId);
    };

    const handleOverlayClick = () => {
        if (activeStop) {
            setActiveStop(null);
        } else {
            onClose();
        }
    };

    return (
        <div
            ref={overlayRef}
            className="help-tour-overlay"
            onClick={handleOverlayClick}
        >
            {/* Numbered badges */}
            {positions.map(stop => {
                const isActive = activeStop === stop.id;
                return (
                    <div key={stop.id}>
                        {/* Badge */}
                        <button
                            className={`help-tour-badge ${isActive ? 'help-tour-badge-active' : ''}`}
                            style={{ left: stop.x, top: stop.y }}
                            onClick={(e) => handleBadgeClick(e, stop.id)}
                            aria-label={`Tour stop ${stop.id}: ${stop.label}`}
                        >
                            {stop.id}
                        </button>

                        {/* Tooltip card */}
                        {isActive && (
                            <div
                                className="help-tour-card"
                                style={{
                                    left: Math.min(stop.x + 36, window.innerWidth - 320),
                                    top: stop.y - 8,
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="help-tour-card-header">
                                    <span className="help-tour-card-number">{stop.id}</span>
                                    <span className="help-tour-card-title">{stop.label}</span>
                                </div>
                                <p className="help-tour-card-desc">{stop.description}</p>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Dismiss hint */}
            <div className="help-tour-dismiss">
                Click anywhere to dismiss · Press <kbd>Esc</kbd> to close
            </div>
        </div>
    );
}
