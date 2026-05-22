import type { EnrichedSummary } from '../types';

interface Props {
  data: EnrichedSummary[];
}

const HIGH_RISK_THEMES: { label: string; keywords: string[] }[] = [
  { label: 'Incorrect safeguarding flags', keywords: ['safeguarding', 'flag'] },
  { label: 'Names mixed up', keywords: ['name', 'mixed up'] },
  { label: 'Missing key details', keywords: ['miss', 'detail', 'risk assessment', 'housing'] },
];

const USABILITY_THEMES: { label: string; keywords: string[] }[] = [
  { label: 'Not relevant to template', keywords: ['not relevant', 'irrelevant', 'template'] },
  { label: 'Too generic', keywords: ['emotional', 'context', 'tone', 'generic'] },
];

const POSITIVE_THEMES: { label: string; keywords: string[] }[] = [
  { label: 'Clean formatting', keywords: ['format', 'professional', 'clean', 'structured'] },
  { label: 'Used directly in case notes', keywords: ['directly', 'case notes', 'perfect'] },
  { label: 'Saved time', keywords: ['time', 'saved', 'admin'] },
  { label: 'Accurate and complete', keywords: ['accurate', 'excellent', 'captured', 'helpful'] },
  { label: 'Reduced admin time', keywords: ['picked up', 'missed'] },
];

function countTheme(comments: string[], keywords: string[]): number {
  return comments.filter(c => keywords.some(k => c.toLowerCase().includes(k))).length;
}

function ThemeBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  if (count === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1008' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1008' }}>{count}</span>
      </div>
      <div style={{ background: '#F0EBE5', borderRadius: 3, height: 6, overflow: 'hidden' }}>
        <div style={{ background: color, width: `${(count / max) * 100}%`, height: '100%', borderRadius: 3 }} />
      </div>
    </div>
  );
}

function GroupLabel({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <span style={{ color, fontSize: 13 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
    </div>
  );
}

export default function PractitionerFeedback({ data }: Props) {
  const comments = data.map(d => d.comment).filter(Boolean) as string[];

  const highRiskCounts = HIGH_RISK_THEMES.map(t => ({ label: t.label, count: countTheme(comments, t.keywords) }));
  const usabilityCounts = USABILITY_THEMES.map(t => ({ label: t.label, count: countTheme(comments, t.keywords) }));
  const posCounts = POSITIVE_THEMES.map(t => ({ label: t.label, count: countTheme(comments, t.keywords) }));

  const maxNeg = Math.max(...highRiskCounts.map(t => t.count), ...usabilityCounts.map(t => t.count), 1);
  const maxPos = Math.max(...posCounts.map(t => t.count), 1);

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E0D8', borderRadius: 8, padding: '24px 28px' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1008', marginBottom: 4 }}>
        What Practitioners Are Saying
      </div>
      <div style={{ fontSize: 13, color: '#6B6057', marginBottom: 20 }}>
        Themes extracted from free-text feedback via keyword matching
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <GroupLabel icon="●" label="High-risk concerns" color="#C0392B" />
          {highRiskCounts.map(t => (
            <ThemeBar key={t.label} label={t.label} count={t.count} max={maxNeg} color="#C0392B" />
          ))}
        </div>
        <div>
          <GroupLabel icon="●" label="Usability feedback" color="#F0A500" />
          {usabilityCounts.map(t => (
            <ThemeBar key={t.label} label={t.label} count={t.count} max={maxNeg} color="#F0A500" />
          ))}
        </div>
        <div>
          <GroupLabel icon="✓" label="What's Working" color="#7BAE7F" />
          {posCounts.map(t => (
            <ThemeBar key={t.label} label={t.label} count={t.count} max={maxPos} color="#7BAE7F" />
          ))}
        </div>
      </div>
    </div>
  );
}
