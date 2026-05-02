import { useState } from 'react';
import ViolationCard from './components/ViolationCard';
import StepProgress from './components/StepProgress';
import RemediationPanel from './components/RemediationPanel';
import './index.css';

function App() {
  const [view, setView] = useState('home');
  const [tab, setTab] = useState('scan');
  const [documentText, setDocumentText] = useState('');
  const [results, setResults] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [loadingPatterns, setLoadingPatterns] = useState(false);

  const handleScan = async () => {
    if (!documentText.trim()) {
      alert('Please enter document text');
      return;
    }

    setView('loading');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: documentText }),
      });

      if (!response.ok) {
        throw new Error('Scan failed');
      }

      const data = await response.json();
      setResults(data);
      
      setTimeout(() => {
        setView('results');
      }, 12000);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to scan document. Please try again.');
      setView('home');
    }
  };

  const handleAnalyzePatterns = async () => {
    setLoadingPatterns(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/patterns`);
      if (!response.ok) {
        throw new Error('Failed to fetch patterns');
      }
      const data = await response.json();
      setPatterns(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze patterns. Please try again.');
    } finally {
      setLoadingPatterns(false);
    }
  };

  const handleReset = () => {
    setView('home');
    setDocumentText('');
    setResults(null);
  };

  const getHighestSeverity = () => {
    if (!results?.violations?.length) return 'NONE';
    const severities = results.violations.map(v => v.severity);
    if (severities.includes('HIGH')) return 'HIGH';
    if (severities.includes('MEDIUM')) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <div className="min-h-screen bg-navy">
      {view === 'home' && (
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-ibm-blue to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-ibm-blue/50">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  RegulAI Sentinel
                </h1>
              </div>
              <p className="text-2xl font-semibold text-ibm-blue">
                AI-Powered Compliance Review
              </p>
            </div>

            <div className="flex gap-4 mb-8 justify-center">
              <button
                onClick={() => setTab('scan')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  tab === 'scan'
                    ? 'bg-ibm-blue text-white shadow-lg shadow-ibm-blue/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Scan Document
              </button>
              <button
                onClick={() => setTab('patterns')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  tab === 'patterns'
                    ? 'bg-ibm-blue text-white shadow-lg shadow-ibm-blue/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Patterns
              </button>
            </div>

            {tab === 'scan' && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
                <label className="block text-white font-semibold mb-4 text-lg">
                  Document Text
                </label>
                <textarea
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Paste your document text here for compliance analysis..."
                  className="w-full min-h-48 bg-slate-800 text-white border-2 border-gray-700 rounded-xl p-4 focus:outline-none focus:border-ibm-blue transition-colors resize-none placeholder-gray-500"
                />
                
                <button
                  onClick={handleScan}
                  className="mt-6 w-full bg-gradient-to-r from-ibm-blue to-blue-700 hover:shadow-lg hover:shadow-ibm-blue/50 text-white font-bold py-4 px-8 rounded-xl transition-all text-lg transform hover:scale-[1.02]"
                >
                  Scan Document
                </button>
              </div>
            )}

            {tab === 'patterns' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-4">Historical Pattern Analysis</h2>
                  <p className="text-gray-400 mb-6">Analyze compliance violations across all historical audits</p>
                  
                  <button
                    onClick={handleAnalyzePatterns}
                    disabled={loadingPatterns}
                    className="w-full bg-gradient-to-r from-ibm-blue to-blue-700 hover:shadow-lg hover:shadow-ibm-blue/50 text-white font-bold py-4 px-8 rounded-xl transition-all text-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingPatterns ? 'Analyzing...' : 'Analyze Patterns'}
                  </button>
                </div>

                {loadingPatterns && (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 border border-gray-700 shadow-2xl">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ibm-blue"></div>
                    </div>
                  </div>
                )}

                {patterns && !loadingPatterns && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="grid grid-cols-4 gap-6 flex-1">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
                          <p className="text-gray-400 text-sm mb-2">Total Documents</p>
                          <p className="text-4xl font-bold text-white">{patterns.total_documents_analyzed}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
                          <p className="text-gray-400 text-sm mb-2">Total Violations</p>
                          <p className="text-4xl font-bold text-white">{patterns.total_violations}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
                          <p className="text-gray-400 text-sm mb-2">HIGH Severity</p>
                          <p className="text-4xl font-bold text-red-500">{patterns.severity_breakdown?.HIGH || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl">
                          <p className="text-gray-400 text-sm mb-2">Riskiest Clause</p>
                          <p className="text-lg font-bold text-ibm-blue truncate">{patterns.riskiest_clause || 'N/A'}</p>
                        </div>
                      </div>
                      <div className={`ml-4 px-4 py-2 rounded-lg font-semibold ${
                        patterns.trend === 'increasing' ? 'bg-red-900/30 text-red-400 border border-red-700' :
                        patterns.trend === 'decreasing' ? 'bg-green-900/30 text-green-400 border border-green-700' :
                        'bg-gray-700 text-gray-300 border border-gray-600'
                      }`}>
                        {patterns.trend === 'increasing' ? '⬆ Increasing' :
                         patterns.trend === 'decreasing' ? '⬇ Decreasing' :
                         '➡ Stable'}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-xl">
                      <h3 className="text-2xl font-bold text-white mb-6">Top Violations</h3>
                      <div className="space-y-6">
                        {patterns.top_violations?.map((violation, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-ibm-blue font-mono text-sm bg-ibm-blue/10 px-3 py-1 rounded-lg">
                                {violation.clause_id}
                              </span>
                              <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                Risk: {violation.avg_risk_score}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3 leading-relaxed">{violation.clause_description}</p>
                            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-2">
                              <div
                                className="bg-gradient-to-r from-ibm-blue to-blue-600 h-full rounded-full transition-all"
                                style={{ width: `${(violation.count / patterns.total_violations) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-gray-500 text-xs">
                              Affected docs: {violation.affected_docs?.length || 0} | Last seen: {new Date(violation.last_seen * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-ibm-blue/20 to-blue-900/20 rounded-2xl p-8 border-2 border-ibm-blue/50 shadow-xl">
                      <h3 className="text-xl font-bold text-ibm-blue mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        AI Summary
                      </h3>
                      <p className="text-gray-200 leading-relaxed">{patterns.ai_summary}</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-xl">
                      <h3 className="text-2xl font-bold text-white mb-6">Repeat Offenders</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-900/80">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Document ID</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Violations</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {patterns.repeat_offenders?.map((offender, index) => (
                              <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-mono text-gray-300">
                                  {offender.doc_id.substring(0, 8)}...
                                </td>
                                <td className="px-6 py-4">
                                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    {offender.violation_count}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="bg-ibm-blue/20 text-ibm-blue px-3 py-1 rounded-full text-xs font-semibold">
                                    {offender.doc_type}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-2xl p-6 border-2 border-red-700/50 shadow-xl">
                        <p className="text-red-400 text-sm font-semibold mb-2">HIGH Severity</p>
                        <p className="text-4xl font-bold text-red-500">{patterns.severity_breakdown?.HIGH || 0}</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-2xl p-6 border-2 border-amber-700/50 shadow-xl">
                        <p className="text-amber-400 text-sm font-semibold mb-2">MEDIUM Severity</p>
                        <p className="text-4xl font-bold text-amber-500">{patterns.severity_breakdown?.MEDIUM || 0}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-2xl p-6 border-2 border-green-700/50 shadow-xl">
                        <p className="text-green-400 text-sm font-semibold mb-2">LOW Severity</p>
                        <p className="text-4xl font-bold text-green-500">{patterns.severity_breakdown?.LOW || 0}</p>
                      </div>
                    </div>

                    <div className="text-center text-gray-500 text-sm">
                      Analyzed at: {new Date(patterns.analyzed_at * 1000).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'loading' && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-6xl w-full">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 border border-gray-700 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-12 text-center">Processing Document...</h2>
              <StepProgress />
            </div>
          </div>
        </div>
      )}

      {view === 'results' && results && (
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-white">Compliance Report</h1>
              <button
                onClick={handleReset}
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg"
              >
                New Scan
              </button>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 mb-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Violations Found</p>
                  <p className="text-5xl font-bold text-white">
                    {results.violations?.length || 0}
                    <span className={`ml-4 text-2xl ${
                      getHighestSeverity() === 'HIGH' ? 'text-red-500' :
                      getHighestSeverity() === 'MEDIUM' ? 'text-amber-500' :
                      'text-green-500'
                    }`}>
                      {getHighestSeverity()}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-2">Audit ID</p>
                  <p className="text-sm font-mono text-ibm-blue bg-ibm-blue/10 px-4 py-2 rounded-lg">
                    {results.audit_id}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-ibm-blue rounded-full"></span>
                Violations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.violations?.map((violation, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-l-4 ${
                      violation.severity === 'HIGH' ? 'border-red-500' :
                      violation.severity === 'MEDIUM' ? 'border-amber-500' :
                      'border-green-500'
                    } shadow-lg hover:shadow-xl transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className={`${
                        violation.severity === 'HIGH' ? 'bg-red-600' :
                        violation.severity === 'MEDIUM' ? 'bg-amber-500' :
                        'bg-green-600'
                      } text-white px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                        {violation.severity}
                      </span>
                      <span className="text-ibm-blue text-sm font-mono bg-ibm-blue/10 px-3 py-1 rounded-lg">
                        {violation.clause_id}
                      </span>
                    </div>
                    
                    {violation.section && (
                      <div className="mb-3">
                        <h3 className="text-gray-400 text-xs uppercase font-semibold mb-1">Section</h3>
                        <p className="text-gray-300 text-sm">{violation.section}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-gray-400 text-xs uppercase font-semibold mb-1">Explanation</h3>
                      <p className="text-gray-200 text-sm leading-relaxed">{violation.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-ibm-blue rounded-full"></span>
                Risk Assessment
              </h2>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                <table className="w-full">
                  <thead className="bg-gray-900/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Clause ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Risk Score</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {results.scored_violations?.map((scored, index) => (
                      <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-900/30'} hover:bg-gray-700/50 transition-colors`}>
                        <td className="px-6 py-4 text-sm font-mono text-ibm-blue">{scored.clause_id}</td>
                        <td className="px-6 py-4">
                          <span className={`${
                            scored.severity === 'HIGH' ? 'bg-red-600' :
                            scored.severity === 'MEDIUM' ? 'bg-amber-500' :
                            'bg-green-600'
                          } text-white px-2 py-1 rounded text-xs font-bold`}>
                            {scored.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-white">{scored.risk_score}</td>
                        <td className="px-6 py-4">
                          <span className="bg-ibm-blue text-white px-3 py-1 rounded-full text-xs font-bold">
                            {scored.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {results.remediations && results.remediations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 bg-ibm-blue rounded-full"></span>
                  Remediations
                </h2>
                <div className="space-y-6">
                  {results.remediations.map((remediation, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                      <div className="bg-gray-900/80 px-6 py-3 border-b border-gray-700">
                        <span className="text-ibm-blue font-mono text-sm font-semibold">{remediation.clause_id}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 p-6">
                        <div className="bg-red-900/20 border-2 border-red-900/50 rounded-xl p-5">
                          <h3 className="text-red-400 font-bold mb-3 text-sm uppercase flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Original
                          </h3>
                          <p className="text-gray-300 text-sm leading-relaxed">{remediation.original}</p>
                        </div>
                        
                        <div className="bg-green-900/20 border-2 border-green-900/50 rounded-xl p-5">
                          <h3 className="text-green-400 font-bold mb-3 text-sm uppercase flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Rewrite
                          </h3>
                          <p className="text-gray-300 text-sm leading-relaxed">{remediation.rewrite}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center py-6 border-t border-gray-800">
              <p className="text-gray-500 text-sm">
                Audit Timestamp: {new Date(results.timestamp * 1000).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// Made with Bob
