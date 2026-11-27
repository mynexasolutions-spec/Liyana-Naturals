import { NextResponse } from "next/server";
import { z } from "zod";
import { orderIdSchema, readAdminRequest } from "@/lib/security/admin-route";
import { jsonError } from "@/lib/security/request";
import { createShipment } from "@/lib/shiprocket/orders";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const dimension = z.number().min(0.5).max(200);
const parcelSchema = z.object({
  weightKg: z.number().min(0.05).max(50),
  lengthCm: dimension,
  breadthCm: dimension,
  heightCm: dimension,
});

// Sends the order to Shiprocket.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await readAdminRequest(request);
  if (!body.ok) return body.response;

  const id = orderIdSchema.safeParse((await params).id);
  if (!id.success) return jsonError("Invalid order.", 400);
  const parcel = parcelSchema.safeParse(body.data);
  if (!parcel.success) {
    return jsonError("Enter a weight of 0.05–50 kg and sizes of 0.5–200 cm.", 400);
  }

  try {
    const result = await createShipment(createSupabaseAdminClient(), id.data, parcel.data);
    return result.ok
      ? NextResponse.json({ ok: true, shiprocketOrderId: result.shiprocketOrderId })
      : jsonError(result.error, result.status);
  } catch (error) {
    console.error("[admin-shipment] Failed:", error instanceof Error ? error.message : error);
    return jsonError("The shipment could not be created. Please try again.", 500);
  }
}
