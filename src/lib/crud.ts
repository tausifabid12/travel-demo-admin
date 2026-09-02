import type { Model, PipelineStage, SortOrder } from "mongoose";
import type { ZodType } from "zod";
import { ok, fail, withAuth, listParams, uniqueSlug, slugify } from "@/lib/api";
import { can, type Module } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import type { SessionUser } from "@/lib/auth";

type AnyModel = Model<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type CrudConfig = {
  model: AnyModel;
  module: Module;
  /** Human label used in the activity feed, e.g. "Package". */
  entityType: string;
  schema: ZodType;
  /** Schema used for PUT when it differs from create (e.g. users). */
  updateSchema?: ZodType;
  /** Which field seeds the slug. Omit for models without a slug. */
  slugSource?: string;
  /** Fields a ?q= search should match, case-insensitively. */
  searchFields?: string[];
  defaultSort?: Record<string, SortOrder>;
  /** [path, selected fields] pairs passed to .populate(). */
  populate?: [string, string][];
  /** Strip fields from every response (secrets, password hashes). */
  hide?: string[];
};

/** Minimal shape of the Mongoose query methods this module chains. */
type Populatable = { populate: (path: string, select: string) => unknown };

function applyPopulate<T extends Populatable>(
  query: T,
  populate?: [string, string][],
): T {
  populate?.forEach(([path, select]) => query.populate(path, select));
  return query;
}

function stripHidden<T extends Record<string, unknown>>(doc: T, hide?: string[]): T {
  if (!hide?.length) return doc;
  const copy = { ...doc };
  hide.forEach((f) => delete copy[f]);
  return copy;
}

/**
 * Editors may save but never publish, so their writes are forced back to draft
 * regardless of what the form submitted.
 */
function enforcePublishRights(
  data: Record<string, unknown>,
  user: SessionUser,
  module: Module,
) {
  if ("status" in data && !can(user.role, module, "publish")) {
    if (data.status === "published") data.status = "draft";
  }
  return data;
}

export function collectionHandlers(cfg: CrudConfig) {
  const GET = withAuth(cfg.module, "read", async ({ request }) => {
    const { q, status, sort, limit, skip, page, searchParams } = listParams(request);

    const filter: Record<string, unknown> = {};
    if (status && status !== "All") filter.status = status;
    if (q && cfg.searchFields?.length) {
      filter.$or = cfg.searchFields.map((f) => ({
        [f]: { $regex: q, $options: "i" },
      }));
    }
    // Pass through any extra equality filters the UI sends (category, region…)
    for (const [key, value] of searchParams.entries()) {
      if (["q", "status", "sort", "page", "limit"].includes(key)) continue;
      if (value) filter[key] = value;
    }

    const sortSpec: Record<string, SortOrder> = sort
      ? { [sort.replace(/^-/, "")]: sort.startsWith("-") ? -1 : 1 }
      : (cfg.defaultSort ?? { createdAt: -1 });

    const [items, total] = await Promise.all([
      applyPopulate(
        cfg.model.find(filter).sort(sortSpec).skip(skip).limit(limit),
        cfg.populate,
      ).lean(),
      cfg.model.countDocuments(filter),
    ]);

    return ok({
      items: (items as Record<string, unknown>[]).map((i) => stripHidden(i, cfg.hide)),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  });

  const POST = withAuth(cfg.module, "create", async ({ request, user }) => {
    const raw = await request.json();
    const data = enforcePublishRights(
      cfg.schema.parse(raw) as Record<string, unknown>,
      user,
      cfg.module,
    );

    if (cfg.slugSource) {
      const seed = (data.slug as string) || (data[cfg.slugSource] as string);
      data.slug = await uniqueSlug(cfg.model as never, seed);
    }

    const created = await cfg.model.create(data);
    await logActivity(user, "created", cfg.entityType, created);
    return ok(stripHidden(created.toObject(), cfg.hide), { status: 201 });
  });

  return { GET, POST };
}

export function itemHandlers(cfg: CrudConfig) {
  type P = { id: string };

  const GET = withAuth<P>(cfg.module, "read", async ({ params }) => {
    const doc = await applyPopulate(
      cfg.model.findById(params.id),
      cfg.populate,
    ).lean();
    if (!doc) return fail("Not found", 404);
    return ok(stripHidden(doc as Record<string, unknown>, cfg.hide));
  });

  const PUT = withAuth<P>(cfg.module, "update", async ({ request, params, user }) => {
    const raw = await request.json();
    const schema = cfg.updateSchema ?? cfg.schema;
    const data = enforcePublishRights(
      schema.parse(raw) as Record<string, unknown>,
      user,
      cfg.module,
    );

    if (cfg.slugSource) {
      const seed = (data.slug as string) || (data[cfg.slugSource] as string);
      if (seed) data.slug = await uniqueSlug(cfg.model as never, seed, params.id);
    }

    const updated = await cfg.model.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!updated) return fail("Not found", 404);

    await logActivity(
      user,
      data.status === "published" ? "published" : "updated",
      cfg.entityType,
      updated,
    );
    return ok(stripHidden(updated.toObject(), cfg.hide));
  });

  const DELETE = withAuth<P>(cfg.module, "delete", async ({ params, user }) => {
    const removed = await cfg.model.findByIdAndDelete(params.id);
    if (!removed) return fail("Not found", 404);
    await logActivity(user, "deleted", cfg.entityType, removed);
    return ok({ id: params.id });
  });

  return { GET, PUT, DELETE };
}

/** Clone a document, giving the copy a fresh unique slug and draft status. */
export function duplicateHandler(cfg: CrudConfig) {
  type P = { id: string };
  return withAuth<P>(cfg.module, "create", async ({ params, user }) => {
    const source = await cfg.model.findById(params.id).lean();
    if (!source) return fail("Not found", 404);

    const copy = { ...(source as Record<string, unknown>) };
    delete copy._id;
    delete copy.createdAt;
    delete copy.updatedAt;
    copy.status = "draft";
    copy.isFeatured = false;

    const titleField = cfg.slugSource ?? "title";
    const newTitle = `${copy[titleField]} (Copy)`;
    copy[titleField] = newTitle;
    if (cfg.slugSource) {
      copy.slug = await uniqueSlug(cfg.model as never, slugify(newTitle));
    }

    const created = await cfg.model.create(copy);
    await logActivity(user, "duplicated", cfg.entityType, created);
    return ok(created.toObject(), { status: 201 });
  });
}

/** Persist a drag-and-drop ordering: index in the array becomes `order`. */
export function reorderHandler(cfg: CrudConfig) {
  return withAuth(cfg.module, "update", async ({ request }) => {
    const { ids } = (await request.json()) as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) return fail("No ids supplied");

    await cfg.model.bulkWrite(
      ids.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
      })),
    );
    return ok({ reordered: ids.length });
  });
}

export type { PipelineStage };
