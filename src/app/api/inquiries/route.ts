import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { inquiryCreateSchema } from "@/lib/inquiries/schema";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid inquiry." }, { status: 400 });
  }

  const parsed = inquiryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Enter valid inquiry details." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("inquiries").insert({
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
      status: "new",
    });

    if (error) {
      return NextResponse.json(
        {
          error:
            error.code === "42501"
              ? "The contact form is temporarily unavailable. Please try again shortly."
              : "We could not save your message. Please try again shortly.",
        },
        { status: error.code === "42501" ? 503 : 500 },
      );
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "We could not save your message. Please try again shortly." },
      { status: 503 },
    );
  }
}
