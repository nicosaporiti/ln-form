import React, { useEffect, useReducer, useState, useCallback } from 'react';
import { getBtcPrice } from '../helpers/getBtcPrice';
import { getInvoice } from '../helpers/getInvoice';
import { getCurencies } from './../helpers/getCurrencies';
import { getQueryParams } from '../utils/base64';
import {
  paymentReducer,
  initialState,
  actionTypes,
} from '../reducers/paymentReducer';
import StepIndicator from './steps/StepIndicator';
import Step1DataForm from './steps/Step1DataForm';
import Step2QRInvoice from './steps/Step2QRInvoice';
import Step3Confirmation from './steps/Step3Confirmation';
import './payform.css';

const BoltIcon = ({ size = 10 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const DEFAULT_MEMO = 'Pago Lightning';

const getInitials = (name) => {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

const PayForm = () => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingDeepLink, setIsLoadingDeepLink] = useState(false);
  const [imageError, setImageError] = useState(false);

  const queryParams = getQueryParams(window.location.search);
  const queryAmount = parseInt(queryParams.get('amount'));
  const queryMemo = queryParams.get('memo') || '';
  const queryCurrency = queryParams.get('curr');
  const hasDeepLinkParams = !!(queryAmount && queryCurrency);

  useEffect(() => {
    if (!hasDeepLinkParams) {
      Promise.all([getBtcPrice(state.currency), getCurencies()])
        .then(([btcPrice, currencies]) => {
          dispatch({
            type: actionTypes.SET_INITIAL_DATA,
            payload: { btc_price: btcPrice, currencies },
          });
        })
        .catch((err) => {
          console.error('Error initializing app:', err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasDeepLinkParams) {
      setIsLoadingDeepLink(true);
      handleDeepLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeepLink = async () => {
    try {
      const price = await getBtcPrice(queryCurrency);
      const amountInSats =
        queryCurrency === 'sat'
          ? queryAmount
          : parseInt((queryAmount / price) * 100000000);

      const invoice = await getInvoice(amountInSats, queryMemo || DEFAULT_MEMO);

      dispatch({
        type: actionTypes.SET_DEEP_LINK_DATA,
        payload: {
          amount: amountInSats,
          amount_clp: queryAmount,
          message: queryMemo,
          currency: queryCurrency,
          invoice: invoice,
          btc_price: price,
        },
      });

      setIsLoadingDeepLink(false);
      setCurrentStep(2);
    } catch (err) {
      console.error('Deep link error:', err);
      setIsLoadingDeepLink(false);
      const [btcPrice, currencies] = await Promise.all([
        getBtcPrice('clp'),
        getCurencies(),
      ]);
      dispatch({
        type: actionTypes.SET_INITIAL_DATA,
        payload: { btc_price: btcPrice, currencies },
      });
    }
  };

  const handleCurrencyChange = useCallback(async (currencyKey) => {
    try {
      const price = await getBtcPrice(currencyKey);
      dispatch({
        type: actionTypes.SET_CURRENCY,
        payload: { currency: currencyKey, btc_price: price },
      });
    } catch (err) {
      console.error('Error changing currency:', err);
    }
  }, []);

  const handleAdvanceToStep2 = useCallback(async () => {
    if (state.amount > 0) {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      try {
        const invoice = await getInvoice(state.amount, state.message || DEFAULT_MEMO);
        dispatch({ type: actionTypes.GENERATE_INVOICE, payload: invoice });
        setCurrentStep(2);
      } catch (err) {
        console.error('Error generating invoice:', err);
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    }
  }, [state.amount, state.message]);

  const handleBackToStep1 = useCallback(() => {
    dispatch({ type: actionTypes.RESET });
    setCurrentStep(1);
  }, []);

  const handlePaymentConfirmed = useCallback(() => {
    dispatch({ type: actionTypes.CONFIRM_PAYMENT });
    setCurrentStep(3);
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: actionTypes.RESET });
    setCurrentStep(1);
    if (hasDeepLinkParams) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [hasDeepLinkParams]);

  const renderContent = () => {
    if (isLoadingDeepLink) {
      return (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Generando Invoice...</p>
          <p className="loading-subtext">Conectando con Lightning Network</p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <Step1DataForm
            state={state}
            dispatch={dispatch}
            onAdvance={handleAdvanceToStep2}
            onCurrencyChange={handleCurrencyChange}
            isLoading={state.isLoading}
          />
        );
      case 2:
        return (
          <Step2QRInvoice
            state={state}
            onPaymentConfirmed={handlePaymentConfirmed}
            onBack={!hasDeepLinkParams ? handleBackToStep1 : null}
          />
        );
      case 3:
        return <Step3Confirmation state={state} onReset={handleReset} />;
      default:
        return null;
    }
  };

  const userImage = process.env.REACT_APP_API_USER_IMAGE;
  const userName = process.env.REACT_APP_API_USER || 'Lightning Invoice';
  const initials = getInitials(userName);
  const showImage = !!userImage && !imageError;

  return (
    <div className="app-container">
      <div className="app-shell">
        <div className="card">
          {/* Compact Header */}
          <div className="card-header">
            <div className="header-row">
              <div className="avatar-wrap">
                <div className="avatar">
                  {showImage ? (
                    <img
                      src={userImage}
                      alt={userName}
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="avatar-badge">
                  <BoltIcon size={10} />
                </div>
              </div>
              <div className="header-text">
                <h1 className="header-name">{userName}</h1>
                <p className="header-subtitle">Lightning Network</p>
              </div>
              <StepIndicator currentStep={currentStep} />
            </div>
          </div>

          {/* Content */}
          <div className="card-content">{renderContent()}</div>
        </div>

        <p className="app-footer">Pagos seguros con Lightning</p>
      </div>
    </div>
  );
};

export default PayForm;
