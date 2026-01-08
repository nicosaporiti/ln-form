import React, { useEffect, useState } from 'react';

const Step3Confirmation = ({ state, onReset }) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReset]);

  return (
    <div className="card">
      {/* Success Icon */}
      <div className="success-icon">
        <div className="success-circle">
          <svg className="success-check" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h2 className="success-title">Pago Confirmado</h2>
      <p className="success-subtitle">El pago ha sido procesado exitosamente</p>

      {/* Success Card */}
      <div className="success-card">
        <div className="success-amount">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          {state.amount.toLocaleString('es-CL')} sats
        </div>

        <div className="success-detail">
          <div className="success-detail-label">Memo</div>
          <div className="success-detail-value">{state.message}</div>
        </div>

        <div className="success-detail">
          <div className="success-detail-label">Estado</div>
          <div className="status-badge">
            <span className="status-dot"></span>
            Pagado
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button type="button" className="btn btn-success" onClick={onReset}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 4v6h-6" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        Nuevo Invoice ({countdown}s)
      </button>
    </div>
  );
};

export default Step3Confirmation;
