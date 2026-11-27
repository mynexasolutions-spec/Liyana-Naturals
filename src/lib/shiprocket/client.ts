import "server-only";

import { parseScans } from "@/lib/shiprocket/shared";

const API_BASE = "https://apiv2.shiprocket.in/v1/external";
// Shiprocket tokens last about 10 days.
const TOKEN_LIFETIME_MS = 9 * 24 * 60 * 60 * 1000;
// Repeated bad logins can lock the API user, so wait before trying again.
const LOGIN_RETRY_MS = 5 * 60 * 1000;

/** An error whose message is safe to show to an admin. */
export class ShiprocketError extends Error {}

let token: { value: string; expiresAt: number } | null = null;
let loginBlockedUntil = 0;

async function send(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new ShiprocketError("Shiprocket did not respond. Please try again.");
  }
}

async function login(): Promise<string> {
  const email = process.env.SHIPROCKET_API_EMAIL;
  const password = process.env.SHIPROCKET_API_PASSWORD;
  if (!email || !password) {
    throw new ShiprocketError("Shiprocket API email and password are not set on the server.");
  }
  if (Date.now() < loginBlockedUntil) {
    throw new ShiprocketError("Shiprocket login failed recently. Check the API credentials and retry in a few minutes.");
  }

  const response = await send(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await response.json().catch(() => null)) as { token?: string } | null;
  if (!response.ok || !data?.token) {
    loginBlockedUntil = Date.now() + LOGIN_RETRY_MS;
    console.error(`[shiprocket] Login failed (${response.status}).`);
    throw new ShiprocketError("Shiprocket login failed. Check the API email and password.");
  }
  token = { value: data.token, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
  return data.token;
}

async function request<T>(path: string, body?: unknown, retry = true): Promise<T> {
  const bearer = token && Date.now() < token.expiresAt ? token.value : await login();
  const response = await send(`${API_BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: { "content-type": "application/json", authorization: `Bearer ${bearer}` },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && retry) {
    token = null;
    return request<T>(path, body, false);
  }
  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string; errors?: unknown })
    | null;
  if (!response.ok || !data) {
    const detail = data?.errors ? JSON.stringify(data.errors) : data?.message;
    console.error(`[shiprocket] ${path.split("?")[0]} failed (${response.status}): ${detail ?? "no details"}`);
    throw new ShiprocketError(detail?.slice(0, 300) ?? `Shiprocket request failed (${response.status}).`);
  }
  return data;
}

const text = (value: unknown) => (value ? String(value) : null);

export async function createAdhocOrder(payload: Record<string, unknown>) {
  const data = await request<{
    order_id?: number | string;
    shipment_id?: number | string;
    status?: string;
    message?: string;
    errors?: unknown;
  }>("/orders/create/adhoc", payload);

  // Shiprocket can answer 200 without ids, for example for a wrong pickup name.
  if (!data.order_id || !data.shipment_id) {
    const detail = data.message || (data.errors ? JSON.stringify(data.errors) : "");
    throw new ShiprocketError(
      `Shiprocket did not create the shipment. ${detail.slice(0, 300) || "Check the pickup location, phone, PIN code and account KYC."}`,
    );
  }
  return {
    orderId: String(data.order_id),
    shipmentId: String(data.shipment_id),
    status: data.status || "NEW",
  };
}

export async function trackByAwb(awbCode: string) {
  const data = await request<{
    tracking_data?: {
      shipment_track?: { current_status?: string; courier_name?: string }[];
      shipment_track_activities?: unknown;
    };
  }>(`/courier/track/awb/${encodeURIComponent(awbCode)}`);
  const shipment = data.tracking_data?.shipment_track?.[0];
  return {
    status: text(shipment?.current_status),
    courierName: text(shipment?.courier_name),
    scans: parseScans(data.tracking_data?.shipment_track_activities),
  };
}

type ShiprocketShipment = { awb?: string; awb_code?: string; courier?: string; courier_name?: string };

/** Order-level status, used until an AWB is known. */
export async function fetchShiprocketOrder(shiprocketOrderId: string) {
  const { data } = await request<{
    data?: ShiprocketShipment & {
      status?: string;
      shipments?: ShiprocketShipment | ShiprocketShipment[];
    };
  }>(`/orders/show/${encodeURIComponent(shiprocketOrderId)}`);
  // `shipments` is an object for one shipment and an array when split.
  const shipment = Array.isArray(data?.shipments) ? data.shipments[0] : data?.shipments;
  return {
    status: text(data?.status),
    awbCode: text(shipment?.awb || shipment?.awb_code || data?.awb_code || data?.awb),
    courierName: text(shipment?.courier || shipment?.courier_name || data?.courier_name),
  };
}
