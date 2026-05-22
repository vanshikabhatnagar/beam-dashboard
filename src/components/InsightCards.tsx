import type { EnrichedSummary } from '../types';

interface Props {
  data: EnrichedSummary[];
  council: string;
}

function groupBy<T>(arr: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of arr) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

function avgRating(items: EnrichedSummary[]): number {
  const rated = items.filter(d => d.rating !== null);
  if (!rated.length) return 0;
  return rated.reduce((a, b) => a + (b.rating as number), 0) / rated.length;
}

function nonCompletedRate(items: EnrichedSummary[]): number {
  if (!items.length) return 0;
  return items.filter(d => d.status === 'failed' || d.status === 'in_progress').length / items.length;
}

function displayModel(model: string): string {
  return model
    .replace('claude-3.5-sonnet', 'Claude 3.5 Sonnet')
    .replace('claude-3-haiku', 'Claude 3 Haiku')
    .replace('gpt-4o-mini', 'GPT-4o-mini')
    .replace('gpt-4o', 'GPT-4o')
    .replace('gemini-1.5-pro', 'Gemini 1.5 Pro');
}

function titleCase(s: string) {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function InsightCards({ data, council }: Props) {
  // Insight 1: model performance — top 2 by rating, worst by non-completed rate (Fix 4 + Fix 7)
  const byModel = groupBy(data, d => d.ai_model);
  const modelStats: { model: string; rating: number; ncRate: number }[] = [];
  byModel.forEach((items, model) => {
    modelStats.push({ model, rating: avgRating(items), ncRate: nonCompletedRate(items) });
  });
  modelStats.sort((a, b) => b.rating - a.rating);
  const top2Models = modelStats.slice(0, 2).map(m => displayModel(m.model));
  const worstModel = modelStats.reduce((a, b) => b.ncRate > a.ncRate ? b : a, modelStats[0]);
  const worstPct = Math.round((worstModel?.ncRate ?? 0) * 100);

  const insight1Text = top2Models.length >= 2
    ? `${top2Models[0]} and ${top2Models[1]} currently show the strongest practitioner satisfaction scores. ${displayModel(worstModel?.model ?? '')} has the highest non-completion rate at ${worstPct}% — cost-optimised models may be trading reliability for efficiency, worth reviewing for high-stakes case types.`
    : `${top2Models[0] ?? '—'} currently shows the strongest practitioner satisfaction scores.`;

  // Insight 2: per-council wording (Fix 1 — exact wording per filter state)
  function getCouncilInsight(): string {
    if (council === 'Hackney Council') {
      return 'Hackney shows comparatively lower practitioner satisfaction than other councils. Reviewing template fit and practitioner training may help close the gap.';
    }
    if (council === 'Camden Council') {
      return 'Camden demonstrates strong adoption but uneven template performance across workflows — Multi-Agency Meeting Summary has the highest non-completion rate within this authority.';
    }
    if (council === 'Southwark Council') {
      const rating = avgRating(data.filter(d => d.status === 'completed')).toFixed(1);
      return `Southwark demonstrates the strongest practitioner satisfaction overall (${rating}/5), though reliability issues remain concentrated in a small number of high-complexity templates.`;
    }
    // All Councils
    const hackneyCompleted = data.filter(d => d.council === 'Hackney Council' && d.status === 'completed');
    const hackneyRating = avgRating(hackneyCompleted).toFixed(1);
    return `Hackney Council shows comparatively lower practitioner satisfaction (${hackneyRating}/5) despite high usage volumes — suggesting a template fit or training gap worth investigating.`;
  }

  // Insight 3: longest duration topics (Fix 7: "suggesting" not "indicating")
  const byTopic = groupBy(data, d => d.topic);
  const topicAvgDurations: { topic: string; avgMins: number }[] = [];
  byTopic.forEach((items, topic) => {
    if (items.length < 3) return;
    const avg = items.reduce((a, b) => a + b.duration_seconds, 0) / items.length / 60;
    topicAvgDurations.push({ topic, avgMins: avg });
  });
  topicAvgDurations.sort((a, b) => b.avgMins - a.avgMins);
  const top1 = topicAvgDurations[0];
  const top2 = topicAvgDurations[1];

  const insight3Text = top1 && top2
    ? `${titleCase(top1.topic)} and ${titleCase(top2.topic)} meetings average over ${Math.round(Math.min(top1.avgMins, top2.avgMins))} minutes — significantly longer than other case types, suggesting higher coordination complexity and admin burden on practitioners.`
    : 'Duration data is still building across case types.';

  const insights = [
    { text: insight1Text },
    { text: getCouncilInsight() },
    { text: insight3Text },
  ];

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#7A6E65', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Leadership Insights
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {insights.map((ins, i) => (
          <div key={i} style={{
            flex: 1,
            background: '#F5F0EB',
            border: '1px solid #E8E0D8',
            borderLeft: '4px solid #E8693A',
            borderRadius: 8,
            padding: '18px 20px',
          }}>
            <span style={{ color: '#E8693A', marginRight: 8, fontSize: 12 }}>◆</span>
            <span style={{ fontSize: 14, color: '#1C1008', lineHeight: 1.6 }}>{ins.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
