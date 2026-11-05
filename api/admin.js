import { redis, send, bad, body, slug, validId, requireUser, getUser, getOrg, getProject, getMany, hashPassword, canManageOrg } from "./_lib.js";

// POST {action, ...}: management for admins (everything) and managers (their own org).
export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, "Method not allowed", 405);
  const me = await requireUser(req, res);
  if (!me) return;
  if (me.role !== "admin" && me.role !== "manager") return bad(res, "אין הרשאה", 403);
  const b = body(req);
  const isAdmin = me.role === "admin";

  switch (b.action) {
    /* ----- orgs (admin only) ----- */
    case "createOrg": {
      if (!isAdmin) return bad(res, "אין הרשאה", 403);
      const id = slug(b.id), name = String(b.name || "").trim();
      if (!validId(id) || !name) return bad(res, "מזהה באנגלית ושם לארגון");
      if (await getOrg(id)) return bad(res, "הארגון כבר קיים");
      await redis.set(`org:${id}`, { name, context: String(b.context || ""), at: Date.now() });
      await redis.sadd("orgs", id);
      return send(res, 200, { ok: true });
    }
    case "saveOrg": {
      if (!isAdmin) return bad(res, "אין הרשאה", 403);
      const o = await getOrg(b.id);
      if (!o) return bad(res, "הארגון לא נמצא", 404);
      await redis.set(`org:${b.id}`, { ...o, name: String(b.name || o.name).trim(), context: String(b.context ?? o.context ?? "").slice(0, 20000) });
      return send(res, 200, { ok: true });
    }

    /* ----- users ----- */
    case "createUser": {
      const id = slug(b.id), name = String(b.name || "").trim() || id, role = b.role;
      if (!validId(id)) return bad(res, "שם משתמש באנגלית: אותיות, ספרות ומקף");
      if (!b.password || String(b.password).length < 6) return bad(res, "סיסמה של 6 תווים לפחות");
      if (!["member", "manager", "admin"].includes(role)) return bad(res, "תפקיד לא מוכר");
      if (!isAdmin && role === "admin") return bad(res, "אין הרשאה", 403);
      const org = role === "admin" ? "" : (isAdmin ? slug(b.org) : me.org);
      if (role !== "admin" && !(await getOrg(org))) return bad(res, "צריך לבחור ארגון קיים");
      if (await getUser(id)) return bad(res, "שם המשתמש הזה כבר תפוס");
      await redis.set(`user:${id}`, { name, role, org, ...hashPassword(b.password), at: Date.now() });
      await redis.sadd("users", id);
      return send(res, 200, { ok: true });
    }
    case "resetPassword": {
      const u = await getUser(b.id);
      if (!u) return bad(res, "המשתמש לא נמצא", 404);
      if (!isAdmin && (u.org !== me.org || u.role === "admin")) return bad(res, "אין הרשאה", 403);
      if (!b.password || String(b.password).length < 6) return bad(res, "סיסמה של 6 תווים לפחות");
      await redis.set(`user:${b.id}`, { ...u, ...hashPassword(b.password) });
      return send(res, 200, { ok: true });
    }
    case "deleteUser": {
      const u = await getUser(b.id);
      if (!u) return bad(res, "המשתמש לא נמצא", 404);
      if (b.id === me.id) return bad(res, "אי אפשר למחוק את עצמך");
      if (!isAdmin && (u.org !== me.org || u.role !== "member")) return bad(res, "אין הרשאה", 403);
      await redis.del(`user:${b.id}`);
      await redis.srem("users", b.id);
      const projects = await getMany("project", "projects");
      for (const p of projects.filter((p) => (p.members || []).includes(b.id))) {
        const { id, ...rest } = p;
        await redis.set(`project:${id}`, { ...rest, members: rest.members.filter((m) => m !== b.id) });
      }
      return send(res, 200, { ok: true });
    }

    /* ----- projects ----- */
    case "createProject": {
      const id = slug(b.id), name = String(b.name || "").trim() || id;
      const org = isAdmin ? slug(b.org) : me.org;
      if (!validId(id)) return bad(res, "מזהה באנגלית: אותיות, ספרות ומקף");
      if (!(await getOrg(org))) return bad(res, "צריך לבחור ארגון קיים");
      if (!canManageOrg(me, org)) return bad(res, "אין הרשאה", 403);
      if (await getProject(id)) return bad(res, "המזהה הזה כבר תפוס");
      const members = await validMembers(b.members, org);
      await redis.set(`project:${id}`, { name, org, members, at: Date.now() });
      await redis.sadd("projects", id);
      return send(res, 200, { ok: true });
    }
    case "setMembers": {
      const p = await getProject(b.id);
      if (!p) return bad(res, "הפרויקט לא נמצא", 404);
      if (!canManageOrg(me, p.org)) return bad(res, "אין הרשאה", 403);
      await redis.set(`project:${b.id}`, { ...p, members: await validMembers(b.members, p.org) });
      return send(res, 200, { ok: true });
    }
    case "renameProject": {
      const p = await getProject(b.id);
      if (!p) return bad(res, "הפרויקט לא נמצא", 404);
      if (!canManageOrg(me, p.org)) return bad(res, "אין הרשאה", 403);
      await redis.set(`project:${b.id}`, { ...p, name: String(b.name || "").trim() || p.name });
      return send(res, 200, { ok: true });
    }
    case "deleteProject": {
      const p = await getProject(b.id);
      if (!p) return bad(res, "הפרויקט לא נמצא", 404);
      if (!canManageOrg(me, p.org)) return bad(res, "אין הרשאה", 403);
      await redis.del(`project:${b.id}`, `cells:${b.id}`);
      await redis.srem("projects", b.id);
      return send(res, 200, { ok: true });
    }
  }
  return bad(res, "פעולה לא מוכרת");
}

async function validMembers(list, org) {
  const ids = [...new Set((Array.isArray(list) ? list : []).map(slug))];
  const users = await Promise.all(ids.map(getUser));
  return ids.filter((id, i) => users[i] && users[i].org === org && users[i].role !== "admin");
}
