import "server-only";

import { NextResponse } from "next/server";
import type { z } from "zod";
import { orderIdSchema as uuidSchema, readAdminRequest } from "@/lib/security/admin-route";
import { jsonError } from "@/lib/security/request";
import { getAdminSession } from "@/lib/supabase/admin-auth";

// Admin create, update and delete. Writes use the signed-in admin's own client,
// so the database access rules apply as well as these checks.

type Context = { params: Promise<{ id: string }> };

function failed(table: string, action: string, message: string) {
  console.error(`[admin] ${table} ${action} failed:`, message);
  return jsonError(`The record could not be ${action}.`, 500);
}

export function createRecord(table: string, schema: z.ZodType<Record<string, unknown>>) {
  return async function POST(request: Request) {
    const body = await readAdminRequest(request, 20_000);
    if (!body.ok) return body.response;
    const parsed = schema.safeParse(body.data);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Check the details.", 400);
    const session = await getAdminSession();
    if (!session) return jsonError("Forbidden", 403);

    const { error } = await session.supabase.from(table).insert(parsed.data);
    if (error) return failed(table, "saved", error.message);
    return NextResponse.json({ ok: true }, { status: 201 });
  };
}

export function updateRecord(table: string, schema: z.ZodType<Record<string, unknown>>) {
  return async function PATCH(request: Request, { params }: Context) {
    const body = await readAdminRequest(request, 20_000);
    if (!body.ok) return body.response;
    const id = uuidSchema.safeParse((await params).id);
    if (!id.success) return jsonError("Invalid record.", 400);
    const parsed = schema.safeParse(body.data);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Check the details.", 400);
    if (Object.keys(parsed.data).length === 0) return jsonError("Nothing to change.", 400);
    const session = await getAdminSession();
    if (!session) return jsonError("Forbidden", 403);

    const { data, error } = await session.supabase.from(table).update(parsed.data).eq("id", id.data).select("id");
    if (error) return failed(table, "updated", error.message);
    if (!data?.length) return jsonError("Record not found.", 404);
    return NextResponse.json({ ok: true });
  };
}

export function deleteRecord(table: string) {
  return async function DELETE(_request: Request, { params }: Context) {
    const session = await getAdminSession();
    if (!session) return jsonError("Forbidden", 403);
    const id = uuidSchema.safeParse((await params).id);
    if (!id.success) return jsonError("Invalid record.", 400);

    const { data, error } = await session.supabase.from(table).delete().eq("id", id.data).select("id");
    if (error) return failed(table, "deleted", error.message);
    if (!data?.length) return jsonError("Record not found.", 404);
    return NextResponse.json({ ok: true });
  };
}
