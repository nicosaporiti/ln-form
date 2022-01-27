export const getBtcPrice = async (v) => {

  const currency = v;

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency}`;
  const res = await fetch(url);
  const data = await res.json();
  const btcPrice = Number(data.bitcoin[currency]);

  return btcPrice;
};
