import { redis, send, requireUser, getMany, canSee, publicUser } from "./_lib.js";

const BLOCKS = ["name","lead","why","scope","aud","kpi","success","hr_struct","hr_proc","hr_mind","needs","gives","tension","timeline"];

function filled(v) {
  if (v == null) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.some(filled);
  if (typeof v === "object") return Object.values(v).some(filled);
  return false;
}

// GET: the projects this user may see, with progress, plus orgs and (for admins/managers) users.
export default async function handler(req, res) {
  const me = await requireUser(req, res);
  if (!me) return;

  const [allProjects, allOrgs] = await Promise.all([getMany("project", "projects"), getMany("org", "orgs")]);
  const projects = allProjects.filter((p) => canSee(me, p));

  const cellSets = await Promise.all(projects.map((p) => redis.hgetall(`cells:${p.id}`)));
  projects.forEach((p, i) => {
    const cs = cellSets[i] || {};
    p.filled = BLOCKS.filter((k) => cs[k] && filled(cs[k].v)).length;
    p.total = BLOCKS.length;
    p.iname = cs.name?.v || "";
    p.lead = cs.lead?.v || "";
    p.at = Math.max(0, ...Object.values(cs).map((c) => c?.at || 0));
  });

  const orgs = {};
  allOrgs
    .filter((o) => me.role === "admin" || o.id === me.org)
    .forEach((o) => (orgs[o.id] = { id: o.id, name: o.name, context: me.role === "member" ? undefined : o.context || "" }));

  let users = [];
  if (me.role === "admin" || me.role === "manager") {
    const all = await getMany("user", "users");
    users = all.filter((u) => me.role === "admin" || u.org === me.org).map(publicUser);
  }
  send(res, 200, { me: publicUser(me), projects, orgs, users });
}
