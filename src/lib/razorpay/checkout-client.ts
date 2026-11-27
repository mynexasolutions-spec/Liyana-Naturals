const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

export type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  timeout: number;
  handler: (response: RazorpaySuccess) => void;
  modal: { ondismiss: () => void; confirm_close: boolean };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

let loading: Promise<void> | null = null;

function loadScript(): Promise<void> {
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("The payment window could not be loaded. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return loading;
}

export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  if (!window.Razorpay) await loadScript();
  if (!window.Razorpay) {
    throw new Error("The payment window is unavailable. Please try again.");
  }
  new window.Razorpay(options).open();
}
