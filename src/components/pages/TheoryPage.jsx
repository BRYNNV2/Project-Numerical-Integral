import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const TheoryPage = () => {
    return (
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 className="section-title">Dasar Teori Metode Integral Numerik</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <section>
                    <h2>1. Aturan Trapesium (Trapezoidal Rule)</h2>
                    <p style={{ lineHeight: '1.6' }}>
                        Aturan Trapesium mendekati area di bawah kurva fungsi <InlineMath math="f(x)" /> dengan serangkaian trapesium.
                        Metode ini mengasumsikan bahwa fungsi dapat didekati dengan garis lurus (polinomial orde 1) pada setiap sub-interval.
                    </p>
                    <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #dee2e6', marginTop: '10px' }}>
                        <strong>Rumus:</strong>
                        <div style={{ fontSize: '1.1rem', margin: '10px 0' }}>
                            <BlockMath math="L \approx \frac{h}{2} \left[ f(x_0) + 2 \sum_{i=1}^{N-1} f(x_i) + f(x_N) \right]" />
                        </div>
                        <p>Dimana <InlineMath math="h = \frac{b-a}{N}" /> adalah lebar pias.</p>
                    </div>
                </section>

                <section>
                    <h2>2. Aturan Simpson 1/3</h2>
                    <p style={{ lineHeight: '1.6' }}>
                        Aturan Simpson 1/3 menggunakan polinomial orde 2 (parabola) untuk mendekati fungsi pada setiap dua sub-interval.
                        Oleh karena itu, metode ini mengharuskan jumlah pias (<InlineMath math="N" />) haruslah bilangan <strong>genap</strong>.
                    </p>
                    <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #dee2e6', marginTop: '10px' }}>
                        <strong>Rumus:</strong>
                        <div style={{ fontSize: '1.1rem', margin: '10px 0' }}>
                            <BlockMath math="L \approx \frac{h}{3} \left[ f(x_0) + 4 \sum_{i=1,3,5...}^{N-1} f(x_i) + 2 \sum_{i=2,4,6...}^{N-2} f(x_i) + f(x_N) \right]" />
                        </div>
                        <p>Koefisien polanya adalah: 1, 4, 2, 4, 2, ..., 4, 1.</p>
                    </div>
                </section>

                <section>
                    <h2>3. Aturan Simpson 3/8</h2>
                    <p style={{ lineHeight: '1.6' }}>
                        Aturan Simpson 3/8 menggunakan polinomial orde 3 (kubik) untuk pendekatan.
                        Metode ini mengharuskan jumlah pias (<InlineMath math="N" />) adalah kelipatan <strong>3</strong>.
                        Biasanya memberikan akurasi yang sedikit lebih baik daripada Simpson 1/3 untuk fungsi yang halus.
                    </p>
                    <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #dee2e6', marginTop: '10px' }}>
                        <strong>Rumus:</strong>
                        <div style={{ fontSize: '1.1rem', margin: '10px 0' }}>
                            <BlockMath math="L \approx \frac{3h}{8} \left[ f(x_0) + 3f(x_1) + 3f(x_2) + 2f(x_3) + \dots + f(x_N) \right]" />
                        </div>
                        <p>Koefisien polanya adalah: 1, 3, 3, 2, 3, 3, 2, ..., 3, 3, 1.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TheoryPage;
