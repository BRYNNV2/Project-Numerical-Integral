import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import '../styles/components.css';

const SolutionSteps = ({ result }) => {
    if (!result) return null;

    // Expecting result to have structure: { finalValue: number, steps: [{ title, description, math }] }
    // Using dummy data if actual result doesn't have steps yet (for UI design phase)

    // If result is symbolic (Indefinite Integral)
    if (result.isSymbolic) {
        // Symbolic utility already formats steps nicely
    }

    const steps = result.steps || [];

    return (
        <div className="solution-steps card" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Langkah Penyelesaian</h2>

            <div className="steps-container">
                {steps.map((step, index) => (
                    <div key={index} className="step-item">
                        <h3 className="step-number">Langkah {index + 1}: {step.title || step.header}</h3>
                        <p className="step-description">{step.description}</p>
                        {(step.math || step.latex) && (
                            <div className="step-math">
                                <BlockMath math={step.math || step.latex} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SolutionSteps;
