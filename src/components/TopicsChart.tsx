import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnrichedSummary } from '../types';

interface Props {
  data: EnrichedSummary[];
}

function titleCase(s: string) {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function TopicsChart({ data }: Props) {
  const counts = new Map<string, number>();
  for (const d of data) {
    const t = d.topic || 'Unknown';
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const chartData = Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([topic, count]) => ({ topic: titleCase(topic), count }));

  const top = chartData[0]?.topic ?? '';
  const second = chartData[1]?.topic ?? '';

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E0D8', borderRadius: 8, padding: '24px 28px', flex: 1 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1008', marginBottom: 4 }}>
        Top Case Topics
      </div>
      <div style={{ fontSize: 13, color: '#6B6057', marginBottom: 20 }}>
        Frequency of topics across all recorded sessions
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE5" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#7A6E65' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="topic"
            tick={{ fontSize: 10, fill: '#7A6E65' }}
            axisLine={false}
            tickLine={false}
            width={175}
          />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 6, fontSize: 12 }}
          />
          <Bar dataKey="count" name="Sessions" fill="#E8693A" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 13, color: '#4A3F35', marginTop: 12, fontStyle: 'italic', borderLeft: '2px solid #E8693A', paddingLeft: 8 }}>
        {top} and {second} dominate caseloads. Templates for these topics deserve priority investment.
      </div>
    </div>
  );
}
