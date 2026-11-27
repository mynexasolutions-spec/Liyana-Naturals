import { randomBytes } from "node:crypto";
import { after, NextResponse } from "next/server";
import { calculateOrderTotals, roundMoney, toPaymentSettings, toShippingSettings } from "@/lib/checkout/pricing";
import { orderRequestSchema } from "@/lib/checkout/schema";
import { COUPON_NOT_VALID, findRedeemableCoupon } from "@/lib/coupons/server";
import type { CouponRule } from "@/lib/coupons/shared";
import { sendOrderConfirmation } from "@/lib/orders/confirmation-email";
import { createRazorpayOrder, getRazorpayConfig } from "@/lib/razorpay/server";
import { withinRateLimits } from "@/lib/security/rate-limit";
import { getClientIp, jsonError, readJsonBody } from "@/lib/security/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Unpaid online orders hold stock this long. Must exceed the checkout window.
const RESERVE_MINUTES = 20;

const PRICE_CHANGED = "Prices have changed. Refresh the page, review your total and try again.";

const COUPON_ERRORS: Record<string, string> = {
  COUPON_INVALID: "This coupon can no longer be applied. Remove it and apply it again.",
  COUPON_USED_UP: "This coupon has been fully used.",
  COUPON_CUSTOMER_LIMIT: "You have already used this coupon the maximum number of times.",
};

/** Tells checkout to remove the applied coupon. */
function couponRejected(error: string) {
  return NextResponse.json({ error, couponRejected: true }, { status: 409 });
}

function newOrderNumber(): string {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `LN-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

async function getSignedInUserId(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = orderRequestSchema.safeParse(body.data);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Check your order details.", 400);
  }
  const { customer, address, items, paymentMethod, couponCode, expectedTotal } = parsed.data;
  const isOnline = paymentMethod === "online";
  const razorpay = getRazorpayConfig();
  if (isOnline && !razorpay) {
    return jsonError("Online payment is unavailable right now. Please try again later.", 503);
  }

  try {
    const admin = createSupabaseAdminClient();

    // Cash orders cost nothing to fake, so they get tighter limits.
    const ip = getClientIp(request);
    const allowed = await withinRateLimits(
      admin,
      isOnline
        ? [{ scope: "order-ip", identifier: ip, limit: 10, windowSeconds: 600 }]
        : [
            { scope: "cod-ip", identifier: ip, limit: 5, windowSeconds: 3600 },
            { scope: "cod-email", identifier: customer.email, limit: 3, windowSeconds: 3600 },
          ],
    );
    if (!allowed) {
      return jsonError("Too many order attempts. Please wait a while and try again.", 429);
    }

    const release = await admin.rpc("release_unpaid_orders");
    if (release.error) console.error("[orders] Stock release failed:", release.error.message);

    const wanted = new Map<string, { productId: string; variantId: string | null; quantity: number }>();
    for (const item of items) {
      const key = `${item.productId}:${item.variantId ?? ""}`;
      const line = wanted.get(key) ?? { productId: item.productId, variantId: item.variantId ?? null, quantity: 0 };
      line.quantity += item.quantity;
      wanted.set(key, line);
    }

    const { data: products, error: productError } = await admin
      .from("products")
      .select("id,name,price,stock_quantity,is_active,product_variants(id,name,price,stock_quantity)")
      .in("id", [...new Set(items.map((item) => item.productId))]);
    if (productError) throw new Error(productError.message);

    const productMap = new Map((products ?? []).map((product) => [product.id as string, product]));
    const lines: { product_id: string; variant_id: string | null; quantity: number; unit_price: number }[] = [];
    for (const { productId, variantId, quantity } of wanted.values()) {
      const product = productMap.get(productId);
      if (!product?.is_active) {
        return jsonError("One or more products are no longer available.", 409);
      }
      // The price and stock always come from the database, never from the cart.
      const sizes = product.product_variants ?? [];
      const size = variantId ? sizes.find((item) => item.id === variantId) : undefined;
      if (sizes.length > 0 ? !size : variantId) {
        return jsonError(`${product.name}: refresh the page and choose the size again.`, 409);
      }
      const sold = size ?? product;
      if (sold.stock_quantity < quantity) {
        const label = size ? `${product.name} (${size.name})` : product.name;
        return jsonError(`${label} does not have enough stock.`, 409);
      }
      lines.push({ product_id: productId, variant_id: variantId, quantity, unit_price: Number(sold.price) });
    }

    const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.unit_price * line.quantity, 0));
    let coupon: CouponRule | null = null;
    if (couponCode) {
      if (!/^[A-Z0-9_-]{3,30}$/.test(couponCode)) return couponRejected(COUPON_NOT_VALID);
      const found = await findRedeemableCoupon(admin, couponCode, subtotal);
      if (!found.ok) return couponRejected(found.error);
      coupon = found.coupon;
    }

    // Read fresh for every order. If it cannot be read, no order is better than a wrong charge.
    const settings = await admin.from("store_settings").select("*").eq("id", true).maybeSingle();
    if (settings.error) throw new Error(settings.error.message);
    const payment = toPaymentSettings(settings.data);

    // The checkout page hides what is switched off, but only this check counts.
    if (isOnline ? !payment.onlineEnabled : !payment.codEnabled) {
      return jsonError(
        `${isOnline ? "Online payment" : "Cash on Delivery"} is not available right now. Choose another way to pay.`,
        409,
      );
    }

    const totals = calculateOrderTotals({
      subtotal,
      coupon,
      shipping: toShippingSettings(settings.data),
      codFee: isOnline ? 0 : payment.codFee,
    });
    if (roundMoney(expectedTotal) !== totals.total) return jsonError(PRICE_CHANGED, 409);
    const amountPaise = Math.round(totals.total * 100);
    if (isOnline && amountPaise < 100) {
      return jsonError("The order total is too low for online payment.", 400);
    }

    const { data: order, error: orderError } = await admin.rpc("place_order", {
      p_order: {
        order_number: newOrderNumber(),
        auth_user_id: await getSignedInUserId(),
        coupon_code: coupon?.code ?? "",
        full_name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        payment_method: isOnline ? "razorpay" : "cod",
        reserve_minutes: RESERVE_MINUTES,
        ...totals,
        cod_fee: totals.codFee,
        shipping_address: {
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          ...address,
        },
      },
      p_items: lines,
    });
    if (orderError) {
      if (orderError.message.startsWith("OUT_OF_STOCK:")) {
        return jsonError(
          `${orderError.message.slice("OUT_OF_STOCK:".length)} does not have enough stock.`,
          409,
        );
      }
      if (orderError.message === "PRICE_CHANGED") return jsonError(PRICE_CHANGED, 409);
      if (Object.hasOwn(COUPON_ERRORS, orderError.message)) {
        return couponRejected(COUPON_ERRORS[orderError.message]);
      }
      if (orderError.message === "VARIANT_REQUIRED") {
        return jsonError("Refresh the page and choose the size again.", 409);
      }
      if (orderError.message === "PRODUCT_UNAVAILABLE") {
        return jsonError("One or more products are no longer available.", 409);
      }
      throw new Error(orderError.message);
    }
    const { id: orderId, order_number: orderNumber } = order as { id: string; order_number: string };

    if (!isOnline) {
      after(() => sendOrderConfirmation(orderId));
      return NextResponse.json({ orderNumber, ...totals }, { status: 201 });
    }

    try {
      const razorpayOrder = await createRazorpayOrder({ amountPaise, receipt: orderNumber, orderId });
      const { error: linkError } = await admin
        .from("orders")
        .update({ razorpay_order_id: razorpayOrder.id })
        .eq("id", orderId);
      if (linkError) throw new Error(linkError.message);

      return NextResponse.json(
        {
          orderNumber,
          ...totals,
          razorpay: {
            keyId: razorpay!.keyId,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
          },
        },
        { status: 201 },
      );
    } catch (error) {
      await admin.rpc("release_unpaid_orders", { p_order_id: orderId });
      console.error("[orders] Online payment setup failed:", error instanceof Error ? error.message : error);
      return jsonError("Online payment could not be started. Please try again.", 502);
    }
  } catch (error) {
    console.error("[orders] Order failed:", error instanceof Error ? error.message : error);
    return jsonError("We could not place your order. Please try again shortly.", 500);
  }
}
