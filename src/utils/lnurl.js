// LNURL (LUD-01) y Lightning Address (LUD-16)

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

const polymod = (values) => {
  let chk = 1;
  values.forEach((v) => {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    GENERATOR.forEach((g, i) => {
      if ((top >> i) & 1) chk ^= g;
    });
  });
  return chk;
};

const hrpExpand = (hrp) => {
  const chars = hrp.split('').map((c) => c.charCodeAt(0));
  return [...chars.map((c) => c >> 5), 0, ...chars.map((c) => c & 31)];
};

const toWords = (bytes) => {
  const words = [];
  let acc = 0;
  let bits = 0;
  bytes.forEach((b) => {
    acc = (acc << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      words.push((acc >> bits) & 31);
    }
  });
  if (bits > 0) words.push((acc << (5 - bits)) & 31);
  return words;
};

// Bech32 sin límite de 90 caracteres (LNURL lo permite)
const bech32Encode = (hrp, words) => {
  const values = [...hrpExpand(hrp), ...words, 0, 0, 0, 0, 0, 0];
  const mod = polymod(values) ^ 1;
  const checksum = [0, 1, 2, 3, 4, 5].map((i) => (mod >> (5 * (5 - i))) & 31);
  return hrp + '1' + [...words, ...checksum].map((w) => CHARSET[w]).join('');
};

export const encodeLnurl = (url) =>
  bech32Encode('lnurl', toWords(Array.from(Buffer.from(url, 'utf8')))).toUpperCase();

export const lightningAddressToUrl = (address) => {
  const [user, domain] = address.split('@');
  return `https://${domain}/.well-known/lnurlp/${user}`;
};

// Tolera comillas pegadas por error en el dashboard del hosting
export const getLightningAddress = () =>
  (process.env.REACT_APP_LIGHTNING_ADDRESS || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .toLowerCase();

// Dominios IDN deben ir en punycode (xn--)
export const isValidLightningAddress = (address) =>
  /^[a-z0-9\-_.]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2,}|xn--[a-z0-9-]+)$/.test(
    address
  );
