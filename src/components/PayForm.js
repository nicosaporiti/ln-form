import React, { useEffect, useState } from 'react';
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
} from 'semantic-ui-react';
import Swal from 'sweetalert2';
import { getBtcPrice } from '../helpers/getBtcPrice';
import { getInvoice } from '../helpers/getInvoice';
import './payform.css';
import { getPaymentStatus } from '../helpers/getPaymentStatus';
import { QrModal } from './QrModal';

const PayForm = () => {
  const [state, setState] = useState({
    amount: '',
    amount_clp: '',
    message: '',
    to: '',
    copied: false,
    btc_price: 0,
    checked: false,
  });

  const queryParams = new URLSearchParams(window.location.search);

  const queryAmount = parseInt(queryParams.get('amount'));
  const queryMemo = queryParams.get('memo');

  useEffect(() => {
    getBtcPrice()
      .then((data) =>
        setState({
          ...state,
          btc_price: data
        })
      )
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.btc_price]);

  useEffect(() => {
    if(queryAmount && queryMemo){
      getInvoice(queryAmount, queryMemo)
      .then((data) => {
        setState({ ...state, to: data });
      })
      .catch((err) => {
        console.log(err);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

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
      amount: '',
      message: '',
      to: '',
      hidden: true,
    });
  };

  const handleCheck = () => {
    if (state.checked) {
      setState({
        ...state,
        amount: '',
        message: '',
        amount_clp: '',
        checked: false,
      });
    } else {
      setState({
        ...state,
        amount: '',
        message: '',
        amount_clp: '',
        checked: true,
      });
    }
  };

  const sats_to_clp = Math.ceil(
    (state.btc_price / 100000000) * state.amount
  ).toLocaleString('es-CL');

  return queryAmount && queryMemo ? (
    <QrModal data={state} handleCopy={setState}/>
  ) : (
    <Container>
      <Grid
        textAlign="center"
        style={{ height: '100vh' }}
        verticalAlign="middle"
        stackable
      >
        <Grid.Column color="black" style={{ maxWidth: 450 }}>
          <Header textAlign="center" style={{ color: 'white' }}>
            <h3>ESTAS PAGANDO A</h3>
            <p style={{ color: 'grey' }}>Nicolás Saporiti</p>
            <h3>CON LIGHTNING NETWORK</h3>
            <h5 style={{ fontSize: '15px' }}>
              {state.btc_price === 0
                ? ''
                : `Precio actual Bitcoin: CLP ${state.btc_price.toLocaleString(
                    'es-CL'
                  )}`}
            </h5>
            <p style={{ fontSize: '12px' }}>
              <a
                href="https://www.coingecko.com/"
                target="_blank"
                rel="noreferrer"
              >
                Fuente CoinGecko
              </a>
            </p>
          </Header>
          <Form inverted style={{ margin: '8px' }} onSubmit={onSubmit}>
            <Header textAlign="right" style={{ marginTop: '25px' }}>
              <Checkbox label="Valores en CLP" onChange={handleCheck} />
            </Header>
            <Form.Field>
              <label>
                MONTO A TRANSFERIR{' '}
                <span style={{ color: 'grey', marginLeft: '10px' }}>
                  {sats_to_clp === '0' || isNaN(state.amount)
                    ? ''
                    : `Valor en CLP ${sats_to_clp}`}
                </span>
              </label>
              <Input
                labelPosition="right"
                placeholder={
                  state.checked
                    ? 'Ingresar valores en CLP'
                    : 'Ingresar valores en SAT'
                }
                type="number"
                min={1}
                onChange={handleChange}
                value={state.checked ? state.amount_clp : state.amount}
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
                  fluid
                  style={{ color: 'black' }}
                  disabled={state.amount === 0 || state.message === ''}
                >
                  <Button.Content visible>ENVIAR</Button.Content>
                  <Button.Content hidden>⚡</Button.Content>
                </Button>
              }
            >
              <Modal.Content>
                <QrModal data={state} handleCopy={setState}/>
              </Modal.Content>

              <Container textAlign="center"></Container>
            </Modal>
          </Form>
        </Grid.Column>
      </Grid>
    </Container>
  );
};

export default PayForm;
