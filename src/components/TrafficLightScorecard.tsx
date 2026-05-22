import type { EnrichedSummary, PromptTemplate } from '../types';

interface Props {
  data: EnrichedSummary[];
  templates: PromptTemplate[];
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
  return m.replace('claude-3.5-sonnet', 'Claude 3.5 Sonnet').replace('claude-3-haiku', 'Claude 3 Haiku')
    .replace('gpt-4o-mini', 'GPT-4o-mini').replace('gpt-4o', 'GPT-4o').replace('gemini-1.5-pro', 'Gemini 1.5 Pro');
}

function getMonth(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
}

function SignalCard({ label, status, rag }: { label: string; status: string; rag: RAG }) {
  return (
    <div style={{
      flex: 1,
      background: '#FFFFFF',
      border: '1px solid #E8E0D8',
      borderLeft: `4px solid ${RAG_COLOR[rag]}`,
      borderRadius: 8,
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: RAG_COLOR[rag], flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1C1008' }}>{label}</span>
      </div>
      <div style={{ fontSize: 11, color: '#7A6E65', lineHeight: 1.4 }}>{status}</div>
    </div>
  );
}

export default function TrafficLightScorecard({ data, templates }: Props) {
  // 1. Adoption: compare last two full months
  const monthCounts = new Map<string, number>();
  for (const d of data) {
    const m = getMonth(d.recorded_at);
    monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1);
  }
  const sortedMonths = Array.from(monthCounts.entries()).sort(([a], [b]) => a.localeCompare(b));
  const lastTwo = sortedMonths.slice(-3, -1); // exclude final partial month
  const adoptionRag: RAG = lastTwo.length < 2 ? 'amber'
    : lastTwo[1][1] > lastTwo[0][1] ? 'green'
    : lastTwo[1][1] < lastTwo[0][1] * 0.9 ? 'red' : 'amber';
  const adoptionStatus = adoptionRag === 'green' ? 'Steady growth across all councils'
    : adoptionRag === 'red' ? 'Volume declining. Review usage patterns.'
    : 'Growth slowing. Monitor closely.';

  // 2. Satisfaction
  const overallRating = avgRating(data.filter(d => d.status === 'completed'));
  const satisfactionRag: RAG = overallRating >= 4.0 ? 'green' : overallRating >= 3.5 ? 'amber' : 'red';
  const byCouncil = new Map<string, EnrichedSummary[]>();
  for (const d of data.filter(d => d.status === 'completed')) {
    if (!byCouncil.has(d.council)) byCouncil.set(d.council, []);
    byCouncil.get(d.council)!.push(d);
  }
  let lowestCouncil = '';
  let lowestRating = Infinity;
  byCouncil.forEach((items, c) => {
    const r = avgRating(items);
    if (r > 0 && r < lowestRating) { lowestRating = r; lowestCouncil = c.replace(' Council', ''); }
  });
  const satisfactionStatus = overallRating > 0
    ? `${overallRating.toFixed(1)}/5. ${lowestCouncil ? `${lowestCouncil} below target.` : 'On target.'}`
    : 'Insufficient data.';

  // 3. AI Reliability: worst model non-completed rate
  const byModel = new Map<string, EnrichedSummary[]>();
  for (const d of data) {
    if (!byModel.has(d.ai_model)) byModel.set(d.ai_model, []);
    byModel.get(d.ai_model)!.push(d);
  }
  let worstModelName = '';
  let worstNCRate = 0;
  byModel.forEach((items, model) => {
    const nc = nonCompletedRate(items);
    if (nc > worstNCRate) { worstNCRate = nc; worstModelName = model; }
  });
  const reliabilityRag: RAG = worstNCRate > 0.15 ? 'red' : worstNCRate > 0.10 ? 'amber' : 'green';
  const reliabilityStatus = worstNCRate > 0.10
    ? `${shortModel(worstModelName)} non-completion rate elevated`
    : 'All models within acceptable reliability range';

  // 4. Safeguarding: feedback mentioning safeguarding flag errors
  const safeguardingCount = data.filter(d =>
    d.comment && (d.comment.toLowerCase().includes('safeguard') || d.comment.toLowerCase().includes('incorrectly flagged'))
  ).length;
  const safeguardingRag: RAG = safeguardingCount > 5 ? 'red' : safeguardingCount > 2 ? 'amber' : 'green';
  const safeguardingStatus = safeguardingCount > 0
    ? `${safeguardingCount} incorrect flag reports logged`
    : 'No safeguarding flag errors reported';

  // 5. Templates: count with quality concerns (non-completion > 10% or avg rating < 3.5)
  const byTemplate = new Map<string, EnrichedSummary[]>();
  for (const d of data) {
    if (!byTemplate.has(d.template_id)) byTemplate.set(d.template_id, []);
    byTemplate.get(d.template_id)!.push(d);
  }
  let concernCount = 0;
  byTemplate.forEach((items) => {
    const nc = nonCompletedRate(items);
    const r = avgRating(items);
    if (nc > 0.10 || (r > 0 && r < 3.5)) concernCount++;
  });
  const templateTotal = templates.filter(t => t.is_active === 'True').length || byTemplate.size;
  const templateRag: RAG = concernCount >= 3 ? 'red' : concernCount >= 1 ? 'amber' : 'green';
  const templateStatus = `${concernCount} of ${templateTotal} showing quality concerns`;

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
      <SignalCard label="Adoption" status={adoptionStatus} rag={adoptionRag} />
      <SignalCard label="Satisfaction" status={satisfactionStatus} rag={satisfactionRag} />
      <SignalCard label="AI Reliability" status={reliabilityStatus} rag={reliabilityRag} />
      <SignalCard label="Safeguarding" status={safeguardingStatus} rag={safeguardingRag} />
      <SignalCard label="Templates" status={templateStatus} rag={templateRag} />
    </div>
  );
}
