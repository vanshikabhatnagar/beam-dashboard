import type { EnrichedSummary } from '../types';

interface Props {
  data: EnrichedSummary[];
  persona: string;
}

type RAG = 'green' | 'amber' | 'red';
const RAG_COLOR: Record<RAG, string> = { green: '#7BAE7F', amber: '#F0A500', red: '#C0392B' };

function RagDot({ rag }: { rag: RAG }) {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: '50%',
      background: RAG_COLOR[rag],
      position: 'absolute', top: 16, right: 16,
    }} />
  );
}

function Card({ label, value, sub, note, rag }: {
  label: string; value: string; sub: string; note?: string; rag: RAG;
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8E0D8',
      borderTop: `3px solid ${RAG_COLOR[rag]}`,
      borderRadius: 8,
      padding: '24px 28px',
      flex: 1,
      position: 'relative',
    }}>
      <RagDot rag={rag} />
      <div style={{ fontSize: 12, color: '#7A6E65', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, color: '#E8693A', letterSpacing: '-1px', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#4A3F35', marginTop: 6, lineHeight: 1.5 }}>
        {sub}
      </div>
      {note && (
        <div style={{ fontSize: 12, color: '#6B6057', marginTop: 5, fontStyle: 'italic', lineHeight: 1.5 }}>
          {note}
        </div>
      )}
    </div>
  );
}

export default function KpiCards({ data, persona }: Props) {
  const completed = data.filter(d => d.status === 'completed');

  const ratings = data.filter(d => d.rating !== null).map(d => d.rating as number);
  const avgRatingVal = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;
  const avgRating = avgRatingVal > 0 ? avgRatingVal.toFixed(1) : '—';

  const avgDurationSecs = completed.length > 0
    ? completed.reduce((a, b) => a + b.duration_seconds, 0) / completed.length
    : 0;
  const hoursSaved = Math.round((avgDurationSecs / 3600) * completed.length * 0.75);

  const activePractitioners = new Set(completed.map(d => d.user_id)).size;

  const feedbackRag: RAG = avgRatingVal >= 4.0 ? 'green' : avgRatingVal >= 3.5 ? 'amber' : 'red';
  const adoptionRag: RAG = activePractitioners >= 30 ? 'green' : activePractitioners >= 15 ? 'amber' : 'red';

  const completedCard = (
    <Card
      key="completed"
      label="Completed Summaries"
      value={completed.length.toLocaleString()}
      sub="AI-generated from recorded sessions"
      rag="green"
    />
  );
  const feedbackCard = (
    <Card
      key="feedback"
      label="Avg Feedback Score"
      value={`${avgRating} / 5`}
      sub={`Based on ${ratings.length} practitioner ratings`}
      rag={feedbackRag}
    />
  );
  const hoursCard = (
    <Card
      key="hours"
      label="Estimated Hours Saved"
      value={`~${hoursSaved.toLocaleString()} hrs`}
      sub="Across all completed summaries"
      note="Estimated using 75% of average transcript duration per completed summary"
      rag="green"
    />
  );
  const practCard = (
    <Card
      key="practitioners"
      label="Active Practitioners"
      value={activePractitioners.toString()}
      sub="Distinct users with at least one summary"
      rag={adoptionRag}
    />
  );

  const cards = persona === 'Business'
    ? [hoursCard, completedCard, feedbackCard, practCard]
    : [completedCard, feedbackCard, hoursCard, practCard];

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {cards}
    </div>
  );
}
