import React, { useEffect, useReducer, useState, useCallback } from 'react';
import { getBtcPrice } from '../helpers/getBtcPrice';
import { getInvoice } from '../helpers/getInvoice';
import { getCurencies } from './../helpers/getCurrencies';
import { getQueryParams } from '../utils/base64';
import { paymentReducer, initialState, actionTypes } from '../reducers/paymentReducer';
import StepIndicator from './steps/StepIndicator';
import Step1DataForm from './steps/Step1DataForm';
import Step2QRInvoice from './steps/Step2QRInvoice';
import Step3Confirmation from './steps/Step3Confirmation';
import logo from '../assets/logo512.png';
import './payform.css';

const PayForm = () => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingDeepLink, setIsLoadingDeepLink] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Parsear query params para deep linking
  const queryParams = getQueryParams(window.location.search);
  const queryAmount = parseInt(queryParams.get('amount'));
  const queryMemo = queryParams.get('memo');
  const queryCurrency = queryParams.get('curr');
  const hasDeepLinkParams = !!(queryAmount && queryMemo && queryCurrency);

  // Inicialización: cargar precio BTC y monedas disponibles
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

  // Deep Linking: si hay params en la URL, generar invoice directamente
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

      const invoice = await getInvoice(amountInSats, queryMemo);

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

  // Manejar cambio de moneda
  const handleCurrencyChange = useCallback(
    async (e, data) => {
      e.preventDefault();
      const indx = data.value;
      const curr = data.options[indx].text;

      try {
        const price = await getBtcPrice(curr);
        dispatch({
          type: actionTypes.SET_CURRENCY,
          payload: { currency: curr, btc_price: price },
        });
      } catch (err) {
        console.error('Error changing currency:', err);
      }
    },
    []
  );

  // Avanzar de Step 1 a Step 2: generar invoice
  const handleAdvanceToStep2 = useCallback(async () => {
    if (state.amount > 0 && state.message.trim() !== '') {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      try {
        const invoice = await getInvoice(state.amount, state.message);
        dispatch({ type: actionTypes.GENERATE_INVOICE, payload: invoice });
        setCurrentStep(2);
      } catch (err) {
        console.error('Error generating invoice:', err);
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    }
  }, [state.amount, state.message]);

  // Volver de Step 2 a Step 1
  const handleBackToStep1 = useCallback(() => {
    dispatch({ type: actionTypes.RESET });
    setCurrentStep(1);
  }, []);

  // Callback cuando se confirma el pago
  const handlePaymentConfirmed = useCallback(() => {
    dispatch({ type: actionTypes.CONFIRM_PAYMENT });
    setCurrentStep(3);
  }, []);

  // Reset para volver a Step 1
  const handleReset = useCallback(() => {
    dispatch({ type: actionTypes.RESET });
    setCurrentStep(1);
    if (hasDeepLinkParams) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [hasDeepLinkParams]);

  // Renderizar el step actual
  const renderCurrentStep = () => {
    // Mostrar pantalla de carga para deep links
    if (isLoadingDeepLink) {
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
            dispatch={dispatch}
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

  const userImage = process.env.REACT_APP_API_USER_IMAGE || logo;
  const userName = process.env.REACT_APP_API_USER || 'Lightning Invoice';

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-container profile-logo">
          {!imageError ? (
            <img
              src={userImage}
              alt={userName}
              className="profile-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="profile-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
        </div>
        <h1 className="app-title">{userName}</h1>
        <p className="app-subtitle">
          Pagar con Bitcoin <span className="subtitle-accent">⚡</span> Lightning Network
        </p>
        <div className="header-steps">
          <StepIndicator currentStep={currentStep} />
        </div>
      </header>

      {/* Current Step Content */}
      {renderCurrentStep()}
    </div>
  );
};

export default PayForm;
