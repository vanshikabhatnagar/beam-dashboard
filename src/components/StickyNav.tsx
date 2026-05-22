import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { id: 'section-overview', label: 'Overview' },
  { id: 'section-ai-performance', label: 'AI Performance' },
  { id: 'section-caseload', label: 'Caseload' },
  { id: 'section-templates', label: 'Templates' },
  { id: 'section-practitioners', label: 'Practitioners' },
];

const HEADER_OFFSET = 100;

export default function StickyNav() {
  const [active, setActive] = useState('section-overview');

  useEffect(() => {
    function onScroll() {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 60;
      if (nearBottom) {
        setActive(NAV_ITEMS[NAV_ITEMS.length - 1].id);
        return;
      }
      for (const item of [...NAV_ITEMS].reverse()) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= HEADER_OFFSET + 10) {
          setActive(item.id);
          return;
        }
      }
      setActive(NAV_ITEMS[0].id);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  return (
    <nav style={{
      background: '#FFFFFF',
      borderBottom: '2px solid #E8E0D8',
      boxShadow: '0 2px 8px rgba(28,16,8,0.06)',
      padding: '0 40px',
      display: 'flex',
      gap: 0,
      alignItems: 'center',
      position: 'sticky',
      top: 57,
      zIndex: 19,
    }}>
      {NAV_ITEMS.map((item) => (
        <span key={item.id} style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => scrollTo(item.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: active === item.id ? '3px solid #E8693A' : '3px solid transparent',
              fontSize: 13,
              color: active === item.id ? '#1C1008' : '#6B6057',
              cursor: 'pointer',
              padding: '12px 20px',
              fontWeight: active === item.id ? 700 : 500,
              letterSpacing: '0.01em',
            }}
          >
            {item.label}
          </button>
        </span>
      ))}
    </nav>
  );
}
