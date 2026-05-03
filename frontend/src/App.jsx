import { useState, useEffect } from 'react';
import { FiSearch, FiBarChart2, FiShield, FiSun, FiMoon, FiPlus } from 'react-icons/fi';
import StepProgress from './components/StepProgress';
import DocumentTab from './components/DocumentTab';
import MultiDocResults from './components/MultiDocResults';
import './index.css';

const newDoc = (num) => ({
  id: Date.now() + Math.random(),
  name: `Document ${num}`,
  mode: 'text', text: '',
  pdfFile: null, pdfUrl: null, pdfFileName: '',
  extracting: false, extracted: false,
});

// ── Patterns tab (separate to keep App lean) ──
function PatternsTab() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/patterns`);
      if (!r.ok) throw new Error();
      setData(await r.json());
    } catch { alert('Failed to load patterns.'); }
    finally { setLoading(false); }
  };

  const C = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 4, padding: 24, boxShadow: 'var(--shadow-card)', marginBottom: 16 };

  return (
    <div>
      <div style={C}>
        <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Historical Pattern Analysis</h2>
        <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: 14 }}>Analyze compliance violations across all historical audits</p>
        <button className="accent-btn" onClick={load} disabled={loading} style={{ width: '100%', padding: '13px 24px', fontSize: 14, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <FiSearch size={16} />
          {loading ? 'Analyzing…' : 'Analyze Patterns'}
        </button>
      </div>

      {loading && (
        <div style={{ ...C, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin-slow 0.8s linear infinite' }}/>
        </div>
      )}

      {data && !loading && (
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Documents', val: data.total_documents_analyzed, color: 'var(--text-primary)' },
              { label: 'Total Violations', val: data.total_violations, color: 'var(--text-primary)' },
              { label: 'HIGH Severity', val: data.severity_breakdown?.HIGH || 0, color: 'var(--red)' },
              { label: 'Riskiest Clause', val: data.riskiest_clause || 'N/A', color: 'var(--accent)', small: true },
            ].map(({ label, val, color, small }) => (
              <div key={label} style={C}>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600 }}>{label}</p>
                <p style={{ margin: 0, fontSize: small ? 18 : 36, fontWeight: 800, color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Trend */}
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{
              padding: '5px 14px', borderRadius: 4, fontWeight: 700, fontSize: 13,
              background: data.trend === 'increasing' ? 'var(--red-bg)' : data.trend === 'decreasing' ? 'var(--green-bg)' : 'var(--surface2)',
              color: data.trend === 'increasing' ? 'var(--red)' : data.trend === 'decreasing' ? 'var(--green)' : 'var(--text-secondary)',
              border: `1px solid ${data.trend === 'increasing' ? 'var(--red-border)' : data.trend === 'decreasing' ? 'var(--green-border)' : 'var(--border)'}`,
            }}>
              {data.trend === 'increasing' ? 'Increasing' : data.trend === 'decreasing' ? 'Decreasing' : 'Stable'}
            </span>
          </div>

          {/* Top violations */}
          <div style={C}>
            <h3 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Top Violations</h3>
            {data.top_violations?.map((v, i) => (
              <div key={i} style={{ padding: '16px 0', borderBottom: i < data.top_violations.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <code style={{ fontSize: 12, color: 'var(--accent)', background: 'var(--accent-subtle)', padding: '3px 10px', borderRadius: 8 }}>{v.clause_id}</code>
                  <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--amber-bg)', color: 'var(--amber)', border: '1px solid var(--amber-border)', padding: '3px 10px', borderRadius: 99 }}>Risk: {v.avg_risk_score}</span>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{v.clause_description}</p>
                <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ width: `${(v.count / data.total_violations) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 99 }}/>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Affected: {v.affected_docs?.length || 0} · Last seen: {new Date(v.last_seen * 1000).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          {/* AI Summary */}
          <div style={{ ...C, background: 'var(--accent-subtle)', border: '1.5px solid var(--accent)', borderRadius: 20 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>✦ AI Summary</h3>
            <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.7, fontSize: 14 }}>{data.ai_summary}</p>
          </div>

          {/* Severity breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'HIGH', val: data.severity_breakdown?.HIGH || 0, c: 'var(--red)', bg: 'var(--red-bg)', bd: 'var(--red-border)' },
              { label: 'MEDIUM', val: data.severity_breakdown?.MEDIUM || 0, c: 'var(--amber)', bg: 'var(--amber-bg)', bd: 'var(--amber-border)' },
              { label: 'LOW', val: data.severity_breakdown?.LOW || 0, c: 'var(--green)', bg: 'var(--green-bg)', bd: 'var(--green-border)' },
            ].map(({ label, val, c, bg, bd }) => (
              <div key={label} style={{ background: bg, border: `1.5px solid ${bd}`, borderRadius: 18, padding: 24 }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label} Severity</p>
                <p style={{ margin: 0, fontSize: 40, fontWeight: 900, color: c }}>{val}</p>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            Analyzed at: {new Date(data.analyzed_at * 1000).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [view, setView]     = useState('home');
  const [tab, setTab]       = useState('scan');
  const [docs, setDocs]     = useState(() => [newDoc(1)]);
  const [activeId, setActiveId]   = useState(docs[0].id);
  const [results, setResults]     = useState(null);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [currentDocName, setCurrentDocName] = useState('');

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const updateDoc = (id, patch) => setDocs(p => p.map(d => d.id === id ? { ...d, ...patch } : d));

  const addDoc = () => {
    if (docs.length >= 10) return;
    setDocs(prev => {
      const d = newDoc(prev.length + 1);
      setActiveId(d.id);
      return [...prev, d];
    });
  };

  const deleteDoc = (id) => {
    setDocs(prev => {
      const next = prev.filter(d => d.id !== id);
      if (next.length === 0) return prev;
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const handleScanAll = async () => {
    const valid = docs.filter(d => d.text.trim());
    if (!valid.length) { alert('Add content to at least one document.'); return; }
    setView('loading');
    setScanProgress({ current: 0, total: valid.length });
    const allResults = [];
    for (let i = 0; i < valid.length; i++) {
      setScanProgress({ current: i + 1, total: valid.length });
      setCurrentDocName(valid[i].name);
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_URL}/scan`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: valid[i].text }),
        });
        if (!resp.ok) throw new Error();
        allResults.push(await resp.json());
      } catch { allResults.push(null); }
    }
    setResults({ data: allResults, names: valid.map(d => d.name) });
    setTimeout(() => setView('results'), 12000);
  };

  const handleReset = () => {
    const d = newDoc(1);
    setDocs([d]);
    setActiveId(d.id);
    setResults(null); setView('home'); setTab('scan');
  };

  const readyCount = docs.filter(d => d.text.trim()).length;
  const activeDoc  = docs.find(d => d.id === activeId) || docs[0];

  // ── Theme toggle button ──
  const ThemeToggle = () => (
    <button onClick={() => setIsDark(v => !v)} style={{
      display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px',
      background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4,
      cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
      transition: 'all 0.2s ease', fontFamily: 'inherit',
    }}
      onMouseOver={e => e.currentTarget.style.background = 'var(--card-hover)'}
      onMouseOut={e  => e.currentTarget.style.background = 'var(--surface2)'}
    >
      {isDark ? <><FiSun size={13} /> Light</> : <><FiMoon size={13} /> Dark</>}
    </button>
  );

  // ── LOADING VIEW ──
  if (view === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 680, width: '100%' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: 40, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ width: 56, height: 56, borderRadius: 4, margin: '0 auto 18px', background: 'linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px var(--accent-glow)' }}>
                <FiShield size={26} color="#fff" />
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>Running Compliance Analysis</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15 }}>
                Our AI pipeline is reviewing your document{scanProgress.total > 1 ? 's' : ''} against regulatory frameworks
              </p>
            </div>
            <StepProgress currentDoc={scanProgress.current} totalDocs={scanProgress.total} docName={currentDocName} />
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS VIEW ──
  if (view === 'results' && results) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Sticky topbar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--surface)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 4, background: 'linear-gradient(135deg,var(--accent),#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiShield size={15} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>RegulAI Sentinel</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '2px 7px', background: 'var(--accent-subtle)', border: '1px solid var(--border)', borderRadius: 3 }}>Report</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <ThemeToggle />
            <button className="ghost-btn" onClick={handleReset} style={{ padding: '8px 18px', fontSize: 13 }}>← New Scan</button>
          </div>
        </div>
        <MultiDocResults allResults={results.data} docNames={results.names} onReset={handleReset} />
      </div>
    );
  }

  // ── HOME VIEW ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 4, background: 'linear-gradient(135deg,var(--accent),#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px var(--accent-glow)' }}>
            <FiShield size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>RegulAI Sentinel</span>
          <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, padding: '2px 7px', background: 'var(--accent-subtle)', borderRadius: 3, border: '1px solid var(--border)' }}>BETA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {['scan', 'patterns'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', borderRadius: 4, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              border: '1px solid ' + (tab === t ? 'var(--accent)' : 'var(--border)'),
              background: tab === t ? 'var(--accent-subtle)' : 'transparent',
              color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'all 0.18s ease', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
            }}>
              {t === 'scan' ? <><FiSearch size={13} /> Scan Documents</> : <><FiBarChart2 size={13} /> Patterns</>}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }}/>
          <ThemeToggle />
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'var(--accent-subtle)', border: '1px solid var(--accent)', borderRadius: 3, marginBottom: 18 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse-glow 2s ease infinite' }}/>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>AI-Powered Compliance Review</span>
          </div>
          <h1 style={{ margin: '0 0 14px', fontSize: 54, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
            Compliance{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              at Scale
            </span>
          </h1>
          <p style={{ margin: 0, fontSize: 18, color: 'var(--text-secondary)', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Upload multiple documents, detect regulatory violations, and receive AI-powered remediation suggestions.
          </p>
        </div>

        {tab === 'scan' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>

            {/* Tab bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '0 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', overflowX: 'auto' }}>
              {docs.map(d => (
                <div key={d.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                  className="group"
                >
                  <button
                    className={`doc-tab${d.id === activeId ? ' active' : ''}`}
                    onClick={() => setActiveId(d.id)}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.text.trim() ? 'var(--green)' : 'var(--text-dim)', flexShrink: 0, display: 'inline-block' }}/>
                    <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                  </button>
                  {docs.length > 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteDoc(d.id); }}
                      style={{
                        position: 'absolute', top: 4, right: -4, width: 16, height: 16,
                        borderRadius: '50%', background: 'var(--border-light)', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: 'var(--text-muted)', lineHeight: 1,
                        transition: 'all 0.15s ease', zIndex: 5, opacity: 0,
                      }}
                      className="tab-close"
                      onMouseOver={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.opacity = 1; }}
                      onMouseOut={e  => { e.currentTarget.style.background = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.opacity = 0; }}
                    >×</button>
                  )}
                </div>
              ))}
              {docs.length < 10 && (
                <button onClick={addDoc} style={{ flexShrink: 0, padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', borderRadius: 4, transition: 'background 0.15s', display: 'flex', alignItems: 'center' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--accent-subtle)'}
                  onMouseOut={e  => e.currentTarget.style.background = 'none'}
                  title="Add document"
                ><FiPlus size={16} /></button>
              )}
              <div style={{ marginLeft: 'auto', paddingLeft: 16, paddingRight: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {docs.length}/10 · <span style={{ color: readyCount > 0 ? 'var(--green)' : 'var(--text-muted)' }}>{readyCount} ready</span>
                </span>
              </div>
            </div>

            {/* Document content */}
            <div style={{ padding: 32 }}>
              {activeDoc && (
                <DocumentTab doc={activeDoc} onDelete={deleteDoc} onUpdate={updateDoc} isOnly={docs.length === 1} />
              )}

              {/* Scan button */}
              <div style={{ marginTop: 28 }}>
                <button
                  className="accent-btn"
                  onClick={handleScanAll}
                  disabled={readyCount === 0}
                  style={{ width: '100%', padding: '14px 32px', fontSize: 15, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <FiSearch size={16} />
                  {readyCount === 0 ? 'Scan All Documents'
                    : docs.length === 1 ? 'Scan Document'
                    : `Scan All ${readyCount} Document${readyCount !== 1 ? 's' : ''}`}
                </button>
                {readyCount === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, margin: '10px 0 0' }}>
                    Add text or upload a PDF to enable scanning
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'patterns' && <PatternsTab />}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12 }}>
        RegulAI Sentinel · AI-Powered Compliance Review · Built with precision
      </div>
    </div>
  );
}

// Made with Bob
