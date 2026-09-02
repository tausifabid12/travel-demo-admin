import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import dbConnect from "@/lib/mongodb";
import { getSessionUser, type SessionUser } from "@/lib/auth";
import { can, type Action, type Module } from "@/lib/permissions";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(error: string, status = 400, extra?: unknown) {
  return NextResponse.json({ success: false, error, details: extra }, { status });
}

/** Turns anything thrown inside a handler into a sane JSON response. */
export function toErrorResponse(err: unknown) {
  if (err instanceof ZodError) {
    return fail("Validation failed", 422, err.flatten().fieldErrors);
  }
  const e = err as { name?: string; message?: string; code?: number };
  if (e?.code === 11000) return fail("That value must be unique", 409);
  if (e?.name === "ValidationError") return fail(e.message ?? "Invalid data", 422);
  if (e?.name === "CastError") return fail("Invalid identifier", 400);
  console.error(err);
  return fail(e?.message ?? "Something went wrong", 500);
}

type Ctx<P> = { params: Promise<P> };

type GuardedHandler<P> = (args: {
  request: Request;
  params: P;
  user: SessionUser;
}) => Promise<Response>;

/**
 * Wraps a route handler with a DB connection, a session check and a
 * permission check. Note `params` is a Promise in Next 16 and is awaited here.
 */
export function withAuth<P = Record<string, never>>(
  module: Module,
  action: Action,
  handler: GuardedHandler<P>,
) {
  return async (request: Request, ctx?: Ctx<P>) => {
    try {
      const user = await getSessionUser();
      if (!user) return fail("Unauthorized", 401);
      if (!can(user.role, module, action)) return fail("Forbidden", 403);

      await dbConnect();
      const params = ((await ctx?.params) ?? {}) as P;
      return await handler({ request, params, user });
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

type PublicHandler<P> = (args: {
  request: Request;
  params: P;
}) => Promise<Response>;

/** For the handful of endpoints the public site legitimately calls. */
export function publicRoute<P = Record<string, never>>(handler: PublicHandler<P>) {
  return async (request: Request, ctx?: Ctx<P>) => {
    try {
      await dbConnect();
      const params = ((await ctx?.params) ?? {}) as P;
      return await handler({ request, params });
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  return schema.parse(await request.json());
}

/** Shared list querystring: ?q= &status= &page= &limit= &sort= */
export function listParams(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 25)));
  return {
    q: url.searchParams.get("q")?.trim() || undefined,
    status: url.searchParams.get("status") || undefined,
    sort: url.searchParams.get("sort") || undefined,
    page,
    limit,
    skip: (page - 1) * limit,
    searchParams: url.searchParams,
  };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Appends -2, -3 … until the slug is free in the given collection. */
export async function uniqueSlug(
  model: { exists: (f: Record<string, unknown>) => Promise<unknown> },
  base: string,
  excludeId?: string,
) {
  const root = slugify(base);
  let candidate = root;
  let n = 1;
  while (
    await model.exists(
      excludeId
        ? { slug: candidate, _id: { $ne: excludeId } }
        : { slug: candidate },
    )
  ) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}
