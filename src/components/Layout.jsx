import React from 'react';
import { Menu, Calculator, Sigma, Info } from 'lucide-react';
import '../styles/layout.css';

const Layout = ({ children, activePage, setActivePage }) => {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-content container">
          <div className="logo" onClick={() => setActivePage('calculator')} style={{ cursor: 'pointer' }}>
            <Sigma className="logo-icon" size={28} />
            <span className="logo-text">IntegralNumerik</span>
          </div>
          <nav className="nav">
            <a
              href="#"
              className={`nav-link ${activePage === 'calculator' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActivePage('calculator'); }}
            >
              Kalkulator
            </a>
            <a
              href="#"
              className={`nav-link ${activePage === 'theory' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActivePage('theory'); }}
            >
              Teori
            </a>
            <a
              href="#"
              className={`nav-link ${activePage === 'about' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActivePage('about'); }}
            >
              Tentang
            </a>
          </nav>
        </div>
      </header>

      <div className="main-wrapper container">
        <aside className="sidebar">
          <div className="sidebar-menu">
            <div className="menu-item active">
              <Calculator size={20} />
              <span>Metode Integrasi</span>
            </div>
            {/* Add more menu items later */}
          </div>
        </aside>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
