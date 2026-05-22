import type { EnrichedSummary } from '../types';

interface Props {
  data: EnrichedSummary[];
}

export default function Footer({ data }: Props) {
  const dates = data
    .map(d => d.recorded_at)
    .filter(Boolean)
    .map(d => new Date(d).getTime())
    .filter(t => !isNaN(t));

  const earliest = dates.length ? new Date(Math.min(...dates)) : null;
  const latest = dates.length ? new Date(Math.max(...dates)) : null;

  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <footer style={{
      borderTop: '1px solid #E8E0D8',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 48,
    }}>
      <span style={{ fontSize: 11, color: '#6B6057' }}>
        {earliest && latest ? `Data range: ${fmt(earliest)} to ${fmt(latest)}` : ''}
      </span>
      <span style={{ fontSize: 11, color: '#6B6057' }}>
        Prototype concept exploring operational intelligence using Magic Notes data.
      </span>
    </footer>
  );
}
