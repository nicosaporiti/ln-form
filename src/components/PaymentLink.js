import React from 'react';
import { Button } from 'semantic-ui-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Swal from 'sweetalert2';
import { encode } from '../utils/base64';
import { actionTypes } from '../reducers/paymentReducer';

export const PaymentLink = ({ data, handleCopy }) => {
  const state = data;
  const dispatch = handleCopy;
  const { amount, message, currency, amount_clp, checked } = state;
  const localUrl = window.location.origin;

  const paymentUrl = !checked
    ? localUrl + '/?' + encode(`amount=${amount}&memo=${message}&curr=sat`)
    : localUrl +
      '/?' +
      encode(`amount=${amount_clp}&memo=${message}&curr=${currency}`);

  const handleCopyLink = () => {
    // Soportar tanto dispatch (nuevo) como setState (compatibilidad)
    if (typeof dispatch === 'function') {
      if (dispatch.length === 1) {
        // Es un dispatch de useReducer
        dispatch({ type: actionTypes.SET_COPIED, payload: true });
      } else {
        // Es un setState legacy
        dispatch({ ...state, copied: true });
      }
    }

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Link de pago copiado al portapapeles',
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const isDisabled = !amount || amount === 0 || !message || message === '';

  return (
    <>
      <hr></hr>
      <CopyToClipboard text={paymentUrl} onCopy={handleCopyLink}>
        <Button
          color="blue"
          floated="right"
          style={{ marginTop: '15px', marginRight: '10px' }}
          disabled={isDisabled}
        >
          Copiar link de pago
        </Button>
      </CopyToClipboard>
    </>
  );
};
