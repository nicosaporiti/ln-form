import React, { useState, useRef, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Swal from 'sweetalert2';
import { encode } from '../../utils/base64';
import { actionTypes } from '../../reducers/paymentReducer';

const FIAT_CURRENCIES = [
  { key: 'clp', label: 'CLP' },
  { key: 'usd', label: 'USD' },
  { key: 'ars', label: 'ARS' },
  { key: 'brl', label: 'BRL' },
  { key: 'mxn', label: 'MXN' },
];

const ChevronDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ArrowRightIcon = () => (
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
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const LinkIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const Step1DataForm = ({
  state,
  dispatch,
  onAdvance,
  onCurrencyChange,
  isLoading,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const maxChars = 200;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMemoChange = (e) => {
    const value = e.target.value.slice(0, maxChars);
    dispatch({ type: actionTypes.SET_MESSAGE, payload: value });
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) {
      dispatch({ type: actionTypes.SET_AMOUNT, payload: value });
    }
  };

  const handleCurrencySelect = (currencyKey) => {
    setDropdownOpen(false);
    if (currencyKey !== state.currency) {
      onCurrencyChange(currencyKey);
    }
  };

  const handleToggleInputMode = (mode) => {
    const wantFiat = mode === 'fiat';
    if (state.checked !== wantFiat) {
      dispatch({ type: actionTypes.TOGGLE_CURRENCY_MODE });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdvance();
  };

  const handleCopyLink = () => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Link de pago copiado',
      showConfirmButton: false,
      timer: 2000,
      background: '#181a20',
      color: '#fff',
    });
  };

  const isInFiatMode = state.checked;
  const isFormValid = state.amount > 0 && state.btc_price > 0;

  const displayAmount = isInFiatMode
    ? state.amount_clp || ''
    : state.amount || '';

  const localUrl = window.location.origin;
  const paymentUrl = !isInFiatMode
    ? `${localUrl}/?${encode(`amount=${state.amount}&memo=${state.message}&curr=sat`)}`
    : `${localUrl}/?${encode(`amount=${state.amount_clp}&memo=${state.message}&curr=${state.currency}`)}`;

  const upperCurrency = state.currency.toUpperCase();
  const formatNumber = (num) =>
    new Intl.NumberFormat('es-CL').format(Math.round(num));

  const submitClass =
    isFormValid && !isLoading ? 'button button-primary' : 'button button-disabled';
  const copyClass = isFormValid
    ? 'button button-ghost'
    : 'button button-ghost-disabled';

  return (
    <form onSubmit={handleSubmit} className="stack fade-in">
      {/* Currency + Rate inline */}
      <div className="rate-row">
        <div className="currency-trigger-wrap" ref={dropdownRef}>
          <button
            type="button"
            className="currency-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {upperCurrency}
            <ChevronDownIcon />
          </button>
          {dropdownOpen && (
            <div className="currency-menu">
              {FIAT_CURRENCIES.map((curr) => (
                <button
                  key={curr.key}
                  type="button"
                  className={
                    state.currency === curr.key
                      ? 'currency-menu-item active'
                      : 'currency-menu-item'
                  }
                  onClick={() => handleCurrencySelect(curr.key)}
                >
                  {curr.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {state.btc_price > 0 && (
          <span className="rate-value">
            1 BTC = {formatNumber(state.btc_price)} {upperCurrency}
          </span>
        )}
      </div>

      {/* Memo */}
      <input
        type="text"
        className="soft-input"
        placeholder="Memo (opcional)"
        aria-label="Memo"
        value={state.message}
        onChange={handleMemoChange}
        maxLength={maxChars}
      />

      {/* Amount */}
      <div className="stack-sm">
        <div className="amount-toggle">
          <button
            type="button"
            className={
              !isInFiatMode ? 'amount-toggle-btn active' : 'amount-toggle-btn'
            }
            onClick={() => handleToggleInputMode('sats')}
          >
            SATS
          </button>
          <button
            type="button"
            className={
              isInFiatMode ? 'amount-toggle-btn active' : 'amount-toggle-btn'
            }
            onClick={() => handleToggleInputMode('fiat')}
          >
            {upperCurrency}
          </button>
        </div>

        <div className="amount-input-wrap">
          <input
            type="number"
            className="amount-input"
            placeholder="0"
            aria-label={`Monto en ${isInFiatMode ? upperCurrency : 'SATS'}`}
            value={displayAmount}
            onChange={handleAmountChange}
            min="1"
          />
          <span className="amount-suffix">
            {isInFiatMode ? upperCurrency : 'SATS'}
          </span>
        </div>

        <p className="amount-conversion">
          {state.amount > 0
            ? isInFiatMode
              ? `≈ ${formatNumber(state.amount)} SATS`
              : `≈ ${formatNumber(
                  (state.btc_price / 100000000) * state.amount
                )} ${upperCurrency}`
            : ' '}
        </p>
      </div>

      {/* Actions */}
      <div className="actions">
        <button
          type="submit"
          className={submitClass}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? 'Generando...' : 'Generar Invoice'}
          {!isLoading && <ArrowRightIcon />}
        </button>

        <CopyToClipboard text={paymentUrl} onCopy={handleCopyLink}>
          <button type="button" className={copyClass} disabled={!isFormValid}>
            <LinkIcon />
            Copiar link
          </button>
        </CopyToClipboard>
      </div>
    </form>
  );
};

export default Step1DataForm;
