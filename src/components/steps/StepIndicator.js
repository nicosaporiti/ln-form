import React from 'react';

const StepIndicator = ({ currentStep }) => {
  const dot1 = currentStep === 1 ? 'active' : 'done';
  const dot2 =
    currentStep === 2 ? 'active' : currentStep === 3 ? 'done' : '';
  const dot3 = currentStep === 3 ? 'active' : '';

  return (
    <div className="step-dots">
      <span className={`step-dot ${dot1}`} />
      <span className={`step-dot ${dot2}`} />
      <span className={`step-dot ${dot3}`} />
    </div>
  );
};

export default StepIndicator;
