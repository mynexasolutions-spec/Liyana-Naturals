import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ReviewBody = {
  productId?: unknown;
  authorName?: unknown;
  rating?: unknown;
  body?: unknown;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: ReviewBody;
  try {
    body = (await request.json()) as ReviewBody;
  } catch {
    return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  }

  const productId = typeof body.productId === "string" ? body.productId.trim() : "";
  const authorName = typeof body.authorName === "string" ? body.authorName.trim() : "";
  const reviewBody = typeof body.body === "string" ? body.body.trim() : "";
  const rating = Number(body.rating);

  if (
    !uuidPattern.test(productId) ||
    authorName.length < 2 ||
    authorName.length > 120 ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    reviewBody.length < 10 ||
    reviewBody.length > 2000
  ) {
    return NextResponse.json({ error: "Enter a valid name, rating, and review." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    author_name: authorName,
    rating,
    body: reviewBody,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: "Your review could not be submitted right now." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Your review was submitted for approval." }, { status: 201 });
}
