// const Buda = require("buda-promise");

export const getInvoice = async (amt, msg) => {
  const url = 'https://buda-ln.herokuapp.com/newinvoice';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amt,
      msg: msg,
    }),
  });

  const data = await res.json();

  return data.invoice

}