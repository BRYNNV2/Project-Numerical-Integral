import React, { useState } from 'react';
import { Key, ExternalLink, ArrowRight } from 'lucide-react';

const ApiKeyInput = ({ onSave }) => {
    const [inputKey, setInputKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputKey.trim()) {
            setError('API Key tidak boleh kosong');
            return;
        }
        if (!inputKey.startsWith('AIza')) {
            setError('Format API Key sepertinya salah (biasanya diawali "AIza")');
            // We allow it anyway after warning in a real app, but let's be strict for UX
        }
        onSave(inputKey);
    };

    return (
        <div className="chatbot-auth-container">
            <div className="auth-icon">
                <Key size={32} />
            </div>
            <h3>Setup Gemini AI</h3>
            <p>Masukkan API Key dari Google AI Studio untuk mengaktifkan asisten cerdas ini.</p>

            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Paste Gemini API Key..."
                    value={inputKey}
                    onChange={(e) => { setInputKey(e.target.value); setError(''); }}
                    className="api-key-input"
                />
                {error && <small className="error-text">{error}</small>}

                <button type="submit" className="btn-save-key">
                    Mulai Chat <ArrowRight size={16} />
                </button>
            </form>

            <div className="help-link">
                <small>Belum punya kunci?</small>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                    Dapatkan Gratis di sini <ExternalLink size={12} />
                </a>
            </div>
            <div className="privacy-note">
                <small>🔒 Kunci Anda disimpan di browser (Local Storage) dan tidak dikirim ke server kami.</small>
            </div>
        </div>
    );
};

export default ApiKeyInput;
