import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnrichedSummary } from '../types';

interface Props {
  allData: EnrichedSummary[];
}

const COUNCIL_COLORS = ['#E8693A', '#7BAE7F', '#F0A500'];

export default function CouncilVolumeDonut({ allData }: Props) {
  const completed = allData.filter(d => d.status === 'completed');
  const byCouncil = new Map<string, number>();
  for (const d of completed) {
    byCouncil.set(d.council, (byCouncil.get(d.council) ?? 0) + 1);
  }
  const total = completed.length;

  const donutData = Array.from(byCouncil.entries())
    .sort(([,a],[,b]) => b - a)
    .map(([council, count], i) => ({
      name: council.replace(' Council', ''),
      value: count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      color: COUNCIL_COLORS[i % COUNCIL_COLORS.length],
    }));

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E0D8', borderRadius: 8, padding: '24px 28px', flex: 1 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1008', marginBottom: 4 }}>
        Completed Summaries by Council
      </div>
      <div style={{ fontSize: 13, color: '#6B6057', marginBottom: 16 }}>
        Proportion of completed summaries across local authorities
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
              formatter={(v, name) => [`${v} summaries`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#E8693A', lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 9, color: '#7A6E65', marginTop: 2 }}>completed</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4, marginBottom: 8 }}>
        {donutData.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
            <span style={{ fontSize: 13, color: '#4A3F35' }}>{d.name} {d.pct}%</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: '#4A3F35', marginTop: 12, fontStyle: 'italic', borderLeft: '2px solid #E8693A', paddingLeft: 8 }}>
        Volume is broadly consistent across councils. Satisfaction gaps are more significant than volume gaps.
      </div>
    </div>
  );
}
