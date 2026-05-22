import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnrichedSummary } from '../types';

interface Props {
  data: EnrichedSummary[];
}

export default function FeedbackDistribution({ data }: Props) {
  const counts = { low: 0, mid: 0, high: 0 };
  let total = 0;
  let ratingSum = 0;

  for (const d of data) {
    if (d.rating === null) continue;
    const r = Math.round(d.rating as number);
    total++;
    ratingSum += r;
    if (r <= 2) counts.low++;
    else if (r === 3) counts.mid++;
    else counts.high++;
  }

  const avgRating = total > 0 ? (ratingSum / total).toFixed(1) : '—';
  const highPct = total > 0 ? Math.round((counts.high / total) * 100) : 0;
  const midPct = total > 0 ? Math.round((counts.mid / total) * 100) : 0;
  const lowPct = total > 0 ? Math.round((counts.low / total) * 100) : 0;

  const donutData = [
    { name: 'Ratings 1-2', value: counts.low, color: '#C0392B' },
    { name: 'Rating 3', value: counts.mid, color: '#F0A500' },
    { name: 'Ratings 4-5', value: counts.high, color: '#7BAE7F' },
  ].filter(d => d.value > 0);

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E0D8', borderRadius: 8, padding: '24px 28px', flex: 1 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1008', marginBottom: 4 }}>
        Feedback Score Distribution
      </div>
      <div style={{ fontSize: 13, color: '#6B6057', marginBottom: 16 }}>
        Practitioner ratings across all submitted feedback
      </div>
      <div style={{ position: 'relative', height: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {donutData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 6, fontSize: 12 }}
              formatter={(v, name) => [v, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#E8693A', lineHeight: 1 }}>{avgRating}</div>
          <div style={{ fontSize: 9, color: '#7A6E65', marginTop: 2 }}>avg rating</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4, marginBottom: 8 }}>
        {[
          { label: '1-2 stars', pct: lowPct, color: '#C0392B' },
          { label: '3 stars', pct: midPct, color: '#F0A500' },
          { label: '4-5 stars', pct: highPct, color: '#7BAE7F' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: 13, color: '#4A3F35' }}>{s.label} ({s.pct}%)</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: '#4A3F35', marginTop: 12, fontStyle: 'italic', borderLeft: '2px solid #E8693A', paddingLeft: 8 }}>
        {highPct}% of submitted ratings are 4 or above. Strong baseline with room to improve.
      </div>
    </div>
  );
}
