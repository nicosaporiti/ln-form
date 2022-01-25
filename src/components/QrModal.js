import React from 'react';
import {Container, Input, Button} from 'semantic-ui-react';
import QRcode from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export const QrModal = ({data, handleCopy}) => {
    const state = data;
    const setState = handleCopy;

  return (
    <Container textAlign="center">
    <div style={{ margin: '10% 0% 5%', color: 'white' }}>
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
    <div>
      <Button
        href={'lightning:' + state.to}
        style={{ marginTop: '25px', color: 'black' }}
        color="yellow"
        content="ABRIR WALLET"
        icon="lightning"
        labelPosition="left"
      />
    </div>
  </Container>
  );
};
