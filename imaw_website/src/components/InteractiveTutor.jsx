import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callLLM, getStoredProvider, getStoredApiKey, PROVIDERS } from '../lib/apiProviders';

export default function InteractiveTutor({ experiment }) {
    const provider = getStoredProvider();
    const [apiKey] = useState(() => getStoredApiKey(provider));
    const activeProviderConfig = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loadingStep, setLoadingStep] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loadingStep]);

    const callProvider = async (prompt) => {
        return callLLM(provider, apiKey, '', prompt, 0.2, false);
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || !apiKey) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

        try {
            setLoadingStep('Reverse Translating into Abstract Schema...');
            const reversePrompt = `You are an Isomorphic Reverse-Translator.\n\nHere is the established mapping dictionary between Abstract Schema -> Target Metaphor:\n\`\`\`json\n${experiment.mapping}\n\`\`\`\n\nThe user is immersed in the target metaphor ('${experiment.metaphor}') and just asked this question:\nUSER: "${userMsg}"\n\nTask: Translate this question backwards into the Abstract Schema terminology used in the mapping dictionary. Strip out all metaphorical flavor and return only the raw, abstract operational question.`;
            const abstractQuestion = (await callProvider(reversePrompt)).trim();

            setLoadingStep('Consulting Technical Oracle...');
            const oraclePrompt = `You are a Technical Factual Oracle.\n\nHere is the absolute factual truth regarding the original source concept:\n\`\`\`text\n${experiment.source_concept}\n\`\`\`\n\nBased ONLY on the mechanics defined in the source concept above, answer the following abstract question accurately:\nABSTRACT QUESTION: "${abstractQuestion}"\n\nTask: Provide the pure technical answer. If the answer is not explicitly detailed in the source concept, extrapolate a highly logical, mechanically sound answer based on standard industry/factual truths related to the domain.`;
            const technicalAnswer = (await callProvider(oraclePrompt)).trim();

            setLoadingStep('Forward Translating into Metaphor...');
            const forwardPrompt = `You are an Isomorphic Forward-Translator and Tutor.\n\nHere is the established mapping dictionary (Abstract Schema -> Target Metaphor):\n\`\`\`json\n${experiment.mapping}\n\`\`\`\n\nThe user is operating under this Target Metaphor: ${experiment.metaphor}\nTheir original question was: "${userMsg}"\n\nHere is the absolute technical truth regarding their question:\n\`\`\`text\n${technicalAnswer}\n\`\`\`\n\nTask: Translate the technical truth into a response that directly answers the user's question, but strictly conforms to the Target Metaphor. Use the mapping dictionary to ensure structural fidelity. NEVER break character. NEVER reference real-world technology, architecture, businesses, etc. Speak as an immersive tutor within the metaphor.`;
            const tutorReply = (await callProvider(forwardPrompt)).trim();

            setMessages(prev => [...prev, { role: 'tutor', content: tutorReply, debug: { abstractQuestion, technicalAnswer } }]);
            setLoadingStep(null);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'error', content: `Error: ${e.message}. Please check your API key.` }]);
            setLoadingStep(null);
        }
    };

    return (
        <div className="flex flex-col h-[700px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header & API Key Input */}
            <div className="bg-gray-50 p-6 border-b border-gray-200">
                <h2 className="text-xl font-medium text-gray-900 mb-2">Explore Within the Metaphor</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Ask questions and the tutor will answer from inside the metaphor — structurally faithful to the source concept. Your API key stays in your browser and is sent directly to Google.
                </p>
                {!apiKey && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                        No {activeProviderConfig.label} API key found. Go to the "Try the Tool" tab to set your provider and key.
                    </p>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-sm">Ask a question to start. The suggested exploration questions from the lesson above are a good place to begin.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-black text-white' : msg.role === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 border border-gray-100'}`}>
                                {msg.role === 'tutor' && msg.debug && (
                                    <div className="mb-4 space-y-2">
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs font-mono">
                                            <span className="text-purple-600 font-bold block mb-1">1. Abstract Reverse Translation</span>
                                            <span className="text-gray-600">{msg.debug.abstractQuestion}</span>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs font-mono">
                                            <span className="text-blue-600 font-bold block mb-1">2. Oracle Technical Response</span>
                                            <span className="text-gray-600">{msg.debug.technicalAnswer}</span>
                                        </div>
                                        <div className="text-xs font-mono text-green-600 font-bold mt-2 mb-1">3. Forward Synthesis</div>
                                    </div>
                                )}
                                {msg.role === 'user' ? (
                                    <p className="whitespace-pre-wrap text-[15px]">{msg.content}</p>
                                ) : (
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {loadingStep && (
                    <div className="flex flex-col items-start gap-2 text-sm text-gray-500 font-mono animate-pulse">
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl shadow-sm">
                            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {loadingStep}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={!!loadingStep || !apiKey}
                        placeholder={!apiKey ? `Set ${activeProviderConfig.label} API Key in 'Try the Tool' tab...` : "Ask a question from within the metaphor..."}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || !!loadingStep || !apiKey}
                        className="bg-black text-white rounded-full px-6 py-3 font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
