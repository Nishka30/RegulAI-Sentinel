import { useState } from 'react';
import { FiFile, FiCopy, FiCheck, FiX, FiAlertTriangle, FiShield, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const R = 4;

const truncateId = (id) => id ? `${id.slice(0, 8)}…` : '—';

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return (
    <button onClick={copy} title="Copy full Audit ID" style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, transition: 'color 0.2s', fontFamily: 'inherit', marginTop: 5 }}>
      {copied ? <><FiCheck size={11} /> Copied!</> : <><FiCopy size={11} /> Copy full ID</>}
    </button>
  );
};

const sev = (v) => v?.violations?.length
  ? (v.violations.some(x => x.severity === 'HIGH') ? 'HIGH' : v.violations.some(x => x.severity === 'MEDIUM') ? 'MEDIUM' : 'LOW')
  : 'CLEAN';

const SEV_COLOR  = { HIGH: 'var(--red)',    MEDIUM: 'var(--amber)',    LOW: '#eab308',                 CLEAN: 'var(--green)' };
const SEV_BG     = { HIGH: 'var(--red-bg)', MEDIUM: 'var(--amber-bg)', LOW: 'rgba(234,179,8,0.10)',   CLEAN: 'var(--green-bg)' };
const SEV_BORDER = { HIGH: 'var(--red-border)', MEDIUM: 'var(--amber-border)', LOW: 'rgba(234,179,8,0.25)', CLEAN: 'var(--green-border)' };

function SevBadge({ s }) {
  const Icon = s === 'CLEAN' ? FiShield : FiAlertTriangle;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: R, fontSize: 11, fontWeight: 700, letterSpacing: '0.4px', background: SEV_BG[s], color: SEV_COLOR[s], border: `1px solid ${SEV_BORDER[s]}`, textTransform: 'uppercase' }}>
      <Icon size={10} /> {s}
    </span>
  );
}

export default function MultiDocResults({ allResults, docNames, onReset }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const r = allResults[activeIdx];
  const totalViol = allResults.reduce((s, x) => s + (x?.violations?.length || 0), 0);
  const C = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: R, padding: 24, boxShadow: 'var(--shadow-card)', marginBottom: 20 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
              <div style={{ width: 36, height: 36, borderRadius: R, background: 'var(--accent-subtle)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiFile size={17} color="var(--accent)" />
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>Compliance Report</h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>
              {allResults.length} document{allResults.length !== 1 ? 's' : ''} scanned ·{' '}
              <span style={{ color: totalViol > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                {totalViol} total violation{totalViol !== 1 ? 's' : ''}
              </span>
            </p>
          </div>
          <button className="ghost-btn" style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }} onClick={onReset}>
            ← New Scan
          </button>
        </div>

        {/* Document switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(allResults.length, 5)}, 1fr)`, gap: 10, marginBottom: 28 }}>
          {allResults.map((res, i) => {
            const s = sev(res);
            const cnt = res?.violations?.length || 0;
            const active = i === activeIdx;
            return (
              <button key={i} onClick={() => setActiveIdx(i)} style={{ background: active ? 'var(--accent-subtle)' : 'var(--card)', border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`, borderRadius: R, padding: '14px 16px', textAlign: 'left', cursor: 'pointer', boxShadow: active ? 'var(--shadow-glow)' : 'var(--shadow-card)', transition: 'all 0.2s ease' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{docNames[i] || `Document ${i + 1}`}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{cnt}</span>
                  <SevBadge s={s} />
                </div>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{cnt} violation{cnt !== 1 ? 's' : ''}</p>
              </button>
            );
          })}
        </div>

        {r && (
          <>
            {/* Overview card */}
            <div style={{ ...C, background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{docNames[activeIdx]}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
                    <span style={{ fontSize: 48, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{r.violations?.length || 0}</span>
                    <SevBadge s={sev(r)} />
                  </div>
                  <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {r.violations?.length ? 'Violations detected — review required' : 'No violations found — document is compliant'}
                  </p>
                  {/* Severity distribution bar */}
                  {r.violations?.length > 0 && (() => {
                    const total = r.violations.length;
                    const high   = r.violations.filter(v => v.severity === 'HIGH').length;
                    const medium = r.violations.filter(v => v.severity === 'MEDIUM').length;
                    const low    = total - high - medium;
                    return (
                      <div>
                        <div style={{ display: 'flex', height: 6, borderRadius: R, overflow: 'hidden', gap: 2, marginBottom: 5 }}>
                          {high   > 0 && <div style={{ flex: high,   background: 'var(--red)',   borderRadius: R }} />}
                          {medium > 0 && <div style={{ flex: medium, background: 'var(--amber)', borderRadius: R }} />}
                          {low    > 0 && <div style={{ flex: low,    background: 'var(--green)', borderRadius: R }} />}
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          {high   > 0 && <span style={{ fontSize: 11, color: 'var(--red)',   fontWeight: 600 }}>{high} HIGH</span>}
                          {medium > 0 && <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600 }}>{medium} MEDIUM</span>}
                          {low    > 0 && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>{low} LOW</span>}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Audit ID</p>
                    <code style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-subtle)', padding: '5px 12px', borderRadius: R, border: '1px solid var(--accent-glow)', display: 'inline-block' }}>{truncateId(r.audit_id)}</code>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><CopyBtn text={r.audit_id} /></div>
                  </div>
                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: R, padding: '12px 18px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Compliance Score</p>
                    {(() => {
                      const total = (r.scored_violations?.length || 0) + 10;
                      const score = Math.max(0, Math.round(100 - (r.violations?.length || 0) / total * 100));
                      const sc = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
                      return <p style={{ margin: 0, fontSize: 30, fontWeight: 900, color: sc }}>{score}<span style={{ fontSize: 15 }}>%</span></p>;
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Violations */}
            {r.violations?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 3, height: 18, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} />
                  Violations Detected
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>({r.violations.length})</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 12 }}>
                  {r.violations.map((v, i) => {
                    const s = v.severity?.toUpperCase() || 'LOW';
                    const sc = { HIGH: 'var(--red)', MEDIUM: 'var(--amber)', LOW: 'var(--green)' }[s] || 'var(--green)';
                    return (
                      <div key={i} style={{ background: 'var(--card)', border: `1px solid var(--border)`, borderLeft: `3px solid ${sc}`, borderRadius: R, padding: 18, boxShadow: 'var(--shadow-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: R, background: SEV_BG[s], color: sc, border: `1px solid ${SEV_BORDER[s]}`, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiAlertTriangle size={9} /> {s}
                          </span>
                          <code style={{ fontSize: 11, color: 'var(--accent)', background: 'var(--accent-subtle)', padding: '3px 9px', borderRadius: R, border: '1px solid var(--border)' }}>{v.clause_id}</code>
                        </div>
                        {v.section && (
                          <div style={{ marginBottom: 8 }}>
                            <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Section</p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{v.section}</p>
                          </div>
                        )}
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Explanation</p>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{v.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Risk table */}
            {r.scored_violations?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 3, height: 18, background: 'var(--amber)', borderRadius: 2, display: 'inline-block' }} />
                  Risk Assessment
                </h2>
                <div style={{ ...C, padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface2)' }}>
                        {['Clause ID', 'Severity', 'Risk Score', 'Priority'].map(h => (
                          <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {r.scored_violations.map((s, i) => {
                        const c = { HIGH: 'var(--red)', MEDIUM: 'var(--amber)', LOW: 'var(--green)' }[s.severity] || 'var(--green)';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--card)' : 'var(--surface2)' }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--card-hover)'}
                            onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--card)' : 'var(--surface2)'}
                          >
                            <td style={{ padding: '11px 18px', fontSize: 12, fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 600 }}>{s.clause_id}</td>
                            <td style={{ padding: '11px 18px' }}><span style={{ padding: '3px 8px', borderRadius: R, fontSize: 10, fontWeight: 700, background: SEV_BG[s.severity] || 'var(--green-bg)', color: c, border: `1px solid ${SEV_BORDER[s.severity] || 'var(--green-border)'}` }}>{s.severity}</span></td>
                            <td style={{ padding: '11px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', minWidth: 28 }}>{s.risk_score}</span>
                                <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: R, overflow: 'hidden', minWidth: 70 }}>
                                  <div style={{ width: `${Math.min(s.risk_score, 100)}%`, height: '100%', background: c, borderRadius: R }} />
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '11px 18px' }}><span style={{ padding: '3px 10px', borderRadius: R, fontSize: 10, fontWeight: 700, background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--border)' }}>{s.priority}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Remediations */}
            {r.remediations?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 3, height: 18, background: 'var(--green)', borderRadius: 2, display: 'inline-block' }} />
                  Remediation Suggestions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {r.remediations.map((rem, i) => (
                    <div key={i} style={{ ...C, padding: 0, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 18px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <code style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>{rem.clause_id}</code>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Remediation #{i + 1}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                        <div style={{ padding: 18, borderRight: '1px solid var(--border)', background: 'var(--red-bg)' }}>
                          <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <FiX size={11} /> Original Clause
                          </p>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rem.original}</p>
                        </div>
                        <div style={{ padding: 18, background: 'var(--green-bg)' }}>
                          <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <FiCheck size={11} /> Suggested Rewrite
                          </p>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{rem.rewrite}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', paddingTop: 20, borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12 }}>
              Audit Timestamp: {new Date(r.timestamp * 1000).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
