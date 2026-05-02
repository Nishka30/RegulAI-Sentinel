export default function RemediationPanel({ remediations }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Remediations</h2>
      
      <div className="space-y-6">
        {remediations.map((remediation, index) => (
          <div key={index} className="border border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
              <span className="text-ibm-blue font-mono text-sm">{remediation.clause_id}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="bg-red-900/20 border border-red-900/50 rounded p-4">
                <h3 className="text-red-400 font-semibold mb-2 text-sm">Original</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{remediation.original}</p>
              </div>
              
              <div className="bg-green-900/20 border border-green-900/50 rounded p-4">
                <h3 className="text-green-400 font-semibold mb-2 text-sm">Rewrite</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{remediation.rewrite}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Made with Bob
