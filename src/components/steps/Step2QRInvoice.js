import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRcode from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Swal from 'sweetalert2';
import usePaymentVerification from '../../hooks/usePaymentVerification';

const CopyIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
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

const ZapIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const Step2QRInvoice = ({ state, onPaymentConfirmed, onBack }) => {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = () => {
    setCopied(true);
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Invoice copiado',
      showConfirmButton: false,
      timer: 2000,
      background: '#181a20',
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
      background: '#181a20',
      color: '#fff',
    });
  }, []);

  usePaymentVerification({
    invoice: state.invoice,
    enabled: !!state.invoice && !state.paymentConfirmed,
    onPaymentConfirmed: handlePaymentSuccess,
    onError: handleVerificationError,
  });

  if (!state.invoice) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Generando Invoice...</p>
        <p className="loading-subtext">Conectando con Lightning Network</p>
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat('es-CL').format(state.amount);

  return (
    <div className="stack fade-in">
      {/* QR */}
      <div className="qr-wrap">
        <div className="qr-frame">
          <QRcode
            value={state.invoice}
            size={160}
            level="M"
            renderAs="svg"
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>
      </div>

      {/* Amount + Memo */}
      <div className="invoice-summary">
        <p className="invoice-amount">
          {formattedAmount} <span className="invoice-amount-unit">SATS</span>
        </p>
        {state.message && <p className="invoice-memo">{state.message}</p>}
      </div>

      {/* Invoice string */}
      <div className="invoice-string">
        <p>{state.invoice}</p>
      </div>

      {/* Actions side by side */}
      <div className="invoice-actions">
        <CopyToClipboard text={state.invoice} onCopy={handleCopy}>
          <button type="button" className="button button-primary">
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </CopyToClipboard>
        <a
          href={`lightning:${state.invoice}`}
          className="button button-secondary"
        >
          <ZapIcon />
          Wallet
        </a>
      </div>

      {/* Waiting */}
      <div className="waiting-row">
        <span className="waiting-dot" />
        <p className="waiting-text">Esperando pago...</p>
      </div>

      {/* Back / Cancel */}
      {onBack && (
        <button type="button" className="button button-ghost" onClick={onBack}>
          Cancelar
        </button>
      )}
    </div>
  );
};

export default Step2QRInvoice;
