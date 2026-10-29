import {
  encodeLnurl,
  getLightningAddress,
  lightningAddressToUrl,
  isValidLightningAddress,
} from './lnurl';

describe('lnurl', () => {
  it('encodes the LUD-01 test vector', () => {
    const url =
      'https://service.com/api?q=3fc3645b439ce8e7f2553a69e5267081d96dcd340693afabe04be7b0ccd178df';
    expect(encodeLnurl(url)).toBe(
      'LNURL1DP68GURN8GHJ7UM9WFMXJCM99E3K7MF0V9CXJ0M385EKVCENXC6R2C35XVUKXEFCV5MKVV34X5EKZD3EV56NYD3HXQURZEPEXEJXXEPNXSCRVWFNV9NXZCN9XQ6XYEFHVGCXXCMYXYMNSERXFQ5FNS'
    );
  });

  it('encodes the production lightning address', () => {
    expect(encodeLnurl(lightningAddressToUrl('nicolas@saporiti.cl'))).toBe(
      'LNURL1DP68GURN8GHJ7UMPWPHHY6T5DYHXXMP09EMK2MRV944KUMMHDCHKCMN4WFK8QTMWD93K7MRPWVEVKH4T'
    );
  });

  it('builds the LUD-16 well-known url', () => {
    expect(lightningAddressToUrl('pay@budaln.fly.dev')).toBe(
      'https://budaln.fly.dev/.well-known/lnurlp/pay'
    );
  });

  it('validates lightning addresses', () => {
    expect(isValidLightningAddress('pay@budaln.fly.dev')).toBe(true);
    expect(isValidLightningAddress('nicolás saporiti')).toBe(false);
    expect(isValidLightningAddress('')).toBe(false);
    expect(isValidLightningAddress('a@b@c.co')).toBe(false);
    expect(isValidLightningAddress('a@-.co')).toBe(false);
    expect(isValidLightningAddress('a@b..co')).toBe(false);
    expect(isValidLightningAddress('pay@sub.example.xn--p1ai')).toBe(true);
  });

  it('normalizes the env value', () => {
    const original = process.env.REACT_APP_LIGHTNING_ADDRESS;
    process.env.REACT_APP_LIGHTNING_ADDRESS = "  'Nicolas@Saporiti.cl' ";
    expect(getLightningAddress()).toBe('nicolas@saporiti.cl');
    process.env.REACT_APP_LIGHTNING_ADDRESS = original;
  });
});
