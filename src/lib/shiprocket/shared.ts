// Plain helpers shared by server and client code. No secrets here.

export const SHIPROCKET_NEW_ORDERS_URL = "https://app.shiprocket.in/seller/orders/new";

// Pre-filled in the admin "ship" form; the admin enters the packed parcel's values.
export const DEFAULT_PACKAGE = {
  itemWeightKg: 0.25,
  packagingWeightKg: 0.1,
  lengthCm: 15,
  breadthCm: 12,
  heightCm: 8,
};

export type TrackingScan = {
  date: string | null;
  activity: string | null;
  location: string | null;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export function trackingUrl(awbCode: string): string {
  return `https://shiprocket.co/tracking/${encodeURIComponent(awbCode)}`;
}

function normalize(status: string | null | undefined): string {
  return (status ?? "").toLowerCase().replace(/[_\-\s]+/g, " ").trim();
}

/**
 * Maps a courier status to an order status. Matches from the start of the text,
 * so "Undelivered" and "RTO Delivered" are never read as "Delivered".
 */
export function mapShiprocketStatus(status: string | null | undefined): OrderStatus | null {
  const value = normalize(status);
  if (value.startsWith("rto")) return value === "rto delivered" ? "returned" : null;
  if (value === "delivered") return "delivered";
  const moving = ["shipped", "picked up", "in transit", "out for delivery", "reached at destination", "reached destination"];
  return moving.some((prefix) => value.startsWith(prefix)) ? "shipped" : null;
}

/** A courier event the admin has to act on. */
export function shipmentNotice(status: string | null | undefined): string | null {
  const value = normalize(status);
  if (value === "canceled" || value === "cancelled") {
    return "Shipment was cancelled in Shiprocket. Cancel this order or arrange delivery.";
  }
  if (value.startsWith("rto")) return "Courier is returning this order (RTO). Check it in Shiprocket.";
  if (value.startsWith("undelivered")) return "A delivery attempt failed. Check it in Shiprocket.";
  if (value.startsWith("lost") || value.startsWith("damaged")) {
    return "Courier reports the parcel lost or damaged. Raise it in Shiprocket.";
  }
  return null;
}

const PROGRESS: Partial<Record<OrderStatus, number>> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

/** Courier updates only move an order forward, even if events arrive out of order. */
export function nextOrderStatus(current: OrderStatus, incoming: OrderStatus | null): OrderStatus {
  if (!incoming || current === "cancelled" || current === "returned") return current;
  if (incoming === "returned") return "returned";
  return (PROGRESS[incoming] ?? -1) > (PROGRESS[current] ?? 99) ? incoming : current;
}

export function shipmentTone(status: string | null | undefined): "green" | "red" | "blue" | "gold" {
  const value = normalize(status);
  if (value === "delivered") return "green";
  if (shipmentNotice(status)) return "red";
  return mapShiprocketStatus(status) === "shipped" ? "blue" : "gold";
}

function clean(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 200) : null;
}

/** Keeps only the expected text fields from courier data, newest first. */
export function parseScans(value: unknown): TrackingScan[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 100)
    .flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const record = entry as Record<string, unknown>;
      const scan = {
        date: clean(record.date),
        activity: clean(record.activity) ?? clean(record["sr-status-label"]) ?? clean(record.status),
        location: clean(record.location),
      };
      return scan.activity ? [scan] : [];
    })
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

/** Formats a timestamp in India time. Courier dates arrive without a time zone. */
export function formatIndiaTime(value: string | null | undefined, withTime = true): string {
  if (!value) return "";
  const courier = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}(:\d{2})?)$/.exec(value);
  const date = new Date(courier ? `${courier[1]}T${courier[2]}+05:30` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit", hour12: true } : {}),
  });
}
