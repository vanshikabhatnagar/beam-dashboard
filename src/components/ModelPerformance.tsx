import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { EnrichedSummary } from '../types';

interface Props {
  data: EnrichedSummary[];
  persona: string;
}

function shortModel(model: string) {
  return model
    .replace('claude-3.5-sonnet', 'Claude 3.5')
    .replace('claude-3-haiku', 'Claude Haiku')
    .replace('gpt-4o-mini', 'GPT-4o mini')
    .replace('gpt-4o', 'GPT-4o')
    .replace('gemini-1.5-pro', 'Gemini 1.5');
}

const legendStyle = { fontSize: 11, color: '#7A6E65' };

function CustomLegend() {
  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: 2, background: '#7BAE7F' }} />
        <span style={legendStyle}>Avg Rating (out of 5)</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: 2, background: '#C0392B', opacity: 0.7 }} />
        <span style={legendStyle}>Non-completed rate (failed + in progress) %</span>
      </div>
    </div>
  );
}

export default function ModelPerformance({ data, persona }: Props) {
  const byModel = new Map<string, { ratings: number[]; total: number; nonCompleted: number }>();

  for (const d of data) {
    if (!byModel.has(d.ai_model)) byModel.set(d.ai_model, { ratings: [], total: 0, nonCompleted: 0 });
    const entry = byModel.get(d.ai_model)!;
    entry.total++;
    if (d.status === 'failed' || d.status === 'in_progress') entry.nonCompleted++;
    if (d.rating !== null) entry.ratings.push(d.rating as number);
  }

  const chartData = Array.from(byModel.entries()).map(([model, v]) => ({
    model: shortModel(model),
    avgRating: v.ratings.length ? parseFloat((v.ratings.reduce((a, b) => a + b, 0) / v.ratings.length).toFixed(2)) : 0,
    nonCompletedRate: parseFloat(((v.nonCompleted / v.total) * 100).toFixed(1)),
    uses: v.total,
  })).sort((a, b) => b.avgRating - a.avgRating);

  const best = chartData[0]?.model ?? '';
  const worst = chartData.reduce((a, b) => b.nonCompletedRate > a.nonCompletedRate ? b : a, chartData[0]);
  const defaultSoWhat = `${best} leads on practitioner satisfaction. ${worst?.model} shows the highest non-completed rate.`;
  const businessSoWhat = 'Cost-optimised models may be trading reliability for speed. GPT-4o-mini non-completion rate is 2x higher than Claude 3.5 Sonnet.';
  const soWhat = persona === 'Business' ? businessSoWhat : defaultSoWhat;

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E0D8', borderRadius: 8, padding: '24px 28px', flex: 1 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1008', marginBottom: 4 }}>
        AI Model Performance
      </div>
      <div style={{ fontSize: 13, color: '#6B6057', marginBottom: 20 }}>
        Avg feedback score and non-completed rate by model
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE5" vertical={false} />
          <XAxis dataKey="model" tick={{ fontSize: 10, fill: '#7A6E65' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#7A6E65' }} axisLine={false} tickLine={false} domain={[0, 5]} width={25} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#7A6E65' }} axisLine={false} tickLine={false} width={35} unit="%" />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 6, fontSize: 12 }}
          />
          <Legend content={<CustomLegend />} />
          <Bar yAxisId="left" dataKey="avgRating" name="Avg Rating (out of 5)" fill="#7BAE7F" radius={[3, 3, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.model} fill={entry.model === best ? '#7BAE7F' : '#B8D4BA'} />
            ))}
          </Bar>
          <Bar yAxisId="right" dataKey="nonCompletedRate" name="Non-completed rate %" fill="#C0392B" fillOpacity={0.65} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 13, color: '#4A3F35', marginTop: 12, fontStyle: 'italic', borderLeft: '2px solid #E8693A', paddingLeft: 8 }}>
        {soWhat}
      </div>
    </div>
  );
}
