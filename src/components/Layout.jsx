import React, { useEffect } from 'react';
import { Menu, Calculator, Sigma, Info, Check, Moon, Sun } from 'lucide-react';
import '../styles/layout.css';

const Layout = ({ children, activePage, setActivePage, method, setMethod }) => {
  // Default to closed on mobile, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(() => window.innerWidth > 768);
  const [theme, setTheme] = React.useState('light');

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Apply Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Helper to auto-close sidebar on mobile after selection
  const handleMenuClick = (action) => {
    action();
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content" style={{ padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="menu-toggle"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <Menu size={24} />
            </button>
            <div className="logo" onClick={() => setActivePage('calculator')} style={{ cursor: 'pointer' }}>
              <Sigma className="logo-icon" size={28} />
              <span className="logo-text">IntegralNumerik</span>
            </div>
          </div>
          <nav className="nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Nav links hidden on very small mobile? Or keep them? layout css handles font size */}
            <a
              href="#"
              className={`nav-link ${activePage === 'calculator' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleMenuClick(() => setActivePage('calculator')); }}
            >
              Kalkulator
            </a>
            <a
              href="#"
              className={`nav-link ${activePage === 'theory' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleMenuClick(() => setActivePage('theory')); }}
            >
              Teori
            </a>
            <a
              href="#"
              className={`nav-link ${activePage === 'about' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleMenuClick(() => setActivePage('about')); }}
            >
              Tentang
            </a>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              className="theme-toggle"
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </nav>
        </div>
      </header>

      <div className="main-wrapper" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {/* Mobile Overlay Backdrop */}
        {isSidebarOpen && window.innerWidth <= 768 && (
          <div
            className="sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 64, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 40
            }}
          />
        )}

        <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
          <div className="sidebar-menu">


            <div className="menu-group-label" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Metode Integrasi
            </div>

            <div
              className={`menu-item ${method === 'trapezoidal' ? 'active' : ''}`}
              onClick={() => handleMenuClick(() => { setActivePage('calculator'); setMethod('trapezoidal'); })}
            >
              <Calculator size={20} />
              <span style={{ flex: 1 }}>Aturan Trapesium</span>
              {method === 'trapezoidal' && <Check size={18} strokeWidth={3} />}
            </div>
            <div
              className={`menu-item ${method === 'simpson13' ? 'active' : ''}`}
              onClick={() => handleMenuClick(() => { setActivePage('calculator'); setMethod('simpson13'); })}
            >
              <Calculator size={20} />
              <span style={{ flex: 1 }}>Simpson 1/3</span>
              {method === 'simpson13' && <Check size={18} strokeWidth={3} />}
            </div>
            <div
              className={`menu-item ${method === 'simpson38' ? 'active' : ''}`}
              onClick={() => handleMenuClick(() => { setActivePage('calculator'); setMethod('simpson38'); })}
            >
              <Calculator size={20} />
              <span style={{ flex: 1 }}>Simpson 3/8</span>
              {method === 'simpson38' && <Check size={18} strokeWidth={3} />}
            </div>

            <div style={{ height: '0.5rem' }}></div>

            <div
              className={`menu-item ${method === 'comparison' ? 'active' : ''}`}
              onClick={() => handleMenuClick(() => { setActivePage('calculator'); setMethod('comparison'); })}
              style={{ border: '1px solid var(--border-color)' }}
            >
              <Sigma size={20} />
              <span style={{ flex: 1 }}>Bandingkan Semua</span>
              {method === 'comparison' && <Check size={18} strokeWidth={3} />}
            </div>
          </div>
        </aside>

        <main className="content container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
