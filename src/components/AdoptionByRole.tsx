import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnrichedSummary } from '../types';

interface Props {
  data: EnrichedSummary[];
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function AdoptionByRole({ data }: Props) {
  const byRole = new Map<string, Set<string>>();
  for (const d of data) {
    if (d.status === 'completed') {
      if (!byRole.has(d.role)) byRole.set(d.role, new Set());
      byRole.get(d.role)!.add(d.user_id);
    }
  }

  const chartData = Array.from(byRole.entries())
    .map(([role, users]) => ({ role: formatRole(role), users: users.size }))
    .sort((a, b) => b.users - a.users);

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E0D8', borderRadius: 8, padding: '24px 28px' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1008', marginBottom: 4 }}>
        Practitioner Adoption by Role
      </div>
      <div style={{ fontSize: 12, color: '#7A6E65', marginBottom: 20 }}>
        Distinct users with at least one completed summary, by role
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE5" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#7A6E65' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="role" tick={{ fontSize: 11, fill: '#7A6E65' }} axisLine={false} tickLine={false} width={160} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 6, fontSize: 12 }}
            formatter={(v) => [v, 'Practitioners']}
          />
          <Bar dataKey="users" name="Practitioners" fill="#7BAE7F" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 12, color: '#7A6E65', marginTop: 16, fontStyle: 'italic' }}>
        Current adoption is concentrated among social workers and team leaders. Other practitioner roles represent an opportunity to grow engagement.
      </div>
    </div>
  );
}
