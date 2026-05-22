import type { EnrichedSummary, PromptTemplate } from '../types';

interface Props {
  data: EnrichedSummary[];
  allData: EnrichedSummary[];
  council: string;
  persona: string;
  templates: PromptTemplate[];
}

type Priority = 'URGENT' | 'MONITOR' | 'INVEST';
interface ActionCard {
  priority: Priority;
  action: string;
  bigNumber?: string;
  label?: string;
  subLine?: string;
}

const PRIORITY_COLOR: Record<Priority, string> = {
  URGENT: '#C0392B',
  MONITOR: '#F0A500',
  INVEST: '#7BAE7F',
};

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

function getActions(persona: string, allData: EnrichedSummary[], filteredData: EnrichedSummary[], templates: PromptTemplate[]): ActionCard[] {
  // Key derived values from all data
  const byCouncilAll = new Map<string, EnrichedSummary[]>();
  for (const d of allData.filter(d => d.status === 'completed')) {
    if (!byCouncilAll.has(d.council)) byCouncilAll.set(d.council, []);
    byCouncilAll.get(d.council)!.push(d);
  }
  let lowestCouncil = '';
  let lowestRating = Infinity;
  let highestCouncil = '';
  let highestRating = 0;
  byCouncilAll.forEach((items, c) => {
    const r = avgRating(items);
    if (r > 0 && r < lowestRating) { lowestRating = r; lowestCouncil = c; }
    if (r > highestRating) { highestRating = r; highestCouncil = c; }
  });

  const byModelAll = new Map<string, EnrichedSummary[]>();
  for (const d of allData) {
    if (!byModelAll.has(d.ai_model)) byModelAll.set(d.ai_model, []);
    byModelAll.get(d.ai_model)!.push(d);
  }
  let highestNCModel = '';
  let highestNCRate = 0;
  let sonnetNCRate = 0;
  byModelAll.forEach((items, model) => {
    const nc = nonCompletedRate(items);
    if (nc > highestNCRate) { highestNCRate = nc; highestNCModel = model; }
    if (model === 'claude-3.5-sonnet') sonnetNCRate = nc;
  });
  const ncMultiple = sonnetNCRate > 0 ? Math.round(highestNCRate / sonnetNCRate) : 0;

  // Template non-completion rates
  const byTemplate = new Map<string, EnrichedSummary[]>();
  for (const d of allData) {
    if (!byTemplate.has(d.template_id)) byTemplate.set(d.template_id, []);
    byTemplate.get(d.template_id)!.push(d);
  }
  const templateNC = new Map<string, number>();
  byTemplate.forEach((items, tid) => templateNC.set(tid, nonCompletedRate(items)));
  const sortedByNC = Array.from(templateNC.entries()).sort(([,a],[,b]) => b - a);
  const worstTemplateId = sortedByNC[0]?.[0] ?? '';
  const worstTemplateName = templates.find(t => t.template_id === worstTemplateId)?.name ?? 'Unknown template';
  const worstTemplateNCPct = Math.round((sortedByNC[0]?.[1] ?? 0) * 100);

  // Safeguarding and name confusion counts from filtered data
  const safeguardingCount = filteredData.filter(d =>
    d.comment && (d.comment.toLowerCase().includes('safeguard') || d.comment.toLowerCase().includes('incorrectly flagged'))
  ).length;
  const nameCount = filteredData.filter(d =>
    d.comment && (d.comment.toLowerCase().includes('name') || d.comment.toLowerCase().includes('mixed up'))
  ).length;

  // Adoption by role
  const byRole = new Map<string, Set<string>>();
  for (const d of allData.filter(d => d.status === 'completed')) {
    if (!byRole.has(d.role)) byRole.set(d.role, new Set());
    byRole.get(d.role)!.add(d.user_id);
  }
  const underrepresentedRoles = ['housing_officer', 'family_support_worker'];
  const underrepCount = underrepresentedRoles.reduce((sum, r) => sum + (byRole.get(r)?.size ?? 0), 0);

  const lowestCouncilShort = lowestCouncil.replace(' Council', '');
  const highestCouncilShort = highestCouncil.replace(' Council', '');

  if (persona === 'Business') {
    return [
      {
        priority: 'URGENT',
        action: `Replace ${shortModel(highestNCModel)} in high-volume workflows`,
        bigNumber: `${Math.round(highestNCRate * 100)}%`,
        label: `non-completion rate. ${ncMultiple}x higher than Claude 3.5 Sonnet.`,
      },
      {
        priority: 'INVEST',
        action: 'Scale adoption beyond social workers and team leaders',
        subLine: `Housing Officers and Family Support Workers underrepresented. ${underrepCount} active users across these roles.`,
      },
      {
        priority: 'INVEST',
        action: `Replicate ${highestCouncilShort} model across other councils`,
        bigNumber: `${highestRating.toFixed(1)}/5`,
        label: 'strongest satisfaction and adoption',
      },
      {
        priority: 'MONITOR',
        action: 'Invest in Mental Health and Housing templates',
        subLine: 'Highest demand with above-average reliability gaps',
      },
    ];
  }

  if (persona === 'Quality & Safety') {
    return [
      {
        priority: 'URGENT',
        action: 'Investigate incorrect safeguarding flags',
        bigNumber: `${safeguardingCount}`,
        label: 'reports. Governance and legal risk in case documentation.',
      },
      {
        priority: 'URGENT',
        action: 'Address name confusion in summaries',
        bigNumber: `${nameCount}`,
        label: 'reports. Identity errors carry safeguarding implications.',
      },
      {
        priority: 'MONITOR',
        action: `Review ${lowestCouncilShort} Council practitioner support`,
        bigNumber: `${lowestRating.toFixed(1)}/5`,
        label: 'lowest satisfaction. Suggests training or template gap.',
      },
      {
        priority: 'MONITOR',
        action: `Audit ${worstTemplateName} template`,
        bigNumber: `${worstTemplateNCPct}%`,
        label: 'non-completion. Lowest satisfaction in complex workflows.',
      },
    ];
  }

  // Overview (default)
  return [
    {
      priority: 'URGENT',
      action: `Review ${lowestCouncilShort} Council template fit`,
      bigNumber: `${lowestRating.toFixed(1)}/5`,
      label: 'satisfaction score',
    },
    {
      priority: 'URGENT',
      action: `Audit ${shortModel(highestNCModel)} reliability`,
      bigNumber: `${Math.round(highestNCRate * 100)}%`,
      label: 'non-completion rate',
    },
    {
      priority: 'MONITOR',
      action: 'Prioritise Mental Health and Housing templates',
      subLine: 'Highest volume with reliability gaps',
    },
    {
      priority: 'MONITOR',
      action: 'Address safeguarding flag errors',
      bigNumber: `${safeguardingCount}`,
      label: 'reports flagged',
    },
  ];
}

function Card({ card }: { card: ActionCard }) {
  const color = PRIORITY_COLOR[card.priority];
  return (
    <div style={{
      flex: 1,
      background: '#FFFFFF',
      border: '1px solid #E8E0D8',
      borderLeft: `4px solid ${color}`,
      borderRadius: 8,
      padding: '16px 18px',
    }}>
      <div style={{
        display: 'inline-block',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: '#FFFFFF',
        background: color,
        borderRadius: 4,
        padding: '2px 7px',
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>
        {card.priority}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1008', marginBottom: 8, lineHeight: 1.4 }}>
        {card.action}
      </div>
      {card.bigNumber && (
        <div>
          <span style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: '-0.5px', lineHeight: 1 }}>
            {card.bigNumber}
          </span>
          {card.label && (
            <span style={{ fontSize: 12, color: '#6B6057', marginLeft: 6 }}>{card.label}</span>
          )}
        </div>
      )}
      {card.subLine && (
        <div style={{ fontSize: 12, color: '#7A6E65', lineHeight: 1.5 }}>{card.subLine}</div>
      )}
    </div>
  );
}

export default function RecommendedActions({ data, allData, council: _council, persona, templates }: Props) {
  const cards = getActions(persona, allData, data, templates);
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1008', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, borderLeft: '3px solid #E8693A', paddingLeft: 10 }}>
        Recommended Actions
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        {cards.map((card, i) => <Card key={i} card={card} />)}
      </div>
    </div>
  );
}
