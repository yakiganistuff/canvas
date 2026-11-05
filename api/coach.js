import Anthropic from "@anthropic-ai/sdk";
import { bad, body, requireUser, getProject, getOrg, canSee } from "./_lib.js";

const MODEL = process.env.COACH_MODEL || "claude-sonnet-5-5";

// POST {project, prompt}: streams the coach's answer as plain text.
// The page builds the canvas part of the prompt; the org context is added here, from the database.
export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, "Method not allowed", 405);
  const me = await requireUser(req, res);
  if (!me) return;
  if (!process.env.ANTHROPIC_API_KEY) return bad(res, "המאמן עוד לא הוגדר (חסר ANTHROPIC_API_KEY)", 503);

  const { project, prompt } = body(req);
  const p = await getProject(String(project || ""));
  if (!p || !canSee(me, p)) return bad(res, "אין לכן גישה לפרויקט הזה", 404);
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 40000) return bad(res, "בקשה לא תקינה");

  const org = await getOrg(p.org);
  const system = `אתה מאמן אסטרטגי בסדנה של STUFF עם הנהלת משאבי אנוש בארגון "${org?.name || p.org}". כל משתתפת ממלאת קנבס אחד ליוזמה (מנוף) שלה, כדי להפוך אותה לפרויקט ביצוע עם בעלות, מדדים, חיבורים ולוח זמנים עד 2030.
${org?.context ? "הקשר על הארגון והאסטרטגיה:\n" + org.context + "\n" : ""}איך לדבר: עברית, פנייה בלשון נקבה רבים (אתן, כתבתן). ישיר, חם, מאתגר ולא מתנשא. קצר: עד 130 מילים. בלי כותרות, בלי הדגשות markdown ובלי הקדמות. אל תחזור על מה שכתוב.
עקרונות: דרוש נתונים ולא הצהרות. העדף ספציפי על כללי. אל תמציא נתונים או מקורות; אם אינך בטוח, כתוב "הערכה, לאמת". שאל לכל היותר שאלה אחת בסוף, אלא אם התבקשת לשאול כמה.`;

  const client = new Anthropic();
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1200,
      system,
      messages: [{ role: "user", content: prompt }],
    });
    stream.on("text", (t) => res.write(t));
    await stream.finalMessage();
  } catch (e) {
    res.write("\n\n[המאמן לא הצליח לענות כרגע. נסו שוב בעוד רגע.]");
    console.error("coach error", e?.status, e?.message);
  }
  res.end();
}
