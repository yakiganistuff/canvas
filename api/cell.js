import { redis, send, bad, body, requireUser, getProject, canSee } from "./_lib.js";

const KEYS = new Set(["name","lead","why","scope","aud","kpi","success","hr_struct","hr_proc","hr_mind","needs","gives","tension","timeline"]);

// POST {project, key, v}: save one canvas block.
export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, "Method not allowed", 405);
  const me = await requireUser(req, res);
  if (!me) return;
  const { project, key, v } = body(req);
  if (!KEYS.has(key)) return bad(res, "קוביה לא מוכרת");
  const p = await getProject(String(project || ""));
  if (!p || !canSee(me, p)) return bad(res, "אין לכן גישה לפרויקט הזה", 404);
  if (JSON.stringify(v ?? "").length > 20000) return bad(res, "התוכן ארוך מדי לקוביה אחת");
  const rec = { v: v ?? "", at: Date.now(), by: me.id };
  await redis.hset(`cells:${project}`, { [key]: rec });
  send(res, 200, { cell: rec });
}
