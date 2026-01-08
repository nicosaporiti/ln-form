import React, { useState, useRef, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Swal from 'sweetalert2';
import { encode } from '../../utils/base64';
import { actionTypes } from '../../reducers/paymentReducer';

const CURRENCIES = [
  { key: 'clp', label: 'CLP' },
  { key: 'usd', label: 'USD' },
  { key: 'ars', label: 'ARS' },
  { key: 'brl', label: 'BRL' },
  { key: 'mxn', label: 'MXN' },
];

const Step1DataForm = ({
  state,
  dispatch,
  onAdvance,
  onCurrencyChange,
  isLoading,
}) => {
  const [memo, setMemo] = useState(state.message || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const maxChars = 200;

  // Close dropdown when clicking outside
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
    setMemo(value);
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
    if (currencyKey !== state.currency && onCurrencyChange) {
      const options = CURRENCIES.map((c, i) => ({
        key: i,
        value: i,
        text: c.key,
      }));
      const targetIndex = options.findIndex(o => o.text === currencyKey);
      onCurrencyChange(
        { preventDefault: () => {} },
        { value: targetIndex, options }
      );
    }
  };

  const handleToggleInputMode = () => {
    dispatch({ type: actionTypes.TOGGLE_CURRENCY_MODE });
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
      background: '#1a1d2e',
      color: '#fff',
    });
  };

  // state.checked = true significa ingresar en moneda fiat
  // state.checked = false significa ingresar en SATS
  const isInFiatMode = state.checked;
  const isFormValid =
    state.amount > 0 && state.message.trim() !== '' && state.btc_price > 0;

  const displayAmount = isInFiatMode ? state.amount_clp || '' : state.amount || '';

  // Generar URL de pago
  const localUrl = window.location.origin;
  const paymentUrl = !isInFiatMode
    ? `${localUrl}/?${encode(`amount=${state.amount}&memo=${state.message}&curr=sat`)}`
    : `${localUrl}/?${encode(`amount=${state.amount_clp}&memo=${state.message}&curr=${state.currency}`)}`;

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        {/* Currency Selector */}
        <div className="form-group">
          <div className="currency-dropdown-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className="currency-dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span>{state.currency.toUpperCase()}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="currency-dropdown-menu">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.key}
                    type="button"
                    className={`currency-dropdown-item ${state.currency === curr.key ? 'active' : ''}`}
                    onClick={() => handleCurrencySelect(curr.key)}
                  >
                    {curr.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {state.btc_price > 0 && (
            <div className="btc-price">
              1 BTC = {state.currency.toUpperCase()} {state.btc_price.toLocaleString('es-CL')}
            </div>
          )}
        </div>

        {/* Memo */}
        <div className="form-group">
          <label className="form-label">Memo</label>
          <input
            type="text"
            className="form-input"
            placeholder="Descripcion del pago..."
            value={memo}
            onChange={handleMemoChange}
            maxLength={maxChars}
          />
        </div>

        {/* Amount */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label">Monto</label>
            {state.amount > 0 && isInFiatMode && (
              <span className="conversion-hint">{state.amount.toLocaleString('es-CL')} SATS</span>
            )}
            {state.amount > 0 && !isInFiatMode && state.btc_price > 0 && (
              <span className="conversion-hint">{state.currency.toUpperCase()} {Math.ceil((state.btc_price / 100000000) * state.amount).toLocaleString('es-CL')}</span>
            )}
          </div>

          {/* Input Mode Toggle */}
          <div className="input-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${!isInFiatMode ? 'active' : ''}`}
              onClick={() => isInFiatMode && handleToggleInputMode()}
            >
              SATS
            </button>
            <button
              type="button"
              className={`mode-btn ${isInFiatMode ? 'active' : ''}`}
              onClick={() => !isInFiatMode && handleToggleInputMode()}
            >
              {state.currency.toUpperCase()}
            </button>
          </div>

          <div className="form-input-wrapper">
            <input
              type="number"
              className="form-input"
              placeholder="0"
              value={displayAmount}
              onChange={handleAmountChange}
              min="1"
              style={{ paddingRight: '80px' }}
            />
            <div className="currency-toggle" style={{ cursor: 'default' }}>
              {!isInFiatMode ? 'SATS' : state.currency.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? 'Generando...' : 'Generar Invoice'}
          {!isLoading && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>

        {/* Payment Link */}
        <div className="payment-link-section">
          <CopyToClipboard text={paymentUrl} onCopy={handleCopyLink}>
            <button
              type="button"
              className="btn btn-link"
              disabled={!isFormValid}
              style={{ opacity: isFormValid ? 1 : 0.4 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Copiar link de pago
            </button>
          </CopyToClipboard>
        </div>
      </form>
    </div>
  );
};

export default Step1DataForm;
