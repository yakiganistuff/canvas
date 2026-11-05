import { redis, send, bad, body, slug, getUser, checkPassword, hashPassword, setSession, publicUser } from "./_lib.js";

// POST {username, password}
// First run: if ADMIN_USERNAME / ADMIN_PASSWORD are set and that admin does not exist yet,
// signing in with them creates the admin account.
export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, "Method not allowed", 405);
  const { username, password } = body(req);
  const id = slug(username);
  if (!id || !password) return bad(res, "שם המשתמש או הסיסמה לא נכונים", 401);

  let user = await getUser(id);
  if (!user && id === slug(process.env.ADMIN_USERNAME) && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    user = { name: process.env.ADMIN_NAME || id, role: "admin", org: "", ...hashPassword(password), at: Date.now() };
    await redis.set(`user:${id}`, user);
    await redis.sadd("users", id);
  }
  if (!user || !checkPassword(password, user)) return bad(res, "שם המשתמש או הסיסמה לא נכונים", 401);

  await setSession(res, id);
  send(res, 200, { me: publicUser({ id, ...user }) });
}
