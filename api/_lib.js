// Shared server helpers: storage, passwords, sessions, permissions.
// Files starting with "_" inside /api are not exposed as routes by Vercel.
import { Redis } from "@upstash/redis";
import crypto from "node:crypto";

export let redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});
/** Test hook: swap the store for an in-memory one. */
export function __setStore(store) { redis = store; }

/* ---------- small http helpers ---------- */
export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}
export const bad = (res, msg, status = 400) => send(res, status, { error: msg });
export function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}
export const validId = (s) => typeof s === "string" && /^[a-z0-9][a-z0-9\-_]{1,39}$/.test(s);
export const slug = (s) => String(s || "").trim().toLowerCase();

/* ---------- passwords ---------- */
export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 32).toString("hex");
  return { salt, hash };
}
export function checkPassword(password, user) {
  if (!user || !user.salt || !user.hash) return false;
  const { hash } = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.hash, "hex"));
}

/* ---------- sessions (signed cookie) ---------- */
const COOKIE = "lc_s";
const DAYS = 14;
function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET is missing or too short");
  return s;
}
const sign = (data) => crypto.createHmac("sha256", secret()).update(data).digest("base64url");
export function setSession(res, userId) {
  const payload = Buffer.from(JSON.stringify({ u: userId, exp: Date.now() + DAYS * 864e5 })).toString("base64url");
  const value = `${payload}.${sign(payload)}`;
  res.setHeader("Set-Cookie", `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DAYS * 86400}`);
}
export function clearSession(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}
function readSession(req) {
  const raw = (req.headers.cookie || "").split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  if (!raw) return null;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return exp > Date.now() ? u : null;
  } catch { return null; }
}

/* ---------- data access ---------- */
export const getUser = async (id) => (id ? await redis.get(`user:${id}`) : null);
export const getOrg = async (id) => (id ? await redis.get(`org:${id}`) : null);
export const getProject = async (id) => (id ? await redis.get(`project:${id}`) : null);
export async function getMany(prefix, setKey) {
  const ids = (await redis.smembers(setKey)) || [];
  if (!ids.length) return [];
  const vals = await redis.mget(...ids.map((i) => `${prefix}:${i}`));
  return ids.map((id, i) => (vals[i] ? { id, ...vals[i] } : null)).filter(Boolean);
}
export const publicUser = (u) => u && ({ id: u.id, name: u.name, role: u.role, org: u.org || "" });

/** Returns the signed-in user (with id) or sends 401 and returns null. */
export async function requireUser(req, res) {
  let id = null;
  try { id = readSession(req); } catch (e) { bad(res, "השרת לא מוגדר עד הסוף (SESSION_SECRET)", 500); return null; }
  const u = id ? await getUser(id) : null;
  if (!u) { bad(res, "צריך להתחבר", 401); return null; }
  return { id, ...u };
}

/* ---------- permissions ---------- */
export function canSee(me, p) {
  if (!me || !p) return false;
  if (me.role === "admin") return true;
  if (me.role === "manager") return p.org === me.org;
  return (p.members || []).includes(me.id);
}
export const canManageOrg = (me, orgId) => me.role === "admin" || (me.role === "manager" && me.org === orgId);
