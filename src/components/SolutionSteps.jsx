import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import IntegralGraph from './IntegralGraph';
import '../styles/components.css';

const SolutionSteps = ({ result }) => {
    if (!result) return null;

    // Is Numerical Integration?
    const isNumerical = !result.isSymbolic;
    const steps = result.steps || [];

    // Comparison Mode Rendering
    if (result.isComparison) {
        const bestMethod = result.results.reduce((prev, curr) =>
            (curr.absError < prev.absError ? curr : prev)
        );

        return (
            <div className="solution-steps card" style={{ marginTop: '2rem' }}>
                <h2 className="section-title">Perbandingan Semua Metode</h2>

                {/* Graph Visualization (Context from first result) */}
                <IntegralGraph
                    key={`comp-${result.results[0].func}`}
                    func={result.results[0].func}
                    a={result.results[0].lowerLimit}
                    b={result.results[0].upperLimit}
                    n={result.results[0].nValue}
                    method="comparison"
                />

                <div className="table-responsive" style={{ marginTop: '2rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead>
                            <tr style={{ background: 'var(--primary-color)', color: 'white' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Metode</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Hasil (L)</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Nilai Sejati</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Error Mutlak</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Error Relatif</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.results.map((res, idx) => {
                                const isBest = res.method === bestMethod.method;
                                const rowStyle = {
                                    borderBottom: '1px solid var(--border-color)',
                                    background: isBest ? 'rgba(0, 255, 0, 0.05)' : 'transparent' // Subtle highlight
                                };
                                const names = { 'trapezoidal': 'Aturan Trapesium', 'simpson13': 'Simpson 1/3', 'simpson38': 'Simpson 3/8' };

                                return (
                                    <tr key={idx} style={rowStyle}>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>
                                            {names[res.method]}
                                            {isBest && <span style={{ marginLeft: '0.5rem', fontSize: '0.7em', background: '#28a745', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>TERBAIK</span>}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{res.result.toFixed(6)}</td>
                                        <td style={{ padding: '1rem' }}>{res.trueValue ? res.trueValue.toFixed(6) : '-'}</td>
                                        <td style={{ padding: '1rem', color: isBest ? '#28a745' : 'inherit' }}>{res.absError ? res.absError.toFixed(6) : '-'}</td>
                                        <td style={{ padding: '1rem' }}>{res.relError ? res.relError.toFixed(4) + '%' : '-'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                    <strong>Kesimpulan:</strong><br />
                    Metode <strong>{bestMethod.method === 'trapezoidal' ? 'Aturan Trapesium' : (bestMethod.method === 'simpson13' ? 'Simpson 1/3' : 'Simpson 3/8')}</strong> memberikan hasil paling akurat untuk fungsi ini dengan error {bestMethod.absError?.toFixed(6) || 0}.
                </div>
            </div>
        );
    }

    return (
        <div className="solution-steps card" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Langkah Penyelesaian</h2>

            {/* Visual Graph for Numerical Only */}
            {isNumerical && (
                <IntegralGraph
                    key={`${result.func}-${result.method}-${result.nValue}-${result.lowerLimit}-${result.upperLimit}`}
                    func={result.func}
                    a={result.lowerLimit}
                    b={result.upperLimit}
                    n={result.nValue}
                    method={result.method}
                />
            )}

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
