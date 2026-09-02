import Setting, { SECRET_FIELDS } from "@/lib/models/Setting";
import { ok, withAuth } from "@/lib/api";
import { logActivity } from "@/lib/activity";

type Doc = Record<string, unknown>;

/**
 * Secrets are write-only: the client is told whether a value is set, never
 * what it is, so the salt keys cannot be read back out of the CMS.
 */
function redact(doc: Doc): Doc {
  const out = { ...doc };
  for (const field of SECRET_FIELDS) {
    out[`${field}IsSet`] = Boolean(out[field]);
    delete out[field];
  }
  return out;
}

/** An empty string from the form means "leave the stored secret alone". */
function stripBlankSecrets(body: Doc): Doc {
  const out = { ...body };
  for (const field of SECRET_FIELDS) {
    if (out[field] === "" || out[field] === undefined) delete out[field];
    delete out[`${field}IsSet`];
  }
  return out;
}

export const GET = withAuth("settings", "read", async () => {
  const settings = await Setting.findOneAndUpdate(
    {},
    {},
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean<Doc>();
  return ok(redact(settings ?? {}));
});

export const POST = withAuth("settings", "update", async ({ request, user }) => {
  const body = stripBlankSecrets((await request.json()) as Doc);
  delete body._id;

  const updated = await Setting.findOneAndUpdate(
    {},
    { $set: body },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean<Doc>();

  await logActivity(user, "updated", "Settings");
  return ok(redact(updated ?? {}));
});
