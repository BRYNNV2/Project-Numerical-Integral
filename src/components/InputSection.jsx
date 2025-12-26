import React, { useState, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import 'mathlive';
import '../styles/components.css';

const InputSection = ({ onCalculate }) => {
    const [func, setFunc] = useState('');
    const [lowerLimit, setLowerLimit] = useState('');
    const [upperLimit, setUpperLimit] = useState('');
    const [nValue, setNValue] = useState('4'); // Default N=4
    const [showKeypad, setShowKeypad] = useState(false);

    const mfRef = useRef(null);

    // Customize MathLive keyboard on mount
    useEffect(() => {
        if (mfRef.current) {
            // We can customize the virtual keyboard here if needed
            // For now, default is good, but we might want to hide calculus buttons in the future
            mfRef.current.mathVirtualKeyboardPolicy = "manual";
            mfRef.current.addEventListener('focusin', () => window.mathVirtualKeyboard.show());
        }
    }, []);

    // Auto-sync limits from latex input
    useEffect(() => {
        if (!func) return;

        // Regex to find \int_{a}^{b} or \int_a^b
        // Improved to handle MathLive's potential spacing and format
        // 1. \int_{a}^{b}
        // 2. \int_a^b
        const limitsRegex = /\\int(?:_\{([^{}]+)\}\^\{([^{}]+)\}|_([0-9a-zA-Z\.]+)\^([0-9a-zA-Z\.]+))/;
        const match = func.match(limitsRegex);

        if (match) {
            const lower = match[1] || match[3];
            const upper = match[2] || match[4];

            if (lower && upper) {
                // Only update if they differ to avoid loops (though React handles simple diffs)
                if (lower !== lowerLimit) setLowerLimit(lower);
                if (upper !== upperLimit) setUpperLimit(upper);
            }
        }
    }, [func]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Start calculation with current Latex value
        onCalculate({ func, lowerLimit, upperLimit, nValue });
    };

    const handleInput = (e) => {
        // MathField updates its value attribute on change
        setFunc(e.target.value);
    };

    return (
        <div className="input-section card">
            <h2 className="section-title">Integral Numerik</h2>

            <form onSubmit={handleSubmit} className="calculator-form">
                {/* Method selector moved to Sidebar */}

                <div className="main-input-row" style={{ flexWrap: 'wrap' }}>
                    <div className="input-group full-width">
                        {/* MathLive Component */}
                        <math-field
                            ref={mfRef}
                            onInput={handleInput}
                            style={{
                                width: '100%',
                                fontSize: '1.25rem',
                                padding: '0.5rem',
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent'
                            }}
                            virtual-keyboard-mode="manual"
                        >
                            {func}
                        </math-field>
                        {!func && <div className="placeholder-text">Masukkan fungsi f(x)...</div>}
                    </div>

                    <div className="dx-display">
                        <InlineMath math="dx" />
                    </div>

                    <button type="submit" className="btn btn-primary btn-go">
                        Hitung
                    </button>
                </div>

                <div className="params-row" style={{ justifyContent: 'center', gap: '20px' }}>
                    {/* If no limits in Latex, show manual inputs so user CAN make it definite */}
                    {(!func || !func.match(/\\int(?:_\{([^{}]+)\}\^\{([^{}]+)\}|_([0-9a-zA-Z\.]+)\^([0-9a-zA-Z\.]+))/)) && (
                        <>
                            <div className="input-group">
                                <label>Batas Bawah (a)</label>
                                <input
                                    type="number"
                                    value={lowerLimit}
                                    onChange={(e) => setLowerLimit(e.target.value)}
                                    className="param-input"
                                />
                            </div>
                            <div className="input-group">
                                <label>Batas Atas (b)</label>
                                <input
                                    type="number"
                                    value={upperLimit}
                                    onChange={(e) => setUpperLimit(e.target.value)}
                                    className="param-input"
                                />
                            </div>
                        </>
                    )}

                    {/* Show N Always to prevent confusion */}
                    <div className="input-group">
                        <label>Jumlah Pias (N) <span style={{ fontSize: '0.8em', color: '#888', fontWeight: 'normal' }}>(Opsional)</span></label>
                        <input
                            type="number"
                            value={nValue}
                            onChange={(e) => setNValue(e.target.value)}
                            className="param-input"
                            min="1"
                            placeholder="4"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default InputSection;
