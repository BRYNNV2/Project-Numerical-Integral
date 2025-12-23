import React from 'react';

const AboutPage = () => {
    return (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
            <h1 className="section-title">Tentang IntegralNumerik</h1>

            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#495057', marginBottom: '2rem' }}>
                Aplikasi ini dikembangkan sebagai bagian dari Tugas Besar mata kuliah <strong>Metode Numerik</strong>.
                Tujuannya adalah membantu mahasiswa dan pelajar dalam memahami serta menghitung integrasi numerik dengan metode Trapesium dan Simpson.
            </p>

            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ color: '#bb1b1b', marginBottom: '1.5rem' }}>Tim Pengembang</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div className="member-card">
                        <div style={{ width: '80px', height: '80px', background: '#e9ecef', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            👤
                        </div>
                        <strong>Anggota 1</strong>
                        <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>NIM: ...</p>
                    </div>
                    <div className="member-card">
                        <div style={{ width: '80px', height: '80px', background: '#e9ecef', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            👤
                        </div>
                        <strong>Anggota 2</strong>
                        <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>NIM: ...</p>
                    </div>
                    {/* Add more members if needed */}
                </div>
            </div>

            <div style={{ marginTop: '4rem', borderTop: '1px solid #dee2e6', paddingTop: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: '#adb5bd' }}>
                    &copy; 2025 Semester 5 - Metode Numerik. Built with React & Vite.
                </p>
            </div>
        </div>
    );
};

export default AboutPage;
