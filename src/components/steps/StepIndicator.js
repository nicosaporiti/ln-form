import React from 'react';

const StepIndicator = ({ currentStep }) => {
  const getStepClass = (step) => {
    if (currentStep > step) return 'completed';
    if (currentStep === step) return 'active';
    return 'inactive';
  };

  const getConnectorClass = (afterStep) => {
    return currentStep > afterStep ? 'completed' : '';
  };

  return (
    <div className="step-indicator">
      {/* Step 1 - Datos */}
      <div className={`step-pill ${getStepClass(1)}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span>Datos</span>
      </div>

      {/* Connector 1-2 */}
      <div className={`step-connector ${getConnectorClass(1)}`} />

      {/* Step 2 - Invoice */}
      <div className={`step-pill ${getStepClass(2)}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span>Invoice</span>
      </div>

      {/* Connector 2-3 */}
      <div className={`step-connector ${getConnectorClass(2)}`} />

      {/* Step 3 - Confirmación */}
      <div className={`step-pill ${getStepClass(3)}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>OK</span>
      </div>
    </div>
  );
};

export default StepIndicator;
