const PESAPAL_BASE =
  process.env.PESAPAL_ENV === "production"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";

const PESAPAL_IPN_URL =
  process.env.NEXT_PUBLIC_SITE_URL + "/api/pay/webhook";

let _token: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _token.expiresAt) return _token.value;

  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY!,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET!,
    }),
  });

  if (!res.ok) throw new Error("Pesapal auth failed: " + res.status);
  const data = await res.json();

  _token = {
    value: data.token,
    expiresAt: Date.now() + 4 * 60 * 60 * 1000, // 4 hours
  };

  return _token.value;
}

async function ensureIpnRegistered(): Promise<string> {
  const token = await getToken();

  const res = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: PESAPAL_IPN_URL,
      ipn_notification_type: "POST",
    }),
  });

  if (!res.ok) throw new Error("Pesapal IPN registration failed");
  const data = await res.json();
  return data.ipn_id;
}

export interface PesapalOrderOptions {
  id: string; // internal payment UUID
  amount: number; // KES
  description: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  callbackUrl: string;
}

export async function submitOrder(opts: PesapalOrderOptions): Promise<string> {
  const token = await getToken();
  const ipnId = await ensureIpnRegistered();

  const res = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: opts.id,
      currency: "KES",
      amount: opts.amount,
      description: opts.description,
      callback_url: opts.callbackUrl,
      notification_id: ipnId,
      billing_address: {
        email_address: opts.email,
        phone_number: opts.phone ?? "",
        first_name: opts.firstName,
        last_name: opts.lastName,
      },
    }),
  });

  if (!res.ok) throw new Error("Pesapal order submission failed");
  const data = await res.json();
  return data.redirect_url;
}

export async function getTransactionStatus(
  orderTrackingId: string
): Promise<{ status: string; paymentMethod: string; amount: number }> {
  const token = await getToken();

  const res = await fetch(
    `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Pesapal status check failed");
  const data = await res.json();

  return {
    status: data.payment_status_description,
    paymentMethod: data.payment_method,
    amount: data.amount,
  };
}
