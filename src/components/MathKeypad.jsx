import React, { useState } from 'react';
import { InlineMath } from 'react-katex';
import '../styles/components.css';

const TABS = [
    { id: 'basic', label: 'Basic' },
    { id: 'greek', label: '\\alpha\\beta\\gamma' },
    { id: 'matrices', label: '(\\Box \\Box)' },
    { id: 'trig', label: '\\sin\\cos' },
    { id: 'operators', label: '\\ge\\div\\rightarrow' }
];

const KEYS = {
    basic: [
        { label: '\\Box^2', value: '^2', type: 'op' },
        { label: 'x^\\Box', value: '^', type: 'op' },
        { label: '\\sqrt{\\Box}', value: 'sqrt(', type: 'fn' },
        { label: '\\frac{\\Box}{\\Box}', value: '/', type: 'op' },
        { label: '\\log_{\\Box}', value: 'log(', type: 'fn' },
        { label: '\\pi', value: 'pi', type: 'const' },
        { label: '\\theta', value: 'theta', type: 'var' },
        { label: '\\infty', value: 'Infinity', type: 'const' },
        { label: '\\int', value: 'integrate(', type: 'fn' },
        { label: '\\frac{d}{dx}', value: 'derivative(', type: 'fn' },

        { label: '\\ge', value: '>=', type: 'op' },
        { label: '\\le', value: '<=', type: 'op' },
        { label: '\\cdot', value: '*', type: 'op' },
        { label: '\\div', value: '/', type: 'op' },
        { label: 'x', value: 'x', type: 'var' },
        { label: '(', value: '(', type: 'group' },
        { label: '|\\Box|', value: 'abs(', type: 'fn' },
        { label: '(f\\cdot g)', value: '*', type: 'op' },
        { label: 'f(x)', value: 'f(x)', type: 'fn' },
        { label: '\\ln', value: 'log(', type: 'fn' },
        { label: 'e^\\Box', value: 'e^', type: 'fn' },

        { label: '(\\Box)\'', value: 'derivative(', type: 'fn' },
        { label: '\\frac{\\partial}{\\partial x}', value: 'derivative(', type: 'fn' },
        { label: '\\int_\\Box^\\Box', value: 'integrate(', type: 'fn' },
        { label: '\\lim', value: 'lim', type: 'fn' },
        { label: '\\sum', value: 'sum(', type: 'fn' },
        { label: '\\sin', value: 'sin(', type: 'fn' },
        { label: '\\cos', value: 'cos(', type: 'fn' },
        { label: '\\tan', value: 'tan(', type: 'fn' },
        { label: '\\cot', value: 'cot(', type: 'fn' },
        { label: '\\csc', value: 'csc(', type: 'fn' },
        { label: '\\sec', value: 'sec(', type: 'fn' },
    ]
};

const MathKeypad = ({ onKeyPress }) => {
    const [activeTab, setActiveTab] = useState('basic');

    const currentKeys = KEYS[activeTab] || KEYS['basic'];

    return (
        <div className="math-keypad">
            <div className="keypad-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`keypad-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        type="button" // Prevent form submission
                    >
                        {tab.id === 'basic' ? tab.label : <InlineMath math={tab.label} />}
                    </button>
                ))}
                {/* Placeholder for 'Full pad' toggle */}
                <div className="keypad-tab-spacer"></div>
            </div>

            <div className="keypad-grid">
                {currentKeys.map((key, index) => (
                    <button
                        key={index}
                        className="keypad-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            onKeyPress(key.value);
                        }}
                        title={key.value}
                        type="button"
                    >
                        <InlineMath math={key.label} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MathKeypad;
