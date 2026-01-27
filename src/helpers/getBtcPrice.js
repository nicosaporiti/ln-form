export const getBtcPrice = async (currency) => {
  const url = `https://api.yadio.io/convert/1/BTC/${currency.toUpperCase()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return Math.round(data.rate);
  } catch (error) {
    console.warn('Error fetching BTC price:', error.message);
    return 0;
  }
};
