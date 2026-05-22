import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import type { User, Transcript, Summary, Feedback, PromptTemplate, EnrichedSummary, AppData } from '../types';

function parseCsv<T>(url: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as T[]),
      error: reject,
    });
  });
}

export function useData() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [users, transcripts, summaries, feedbackRows, templates] = await Promise.all([
          parseCsv<User>('/data/users.csv'),
          parseCsv<Transcript>('/data/transcripts.csv'),
          parseCsv<Summary>('/data/summaries.csv'),
          parseCsv<Feedback>('/data/feedback.csv'),
          parseCsv<PromptTemplate>('/data/prompt_templates.csv'),
        ]);

        const userMap = new Map(users.map(u => [u.user_id, u]));
        const transcriptMap = new Map(transcripts.map(t => [t.transcript_id, t]));
        const templateMap = new Map(templates.map(t => [t.template_id, t]));
        const feedbackBySummary = new Map<string, Feedback>();
        for (const f of feedbackRows) {
          feedbackBySummary.set(f.summary_id, f);
        }

        const enriched: EnrichedSummary[] = summaries.map(s => {
          const user = userMap.get(s.user_id);
          const transcript = transcriptMap.get(s.transcript_id);
          const template = templateMap.get(s.template_id);
          const feedback = feedbackBySummary.get(s.summary_id);

          return {
            summary_id: s.summary_id,
            user_id: s.user_id,
            status: s.status,
            created_at: s.created_at,
            ai_model: s.ai_model,
            processing_time_ms: parseFloat(s.processing_time_ms) || 0,
            council: user?.council ?? 'Unknown',
            role: user?.role ?? 'Unknown',
            team: user?.team ?? 'Unknown',
            topic: transcript?.topic ?? 'Unknown',
            duration_seconds: parseFloat(transcript?.duration_seconds ?? '0') || 0,
            recorded_at: transcript?.recorded_at ?? s.created_at,
            transcript_type: transcript?.transcript_type ?? 'Unknown',
            template_name: template?.name ?? 'Unknown',
            template_id: s.template_id,
            rating: feedback ? parseFloat(feedback.rating) : null,
            comment: feedback?.comment ?? null,
          };
        });

        setData({ enriched, users, templates });
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
