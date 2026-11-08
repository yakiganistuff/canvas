(() => {
"use strict";
document.documentElement.lang = "he";
document.documentElement.dir = "rtl";

/* ---------------- canvas definition ---------------- */
const KPI_ROWS = ["KPI 1","KPI 2","KBI 1","KBI 2"];
const KPI_COLS = [["name","שם המדד"],["base","בסיס"],["bench","בנצ׳מרק"],["y27","2027"],["y30","2030"]];
const TL_COLS = ["H1 2027","H2 2027","2028","2029","2030"];
const TL_ROWS = [["stage","שלב"],["output","תוצר"],["meet","נקודת מפגש"]];
const B = {
  name:{label:"שם היוזמה", sec:"כותרת", type:"line", hint:"שם קצר שכל אחת בארגון תבין",
    coach:"שם טוב הוא הבטחה. בדוק שהוא מתאר תוצאה ולא פעילות, שהוא קצר ושהוא מתחבר לאסטרטגיה."},
  lead:{label:"מוביל/ה", sec:"כותרת", type:"line", hint:"אדם אחד שהיוזמה על שמו",
    coach:"צריך שם של אדם אחד, לא פורום ולא צוות. אם כתובים שניים, שאל מי מחליטה כשיש מחלוקת."},
  why:{label:"למה עכשיו", sec:"הסיפור", type:"text", hint:"הנתון מהאבחון שמצדיק את היוזמה",
    coach:"דרוש נתון אמיתי (מספר, מגמה, ציטוט מהאבחון) ולא הצהרה. שאל מה יקרה אם לא נעשה כלום ב-12 החודשים הקרובים."},
  scope:{label:"גבולות גזרה", sec:"הסיפור", type:"fields", fields:[["in","אחראי על"],["out","לא אחראי על"]], hint:"אחראי על · לא אחראי על",
    coach:"החלק החשוב הוא 'לא אחראי על'. אם הוא ריק או כללי, דחוף לכתוב לפחות שני דברים קונקרטיים שהיוזמה לא תעשה ושיכולים להתבלבל איתה."},
  aud:{label:"במי זה נוגע", sec:"הסיפור", type:"text", hint:"מיפוי כל הקהלים",
    coach:"בדוק שהמיפוי כולל קהלים ישירים ועקיפים, מנהלים, עובדים, HR עצמו, ושותפים. שאל מי עלול להפסיד מהיוזמה ולהתנגד לה."},
  kpi:{label:"המדידה", sec:"המדידה", type:"kpi", hint:"שני KPIs (מדדי תוצאה) ושני KBIs (מדדי התנהגות), עם בסיס, בנצ׳מרק ויעדים",
    coach:"הבחן בין KPI, מדד תוצאה (מה השתנה בארגון), לבין KBI, מדד התנהגות (אילו התנהגויות של מנהלים ועובדים צריכות להשתנות ואיך נראה שהן משתנות). KBI טוב מתאר התנהגות נצפית ונמדדת, לא תחושה. כל מדד צריך בסיס ידוע, בנצ׳מרק עם מקור, ויעדים שאפתניים אך אפשריים. אם אין בסיס, זו משימה ראשונה."},
  success:{label:"תמונת הצלחה 2030", sec:"המדידה", type:"text", hint:"מה יראו, ישמעו וימדדו בארגון, במשפט אחד",
    coach:"משפט אחד בלבד, מוחשי, שאפשר לצלם או לשמוע. אם זה נשמע כמו סיסמה, בקש דוגמה של רגע ספציפי ב-2030."},
  needs:{label:"צריך מ־", sec:"החיבורים", type:"fields", fields:[["what","מה ומאיזו יוזמה"],["when","עד מתי"]], hint:"מה · עד מתי",
    coach:"כל תלות צריכה שם של יוזמה או גורם, מה בדיוק נדרש, ותאריך. שאל אם הצד השני יודע על זה."},
  gives:{label:"נותן ל־", sec:"החיבורים", type:"fields", fields:[["what","מה ולאיזו יוזמה"],["when","עד מתי"]], hint:"מה · עד מתי",
    coach:"מה היוזמה מספקת ליוזמות אחרות. בדוק שזה תוצר ולא כוונה, ושיש תאריך."},
  tension:{label:"מתח עם", sec:"החיבורים", type:"text", hint:"איפה ההצלחה מקשה על יוזמה אחרת",
    coach:"זו קוביה שקל להשאיר ריקה. דחוף בעדינות: על איזה משאב, קשב או זמן של מנהלים היוזמה מתחרה?"},
  hr_struct:{label:"מבנה", sec:"השינוי ב־HR", type:"text", hint:"איזה תפקיד, צוות או יכולת ב־HR צריכים לקום, להשתנות או להיעלם",
    coach:"שאל מה צריך להיעלם, לא רק מה להוסיף. יכולת חדשה בלי תקן או בלי בעלים היא משאלה."},
  hr_proc:{label:"תהליכים", sec:"השינוי ב־HR", type:"text", hint:"איזה תהליך HR צריך להשתנות כדי שזה יעבוד",
    coach:"בקש תהליך ספציפי עם שם (גיוס, הערכה, תגמול, קליטה וכו'). מה בדיוק משתנה בו ומי מרגיש את השינוי."},
  hr_mind:{label:"תפיסות", sec:"השינוי ב־HR", type:"fields", fields:[["from","מ־"],["to","ל־"]], hint:"איזו אמונה ב־HR צריכה להשתנות: מ־... ל־...",
    coach:"זו הקוביה הקשה. בדוק שה'מ־' הוא אמונה אמיתית שאנשים מחזיקים בה היום ולא איש קש. שאל איזו אמונה צריכה למות כדי שהיוזמה תצליח."},
  timeline:{label:"לוח זמנים", sec:"לוח זמנים", type:"timeline", hint:"שלב, תוצר ונקודת מפגש לכל תקופה",
    coach:"כל שלב צריך להסתיים בתוצר מוחשי ולא בפעילות. בדוק שנקודות המפגש תואמות את 'צריך מ־' ו'נותן ל־', ושהשנה הראשונה מפורטת יותר מהאחרונות."}
};
const ORDER = ["name","lead","why","scope","aud","kpi","success","hr_struct","hr_proc","hr_mind","needs","gives","tension","timeline"];
const ROLE_LABEL = { admin:"אדמין", manager:"מנהלת", member:"משתמשת" };

/* ---------------- state ---------------- */
const sample = true; // the coach runs on the server
let me = null;               // {id, name, role, org}
let orgs = {};               // id -> {name, context}
let project = null;          // {id, name, org, members}
let cells = {};
let unsub = null;
let mgmtTab = "projects";
const app = document.getElementById("app");

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ls = {
  get(k){ try{ return localStorage.getItem(k) }catch(e){ return null } },
  set(k,v){ try{ localStorage.setItem(k,v) }catch(e){} },
  del(k){ try{ localStorage.removeItem(k) }catch(e){} }
};
async function sha(s){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,"0")).join("");
}
const passHash = (u, p) => sha(u + "::" + p);
function toast(msg){
  const t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2000);
}
const slug = s => String(s||"").trim().toLowerCase();
const validId = s => /^[a-z0-9][a-z0-9\-_]{1,39}$/.test(s);
const timeStr = ms => { try{ return new Date(ms).toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"}) }catch(e){ return "" } };
const dateStr = ms => { try{ return new Date(ms).toLocaleDateString("he-IL",{day:"numeric",month:"numeric"}) + " " + timeStr(ms) }catch(e){ return "" } };
const rand = () => Math.random().toString(36).slice(2, 8);
const docs = snap => snap.docs.map(d => ({ id: d.id, ...d.data() }));

/* ---------------- value helpers ---------------- */
function emptyVal(k){
  const t = B[k].type;
  if (t === "fields") return Object.fromEntries(B[k].fields.map(f => [f[0], ""]));
  if (t === "kpi") return KPI_ROWS.map(() => ({name:"",base:"",bench:"",y27:"",y30:""}));
  if (t === "timeline") return Object.fromEntries(TL_ROWS.map(r => [r[0], TL_COLS.map(() => "")]));
  return "";
}
const getVal = k => (cells[k] && cells[k].v !== undefined) ? cells[k].v : emptyVal(k);
function isEmpty(k, v){
  const t = B[k].type;
  if (t === "fields") return Object.values(v||{}).every(x => !String(x||"").trim());
  if (t === "kpi") return (v||[]).every(r => Object.values(r||{}).every(x => !String(x||"").trim()));
  if (t === "timeline") return Object.values(v||{}).every(a => (a||[]).every(x => !String(x||"").trim()));
  return !String(v||"").trim();
}
function asText(k, v){
  const t = B[k].type;
  if (isEmpty(k, v)) return "(ריק)";
  if (t === "fields") return B[k].fields.map(([f,l]) => `${l}: ${v[f]||"—"}`).join("\n");
  if (t === "kpi") return v.map((r,i) => `${KPI_ROWS[i]}: ${r.name||"—"} | בסיס ${r.base||"—"} | בנצ׳מרק ${r.bench||"—"} | 2027 ${r.y27||"—"} | 2030 ${r.y30||"—"}`).join("\n");
  if (t === "timeline") return TL_ROWS.map(([r,l]) => `${l}: ` + TL_COLS.map((c,i) => `${c}: ${(v[r]||[])[i]||"—"}`).join(" | ")).join("\n");
  return String(v);
}

/* ---------------- permissions (who sees what) ---------------- */
const isAdmin = () => me && me.role === "admin";
const isManager = () => me && me.role === "manager";
function canSee(p){
  if (!me || !p) return false;
  if (isAdmin()) return true;
  if (isManager()) return p.org === me.org;
  return (p.members || []).includes(me.id);
}


/* ---------------- server calls ---------------- */
async function api(path, data){
  const opts = data === undefined ? { credentials: "same-origin" }
    : { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
  let r;
  try{ r = await fetch(path, opts); }catch(e){ throw new Error("אין חיבור לשרת. בדקו את האינטרנט ונסו שוב."); }
  let j = {}; try{ j = await r.json(); }catch(e){}
  if (r.status === 401 && path !== "/api/login"){ me = null; renderLogin(); throw new Error("צריך להתחבר מחדש"); }
  if (!r.ok) throw new Error(j.error || "משהו השתבש. נסו שוב.");
  return j;
}
const LOGO = `<img class="logo logo-light" src="/logo.png" alt="STUFF"><img class="logo logo-dark" src="/logo-dark.png" alt="STUFF">`;

/* ---------------- boot ---------------- */
async function boot(){
  app.innerHTML = `<div class="login"><div class="login-card">${LOGO}<p>טוען…</p></div></div>`;
  try{ const j = await api("/api/me"); me = j.me; goHome(); }
  catch(e){ if (!me) renderLogin(); }
}

/* ---------------- login ---------------- */
function renderLogin(err){
  if (unsub){ clearInterval(unsub); unsub = null; }
  app.innerHTML = `
  <div class="login"><form class="login-card" id="loginForm" autocomplete="on">
    ${LOGO}
    <p>כניסה עם המייל והסיסמה שקיבלתן.</p>
    <div class="field"><label for="lgName">מייל</label><input class="input" id="lgName" name="username" autocomplete="username" inputmode="email" dir="ltr" autocapitalize="off" spellcheck="false"></div>
    <div class="field"><label for="lgPass">סיסמה</label><input class="input" id="lgPass" name="password" autocomplete="current-password" type="password" dir="ltr"></div>
    <div class="err" id="lgErr">${esc(err||"")}</div>
    <button class="btn" type="submit" id="lgBtn">כניסה</button>
  </form></div>`;
  document.getElementById("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = document.getElementById("lgBtn"); btn.disabled = true;
    try{
      const j = await api("/api/login", { username: document.getElementById("lgName").value, password: document.getElementById("lgPass").value });
      me = j.me; goHome();
    }catch(err){ document.getElementById("lgErr").textContent = err.message; btn.disabled = false; }
  });
}
async function logout(){
  try{ await api("/api/logout", {}); }catch(e){}
  me = null; project = null; cells = {}; renderLogin();
}

/* ---------------- home: project list ---------------- */
let projCache = [], userCache = [];
async function goHome(){
  if (unsub){ clearInterval(unsub); unsub = null; }
  project = null; cells = {};
  app.innerHTML = `<div class="wrap"><p class="status">טוען פרויקטים…</p></div>`;
  try{
    const j = await api("/api/projects");
    me = j.me; projCache = j.projects; orgs = j.orgs || {}; userCache = j.users || [];
  }catch(e){
    if (me) app.innerHTML = `<div class="wrap"><div class="emptybox">${esc(e.message)}</div></div>`;
    return;
  }
  renderHome();
}
function userName(id){ const u = userCache.find(x => x.id === id); return u ? (u.name || u.id) : id; }
function cardHtml(p){
  const pct = Math.round((p.filled||0) / (p.total||ORDER.length) * 100);
  const who = p.lead ? `מוביל/ה: ${p.lead}` : ((p.members||[]).length && (isAdmin()||isManager()) ? (p.members||[]).map(userName).join(", ") : "");
  return `<button class="pcard" data-p="${esc(p.id)}">
    <div class="pid">${esc(p.name || p.id)}</div>
    <div class="iname ${p.iname?"":"empty"}">${esc(p.iname || "יוזמה ללא שם עדיין")}</div>
    <div class="who">${esc(who)}</div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <div class="prow"><span>${p.filled||0}/${p.total||ORDER.length} קוביות</span><span>${p.at ? "עודכן " + dateStr(p.at) : ""}</span></div>
  </button>`;
}
function renderHome(){
  const groups = {};
  projCache.forEach(p => (groups[p.org] = groups[p.org] || []).push(p));
  const orgIds = Object.keys(groups).sort((a,b) => (orgs[a]?.name||a).localeCompare(orgs[b]?.name||b, "he"));
  const title = isAdmin() ? "כל הארגונים" : isManager() ? `כל הפרויקטים של ${orgs[me.org]?.name || me.org}` : "הפרויקטים שלי";
  app.innerHTML = `
  <div class="wrap">
    <div class="topbar" style="margin:0">
      ${LOGO}
      <div class="sp"></div>
      <div class="proj"><span class="role ${me.role}">${ROLE_LABEL[me.role]||me.role}</span> ${esc(me.name || me.id)}</div>
      <button class="btn ghost small" id="outBtn">יציאה</button>
    </div>
    <div class="hello"><h1>${esc(title)}</h1><p>${projCache.length ? "בחרו פרויקט כדי לפתוח את הקנבס שלו." : ""}</p></div>
    ${projCache.length ? orgIds.map(o => `
      <section>
        ${isAdmin() ? `<h2 class="orgh">${esc(orgs[o]?.name || o)} <span class="meta">${groups[o].length} פרויקטים</span></h2>` : ""}
        <div class="cards">${groups[o].sort((a,b)=>(a.name||a.id).localeCompare(b.name||b.id,"he")).map(cardHtml).join("")}</div>
      </section>`).join("")
    : `<div class="emptybox">${isAdmin() ? "עדיין אין פרויקטים. צרו ארגון, משתמשים ופרויקט בניהול למטה." : isManager() ? "עדיין אין פרויקטים בארגון. המנחה יפתח אותם." : "עדיין לא שויכתן לפרויקט. בקשו מהמנחה לשייך אתכן."}</div>`}
    ${isAdmin() ? mgmtHtml() : ""}
  </div>`;
  document.getElementById("outBtn").onclick = logout;
  app.querySelectorAll(".pcard[data-p]").forEach(el => el.onclick = () => openProject(el.dataset.p));
  if (isAdmin()) wireMgmt();
}

/* ---------------- management ---------------- */
function orgOptions(sel){
  return Object.values(orgs).sort((a,b)=>(a.name||"").localeCompare(b.name||"","he"))
    .map(o => `<option value="${esc(o.id)}" ${o.id===sel?"selected":""}>${esc(o.name||o.id)}</option>`).join("");
}
function mgmtHtml(){
  const tabs = [["projects","פרויקטים"],["users","משתמשים"]].concat(isAdmin() ? [["orgs","ארגונים"]] : []);
  if (!tabs.find(t => t[0] === mgmtTab)) mgmtTab = "projects";
  return `<section class="mgmt">
    <h2>ניהול</h2>
    <div class="tabs" role="tablist">${tabs.map(([k,l]) => `<button class="tab" role="tab" data-tab="${k}" aria-selected="${k===mgmtTab}">${l}</button>`).join("")}</div>
    <div id="mgmtBody">${mgmtTab === "projects" ? projectsPane() : mgmtTab === "users" ? usersPane() : orgsPane()}</div>
  </section>`;
}
function membersChecks(orgId, selected, name){
  const us = userCache.filter(u => u.org === orgId && u.role !== "admin");
  if (!us.length) return `<span class="meta">אין עדיין משתמשים בארגון הזה</span>`;
  return us.map(u => `<label class="ck"><input type="checkbox" name="${esc(name)}" value="${esc(u.id)}" ${selected.includes(u.id)?"checked":""}> ${esc(u.name||u.id)}</label>`).join("");
}
function projectsPane(){
  const defOrg = isAdmin() ? (Object.keys(orgs)[0] || "") : me.org;
  const all = [...projCache].sort((a,b) => (a.org+a.id).localeCompare(b.org+b.id));
  return `<div class="list">
    <form class="formrow" id="npForm">
      <div class="field"><label for="npName">שם הפרויקט</label><input class="input" id="npName" placeholder="מנוף הכישרונות"></div>
      ${isAdmin() ? `<div class="field"><label for="npOrg">ארגון</label><select class="input" id="npOrg">${orgOptions(defOrg)}</select></div>` : ""}
      <button class="btn small" type="submit">יצירת פרויקט</button>
      <div style="flex-basis:100%"><div class="meta" style="margin-bottom:6px">שיוך משתמשות</div><div class="checks" id="npMembers">${membersChecks(defOrg, [], "npm")}</div></div>
    </form>
    ${all.map(p => `<div class="item" data-pid="${esc(p.id)}">
      <div class="top"><b>${esc(p.name||p.id)}</b><span class="meta" dir="ltr">${esc(p.id)}</span>${isAdmin()?`<span class="pill">${esc(orgs[p.org]?.name||p.org)}</span>`:""}<span class="sp"></span>
        <button class="btn ghost small" data-act="saveMembers">שמירת שיוך</button>
        <button class="btn danger small" data-act="delProject">מחיקה</button></div>
      <div class="checks">${membersChecks(p.org, p.members||[], "m_"+p.id)}</div>
    </div>`).join("")}
  </div>`;
}
let importText = "", importRows = [], importOrg = "", importResult = "", importOpen = false;
let lastIssued = null; // {id, name, password}: shown once, in memory only
const canSend = u => u.id !== me.id && isEmailAddr(u.id) && (isAdmin() || u.role !== "admin");
const pendingSend = () => [...userCache].filter(u => canSend(u) && !u.sentAt).sort((a,b) => (a.name||a.id).localeCompare(b.name||b.id, "he"));
function sendControl(u){
  if (!canSend(u)) return "";
  return `<span class="inline">
    ${u.sentAt ? `<span class="meta">סיסמה נשלחה ${dateStr(u.sentAt)}</span>` : ""}
    <button class="btn ${u.sentAt ? "ghost" : ""} small" data-act="sendPw" title="יוצר סיסמה חדשה ופותח מייל מוכן לשליחה">${u.sentAt ? "שליחה מחדש" : "שליחת סיסמה"}</button>
  </span>`;
}
function mailFor(rec){
  const site = location.origin;
  const subject = "פרטי הכניסה לקנבס המנופים · STUFF";
  const body = [`שלום ${rec.name},`, "", "אלה פרטי הכניסה שלך לקנבס המנופים:", "",
    `כתובת: ${site}`, `מייל: ${rec.id}`, `סיסמה: ${rec.password}`, "",
    "אחרי הכניסה יופיעו הפרויקטים שלך. לחיצה כפולה על קוביה בקנבס פותחת אותה לכתיבה, ובתוך כל קוביה יש כפתור \"המאמן\" שעוזר לחדד.", "",
    "נתראה,", me.name || "STUFF"].join("\r\n");
  return `mailto:${rec.id}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function openMail(rec){
  const a = document.createElement("a"); a.href = mailFor(rec); a.style.display = "none";
  document.body.appendChild(a); a.click(); a.remove();
}
async function issueAndMail(id){
  try{
    const r = await api("/api/admin", { action: "issuePassword", id });
    lastIssued = r;
    const u = userCache.find(x => x.id === id); if (u) u.sentAt = Date.now();
    openMail(r);
    mgmtTab = "users"; renderHome();
    document.querySelector(`.item[data-uid="${CSS.escape(id)}"]`)?.scrollIntoView({ block: "center" });
    toast("נפתח מייל מוכן. נשאר רק ללחוץ שליחה.");
  }catch(e){ toast(e.message); }
}
function roleControl(u){
  const editable = u.id !== me.id && (isAdmin() || u.role !== "admin");
  if (!editable) return `<span class="role ${u.role}">${ROLE_LABEL[u.role]||u.role}</span>${isAdmin() && u.org ? `<span class="pill">${esc(orgs[u.org]?.name||u.org)}</span>` : ""}`;
  const opts = isAdmin() ? [["member","משתמשת"],["manager","מנהלת"],["admin","אדמין"]] : [["member","משתמשת"],["manager","מנהלת"]];
  return `<span class="inline">
    <select class="input" id="role_${esc(u.id)}" data-act="role" aria-label="תפקיד של ${esc(u.name||u.id)}">${opts.map(([v,l]) => `<option value="${v}" ${v===u.role?"selected":""}>${l}</option>`).join("")}</select>
    ${isAdmin() ? `<select class="input" id="org_${esc(u.id)}" data-act="org" aria-label="ארגון של ${esc(u.name||u.id)}" ${u.role==="admin"?"hidden":""}><option value="">בחירת ארגון</option>${orgOptions(u.org)}</select>` : ""}
  </span>`;
}
function parseImport(text){
  const known = new Set(userCache.map(u => u.id)), seen = new Set();
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(line => {
    const parts = (line.includes("\t") ? line.split("\t") : line.split(",")).map(s => s.trim());
    const id = slugId(parts[0]), name = parts.slice(1).join(", ").trim();
    let err = "";
    if (!isEmailAddr(id)) err = "מייל לא תקין";
    else if (seen.has(id)) err = "מופיע פעמיים";
    else if (known.has(id)) err = "כבר קיים, ידולג";
    seen.add(id);
    return { id, name, err };
  });
}
const isEmailAddr = s => /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(s);
const slugId = s => String(s||"").trim().toLowerCase().replace(/\s+/g, "-");
function usersPane(){
  const defOrg = isAdmin() ? (Object.keys(orgs)[0] || "") : me.org;
  const list = [...userCache].sort((a,b) => ((a.org||"")+a.id).localeCompare((b.org||"")+b.id));
  const roleOpts = isAdmin() ? [["member","משתמשת"],["manager","מנהלת"],["admin","אדמין"]] : [["member","משתמשת"],["manager","מנהלת"]];
  return `<div class="list">
    <form class="formrow" id="nuForm" autocomplete="off">
      <div class="field"><label for="nuId">מייל</label><input class="input" id="nuId" type="email" dir="ltr" placeholder="dana@strauss.co.il"></div>
      <div class="field"><label for="nuName">שם לתצוגה</label><input class="input" id="nuName" placeholder="דנה כהן"></div>
      <div class="field"><label for="nuRole">תפקיד</label><select class="input" id="nuRole">${roleOpts.map(([v,l])=>`<option value="${v}">${l}</option>`).join("")}</select></div>
      ${isAdmin() ? `<div class="field"><label for="nuOrg">ארגון</label><select class="input" id="nuOrg">${orgOptions(defOrg)}</select></div>` : ""}
      <button class="btn small" type="submit">הוספת משתמש</button>
    </form>
    <details class="import" id="impBox" ${importOpen ? "open" : ""}>
      <summary>ייבוא רשימת משתמשים</summary>
      <div class="imp-body">
        <p class="meta">שורה לכל משתמש: <b>מייל, שם לתצוגה</b>. אפשר להפריד בפסיק או להדביק שתי עמודות מאקסל. הסיסמאות נוצרות אוטומטית ונשלחות בכפתור "שליחת סיסמה". כולם נוצרים כמשתמשים רגילים, ואת התפקיד משנים ברשימה למטה. מיילים שכבר קיימים מדולגים.</p>
        <textarea class="input" id="impText" dir="ltr" spellcheck="false" placeholder="dana@strauss.co.il, דנה כהן&#10;noa@strauss.co.il, נועה לוי">${esc(importText)}</textarea>
        <div class="r">
          ${isAdmin() ? `<div class="field"><label for="impOrg">ארגון</label><select class="input" id="impOrg">${orgOptions(importOrg || defOrg)}</select></div>` : ""}
          <button class="btn ghost small" type="button" id="impPreview">תצוגה מקדימה</button>
          <button class="btn small" type="button" id="impGo" ${importRows.some(r => !r.err) ? "" : "disabled"}>${(n => n === 1 ? "ייבוא משתמש אחד" : n ? `ייבוא ${n} משתמשים` : "ייבוא")(importRows.filter(r => !r.err).length)}</button>
        </div>
        ${importRows.length ? `<div class="tw"><table class="grid imp-table"><thead><tr><th>מייל</th><th>שם לתצוגה</th><th>סטטוס</th></tr></thead><tbody>
          ${importRows.map(r => `<tr class="${r.err ? "bad" : ""}"><td dir="ltr">${esc(r.id)}</td><td>${esc(r.name)}</td><td>${esc(r.err || "מוכן")}</td></tr>`).join("")}
        </tbody></table></div>` : ""}
        ${importResult ? `<div class="imp-result">${esc(importResult)}</div>` : ""}
      </div>
    </details>
    ${(n => n ? `<div class="queue"><span>${n === 1 ? "משתמש אחד עוד לא קיבל סיסמה" : `${n} משתמשים עוד לא קיבלו סיסמה`}</span><button class="btn small" id="sendNext">שליחה לבא בתור</button></div>` : "")(pendingSend().length)}
    ${list.map(u => `<div class="item" data-uid="${esc(u.id)}">
      <div class="top"><b>${esc(u.name||u.id)}</b><span class="meta" dir="ltr">${esc(u.id)}</span>
        ${roleControl(u)}<span class="sp"></span>
        ${u.id === me.id ? `<span class="meta">זה החשבון שלך</span>` : `
        ${(isAdmin() || u.role !== "admin") ? sendControl(u) : ""}
        ${(isAdmin() || u.role === "member") ? `<button class="btn danger small" data-act="delUser">מחיקה</button>` : ""}`}
      </div>${lastIssued && lastIssued.id === u.id ? `<div class="issued">
        <span>הסיסמה החדשה של ${esc(lastIssued.name)}:</span><code dir="ltr" id="issuedPw">${esc(lastIssued.password)}</code>
        <button class="btn ghost small" data-act="copyPw">העתקה</button><button class="btn ghost small" data-act="reopenMail">פתיחת המייל שוב</button>
        <span class="meta">מוצגת רק עכשיו. אחרי רענון הדף היא לא תופיע שוב.</span></div>` : ""}</div>`).join("")}
  </div>`;
}
function orgsPane(){
  return `<div class="list">
    <form class="formrow" id="noForm">
      <div class="field"><label for="noName">שם הארגון</label><input class="input" id="noName" placeholder="שטראוס"></div>
      <button class="btn small" type="submit">הוספת ארגון</button>
    </form>
    ${Object.values(orgs).map(o => `<div class="item" data-oid="${esc(o.id)}">
      <div class="top"><b>${esc(o.name||o.id)}</b><span class="meta" dir="ltr">${esc(o.id)}</span><span class="sp"></span>
        <button class="btn ghost small" data-act="saveOrg">שמירת הקשר</button></div>
      <div class="field"><label for="oc_${esc(o.id)}">הקשר למאמן: שם האסטרטגיה, היוזמות, נתונים ודגשים. המשתתפות לא רואות את זה.</label>
      <textarea class="input" id="oc_${esc(o.id)}" style="min-height:90px">${esc(o.context||"")}</textarea></div>
    </div>`).join("")}
  </div>`;
}
const armed = new Set();
function confirmTwice(btn, key){
  if (armed.has(key)) { armed.delete(key); return true; }
  armed.add(key); const old = btn.textContent; btn.textContent = "בטוח? לחצו שוב";
  setTimeout(() => { armed.delete(key); if (btn.isConnected) btn.textContent = old; }, 3000);
  return false;
}
async function act(data, okMsg, reload = true){
  try{ await api("/api/admin", data); toast(okMsg); if (reload) await goHome(); return true; }
  catch(e){ toast(e.message); return false; }
}
function wireMgmt(){
  app.querySelectorAll(".tab").forEach(t => t.onclick = () => { mgmtTab = t.dataset.tab; renderHome(); });
  const np = document.getElementById("npForm");
  if (np){
    const orgSel = document.getElementById("npOrg");
    if (orgSel) orgSel.onchange = () => { document.getElementById("npMembers").innerHTML = membersChecks(orgSel.value, [], "npm"); };
    np.addEventListener("submit", e => {
      e.preventDefault();
      act({ action: "createProject", name: document.getElementById("npName").value,
        org: orgSel ? orgSel.value : me.org, members: [...np.querySelectorAll('input[name="npm"]:checked')].map(i => i.value) }, "הפרויקט נוצר");
    });
  }
  app.querySelectorAll(".item[data-pid]").forEach(it => {
    const id = it.dataset.pid;
    it.querySelector('[data-act="saveMembers"]').onclick = () =>
      act({ action: "setMembers", id, members: [...it.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value) }, "השיוך נשמר");
    it.querySelector('[data-act="delProject"]').onclick = ev => { if (confirmTwice(ev.currentTarget, "p:"+id)) act({ action: "deleteProject", id }, "הפרויקט נמחק"); };
  });
  const nu = document.getElementById("nuForm");
  if (nu) nu.addEventListener("submit", e => {
    e.preventDefault(); mgmtTab = "users";
    act({ action: "createUser", id: document.getElementById("nuId").value, name: document.getElementById("nuName").value,
      role: document.getElementById("nuRole").value,
      org: document.getElementById("nuOrg") ? document.getElementById("nuOrg").value : me.org }, "המשתמש נוסף");
  });
  const sn = document.getElementById("sendNext");
  if (sn) sn.onclick = () => { const next = pendingSend()[0]; if (next) issueAndMail(next.id); };
  const impBox = document.getElementById("impBox");
  if (impBox){
    impBox.addEventListener("toggle", () => { importOpen = impBox.open; });
    const txt = document.getElementById("impText"), orgSel = document.getElementById("impOrg");
    txt.addEventListener("input", () => { importText = txt.value; });
    if (orgSel) orgSel.onchange = () => { importOrg = orgSel.value; };
    document.getElementById("impPreview").onclick = () => {
      importText = txt.value; importOrg = orgSel ? orgSel.value : me.org; importResult = "";
      importRows = parseImport(importText); mgmtTab = "users"; renderHome();
    };
    document.getElementById("impGo").onclick = async ev => {
      const ready = importRows.filter(r => !r.err);
      if (!ready.length) return;
      const btn = ev.currentTarget; btn.disabled = true; btn.textContent = "מייבא…";
      try{
        const j = await api("/api/admin", { action: "importUsers", org: orgSel ? orgSel.value : me.org,
          users: ready.map(r => ({ id: r.id, name: r.name })) });
        importResult = `נוספו ${j.created.length} משתמשים` + (j.skipped.length ? `. דולגו ${j.skipped.length}: ` + j.skipped.map(s => `${s.id} (${s.reason})`).join(", ") : ".");
        importText = ""; importRows = []; importOpen = true; mgmtTab = "users";
        toast(`נוספו ${j.created.length} משתמשים`);
        await goHome();
      }catch(e){ toast(e.message); btn.disabled = false; btn.textContent = "ייבוא"; }
    };
  }
  app.querySelectorAll(".item[data-uid]").forEach(it => {
    const id = it.dataset.uid;
    const rs = it.querySelector('[data-act="role"]'), os = it.querySelector('[data-act="org"]');
    const applyRole = async () => {
      const role = rs.value, org = os ? os.value : undefined;
      if (os) os.hidden = role === "admin";
      if (role !== "admin" && os && !org){ toast("בחרו ארגון למשתמש הזה"); os.focus(); return; }
      mgmtTab = "users";
      await act({ action: "setRole", id, role, org }, role === "admin" ? "התפקיד עודכן לאדמין" : role === "manager" ? "התפקיד עודכן למנהלת" : "התפקיד עודכן למשתמשת");
    };
    if (rs) rs.onchange = applyRole;
    if (os) os.onchange = applyRole;
    const sp = it.querySelector('[data-act="sendPw"]');
    if (sp) sp.onclick = ev => {
      const u = userCache.find(x => x.id === id);
      if (u && u.sentAt && !confirmTwice(ev.currentTarget, "s:" + id)) return; // resending replaces the old password
      issueAndMail(id);
    };
    const cp = it.querySelector('[data-act="copyPw"]');
    if (cp) cp.onclick = async () => {
      try{ await navigator.clipboard.writeText(lastIssued.password); toast("הסיסמה הועתקה"); }
      catch(e){ const r = document.createRange(); r.selectNodeContents(document.getElementById("issuedPw")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    };
    const ro = it.querySelector('[data-act="reopenMail"]');
    if (ro) ro.onclick = () => openMail(lastIssued);
    const rp = it.querySelector('[data-act="resetPass"]');
    if (rp) rp.onclick = async () => {
      const inp = document.getElementById("rp_" + id);
      if (await act({ action: "resetPassword", id, password: inp.value }, "הסיסמה עודכנה", false)) inp.value = "";
    };
    const du = it.querySelector('[data-act="delUser"]');
    if (du) du.onclick = ev => { if (confirmTwice(ev.currentTarget, "u:"+id)){ mgmtTab = "users"; act({ action: "deleteUser", id }, "המשתמש נמחק"); } };
  });
  const no = document.getElementById("noForm");
  if (no) no.addEventListener("submit", e => {
    e.preventDefault(); mgmtTab = "orgs";
    act({ action: "createOrg", name: document.getElementById("noName").value }, "הארגון נוסף");
  });
  app.querySelectorAll(".item[data-oid]").forEach(it => {
    const id = it.dataset.oid;
    it.querySelector('[data-act="saveOrg"]').onclick = () =>
      act({ action: "saveOrg", id, context: document.getElementById("oc_" + id).value }, "ההקשר נשמר", false);
  });
}

/* ---------------- open a project ---------------- */
let projectOrg = null;
async function loadProject(id){
  const j = await api("/api/project?id=" + encodeURIComponent(id));
  project = j.project; projectOrg = j.org; cells = j.cells || {};
}
async function openProject(id){
  try{ await loadProject(id); }catch(e){ toast(e.message); return; }
  renderCanvas();
  // pick up teammates' saves every 20 seconds while the canvas is open
  if (unsub) clearInterval(unsub);
  unsub = setInterval(async () => {
    if (!project || document.getElementById("overlay") || document.hidden) return;
    try{ await loadProject(project.id); renderCanvas(); }catch(e){}
  }, 20000);
}
async function saveCell(k, v){
  try{ const j = await api("/api/cell", { project: project.id, key: k, v }); cells[k] = j.cell; }
  catch(e){ toast(e.message); return false; }
  toast("נשמר");
  return true;
}

/* ---------------- canvas render ---------------- */
function viewOf(k){
  const v = getVal(k), t = B[k].type;
  if (isEmpty(k, v)) return `<div class="val empty">${esc(B[k].hint)}</div>`;
  if (t === "fields") return `<div class="kv">${B[k].fields.map(([f,l]) => `<b>${esc(l)}</b><span>${esc(v[f]||"—")}</span>`).join("")}</div>`;
  return `<div class="val">${esc(v)}</div>`;
}
function metaOf(k){ return cells[k] && cells[k].at ? `<div class="meta">נשמר ${dateStr(cells[k].at)}</div>` : ""; }
function cell(k){
  return `<div class="blk cell" data-k="${k}" tabindex="0" role="button" aria-label="עריכת ${esc(B[k].label)}">
    <span class="edit-hint">לחיצה כפולה לעריכה</span>
    <h3>${esc(B[k].label)}</h3>${viewOf(k)}${metaOf(k)}</div>`;
}
function kpiTable(){
  const v = getVal("kpi");
  return `<div class="tw"><table class="grid"><thead><tr><th>מדד</th>${KPI_COLS.slice(1).map(c=>`<th>${c[1]}</th>`).join("")}</tr></thead><tbody>
  ${KPI_ROWS.map((r,i) => `<tr><th>${esc(v[i]?.name || r)}</th>${KPI_COLS.slice(1).map(([c]) => `<td>${esc(v[i]?.[c]||"")}</td>`).join("")}</tr>`).join("")}
  </tbody></table></div>`;
}
function tlTable(){
  const v = getVal("timeline");
  return `<div class="tw"><table class="grid"><thead><tr><th>לוח זמנים</th>${TL_COLS.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>
  ${TL_ROWS.map(([r,l]) => `<tr><th>${l}</th>${TL_COLS.map((c,i) => `<td>${esc((v[r]||[])[i]||"")}</td>`).join("")}</tr>`).join("")}
  </tbody></table></div>`;
}
function renderCanvas(){
  if (!project) return;
  if (document.getElementById("overlay")) return;
  const nameV = getVal("name"), leadV = getVal("lead");
  const orgName = projectOrg?.name || project.org;
  app.innerHTML = `
  <div class="topbar">
    ${LOGO}
    <button class="btn ghost small" id="backBtn">→ לכל הפרויקטים</button>
    <div class="proj"><span class="pill">${esc(orgName)}</span> ${esc(project.name || project.id)}</div>
    <div class="sp"></div>
    <span class="status">${esc(me.name || me.id)} · ${ROLE_LABEL[me.role]||""}</span>
    <button class="btn small" id="reviewBtn" ${sample ? "" : "disabled"}>${sample ? "סקירת המאמן על כל הקנבס" : "המאמן לא זמין כאן"}</button>
  </div>
  <div class="slide">
    <div class="head">
      <div class="blk name" data-k="name" tabindex="0" role="button" aria-label="עריכת שם היוזמה"><span class="${isEmpty("name",nameV)?"empty":""}">${esc(isEmpty("name",nameV) ? "[שם יוזמה]" : nameV)}</span></div>
      <div class="blk lead" data-k="lead" tabindex="0" role="button" aria-label="עריכת מוביל/ה">מוביל/ה: <span class="${isEmpty("lead",leadV)?"empty":""}">${esc(isEmpty("lead",leadV) ? "____" : leadV)}</span></div>
    </div>
    <div class="row3">
      <section class="panel"><h2>הסיפור</h2>${cell("why")}${cell("scope")}${cell("aud")}</section>
      <section class="panel p-measure"><h2>המדידה</h2>
        <div class="blk cell" data-k="kpi" tabindex="0" role="button" aria-label="עריכת טבלת המדדים"><span class="edit-hint">לחיצה כפולה לעריכה</span>${kpiTable()}${metaOf("kpi")}</div>
        ${cell("success")}
      </section>
      <section class="panel"><h2>החיבורים</h2>${cell("needs")}${cell("gives")}${cell("tension")}</section>
    </div>
    <div class="hrband">
      <div class="intro"><h2>השינוי ב־HR</h2><p>מה משתנה אצלנו כדי שזה יקרה</p></div>
      ${cell("hr_struct")}${cell("hr_proc")}${cell("hr_mind")}
    </div>
    <div class="blk cell" data-k="timeline" tabindex="0" role="button" aria-label="עריכת לוח הזמנים" style="margin:0"><span class="edit-hint">לחיצה כפולה לעריכה</span>${tlTable()}${metaOf("timeline")}</div>
  </div>`;
  app.querySelectorAll(".blk[data-k]").forEach(el => {
    el.addEventListener("dblclick", () => openEditor(el.dataset.k));
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); openEditor(el.dataset.k); } });
    el.addEventListener("click", () => { if (matchMedia("(pointer:coarse)").matches) openEditor(el.dataset.k); });
  });
  document.getElementById("backBtn").onclick = goHome;
  document.getElementById("reviewBtn").onclick = () => openEditor(null, true);
}

/* ---------------- editor + coach overlay ---------------- */
let cur = null, draft = null, coachOpen = false, thread = [], ctrl = null, threadFor = null;

function openEditor(k, coach = false){
  if (document.getElementById("overlay")) return;
  cur = k; draft = k ? JSON.parse(JSON.stringify(getVal(k))) : null;
  coachOpen = coach || !k; thread = []; threadFor = null;
  const ov = document.createElement("div"); ov.className = "overlay"; ov.id = "overlay";
  ov.addEventListener("mousedown", e => { if (e.target === ov) closeEditor(); });
  document.body.appendChild(ov);
  document.addEventListener("keydown", escClose);
  drawOverlay();
  const first = ov.querySelector(".editor input, .editor textarea, #coIn"); if (first) first.focus();
}
function escClose(e){ if (e.key === "Escape") closeEditor(); }
function closeEditor(){
  if (ctrl) ctrl.abort();
  const ov = document.getElementById("overlay"); if (ov) ov.remove();
  document.removeEventListener("keydown", escClose);
  cur = null; draft = null;
  renderCanvas();
}
function drawOverlay(){
  const ov = document.getElementById("overlay"); if (!ov) return;
  ov.innerHTML = (cur ? editorHtml() : "") + (coachOpen ? coachHtml() : "");
  if (cur) wireEditor();
  if (coachOpen){ wireCoach(); loadThread(); }
}
function editorHtml(){
  const b = B[cur], t = b.type;
  let body = "";
  if (t === "line") body = `<input class="input" id="edLine" value="${esc(draft)}">`;
  else if (t === "text") body = `<textarea class="input" id="edText">${esc(draft)}</textarea>`;
  else if (t === "fields") body = `<div class="fields" style="display:grid;gap:14px">${b.fields.map(([f,l]) => `<div class="field"><label for="ed_${f}">${esc(l)}</label><textarea class="input" id="ed_${f}" data-f="${f}">${esc(draft[f]||"")}</textarea></div>`).join("")}</div>`;
  else if (t === "kpi") body = `<div class="tw"><table class="grid"><thead><tr>${KPI_COLS.map(c=>`<th>${c[1]}</th>`).join("")}</tr></thead><tbody>
    ${KPI_ROWS.map((r,i) => `<tr>${KPI_COLS.map(([c],j) => `<td class="${j===0?"rowname":""}"><input id="kpi_${i}_${c}" data-i="${i}" data-c="${c}" value="${esc(draft[i][c])}" placeholder="${j===0?esc(r):""}"></td>`).join("")}</tr>`).join("")}
    </tbody></table></div><div class="meta">שתי השורות הראשונות ל־KPIs (מדדי תוצאה), השתיים האחרונות ל־KBIs (מדדי התנהגות).</div>`;
  else if (t === "timeline") body = `<div class="tw"><table class="grid"><thead><tr><th></th>${TL_COLS.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>
    ${TL_ROWS.map(([r,l]) => `<tr><th>${l}</th>${TL_COLS.map((c,i) => `<td><input id="tl_${r}_${i}" data-r="${r}" data-i="${i}" value="${esc(draft[r][i]||"")}"></td>`).join("")}</tr>`).join("")}
    </tbody></table></div>`;
  return `<div class="editor" role="dialog" aria-modal="true" aria-label="${esc(b.label)}">
    <div class="ed-head"><div class="t"><div class="sec">${esc(b.sec)}</div><h2>${esc(b.label)}</h2><p class="hint">${esc(b.hint)}</p></div>
      <button class="btn ghost small" id="edClose">סגירה</button></div>
    <div class="ed-body">${body}</div>
    <div class="ed-foot">
      <button class="btn" id="edSave">שמירה</button>
      <button class="btn ghost" id="edCancel">ביטול</button>
      <span class="sp"></span>
      ${sample ? `<button class="btn ghost coach-toggle" id="edCoach"><span class="dot" style="color:var(--accent)"></span>${coachOpen ? "הסתרת המאמן" : "המאמן"}</button>` : `<span class="meta">המאמן זמין כשמחוברות ל-Claude</span>`}
    </div></div>`;
}
function collectDraft(){
  const ov = document.getElementById("overlay"); if (!ov || !cur) return;
  const t = B[cur].type;
  if (t === "line") draft = ov.querySelector("#edLine").value;
  else if (t === "text") draft = ov.querySelector("#edText").value;
  else if (t === "fields") ov.querySelectorAll("[data-f]").forEach(el => draft[el.dataset.f] = el.value);
  else if (t === "kpi") ov.querySelectorAll("input[data-c]").forEach(el => draft[+el.dataset.i][el.dataset.c] = el.value);
  else if (t === "timeline") ov.querySelectorAll("input[data-r]").forEach(el => draft[el.dataset.r][+el.dataset.i] = el.value);
}
function wireEditor(){
  const ov = document.getElementById("overlay");
  ov.querySelector("#edClose").onclick = closeEditor;
  ov.querySelector("#edCancel").onclick = closeEditor;
  ov.querySelector("#edSave").onclick = async () => {
    collectDraft(); const btn = ov.querySelector("#edSave"); btn.disabled = true;
    const ok = await saveCell(cur, draft); btn.disabled = false;
    if (ok){ btn.textContent = "נשמר ✓"; setTimeout(() => { const b = document.getElementById("edSave"); if (b) b.textContent = "שמירה"; }, 1400); }
  };
  ov.querySelectorAll(".editor input, .editor textarea").forEach(el => el.addEventListener("input", collectDraft));
  const c = ov.querySelector("#edCoach");
  if (c) c.onclick = () => { collectDraft(); coachOpen = !coachOpen; drawOverlay(); if (coachOpen) document.getElementById("coIn")?.focus(); };
}

/* ---------------- coach ---------------- */
const MODES = [
  ["challenge","אתגרו אותי","בחן בביקורתיות את מה שכתוב בקוביה. מצא את החולשה המרכזית אחת, אמור אותה ישירות, ושאל שאלה אחת שתחייב לחדד."],
  ["ask","שאלו אותי שאלות","אל תציע תשובות. שאל 3 שאלות ממוקדות, ממוספרות, שיעזרו למלא את הקוביה טוב יותר. התחל מהשאלה הכי חשובה."],
  ["bench","נתון או בנצ׳מרק","הצע 2–3 נתוני השוואה, מדדים מקובלים או דוגמאות מארגונים אחרים שרלוונטיים לקוביה. לכל אחד ציין מקור אם אתה בטוח בו, אחרת כתוב במפורש 'הערכה, לאמת'. אל תמציא מספרים מדויקים עם מקור מומצא."],
  ["sharpen","חדדו את הניסוח","הצע ניסוח משופר, קצר וחד יותר, לתוכן הקוביה, תוך שמירה על הכוונה. הסבר במשפט אחד מה שינית."]
];
const REVIEW_MODES = [
  ["consist","בדיקת עקביות","בדוק את הקנבס כולו: האם המדדים מודדים את מה שהסיפור מבטיח, האם לוח הזמנים תואם את התלויות, האם השינוי ב-HR מספיק. ציין 3 פערים לפי סדר חשיבות."],
  ["missing","מה חסר","זהה את הקוביות הריקות או החלשות ביותר והצע מאיזו להתחיל ולמה."],
  ["devil","פרקליט השטן","שחק את חברת הנהלה הספקנית. העלה את 3 ההתנגדויות החזקות ביותר שהיוזמה תפגוש."]
];
function coachHtml(){
  const modes = cur ? MODES : REVIEW_MODES;
  const title = cur ? `המאמן · ${B[cur].label}` : "המאמן · כל הקנבס";
  return `<aside class="coach" aria-label="המאמן">
    <div class="co-head"><h3>${esc(title)}</h3><button class="btn ghost small" id="coClear" title="מחיקת השיחה השמורה בקוביה הזו">ניקוי שיחה</button>${cur ? "" : `<button class="btn ghost small" id="coClose">סגירה</button>`}</div>
    <div class="chips">${modes.map(m => `<button class="chip" data-m="${m[0]}">${esc(m[1])}</button>`).join("")}</div>
    <div class="msgs" id="coMsgs"></div>
    <form class="co-input" id="coForm"><textarea id="coIn" rows="1" placeholder="כתבו למאמן…"></textarea><button class="btn small" type="submit">שליחה</button></form>
  </aside>`;
}
const threadKeyNow = () => cur || "_review";
async function loadThread(){
  const key = threadKeyNow();
  if (threadFor === key) return;
  threadFor = key;
  try{
    const j = await api(`/api/thread?project=${encodeURIComponent(project.id)}&key=${encodeURIComponent(key)}`);
    if (threadFor !== key) return;
    // keep anything asked while loading, after the saved history
    thread = (j.messages || []).map(m => ({ role: m.role, text: m.text, sugg: m.sugg || null, at: m.at })).concat(thread);
    drawMsgs();
  }catch(e){}
}
async function clearThread(btn){
  if (!confirmTwice(btn, "thread")) return;
  try{ await api("/api/thread", { project: project.id, key: threadKeyNow(), clear: true }); thread = []; drawMsgs(); toast("השיחה נמחקה"); }
  catch(e){ toast(e.message); }
}
function msgHtml(m, i){
  if (m.role === "me") return `<div class="msg me">${esc(m.text)}</div>`;
  const canApply = m.sugg && cur && ["line","text","fields"].includes(B[cur].type);
  return `<div class="msg bot ${m.wait?"wait":""}">${esc(m.text || "חושב…")}${m.sugg ? `<div class="sugg"><div class="lbl">הצעה לקוביה</div><div class="txt">${esc(m.sugg)}</div>${canApply ? `<button class="btn small" data-apply="${i}">להכניס לעריכה</button>` : ""}</div>` : ""}</div>`;
}
function drawMsgs(){
  const box = document.getElementById("coMsgs"); if (!box) return;
  box.innerHTML = thread.length ? thread.map(msgHtml).join("") :
    `<div class="co-empty">${cur ? "בחרו כיוון למעלה, או כתבו שאלה משלכן. המאמן רואה את מה שכתוב עכשיו בקוביה, גם לפני שמירה. השיחה נשמרת וממתינה לכן גם בפעם הבאה." : "המאמן קורא את כל הקנבס השמור ונותן מבט על. השיחה נשמרת."}</div>`;
  box.scrollTop = box.scrollHeight;
  box.querySelectorAll("[data-apply]").forEach(b => b.onclick = () => applySugg(thread[+b.dataset.apply].sugg));
}
function wireCoach(){
  const ov = document.getElementById("overlay");
  const cc = ov.querySelector("#coClose"); if (cc) cc.onclick = closeEditor;
  ov.querySelector("#coClear").onclick = ev => clearThread(ev.currentTarget);
  ov.querySelectorAll(".chip").forEach(b => b.onclick = () => {
    const m = (cur ? MODES : REVIEW_MODES).find(x => x[0] === b.dataset.m); ask(m[1], m[2]);
  });
  const inp = ov.querySelector("#coIn");
  inp.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey){ e.preventDefault(); ov.querySelector("#coForm").requestSubmit(); } });
  ov.querySelector("#coForm").addEventListener("submit", e => {
    e.preventDefault(); const q = inp.value.trim(); if (!q) return; inp.value = ""; ask(q, null);
  });
  drawMsgs();
}
function applySugg(text){
  if (!cur) return;
  const t = B[cur].type;
  if (t === "line" || t === "text") draft = text.trim();
  else if (t === "fields"){
    B[cur].fields.forEach(([f,l]) => {
      const re = new RegExp("^\\s*" + l.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "\\s*[:：]\\s*(.*)$","m");
      const m = text.match(re); if (m) draft[f] = m[1].trim();
    });
  }
  drawOverlay();
  toast("ההצעה הוכנסה לעריכה. בדקו ושמרו.");
}
function canvasText(){
  return ORDER.map(k => {
    const v = (k === cur) ? draft : getVal(k);
    return `■ ${B[k].label} (${B[k].sec})${k===cur?" [הקוביה הנוכחית, טיוטה]":""}\n${asText(k, v)}`;
  }).join("\n\n");
}
function buildPrompt(userText, modeInstr){
  // Org context and tone rules are added on the server; this is the canvas-specific part.
  const fieldFmt = cur && B[cur].type === "fields" ? "כתוב כל שדה בשורה נפרדת בפורמט 'שם השדה: תוכן', עם השדות: " + B[cur].fields.map(f=>f[1]).join(", ") + "." : "";
  const task = `${cur ? `הקוביה שעליה עובדים: "${B[cur].label}" (${B[cur].hint}).\nהנחיה למאמן לקוביה הזו: ${B[cur].coach}` : "עובדים על הקנבס כולו."}
אם אתה מציע ניסוח מלא לקוביה הנוכחית, סיים בשורה "###הצעה" ומתחתיה רק הטקסט המוצע, בלי מירכאות. ${fieldFmt} אם אין הצעת ניסוח, אל תכתוב את השורה הזו.`;
  const hist = thread.filter(m => !m.wait).slice(-8).map(m => (m.role === "me" ? "משתתפת: " : "מאמן: ") + m.text + (m.sugg ? "\n[הצעה: " + m.sugg + "]" : "")).join("\n\n");
  return `${task}\n\n===== הקנבס: ${project.name || project.id} =====\n${canvasText()}\n\n${hist ? "===== השיחה עד עכשיו =====\n" + hist + "\n\n" : ""}===== הבקשה עכשיו =====\n${modeInstr ? "(" + modeInstr + ")\n" : ""}${userText}`;
}
function splitSugg(t){
  const i = t.indexOf("###הצעה");
  if (i < 0) return { text: t.trim(), sugg: null };
  return { text: t.slice(0, i).trim(), sugg: t.slice(i + 7).trim() || null };
}
async function ask(userText, modeInstr){
  if (!sample) return;
  collectDraft();
  if (ctrl) ctrl.abort();
  const prompt = buildPrompt(userText, modeInstr);
  thread.push({ role: "me", text: userText });
  const bot = { role: "bot", text: "", wait: true, sugg: null };
  thread.push(bot); drawMsgs();
  ctrl = new AbortController();
  let full = "";
  try{
    const r = await fetch("/api/coach", { method: "POST", credentials: "same-origin", signal: ctrl.signal,
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: project.id, prompt, key: threadKeyNow(), userText }) });
    if (!r.ok){ let j = {}; try{ j = await r.json(); }catch(e){} throw new Error(j.error || "המאמן לא הצליח לענות כרגע. נסו שוב."); }
    const reader = r.body.getReader(), dec = new TextDecoder();
    for (;;){
      const { done, value } = await reader.read();
      if (done) break;
      full += dec.decode(value, { stream: true });
      const s = splitSugg(full); bot.text = s.text; bot.wait = !full; drawMsgs();
    }
    const s = splitSugg(full); bot.text = s.text; bot.sugg = s.sugg; bot.wait = false;
  }catch(e){
    bot.wait = false;
    if (e && e.name === "AbortError") bot.text = bot.text || "בוטל.";
    else bot.text = bot.text ? bot.text : (e.message || "המאמן לא הצליח לענות כרגע. נסו שוב.");
  }
  drawMsgs();
}

boot();
})();
