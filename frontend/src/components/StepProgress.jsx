import { useEffect, useState } from 'react';

export default function StepProgress() {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { name: 'DocIngest', icon: '📄' },
    { name: 'RegMap', icon: '🗺' },
    { name: 'ViolationDetector', icon: '🔍' },
    { name: 'RiskScorer', icon: '⚖️' },
    { name: 'Remediation', icon: '✍️' },
    { name: 'AuditLogger', icon: '📋' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStepStatus = (index) => {
    if (index < activeStep) return 'completed';
    if (index === activeStep) return 'active';
    return 'pending';
  };

  return (
    <div className="flex flex-col items-center space-y-12">
      <div className="flex items-center justify-center space-x-6">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          
          return (
            <div key={step.name} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    status === 'completed'
                      ? 'bg-green-600 border-green-500 shadow-lg shadow-green-500/50'
                      : status === 'active'
                      ? 'bg-ibm-blue border-ibm-blue shadow-lg shadow-ibm-blue/50 animate-pulse'
                      : 'bg-gray-800 border-gray-600'
                  }`}
                >
                  {status === 'completed' ? (
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-3xl">{step.icon}</span>
                  )}
                </div>
                <span
                  className={`mt-3 text-sm font-semibold transition-colors ${
                    status === 'completed'
                      ? 'text-green-400'
                      : status === 'active'
                      ? 'text-ibm-blue'
                      : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
                <span
                  className={`mt-1 text-xs font-medium transition-colors ${
                    status === 'completed'
                      ? 'text-green-500'
                      : status === 'active'
                      ? 'text-ibm-blue'
                      : 'text-gray-600'
                  }`}
                >
                  {status === 'completed' ? 'Complete' : status === 'active' ? 'Processing...' : 'Pending'}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="mx-4">
                  <svg className={`w-8 h-8 transition-colors ${
                    index < activeStep ? 'text-green-500' : 'text-gray-700'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Made with Bob
