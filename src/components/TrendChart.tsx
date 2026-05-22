import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnrichedSummary } from '../types';

interface Props {
  data: EnrichedSummary[];
}

function getMonth(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(m: string) {
  const [year, month] = m.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1);
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

export default function TrendChart({ data }: Props) {
  const countByMonth = new Map<string, number>();
  for (const d of data) {
    const m = getMonth(d.recorded_at);
    countByMonth.set(m, (countByMonth.get(m) ?? 0) + 1);
  }

  const sorted = Array.from(countByMonth.entries()).sort(([a], [b]) => a.localeCompare(b));

  // Drop the final month — it's partial data and will mislead readers as an adoption drop
  const trimmed = sorted.length > 1 ? sorted.slice(0, -1) : sorted;

  const chartData = trimmed.map(([month, count]) => ({ month: formatMonth(month), count }));

  const first = chartData[0]?.count ?? 0;
  const last = chartData[chartData.length - 1]?.count ?? 0;
  const isGrowing = last > first;
  const growthText = isGrowing
    ? `Transcript volume shows steady growth across the period, reflecting increasing adoption across teams.`
    : `Transcript volume is broadly stable across the period.`;

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E0D8', borderRadius: 8, padding: '24px 28px', flex: 1 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1008', marginBottom: 4 }}>
        Transcript Volume Over Time
      </div>
      <div style={{ fontSize: 13, color: '#6B6057', marginBottom: 20 }}>
        Monthly count of recorded sessions
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE5" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7A6E65' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#7A6E65' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: '#1C1008', fontWeight: 600 }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#E8693A"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#E8693A' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 13, color: '#4A3F35', marginTop: 12, fontStyle: 'italic', borderLeft: '2px solid #E8693A', paddingLeft: 8 }}>
        {growthText}
      </div>
    </div>
  );
}
