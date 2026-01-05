import React, { useState, useEffect } from 'react';
import ApiKeyInput from './Chatbot/ApiKeyInput';
import ChatWindow from './Chatbot/ChatWindow';
import { MessageSquare, X } from 'lucide-react';
import '../styles/chatbot.css';

const FALLBACK_KEY = 'AIzaSyCWo-dBr2nm3omG7Cjp8vhzLjIDraT1jDU'; // Fallback for immediate dev testing

function ChatbotSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        // Priority 1: Environment Variable
        const envKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (envKey) {
            setApiKey(envKey);
            return;
        }

        // Priority 2: Hardcoded Fallback (for immediate fix if env fails to load without restart)
        if (FALLBACK_KEY) {
            setApiKey(FALLBACK_KEY);
            return;
        }

        // Priority 3: Local Storage
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) setApiKey(storedKey);
    }, []);

    const handleSaveKey = (key) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
    };

    const handleClearKey = () => {
        setApiKey('');
        localStorage.removeItem('gemini_api_key');
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                className={`chatbot-toggle-btn ${isOpen ? 'hidden' : ''}`}
                onClick={toggleSidebar}
                aria-label="Open Chatbot"
            >
                <MessageSquare size={24} />
                <span>Ask AI</span>
            </button>

            {/* Sidebar */}
            <div className={`chatbot-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="chatbot-sidebar-header">
                    <h3>Numerical Assistant</h3>
                    <button
                        className="chatbot-close-btn"
                        onClick={toggleSidebar}
                        aria-label="Close Chatbot"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="chatbot-content">
                    {!apiKey ? (
                        <ApiKeyInput onSave={handleSaveKey} />
                    ) : (
                        <ChatWindow apiKey={apiKey} onClearKey={handleClearKey} />
                    )}
                </div>
            </div>

            {/* Overlay */}
            {isOpen && <div className="chatbot-overlay" onClick={toggleSidebar}></div>}
        </>
    );
}

export default ChatbotSidebar;
