import { send, requireUser, publicUser } from "./_lib.js";

export default async function handler(req, res) {
  const me = await requireUser(req, res);
  if (!me) return;
  send(res, 200, { me: publicUser(me) });
}
