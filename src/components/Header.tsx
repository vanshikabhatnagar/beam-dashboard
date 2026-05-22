interface HeaderProps {
  council: string;
  onCouncilChange: (c: string) => void;
  persona: string;
  onPersonaChange: (p: string) => void;
}

const COUNCILS = ['All Councils', 'Hackney Council', 'Camden Council', 'Southwark Council'];
const PERSONAS = ['Overview', 'Business', 'Quality & Safety'];

export default function Header({ council, onCouncilChange, persona, onPersonaChange }: HeaderProps) {
  return (
    <>
      <header style={{
        background: '#F5F0EB',
        borderBottom: '1px solid #E8E0D8',
        padding: '14px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', color: '#1C1008' }}>beam</span>
          <span style={{ fontSize: 13, color: '#7A6E65' }}>Magic Notes Analytics</span>
          <span style={{ fontSize: 11, color: '#9A8E85', marginLeft: 6 }}>Data as of 13 December 2025</span>
        </div>

        <div style={{ display: 'flex', gap: 4, background: '#EDE8E3', borderRadius: 24, padding: 3 }}>
          {PERSONAS.map(p => (
            <button
              key={p}
              onClick={() => onPersonaChange(p)}
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                border: 'none',
                background: persona === p ? '#E8693A' : 'transparent',
                color: persona === p ? '#FFFFFF' : '#7A6E65',
                fontSize: 12,
                fontWeight: persona === p ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={council}
            onChange={e => onCouncilChange(e.target.value)}
            style={{
              border: '1px solid #E8E0D8',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 13,
              background: '#FFFFFF',
              color: '#1C1008',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </header>
    </>
  );
}
