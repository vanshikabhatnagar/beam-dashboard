import type { EnrichedSummary } from '../types';

interface Props {
  data: EnrichedSummary[];
  council: string;
}

type RAG = 'green' | 'amber' | 'red';
const RAG_COLOR: Record<RAG, string> = { green: '#7BAE7F', amber: '#F0A500', red: '#C0392B' };

function avgRating(items: EnrichedSummary[]): number {
  const rated = items.filter(d => d.rating !== null);
  if (!rated.length) return 0;
  return rated.reduce((a, b) => a + (b.rating as number), 0) / rated.length;
}

function nonCompletedRate(items: EnrichedSummary[]): number {
  if (!items.length) return 0;
  return items.filter(d => d.status === 'failed' || d.status === 'in_progress').length / items.length;
}

function shortModel(m: string) {
  return m.replace('claude-3.5-sonnet', 'Claude 3.5 Sonnet').replace('gpt-4o-mini', 'GPT-4o-mini')
    .replace('gpt-4o', 'GPT-4o').replace('gemini-1.5-pro', 'Gemini 1.5 Pro').replace('claude-3-haiku', 'Claude 3 Haiku');
}

function titleCase(s: string) {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function Signal({ number, numberColor, label, phrase, rag }: {
  number: string; numberColor?: string; label: string; phrase: string; rag: RAG;
}) {
  return (
    <div style={{
      flex: 1,
      background: '#FFFFFF',
      border: '1px solid #E8E0D8',
      borderLeft: `4px solid ${RAG_COLOR[rag]}`,
      borderRadius: 8,
      padding: '20px 22px',
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: numberColor ?? RAG_COLOR[rag], letterSpacing: '-1px', lineHeight: 1, marginBottom: 4 }}>
        {number}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#1C1008', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: '#7A6E65' }}>{phrase}</div>
    </div>
  );
}

export default function LeadershipSignals({ data, council: _council }: Props) {
  // Signal 1: worst model non-completion rate
  const byModel = new Map<string, EnrichedSummary[]>();
  for (const d of data) {
    if (!byModel.has(d.ai_model)) byModel.set(d.ai_model, []);
    byModel.get(d.ai_model)!.push(d);
  }
  let worstModel = '';
  let worstNC = 0;
  byModel.forEach((items, model) => {
    const nc = nonCompletedRate(items);
    if (nc > worstNC) { worstNC = nc; worstModel = model; }
  });
  const worstNCPct = Math.round(worstNC * 100);
  const sig1Rag: RAG = worstNC > 0.15 ? 'red' : 'amber';

  // Signal 2: lowest council satisfaction
  const byCouncil = new Map<string, EnrichedSummary[]>();
  for (const d of data.filter(d => d.status === 'completed')) {
    if (!byCouncil.has(d.council)) byCouncil.set(d.council, []);
    byCouncil.get(d.council)!.push(d);
  }
  let lowestCouncil = '';
  let lowestRating = Infinity;
  byCouncil.forEach((items, c) => {
    const r = avgRating(items);
    if (r > 0 && r < lowestRating) { lowestRating = r; lowestCouncil = c; }
  });
  const lowestCouncilShort = lowestCouncil.replace(' Council', '');
  const sig2Rag: RAG = lowestRating < 3.8 ? 'red' : 'amber';

  // Signal 3: top 2 longest topics by avg duration
  const byTopic = new Map<string, number[]>();
  for (const d of data) {
    if (!byTopic.has(d.topic)) byTopic.set(d.topic, []);
    byTopic.get(d.topic)!.push(d.duration_seconds);
  }
  const topicDurations: { topic: string; avgMins: number }[] = [];
  byTopic.forEach((durations, topic) => {
    if (durations.length < 3) return;
    topicDurations.push({ topic, avgMins: durations.reduce((a, b) => a + b, 0) / durations.length / 60 });
  });
  topicDurations.sort((a, b) => b.avgMins - a.avgMins);
  const top1 = topicDurations[0];

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#7A6E65', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Key Signals
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <Signal
          number={`${worstNCPct}%`}
          label={`${shortModel(worstModel)} non-completion rate`}
          phrase="Cost-optimised model reliability under review"
          rag={sig1Rag}
        />
        <Signal
          number={lowestRating < Infinity ? `${lowestRating.toFixed(1)}/5` : '--'}
          label={`${lowestCouncilShort} satisfaction score`}
          phrase="Below target despite high usage volumes"
          rag={sig2Rag}
        />
        <Signal
          number={top1 ? `${Math.round(top1.avgMins)} mins` : '--'}
          label={top1 ? `Avg ${titleCase(top1.topic)} duration` : 'Avg complex case duration'}
          phrase="Longer sessions suggest higher admin burden"
          rag="amber"
        />
      </div>
    </div>
  );
}
