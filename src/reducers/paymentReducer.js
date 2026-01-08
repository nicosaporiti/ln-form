export const initialState = {
  // Form data
  amount: '',
  amount_clp: '',
  message: '',
  currency: 'clp',
  btc_price: 0,
  currencies: [],
  checked: false,

  // Invoice data
  invoice: '',

  // UI state
  copied: false,
  isLoading: false,

  // Payment verification
  paymentConfirmed: false,
  verificationError: null,
};

export const actionTypes = {
  SET_INITIAL_DATA: 'SET_INITIAL_DATA',
  SET_AMOUNT: 'SET_AMOUNT',
  SET_MESSAGE: 'SET_MESSAGE',
  SET_CURRENCY: 'SET_CURRENCY',
  TOGGLE_CURRENCY_MODE: 'TOGGLE_CURRENCY_MODE',
  SET_COPIED: 'SET_COPIED',
  SET_LOADING: 'SET_LOADING',
  GENERATE_INVOICE: 'GENERATE_INVOICE',
  CONFIRM_PAYMENT: 'CONFIRM_PAYMENT',
  SET_VERIFICATION_ERROR: 'SET_VERIFICATION_ERROR',
  SET_DEEP_LINK_DATA: 'SET_DEEP_LINK_DATA',
  RESET: 'RESET',
};

export const paymentReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_INITIAL_DATA:
      return {
        ...state,
        btc_price: action.payload.btc_price,
        currencies: action.payload.currencies,
      };

    case actionTypes.SET_AMOUNT:
      if (state.checked) {
        // Modo moneda local: convertir a SAT
        const amountInSats = parseInt(
          (action.payload / state.btc_price) * 100000000
        );
        return {
          ...state,
          amount: amountInSats,
          amount_clp: parseInt(action.payload),
        };
      }
      // Modo SAT: usar directamente
      return {
        ...state,
        amount: parseInt(action.payload),
        amount_clp: '',
      };

    case actionTypes.SET_MESSAGE:
      return {
        ...state,
        message: action.payload,
      };

    case actionTypes.SET_CURRENCY:
      return {
        ...state,
        currency: action.payload.currency,
        btc_price: action.payload.btc_price,
        amount: '',
        amount_clp: '',
        message: '',
      };

    case actionTypes.TOGGLE_CURRENCY_MODE:
      return {
        ...state,
        checked: !state.checked,
        amount: '',
        amount_clp: '',
        message: '',
      };

    case actionTypes.SET_COPIED:
      return {
        ...state,
        copied: action.payload,
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case actionTypes.GENERATE_INVOICE:
      return {
        ...state,
        invoice: action.payload,
        isLoading: false,
      };

    case actionTypes.CONFIRM_PAYMENT:
      return {
        ...state,
        paymentConfirmed: true,
      };

    case actionTypes.SET_VERIFICATION_ERROR:
      return {
        ...state,
        verificationError: action.payload,
      };

    case actionTypes.SET_DEEP_LINK_DATA:
      return {
        ...state,
        amount: action.payload.amount,
        amount_clp: action.payload.amount_clp,
        message: action.payload.message,
        currency: action.payload.currency,
        invoice: action.payload.invoice,
        btc_price: action.payload.btc_price,
      };

    case actionTypes.RESET:
      return {
        ...initialState,
        // Mantener datos de inicialización
        btc_price: state.btc_price,
        currencies: state.currencies,
        currency: state.currency,
      };

    default:
      return state;
  }
};
