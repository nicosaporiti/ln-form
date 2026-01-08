import React, { useCallback } from 'react';
import QRcode from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Swal from 'sweetalert2';
import usePaymentVerification from '../../hooks/usePaymentVerification';

const Step2QRInvoice = ({ state, dispatch, onPaymentConfirmed, onBack }) => {
  const handleCopy = () => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Invoice copiado',
      showConfirmButton: false,
      timer: 2000,
      background: '#1a1d2e',
      color: '#fff',
    });
  };

  const handlePaymentSuccess = useCallback(() => {
    onPaymentConfirmed();
  }, [onPaymentConfirmed]);

  const handleVerificationError = useCallback((error) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: error,
      showConfirmButton: false,
      timer: 5000,
      background: '#1a1d2e',
      color: '#fff',
    });
  }, []);

  usePaymentVerification({
    invoice: state.invoice,
    enabled: !!state.invoice && !state.paymentConfirmed,
    onPaymentConfirmed: handlePaymentSuccess,
    onError: handleVerificationError,
  });

  const truncateInvoice = (invoice) => {
    if (!invoice) return '';
    if (invoice.length <= 30) return invoice;
    return `${invoice.slice(0, 15)}...${invoice.slice(-15)}`;
  };

  if (!state.invoice) {
    return (
      <div className="card loading-card">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Generando Invoice...</p>
          <p className="loading-subtext">Conectando con Lightning Network</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* QR Code */}
      <div className="qr-container">
        <div className="qr-wrapper">
          <QRcode
            value={state.invoice}
            size={140}
            level="M"
            renderAs="svg"
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>
      </div>

      {/* Info Card */}
      <div className="info-card">
        <div className="info-row">
          <span className="info-label">Monto</span>
          <span className="info-value highlight">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            {state.amount.toLocaleString('es-CL')} sats
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Memo</span>
          <span className="info-value">{state.message}</span>
        </div>
      </div>

      {/* Invoice Display */}
      <CopyToClipboard text={state.invoice} onCopy={handleCopy}>
        <div className="invoice-display" style={{ cursor: 'pointer' }}>
          <span className="invoice-text">{truncateInvoice(state.invoice)}</span>
          <button className="copy-btn" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
      </CopyToClipboard>

      {/* Status */}
      <div className="status-message">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        Esperando pago...
      </div>

      {/* Buttons */}
      <div className="btn-group">
        {onBack && (
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Volver
          </button>
        )}
        <a
          href={`lightning:${state.invoice}`}
          className="btn btn-primary"
          style={{ textDecoration: 'none' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Abrir Wallet
        </a>
      </div>
    </div>
  );
};

export default Step2QRInvoice;
