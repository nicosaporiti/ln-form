import React from "react";
import { Button } from "semantic-ui-react";
import { CopyToClipboard } from "react-copy-to-clipboard";

export const PaymentLink = ({ data, handleCopy }) => {
  const state = data;
  const setState = handleCopy;
  const { amount, message, currency, amount_clp, checked } = state;
  const localUrl = window.location.origin;

  return (
    <>
      <hr></hr>
      <CopyToClipboard
        text={
          !checked
            ? `${localUrl}/?amount=${amount}&memo=${message}&curr=sat`
            : `${localUrl}/?amount=${amount_clp}&memo=${message}&curr=${currency}`
        }
        onCopy={() => setState({ ...state, copied: true })}
      >
        <Button
          color="blue"
          floated="right"
          style={{ marginTop: "15px", marginRight: "10px" }}
          disabled={state.amount === 0 || state.message === ""}
        >
          Copiar link de pago
        </Button>
      </CopyToClipboard>
    </>
  );
};
