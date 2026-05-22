import type { EnrichedSummary, PromptTemplate } from '../types';

interface Props {
  data: EnrichedSummary[];
  templates: PromptTemplate[];
  persona: string;
}

const NEGATIVE_KEYWORDS = ['safeguarding', 'flag', 'name', 'wrong', 'incorrect', 'irrelevant', 'missing', 'missed', 'mixed up'];
const POSITIVE_KEYWORDS = ['format', 'saved', 'clear', 'accurate', 'helpful', 'time', 'easy', 'excellent', 'perfect', 'professional'];

function classifyComment(comment: string | null): string {
  if (!comment) return '—';
  const lower = comment.toLowerCase();
  const hasNeg = NEGATIVE_KEYWORDS.some(k => lower.includes(k));
  const hasPos = POSITIVE_KEYWORDS.some(k => lower.includes(k));
  if (hasNeg && hasPos) return 'Mixed feedback';
  if (hasNeg) return 'Quality concerns';
  if (hasPos) return 'Positive';
  return '—';
}

function StarRating({ value }: { value: number }) {
  return (
    <span style={{ color: '#E8693A', fontSize: 13 }}>
      {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
      <span style={{ color: '#7A6E65', marginLeft: 4, fontSize: 12 }}>{value.toFixed(1)}</span>
    </span>
  );
}

export default function TemplateTable({ data, templates, persona }: Props) {
  const byTemplate = new Map<string, EnrichedSummary[]>();
  for (const d of data) {
    if (!byTemplate.has(d.template_id)) byTemplate.set(d.template_id, []);
    byTemplate.get(d.template_id)!.push(d);
  }

  const rows = Array.from(byTemplate.entries()).map(([tid, items]) => {
    const template = templates.find(t => t.template_id === tid);
    const ratings = items.filter(d => d.rating !== null).map(d => d.rating as number);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const failCount = items.filter(d => d.status === 'failed' || d.status === 'in_progress').length;
    const failPct = items.length ? Math.round((failCount / items.length) * 100) : 0;

    const comments = items.map(d => d.comment).filter(Boolean) as string[];
    const themes = comments.map(classifyComment);
    const negCount = themes.filter(t => t === 'Quality concerns').length;
    const posCount = themes.filter(t => t === 'Positive').length;
    const dominantTheme = negCount > posCount ? 'Quality concerns' : posCount > 0 ? 'Positive' : 'Mixed feedback';

    return {
      name: template?.name ?? 'Unknown',
      uses: items.length,
      avgRating,
      failPct,
      dominantTheme,
    };
  }).sort((a, b) => persona === 'Quality & Safety' ? b.failPct - a.failPct : b.uses - a.uses);

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E0D8', borderRadius: 8, padding: '24px 28px' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1008', marginBottom: 4 }}>
        Template Performance
      </div>
      <div style={{ fontSize: 13, color: '#6B6057', marginBottom: 20 }}>
        Usage, satisfaction and failure rates across all prompt templates
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #E8E0D8' }}>
            {['Template', 'Uses', 'Avg Rating', 'Non-Completion', 'Feedback Theme'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#8C7E72', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.name} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAF7F4', borderBottom: '1px solid #F0EBE5' }}>
              <td style={{ padding: '16px 12px', fontSize: 14, color: '#1C1008', fontWeight: 500 }}>{row.name}</td>
              <td style={{ padding: '16px 12px', fontSize: 14, color: '#4A3F35' }}>{row.uses}</td>
              <td style={{ padding: '16px 12px' }}>
                {row.avgRating > 0 ? <StarRating value={row.avgRating} /> : <span style={{ color: '#E8E0D8' }}>—</span>}
              </td>
              <td style={{ padding: '16px 12px' }}>
                <span style={{
                  fontSize: 14,
                  color: row.failPct > 10 ? '#C0392B' : row.failPct > 5 ? '#F0A500' : '#7BAE7F',
                  fontWeight: 600,
                }}>
                  {row.failPct}%
                </span>
              </td>
              <td style={{ padding: '16px 12px' }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '3px 8px',
                  borderRadius: 12,
                  background: row.dominantTheme === 'Positive' ? '#EAF4EB' : row.dominantTheme === 'Quality concerns' ? '#FEF0EE' : '#FFF8EC',
                  color: row.dominantTheme === 'Positive' ? '#5A9E60' : row.dominantTheme === 'Quality concerns' ? '#C0392B' : '#B07D00',
                }}>
                  {row.dominantTheme}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 13, color: '#4A3F35', marginTop: 12, fontStyle: 'italic', borderLeft: '2px solid #E8693A', paddingLeft: 8 }}>
        Higher-complexity workflows such as multi-agency coordination and housing assessments show materially higher non-completion rates than simpler telephone-summary workflows. Workflow complexity appears to be a key driver of AI reliability.
      </div>
    </div>
  );
}
