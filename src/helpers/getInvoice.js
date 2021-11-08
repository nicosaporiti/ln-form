const Buda = require("buda-promise");

export const getInvoice = async (amt, msg) => {
  const api_key = process.env.REACT_APP_API_KEY;
  const api_secret = process.env.REACT_APP_API_SECRET;
  const privateBuda = new Buda(api_key, api_secret);

  const invoice = await privateBuda.lightning_network_invoices(amt, "BTC", msg, false);

  return invoice.invoice.encoded_payment_request;

}