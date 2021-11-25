import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Form,
  Button,
  Modal,
  Input,
  Message,
} from 'semantic-ui-react';
import QRcode from 'qrcode.react';
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
    hidden: true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (state.to !== '') {
        getPaymentStatus(state.to).then((data) => {
          if (data) {
            setState({...state, hidden: false });
            return clearInterval(interval);
          }
        });
      }
    }, 5000);
  });

  const onSubmit = (event) => {
    event.preventDefault();
    const a = Number(state.amount);
    const m = state.message;
    getInvoice(a, m).then((data) => {
      setState({ ...state, to: data });
    });
    setState({
      ...state,
      amount: '',
      message: '',
      to: '',
      hidden: true
    });
  };

  console.log(state);

  return (
    <Container>
      <Grid columns={2} divided style={{ marginTop: '5vh' }} stackable>
        <Grid.Row>
          <Grid.Column color="black">
            <Form inverted style={{ margin: '8px' }} onSubmit={onSubmit}>
              <Form.Field>
                <label>SATS A TRANSFERIR</label>
                <input
                  placeholder="valores en SATS"
                  type="number"
                  min={1}
                  onChange={(event) =>
                    setState({ ...state, amount: Number(event.target.value) })
                  }
                  value={state.amount}
                ></input>
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
                <Container textAlign="center">
                <Message hidden={state.hidden} compact color="green">Gracias por su pago</Message>
                </Container>
              </Modal>
            </Form>
          </Grid.Column>
          <Grid.Column
            color="yellow"
            textAlign="center"
            style={{ color: 'black' }}
          >
            <h3>PAGA CON</h3>
            <h1>LIGHTNING NETWORK</h1>
            <p style={{ fontSize: '15px' }}>
              Una red entre pares concebida como sistema de segunda capa para
              Bitcoin que permite hacer micropagos de forma casi instantánea
            </p>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default PayForm;
