import React from 'react';
import { Segment, Image } from 'semantic-ui-react';
import logo from '../assets/logo512.png'

const Profile = () => {
  return (
    <Segment raised inverted textAlign='center'>
      <h5>PAGAR CON BTC ⚡ LIGHTNING NETWORK A</h5>
      <div>
      <Image src={process.env.REACT_APP_API_USER_IMAGE || logo } circular centered size='tiny'/>
      <span>{process.env.REACT_APP_API_USER || ""}</span>
      </div>
    </Segment>
  );
};

export default Profile;
