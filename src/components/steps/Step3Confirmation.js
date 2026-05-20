import React, { useEffect } from 'react';

const CheckIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Step3Confirmation = ({ state, onReset }) => {
  useEffect(() => {
    const timer = setTimeout(onReset, 7000);
    return () => clearTimeout(timer);
  }, [onReset]);

  const formattedAmount = new Intl.NumberFormat('es-CL').format(state.amount);

  return (
    <div className="success zoom-in">
      <div className="success-icon-wrap">
        <div className="success-icon">
          <CheckIcon />
        </div>
      </div>

      <div className="success-text">
        <h2 className="success-title">Pago Recibido</h2>
        <p className="success-body">{formattedAmount} SATS</p>
      </div>

      <button
        type="button"
        className="button button-primary"
        onClick={onReset}
      >
        Nuevo Pago
      </button>
    </div>
  );
};

export default Step3Confirmation;
