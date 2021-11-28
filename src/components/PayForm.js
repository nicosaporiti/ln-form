import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Form,
  Button,
  Modal,
  Input,
  Label,
} from 'semantic-ui-react';
import Swal from 'sweetalert2';
import QRcode from 'qrcode.react';
import { getBtcPrice } from '../helpers/getBtcPrice';
import { getInvoice } from '../helpers/getInvoice';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './payform.css';
import { getPaymentStatus } from '../helpers/getPaymentStatus';

const PayForm = () => {
  const [state, setState] = useState({
    amount: '',
    message: '',
    to: '',
    copied: false,
    btc_price: 0,
  });

  useEffect(() => {
    getBtcPrice()
      .then((data) => setState({ ...state, btc_price: data }))
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (state.to !== '') {
        getPaymentStatus(state.to)
          .then((data) => {
            if (data) {
              Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Transferencia confirmada!',
                text: `Pago por ${state.amount} sat procesado`,
                showConfirmButton: false,
                timer: 6000,
              });
              return clearInterval(interval);
            }
          })
          .catch((err) => {
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: err,
              showConfirmButton: false,
              timer: 5000,
            });
          });
      }
    }, 5000);
  });

  const handleChange = (event) =>{
  event.preventDefault();
  const value = event.target.value;
  if(!isNaN(value))
  setState({
    ...state,
    amount: Number.parseInt(value),
  })}

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
      amount: '',
      message: '',
      to: '',
      hidden: true,
    });
  };

  const sats_to_clp = (
    (state.btc_price / 100000000) *
    state.amount
  ).toLocaleString('es-CL');

  return (
    <Container>
      <Grid columns={2} divided style={{ marginTop: '5vh' }} stackable>
        <Grid.Row>
          <Grid.Column color="black">
            <Form inverted style={{ margin: '8px' }} onSubmit={onSubmit}>
              <Form.Field>
                <label>
                  MONTO A TRANSFERIR{' '}
                  <span style={{ color: 'grey', marginLeft: '10px' }}>
                    {sats_to_clp === '0' || isNaN(state.amount)
                      ? ''
                      : `Aprox CLP ${sats_to_clp}`}
                  </span>
                </label>
                <Input
                  labelPosition="right"
                  placeholder="valores en SAT"
                  type="number"
                  min={1}
                  onChange={handleChange}
                  value={state.amount}
                >
                  <input />
                  <Label>
                    {state.amount === '' || isNaN(state.amount)
                      ? 'SAT 0'
                      : `SAT ${state.amount.toLocaleString('es-CL')}`}
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
                    floated="right"
                    style={{ color: 'black' }}
                    disabled={state.amount === 0 || state.message === ''}
                  >
                    <Button.Content visible>ENVIAR</Button.Content>
                    <Button.Content hidden>⚡</Button.Content>
                  </Button>
                }
              >
                <Modal.Content>
                  <Container textAlign="center">
                    <div style={{ marginBottom: '10px' }}>
                      ESCANEA EL CODIGO CON TU WALLET
                    </div>
                    {state.to === '' ? (
                      ''
                    ) : (
                      <QRcode value={state.to} size={250} renderAs="svg" />
                    )}
                    <Container style={{ marginTop: '10px' }}>
                      <CopyToClipboard
                        text={state.to}
                        onCopy={() => setState({ ...state, copied: true })}
                      >
                        <Input
                          icon="copy"
                          value={state.to === '' ? '' : state.to}
                          focus
                          className="input-lna"
                        />
                      </CopyToClipboard>
                    </Container>
                    {state.copied ? 'Dirección copiada en portapapeles' : ''}
                  </Container>
                </Modal.Content>
                <Container textAlign="center"></Container>
              </Modal>
            </Form>
          </Grid.Column>
          <Grid.Column
            color="yellow"
            textAlign="center"
            style={{ color: 'black' }}
          >
            <h3>ESTAS PAGANDO CON</h3>
            <h1>LIGHTNING NETWORK</h1>
            <h5 style={{ fontSize: '15px' }}>
              {state.btc_price === 0
                ? ''
                : `Precio actual Bitcoin: CLP ${state.btc_price.toLocaleString(
                    'es-CL'
                  )}`}
            </h5>
            <p>
              Fuente{' '}
              <a
                href="https://www.coingecko.com/"
                target="_blank"
                rel="noreferrer"
              >
                CoinGecko
              </a>
            </p>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default PayForm;
