export const getBtcPrice = async () => {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=clp';
  const res = await fetch(url);
  const data = await res.json();
  const btcPrice = Number(data.bitcoin.clp);

  return btcPrice;
};
