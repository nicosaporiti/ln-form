export const getPaymentStatus = async (invoice) => {
    const url = 'https://buda-ln.herokuapp.com/status';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          invoice: invoice
      }),
    });
  
    const data = await res.json();
  
    return data.status
  
  }