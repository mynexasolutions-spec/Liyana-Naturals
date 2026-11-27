// What an order's state means for the store. Used by the dashboard and the
// orders page, on the server and in the browser. No secrets here.

export type OrderState = {
  status: string;
  payment_status: string;
  payment_method: string | null;
  shiprocket_order_id: string | null;
  stock_released: boolean;
};

export const isClosed = (order: OrderState) => order.status === "cancelled" || order.status === "returned";

// Online orders that were never paid are abandoned checkouts, not orders.
export const isPlaced = (order: OrderState) =>
  order.payment_method !== "razorpay" || ["paid", "refunded"].includes(order.payment_status);

// Money actually earned: paid orders, plus cash orders once delivered.
export const isSale = (order: OrderState) =>
  !isClosed(order) &&
  order.payment_status !== "refunded" &&
  (order.payment_status === "paid" || (order.payment_method === "cod" && order.status === "delivered"));

export const isCashDue = (order: OrderState) =>
  order.payment_method === "cod" &&
  !["paid", "refunded"].includes(order.payment_status) &&
  !isClosed(order) &&
  order.status !== "delivered";

// An online payment that failed or never finished, on an order that can still be marked paid.
export const awaitsPayment = (order: OrderState) =>
  order.payment_method !== "cod" &&
  ["pending", "failed"].includes(order.payment_status) &&
  order.status !== "returned" &&
  !(order.status === "cancelled" && !order.stock_released);

export const isReadyToShip =(order: OrderState) =>
  ["pending", "confirmed", "processing"].includes(order.status) &&
  !order.shiprocket_order_id &&
  !order.stock_released &&
  (order.payment_method === "cod" || order.payment_status === "paid");
