import React, { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import paperContent from './paper.md?raw';
import engineeringContent from './content/engineering_cascading_rollup.md?raw';

import WorkbenchLite from './components/WorkbenchLite';

/* ── Paper Header + Audio Bar ────────────────────────────────── */
function PaperHeader() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [copied, setCopied] = useState(false);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a || audioError) return;
    if (a.paused) {
      a.play().then(() => { setIsPlaying(true); setShowControls(true); }).catch(() => setAudioError(true));
    } else {
      a.pause(); setIsPlaying(false);
    }
  }, [audioError]);

  const skip = (sec) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(duration, a.currentTime + sec));
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 1.75, 2, 0.75];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="paper-toolbar">
      {/* ─── Header ─── */}
      <div className="text-center mb-10 pt-12 sm:pt-16">
        <p className="text-sm text-gray-400 tracking-wide mb-6">March 8th, 2026 <span className="text-gray-300 mx-1">·</span> Author: <a href="https://www.linkedin.com/in/garciarandall/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 underline underline-offset-2 transition-colors">Randall Garcia</a></p>
        <h1 className="text-4xl sm:text-5xl md:text-[3.25rem] font-semibold text-[#0f172a] leading-[1.15] tracking-[-0.02em] max-w-3xl mx-auto mb-5 font-sans">
          Designing and Validating a Generative Control Architecture for Safe Pedagogical Translation
        </h1>
        <p className="text-base text-gray-400 leading-relaxed max-w-xl mx-auto mb-8">
          Introducing IMAW — a multi-agent architecture that gives practitioners structured, inspectable control over metaphor construction.
        </p>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-full border border-gray-200 text-[#0f172a] hover:bg-gray-50 transition-colors"
        >
          Download the whitepaper ↗
        </button>
      </div>

      {/* ─── Divider ─── */}
      <div className="border-t border-gray-100" />

      {/* ─── Audio element ─── */}
      <audio
        ref={audioRef}
        src="/paper-audio.mp3"
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onEnded={() => { setIsPlaying(false); setShowControls(false); }}
        onError={() => setAudioError(true)}
      />

      {/* ─── Audio Bar: single row ─── */}
      <div className="flex items-center justify-between py-3.5 mb-6">
        {/* Left: play + label + duration OR compact player */}
        {showControls && !audioError ? (
          /* ── Playing: compact transport ── */
          <div className="flex items-center gap-3">
            <button onClick={() => skip(-15)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Back 15s">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </button>
            <button
              onClick={togglePlay}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-[#0f172a] text-white flex items-center justify-center hover:bg-[#0b1120] transition-colors"
            >
              {isPlaying ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button onClick={() => skip(15)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Forward 15s">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
              </svg>
            </button>
            <button
              onClick={cycleSpeed}
              className="text-xs font-semibold text-gray-400 hover:text-gray-700 border border-gray-200 rounded-full px-2 py-0.5 transition-colors"
              title="Playback speed"
            >
              {playbackRate}×
            </button>
            <span className="text-sm font-mono text-gray-400 ml-1">
              {fmt(currentTime)} <span className="text-gray-300">/</span> {fmt(duration)}
            </span>
          </div>
        ) : (
          /* ── Idle: play CTA ── */
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                audioError
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-[#0f172a] text-white hover:bg-[#0b1120]'
              }`}
            >
              <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <span className="text-sm font-medium text-[#0f172a]">
              {audioError ? 'Audio coming soon' : 'Listen to article'}
            </span>
            {duration > 0 && !audioError && (
              <span className="text-sm text-gray-400">{fmt(duration)}</span>
            )}
          </div>
        )}

        {/* Right: Share */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
          </svg>
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>
    </div>
  );
}


const processImawMappings = (text, mappingJsonStr) => {
  try {
    if (!text) return "";
    let newText = text;
    const mapping = JSON.parse(mappingJsonStr);
    mapping.entity_mappings.forEach(m => {
      const safeMetaphor = m.metaphorical_entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${safeMetaphor})\\b`, 'g');
      newText = newText.replace(regex, `[$1](#map:${encodeURIComponent(m.abstract_entity)})`);
    });
    return newText;
  } catch (e) {
    return text;
  }
};

const experiments = [
  {
    id: 'msa',
    title: 'MSA to Sales Playbook',
    source: 'Master Services Agreement',
    targetMetaphor: 'Deal Desk Playbook',
    objective: "Map the legal constraints of an MSA into a Sales Playbook."
  }
];

function HeroTerminal() {
  const [step, setStep] = React.useState(0);
  const sourceText = "Master Services Agreement";
  const targetText = "Deal Desk Playbook";
  const finalMessage = "Pipeline complete. Enterprise Audit Trail generated.";
  
  const [sourceTyped, setSourceTyped] = React.useState(0);
  const [targetTyped, setTargetTyped] = React.useState(0);
  const [finalTyped, setFinalTyped] = React.useState(0);

  const ctas = ["foundational research", "download on github"];
  const [ctaIndex, setCtaIndex] = React.useState(0);
  const [ctaCharIndex, setCtaCharIndex] = React.useState(0);
  const [isDeletingCta, setIsDeletingCta] = React.useState(false);

  const terminalContainerRef = React.useRef(null);
  const [isUserScrolling, setIsUserScrolling] = React.useState(false);

  const handleScroll = () => {
    if (!terminalContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = terminalContainerRef.current;
    
    // If the user has scrolled up from the bottom (giving a 20px threshold)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;
    setIsUserScrolling(!isAtBottom);
  };

  // Auto-scroll to bottom of the internal container as content populates
  React.useEffect(() => {
    if (terminalContainerRef.current && !isUserScrolling) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [step, sourceTyped, targetTyped, finalTyped, ctaCharIndex, isUserScrolling]);

  // Main sequence
  React.useEffect(() => {
    let timer;
    if (step === 0) {
      // Pause at start to show banner before prompting
      timer = setTimeout(() => setStep(1), 1000);
    } else if (step === 1) {
      if (sourceTyped < sourceText.length) {
        timer = setTimeout(() => setSourceTyped(s => s + 1), 30);
      } else {
        timer = setTimeout(() => setStep(2), 500);
      }
    } else if (step === 2) {
      if (targetTyped < targetText.length) {
        timer = setTimeout(() => setTargetTyped(s => s + 1), 40);
      } else {
        timer = setTimeout(() => setStep(3), 500);
      }
    } else if (step === 3) {
      timer = setTimeout(() => setStep(4), 800); // bootstrapping
    } else if (step === 4) {
      timer = setTimeout(() => setStep(5), 600); // decompose
    } else if (step === 5) {
      timer = setTimeout(() => setStep(6), 800); // map
    } else if (step === 6) {
      timer = setTimeout(() => setStep(7), 2500); // synthesize
    } else if (step === 7) {
      if (finalTyped < finalMessage.length) {
        timer = setTimeout(() => setFinalTyped(s => s + 1), 20);
      } else {
        timer = setTimeout(() => setStep(8), 500);
      }
    }
    return () => clearTimeout(timer);
  }, [step, sourceTyped, targetTyped, finalTyped, sourceText.length, targetText.length, finalMessage.length]);

  // CTA Looping Effect
  React.useEffect(() => {
    if (step < 8) return;

    let timer;
    const currentCta = ctas[ctaIndex];

    if (isDeletingCta) {
      if (ctaCharIndex > 0) {
        timer = setTimeout(() => setCtaCharIndex(prev => prev - 1), 30);
      } else {
        setIsDeletingCta(false);
        setCtaIndex((prev) => (prev + 1) % ctas.length);
      }
    } else {
      if (ctaCharIndex < currentCta.length) {
        timer = setTimeout(() => setCtaCharIndex(prev => prev + 1), 60);
      } else {
        timer = setTimeout(() => setIsDeletingCta(true), 2000); // Pause to read
      }
    }
    return () => clearTimeout(timer);
  }, [step, ctaIndex, ctaCharIndex, isDeletingCta]);

  return (
    <>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-cli-step { animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      
      <div className="bg-[#0f1219] rounded-2xl border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative w-full h-[32rem] sm:h-[34rem] lg:h-[38rem] overflow-hidden">
        {/* macOS Window Header */}
        <div className="h-12 bg-[#050810] border-b border-gray-800/80 flex shrink-0 items-center px-4 gap-2 relative z-20">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500/80"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80"></div>
          <div className="mx-auto font-mono text-xs text-gray-500 pr-16 flex items-center gap-2 select-none">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M4 6h16M4 12h16M4 18h16" /></svg>
            imaw-pipeline
          </div>
        </div>

        {/* Terminal Content (Scrollable) */}
        <div 
          ref={terminalContainerRef}
          onScroll={handleScroll}
          className="p-6 sm:p-8 flex-1 font-mono text-[13px] sm:text-sm leading-relaxed overflow-y-auto relative text-left scroll-smooth"
        >
          {/* Decorative background glow */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 text-gray-300 w-full pb-4">
            
            {/* Shaded Block Banner */}
            <div className="mb-8 animate-cli-step">
              <div className="flex gap-4 sm:gap-6 items-center">
                <div className="text-orange-500 leading-none select-none text-[10px] sm:text-xs">
                  <span className="text-orange-700 tracking-widest">████</span><span className="text-orange-800 tracking-widest">██</span><br/>
                  <span className="text-orange-600 tracking-widest">████</span><span className="text-orange-700 tracking-widest">██</span> <span className="text-orange-400 tracking-widest">██</span><span className="text-orange-500 tracking-widest">▓▓</span><span className="text-orange-600 tracking-widest">▒▒</span><span className="text-orange-800 tracking-widest">░░</span><br/>
                  <span className="text-orange-500 tracking-widest">████</span><span className="text-orange-600 tracking-widest">██</span><br/>
                </div>
                <div>
                  <h3 className="text-orange-400 font-bold tracking-[0.2em] text-sm sm:text-base">iMAW ENGINE <span className="text-orange-700">v1.2</span></h3>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Data Isolation</p>
                </div>
              </div>
              <div className="mt-6 border-b border-orange-900/40 w-full max-w-sm" />
            </div>

            {/* Inputs */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold">?</span>
                <span className="text-gray-400">Source system:</span>
                <span className="text-blue-300">
                  {sourceText.slice(0, sourceTyped)}
                  {step <= 1 && sourceTyped < sourceText.length && <span className="w-2.5 h-4 sm:h-5 bg-orange-500 inline-block animate-pulse align-middle ml-1"></span>}
                </span>
              </div>
              
              {step >= 2 && (
                <div className="flex items-center gap-2 animate-[fadeIn_0.1s_ease-out]">
                  <span className="text-purple-400 font-bold">?</span>
                  <span className="text-gray-400">Target domain:</span>
                  <span className="text-emerald-300">
                    {targetText.slice(0, targetTyped)}
                    {step === 2 && targetTyped < targetText.length && <span className="w-2.5 h-4 sm:h-5 bg-orange-500 inline-block animate-pulse align-middle ml-1"></span>}
                  </span>
                </div>
              )}
            </div>

            {/* Bootstrapping */}
            {step >= 3 && (
              <div className="text-gray-500 mb-6 animate-cli-step">
                <span className="text-blue-500 font-bold mr-2">{'>'}</span> Bootstrapping translation pipeline...
              </div>
            )}

            {/* Stage 1: Decompose */}
            {step >= 4 && (
              <div className="animate-cli-step mb-5">
                <span className="text-gray-500">[{`1/3`}]</span> <span className="text-blue-300">Extracting pure business logic...</span><br/>
                <div className="pl-4 pt-2 text-gray-400 select-none font-mono text-xs">
                  <span className="text-gray-500">parse "Indemnification Clause 4.2"</span> <span className="text-white font-bold ml-1 mr-1">-&gt;</span> <span className="text-blue-400">"Liability Transfer Node"</span><br/>
                  <span className="text-gray-500">parse "Net-30 Payment Terms"</span> <span className="text-white font-bold ml-1 mr-1">-&gt;</span> <span className="text-blue-500">"Time-Bound Obligation"</span><br/>
                </div>
              </div>
            )}

            {/* Stage 2: Map */}
            {step >= 5 && (
              <div className="animate-cli-step mb-5">
                <span className="text-gray-500">[{`2/3`}]</span> <span className="text-violet-300">Mapping to target operational domain...</span><br/>
                <div className="pl-4 pt-2 text-gray-400 select-none">
                  <span className="text-violet-500 tracking-widest">▓▓</span> <span className="text-gray-600 font-bold tracking-widest">──────┐</span><br/>
                  <span className="text-gray-800 font-bold tracking-widest">        │</span><br/>
                  <span className="text-gray-600 font-bold tracking-widest">┌───────┘</span><br/>
                  <span className="text-white font-bold text-lg mr-2 tracking-widest">└&gt;</span> <span className="text-violet-500 tracking-widest">▓▓</span><span className="text-violet-600 tracking-widest">▒▒</span><br/>
                </div>
              </div>
            )}

            {/* Stage 3: Synthesize */}
            {step >= 6 && (
              <div className="animate-cli-step mb-6">
                <span className="text-gray-500">[{`3/3`}]</span> <span className="text-emerald-300">Synthesizing fluid operational output...</span><br/>
                <div className="pl-4 pt-3 pb-2 text-gray-400 select-none flex items-center gap-4">
                  <span className="text-emerald-400 text-[10px] sm:text-xs tracking-widest uppercase font-semibold">Generating artifact</span>
                  <span className="inline-block w-20 sm:w-28 h-1.5 bg-gray-800 rounded-full overflow-hidden shrink-0">
                    <span className={`block h-full bg-emerald-500 ${step >= 7 ? 'w-full' : 'w-[85%] animate-[pulse_2s_ease-in-out_infinite]'}`} style={{ transition: 'width 2.5s ease-in-out' }}></span>
                  </span>
                </div>
              </div>
            )}

            {/* Final Message */}
            {step >= 7 && (
              <div className="animate-[fadeIn_0.1s_ease-out] flex items-center gap-2.5 text-emerald-400 font-semibold tracking-tight border-t border-emerald-900/30 pt-4 mt-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span className="truncate text-sm sm:text-base">
                  {finalMessage.slice(0, finalTyped)}
                  {step === 7 && finalTyped < finalMessage.length && (
                    <span className="w-2 h-4 sm:h-5 bg-emerald-400 inline-block ml-1 animate-pulse align-middle"></span>
                  )}
                </span>
              </div>
            )}
            
            {/* CTA Loop */}
            {step >= 8 && (
              <div className="animate-[fadeIn_0.1s_ease-out] mt-6 flex items-center gap-2">
                <span className="text-gray-500 font-bold">{"$"}</span>
                <span className="text-gray-300">{ctas[ctaIndex].substring(0, ctaCharIndex)}</span>
                <span className="w-2.5 h-4 sm:h-5 bg-orange-500 inline-block animate-pulse align-middle"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  const [activeExp, setActiveExp] = useState(experiments[0]);
  const [view, setView] = useState('landing');
  const [showWorkbench, setShowWorkbench] = useState(false);
  const [activeTab, setActiveTab] = useState('essay');
  const [showSchema, setShowSchema] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isContextBlind, setIsContextBlind] = useState(false);

  React.useEffect(() => {
    if (isContextBlind) {
      document.body.classList.add('context-blind');
    } else {
      document.body.classList.remove('context-blind');
    }
    return () => document.body.classList.remove('context-blind');
  }, [isContextBlind]);

  // ── Hash-based routing ──
  const navigate = (hash) => {
    window.location.hash = hash;
  };

  React.useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      setMobileMenuOpen(false);
      if (hash === 'paper') {
        setView('paper'); setShowWorkbench(false);
      } else if (hash === 'about') {
        setView('about'); setShowWorkbench(false);
      } else if (hash === 'engineering') {
        setView('engineering'); setShowWorkbench(false);
      } else if (hash === 'cases') {
        setView('cases'); setShowWorkbench(false);
      } else if (hash === 'demo' || hash === 'demo/after' || hash === 'demo/try' || hash === 'workbench') {
        // All demo routes now open the Workbench
        setShowWorkbench(true);
      } else {
        setView('landing'); setShowWorkbench(false);
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // Lock body scroll when workbench overlay is open
  React.useEffect(() => {
    if (showWorkbench) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showWorkbench]);

  // Shared sticky nav — always rendered at the top
  const stickyNav = (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="text-xl font-normal tracking-wide cursor-pointer" onClick={() => navigate('')}>ControlArc.com</div>

        {/* Desktop nav links */}
        <div className="hidden md:flex space-x-4 items-center">
          <button onClick={() => navigate('')} className={`text-sm font-medium transition-colors pb-0.5 ${view === 'landing' && !showWorkbench ? 'text-[#0f172a] border-b-2 border-[#f97316]' : 'hover:text-gray-600'}`}>Home</button>
          <button onClick={() => navigate('paper')} className={`text-sm font-medium transition-colors pb-0.5 ${view === 'paper' && !showWorkbench ? 'text-[#0f172a] border-b-2 border-[#f97316]' : 'hover:text-gray-600'}`}>Foundational Research</button>
          <button onClick={() => navigate('cases')} className={`text-sm font-medium transition-colors pb-0.5 ${view === 'cases' && !showWorkbench ? 'text-[#0f172a] border-b-2 border-[#f97316]' : 'hover:text-gray-600'}`}>Enterprise Use Cases</button>
          <button onClick={() => navigate('engineering')} className={`text-sm font-medium transition-colors pb-0.5 ${view === 'engineering' && !showWorkbench ? 'text-[#0f172a] border-b-2 border-[#f97316]' : 'hover:text-gray-600'}`}>Engineering Notes</button>
          <button onClick={() => navigate('about')} className={`text-sm font-medium transition-colors pb-0.5 ${view === 'about' && !showWorkbench ? 'text-[#0f172a] border-b-2 border-[#f97316]' : 'hover:text-gray-600'}`}>About</button>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <button
            onClick={() => setIsContextBlind(!isContextBlind)}
            className={`text-xs px-2 py-1 rounded transition-colors context-blind-btn ${isContextBlind ? 'bg-[#10b981] text-black font-bold border border-[#10b981]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}`}
          >
            {isContextBlind ? 'STRUCTURE' : 'EXPRESSION'}
          </button>
          <button
            onClick={() => showWorkbench ? navigate('') : navigate('workbench')}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${showWorkbench
              ? 'bg-gray-900 text-white shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] ring-2 ring-emerald-500 ring-offset-1'
              : 'text-white bg-gray-900 hover:bg-[#0f172a]'
              }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
            Workbench
          </button>
          <div className="w-px h-4 bg-gray-200 mx-2"></div>
          <a href="https://github.com/creativeAlgebra/imaw-prototype" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-gray-600 transition-colors flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"></path></svg>
            GitHub
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 -mr-1 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-in">
          <button onClick={() => navigate('')} className={`block w-full text-left text-sm font-medium py-2 px-3 rounded-lg transition-colors ${view === 'landing' && !showWorkbench ? 'bg-orange-50 border-l-2 border-[#f97316] text-[#0f172a]' : 'hover:bg-gray-50'}`}>Home</button>
          <button onClick={() => navigate('paper')} className={`block w-full text-left text-sm font-medium py-2 px-3 rounded-lg transition-colors ${view === 'paper' && !showWorkbench ? 'bg-orange-50 border-l-2 border-[#f97316] text-[#0f172a]' : 'hover:bg-gray-50'}`}>Foundational Research</button>
          <button onClick={() => navigate('cases')} className={`block w-full text-left text-sm font-medium py-2 px-3 rounded-lg transition-colors ${view === 'cases' && !showWorkbench ? 'bg-orange-50 border-l-2 border-[#f97316] text-[#0f172a]' : 'hover:bg-gray-50'}`}>Enterprise Use Cases</button>
          <button onClick={() => navigate('engineering')} className={`block w-full text-left text-sm font-medium py-2 px-3 rounded-lg transition-colors ${view === 'engineering' && !showWorkbench ? 'bg-orange-50 border-l-2 border-[#f97316] text-[#0f172a]' : 'hover:bg-gray-50'}`}>Engineering Notes</button>
          <button onClick={() => navigate('about')} className={`block w-full text-left text-sm font-medium py-2 px-3 rounded-lg transition-colors ${view === 'about' && !showWorkbench ? 'bg-orange-50 border-l-2 border-[#f97316] text-[#0f172a]' : 'hover:bg-gray-50'}`}>About</button>
          <div className="w-full h-px bg-gray-100 my-1"></div>
          <button
            onClick={() => setIsContextBlind(!isContextBlind)}
            className={`block w-full text-left text-sm font-medium py-2 px-3 rounded-lg transition-colors context-blind-btn ${isContextBlind ? 'bg-[#10b981] text-black font-bold border border-[#10b981]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            {isContextBlind ? 'STRUCTURE' : 'EXPRESSION'}
          </button>
          <button
            onClick={() => showWorkbench ? navigate('') : navigate('workbench')}
            className="block w-full text-left text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
            Workbench
          </button>
          <a href="https://github.com/creativeAlgebra/imaw-prototype" target="_blank" rel="noopener noreferrer" className="block text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"></path></svg>
            GitHub
          </a>
        </div>
      )}
    </nav>
  );

  // Workbench overlay — renders below the sticky nav when toggled
  const workbenchOverlay = showWorkbench && (
    <div className="fixed inset-0 z-40" style={{ top: '57px' }}>
      {/* Mobile gate message */}
      <div className="md:hidden flex flex-col items-center justify-center h-full bg-[#0f1219] text-white px-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
        </div>
         <h2 className="text-xl font-semibold tracking-tight text-center mb-3">Workbench is designed for desktop</h2>
        <p className="text-sm text-gray-400 text-center max-w-xs leading-relaxed mb-8">
          The workbench is designed for wider screens. Open this page on a desktop or laptop for the full experience.
        </p>
        <button
          onClick={() => setShowWorkbench(false)}
          className="px-5 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-full hover:bg-white/15 transition-colors"
        >
          ← Back to Site
        </button>
      </div>
      {/* Desktop workbench */}
      <div className="hidden md:block h-full">
        <WorkbenchLite />
      </div>
    </div>
  );

  // Custom renderer for markdown links to handle our semantic annotations
  const MarkdownComponents = {
    a: ({ node, href, children, ...props }) => {
      if (href?.startsWith('#leak:')) {
        const reason = decodeURIComponent(href.replace('#leak:', ''));
        return (
          <span className="relative group inline-block font-semibold bg-red-100 text-red-900 px-1 rounded cursor-help decoration-red-400 underline decoration-wavy underline-offset-2 mt-1 mb-1">
            {children}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-50 shadow-xl border border-gray-700 font-normal">
              Leak: {reason}
              <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
            </span>
          </span>
        );
      }
      if (href?.startsWith('#map:')) {
        const source = decodeURIComponent(href.replace('#map:', ''));
        return (
          <span className="relative group inline-block font-semibold border-b-2 border-dotted border-green-500 cursor-help text-[#0f172a]">
            {children}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-50 shadow-xl border border-gray-700 font-normal text-left">
              <span className="text-gray-400 block mb-1 uppercase tracking-wider text-[10px]">Maps to abstract concept:</span>
              <span className="font-mono text-green-400">{source}</span>
              <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
            </span>
          </span>
        );
      }
      return <a href={href} {...props} className="text-blue-600 hover:underline">{children}</a>;
    },
    pre: ({ node, children, ...props }) => {
      // Find the code element inside the pre children
      const childrenArray = React.Children.toArray(children);
      const codeElement = childrenArray.find(child => child.type === 'code');
      const className = codeElement?.props?.className || '';
      const match = /language-(\w+)/.exec(className);
      const language = match ? match[1] : 'text';
      const codeString = codeElement?.props?.children || '';

      return (
        <div className="not-prose relative group rounded-xl overflow-hidden border border-gray-200 bg-white my-8 shadow-sm">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#fcfaf8] border-b border-gray-200 font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {language}
            </span>
            <button
              onClick={(e) => {
                navigator.clipboard.writeText(String(codeString).replace(/\n$/, ''));
                const btn = e.currentTarget;
                const originalText = btn.innerHTML;
                btn.innerHTML = '<svg class="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Copied!';
                btn.classList.add('text-emerald-600');
                setTimeout(() => {
                  btn.innerHTML = originalText;
                  btn.classList.remove('text-emerald-600');
                }, 2000);
              }}
              className="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
          {/* Code Container - Using a div to escape Typography styles on pre */}
          <div className="p-5 overflow-x-auto bg-[#faf8f5]">
            <div className="text-[13px] font-mono text-[#334155] leading-relaxed whitespace-pre font-medium" {...props}>
              {children}
            </div>
          </div>
        </div>
      );
    },
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code className="bg-[#f1eeeb] text-[#0f172a] px-1.5 py-0.5 rounded text-[13px] font-mono border border-gray-200" {...props}>
            {children}
          </code>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    }
  };

  // Workbench is now an overlay, not a view branch
          
  if (view === 'cases') {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans tracking-tight selection:bg-[#0f172a] selection:text-white">
        {stickyNav}
        {workbenchOverlay}
        
        {/* Aesthetic wrapper */}
        <div className="bg-[#fcfaf8] border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-6 sm:px-12 py-16 pt-20">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-[#0f172a] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">Platform Insights</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-semibold text-[#0f172a] leading-[1.15] tracking-tight mb-6 font-sans">
                  Enterprise Case Studies
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl font-sans">
                  See how industry leaders are replacing probabilistic LLM summaries with deterministic, structurally faithful automated translations across siloed departments.
              </p>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 sm:px-12 py-16 space-y-24">
          
          {/* Case Study 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">Deal Desk Automation</h2>
            </div>
            <p className="text-lg font-medium text-blue-600 mb-8">Translation: Legal MSA → Sales Playbook</p>
            
            <div className="grid md:grid-cols-3 gap-8 text-base">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">The Problem</h3>
                <p className="text-gray-600 leading-relaxed">Standard RAG models hallucinate exceptions or lose structural fidelity when summarizing dense 50-page Master Services Agreements, creating unacceptable liability risk for sales teams executing deals.</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-emerald-200 pb-2">The IMAW Solution</h3>
                <p className="text-gray-600 leading-relaxed"><strong>Data Isolation</strong> strips the legal jargon to extract the pure contract logic. <strong>Stateful Translation</strong> maps this logic into safe, plain-English playbook instructions tailored specifically for the sales team's vocabulary.</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-amber-200 pb-2">The Proof (ROI)</h3>
                <p className="text-gray-600 leading-relaxed">The <strong>Decode Key</strong> provides an inspectable audit trail. Every plain-English sales instruction traces back to its JSON State mapping, giving compliance teams a targeted intervention point to catch semantic drift.</p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-200"></div>

          {/* Case Study 2 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">Automated Compliance Validation</h2>
            </div>
            <p className="text-lg font-medium text-violet-600 mb-8">Translation: AWS Architecture → SOC2 Audit Checklist</p>
            
            <div className="grid md:grid-cols-3 gap-8 text-base">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">The Problem</h3>
                <p className="text-gray-600 leading-relaxed">Standard RAG inevitably drops complex technical dependencies when translating immense AWS Cloud Architecture documentation into formats readable by non-technical external auditors.</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-emerald-200 pb-2">The IMAW Solution</h3>
                <p className="text-gray-600 leading-relaxed"><strong>Data Isolation</strong> maps the exact infrastructural relationship rules. <strong>Stateful Translation</strong> transforms those technical rules into the exact strict constraints required by a SOC2 compliance checklist.</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-amber-200 pb-2">The Proof (ROI)</h3>
                <p className="text-gray-600 leading-relaxed">The engineered <strong>JSON State</strong> acts as an intermediate artifact. Auditors can verify that the final checklist is structurally identical to the raw architecture graph without needing to read a single line of code.</p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-200"></div>

          {/* Case Study 3 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">Safe Medical Onboarding</h2>
            </div>
            <p className="text-lg font-medium text-orange-600 mb-8">Translation: FDA Clinical Trial Data → Patient Materials</p>
            
            <div className="grid md:grid-cols-3 gap-8 text-base">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">The Problem</h3>
                <p className="text-gray-600 leading-relaxed">Standard RAG lacks the structural rigidity to safely simplify complex FDA clinical trial data. The inherent risk of AI hallucinating drug timelines or side effects makes generative patient materials a non-starter.</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-emerald-200 pb-2">The IMAW Solution</h3>
                <p className="text-gray-600 leading-relaxed"><strong>Data Isolation</strong> forces the agent to map the clinical data as a rigid mathematical graph. <strong>Stateful Translation</strong> uses that graph to construct accessible consumer explanations while preventing structural drift.</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-amber-200 pb-2">The Proof (ROI)</h3>
                <p className="text-gray-600 leading-relaxed">The <strong>Decode Key</strong> ties every simplified patient instruction back to its original clinical source node. Medical personnel can programmatically audit the translated state mapping, enforcing a strict Human-In-The-Loop validation gate before the final text is generated.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="py-12 px-6 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto text-sm text-gray-500 border-t border-gray-100 font-sans">
          <p><a href="https://controlarc.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">controlarc.com</a></p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="https://github.com/creativeAlgebra/imaw-prototype" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
              View Source on GitHub
            </a>
            <p>© {new Date().getFullYear()} ControlArc</p>
          </div>
        </footer>
      </div>
    );
  }
          
  if (view === 'engineering') {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans tracking-tight selection:bg-[#0f172a] selection:text-white">
        {stickyNav}
        {workbenchOverlay}
        
        {/* Academic / Lab aesthetic wrapper */}
        <div className="bg-[#f8f9fa] border-b border-gray-200">
            <div className="max-w-3xl mx-auto px-6 sm:px-12 py-12 pt-16">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-[#0f172a] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">Lab Note 01</span>
                <span className="text-sm text-gray-400 font-medium">March 2026</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-semibold text-[#0f172a] leading-[1.15] tracking-tight mb-4 font-sans">
                  Separating Structure from Expression: Generating Agentic Context
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  How a simple Cascading Semantic Rollup script abstracts code expression into structural maps to provide auditable context for agents.
              </p>
            </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 sm:px-12 py-12">
          <div className="prose prose-gray prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
              {engineeringContent.split('\n').slice(5).join('\n')} 
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 px-6 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto text-sm text-gray-500 border-t border-gray-100">
          <p><a href="https://controlarc.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">controlarc.com</a></p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="https://github.com/creativeAlgebra/imaw-prototype" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
              View Source on GitHub
            </a>
            <p>© {new Date().getFullYear()} ControlArc</p>
          </div>
        </footer>
      </div>
    );
  }

   if (view === 'paper') {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans tracking-tight selection:bg-[#0f172a] selection:text-white">
        {stickyNav}
        {workbenchOverlay}
        <div className="max-w-3xl mx-auto px-6 sm:px-12">
          <PaperHeader />
          
          {/* Executive Summary Preamble */}
          <div className="mb-12 p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Executive Summary</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              This whitepaper outlines the core architectural philosophy behind ControlArc. AI hallucination isn’t an unavoidable software bug—it’s a structural side-effect of models trying to process data and generate expression simultaneously. For enterprise leaders looking to implement generative AI safely, this document explains why isolating these steps into discrete, auditable workflows is the key to building reliable systems at scale.
            </p>
            <div className="bg-white p-4 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600 mb-2 font-medium">Terminology Key</p>
              <p className="text-sm text-slate-700">
                <em>Note to Reader:</em> In the research below, <strong>"Contextual Blindness"</strong> refers to the enterprise feature we call <strong>Data Isolation</strong>. <strong>"Isomorphic Mapping"</strong> refers to our core enterprise capability: <strong>Stateful Translation</strong>.
              </p>
            </div>
          </div>

          <div className="prose prose-gray prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {paperContent.split('\n').slice(7).join('\n')}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 px-6 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto text-sm text-gray-500 border-t border-gray-100">
          <p><a href="https://controlarc.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">controlarc.com</a></p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="https://github.com/creativeAlgebra/imaw-prototype" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
              View Source on GitHub
            </a>
            <p>© {new Date().getFullYear()} ControlArc</p>
          </div>
        </footer>
      </div>
    );
  }

  // Demo view removed — Workbench is now the primary interactive demo

  if (view === 'about') {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans tracking-tight selection:bg-[#0f172a] selection:text-white">
        {stickyNav}
        {workbenchOverlay}
        <div className="max-w-3xl mx-auto py-16 sm:py-24 px-6 sm:px-12">

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">About ControlArc</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#0f172a] tracking-tight leading-[1.15] mb-8">
            What is Generative Control Architecture?
          </h1>

          <div className="space-y-8 text-gray-600 text-lg leading-relaxed">
            <p>
              There are two ways the industry currently tries to make AI output reliable. Both fall mathematically short for enterprise use cases.
            </p>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 space-y-6">
              <div>
                <h3 className="font-semibold text-[#0f172a] text-base mb-2">The first is prompt instruction.</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  You add Chain-of-Thought reasoning, guardrails, and output schemas. This works—until it doesn't. When instructions fail, the failure is probabilistic and invisible. The model saw the right instructions and hallucinated anyway, offering developers zero diagnostic traceability into <em>which part</em> of the attention mechanism broke.
                </p>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-[#0f172a] text-base mb-2">The second is agent orchestration.</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  You split the work across multiple agents. Frameworks like CrewAI, AutoGen, and LangGraph make this possible. But these systems are architected for <em>throughput</em>—more agents doing more things faster. They coordinate what agents <em>do</em>. They do not structurally control what agents <em>see</em>.
                </p>
              </div>
            </div>

            <p className="text-xl font-semibold text-[#0f172a]">
              ControlArc works in the gap between these two methodologies.
            </p>

            <p>
              Generative Control Architecture is the engineering discipline of designing AI systems where reliability is guaranteed by <em>structure</em>, rather than requested by <em>instruction</em>. Instead of begging a model not to hallucinate, you architect the data pipeline so that contaminating contextual information is mathematically excluded from the context window during generation.
            </p>

            <p>
              We looked at the state of Enterprise AI and saw a crisis of control. Standard RAG (Retrieval-Augmented Generation) models were indiscriminately summarizing data probabilistically, leading inevitably to hallucinations, semantic leakage, and compliance failures in highly regulated industries. We realized the only way to make AI safe for operations like Legal, Medical, and Deep Engineering was to physically constrain it. 
            </p>

            <p>
              So, we built the <strong>Inspectable Multi-Agent Workflow (IMAW)</strong>—a generative control architecture that forces AI to commit to a human-auditable state. By enforcing strict <strong>Data Isolation</strong>, each autonomous agent operates in a mathematically restricted information space, completely blind to inputs that would otherwise compromise its output.
            </p>

            <div className="bg-[#0f172a] text-white rounded-2xl p-8 my-8 shadow-xl">
               <p className="text-xl font-semibold mb-4 text-[#f97316]">Our Mission</p>
               <p className="text-[#f1f5f9] leading-relaxed">
                  Our mission is to end the era of black-box AI generation. We build state-bound infrastructure that allows enterprises to translate complex operational logic across domains with explicit, diagnosable breakpoints.
               </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mt-8">
              <p className="text-base text-gray-500 mb-4">
                ControlArc is engineered by <a href="https://www.linkedin.com/in/garciarandall/" target="_blank" rel="noopener noreferrer" className="text-[#0f172a] font-semibold hover:underline border-b border-[#0f172a]/20">Randall Garcia</a>.
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Our architecture is grounded in rigorous academic and engineering research. We do not just build prototypes; we validate our stateful routing theories against empirical benchmarks. To review the mathematical and structural proof of Generative Control Architecture, 
                read our foundational <button onClick={() => navigate('paper')} className="text-[#f97316] font-semibold hover:underline">Whitepaper here</button>.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="py-12 px-6 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto text-sm text-gray-500 border-t border-gray-100">
          <p><a href="https://controlarc.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">controlarc.com</a></p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="https://github.com/creativeAlgebra/imaw-prototype" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
              View Source on GitHub
            </a>
            <p>© {new Date().getFullYear()} ControlArc</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans tracking-tight selection:bg-[#0f172a] selection:text-white">
      {stickyNav}
        {workbenchOverlay}

        {/* Hero Section */}
        <main className="py-12 sm:py-16 md:py-20 px-6 sm:px-10 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 xl:gap-16">
            {/* Left: Text */}
            <div className="flex-1 min-w-0 text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tighter text-[#0f172a] leading-[1.05]">
                Don't build chatbots.<br/><span className="text-[#f97316]">Build state machines.</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-gray-500 font-normal leading-relaxed max-w-xl">Standard RAG is excellent for retrieval, but relies on probabilistic black-box generation. ControlArc replaces that synthesis step with deterministic, state-bound generation, allowing you to translate complex operational logic across your enterprise with explicit, diagnosable breakpoints.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate('workbench')} className="px-7 py-3.5 bg-[#0f172a] text-white text-sm font-semibold rounded-full hover:bg-[#1e293b] transition-colors text-center">
                  Start Building
                </button>
                <button onClick={() => navigate('paper')} className="px-7 py-3.5 bg-white border border-gray-300 text-[#0f172a] text-sm font-semibold rounded-full hover:bg-gray-50 transition-colors text-center">
                  Foundational Research
                </button>
              </div>
            </div>
            {/* Right: The Node Graph Visual Directive */}
            <div className="hidden lg:block flex-shrink-0 w-[50%]">
              <div className="relative w-full aspect-square rounded-3xl bg-[#0f1219] border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center p-8">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
                 {/* CSS/HTML Wireframe of a glowing node graph */}
                 <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-amber-500/50 bg-amber-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.3)] relative group">
                       <span className="text-amber-500 font-mono text-xs font-bold tracking-widest">JSON</span>
                       
                       {/* Connecting lines */}
                       <div className="absolute top-1/2 left-full w-20 h-px bg-amber-500/30 -translate-y-1/2"></div>
                       <div className="absolute top-0 right-1/2 w-48 h-px bg-amber-500/30 -translate-y-24 rotate-[30deg] origin-right"></div>
                       <div className="absolute bottom-full left-1/2 w-px h-20 bg-amber-500/30 -translate-x-1/2"></div>
                       <div className="absolute top-full left-1/2 w-px h-20 bg-emerald-500/30 -translate-x-1/2"></div>
                       
                       {/* Connected Nodes */}
                       <div className="absolute top-1/2 left-[calc(100%+5rem)] w-14 h-14 rounded-full border border-blue-500/50 bg-blue-500/10 -translate-y-1/2 flex items-center justify-center"><span className="text-blue-400 text-[10px] font-mono font-bold">MAP</span></div>
                       <div className="absolute bottom-[calc(100%+5rem)] left-1/2 w-14 h-14 rounded-full border border-violet-500/50 bg-violet-500/10 -translate-x-1/2 flex items-center justify-center"><span className="text-violet-400 text-[10px] font-mono font-bold">STATE</span></div>
                       <div className="absolute top-[calc(100%+5rem)] left-1/2 w-14 h-14 rounded-full border border-emerald-500/50 bg-emerald-500/10 -translate-x-1/2 flex items-center justify-center"><span className="text-emerald-400 text-[10px] font-mono font-bold">SYNTH</span></div>
                    </div>
                    {/* Ghost bubbles getting pulled in (CSS styled to look like noisy chat bubbles) */}
                    <div className="absolute left-8 top-1/4 w-32 h-10 rounded-2xl bg-gray-800/40 border border-gray-700/50 blur-[1px] flex items-center px-4">
                       <div className="h-2 w-16 bg-gray-600/50 rounded-full"></div>
                    </div>
                    <div className="absolute left-10 bottom-1/4 w-24 h-10 rounded-2xl bg-gray-800/40 border border-gray-700/50 blur-[2px] flex items-center px-4">
                       <div className="h-2 w-10 bg-gray-600/50 rounded-full"></div>
                    </div>
                    <div className="absolute left-1/2 top-10 w-28 h-10 rounded-2xl bg-gray-800/40 border border-gray-700/50 blur-[3px] -translate-x-1/2 flex items-center px-4"></div>
                 </div>
              </div>
            </div>
          </div>
        </main>


      {/* The Cross-Domain Translation Engine Demo */}
      <section id="proof" className="py-24 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-xs font-semibold text-[#f97316] uppercase tracking-widest mb-4">Enterprise Safety First</p>
            <h2 className="text-4xl font-semibold text-[#0f172a] tracking-tight mb-4">The Cross-Domain Translation Engine</h2>
            <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
              Watch how ControlArc securely translates a 50-page Master Services Agreement into an operational Plain-English Sales Playbook. Every sentence is safely bound to a strict JSON node structure.
            </p>
          </div>

          {/* Interactive Stepper Visual */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Steps Nav */}
            <div className="bg-gray-50 border-r border-gray-200 p-6 md:w-1/3 flex flex-col gap-2 relative">
               <button className="text-left px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl font-semibold text-sm text-[#0f172a] flex items-center gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full text-xs">1</span> Extract JSON Liabilities
               </button>
               <button className="text-left px-4 py-3 hover:bg-white/50 border border-transparent rounded-xl font-medium text-sm text-gray-500 transition-colors flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-200 text-gray-500 flex items-center justify-center rounded-full text-xs">2</span> The HITL Pause (Legal UX)
               </button>
               <button className="text-left px-4 py-3 hover:bg-white/50 border border-transparent rounded-xl font-medium text-sm text-gray-500 transition-colors flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-200 text-gray-500 flex items-center justify-center rounded-full text-xs">3</span> Map & Synthesize
               </button>
               <button className="text-left px-4 py-3 hover:bg-white/50 border border-transparent rounded-xl font-medium text-sm text-gray-500 transition-colors flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-200 text-gray-500 flex items-center justify-center rounded-full text-xs">4</span> Prove it via Decode Key
               </button>
            </div>
            
            {/* Visual Panel representing "Step 1" */}
            <div className="flex-1 bg-[#12161f] p-8 relative overflow-hidden min-h-[400px] flex items-center justify-center text-center">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.1),_transparent_70%)]"></div>
               <div className="relative z-10 w-full max-w-sm">
                  <div className="flex items-center justify-between gap-4">
                     <div className="flex-1 h-32 bg-gray-50 rounded border border-gray-200 shadow-inner p-3 relative overflow-hidden">
                        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-2"></div>
                        <div className="w-5/6 h-1.5 bg-gray-200 rounded-full mb-2"></div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-2"></div>
                        {/* Scanner bar */}
                        <div className="absolute top-0 left-0 w-full h-8 bg-blue-500/20 border-t border-blue-400 shadow-[0_4px_10px_rgba(59,130,246,0.3)] animate-[scan_2s_ease-in-out_infinite_alternate]"></div>
                     </div>
                     <span className="text-blue-500 font-bold">»</span>
                     <div className="flex-1 h-32 bg-[#0a0d14] rounded border border-gray-700 shadow-xl p-3 font-mono text-[8px] text-blue-300 text-left overflow-hidden">
                        {"{"}<br/>
                        &nbsp;&nbsp;"clause": "3.1.2",<br/>
                        &nbsp;&nbsp;"liability": "Net30",<br/>
                        &nbsp;&nbsp;"breach_condition": "Delay"<br/>
                        {"}"}
                     </div>
                  </div>
                  <p className="mt-8 text-gray-400 text-sm font-medium">Data isolation ensures standard MSA jargon does not leak into the intermediate structural graph.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — 3-Column Enterprise Cards */}
      <section className="py-24 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-semibold text-[#f97316] uppercase tracking-widest mb-4">Constrained by Design</p>
          <h2 className="text-4xl font-semibold text-[#0f172a] tracking-tight mb-4">The Inspectable Multi-Agent Workflow.</h2>
          <p className="text-gray-600 text-lg mb-16 max-w-2xl leading-relaxed">
            Standard RAG treats LLMs as black boxes. IMAW turns them into inspectable state machines.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#12161f] rounded-2xl border border-gray-800 shadow-xl p-8 flex flex-col items-start relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent pointer-events-none transition-opacity opacity-50 group-hover:opacity-100"></div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-6 relative z-10 text-blue-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-100 text-xl tracking-tight mb-3">Data Isolation</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We extract logic into a clear JSON state, allowing your team to catch and correct jargon leakage before it ever pollutes downstream generation.
              </p>
            </div>

            <div className="bg-[#12161f] rounded-2xl border border-gray-800 shadow-xl p-8 flex flex-col items-start relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none transition-opacity opacity-50 group-hover:opacity-100"></div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 relative z-10 text-amber-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </div>
              <h3 className="font-semibold text-gray-100 text-xl tracking-tight mb-3">The HITL Pause</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your mixing board for AI state. Inspect, edit, and approve the mapped JSON data graph before any final text synthesis occurs.
              </p>
            </div>

            <div className="bg-[#12161f] rounded-2xl border border-gray-800 shadow-xl p-8 flex flex-col items-start relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none transition-opacity opacity-50 group-hover:opacity-100"></div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 relative z-10 text-emerald-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <h3 className="font-semibold text-gray-100 text-xl tracking-tight mb-3">Stateful Translation</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Fluid outputs structurally bound to your constraints. Safely move data across domains without the "RAG Trap" of blind summarization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props: Enterprise Safety First */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-semibold text-[#f97316] uppercase tracking-widest mb-4">Enterprise Safety First</p>
          <h2 className="text-4xl font-semibold text-[#0f172a] tracking-tight mb-16">Designed for Mission-Critical Fidelity.</h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-6 text-orange-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="font-semibold text-[#0f172a] text-xl mb-3">Inspectable Audit Trails</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Trace every generated sentence back to a strictly defined JSON node via the internal Decode Key. If there's an error, you know exactly which mapping failed.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6 text-blue-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="font-semibold text-[#0f172a] text-xl mb-3">Provably Constrained</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Structuring the intermediate state ensures strict traceability, replacing mathematically impossible "Zero Hallucination" claims with empirical reliability.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <h3 className="font-semibold text-[#0f172a] text-xl mb-3">Reusable Workflows</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Save the approved state and generate the final output safely. Build constrained, human-in-the-loop AI workflows that scale across the enterprise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Keep Asking — Conversational Experience (Extend it) */}
      <section className="py-24 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Stateful Querying</p>
          <h2 className="text-4xl font-semibold text-[#0f172a] tracking-tight mb-4">Don't chat with a document. Query a State Machine.</h2>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed mb-12">
            After the pipeline runs, you can ask follow-up questions — in the target domain's language or in plain English. The system reverse-translates your question, queries the factual oracle, and renders the answer back through the same mapping. The constraints never break.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-lg">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cross-Domain Oracles</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                A Sales Rep can query the simplified "Deal Desk Playbook" directly. The system reverse-translates the question to query the underlying "Legal MSA" state, delivering a legally accurate answer in plain English.
              </p>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-lg">🔒</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Frozen mapping</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Our architecture forces logic into an inspectable JSON state, allowing your team to catch and correct semantic drift before the final output is generated. The translation dictionary stays locked throughout the conversation, localizing errors to the abstract mapping.
              </p>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-lg">🌱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Adaptive expansion</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Go beyond the original material. When you ask about something new, a scoped mini-pipeline decomposes and maps just the new sub-concept — preserving isolation even for dynamically introduced material.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where It Works */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Where It Works</p>
          <h2 className="text-4xl font-semibold text-[#0f172a] tracking-tight mb-4">Built for domains where clarity is non-negotiable.</h2>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed mb-16">
            When the cost of a bad analogy is a confused student, a misdiagnosis, or a failed onboarding — structural fidelity isn't a feature. It's a requirement.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
              <div className="aspect-[16/10] overflow-hidden bg-[#0a0d14] flex items-end relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent pointer-events-none" />
                <pre className="font-mono text-[9px] leading-[1.1] select-none w-full p-0 m-0 overflow-hidden text-blue-400" aria-hidden="true" style={{letterSpacing:'0.05em'}}>{`
██████▓▓▒▒░░  ░░▒▒▓▓▓▓██████
████▓▓▒▒░░  ▒▒▓▓▒▒░░▒▒▓█████
████▓▓▒▒  ░░▒▒▓▓▒▒░░  ▓▓████
██▓▓▒▒  ▒▒▓▓▓▓▒▒░░  ░░▒▒████
▓▓▒▒  ░░▒▒▓▓▒▒░░  ▒▒▓▓▒▒▓███
▒▒  ░░▒▒▓▓▓▓▒▒░░▒▒▓▓▓▓▒▒████
`.trim()}</pre>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">Legal → Sales (Deal Desk)</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  Translate 50-page Master Services Agreements into safe, plain-English playbooks for sales teams. Every answer traces back to the exact legal clause.
                </p>
                <span className="text-xs text-gray-300 font-medium">Case Study Coming Soon</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
              <div className="aspect-[16/10] overflow-hidden bg-[#0a0d14] flex items-end relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 to-transparent pointer-events-none" />
                <pre className="font-mono text-[9px] leading-[1.1] select-none w-full p-0 m-0 overflow-hidden text-violet-400" aria-hidden="true" style={{letterSpacing:'0.05em'}}>{`
▒▒░░    ░░▒▒▓▓██▓▓▓▓▒▒░░▒▒▓▓
▒▒░░  ▒▒▓▓██████▓▓▒▒░░░░▒▒▓▓
░░  ▒▒▓▓▓▓██████▓▓▒▒░░▒▒▓▓██
  ░░▒▒▓▓▒▒▓▓████▓▓▓▓▒▒▓▓████
░░▒▒▓▓▒▒░░▒▒▓▓██████▓▓██████
▒▒▓▓▓▓▒▒░░░░▒▒▓▓▓▓██████████
▓▓▓▓▒▒░░  ░░▒▒▓▓▓▓██████████
`.trim()}</pre>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">Engineering → Compliance</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  Translate dense AWS Cloud Architecture documentation into strict SOC2 compliance checklists for external auditors without losing structural fidelity.
                </p>
                <span className="text-xs text-gray-300 font-medium">Case Study Coming Soon</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
              <div className="aspect-[16/10] overflow-hidden bg-[#0a0d14] flex items-end relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 to-transparent pointer-events-none" />
                <pre className="font-mono text-[9px] leading-[1.1] select-none w-full p-0 m-0 overflow-hidden text-amber-400" aria-hidden="true" style={{letterSpacing:'0.05em'}}>{`
░░▒▒▓▓████████████▓▓▒▒░░░░▒▒
░░▒▒▓▓████████████▓▓▒▒░░▒▒▓▓
▒▒▓▓████████▓▓▒▒░░░░▒▒▓▓████
▒▒▓▓██████▓▓▒▒░░  ░░▒▒▓▓████
▓▓████████▓▓▒▒░░▒▒▓▓████████
████████▓▓▒▒░░▒▒▓▓▓▓████████
██████▓▓▓▓▒▒▒▒▓▓▓▓██████████
`.trim()}</pre>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">Medical → Consumer</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  Translate complex FDA clinical trial data into accessible patient onboarding materials. The structure holds, preventing dangerous medical hallucinations.
                </p>
                <span className="text-xs text-gray-300 font-medium">Case Study Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe + Footer — Terminal Style */}
      <section className="bg-[#0b1120] py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Terminal Window */}
          <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/40" style={{ border: '1px solid rgba(249, 115, 22, 0.2)' }}>
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'linear-gradient(to bottom, #1e293b, #162032)' }}>
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
              <span className="ml-3 text-xs text-gray-500 font-mono">beyond_the_context_window — zsh</span>
            </div>

            {/* Terminal body */}
            <div className="px-6 sm:px-8 py-8 sm:py-10 font-mono" style={{ background: '#0f172a' }}>
              {/* ASCII block title */}
              <div className="text-[#f97316] text-[10px] sm:text-xs leading-tight mb-6 select-none overflow-x-auto" aria-hidden="true">
                <pre className="inline-block">{`
 ██████╗   ████████╗   ██████╗  ██╗    ██╗
 ██╔══██╗  ╚══██╔══╝  ██╔════╝  ██║    ██║
 ██████╔╝     ██║     ██║       ██║ █╗ ██║
 ██╔══██╗     ██║     ██║       ██║███╗██║
 ██████╔╝     ██║     ╚██████╗  ╚███╔███╔╝
 ╚═════╝      ╚═╝      ╚═════╝   ╚══╝╚══╝`.trim()}</pre>
              </div>

              {/* Info lines */}
              <div className="space-y-1.5 text-sm mb-8">
                <p className="text-gray-500">
                  <span className="text-[#f97316]">Beyond the Context Window</span>
                </p>
                <p className="text-gray-600">
                  Enterprise insights on deterministic AI,
                </p>
                <p className="text-gray-600">
                  state management, and building AI
                </p>
                <p className="text-gray-600">
                  workflows you can actually audit.
                </p>
              </div>

              {/* Command prompt with subscribe link */}
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="text-gray-600">$</span>
                <a
                  href="https://beyondthecontextwindow.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f97316] hover:text-[#fb923c] transition-colors inline-flex items-center gap-2 group"
                >
                  subscribe --architecture-updates
                  <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </a>
              </div>

              {/* Blinking cursor line */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">$</span>
                <span className="w-2 h-4 bg-[#f97316] inline-block animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer — below terminal */}
        <div className="max-w-2xl mx-auto mt-10 pt-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600 font-mono">
            <p>© {new Date().getFullYear()} <a href="https://controlarc.com" className="text-gray-500 hover:text-[#f97316] transition-colors">ControlArc</a></p>
            <div className="flex items-center gap-5">
              <a href="https://beyondthecontextwindow.substack.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#f97316] transition-colors">substack</a>
              <span className="text-gray-700">·</span>
              <a href="https://github.com/creativeAlgebra/imaw-prototype" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#f97316] transition-colors">github</a>
              <span className="text-gray-700">·</span>
              <a href="https://www.linkedin.com/in/garciarandall/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#f97316] transition-colors">linkedin</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
