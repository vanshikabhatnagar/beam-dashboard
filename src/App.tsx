import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import Header from './components/Header';
import StickyNav from './components/StickyNav';
import RecommendedActions from './components/RecommendedActions';
import KpiCards from './components/KpiCards';
import TrendChart from './components/TrendChart';
import ModelPerformance from './components/ModelPerformance';
import CouncilVolumeDonut from './components/CouncilVolumeDonut';
import TopicsChart from './components/TopicsChart';
import FeedbackDistribution from './components/FeedbackDistribution';
import TemplateTable from './components/TemplateTable';
import PractitionerFeedback from './components/PractitionerFeedback';
import AdoptionByRole from './components/AdoptionByRole';
import Footer from './components/Footer';

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#1C1008',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 16,
  borderLeft: '3px solid #E8693A',
  paddingLeft: 10,
};

export default function App() {
  const { data, loading, error } = useData();
  const [council, setCouncil] = useState('All Councils');
  const [persona, setPersona] = useState('Overview');

  const filtered = useMemo(() => {
    if (!data) return [];
    if (council === 'All Councils') return data.enriched;
    return data.enriched.filter(d => d.council === council);
  }, [data, council]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#7A6E65', fontSize: 14 }}>
        Loading data...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#C0392B', fontSize: 14 }}>
        Failed to load data. Make sure CSVs are in /public/data/.
      </div>
    );
  }

  const isQS = persona === 'Quality & Safety';
  const isBusiness = persona === 'Business';

  const practitionersSection = (
    <div style={{ marginBottom: 40 }}>
      <div style={SECTION_LABEL}>Practitioner Voices</div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: '0 0 35%' }}><PractitionerFeedback data={filtered} /></div>
        <div style={{ flex: '0 0 calc(65% - 16px)' }}><AdoptionByRole data={filtered} /></div>
      </div>
    </div>
  );

  const templatesSection = (
    <div style={{ marginBottom: 40 }}>
      <div style={SECTION_LABEL}>Template Performance</div>
      <TemplateTable data={filtered} templates={data.templates} persona={persona} />
    </div>
  );

  return (
    <div style={{ background: '#F5F0EB', minHeight: '100vh' }}>
      <Header council={council} onCouncilChange={setCouncil} persona={persona} onPersonaChange={setPersona} />
      <StickyNav />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 40px 8px' }}>

        {/* Overview */}
        <section id="section-overview">
          <RecommendedActions
            data={filtered}
            allData={data.enriched}
            council={council}
            persona={persona}
            templates={data.templates}
          />
          <div style={{ marginBottom: 40 }}>
            <KpiCards data={filtered} persona={persona} />
          </div>
        </section>

        {/* AI Performance */}
        <section id="section-ai-performance" style={{ paddingTop: 48 }}>
          <div style={{ marginBottom: 40 }}>
            <div style={SECTION_LABEL}>AI Performance</div>
            {isBusiness ? (
              <>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <CouncilVolumeDonut allData={data.enriched} />
                  <ModelPerformance data={filtered} persona={persona} />
                </div>
                <TrendChart data={filtered} />
              </>
            ) : (
              <div style={{ display: 'flex', gap: 16 }}>
                <TrendChart data={filtered} />
                <ModelPerformance data={filtered} persona={persona} />
              </div>
            )}
          </div>
        </section>

        {/* Q&S: Practitioners before Templates */}
        {isQS && (
          <section id="section-practitioners" style={{ paddingTop: 48 }}>
            {practitionersSection}
          </section>
        )}

        {/* Caseload */}
        <section id="section-caseload" style={{ paddingTop: 48 }}>
          <div style={{ marginBottom: 40 }}>
            <div style={SECTION_LABEL}>Caseload</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {isQS ? (
                <>
                  <FeedbackDistribution data={filtered} />
                  <TopicsChart data={filtered} />
                </>
              ) : (
                <>
                  <TopicsChart data={filtered} />
                  <FeedbackDistribution data={filtered} />
                </>
              )}
            </div>
          </div>
        </section>

        {/* Templates */}
        <section id="section-templates" style={{ paddingTop: 48 }}>
          {templatesSection}
        </section>

        {/* Non-Q&S: Practitioners after Templates */}
        {!isQS && (
          <section id="section-practitioners" style={{ paddingTop: 48 }}>
            {practitionersSection}
          </section>
        )}

      </div>

      <Footer data={filtered} />
    </div>
  );
}
