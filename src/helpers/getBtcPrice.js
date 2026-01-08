export const getBtcPrice = async (v) => {
  const currency = v;
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const btcPrice = Number(data.bitcoin[currency]);
    return btcPrice;
  } catch (error) {
    console.warn('Error fetching BTC price:', error.message);
    return 0;
  }
};
