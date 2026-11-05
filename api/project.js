import { redis, send, bad, requireUser, getProject, getOrg, canSee } from "./_lib.js";

// GET ?id=<project>: the project, its org name and all saved cells.
export default async function handler(req, res) {
  const me = await requireUser(req, res);
  if (!me) return;
  const id = String(req.query?.id || "");
  const p = await getProject(id);
  if (!p || !canSee(me, p)) return bad(res, "אין לכן גישה לפרויקט הזה", 404);
  const [org, cells] = await Promise.all([getOrg(p.org), redis.hgetall(`cells:${id}`)]);
  send(res, 200, { project: { id, ...p }, org: { id: p.org, name: org?.name || p.org }, cells: cells || {} });
}
