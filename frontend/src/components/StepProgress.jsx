import { useEffect, useState } from 'react';
import { FiFile, FiMap, FiSearch, FiBarChart2, FiEdit, FiClipboard, FiCheck } from 'react-icons/fi';

const R = 4;

const STEPS = [
  { name: 'DocIngest',         label: 'Document Ingestion',   desc: 'Parsing and tokenizing document content',       Icon: FiFile },
  { name: 'RegMap',            label: 'Regulatory Mapping',   desc: 'Aligning clauses with regulatory framework',    Icon: FiMap },
  { name: 'ViolationDetector', label: 'Violation Detection',  desc: 'Scanning for compliance breaches with AI',      Icon: FiSearch },
  { name: 'RiskScorer',        label: 'Risk Scoring',         desc: 'Calculating severity and priority indices',      Icon: FiBarChart2 },
  { name: 'Remediation',       label: 'Remediation Engine',   desc: 'Generating corrective recommendations',          Icon: FiEdit },
  { name: 'AuditLogger',       label: 'Audit Logging',        desc: 'Persisting findings to immutable audit trail',   Icon: FiClipboard },
];

export default function StepProgress({ currentDoc = 0, totalDocs = 1, docName = '' }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, [currentDoc]);

  const pct = totalDocs > 0 ? Math.round((currentDoc / totalDocs) * 100) : 0;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Multi-doc progress */}
      {totalDocs > 1 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Scanning document{' '}
              <strong style={{ color: 'var(--accent)' }}>{currentDoc}</strong> of{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{totalDocs}</strong>
              {docName && <span style={{ color: 'var(--text-muted)' }}> — {docName}</span>}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ height: 5, background: 'var(--border)', borderRadius: R, overflow: 'hidden' }}>
            <div className="progress-bar-shimmer" style={{ height: '100%', borderRadius: R, width: `${pct}%`, transition: 'width 0.7s ease' }} />
          </div>
        </div>
      )}

      {/* Step list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {STEPS.map((step, i) => {
          const status = i < activeStep ? 'done' : i === activeStep ? 'active' : 'pending';
          const { Icon } = step;
          return (
            <div key={step.name} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
              borderRadius: R,
              border: `1px solid ${status === 'active' ? 'var(--accent)' : status === 'done' ? 'var(--green-border)' : 'var(--border)'}`,
              background: status === 'active' ? 'var(--accent-subtle)' : status === 'done' ? 'var(--green-bg)' : 'var(--surface2)',
              transition: 'all 0.35s ease',
              boxShadow: status === 'active' ? 'var(--shadow-glow)' : 'none',
              opacity: status === 'pending' ? 0.45 : 1,
            }}>
              {/* Icon box */}
              <div style={{
                width: 36, height: 36, borderRadius: R, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: status === 'active' ? 'var(--accent)' : status === 'done' ? 'var(--green)' : 'var(--border)',
                boxShadow: status === 'active' ? '0 2px 12px var(--accent-glow)' : 'none',
                transition: 'all 0.35s ease',
              }}>
                {status === 'done'
                  ? <FiCheck size={16} color="#fff" strokeWidth={2.5} />
                  : <Icon size={15} color={status === 'active' ? '#fff' : 'var(--text-muted)'} />
                }
              </div>

              {/* Labels */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: status === 'active' ? 'var(--accent)' : status === 'done' ? 'var(--green)' : 'var(--text-muted)' }}>
                    {step.label}
                  </span>
                  {status === 'active' && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent)', padding: '1px 7px', borderRadius: 3, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                      Live
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{step.desc}</p>
              </div>

              {/* Status indicator */}
              <div style={{ flexShrink: 0 }}>
                {status === 'active' && (
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    {[0, 1, 2].map(j => (
                      <div key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: `pulse-glow 1.2s ease ${j * 0.2}s infinite` }} />
                    ))}
                  </div>
                )}
                {status === 'done' && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>Done</span>}
                {status === 'pending' && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Queued</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline progress bar */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pipeline progress</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{activeStep + 1} / {STEPS.length}</span>
        </div>
        <div style={{ height: 4, background: 'var(--border)', borderRadius: R, overflow: 'hidden' }}>
          <div className="progress-bar-shimmer" style={{ height: '100%', borderRadius: R, width: `${((activeStep + 1) / STEPS.length) * 100}%`, transition: 'width 0.5s ease' }} />
        </div>
      </div>
    </div>
  );
}

// Made with Bob
