/* WordQuest game code. Settings are in config.js and questions are in questions.js */
const LEVELS = { Easy: 6, Moderate: 3, Hard: 5 };
const ORDER = ["Easy", "Moderate", "Hard"];
const QCOUNT = { Easy: 1, Moderate: 2, Hard: 3 };
function pickQs(d, l) { const a = DATA.filter(q => q.d === d && q.l === l); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a.slice(0, QCOUNT[d]) }
let mem = { users: {}, session: null };
const OK = (() => { try { localStorage.setItem("_t", "1"); localStorage.removeItem("_t"); return true } catch (e) { return false } })();
const CLOUD = !!(SUPABASE_URL && SUPABASE_KEY && window.supabase);
const sb = CLOUD ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 15 } } }) : null;
const toRow = u => ({ id: u.id, username: u.username, section: u.section, hearts: u.hearts, coins: u.coins, keys: u.keys, data: { done: u.done, skins: u.skins, skin: u.skin, figs: u.figs, fig: u.fig, words: u.words, consent: u.consent, badges: u.badges, stats: u.stats, daily: u.daily }, updated_at: new Date().toISOString() });
const fromRow = (r, email) => fix({ id: r.id, email, username: r.username, section: r.section, hearts: r.hearts, coins: r.coins, keys: r.keys, ...(r.data || {}) });
let timer = null, dirty = null;
async function flush() { if (!CLOUD || !dirty) return; const u = dirty; dirty = null; clearTimeout(timer); const { error } = await sb.from("profiles").upsert(toRow(u)); if (error) console.error("Save failed:", error.message) }
addEventListener("pagehide", flush);
let inBadge = false;
const store = {
  users() { if (!OK) return mem.users; try { return JSON.parse(localStorage.getItem("wq_users") || "{}") } catch (e) { return {} } },
  save(u) {
    if (u === me && !inBadge) { inBadge = true; try { checkBadges() } catch (e) { } inBadge = false } if (CLOUD) { dirty = u; clearTimeout(timer); timer = setTimeout(flush, 400); return }
    const all = this.users(); all[u.email] = u; if (OK) localStorage.setItem("wq_users", JSON.stringify(all)); else mem.users = all
  },
  session() { return OK ? localStorage.getItem("wq_session") : mem.session },
  setSession(e) { if (OK) { e ? localStorage.setItem("wq_session", e) : localStorage.removeItem("wq_session") } else mem.session = e || null },
  async board() {
    if (!CLOUD) return Object.values(this.users()).sort((a, b) => b.hearts - a.hearts);
    const { data } = await sb.from("profiles").select("id,username,section,hearts").order("hearts", { ascending: false }).limit(50); return data || []
  }
};
const SK = {
  knight: { n: "Knight", p: 0, body: "#8f9aa6", trim: "#cdd6df", leg: "#5d6770", back: '<path d="M44 80L28 128h64L76 80z" fill="#3f7a3c"/>', hat: '<path d="M34 50a26 26 0 0 1 52 0z" fill="#aab4be"/><rect x="34" y="46" width="52" height="6" rx="3" fill="#7d8894"/><rect x="56" y="16" width="8" height="14" rx="3" fill="#d9475a"/>', hand: '<rect x="92" y="70" width="6" height="40" rx="2" fill="#d8e2ec"/><rect x="86" y="104" width="18" height="6" rx="2" fill="#6b4a2a"/>' },
  ranger: { n: "Forest Ranger", p: 30, body: "#4f7a3c", trim: "#8a5a2b", leg: "#5a3d22", back: '<path d="M96 66q18 30 0 62" stroke="#8a5a2b" stroke-width="4" fill="none"/><path d="M96 66v62" stroke="#f3e3bd" stroke-width="1.5"/>', hat: '<path d="M32 56a28 28 0 0 1 56 0l-6-4a22 22 0 0 0-44 0z" fill="#2f5d34"/><path d="M60 12l12 18H48z" fill="#2f5d34"/><path d="M78 26q14-8 18 4q-10 2-18-4z" fill="#d9475a"/>' },
  scholar: { n: "Scholar", p: 40, body: "#262638", trim: "#f2b631", leg: "#1a1a26", hat: '<path d="M28 34l32-14 32 14-32 14z" fill="#1d1d2b"/><rect x="44" y="40" width="32" height="10" rx="3" fill="#1d1d2b"/><path d="M90 34v18" stroke="#f2b631" stroke-width="3"/><circle cx="90" cy="54" r="4" fill="#f2b631"/><circle cx="51" cy="56" r="7" fill="none" stroke="#12352b" stroke-width="2"/><circle cx="69" cy="56" r="7" fill="none" stroke="#12352b" stroke-width="2"/><path d="M58 56h4" stroke="#12352b" stroke-width="2"/>', hand: '<rect x="88" y="86" width="22" height="28" rx="3" fill="#c4452f"/><rect x="91" y="89" width="16" height="22" rx="2" fill="#fbf7ea"/><path d="M94 96h10M94 102h10" stroke="#12352b" stroke-width="2"/>' },
  mage: { n: "Ink Mage", p: 60, body: "#5b3f8c", trim: "#f2b631", leg: "#3b2a5c", hat: '<path d="M28 42h64L66 6q-4-2-8 0z" fill="#4a2f7a"/><rect x="28" y="40" width="64" height="6" rx="3" fill="#f2b631"/><path d="M60 22l2.5 5 5.5.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.5-.8z" fill="#ffe27a"/>', hand: '<rect x="95" y="52" width="5" height="80" rx="2" fill="#6b4a2a"/><circle cx="97.5" cy="48" r="9" fill="#7fe0ff"/>' },
  sky: { n: "Sky Guardian", p: 90, body: "#7fc3ff", trim: "#ffffff", leg: "#5fa0e0", back: '<path d="M44 84Q4 58 4 102Q26 98 44 106z" fill="#fff"/><path d="M76 84Q116 58 116 102Q94 98 76 106z" fill="#fff"/>', hat: '<ellipse cx="60" cy="20" rx="18" ry="5" fill="none" stroke="#ffe27a" stroke-width="4"/><path d="M34 50a26 26 0 0 1 52 0q-26-8-52 0z" fill="#d6ecff"/>' },
  golden: { n: "Golden Champion", p: 120, body: "#f2b631", trim: "#b87a00", leg: "#b87a00", back: '<path d="M44 80L26 128h68L76 80z" fill="#c4452f"/>', hat: '<path d="M38 36l8-16 14 12 14-12 8 16v8H38z" fill="#ffd24a" stroke="#b87a00" stroke-width="2"/><circle cx="60" cy="34" r="3" fill="#d9475a"/>', hand: '<rect x="94" y="66" width="5" height="46" rx="2" fill="#b87a00"/><circle cx="96.5" cy="62" r="7" fill="#ffd24a"/>' }
};
const FG = {
  inky: { n: "Inky", p: 20, svg: '<path d="M25 8c8 0 11 7 16 10 6 5 6 14 0 20-5 6-4 10-16 10S13 44 9 38C3 31 3 22 9 18c5-3 8-10 16-10z" fill="#2b2d42"/><circle cx="19" cy="26" r="5" fill="#fff"/><circle cx="31" cy="26" r="5" fill="#fff"/><circle cx="20" cy="27" r="2" fill="#12352b"/><circle cx="32" cy="27" r="2" fill="#12352b"/><path d="M19 36q6 5 12 0" stroke="#fff" stroke-width="2.5" fill="none"/>' },
  fox: { n: "Fox Cub", p: 30, svg: '<path d="M8 42q2-16 16-16h6q12 0 14 16z" fill="#e8873a"/><path d="M12 30l2-14 9 9zM38 30l-2-14-9 9z" fill="#e8873a"/><path d="M19 42q6-9 12 0z" fill="#fff"/><circle cx="20" cy="34" r="2" fill="#2b1a0a"/><circle cx="31" cy="34" r="2" fill="#2b1a0a"/><path d="M40 42q10-4 8-16q-8 4-8 16z" fill="#e8873a"/>' },
  owl: { n: "Wise Owl", p: 40, svg: '<ellipse cx="25" cy="30" rx="14" ry="16" fill="#8a5a2b"/><path d="M14 18l4-9 5 7zM36 18l-4-9-5 7z" fill="#8a5a2b"/><circle cx="19" cy="26" r="6" fill="#fff"/><circle cx="31" cy="26" r="6" fill="#fff"/><circle cx="19" cy="26" r="2.6" fill="#12352b"/><circle cx="31" cy="26" r="2.6" fill="#12352b"/><path d="M22 33l3 4 3-4z" fill="#f2b631"/><ellipse cx="25" cy="39" rx="8" ry="5" fill="#d6b48a"/>' },
  dragon: { n: "Dragonling", p: 60, svg: '<ellipse cx="22" cy="34" rx="15" ry="11" fill="#4fae5a"/><circle cx="34" cy="22" r="10" fill="#4fae5a"/><path d="M31 14l1-8 5 7zM38 14l4-7 2 9z" fill="#2f7d3a"/><circle cx="37" cy="21" r="2" fill="#12352b"/><path d="M8 32q-8-2-6-11q7 2 9 9z" fill="#4fae5a"/><path d="M16 26q-4-12 8-12q-1 7-3 12z" fill="#8be07f"/>' },
  sprite: { n: "Star Sprite", p: 80, svg: '<path d="M25 4l5.5 12 13 1.5-9.8 8.6 2.8 12.9L25 32l-11.5 7 2.8-12.9-9.8-8.6 13-1.5z" fill="#ffd24a" stroke="#b87a00" stroke-width="2"/><circle cx="20" cy="21" r="2" fill="#12352b"/><circle cx="30" cy="21" r="2" fill="#12352b"/><path d="M21 27q4 3 8 0" stroke="#12352b" stroke-width="2" fill="none"/>' }
};
const charBase = s => `<ellipse class="c-sh" cx="60" cy="134" rx="30" ry="5" fill="rgba(0,0,0,.18)"/><g class="c-all"><g class="c-back">${s.back || ""}</g><rect class="c-leg a" x="46" y="112" width="11" height="20" rx="4" fill="${s.leg}"/><rect class="c-leg b" x="63" y="112" width="11" height="20" rx="4" fill="${s.leg}"/><rect x="42" y="76" width="36" height="42" rx="13" fill="${s.body}"/><rect x="42" y="98" width="36" height="6" fill="${s.trim}"/><circle class="c-arm a" cx="40" cy="92" r="7" fill="${s.body}"/><circle class="c-arm b" cx="80" cy="92" r="7" fill="${s.body}"/><g class="c-head"><circle cx="60" cy="54" r="26" fill="#f1c9a0"/><circle class="c-eye" cx="51" cy="57" r="3.2" fill="#2b1a0a"/><circle class="c-eye" cx="69" cy="57" r="3.2" fill="#2b1a0a"/><path d="M52 67q8 7 16 0" stroke="#2b1a0a" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="45" cy="65" r="4" fill="#f4a7a0" opacity=".6"/><circle cx="75" cy="65" r="4" fill="#f4a7a0" opacity=".6"/>${s.hat}</g><g class="c-item">${s.hand || ""}</g></g>`;
const charSVG = (sk, fg, w = 160, head = false, cls = "") => {
  const s = SK[sk] || SK.knight;
  return head ? `<svg viewBox="32 12 56 56" width="${w}" height="${w}" aria-hidden="true">${charBase(s)}</svg>`
    : `<svg class="cs ${cls}" viewBox="0 0 170 140" width="${w}" role="img" aria-label="Your character" style="height:auto"><g transform="translate(${fg ? 0 : 25} 0)">${charBase(s)}</g>${fg && FG[fg] ? `<g transform="translate(114 82)"><g class="c-fig">${FG[fg].svg}</g></g>` : ""}</svg>`
};
const ABIL = {
  knight: { n: "Shield Wall", d: "Blocks all damage for 3 seconds.", cd: 14, pn: "Shield", pd: "Your next wrong answer keeps your combo alive." },
  ranger: { n: "Triple Shot", d: "Fires three shots in a spread.", cd: 8, pn: "Sharpshoot", pd: "Removes two wrong answers (or shows the first letter)." },
  scholar: { n: "Brain Boost", d: "Fire twice as fast for 4 seconds.", cd: 12, pn: "Free Clue", pd: "Shows the clue without using a key." },
  mage: { n: "Ink Blast", d: "A huge ink wave that hits everyone in its path.", cd: 10, pn: "Time Freeze", pd: "Adds 10 seconds to the timer." },
  sky: { n: "Sky Dash", d: "Dash forward and dodge damage for a moment.", cd: 6, pn: "Fly Past", pd: "Skip a question without losing your combo." },
  golden: { n: "Royal Rage", d: "Double damage for 5 seconds.", cd: 15, pn: "Midas Touch", pd: "Your next correct answer pays double coins." }
};
const BUFF = {
  inky: { n: "Ink Armor", d: "+2 max HP in matches. +2 coins per correct answer." },
  fox: { n: "Quick Paws", d: "+12% speed in matches. Fast bonus needs only 35% of the time left." },
  owl: { n: "Far Sight", d: "Longer shots and aim range. +5 seconds on every question timer." },
  dragon: { n: "Fire Breath", d: "Every 3rd shot hits harder. Combo bonus is bigger." },
  sprite: { n: "Lucky Star", d: "Faster respawn and slow healing. 25% chance to upgrade a chest." }
};
const pv = (k, label) => PRIVACY[k] ? esc(PRIVACY[k]) : `<mark>[add your ${label}]</mark>`;
function privacyHTML() {
  return `<h2>Data Privacy Notice</h2>
 <p>Please read this before you play. It explains what information this study collects and what we do with it, in line with the Data Privacy Act of 2012 (Republic Act 10173).</p>
 <h3>1. Who we are</h3><p>WordQuest is a student research project for Practical Research 2 by ${pv("group", "group name")} of ${pv("school", "school name")}, supervised by ${pv("adviser", "adviser's name")}. The study looks at ${PRIVACY.topic ? esc(PRIVACY.topic) : "how a learning game helps students practice English"}. It is not a commercial product.</p>
 <h3>2. What we collect</h3><ul><li>Your email address, username, and section.</li><li>Your password. It is handled by the sign-in service and the researchers cannot read it.</li><li>Your game activity: answers, scores, coins, hearts, levels cleared, items, and words collected.</li><li>A record of when you agreed to this notice.</li></ul>
 <p>Please <b>do not use your full real name</b> as your username. If you also join an interview or survey, those answers are collected separately with your consent form.</p>
 <h3>3. Why we use it</h3><p>To run your account and the game, to show the leaderboard, and to study the results for our research paper. We do not sell your information and we do not use it for advertising.</p>
 <h3>4. Who can see it</h3><ul><li>The researchers and our adviser.</li><li>Other signed-in players see only your username, section, and hearts on the leaderboard. Your email is never shown to other players.</li><li>Our service providers: Supabase stores accounts and game data, and Google Fonts loads the game's fonts (it may receive your IP address).</li></ul>
 <h3>5. How long we keep it</h3><p>Until ${pv("until", "date the study ends")}. After that we delete or anonymize it. If the game runs offline, your data stays only on your own device.</p>
 <h3>6. Your rights</h3><p>You may ask to see your data, correct it, object to its use, withdraw your consent, or ask us to delete it at any time. Contact: ${pv("contact", "contact email")}. You may also contact the National Privacy Commission (privacy.gov.ph).</p>
 <h3>7. If you are under 18</h3><p>Please ask your parent or guardian before joining. By agreeing, you confirm they know about this study.</p>
 <h3>8. Security and choice</h3><p>We use reasonable safeguards such as an encrypted connection and access rules, but no system is completely secure. Taking part is voluntary, and stopping will not affect your grades.</p>`}
// ---- Sound: everything is synthesized in the browser, no audio files ----
const AP = (() => { try { return JSON.parse(localStorage.getItem("wq_audio") || "{}") } catch (e) { return {} } })();
const AUD = { ctx: null, sfx: AP.sfx !== false, mus: AP.mus !== false, vol: AP.vol == null ? .7 : AP.vol };
const saveAud = () => { try { localStorage.setItem("wq_audio", JSON.stringify({ sfx: AUD.sfx, mus: AUD.mus, vol: AUD.vol })) } catch (e) { } };
function actx() {
  if (!AUD.ctx) { try { AUD.ctx = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { return null } }
  if (AUD.ctx.state === "suspended") AUD.ctx.resume().then(() => musicSync()).catch(() => { }); return AUD.ctx
}
function tone(f, t0, d, type = "square", vol = .12, slide) {
  if (!AUD.sfx) return; const c = actx(); if (!c) return; const o = c.createOscillator(), g = c.createGain(), n = c.currentTime + t0;
  o.type = type; o.frequency.setValueAtTime(f, n); if (slide) o.frequency.exponentialRampToValueAtTime(slide, n + d);
  g.gain.setValueAtTime(vol * AUD.vol, n); g.gain.exponentialRampToValueAtTime(.0008, n + d); o.connect(g); g.connect(c.destination); o.start(n); o.stop(n + d + .03)
}
const SFX = {
  click() { tone(660, 0, .05, "square", .07) }, good() { [523, 659, 784].forEach((f, i) => tone(f, i * .07, .13, "triangle", .15)) }, bad() { tone(210, 0, .28, "sawtooth", .12, 100) },
  coin() { tone(988, 0, .07, "square", .09); tone(1319, .07, .16, "square", .09) }, combo(n = 2) { const b = 330 * Math.pow(1.12, Math.min(n, 9));[b, b * 1.26, b * 1.5].forEach((f, i) => tone(f, i * .06, .11, "square", .11)) },
  chest() { tone(140, 0, .45, "sawtooth", .1, 620);[880, 1175, 1568, 2093].forEach((f, i) => tone(f, .4 + i * .07, .16, "triangle", .12)) },
  win() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * .11, .17, "square", .11)) }, shoot() { tone(880, 0, .06, "square", .04, 440) }, hit() { tone(180, 0, .13, "sawtooth", .1, 80) },
  ko() { tone(420, 0, .32, "sawtooth", .12, 60) }, special() { tone(300, 0, .25, "sawtooth", .1, 900); tone(600, .1, .22, "triangle", .1, 1400) }, tick() { tone(1000, 0, .04, "square", .06) },
  badge() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * .09, .2, "triangle", .14)) }, daily() { [659, 784, 988, 1319].forEach((f, i) => tone(f, i * .08, .15, "square", .1)) }
};
const sfx = (n, a) => { try { if (SFX[n]) SFX[n](a) } catch (e) { } };
const NOTE = n => 261.63 * Math.pow(2, n / 12), MEL = [0, 4, 7, 12, 9, 7, 4, 2, 0, 5, 9, 12, 9, 5, 4, 2], BAS = [-12, -12, -7, -7, -5, -5, -7, -7];
let mus = { t: null, i: 0, mode: "" };
function mtone(f, d, type, vol) {
  const c = AUD.ctx; if (!c) return; const o = c.createOscillator(), g = c.createGain(), n = c.currentTime; o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(vol * AUD.vol, n); g.gain.exponentialRampToValueAtTime(.0008, n + d); o.connect(g); g.connect(c.destination); o.start(n); o.stop(n + d + .03)
}
function musicSync() {
  const want = AUD.mus && AUD.ctx && AUD.ctx.state === "running" ? (G ? "arena" : "calm") : ""; if (want === mus.mode) return;
  clearInterval(mus.t); mus.t = null; mus.mode = want; if (!want) return; const ms = want === "arena" ? 170 : 300;
  mus.t = setInterval(() => {
    const s = mus.i++, n = MEL[s % 16] + (want === "arena" && s % 32 >= 16 ? 5 : 0); mtone(NOTE(n), ms / 1000 * 1.6, want === "arena" ? "square" : "triangle", want === "arena" ? .035 : .05);
    if (s % 4 === 0) mtone(NOTE(BAS[(s / 4 | 0) % 8]), ms / 1000 * 3, "triangle", .07)
  }, ms)
}
const fix = u => { u.badges = u.badges || {}; u.stats = Object.assign({ perfect: 0, chests: 0, matches: 0, wins: 0, fast: 0, bestCombo: 0 }, u.stats || {}); u.daily = u.daily || { last: "", streak: 0 }; u.done = u.done || { Easy: 0, Moderate: 0, Hard: 0 }; u.words = u.words || {}; u.skins = u.skins || ["knight"]; u.skin = SK[u.skin] ? u.skin : "knight"; u.figs = u.figs || []; u.fig = FG[u.fig] ? u.fig : ""; return u };
let tab = "skin";
let me = null, run = null;
const $ = s => document.querySelector(s), app = $("#app");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const norm = s => s.toLowerCase().replace(/\s+/g, " ").trim();
const IC = {
  coin: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#f2b631"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#b87a00" stroke-width="2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" fill="#ef5a5f"/></svg>',
  key: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="12" r="4.5" fill="none" stroke="#f2b631" stroke-width="3"/><path d="M12 12h10M18 12v4M21 12v3" stroke="#f2b631" stroke-width="3" fill="none"/></svg>',
  cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h3l2.4 10.5h9.6L20 7H7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="19" r="1.8" fill="#fff"/><circle cx="17" cy="19" r="1.8" fill="#fff"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="#ffe27a" stroke="#fff" stroke-width="1.2"/></svg>',
  gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" stroke-width="2.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="#e6e9eb"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#e6e9eb" stroke-width="2.4"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
let prevS = null;
const stats = () => {
  const pc = k => prevS && prevS[k] !== me[k] ? " pop" : "";
  const h = `<div class="hudbar"><span class="nameplate2"><span class="av">${charSVG(me.skin, "", 30, true)}</span>${esc(me.username)}</span><span><span class="pill${pc("coins")}">${IC.coin}${me.coins}</span> <span class="pill${pc("hearts")}">${IC.heart}${me.hearts}</span> <span class="pill${pc("keys")}">${IC.key}${me.keys}</span></span></div>`;
  prevS = { coins: me.coins, hearts: me.hearts, keys: me.keys }; return h
};
let cur = null;
const WIDEQ = matchMedia("(min-width:720px)"), isWide = () => WIDEQ.matches;
WIDEQ.addEventListener("change", () => { if (cur) cur() });
let G = null;
function stopGame() { if (G) { cancelAnimationFrame(G.raf); removeEventListener("keydown", G.kd); removeEventListener("keyup", G.ku); G = null } }
function comboPop(n) { sfx("combo", n); const el = document.createElement("div"); el.className = "combopop"; el.textContent = "COMBO x" + n + "!"; document.body.appendChild(el); el.onanimationend = () => el.remove() }
function burst(el, n = 24) {
  if (!el || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const r = el.getBoundingClientRect(), cx0 = r.left + r.width / 2, cy0 = r.top + r.height / 2, cols = ["#ffd21f", "#ff4fa3", "#3ddc4a", "#2f8bff", "#ff9f1c", "#ffffff"];
  for (let i = 0; i < n; i++) {
    const d = document.createElement("i"); d.className = "cf"; const a = Math.random() * Math.PI * 2, v = 90 + Math.random() * 200;
    d.style.cssText = `left:${cx0}px;top:${cy0}px;background:${cols[i % 6]};${i % 3 ? "" : "border-radius:50%;"}`; document.body.appendChild(d);
    d.animate([{ transform: "translate(-50%,-50%) rotate(0)", opacity: 1 }, { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v + 90}px) rotate(${Math.random() * 720}deg) scale(.5)`, opacity: 0 }], { duration: 900 + Math.random() * 600, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => d.remove()
  }
}
function shake(el) { if (!el || matchMedia("(prefers-reduced-motion:reduce)").matches) return; el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-10px)" }, { transform: "translateX(10px)" }, { transform: "translateX(-6px)" }, { transform: "translateX(0)" }], { duration: 380 }) }
let calm = false;
function go(fn) { cur = null; stopGame(); app.innerHTML = ""; if (!calm) { app.classList.remove("rise"); void app.offsetWidth; app.classList.add("rise") } fn(); window.scrollTo(0, 0); musicSync() }
const backBtn = `<button class="btn dark small" id="bk">Back</button>`;
const LOGO = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M22 12h56a8 8 0 0 1 0 16H22a8 8 0 0 0 0-16zM22 72h56a8 8 0 0 1 0 16H22a8 8 0 0 0 0-16z" fill="#1d1208"/><rect x="26" y="24" width="48" height="52" fill="#f3e3bd" stroke="#1d1208" stroke-width="5"/><path d="M38 44l6 6 6-10 6 10 6-6v12H38z" fill="#1d1208"/><path d="M36 62h28M36 68h28" stroke="#1d1208" stroke-width="3"/></svg>';
const P = (l, t, w, h, inner, cls = "") => `<div class="a ${cls}" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%">${inner}</div>`;

const I = {
  medal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><path d="M8.5 3l3.5 6 3.5-6M12 11.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z"/></svg>', palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2s-.7-1.6-.7-2.6c0-1 .8-1.8 1.9-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 21h8M10 17h4"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></svg>'
};
const guard = (p, msg) => p.catch(e => msg("Problem: " + (e && e.message || e)));
async function enter(user, email) {
  const { data: r, error: e1 } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (e1) throw new Error(e1.message + " (did you run supabase_setup.sql?)");
  if (!r) {
    const m = user.user_metadata || {}; me = fix({ id: user.id, email, username: m.username || email.split("@")[0], section: m.section || SECTIONS[0], consent: m.consent || null, coins: 0, hearts: 0, keys: 3 });
    const { error: e2 } = await sb.from("profiles").insert(toRow(me)); if (e2) throw new Error(e2.message + " (did you run supabase_setup.sql?)")
  }
  else me = fromRow(r, email);
  menu()
}
async function cloudSignUp(email, pw, un, sec, msg) {
  msg("Creating your account...");
  const { data, error } = await sb.auth.signUp({ email, password: pw, options: { data: { username: un, section: sec, consent: { at: new Date().toISOString(), v: 1 } } } });
  if (error) return msg(error.message);
  if (!data.session) return msg("Account created. Check your email to confirm it, then sign in.");
  await enter(data.user, email)
}
async function cloudSignIn(email, pw, msg) {
  msg("Signing in...");
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
  if (error) return msg(/invalid login/i.test(error.message) ? "Email or password is incorrect." : /confirm/i.test(error.message) ? "Please confirm your email first, then sign in." : "Could not sign in: " + error.message);
  await enter(data.user, email)
}
async function signOut() { prevS = null; dailyShown = false; await flush(); leaveRoom(); if (CLOUD) await sb.auth.signOut(); store.setSession(null); me = null; authScreen() }
function authScreen(mode = "login") {
  go(() => {
    const reg = mode === "register";
    app.innerHTML = `<div class="auth"><aside class="brand"><div class="brand-top"><span class="logo">${LOGO}</span><span class="bname">WordQuest</span></div>
 <h1>Learn English by playing.</h1><p>Quick quests, team matches, and questions that make you think. Made for Grade 11.</p><div class="brand-art">${charSVG("knight", "inky", 210)}</div></aside>
 <section class="card authcard"><h2>${reg ? "Create your account" : "Welcome back"}</h2><p class="muted" style="margin:6px 0 0">${reg ? "Join your classmates in WordQuest." : "Sign in to continue your adventure."}</p>
 <label for="em">Email</label><input id="em" type="email" placeholder="you@school.com" autocomplete="email">
 ${reg ? `<label for="un">Username</label><input id="un" placeholder="Pick a username" autocomplete="username">` : ""}
 <label for="pw">Password</label><input id="pw" type="password" placeholder="At least 6 characters" autocomplete="${reg ? "new-password" : "current-password"}">
 ${reg ? `<label for="pw2">Confirm password</label><input id="pw2" type="password" placeholder="Type it again" autocomplete="new-password">
 <label for="sec">Section</label><select id="sec"><option value="">Select your section</option>${SECTIONS.map(s => `<option>${esc(s)}</option>`).join("")}</select>` : ""}
 <label class="chk"><input type="checkbox" id="sp"> Show password</label>
 ${reg ? `<label class="chk consent"><input type="checkbox" id="cs"><span>I have read the <button type="button" class="link" id="rpn">Data Privacy Notice</button> and I agree to take part. If I am under 18, my parent or guardian agrees too.</span></label>` : ""}
 <p class="status" role="alert"><span id="msg">${OK ? "" : "Your browser is blocking saved data."}</span></p>
 <button class="btn" id="go">${reg ? "Create account" : "Sign in"}</button>
 <p class="muted center">${reg ? "Already have an account?" : "New here?"} <button class="link" id="sw">${reg ? "Sign in" : "Create an account"}</button></p></section></div>`;
    $("#sw").onclick = () => authScreen(reg ? "login" : "register"); if ($("#rpn")) $("#rpn").onclick = () => privacy(false);
    $("#sp").onchange = e => { ["#pw", "#pw2"].forEach(s => { const i = $(s); if (i) i.type = e.target.checked ? "text" : "password" }) };
    const submit = () => {
      if (SUPABASE_URL && SUPABASE_KEY && !CLOUD) return $("#msg").textContent = "Could not load Supabase. Check your internet connection.";
      const email = norm($("#em").value), pw = $("#pw").value, msg = t => $("#msg").textContent = t, all = store.users();
      if (!/^\S+@\S+\.\S+$/.test(email)) return msg("Enter a valid email address.");
      if (reg) {
        const un = $("#un").value.trim(), sec = $("#sec").value;
        if (!un) return msg("Enter a username.");
        if (pw.length < 6) return msg("Use a password with at least 6 characters.");
        if (pw !== $("#pw2").value) return msg("Passwords do not match.");
        if (!sec) return msg("Select your section.");
        if (!$("#cs").checked) return msg("Please agree to the Data Privacy Notice to continue.");
        if (CLOUD) return guard(cloudSignUp(email, pw, un, sec, msg), msg);
        if (all[email]) return msg("That email already has an account. Sign in instead.");
        me = fix({ email, username: un, pw, section: sec, coins: 0, hearts: 0, keys: 3, consent: { at: new Date().toISOString(), v: 1 }, done: { Easy: 0, Moderate: 0, Hard: 0 } }); store.save(me);
      } else {
        if (CLOUD) return guard(cloudSignIn(email, pw, msg), msg);
        if (!all[email] || all[email].pw !== pw) return msg(Object.keys(all).length ? "Email or password is incorrect." : "No account found in this browser yet. Tap Register first.");
        me = fix(all[email]);
      }
      store.setSession(email); menu()
    };
    $("#go").onclick = submit;
    app.querySelectorAll("input").forEach(i => i.onkeydown = e => { if (e.key === "Enter") submit() })
  })
}

function menu() {
  leaveRoom(); if (!me.consent) setTimeout(() => privacy(true), 300); else if (!dailyShown && !dailyState().claimed) { dailyShown = true; setTimeout(() => daily(), 600) } go(() => {
    app.innerHTML = `${stats()}<section class="hero"><div><p class="eyebrow">Welcome back</p><h1>${esc(me.username)}</h1><p class="muted">Section ${esc(me.section)}</p><p class="abchips"><span class="chip2">Special: ${ABIL[me.skin].n}</span>${me.fig ? `<span class="chip2">Buff: ${BUFF[me.fig].n}</span>` : ""}</p><button class="btn" id="p">Play now</button>${dailyState().claimed ? "" : '<button class="btn small" id="dly">Daily reward ready!</button>'}</div><div class="hero-art">${charSVG(me.skin, me.fig, 230, false, "walk")}</div></section>
 <div class="tiles2"><button class="mcard" id="pe"><span class="mi">${I.palette}</span><b>Personalization</b><small>Buy characters and figurines.</small></button>
 <button class="mcard" id="co"><span class="mi">${I.book}</span><b>Collections</b><small>${Object.keys(me.words).length} of ${ALLW.length} words found</small></button>
 <button class="mcard" id="l"><span class="mi">${I.trophy}</span><b>Leaderboards</b><small>See who has the most hearts.</small></button>
 <button class="mcard" id="bd"><span class="mi">${I.medal}</span><b>Badges</b><small>${Object.keys(me.badges).length} of ${BADGES.length} earned</small></button>
 <button class="mcard" id="set"><span class="mi">${I.gear}</span><b>Settings</b><small>Account and sign out.</small></button></div>
 <p class="muted center" id="soon" role="status"></p>`;
    $("#p").onclick = playMenu; $("#l").onclick = leaderboard; $("#set").onclick = settings; $("#pe").onclick = () => personalization();
    $("#co").onclick = collections; $("#bd").onclick = badges; if ($("#dly")) $("#dly").onclick = daily;
  })
}
function personalization(msg = "") {
  go(() => {
    const skin = tab === "skin", list = skin ? SK : FG, own = skin ? me.skins : me.figs, cur = skin ? me.skin : me.fig;
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">Personalization</div>
 <div class="prev">${charSVG(me.skin, me.fig, 230)}</div><p class="abchips"><span class="chip2">Special: ${ABIL[me.skin].n}</span>${me.fig ? `<span class="chip2">Buff: ${BUFF[me.fig].n}</span>` : ""}</p><p class="pmsg" id="pm" role="status">${msg || "Buy designs with coins. Earn coins by answering questions correctly."}</p>
 <div class="tabs"><button class="btn small ${skin ? "green" : "dark"}" data-t="skin" aria-pressed="${skin}">Characters</button><button class="btn small ${skin ? "dark" : "green"}" data-t="fig" aria-pressed="${!skin}">Figurines</button></div>
 <div class="cosgrid">${Object.entries(list).map(([id, x]) => {
      const has = own.includes(id), on = cur === id;
      return `<div class="coscard${on ? " on" : ""}"><div class="cprev">${skin ? charSVG(id, "", 96, false, "still") : `<svg viewBox="0 0 50 50" width="64" aria-hidden="true">${x.svg}</svg>`}</div><b>${x.n}</b><small class="abl">${skin ? "Special: " + ABIL[id].n : BUFF[id].n}</small><small class="abd">${skin ? ABIL[id].d : BUFF[id].d}</small>
  <button class="btn small ${on ? "dark" : has ? "green" : ""}" data-id="${id}" ${on ? "disabled" : ""}>${on ? "Equipped" : has ? "Equip" : "Buy " + IC.coin + x.p}</button></div>`
    }).join("")}
 ${skin ? "" : `<div class="coscard"><div class="cprev none">None</div><b>No figurine</b><button class="btn small ${me.fig ? "green" : "dark"}" data-id="" ${me.fig ? "" : "disabled"}>${me.fig ? "Equip" : "Equipped"}</button></div>`}</div>${backBtn}</div>`;
    document.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { tab = b.dataset.t; personalization() });
    document.querySelectorAll("[data-id]").forEach(b => b.onclick = () => {
      const id = b.dataset.id, x = list[id];
      if (id === "") { me.fig = ""; store.save(me); return personalization("Figurine removed.") }
      if (!own.includes(id)) {
        if (me.coins < x.p) return personalization("Not enough coins for " + x.n + ". You need " + (x.p - me.coins) + " more.");
        me.coins -= x.p; own.push(id); msg = "You bought " + x.n + "!"
      } else msg = x.n + " equipped.";
      if (skin) me.skin = id; else me.fig = id; store.save(me); personalization(msg)
    });
    if (/^You bought/.test(msg)) setTimeout(() => burst($(".prev"), 38), 120); $("#bk").onclick = menu
  })
}
// ---- Collections: a word is any term the player answered correctly, with its meaning ----
const wordOf = q => {
  if (q.t === "un") return [q.a, q.desc];
  if (q.t === "au") return [q.a, q.q];
  if (q.t === "mc" && !q.img && q.q.includes("______") && q.a.split(" ").length <= 3) return [q.a, q.q.replace("______", q.a)];
  return null
};
const ALLW = (() => { const seen = {}, out = []; DATA.forEach(q => { const w = wordOf(q); if (w && !seen[w[0].toLowerCase()]) { seen[w[0].toLowerCase()] = 1; out.push(w) } }); return out })();
function collect(q) { const w = wordOf(q); if (!w) return false; const k = w[0].toLowerCase(); me.words = me.words || {}; if (me.words[k]) return false; me.words[k] = w[1]; store.save(me); return true }
function collections() {
  go(() => {
    const got = ALLW.filter(w => me.words[w[0].toLowerCase()]).length, pct = Math.round(got / ALLW.length * 100);
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">Collections</div><p class="pmsg">${got} of ${ALLW.length} words found. Answer questions correctly to unlock more.</p>
 <div class="bar2" role="img" aria-label="${pct} percent collected"><i style="width:${pct}%"></i></div>
 <div class="wlist">${ALLW.map((w, i) => {
      const has = me.words[w[0].toLowerCase()];
      return has ? `<div class="wcard"><b>${i + 1}. ${esc(w[0].toLowerCase())}</b><p>${esc(has)}</p><button class="btn small green" data-say="${esc(w[0])}">Hear it</button></div>`
        : `<div class="wcard lock"><b>${i + 1}. ? ? ?</b><p>Locked. Answer the right question to unlock this word.</p></div>`
    }).join("")}</div>${backBtn}</div>`;
    document.querySelectorAll("[data-say]").forEach(b => b.onclick = () => { if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(b.dataset.say); u.lang = "en-US"; u.rate = .85; speechSynthesis.cancel(); speechSynthesis.speak(u) } });
    $("#bk").onclick = menu
  })
}
// ---- Daily rewards ----
function today() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") }
const DAILY = [{ c: 15 }, { c: 20 }, { c: 25, k: 1 }, { c: 30 }, { c: 35 }, { c: 40 }, { c: 70, k: 2 }];
function dailyState() {
  const dd = me.daily, t0 = today(); if (dd.last === t0) return { claimed: true, streak: dd.streak };
  const y = new Date(); y.setDate(y.getDate() - 1); const ys = y.getFullYear() + "-" + String(y.getMonth() + 1).padStart(2, "0") + "-" + String(y.getDate()).padStart(2, "0");
  return { claimed: false, streak: dd.last === ys ? dd.streak + 1 : 1 }
}
let dailyShown = false;
function daily() {
  const st = dailyState(), idx = (st.streak - 1) % 7, d = $("#dr");
  d.innerHTML = `<div class="pnin"><h2>Daily Reward</h2><p>${st.claimed ? "You already claimed today's reward. Come back tomorrow to keep your streak!" : "Welcome back! This is day " + st.streak + " of your streak."}</p>
 <div class="days">${DAILY.map((r, i) => `<div class="day${i === idx && !st.claimed ? " now" : ""}${i < idx || (st.claimed && i === idx) ? " done" : ""}"><b>Day ${i + 1}</b><span>${r.c} coins${r.k ? " and " + r.k + " key" + (r.k > 1 ? "s" : "") : ""}</span></div>`).join("")}</div>
 <div class="row">${st.claimed ? "" : `<button class="btn green" id="dclaim">Claim reward</button>`}<button class="btn dark" id="dlater">${st.claimed ? "Close" : "Later"}</button></div></div>`;
  $("#dlater").onclick = () => d.close();
  if (!st.claimed) $("#dclaim").onclick = () => {
    const r = DAILY[idx]; me.coins += r.c; if (r.k) me.keys += r.k; me.daily = { last: today(), streak: st.streak }; store.save(me); sfx("daily"); burst($("#dclaim"), 50);
    const h = $(".hudbar"); if (h) h.outerHTML = stats(); const dl = $("#dly"); if (dl) dl.remove(); setTimeout(() => d.close(), 1100)
  };
  if (!d.open) d.showModal()
}
// ---- Badges ----
const BADGES = [
  { id: "first", n: "First Steps", d: "Clear your first level.", ok: u => u.done.Easy + u.done.Moderate + u.done.Hard >= 1 },
  { id: "easy", n: "Easy Rider", d: "Clear all 6 Easy levels.", ok: u => u.done.Easy >= 6 },
  { id: "mod", n: "Moderate Master", d: "Clear all 3 Moderate levels.", ok: u => u.done.Moderate >= 3 },
  { id: "hard", n: "Hard Hero", d: "Clear all 5 Hard levels.", ok: u => u.done.Hard >= 5 },
  { id: "fire", n: "On Fire", d: "Get a combo of x3.", ok: u => u.stats.bestCombo >= 3 },
  { id: "flaw", n: "Flawless", d: "Finish a level with every answer right.", ok: u => u.stats.perfect >= 1 },
  { id: "flaw5", n: "Perfectionist", d: "Finish 5 perfect levels.", ok: u => u.stats.perfect >= 5 },
  { id: "speed", n: "Quick Draw", d: "Earn the fast-answer bonus 10 times.", ok: u => u.stats.fast >= 10 },
  { id: "w10", n: "Word Collector", d: "Collect 10 words.", ok: u => Object.keys(u.words).length >= 10 },
  { id: "w25", n: "Walking Dictionary", d: "Collect 25 words.", ok: u => Object.keys(u.words).length >= 25 },
  { id: "wall", n: "Word Master", d: "Collect every word.", ok: u => Object.keys(u.words).length >= ALLW.length },
  { id: "chest", n: "Treasure Hunter", d: "Open 5 chests.", ok: u => u.stats.chests >= 5 },
  { id: "style", n: "Fashionista", d: "Own 4 character or figurine designs.", ok: u => u.skins.length + u.figs.length >= 4 },
  { id: "team", n: "Team Player", d: "Play a Team Match.", ok: u => u.stats.matches >= 1 },
  { id: "champ", n: "Champion", d: "Win a Team Match.", ok: u => u.stats.wins >= 1 },
  { id: "d3", n: "Regular", d: "Claim daily rewards 3 days in a row.", ok: u => u.daily.streak >= 3 },
  { id: "d7", n: "Loyal", d: "Claim daily rewards 7 days in a row.", ok: u => u.daily.streak >= 7 }];
const tq = []; let tbusy = false;
function toast(title, sub) { tq.push([title, sub]); if (!tbusy) nextToast() }
function nextToast() {
  const x = tq.shift(); if (!x) { tbusy = false; return } tbusy = true; const el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status");
  el.innerHTML = `<b>${esc(x[0])}</b><span>${esc(x[1])}</span>`; document.body.appendChild(el); sfx("badge"); el.onanimationend = () => { el.remove(); nextToast() }
}
function checkBadges() { if (!me || !me.badges) return; BADGES.forEach(b => { if (!me.badges[b.id] && b.ok(me)) { me.badges[b.id] = today(); toast("Badge unlocked: " + b.n, b.d) } }) }
function badges() {
  go(() => {
    const got = Object.keys(me.badges).length;
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">Badges</div><p class="pmsg">${got} of ${BADGES.length} earned</p><div class="bar2"><i style="width:${Math.round(got / BADGES.length * 100)}%"></i></div>
 <div class="wlist">${BADGES.map(b => { const dt = me.badges[b.id]; return dt ? `<div class="wcard"><b>${esc(b.n)}</b><p>${esc(b.d)}</p><small>Earned ${esc(dt)}</small></div>` : `<div class="wcard lock"><b>? ${esc(b.n)}</b><p>${esc(b.d)}</p></div>` }).join("")}</div>${backBtn}</div>`;
    $("#bk").onclick = menu
  })
}
// ---- Settings (with sound controls) ----
function settings() {
  go(() => {
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">Settings</div><p class="pmsg">Signed in as ${esc(me.username)}.</p>
 <h3>Sound</h3><label class="chk"><input type="checkbox" id="asfx" ${AUD.sfx ? "checked" : ""}> Sound effects</label>
 <label class="chk"><input type="checkbox" id="amus" ${AUD.mus ? "checked" : ""}> Background music</label>
 <label for="avol">Volume</label><input id="avol" type="range" min="0" max="100" value="${Math.round(AUD.vol * 100)}">
 <button class="btn small green" id="atest">Test sound</button>
 <button class="btn" id="so">Sign out</button><button class="btn dark" id="bk">Back</button></div>`;
    $("#asfx").onchange = e => { AUD.sfx = e.target.checked; saveAud(); sfx("coin"); if (window.sndLabel) window.sndLabel() };
    $("#amus").onchange = e => { AUD.mus = e.target.checked; saveAud(); actx(); musicSync(); if (window.sndLabel) window.sndLabel() };
    $("#avol").oninput = e => { AUD.vol = e.target.value / 100; saveAud() };
    $("#atest").onclick = () => { sfx("good"); setTimeout(() => sfx("coin"), 260) };
    $("#bk").onclick = menu; $("#so").onclick = signOut
  })
}

const BLURB = { Easy: "Key terms and definitions", Moderate: "Apply ideas to sentences", Hard: "Passages and deeper thinking" };

// ================= TEAM MATCH (online, Supabase Realtime) =================
const TEAMS = [{ n: "Blue", c: "#2f8bff" }, { n: "Red", c: "#ff3b4e" }, { n: "Yellow", c: "#ffb800" }];
const AW = 800, AH = 500, PR = 16, HPMAX = 10, SPD = 190, WALLS = [[340, 190, 120, 120], [130, 90, 50, 130], [620, 90, 50, 130], [200, 350, 110, 40], [490, 350, 110, 40]], SPAWNS = [[70, 430], [730, 430], [400, 60]];
const hitWall = (x, y, r) => WALLS.some(([a, b, w, h]) => x > a - r && x < a + w + r && y > b - r && y < b + h + r);
const FI = {}; const figImg = id => { if (!FI[id]) { const i = new Image(); i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">' + FG[id].svg + '</svg>'); FI[id] = i } return FI[id] };
const HI = {}; const headImg = sk => { if (!HI[sk]) { const i = new Image(); i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(charSVG(sk, "", 64, true).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')); HI[sk] = i } return HI[sk] };
let M = null;
function leaveRoom() { if (M) { clearInterval(M.tm); clearTimeout(M.ct); try { M.ch.unsubscribe() } catch (e) { } M = null } }
const send = (ev, p) => { if (M) M.ch.send({ type: "broadcast", event: ev, payload: p }) };
const hostId = () => M.players.slice().sort((a, b) => a.joinedAt - b.joinedAt || (a.id < b.id ? -1 : 1))[0].id;
function playMenu() {
  go(() => {
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">Play</div>
 <button class="sign" id="tmb"><span class="st">${CLOUD ? "Online" : "Needs online mode"}</span><b>Team Match</b><small>3 to 5 minute matches with your classmates, then a final question.</small></button>
 <button class="sign" id="prb"><b>Practice trails</b><small>Solo levels: Easy, Moderate, and Hard.</small></button>${backBtn}</div>`;
    $("#tmb").onclick = () => teamMenu(); $("#prb").onclick = difficulty; $("#bk").onclick = menu
  })
}
const whyOffline = () => !(SUPABASE_URL && SUPABASE_KEY) ? "Team Match needs online mode. Paste your Supabase URL and anon key into the file (the SUPABASE_URL line near the top of the script), then reload and sign in again." : "The Supabase library did not load. Check your internet connection and reload.";
function teamMenu(msg = "") {
  leaveRoom(); go(() => {
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">Team Match</div><p class="pmsg" id="tm" role="status" style="${CLOUD ? "" : "color:var(--bad)"}">${CLOUD ? (msg || "Up to 3 teams of 3. Create a room, or join one with a code.") : whyOffline()}</p>
 <button class="btn green" id="cr">Create a room</button>
 <label for="jc">Or join with a room code</label><input id="jc" maxlength="4" autocapitalize="characters" placeholder="ABCD" style="text-transform:uppercase">
 <button class="btn" id="jn">Join room</button>${backBtn}</div>`;
    const say = t => { $("#tm").style.color = "var(--muted)"; $("#tm").textContent = t };
    $("#bk").onclick = playMenu;
    $("#cr").onclick = () => {
      if (!CLOUD) { $("#tm").style.color = "#a8322d"; return $("#tm").textContent = whyOffline() }
      if (!me.id) { return $("#tm").textContent = "Please sign out and sign in again so your online account loads." }
      const L = "ABCDEFGHJKMNPQRSTUVWXYZ"; say("Creating your room..."); openRoom(Array.from({ length: 4 }, () => L[Math.floor(Math.random() * L.length)]).join(""), true)
    };
    $("#jn").onclick = () => {
      if (!CLOUD) { $("#tm").style.color = "#a8322d"; return $("#tm").textContent = whyOffline() }
      const c = $("#jc").value.trim().toUpperCase(); if (c.length !== 4) return $("#tm").textContent = "Enter the 4-letter room code."; say("Joining room " + c + "..."); openRoom(c, false)
    }
  })
}
function openRoom(code, creator) {
  try {
    leaveRoom(); M = { code, phase: "lobby", team: -1, dur: 3, joinedAt: Date.now(), players: [], on: null, paid: false };
    const ch = sb.channel("wq-room-" + code, { config: { broadcast: { self: false }, presence: { key: me.id } } }); M.ch = ch;
    M.track = () => ch.track({ id: me.id, name: me.username, skin: me.skin, fig: me.fig, team: M.team, joinedAt: M.joinedAt });
    ch.on("presence", { event: "sync" }, () => {
      if (!M) return;
      M.players = Object.values(ch.presenceState()).map(a => a[0]);
      if (!M.manual && M.players.some(p => p.id === me.id)) { const order = M.players.slice().sort((a, b) => a.joinedAt - b.joinedAt || (a.id < b.id ? -1 : 1)), tm = order.findIndex(p => p.id === me.id) % 3; if (tm !== M.team) { M.team = tm; M.track() } }
      if (M.phase === "lobby") lobby()
    });
    ch.on("broadcast", { event: "start" }, ({ payload }) => startMatch(payload));
    ["shot", "hit", "ko", "pos", "ans"].forEach(ev => ch.on("broadcast", { event: ev }, ({ payload }) => { if (M && M.on) M.on(ev, payload) }));
    ch.subscribe(st => {
      if (st === "SUBSCRIBED") {
        M.track(); lobby();
        if (!creator) setTimeout(() => { if (M && M.code === code && M.phase === "lobby" && !M.players.some(p => p.id !== me.id)) { teamMenu("Room not found. Check the code and try again.") } }, 2500)
      }
      else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT" || st === "CLOSED") teamMenu("Could not connect to the room. Check your internet and that Realtime is turned on in Supabase.")
    });
    M.ct = setTimeout(() => { if (M && M.code === code && M.phase === "lobby" && !M.players.some(p => p.id === me.id)) teamMenu("Could not connect to the room. Check your internet and that Realtime is turned on in Supabase.") }, 8000);
  } catch (err) { teamMenu("Could not create the room: " + (err && err.message || err)) }
}
function lobby() {
  if (!M) return; calm = !!M.lobbyOn; M.lobbyOn = true; go(() => {
    calm = false;
    const host = M.players.length && hostId() === me.id, ps = M.players;
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">Room ${M.code}</div>
 <p class="pmsg">Share this code with your classmates. Up to 3 teams, 3 players each.</p>
 <div class="teams">${TEAMS.map((tm, i) => {
      const mem = ps.filter(p => p.team === i), mine = M.team === i, full = mem.length >= 3;
      return `<div class="team" style="border-color:${tm.c}"><b style="background:${tm.c}">${tm.n} team</b>
  ${mem.map(p => `<div class="tmem"><span class="av">${charSVG(p.skin, "", 30, true)}</span>${esc(p.name)}${p.id === hostId() ? " (host)" : ""}</div>`).join("") || '<div class="tmem" style="opacity:.5">Empty</div>'}
  <button class="btn small ${mine ? "dark" : ""}" data-team="${i}" ${mine || full ? "disabled" : ""}>${mine ? "Your team" : full ? "Full" : "Join"}</button></div>`
    }).join("")}</div>
 ${host ? `<label for="dur">Match length</label><select id="dur"><option value="3" ${M.dur === 3 ? "selected" : ""}>3 minutes</option><option value="5" ${M.dur === 5 ? "selected" : ""}>5 minutes</option></select>
 <p class="pmsg" id="lm" role="status">You are the host. You need players on at least 2 teams.</p><button class="btn green" id="go">Start match</button>`: `<p class="pmsg">Waiting for the host to start the match...</p>`}
 <button class="btn dark small" id="lv">Leave room</button></div>`;
    document.querySelectorAll("[data-team]").forEach(b => b.onclick = () => { M.manual = true; M.team = +b.dataset.team; M.track() });
    $("#lv").onclick = () => teamMenu();
    if (host) {
      $("#dur").onchange = e => M.dur = +e.target.value;
      $("#go").onclick = () => {
        const ps2 = M.players.filter(p => p.team >= 0);
        if (new Set(ps2.map(p => p.team)).size < 2) return $("#lm").textContent = "You need players on at least 2 teams to start.";
        const cfg = { t0: Date.now() + 4000, dur: M.dur * 60000, seed: Math.floor(Math.random() * 1e6), roster: ps2.map(p => ({ id: p.id, name: p.name, skin: p.skin, fig: p.fig, team: p.team })) };
        send("start", cfg); startMatch(cfg)
      }
    }
  })
}
function startMatch(cfg) {
  if (!M) return; const mineR = cfg.roster.find(r => r.id === me.id);
  if (!mineR) { return teamMenu("That match started without you. Join the next one!") }
  M.phase = "play"; M.paid = false; M.lobbyOn = false;
  go(() => {
    app.innerHTML = `${stats()}<div class="meta metaq">Team Match, room ${M.code}</div><div class="gamebox"><canvas id="cv" width="800" height="500" role="img" aria-label="Arena"></canvas></div>
  <div class="pad2"><div class="dpad">${[["up", "&#9650;"], ["left", "&#9664;"], ["down", "&#9660;"], ["right", "&#9654;"]].map(([k, g]) => `<button class="pb ${k}" data-k="${k}" aria-label="${k}">${g}</button>`).join("")}</div><div class="actions"><button class="pb spec" data-k="spec" aria-label="Special ability">SPECIAL</button><button class="pb fire" data-k="fire" aria-label="Fire">FIRE</button></div></div>
  <p class="sub">Move: WASD or arrows. Fire: Space or tap the arena. Shots aim at the nearest enemy.</p>`;
    const cv = $("#cv"), cx = cv.getContext("2d"), PL = {}, BL = [], SC = [0, 0, 0], KOS = {}, ANS = {}, cnt = [0, 0, 0];
    cfg.roster.forEach(r => { const i = cnt[r.team]++, s = SPAWNS[r.team], x = s[0] + (i - 1) * 34, y = s[1]; PL[r.id] = { ...r, x, y, tx: x, ty: y, hp: HPMAX, max: HPMAX, alive: true, inv: 0, rs: 0, sp: [x, y] } });
    const FX = []; function spawn(x, y, n, col, tile) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 60 + Math.random() * 180; FX.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: .7 + Math.random() * .4, col, ch: tile ? "WORDQUEST"[Math.floor(Math.random() * 9)] : "" }) } }
    const P = PL[me.id], inp = { up: 0, down: 0, left: 0, right: 0, fire: 0, spec: 0 }; let cd = 0, pt = 0, seq = 0, last = 0, face = [0, -1], ended = false, acd = 0, shots = 0, regen = 0; const FB = me.fig, spd = FB === "fox" ? 1.12 : 1, sb = document.querySelector(".pb.spec"); if (FB === "inky") { P.max = 12; P.hp = 12 }
    window.__wq = () => ({ BL: BL.length, acd, P: { sh: P.sh, rf: P.rf, rg: P.rg, max: P.max, x: P.x, hp: P.hp }, reset() { acd = 0; P.sh = 0; P.rf = 0; P.rg = 0; BL.length = 0 }, SC: [...SC], KOS: { ...KOS }, ANS: { ...ANS }, phase: M && M.phase, hp: P.hp, alive: P.alive });
    const map = { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", Space: "fire", KeyJ: "fire", KeyE: "spec", ShiftLeft: "spec" };
    const kd = e => { const m = map[e.code]; if (m) { inp[m] = 1; if (m === "spec") inp.sq = 1; e.preventDefault() } }, ku = e => { const m = map[e.code]; if (m) inp[m] = 0 };
    addEventListener("keydown", kd); addEventListener("keyup", ku);
    document.querySelectorAll(".pb").forEach(b => {
      const m = b.dataset.k; b.addEventListener("pointerdown", e => { e.preventDefault(); inp[m] = 1; if (m === "spec") inp.sq = 1 });
      ["pointerup", "pointerleave", "pointercancel"].forEach(ev => b.addEventListener(ev, () => inp[m] = 0)); b.addEventListener("contextmenu", e => e.preventDefault())
    });
    function aimAt() { let tg = null, bd = FB === "owl" ? 470 : 380; for (const o of Object.values(PL)) if (o.team !== P.team && o.alive) { const d = Math.hypot(o.x - P.x, o.y - P.y); if (d < bd) { bd = d; tg = [o.x, o.y] } } return tg }
    function dirTo(tx, ty) { const tg = tx == null ? aimAt() : [tx, ty]; return Math.atan2(tg ? tg[1] - P.y : face[1], tg ? tg[0] - P.x : face[0]) }
    function shoot(ang, o = {}) { sfx("shoot"); const sp = o.sp || 460, b = { id: me.id + "_" + (seq++), from: me.id, team: P.team, x: P.x, y: P.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: o.life || (FB === "owl" ? 1.1 : .9), ch: "WORDQUEST"[seq % 9], d: o.d || 2, r: o.r || 5, pierce: !!o.pierce }; BL.push(b); send("shot", b) }
    function fire(tx, ty) { if (cd > 0 || !P.alive) return; shots++; let d = 2; if (P.rg > 0) d *= 2; if (FB === "dragon" && shots % 3 === 0) d += 2; shoot(dirTo(tx, ty), { d }); cd = P.rf > 0 ? .22 : .45 }
    const SPEC = {
      knight() { P.sh = 3 },
      ranger() { const a = dirTo(), d = P.rg > 0 ? 4 : 2;[-.24, 0, .24].forEach(k => shoot(a + k, { d })) },
      scholar() { P.rf = 4 },
      mage() { shoot(dirTo(), { sp: 380, r: 14, d: P.rg > 0 ? 8 : 4, pierce: true, life: 1.1 }) },
      sky() { let n = 0; while (n < 15) { const nx = P.x + face[0] * 10, ny = P.y + face[1] * 10; if (nx < PR || nx > AW - PR || ny < PR || ny > AH - PR || hitWall(nx, ny, PR)) break; P.x = nx; P.y = ny; n++ } P.inv = .5; spawn(P.x, P.y + PR, 6, "rgba(255,255,255,.8)", false) },
      golden() { P.rg = 5 }
    };
    function special() { if (acd > 0 || !P.alive || ended) return; sfx("special"); const f = SPEC[me.skin]; if (f) f(); acd = ABIL[me.skin].cd; spawn(P.x, P.y, 10, TEAMS[P.team].c, false) }
    cv.addEventListener("pointerdown", e => { const r = cv.getBoundingClientRect(); fire((e.clientX - r.left) * AW / r.width, (e.clientY - r.top) * AH / r.height) });
    M.on = (ev, p) => {
      const o = PL[p.id];
      if (ev === "pos" && o) { o.tx = p.x; o.ty = p.y; o.hp = p.hp; o.alive = p.alive; o.max = p.mx || HPMAX; o.sh = p.sh; o.bf = p.bf }
      else if (ev === "shot") BL.push({ life: .9, ...p });
      else if (ev === "hit") { const i = BL.findIndex(b => b.id === p.id); if (i >= 0 && !BL[i].pierce) BL.splice(i, 1); if (PL[p.to]) { PL[p.to].hp = p.hp; PL[p.to].fl = .25 } }
      else if (ev === "ko") { SC[p.team]++; KOS[p.from] = (KOS[p.from] || 0) + 1; { const v = PL[p.to]; if (v) { sfx("ko"); v.alive = false; spawn(v.x, v.y, 10, TEAMS[v.team].c, true) } } }
      else if (ev === "ans") ANS[p.id] = p.ok
    };
    function update(dt) {
      cd = Math.max(0, cd - dt); P.inv = Math.max(0, P.inv - dt); acd = Math.max(0, acd - dt); P.sh = Math.max(0, (P.sh || 0) - dt); P.rf = Math.max(0, (P.rf || 0) - dt); P.rg = Math.max(0, (P.rg || 0) - dt); if (inp.spec || inp.sq) { inp.sq = 0; special() } if (FB === "sprite" && P.alive) { regen += dt; if (regen >= 4) { regen = 0; P.hp = Math.min(P.max, P.hp + 1) } }
      if (P.alive) {
        let mx = inp.right - inp.left, my = inp.down - inp.up; P.mv = !!(mx || my);
        if (mx || my) {
          const l = Math.hypot(mx, my); mx /= l; my /= l; face = [mx, my]; const nx = P.x + mx * SPD * spd * dt, ny = P.y + my * SPD * spd * dt;
          if (nx > PR && nx < AW - PR && !hitWall(nx, P.y, PR)) P.x = nx; if (ny > PR && ny < AH - PR && !hitWall(P.x, ny, PR)) P.y = ny
        }
        if (inp.fire) fire()
      }
      else { P.rs -= dt; if (P.rs <= 0) { P.alive = true; P.hp = P.max; P.inv = 2; P.x = P.sp[0]; P.y = P.sp[1]; send("pos", { id: me.id, x: P.x, y: P.y, hp: P.hp, alive: true }) } }
      for (let i = BL.length - 1; i >= 0; i--) {
        const b = BL[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
        if (b.life <= 0 || b.x < 0 || b.x > AW || b.y < 0 || b.y > AH || hitWall(b.x, b.y, 2)) { BL.splice(i, 1); continue }
        if (P.alive && P.inv <= 0 && !(P.sh > 0) && !b.hitMe && b.team !== P.team && Math.hypot(b.x - P.x, b.y - P.y) < PR + (b.r || 5)) {
          if (b.pierce) b.hitMe = true; else BL.splice(i, 1); P.hp -= (b.d || 2); sfx("hit"); P.fl = .25; spawn(P.x, P.y, 5, "#ff3b4e", false); cv.animate([{ transform: "translate(0,0)" }, { transform: "translate(-6px,3px)" }, { transform: "translate(6px,-3px)" }, { transform: "translate(0,0)" }], { duration: 240 }); send("hit", { id: b.id, to: me.id, hp: P.hp });
          if (P.hp <= 0) { P.alive = false; sfx("ko"); P.rs = FB === "sprite" ? 1.5 : 3; spawn(P.x, P.y, 10, TEAMS[P.team].c, true); SC[b.team]++; KOS[b.from] = (KOS[b.from] || 0) + 1; send("ko", { from: b.from, to: me.id, team: b.team }) }
        }
      }
      pt += dt; if (pt > .16) { pt = 0; send("pos", { id: me.id, x: Math.round(P.x), y: Math.round(P.y), hp: P.hp, alive: P.alive, mx: P.max, sh: P.sh > 0 ? 1 : 0, bf: (P.rf > 0 || P.rg > 0) ? 1 : 0 }) }
    }
    function draw(now) {
      cx.fillStyle = "#7ed957"; cx.fillRect(0, 0, AW, AH); for (let x = 0; x < AW; x += 50)for (let y = 0; y < AH; y += 50)if ((x / 50 + y / 50) % 2) { cx.fillStyle = "#72cc4e"; cx.fillRect(x, y, 50, 50) }
      SPAWNS.forEach((s, i) => { if (cnt[i]) { cx.fillStyle = TEAMS[i].c + "55"; cx.beginPath(); cx.arc(s[0], s[1], 56, 0, 7); cx.fill() } });
      WALLS.forEach(([a, b, w, h]) => { cx.fillStyle = "#d99a3e"; cx.strokeStyle = "#0b1238"; cx.lineWidth = 4; cx.beginPath(); cx.roundRect(a, b, w, h, 8); cx.fill(); cx.stroke(); cx.fillStyle = "#f2b95e"; cx.fillRect(a + 6, b + 6, w - 12, 10); cx.strokeStyle = "rgba(11,18,56,.35)"; cx.lineWidth = 2; for (let x = a + 30; x < a + w - 10; x += 34) { cx.beginPath(); cx.moveTo(x, b + 20); cx.lineTo(x, b + h - 8); cx.stroke() } });
      for (const b of BL) { cx.globalAlpha = .35; cx.fillStyle = TEAMS[b.team].c; cx.beginPath(); cx.arc(b.x - b.vx * .025, b.y - b.vy * .025, 7, 0, 7); cx.arc(b.x - b.vx * .05, b.y - b.vy * .05, 5, 0, 7); cx.fill(); cx.globalAlpha = 1; cx.fillStyle = TEAMS[b.team].c; cx.strokeStyle = "#0b1238"; cx.lineWidth = 3; cx.beginPath(); { const s = (b.r || 5) * 1.8; cx.roundRect(b.x - s, b.y - s, s * 2, s * 2, 5) } cx.fill(); cx.stroke(); cx.fillStyle = "#fff"; cx.font = "800 12px system-ui"; cx.textAlign = "center"; cx.fillText(b.ch || "W", b.x, b.y + 4) }
      for (const o of Object.values(PL)) {
        if (!o.alive) continue; if (o.id === me.id && o.inv > 0 && Math.floor(now / 90) % 2) continue; const by = o.mv ? Math.sin(o.ph) * 3.5 : Math.sin(now / 280 + o.x) * 1.3;
        cx.fillStyle = "rgba(0,0,0,.2)"; cx.beginPath(); cx.ellipse(o.x, o.y + PR, PR, 6, 0, 0, 7); cx.fill();
        cx.fillStyle = TEAMS[o.team].c; cx.strokeStyle = "#0b1238"; cx.lineWidth = 4; cx.beginPath(); cx.arc(o.x, o.y + by, PR + 3, 0, 7); cx.fill(); cx.stroke();
        if (o.sh > 0) { cx.fillStyle = "rgba(120,200,255,.28)"; cx.strokeStyle = "rgba(255,255,255,.95)"; cx.lineWidth = 4; cx.beginPath(); cx.arc(o.x, o.y + by, PR + 10, 0, 7); cx.fill(); cx.stroke() }
        if (o.bf > 0 || (o.id === me.id && (P.rf > 0 || P.rg > 0))) { cx.strokeStyle = "#ffd21f"; cx.lineWidth = 3; cx.beginPath(); cx.arc(o.x, o.y + by, PR + 7 + Math.sin(now / 90) * 2, 0, 7); cx.stroke() }
        if (o.fig && FG[o.fig]) { const fi = figImg(o.fig); if (fi.complete) cx.drawImage(fi, o.x + PR - 2, o.y + PR - 22 + Math.sin(now / 200 + o.x) * 2, 24, 24) }
        cx.save(); cx.beginPath(); cx.arc(o.x, o.y + by, PR, 0, 7); cx.clip(); cx.fillStyle = "#fff3c9"; cx.fill(); const im = headImg(o.skin); if (im.complete) cx.drawImage(im, o.x - PR, o.y - PR + by, PR * 2, PR * 2); if (o.fl > 0) { cx.fillStyle = "rgba(255,255,255," + Math.min(1, o.fl * 4) + ")"; cx.fillRect(o.x - PR, o.y - PR + by, PR * 2, PR * 2) } cx.restore();
        cx.fillStyle = "rgba(18,53,43,.4)"; cx.fillRect(o.x - 18, o.y - PR - 14, 36, 5); cx.fillStyle = o.hp > 4 ? "#2d8a55" : "#c4452f"; cx.fillRect(o.x - 18, o.y - PR - 14, 36 * Math.max(0, o.hp) / (o.max || HPMAX), 5);
        cx.fillStyle = "#12352b"; cx.font = "800 11px system-ui"; cx.textAlign = "center"; cx.fillText(o.id === me.id ? "You" : o.name.slice(0, 10), o.x, o.y - PR - 18)
      }
      for (const f of FX) { cx.globalAlpha = Math.max(0, Math.min(1, f.life * 2)); if (f.ch) { cx.fillStyle = f.col; cx.strokeStyle = "#0b1238"; cx.lineWidth = 2; cx.beginPath(); cx.roundRect(f.x - 9, f.y - 9, 18, 18, 4); cx.fill(); cx.stroke(); cx.fillStyle = "#fff"; cx.font = "800 11px system-ui"; cx.textAlign = "center"; cx.fillText(f.ch, f.x, f.y + 4) } else { cx.fillStyle = f.col; cx.beginPath(); cx.arc(f.x, f.y, f.dust ? 4 : 5, 0, 7); cx.fill() } cx.globalAlpha = 1 }
      const used = [...new Set(cfg.roster.map(r => r.team))]; used.forEach((ti, i) => { cx.fillStyle = TEAMS[ti].c; cx.strokeStyle = "#0b1238"; cx.lineWidth = 3; cx.beginPath(); cx.roundRect(10 + i * 72, 10, 66, 28, 8); cx.fill(); cx.stroke(); cx.fillStyle = "#fff"; cx.font = "800 16px system-ui"; cx.textAlign = "center"; cx.fillText(SC[ti], 43 + i * 72, 30) });
      const left = cfg.t0 + cfg.dur - now, sec = Math.max(0, Math.ceil(left / 1000)), txt = now < cfg.t0 ? "Get ready" : Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
      cx.fillStyle = "#0b1238"; cx.beginPath(); cx.roundRect(AW / 2 - 45, 10, 90, 30, 10); cx.fill(); cx.fillStyle = "#fff"; cx.font = "800 18px system-ui"; cx.textAlign = "center"; cx.fillText(txt, AW / 2, 31);
      { const A = ABIL[me.skin], rdy = acd <= 0; cx.fillStyle = rdy ? "#3ddc4a" : "#0b1238"; cx.strokeStyle = "#0b1238"; cx.lineWidth = 3; cx.beginPath(); cx.roundRect(10, AH - 40, 200, 30, 10); cx.fill(); cx.stroke(); if (!rdy) { cx.fillStyle = "#2f8bff"; cx.beginPath(); cx.roundRect(10, AH - 40, 200 * (1 - acd / A.cd), 30, 10); cx.fill() } cx.fillStyle = "#fff"; cx.font = "800 13px system-ui"; cx.textAlign = "left"; cx.fillText(A.n + (rdy ? ": READY (E)" : ": " + Math.ceil(acd) + "s"), 20, AH - 20) }
      if (now < cfg.t0) { cx.fillStyle = "rgba(18,53,43,.55)"; cx.fillRect(0, 0, AW, AH); cx.fillStyle = "#fff"; cx.font = "800 90px system-ui"; cx.fillText(Math.ceil((cfg.t0 - now) / 1000), AW / 2, AH / 2 + 30); cx.font = "800 20px system-ui"; cx.fillText("You are on the " + TEAMS[P.team].n + " team", AW / 2, AH / 2 + 80) }
      if (!P.alive) { cx.fillStyle = "rgba(18,53,43,.5)"; cx.fillRect(0, 0, AW, AH); cx.fillStyle = "#fff"; cx.font = "800 28px system-ui"; cx.fillText("Knocked out. Back in " + Math.ceil(P.rs) + "...", AW / 2, AH / 2) }
    }
    function endMatch() {
      if (ended) return; ended = true; M.phase = "question";
      const pool = DATA.filter(q => q.t === "mc" && !q.img), q = pool[cfg.seed % pool.length], deadline = Date.now() + 20000; let done = false;
      function answer(ok) { if (done) return; done = true; ANS[me.id] = ok; if (ok) collect(q); send("ans", { id: me.id, team: P.team, ok }) }
      go(() => {
        app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">Final question!</div><p class="pmsg">Time is up! A correct answer gives your team 2 bonus points. <b id="qt">20</b>s left</p>
    <div class="qboard">${esc(q.q)}</div>${q.o.map((o, i) => `<button class="btn opt" data-i="${i}"><span class="l">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}<div class="fb" id="fb" role="status"></div></div>`;
        document.querySelectorAll(".opt").forEach(b => b.onclick = () => {
          const ok = q.o[+b.dataset.i] === q.a; b.classList.add(ok ? "right" : "wrong");
          document.querySelectorAll(".opt").forEach(x => { x.disabled = true; if (q.o[+x.dataset.i] === q.a) x.classList.add("right") });
          $("#fb").className = "fb " + (ok ? "ok" : "no"); $("#fb").textContent = ok ? "Correct! Waiting for your classmates..." : "Not quite. Waiting for your classmates..."; answer(ok); ok ? burst(b) : shake(b)
        });
        M.tm = setInterval(() => {
          const left = Math.ceil((deadline - Date.now()) / 1000); if ($("#qt")) $("#qt").textContent = Math.max(0, left);
          if (!done && left <= 0) { answer(false); document.querySelectorAll(".opt").forEach(x => x.disabled = true) }
          if (Object.keys(ANS).length >= cfg.roster.length || Date.now() > deadline + 4000) { clearInterval(M.tm); results() }
        }, 400)
      })
    }
    function results() {
      const bonus = [0, 0, 0]; cfg.roster.forEach(r => { if (ANS[r.id]) bonus[r.team] += 2 });
      const used = [...new Set(cfg.roster.map(r => r.team))], tot = ti => SC[ti] + bonus[ti], best = Math.max(...used.map(tot)), win = tot(P.team) === best;
      const k = KOS[me.id] || 0, ok = !!ANS[me.id], coins = 10 + 3 * k + (win ? 20 : 0), hearts = (ok ? 1 : 0) + (win ? 1 : 0);
      if (!M.paid) { M.paid = true; me.coins += coins; me.hearts += hearts; me.stats.matches++; if (win) me.stats.wins++; store.save(me) }
      const rank = used.slice().sort((a, b) => tot(b) - tot(a));
      go(() => {
        app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">${win ? "Your team won!" : "Match results"}</div>${win ? `<div style="text-align:center">${charSVG(me.skin, me.fig, 170, false, "cheer")}</div>` : ""}
    <table><tr><th>Team</th><th>KOs</th><th>Bonus</th><th>Total</th></tr>${rank.map(ti => `<tr class="${ti === P.team ? "me" : ""}"><td><b style="color:${TEAMS[ti].c}">&#9679;</b> ${TEAMS[ti].n}</td><td>${SC[ti]}</td><td>${bonus[ti]}</td><td>${tot(ti)}</td></tr>`).join("")}</table>
    <h3 style="margin:14px 0 4px">Players</h3><table>${cfg.roster.slice().sort((a, b) => (KOS[b.id] || 0) - (KOS[a.id] || 0)).map(r => `<tr><td>${esc(r.name)}</td><td>${TEAMS[r.team].n}</td><td>${KOS[r.id] || 0} KOs</td><td>${ANS[r.id] ? "Answer right" : "Answer missed"}</td></tr>`).join("")}</table>
    <p class="pmsg">You earned ${coins} coins and ${hearts} heart${hearts === 1 ? "" : "s"}.</p>
    <button class="btn green" id="again">Back to the lobby</button><button class="btn dark" id="lv2">Leave room</button></div>`;
        $("#again").onclick = () => { M.phase = "lobby"; M.on = null; M.lobbyOn = false; lobby() }; $("#lv2").onclick = () => playMenu(); if (win) setTimeout(() => burst($(".ribbon"), 50), 200)
      })
    }
    G = { kd, ku, raf: 0 };
    const loop = ts => {
      const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; const now = Date.now();
      if (now >= cfg.t0 + cfg.dur) { endMatch(); return }
      if (now >= cfg.t0) update(dt);
      for (const o of Object.values(PL)) {
        if (o.id !== me.id) { const dx = o.tx - o.x, dy = o.ty - o.y; o.mv = Math.abs(dx) + Math.abs(dy) > 1.5; o.x += dx * Math.min(1, dt * 10); o.y += dy * Math.min(1, dt * 10) }
        o.ph = (o.ph || 0) + (o.mv ? dt * 16 : 0); o.fl = Math.max(0, (o.fl || 0) - dt); if (o.mv && o.alive && Math.random() < dt * 14) FX.push({ x: o.x, y: o.y + PR, vx: (Math.random() - .5) * 30, vy: -20, life: .35, col: "rgba(255,255,255,.7)", ch: "", dust: 1 })
      }
      for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.x += f.vx * dt; f.y += f.vy * dt; if (!f.dust) f.vy += 520 * dt; f.life -= dt; if (f.life <= 0) FX.splice(i, 1) }
      if (sb) { sb.textContent = acd > 0 ? Math.ceil(acd) : "SPECIAL"; sb.style.opacity = acd > 0 ? .6 : 1 } draw(now); if (G) G.raf = requestAnimationFrame(loop)
    };
    G.raf = requestAnimationFrame(loop)
  })
}

function difficulty() {
  go(() => {
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">Select a trail</div>${ORDER.map((d, i) => {
      const open = i === 0 || me.done[ORDER[i - 1]] >= LEVELS[ORDER[i - 1]];
      return `<button class="sign" data-d="${d}" ${open ? "" : "disabled"}><span class="st">${open ? me.done[d] + " of " + LEVELS[d] : "Locked"}</span><b>${d}</b><small>${BLURB[d]}</small>
  <div class="dots2">${Array.from({ length: LEVELS[d] }, (_, k) => `<i class="${k < me.done[d] ? "on" : ""}"></i>`).join("")}</div></button>`
    }).join("")}${backBtn}</div>`;
    document.querySelectorAll("[data-d]").forEach(b => b.onclick = () => levels(b.dataset.d)); $("#bk").onclick = menu
  })
}
function levels(d) {
  go(() => {
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">${d}</div><div class="stones">${Array.from({ length: LEVELS[d] }, (_, i) => {
      const done = i < me.done[d], open = i <= me.done[d];
      return `<button class="stone2 ${done ? "done" : ""}" data-l="${i + 1}" ${open ? "" : "disabled"} aria-label="Level ${i + 1}${done ? ", cleared" : open ? "" : ", locked"}">${done ? IC.check : open ? i + 1 : IC.lock}</button>`
    }).join("")}</div>${backBtn}</div>`;
    document.querySelectorAll("[data-l]").forEach(b => b.onclick = () => startLevel(d, +b.dataset.l)); $("#bk").onclick = difficulty
  })
}
function startLevel(d, l) { run = { d, l, qs: pickQs(d, l), i: 0, pwUsed: false, shield: false, midas: false, right: 0, first: l > me.done[d], streak: 0, best: 0, earned: 0, pwUsed: false, shield: false, midas: false }; question() }
function question() {
  go(() => {
    const q = run.qs[run.i]; let used = false, answered = false, body = ""; const TL = { Easy: 20, Moderate: 25, Hard: 35 }[run.d] + (me.fig === "owl" ? 5 : 0); let t0 = Date.now(), tm = null, lastTick = 99;
    if (q.t === "mc") {
      if (q.img) body += `<div class="pic"><b>&#9632;</b>Picture to add: ${esc(q.img)}</div>`;
      body += `<div class="qboard">${esc(q.q)}</div>` + q.o.map((o, i) => `<button class="btn opt" data-i="${i}"><span class="l">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("");
    } else if (q.t === "un") {
      body += `<div class="qboard">${esc(q.desc)}</div><div class="tiles" aria-label="Scrambled letters">${[...q.scr].map(c => `<span class="tile">${esc(c)}</span>`).join("")}</div>`;
    } else {
      body += `<button class="btn small" id="aud">Play audio</button><div class="qboard">${esc(q.q)}</div>`;
    }
    if (q.t !== "mc") body += `<label for="ans">Your answer</label><input id="ans" autocomplete="off" autocapitalize="none"><button class="btn green" id="sub">Submit</button>`;
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">${run.d}, level ${run.l}</div><div class="prog2">${run.qs.map((_, k) => `<i class="${k <= run.i ? "on" : ""}"></i>`).join("")}</div><div class="metaq">Question ${run.i + 1} of ${run.qs.length}${(run.streak || 0) >= 2 ? ` <span class="combo">COMBO x${run.streak}</span>` : ""}</div><div class="timer" role="timer" aria-label="Time left"><i id="tb"></i><b id="tt">${TL}</b></div>${body}
 <div id="clue"></div><div class="fb" id="fb" role="status"></div>
 <button class="btn small dark" id="key">Use a key for a clue</button> <button class="btn small" id="pw" title="${ABIL[me.skin].pd}">${ABIL[me.skin].pn}</button><p class="pdesc">Special power, once per level: ${ABIL[me.skin].pd}</p> <button class="btn small" id="nx" hidden>Next</button></div>`;
    const fb = $("#fb");
    tm = setInterval(() => {
      const b = $("#tb"); if (!b) { clearInterval(tm); return }
      const left = Math.max(0, TL - (Date.now() - t0) / 1000); b.style.width = (left / TL * 100) + "%"; b.className = left < TL * .25 ? "low" : left < TL * .5 ? "mid" : ""; $("#tt").textContent = Math.ceil(left); if (left > 0 && left < 5 && Math.ceil(left) !== lastTick) { lastTick = Math.ceil(left); sfx("tick") }
      if (left <= 0 && !answered) { clearInterval(tm); if (q.o) document.querySelectorAll(".opt").forEach(x => { if (q.o[+x.dataset.i] === q.a) x.classList.add("right") }); finish(false, true) }
    }, 100);
    function finish(ok, late) {
      if (answered) return; answered = true; clearInterval(tm);
      const left = Math.max(0, TL - (Date.now() - t0) / 1000);
      if (ok) {
        run.right++; run.streak++; run.best = Math.max(run.best, run.streak); let gain, msg = "Correct!";
        if (run.first) {
          const fast = left >= TL * (me.fig === "fox" ? .35 : .5) ? 5 : 0, combo = Math.min(me.fig === "dragon" ? 15 : 10, (me.fig === "dragon" ? 3 : 2) * (run.streak - 1)); gain = 10 + fast + combo + (me.fig === "inky" ? 2 : 0); if (run.midas) { gain *= 2; run.midas = false } if (fast) me.stats.fast++; me.hearts++;
          msg += " +1 heart, +" + gain + " coins" + (fast ? " (fast bonus +5)" : "") + (combo ? " (combo +" + combo + ")" : "")
        }
        else { gain = 3; msg += " +3 coins (replay)" }
        me.coins += gain; run.earned += gain; fb.className = "fb ok"; fb.textContent = msg + (collect(q) ? " New word collected!" : ""); burst($(".qboard"));
        if (run.streak >= 2) comboPop(run.streak); sfx("good"); setTimeout(() => sfx("coin"), 260)
      }
      else { const sv = run.shield; if (sv) run.shield = false; else run.streak = 0; fb.className = "fb no"; fb.textContent = (late ? "Time's up! " : "Not quite. ") + "The answer is: " + q.a + (sv ? " Your shield saved your combo!" : ""); shake($(".qboard")); sfx("bad") }
      document.querySelectorAll(".opt").forEach(b => b.disabled = true); if ($("#ans")) $("#ans").disabled = true;
      store.save(me); $("#nx").hidden = false; $("#nx").focus(); $("#key").disabled = true;
      document.querySelectorAll(".opt").forEach(b => b.disabled = true); if ($("#sub")) $("#sub").disabled = true;
    }
    document.querySelectorAll(".opt").forEach(b => b.onclick = () => {
      const ok = q.o[+b.dataset.i] === q.a; b.classList.add(ok ? "right" : "wrong");
      if (!ok) document.querySelectorAll(".opt").forEach(x => { if (q.o[+x.dataset.i] === q.a) x.classList.add("right") }); finish(ok)
    });
    if ($("#sub")) { const sub = () => finish(norm($("#ans").value) === norm(q.a)); $("#sub").onclick = sub; $("#ans").onkeydown = e => { if (e.key === "Enter") sub() } }
    if ($("#aud")) $("#aud").onclick = () => {
      if (!("speechSynthesis" in window)) { fb.textContent = "Audio is not supported in this browser."; return }
      const u = new SpeechSynthesisUtterance(q.say); u.lang = "en-US"; u.rate = .85; speechSynthesis.cancel(); speechSynthesis.speak(u)
    };
    $("#key").onclick = () => {
      if (used || answered) return;
      if (me.keys < 1) { fb.className = "fb no"; fb.textContent = "You have no keys left."; return }
      used = true; me.keys--; store.save(me); $("#clue").innerHTML = `<div class="clue">Clue: ${esc(q.c)}</div>`; $("#key").disabled = true
    };
    if (run.pwUsed) $("#pw").disabled = true;
    $("#pw").onclick = () => {
      if (answered || run.pwUsed) return; run.pwUsed = true; $("#pw").disabled = true; const id = me.skin;
      if (id === "knight") { run.shield = true; fb.className = "fb ok"; fb.textContent = "Shield up! Your next wrong answer keeps your combo." }
      else if (id === "ranger") { if (q.o) { [...document.querySelectorAll(".opt")].filter(x => q.o[+x.dataset.i] !== q.a).sort(() => Math.random() - .5).slice(0, 2).forEach(x => { x.disabled = true; x.style.opacity = .3 }) } else if ($("#ans")) $("#ans").placeholder = "Starts with " + q.a[0].toUpperCase() }
      else if (id === "scholar") { $("#clue").innerHTML = `<div class="clue">Clue: ${esc(q.c)}</div>` }
      else if (id === "mage") { t0 += 10000; fb.className = "fb ok"; fb.textContent = "Time freeze! +10 seconds." }
      else if (id === "sky") { answered = true; clearInterval(tm); fb.className = "fb ok"; fb.textContent = "Fly past! Skipped with no penalty and your combo is safe."; $("#nx").hidden = false; $("#nx").focus(); $("#key").disabled = true; document.querySelectorAll(".opt").forEach(b => b.disabled = true); if ($("#ans")) $("#ans").disabled = true; if ($("#sub")) $("#sub").disabled = true }
      else if (id === "golden") { run.midas = true; fb.className = "fb ok"; fb.textContent = "Midas Touch! Your next correct answer pays double coins." }
    };
    $("#nx").onclick = () => { run.i++; run.i < run.qs.length ? question() : result() };
  })
}
const TIERS = [{ n: "Wooden chest", c: ["#c98a3d", "#7a4a1d"] }, { n: "Silver chest", c: ["#c3cfe2", "#7d8aa3"] }, { n: "Golden chest", c: ["#ffd24a", "#d98a00"] }];
const chestSVG = tier => { const [bd, bn] = TIERS[tier].c; return `<svg viewBox="0 0 160 140" class="chest" role="img" aria-label="${TIERS[tier].n}"><circle class="cglow" cx="80" cy="64" r="66" fill="#fff6b0"/><g class="cbody"><rect x="24" y="62" width="112" height="62" rx="10" fill="${bd}" stroke="#0b1238" stroke-width="5"/><rect x="24" y="86" width="112" height="14" fill="${bn}" stroke="#0b1238" stroke-width="3"/><rect x="68" y="78" width="24" height="28" rx="5" fill="#ffe45c" stroke="#0b1238" stroke-width="4"/><circle cx="80" cy="92" r="4" fill="#0b1238"/></g><g class="clid"><path d="M24 62Q24 24 80 24Q136 24 136 62Z" fill="${bd}" stroke="#0b1238" stroke-width="5"/><path d="M52 28v34M108 28v34" stroke="${bn}" stroke-width="10"/></g></svg>` };
function openChest(tier) {
  me.stats.chests++;
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), out = [], coins = [R(15, 30), R(30, 60), R(60, 120)][tier];
  me.coins += coins; out.push({ t: "coin", txt: "+" + coins + " coins" });
  if (Math.random() < [.3, .5, .8][tier]) { const k = tier === 2 ? 2 : 1; me.keys += k; out.push({ t: "key", txt: "+" + k + " key" + (k > 1 ? "s" : "") }) }
  if (Math.random() < [.12, .2, .3][tier]) {
    const cap = [40, 70, 130][tier],
    pool = [...Object.keys(SK).filter(id => !me.skins.includes(id) && SK[id].p <= cap).map(id => ({ kind: "skin", id })), ...Object.keys(FG).filter(id => !me.figs.includes(id) && FG[id].p <= cap).map(id => ({ kind: "fig", id }))];
    if (pool.length) { const d = pool[R(0, pool.length - 1)]; (d.kind === "skin" ? me.skins : me.figs).push(d.id); out.push({ t: d.kind, id: d.id, txt: "New " + (d.kind === "skin" ? "character: " + SK[d.id].n : "figurine: " + FG[d.id].n) + "!" }) }
  }
  store.save(me); return out
}
function result() {
  go(() => {
    const { d, l } = run; if (l > me.done[d]) me.done[d] = l; me.stats.bestCombo = Math.max(me.stats.bestCombo, run.best); if (run.right === run.qs.length) me.stats.perfect++; store.save(me);
    const more = l < LEVELS[d], perfect = run.right === run.qs.length, base = ORDER.indexOf(d), lucky = run.first && me.fig === "sprite" && Math.random() < .25, tier = Math.min(2, base + (perfect ? 1 : 0) + (lucky ? 1 : 0));
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">${perfect ? "Perfect level!" : "Level cleared!"}</div>
 <div style="text-align:center">${charSVG(me.skin, me.fig, run.first ? 120 : 170, false, "cheer")}</div>
 <p class="pmsg" style="text-align:center">You answered ${run.right} of ${run.qs.length} correctly. Best combo: x${run.best}. Coins earned: ${run.earned}.</p>
 ${run.first ? `<div class="chestbox"><p class="pmsg" id="cm">${TIERS[tier].n}${tier > base ? (lucky ? " (Star Sprite luck upgraded it!)" : " (upgraded for a perfect level!)") : ""}. Tap it to open!</p><button class="chestbtn" id="chest">${chestSVG(tier)}</button><div id="loot" aria-live="polite"></div></div>`
        : `<p class="pmsg" style="text-align:center">Replay: practice only. Hearts and chests come from your first clear of a level.</p>`}
 <div id="after" ${run.first ? "hidden" : ""}>${more ? `<button class="btn green" id="n">Next level</button>` : `<p><b>${d} trail complete!</b></p>`}<button class="btn" id="m">Back to levels</button></div></div>`;
    if (more) $("#n").onclick = () => startLevel(d, l + 1); $("#m").onclick = difficulty;
    setTimeout(() => { burst($(".ribbon"), 30); sfx("win") }, 200);
    if (run.first) {
      let opened = false; $("#chest").onclick = () => {
        if (opened) return; opened = true; $(".chest").classList.add("open"); sfx("chest"); $("#cm").textContent = "";
        setTimeout(() => {
          const r = openChest(tier); burst($("#chest"), 70); sfx("coin");
          $("#loot").innerHTML = r.map(x => `<div class="lootcard">${x.t === "coin" ? IC.coin : x.t === "key" ? IC.key : x.t === "skin" ? charSVG(x.id, "", 84, false, "still") : `<svg viewBox="0 0 50 50" width="60" aria-hidden="true">${FG[x.id].svg}</svg>`}<b>${esc(x.txt)}</b></div>`).join("");
          $(".hudbar").outerHTML = stats(); $("#after").hidden = false
        }, 650)
      }
    }
  })
}
async function leaderboard() {
  go(() => { app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">Leaderboards</div><p>Loading...</p></div>` });
  const all = await store.board(), mid = me.id || me.email, ix = all.findIndex(u => (u.id || u.email) === mid);
  go(() => {
    app.innerHTML = `${stats()}<div class="panel"><div class="ribbon">Leaderboards</div><table><tr><th>Rank</th><th>Name</th><th>Section</th><th>Score</th></tr>
 ${all.slice(0, 10).map((u, i) => `<tr class="${(u.id || u.email) === mid ? "me" : ""}"><td>${i + 1}</td><td>${esc(u.username)}</td><td>${esc(u.section)}</td><td>${u.hearts}</td></tr>`).join("")}</table>
 <p>Your rank: ${ix < 0 ? "outside the top 50" : ix + 1}</p>${backBtn}</div>`; $("#bk").onclick = menu
  })
}
(() => {
  const fx = document.createElement("div"); fx.id = "fx"; fx.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span"); s.className = "fl"; s.textContent = "WORDQUEST"[i % 9];
    s.style.cssText = `left:${(i * 7.3 + 3) % 94}%;animation-duration:${15 + (i * 3) % 11}s;animation-delay:-${(i * 5) % 18}s;font-size:${1 + (i % 3) * .4}rem`; fx.appendChild(s)
  }
  document.body.prepend(fx)
})();
function privacy(need) {
  const d = $("#pn"); d.innerHTML = `<div class="pnin">${privacyHTML()}<div class="row" style="margin-top:14px">${need ? `<button class="btn green" id="pagree">I agree</button><button class="btn dark" id="pso">Sign out</button>` : `<button class="btn" id="pclose">Close</button>`}</div></div>`;
  d.oncancel = e => { if (need) e.preventDefault() };
  if (need) { $("#pagree").onclick = () => { me.consent = { at: new Date().toISOString(), v: 1 }; store.save(me); d.close() }; $("#pso").onclick = () => { d.close(); signOut() } } else $("#pclose").onclick = () => d.close();
  if (!d.open) d.showModal()
}
(() => {
  const d = document.createElement("dialog"); d.id = "pn"; d.setAttribute("aria-label", "Data Privacy Notice"); document.body.appendChild(d);
  const f = document.createElement("footer"); f.id = "foot";
  f.innerHTML = `<p><b>WordQuest</b> is a student research project for Practical Research 2 (${pv("school", "school name")}). We collect your email, username, section, and game progress for our study. Your information is used for research only and is never sold.</p>
 <p><button class="link" id="fpn">Read the Data Privacy Notice</button> &nbsp; <button class="link" id="fsnd">Sound: on</button> &nbsp; Questions or requests about your data: ${pv("contact", "contact email")}</p>`;
  document.body.appendChild(f); $("#fpn").onclick = () => privacy(false)
})();
(() => {
  const d = document.createElement("dialog"); d.id = "dr"; d.setAttribute("aria-label", "Daily reward"); document.body.appendChild(d);
  const first = () => { actx(); musicSync() }; document.addEventListener("pointerdown", first); document.addEventListener("keydown", first);
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("button"); if (b && !b.classList.contains("opt") && !b.classList.contains("pb") && b.id !== "chest") sfx("click") });
  const s = document.getElementById("fsnd"); if (s) { window.sndLabel = () => { s.textContent = "Sound: " + (AUD.sfx || AUD.mus ? "on" : "off") }; const lab = window.sndLabel; lab(); s.onclick = () => { const on = !(AUD.sfx || AUD.mus); AUD.sfx = AUD.mus = on; saveAud(); lab(); actx(); musicSync(); if (on) sfx("coin") } }
})();
(async () => {
  if (CLOUD) { const { data } = await sb.auth.getSession(), u = data.session && data.session.user; if (u) return enter(u, u.email); return authScreen() }
  const s = store.session(); if (s && store.users()[s]) { me = fix(store.users()[s]); menu() } else authScreen()
})();
