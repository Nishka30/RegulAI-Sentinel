export default function ViolationCard({ violation }) {
  const severityColors = {
    HIGH: 'bg-red-600',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-green-600'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-ibm-blue transition-colors">
      <div className="flex items-start justify-between mb-4">
        <span className={`${severityColors[violation.severity]} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
          {violation.severity}
        </span>
        <span className="text-gray-400 text-sm font-mono">{violation.clause_id}</span>
      </div>
      
      <div className="mb-3">
        <h3 className="text-white font-semibold mb-2">Section</h3>
        <p className="text-gray-300 text-sm">{violation.section || 'N/A'}</p>
      </div>
      
      <div>
        <h3 className="text-white font-semibold mb-2">Explanation</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{violation.explanation}</p>
      </div>
    </div>
  );
}

// Made with Bob
