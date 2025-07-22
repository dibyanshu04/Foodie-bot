const axios = require('axios')
const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL
  exports.generatePaymentLink = async (
  customer_details,
  amount,
  transaction_id
) => {
    try {
    console.log(amount)
    console.log("transaction_id " + transaction_id);

    const payload = {
      order_id: transaction_id,
      link_id: transaction_id, // must be unique for every request
      link_amount: amount, // integer paise, not rupees if “amount” is in paise
      link_currency: "INR",
      link_purpose: "Subscription",
      customer_details, // {customer_name, customer_phone, customer_email}
      link_notify: {
        send_sms: false,
        send_email: true,
      },
      order_meta: {
        return_url: "",
        notify_url: "",
      },
    };

    const response = await axios.post(`${CASHFREE_BASE_URL}/links`, payload, {
      headers: {
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "x-api-version": "2025-01-01",
        "Content-Type": "application/json",
      },
    });

    // Cashfree returns {link_url, link_id, link_status, ...}
    return response.data.link_url;
  } catch (err) {
    // Axios wraps the API error inside err.response
    console.error(
      "Cashfree link generation failed:",
      err?.response?.data || err
    );
    throw err; // bubble up so your controller can handle it
  }
};
