import React, { useEffect, useRef, useState } from 'react';
import QRcode from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Swal from 'sweetalert2';
import { encodeLnurl, lightningAddressToUrl } from '../utils/lnurl';

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

const LnurlView = ({ address, onBack }) => {
  const [copiedKey, setCopiedKey] = useState(null);
  const copiedTimeoutRef = useRef(null);
  const lnurl = encodeLnurl(lightningAddressToUrl(address));

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = (key, title) => {
    setCopiedKey(key);
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = setTimeout(() => setCopiedKey(null), 2000);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title,
      showConfirmButton: false,
      timer: 2000,
      background: '#181a20',
      color: '#fff',
    });
  };

  return (
    <div className="stack fade-in">
      {/* QR */}
      <div className="qr-wrap">
        <div
          className="qr-frame"
          role="img"
          aria-label={`Código QR LNURL de ${address}`}
        >
          <QRcode
            value={lnurl}
            size={160}
            level="M"
            renderAs="svg"
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>
      </div>

      {/* Lightning Address */}
      <div className="invoice-summary">
        <p className="lnurl-address">{address}</p>
        <p className="invoice-memo">Monto libre desde cualquier wallet</p>
      </div>

      {/* LNURL string */}
      <div className="invoice-string">
        <p>{lnurl}</p>
      </div>

      {/* Actions */}
      <div className="invoice-actions">
        <CopyToClipboard
          text={address}
          onCopy={() => handleCopy('address', 'Lightning Address copiada')}
        >
          <button type="button" className="button button-primary">
            <CopyIcon />
            {copiedKey === 'address' ? 'Copiada' : 'Copiar Address'}
          </button>
        </CopyToClipboard>
        <CopyToClipboard
          text={lnurl}
          onCopy={() => handleCopy('lnurl', 'LNURL copiado')}
        >
          <button type="button" className="button button-secondary">
            <CopyIcon />
            {copiedKey === 'lnurl' ? 'Copiado' : 'Copiar LNURL'}
          </button>
        </CopyToClipboard>
      </div>

      <a href={`lightning:${lnurl}`} className="button button-secondary">
        <ZapIcon />
        Abrir Wallet
      </a>

      <button type="button" className="button button-ghost" onClick={onBack}>
        Volver
      </button>
    </div>
  );
};

export default LnurlView;
