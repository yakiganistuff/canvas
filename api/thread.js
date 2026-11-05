import { redis, send, bad, body, requireUser, getProject, canSee, threadKey } from "./_lib.js";

// GET ?project=&key=  : this person's saved coach conversation for one block (or the whole-canvas review)
// POST {project, key, clear: true} : clears it
export default async function handler(req, res) {
  const me = await requireUser(req, res);
  if (!me) return;
  const src = req.method === "POST" ? body(req) : req.query || {};
  const p = await getProject(String(src.project || ""));
  if (!p || !canSee(me, p)) return bad(res, "אין לכן גישה לפרויקט הזה", 404);
  const k = threadKey(String(src.project), me.id, String(src.key || ""));
  if (req.method === "POST") {
    if (src.clear) await redis.del(k);
    return send(res, 200, { ok: true });
  }
  const messages = (await redis.lrange(k, 0, -1)) || [];
  send(res, 200, { messages });
}
