import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type OrderBody = {
  customer?: { fullName?: unknown; email?: unknown; phone?: unknown };
  address?: { street?: unknown; city?: unknown; state?: unknown; pinCode?: unknown };
  items?: { productId?: unknown; quantity?: unknown }[];
  deliveryMethod?: unknown;
  paymentMethod?: unknown;
  couponCode?: unknown;
};

export async function POST(request: Request) {
  let body: OrderBody;
  try {
    body = (await request.json()) as OrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
  }

  const customer = body.customer;
  const address = body.address;
  const items = Array.isArray(body.items) ? body.items : [];
  const fullName = typeof customer?.fullName === "string" ? customer.fullName.trim() : "";
  const email = typeof customer?.email === "string" ? customer.email.trim().toLowerCase() : "";
  const phone = typeof customer?.phone === "string" ? customer.phone.trim() : "";
  const street = typeof address?.street === "string" ? address.street.trim() : "";
  const city = typeof address?.city === "string" ? address.city.trim() : "";
  const state = typeof address?.state === "string" ? address.state.trim() : "";
  const pinCode = typeof address?.pinCode === "string" ? address.pinCode.trim() : "";

  if (
    fullName.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    phone.replace(/\D/g, "").length < 10 ||
    street.length < 6 ||
    city.length < 2 ||
    !state ||
    !/^\d{6}$/.test(pinCode) ||
    items.length === 0
  ) {
    return NextResponse.json({ error: "Complete the customer, address, and cart details." }, { status: 400 });
  }

  const quantities = new Map<string, number>();
  for (const item of items) {
    if (typeof item.productId !== "string") {
      return NextResponse.json({ error: "The cart contains an invalid product." }, { status: 400 });
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return NextResponse.json({ error: "Product quantities must be whole numbers between 1 and 99." }, { status: 400 });
    }
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + quantity);
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Orders are not configured." }, { status: 500 });
  }

  const productIds = [...quantities.keys()];
  const { data: products, error: productError } = await admin
    .from("products")
    .select("id,name,price,stock_quantity,is_active")
    .in("id", productIds);
  if (productError) return NextResponse.json({ error: productError.message }, { status: 500 });

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  if (productMap.size !== productIds.length) {
    return NextResponse.json({ error: "One or more products are no longer available." }, { status: 409 });
  }

  for (const [productId, quantity] of quantities) {
    const product = productMap.get(productId);
    if (!product?.is_active || product.stock_quantity < quantity) {
      return NextResponse.json({ error: `${product?.name ?? "A product"} is out of stock.` }, { status: 409 });
    }
  }

  const subtotal = productIds.reduce((sum, productId) => {
    const product = productMap.get(productId);
    return sum + Number(product?.price ?? 0) * (quantities.get(productId) ?? 0);
  }, 0);
  const couponCode = typeof body.couponCode === "string" ? body.couponCode.trim().toUpperCase() : "";
  const discount = couponCode === "LIYANA10" ? Math.round(subtotal * 0.1) : 0;
  const shipping = body.deliveryMethod === "express" ? 100 : subtotal >= 999 ? 0 : 60;
  const total = Math.max(0, subtotal - discount) + shipping;

  const { data: customerRow, error: customerError } = await admin
    .from("customers")
    .upsert({ full_name: fullName, email, phone }, { onConflict: "email" })
    .select("id")
    .single();
  if (customerError || !customerRow) {
    return NextResponse.json({ error: customerError?.message ?? "Customer could not be saved." }, { status: 500 });
  }

  const orderNumber = `LN-${Date.now().toString().slice(-8)}`;
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customerRow.id,
      subtotal,
      discount,
      shipping,
      total,
      shipping_address: { street, city, state, pinCode, phone, deliveryMethod: body.deliveryMethod },
      payment_status: "pending",
      status: "pending",
    })
    .select("id,order_number")
    .single();
  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Order could not be created." }, { status: 500 });
  }

  const { error: itemError } = await admin.from("order_items").insert(
    productIds.map((productId) => {
      const product = productMap.get(productId)!;
      const quantity = quantities.get(productId)!;
      return {
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
        total: Number(product.price) * quantity,
      };
    }),
  );
  if (itemError) {
    await admin.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  const decremented: { id: string; stock: number }[] = [];
  for (const [productId, quantity] of quantities) {
    const product = productMap.get(productId)!;
    const { data: updatedProduct, error: stockError } = await admin
      .from("products")
      .update({ stock_quantity: product.stock_quantity - quantity })
      .eq("id", productId)
      .eq("stock_quantity", product.stock_quantity)
      .select("id")
      .maybeSingle();

    if (stockError || !updatedProduct) {
      for (const restored of decremented) {
        await admin
          .from("products")
          .update({ stock_quantity: restored.stock })
          .eq("id", restored.id);
      }
      await admin.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "Stock changed while placing the order. Please try again." }, { status: 409 });
    }
    decremented.push({ id: productId, stock: product.stock_quantity });
  }

  return NextResponse.json({ orderNumber: order.order_number }, { status: 201 });
}
