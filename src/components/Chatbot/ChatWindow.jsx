import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import { Send, Trash2, LogOut, Loader, Bot, User, Menu, Plus, Paperclip, X } from 'lucide-react';
import 'katex/dist/katex.min.css';
import Latex from 'react-katex';

const ChatWindow = ({ apiKey, onClearKey }) => {
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    // Image Upload State
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    // Derived state for current messages
    const currentSession = sessions.find(s => s.id === currentSessionId);
    const messages = currentSession ? currentSession.messages : [];

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial Load
    useEffect(() => {
        const savedSessions = JSON.parse(localStorage.getItem('gemini_chat_sessions') || '[]');
        if (savedSessions.length > 0) {
            setSessions(savedSessions);
            setCurrentSessionId(savedSessions[0].id);
        } else {
            createNewChat(); // Start fresh if empty
        }
    }, []);

    // Save to LocalStorage whenever sessions change
    useEffect(() => {
        if (sessions.length > 0) {
            localStorage.setItem('gemini_chat_sessions', JSON.stringify(sessions));
        }
    }, [sessions]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const createNewChat = () => {
        const newId = Date.now().toString();
        const newSession = {
            id: newId,
            title: `Chat ${sessions.length + 1}`, // Default title
            messages: [] // Empty start for Welcome Screen
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newId);
        setShowHistory(false);
        setSelectedImage(null);
    };

    const deleteSession = (e, id) => {
        e.stopPropagation();
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);

        if (id === currentSessionId) {
            if (updated.length > 0) {
                setCurrentSessionId(updated[0].id);
            } else {
                // If all deleted, create new
                const newId = Date.now().toString();
                setSessions([{ id: newId, title: 'Chat 1', messages: [] }]);
                setCurrentSessionId(newId);
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Limit size 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert("Ukuran file terlalu besar (Max 5MB)");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result); // Base64 string
        };
        reader.readAsDataURL(file);
    };

    const handleSend = async (customInput = null) => {
        const textToSend = customInput || input;

        // Allow send if text OR image exists
        if ((!textToSend.trim() && !selectedImage) || isLoading) return;

        setInput('');
        const imageToSend = selectedImage; // Capture current state
        setSelectedImage(null); // Clear immediately

        // 1. Update User Message
        const userMsg = {
            id: Date.now(),
            role: 'user',
            text: textToSend,
            image: imageToSend // Store for display
        };
        const updatedMessages = [...messages, userMsg];

        // Update Session State immediatley
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                // Smart Title Update
                const usedDefault = s.title.startsWith("Chat ");
                const newTitle = (s.messages.length === 0 && usedDefault) ?
                    (textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : '')) : s.title;
                return { ...s, title: newTitle, messages: updatedMessages };
            }
            return s;
        }));

        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            let result;
            let errors = [];

            // Helper to try a model...
            const tryModel = async (modelName) => {
                try {
                    const m = genAI.getGenerativeModel({ model: modelName });

                    // Construct History
                    // Note: For simplicity in this demo, we send history as text-only parts
                    // Embedding historical images in chat history uses tokens heavily.
                    const historyForModel = updatedMessages.slice(0, -1).map(m => ({
                        role: m.role,
                        parts: [{ text: m.text }],
                    }));

                    // Current Prompt Construction
                    const currentParts = [];
                    if (textToSend) currentParts.push({ text: textToSend });

                    if (imageToSend) {
                        const base64Data = imageToSend.split(',')[1];
                        const mimeType = imageToSend.split(';')[0].split(':')[1];
                        currentParts.push({
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType
                            }
                        });
                    }

                    // If image is attached, we prefer simple generation or sendMessage with payload
                    const c = m.startChat({
                        history: historyForModel,
                        generationConfig: { maxOutputTokens: 8000 },
                    });

                    // System prompt injection logic
                    const systemPrefix = `[SYSTEM: Act as a Numerical Methods Expert created by Mhmddfebry. Name: 'Numerical Assistant'. Creator: 'Mhmddfebry dan teman-teman lainnya'. User asks:] `;

                    // If just image, providing a default prompt context is helpful
                    if (currentParts.length === 1 && currentParts[0].inlineData) {
                        currentParts.unshift({ text: systemPrefix + "Analyze this image." });
                    } else if (currentParts.length > 0 && currentParts[0].text) {
                        currentParts[0].text = systemPrefix + currentParts[0].text;
                    }

                    return await c.sendMessage(currentParts);
                } catch (e) {
                    throw new Error(`${modelName}: ${e.message}`);
                }
            }

            try {
                // Priority 1: 2.0-Flash Lite (Preview)
                result = await tryModel("gemini-2.0-flash-lite-preview-02-05");
            } catch (e1) {
                errors.push(e1.message);
                try {
                    // Priority 2: Flash Latest
                    result = await tryModel("gemini-flash-latest");
                } catch (e2) {
                    errors.push(e2.message);
                    try {
                        // Priority 3: 1.5 Flash Standard
                        result = await tryModel("gemini-1.5-flash");
                    } catch (e3) {
                        errors.push(e3.message);
                        throw new Error(errors.join('\n'));
                    }
                }
            }

            const response = await result.response;
            const text = response.text();

            // 2. Update Model Message
            setSessions(prev => prev.map(s =>
                s.id === currentSessionId ? {
                    ...s,
                    messages: [...s.messages, { id: Date.now() + 1, role: 'model', text }]
                } : s
            ));

        } catch (error) {
            console.error("All Models Failed:", error);
            const finalErrorMsg = `Gagal menghubungkan.\nDetail Error:\n${error.message}`;
            setSessions(prev => prev.map(s =>
                s.id === currentSessionId ? {
                    ...s,
                    messages: [...s.messages, { id: Date.now() + 1, role: 'model', text: finalErrorMsg, isError: true }]
                } : s
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isWelcomeScreen = messages.length === 0;

    return (
        <div className="chat-window relative">
            {/* Header */}
            <div className={`chat-header-actions ${isWelcomeScreen ? 'transparent' : ''}`}>
                <div className="chat-header-content">
                    <button onClick={() => setShowHistory(!showHistory)} className="action-btn menu-btn" title="Menu">
                        <Menu size={20} />
                    </button>
                    {!isWelcomeScreen && (
                        <span className="session-title">
                            {currentSession?.title || "Numerical Assistant"}
                        </span>
                    )}
                </div>
            </div>

            {/* History Drawer */}
            <div className={`history-drawer ${showHistory ? 'open' : ''}`}>
                <div className="drawer-header">
                    <span className="drawer-label">Menu</span>
                    <button onClick={() => setShowHistory(false)} className="action-btn md:hidden"><Menu size={18} /></button>
                </div>

                <div className="p-4">
                    <button onClick={createNewChat} className="new-chat-btn">
                        <Plus size={18} />
                        <span>Chat Baru</span>
                    </button>
                </div>

                <div className="history-list">
                    <p className="history-label">Riwayat</p>
                    {sessions.map(s => (
                        <div
                            key={s.id}
                            onClick={() => { setCurrentSessionId(s.id); setShowHistory(false); }}
                            className={`history-item ${s.id === currentSessionId ? 'active' : ''}`}
                        >
                            <span className="truncate text-sm flex-1">{s.title}</span>
                            <button onClick={(e) => deleteSession(e, s.id)} className="delete-chat-btn">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            {isWelcomeScreen ? (
                <div className="welcome-screen" onClick={() => setShowHistory(false)}>
                    <div className="welcome-content">
                        <h1 className="welcome-title">
                            <span className="gradient-text">Halo, User</span><br />
                            <span className="sub-text">Sebaiknya kita mulai dari mana?</span>
                        </h1>

                        <div className="input-area centered">
                            {/* PREVIEW AREA WELCOME */}
                            {selectedImage && (
                                <div className="image-preview-container centered">
                                    <img src={selectedImage} alt="Preview" className="image-preview" />
                                    <button onClick={() => setSelectedImage(null)} className="remove-image-btn">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />

                            <button
                                className="upload-btn"
                                onClick={() => fileInputRef.current?.click()}
                                title="Upload Gambar"
                            >
                                <Paperclip size={20} />
                            </button>

                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Tanya sesuatu tentang Numerical Methods..."
                                rows={1}
                            />
                            <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !selectedImage)}>
                                {isLoading ? <Loader className="spin" size={20} /> : <Send size={20} />}
                            </button>
                        </div>

                        <div className="suggestion-chips">
                            <button onClick={() => handleSend("Jelaskan Metode Trapesium")} className="chip">Jelaskan Metode Trapesium</button>
                            <button onClick={() => handleSend("Contoh soal Integral Simpson")} className="chip">Contoh soal Integral Simpson</button>
                            <button onClick={() => handleSend("Apa itu Galat Interpolasi?")} className="chip">Apa itu Galat Interpolasi?</button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="messages-container" onClick={() => setShowHistory(false)}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}>
                                <div className="message-avatar">
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className="message-content">
                                    {msg.image && (
                                        <div className="message-image">
                                            <img src={msg.image} alt="User Upload" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }} />
                                        </div>
                                    )}
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message model loading">
                                <div className="message-avatar"><Bot size={16} /></div>
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="input-area bottom">
                        {/* PREVIEW AREA BOTTOM */}
                        {selectedImage && (
                            <div className="image-preview-container">
                                <img src={selectedImage} alt="Preview" className="image-preview" />
                                <button onClick={() => setSelectedImage(null)} className="remove-image-btn">
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />

                        <button
                            className="upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload Gambar"
                        >
                            <Paperclip size={20} />
                        </button>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ketik pesan..."
                            rows={1}
                        />
                        <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !selectedImage)}>
                            {isLoading ? <Loader className="spin" size={20} /> : <Send size={20} />}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatWindow;
