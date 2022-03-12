import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Form,
  Button,
  Modal,
  Input,
  Label,
  Header,
  Checkbox,
  Dropdown,
  Divider,
} from "semantic-ui-react";
import Swal from "sweetalert2";
import { getBtcPrice } from "../helpers/getBtcPrice";
import { getInvoice } from "../helpers/getInvoice";
import { getCurencies } from "./../helpers/getCurrencies";
import "./payform.css";
import { getPaymentStatus } from "../helpers/getPaymentStatus";
import { QrModal } from "./QrModal";
import { PaymentLink } from "./PaymentLink";
import { getQueryParams } from "../utils/base64";

const PayForm = () => {
  const [state, setState] = useState({
    amount: "",
    amount_clp: "",
    message: "",
    to: "",
    copied: false,
    btc_price: 0,
    checked: false,
    currencies: [],
    currency: "clp",
    url: "",
  });

  /* Search Params and decode Base64 */
  
  const queryParams = getQueryParams(window.location.search);

  const queryAmount = parseInt(queryParams.get("amount"));
  const queryMemo = queryParams.get("memo");
  const queryCurrency = queryParams.get("curr");

/* End Search Params */

  useEffect(() => {
    Promise.all([getBtcPrice(state.currency), getCurencies()])
      .then((values) => {
        setState({ ...state, btc_price: values[0], currencies: values[1] });
      })
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (queryAmount && queryMemo && queryCurrency) {
      getBtcPrice(queryCurrency)
        .then((data) => {
          return queryCurrency === "sat"
            ? queryAmount
            : parseInt((queryAmount / data) * 100000000);
        })
        .then((amt) => {
          getInvoice(amt, queryMemo).then((invoice) => {
            setState({
              ...state,
              to: invoice,
              amount: amt,
              amount_clp: queryAmount,
              message: queryMemo,
              currency: queryCurrency,
            });
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (state.to !== "") {
        getPaymentStatus(state.to)
          .then((data) => {
            if (data) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Transferencia confirmada!",
                text: `Pago por ${state.amount} sat procesado`,
                showConfirmButton: false,
                timer: 6000,
              });
              return clearInterval(interval);
            }
          })
          .catch((err) => {
            Swal.fire({
              position: "top-end",
              icon: "error",
              title: err,
              showConfirmButton: false,
              timer: 5000,
            });
          });
      }
    }, 5000);
  });

  const handleChange = (event) => {
    event.preventDefault();
    const value = event.target.value;
    if (!isNaN(value) && !state.checked)
      setState({
        ...state,
        amount: Number.parseInt(value),
      });
    else {
      setState({
        ...state,
        amount: Number.parseInt((value / state.btc_price) * 100000000),
        amount_clp: Number.parseInt(value),
      });
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const a = Number(state.amount);
    const m = state.message;
    getInvoice(a, m)
      .then((data) => {
        setState({ ...state, to: data });
      })
      .catch((err) => {
        console.log(err);
      });
    setState({
      ...state,
      amount: "",
      message: "",
      to: "",
      hidden: true,
    });
  };

  const handleCheck = () => {
    if (state.checked) {
      setState({
        ...state,
        amount: "",
        message: "",
        amount_clp: "",
        checked: false,
      });
    } else {
      setState({
        ...state,
        amount: "",
        message: "",
        amount_clp: "",
        checked: true,
      });
    }
  };

  const handleCurrency = (e, data) => {
    e.preventDefault();
    const indx = data.value;
    const curr = data.options[indx].text;

    getBtcPrice(curr)
      .then((price) =>
        setState({
          ...state,
          btc_price: price,
          currency: curr,
          amount: "",
          message: "",
          amount_clp: "",
        })
      )
      .catch((err) => console.log(err));
  };

  const sats_to_clp = Math.ceil(
    (state.btc_price / 100000000) * state.amount
  ).toLocaleString("es-CL");

  return queryAmount && queryMemo ? (
    <QrModal data={state} handleCopy={setState} />
  ) : (
    <Container>
      <Grid
        textAlign="center"
        style={{ height: "100vh" }}
        verticalAlign="middle"
        stackable
      >
        <Grid.Column color="black" style={{ maxWidth: 450 }}>
          <Header textAlign="center" style={{ color: "white" }}>
            <h3>ESTAS PAGANDO CON BITCOIN</h3>
            <h3>LIGHTNING NETWORK</h3>
            <p>⚡</p>
            <p style={{ color: "#fbbd08" }}>Selecciona una divisa</p>
            <Divider horizontal inverted>
              <Dropdown
                options={state.currencies}
                placeholder="Moneda"
                scrolling
                search
                style={{ color: "white" }}
                onChange={handleCurrency}
              />
            </Divider>
            <h5 style={{ fontSize: "15px" }}>
              {state.btc_price === 0
                ? ""
                : `Precio actual Bitcoin: ${state.currency.toUpperCase()} ${state.btc_price.toLocaleString(
                    "es-CL"
                  )}`}
            </h5>
            <p style={{ fontSize: "12px", marginTop: "15px" }}>
              <a
                href="https://www.coingecko.com/"
                target="_blank"
                rel="noreferrer"
              >
                Fuente CoinGecko
              </a>
            </p>
            <hr></hr>
          </Header>
          <Form inverted style={{ margin: "8px" }} onSubmit={onSubmit}>
            <Header textAlign="right" style={{ marginTop: "25px" }}>
              <Checkbox
                label={`Transferir en ${state.currency.toLocaleUpperCase()}`}
                onChange={handleCheck}
              />
            </Header>
            <Form.Field>
              <label>
                MONTO A TRANSFERIR{" "}
                <span style={{ color: "grey", marginLeft: "10px" }}>
                  {sats_to_clp === "0" || isNaN(state.amount)
                    ? ""
                    : `Valor en ${state.currency} ${sats_to_clp}`}
                </span>
              </label>
              <Input
                labelPosition="right"
                placeholder={
                  state.checked
                    ? `Ingresar valores en ${state.currency}`
                    : "Ingresar valores en SAT"
                }
                type="number"
                min={1}
                onChange={handleChange}
                value={state.checked ? state.amount_clp : state.amount}
              >
                <input />
                <Label>
                  {state.amount === "" || isNaN(state.amount)
                    ? "SAT 0"
                    : `SAT ${state.amount.toLocaleString("es-CL")}`}
                </Label>
              </Input>
            </Form.Field>
            <Form.Field>
              <label>MENSAJE</label>
              <input
                placeholder="ingresar un comentario"
                onChange={(event) =>
                  setState({ ...state, message: event.target.value })
                }
                value={state.message}
              ></input>
            </Form.Field>

            <Modal
              basic
              centered={false}
              onClose={() => window.location.reload()}
              trigger={
                <Button
                  type="submit"
                  animated="vertical"
                  color="yellow"
                  fluid
                  style={{ color: "black" }}
                  disabled={state.amount === 0 || state.message === ""}
                >
                  <Button.Content visible>ENVIAR</Button.Content>
                  <Button.Content hidden>⚡</Button.Content>
                </Button>
              }
              open={state.to !== ""}
            >
              <Modal.Content>
                <QrModal data={state} handleCopy={setState} />
              </Modal.Content>

              <Container textAlign="center"></Container>
            </Modal>
          </Form>
          <PaymentLink data={state} handleCopy={setState} />
        </Grid.Column>
      </Grid>
    </Container>
  );
};

export default PayForm;