import React, { useState } from 'react';
import '../styles/chatbot.css';

function ChatbotSidebar() {
    const [isOpen, setIsOpen] = useState(false);

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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor" />
                    <path d="M7 9H9V11H7V9ZM11 9H13V11H11V9ZM15 9H17V11H15V9Z" fill="currentColor" />
                </svg>
                <span>Chat Support</span>
            </button>

            {/* Sidebar */}
            <div className={`chatbot-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="chatbot-sidebar-header">
                    <h3>Brand Support Agent</h3>
                    <button
                        className="chatbot-close-btn"
                        onClick={toggleSidebar}
                        aria-label="Close Chatbot"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
                        </svg>
                    </button>
                </div>
                <div className="chatbot-iframe-container">
                    <iframe
                        src={`https://cdn.botpress.cloud/webchat/v3.5/shareable.html?configUrl=https://files.bpcontent.cloud/2025/12/23/07/20251223073832-CL79WOF7.json&t=${Date.now()}`}
                        title="Botpress Webchat"
                        className="chatbot-iframe"
                        key={Date.now()}
                    />
                </div>
            </div>

            {/* Overlay */}
            {isOpen && <div className="chatbot-overlay" onClick={toggleSidebar}></div>}
        </>
    );
}

export default ChatbotSidebar;
