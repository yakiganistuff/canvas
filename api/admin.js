import { redis, send, bad, body, slug, validId, validUserId, makePassword, makeId, requireUser, getUser, getOrg, getProject, getMany, hashPassword, canManageOrg } from "./_lib.js";

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
      const name = String(b.name || "").trim();
      if (!name) return bad(res, "צריך שם לארגון");
      let id = makeId(b.id || name, "org");
      if (await getOrg(id)) id = makeId("", id);
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
      if (!validUserId(id)) return bad(res, "שם המשתמש צריך להיות כתובת מייל תקינה");
      if (b.password && String(b.password).length < 6) return bad(res, "סיסמה של 6 תווים לפחות");
      if (!["member", "manager", "admin"].includes(role)) return bad(res, "תפקיד לא מוכר");
      if (!isAdmin && role === "admin") return bad(res, "אין הרשאה", 403);
      const org = role === "admin" ? "" : (isAdmin ? slug(b.org) : me.org);
      if (role !== "admin" && !(await getOrg(org))) return bad(res, "צריך לבחור ארגון קיים");
      if (await getUser(id)) return bad(res, "שם המשתמש הזה כבר תפוס");
      await redis.set(`user:${id}`, { name, role, org, ...hashPassword(b.password || makePassword()), at: Date.now() });
      await redis.sadd("users", id);
      return send(res, 200, { ok: true });
    }
    case "issuePassword": {
      // Creates a fresh password, stores only its hash, and returns it once so the page can open an email with it.
      const u = await getUser(b.id);
      if (!u) return bad(res, "המשתמש לא נמצא", 404);
      if (b.id === me.id) return bad(res, "את הסיסמה שלך לא שולחים מכאן");
      if (!isAdmin && (u.org !== me.org || u.role === "admin")) return bad(res, "אין הרשאה", 403);
      const password = makePassword();
      await redis.set(`user:${b.id}`, { ...u, ...hashPassword(password), sentAt: Date.now() });
      return send(res, 200, { id: b.id, name: u.name || b.id, password });
    }
    case "resetPassword": {
      const u = await getUser(b.id);
      if (!u) return bad(res, "המשתמש לא נמצא", 404);
      if (!isAdmin && (u.org !== me.org || u.role === "admin")) return bad(res, "אין הרשאה", 403);
      if (!b.password || String(b.password).length < 6) return bad(res, "סיסמה של 6 תווים לפחות");
      await redis.set(`user:${b.id}`, { ...u, ...hashPassword(b.password) });
      return send(res, 200, { ok: true });
    }
    case "importUsers": {
      // Bulk add: everyone is created as a regular user in one org. Existing usernames are skipped, never overwritten.
      const org = isAdmin ? slug(b.org) : me.org;
      if (!(await getOrg(org))) return bad(res, "צריך לבחור ארגון קיים");
      const rows = Array.isArray(b.users) ? b.users.slice(0, 500) : [];
      if (!rows.length) return bad(res, "הרשימה ריקה");
      const created = [], skipped = [], seen = new Set();
      for (const r of rows) {
        const id = slug(r && r.id), password = String((r && r.password) || "") || makePassword(), name = String((r && r.name) || "").trim() || id;
        if (!validUserId(id)) { skipped.push({ id: String(r && r.id || ""), reason: "מייל לא תקין" }); continue; }
        if (seen.has(id)) { skipped.push({ id, reason: "מופיע פעמיים ברשימה" }); continue; }
        seen.add(id);
        if (password.length < 6) { skipped.push({ id, reason: "סיסמה קצרה מ־6 תווים" }); continue; }
        if (await getUser(id)) { skipped.push({ id, reason: "כבר קיים" }); continue; }
        await redis.set(`user:${id}`, { name, role: "member", org, ...hashPassword(password), at: Date.now() });
        await redis.sadd("users", id);
        created.push(id);
      }
      return send(res, 200, { ok: true, created, skipped });
    }
    case "setRole": {
      const u = await getUser(b.id);
      if (!u) return bad(res, "המשתמש לא נמצא", 404);
      if (b.id === me.id) return bad(res, "אי אפשר לשנות את התפקיד של עצמך");
      const role = b.role;
      if (!["member", "manager", "admin"].includes(role)) return bad(res, "תפקיד לא מוכר");
      if (!isAdmin && (u.org !== me.org || u.role === "admin" || role === "admin")) return bad(res, "אין הרשאה", 403);
      // org: admins have none; otherwise keep the current org unless an admin moves the user
      let org = role === "admin" ? "" : (isAdmin && b.org ? slug(b.org) : u.org);
      if (role !== "admin" && !(await getOrg(org))) return bad(res, "צריך לבחור ארגון למשתמש הזה");
      await redis.set(`user:${b.id}`, { ...u, role, org });
      if (org !== u.org) {
        // leaving an org also removes the user from that org's projects
        const projects = await getMany("project", "projects");
        for (const p of projects.filter((p) => p.org !== org && (p.members || []).includes(b.id))) {
          const { id, ...rest } = p;
          await redis.set(`project:${id}`, { ...rest, members: rest.members.filter((m) => m !== b.id) });
        }
      }
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
      const name = String(b.name || "").trim();
      if (!name) return bad(res, "צריך שם לפרויקט");
      const org = isAdmin ? String(b.org || "") : me.org;
      let id = makeId(b.id || name, "p");
      if (!(await getOrg(org))) return bad(res, "צריך לבחור ארגון קיים");
      if (!canManageOrg(me, org)) return bad(res, "אין הרשאה", 403);
      if (await getProject(id)) id = makeId("", id);
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
      const coachKeys = (await redis.smembers(`coachkeys:${b.id}`)) || [];
      await redis.del(`project:${b.id}`, `cells:${b.id}`, `coachkeys:${b.id}`, ...coachKeys);
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
