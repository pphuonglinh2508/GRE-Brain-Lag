/* App logic: flashcards, groups, synonym drills, quiz, comics */
const ALL = [];
SETS.forEach(s => s.w.forEach((a, i) => ALL.push({w:a[0], pr:a[1], d:a[2], syn:a[3], ex:a[4], mn:a[5], em:a[6], sfx:a[7], vn:a[8] || '', pos:a[9] || '', g:s.n, i, key:s.n+':'+a[0]})));
const BYKEY = Object.fromEntries(ALL.map(x => [x.key, x]));
const WFIRST = {};
ALL.forEach(x => { if (!WFIRST[x.w]) WFIRST[x.w] = x.key; });
const $ = (s, r=document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const stem = w => w.toLowerCase().slice(0, Math.max(4, w.length - 3));
const posOf = w => { const x = typeof w === 'string' ? BYKEY[WFIRST[w]] : w; return x && x.pos ? x.pos : ''; };
const posTag = w => { const p = posOf(w); return p ? `<span class="pos">(${esc(p)})</span>` : ''; };
const wl = w => esc(typeof w === 'string' ? w : w.w) + posTag(w);
const wTxt = x => x.w + (x.pos ? ' (' + x.pos + ')' : '');

/* ---------- persistence: this device, plus optional cloud sync ----------
   Cloud sync uses Firebase (see js/sync-config.js and the README), or the
   Claude account when the page runs as a Claude artifact. */
const LS = 'gwc-state-v1';
let S = {updated:0, stats:{}, history:[], rot:{newG:1, cycle:1}, len:10, mode:'rot', one:1, fcGroup:'all', mm:{kind:'match', scope:'rot', pairs:6, len:10}};
try { const r = localStorage.getItem(LS); if (r) S = Object.assign(S, JSON.parse(r)); } catch(e) {}
let cloud = null, pushT = null, syncState = 'local', syncUser = '', syncBusy = false, fbAuth = null;
const plain = o => JSON.parse(JSON.stringify(o));
function storeLocal() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch(e) {} }
function save() {
  S.updated = Date.now();
  storeLocal();
  if (cloud) { clearTimeout(pushT); pushT = setTimeout(() => cloud.set(plain(S)).catch(() => {}), 1200); }
}
// combine two progress snapshots (phone + laptop) without losing quiz data
function mergeState(a, b) {
  if (!b || typeof b !== 'object') return a;
  const newer = (b.updated || 0) > (a.updated || 0) ? b : a;
  const out = Object.assign({}, a, b, newer);              // settings: the newer device wins
  out.stats = Object.assign({}, a.stats || {});
  for (const [k, v] of Object.entries(b.stats || {})) {     // per word: keep the record with more answers
    const o = out.stats[k], n = x => (x.r || 0) + (x.w || 0);
    if (!o || n(v) > n(o) || (n(v) === n(o) && (v.t || 0) > (o.t || 0))) out.stats[k] = v;
  }
  const seen = new Set();
  out.history = [...(a.history || []), ...(b.history || [])].filter(h => {
    const id = h.t + '|' + h.m; if (seen.has(id)) return false; seen.add(id); return true;
  }).sort((x, y) => x.t - y.t).slice(-60);
  const ta = a.today, tb = b.today;                          // today's misses: latest day, newer device
  out.today = !ta ? tb : !tb ? ta : ta.d !== tb.d ? (ta.d > tb.d ? ta : tb) : newer.today;
  out.updated = Math.max(a.updated || 0, b.updated || 0);
  return out;
}
function safeRerender() { if (current !== 'quiz' || Q.state === 'setup') rerender(); }
async function syncNow() {
  if (!cloud || syncBusy) return;
  syncBusy = true;
  try {
    const before = JSON.stringify(S);
    const remote = await cloud.get();
    if (remote) S = mergeState(S, remote);
    storeLocal();
    await cloud.set(plain(S));
    syncState = 'synced';
    if (JSON.stringify(S) !== before || current === 'quiz') safeRerender();
  } catch(e) { syncState = 'error'; if (current === 'quiz' && Q.state === 'setup') renderQuiz(); }
  syncBusy = false;
}
// pull the latest progress whenever you come back to the tab (e.g. after studying on your phone)
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(); });

// Option A: Claude account (when running as a Claude artifact)
(async () => {
  try {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
    if (!db || !user) return;
    const id = await user.id(); if (!id) return;
    const ref = db.collection('data/users/' + id).doc('progress');
    cloud = {kind:'claude', get: async () => { const s = await ref.get(); return s.exists ? s.data() : null; }, set: d => ref.set(d)};
    syncUser = 'your Claude account';
    syncNow();
  } catch(e) {}
})();

// Option B: Firebase + Google sign-in (works on GitHub Pages; set up in js/sync-config.js)
const FB_VER = '10.12.2';
function loadScript(src) { return new Promise((ok, bad) => { const t = document.createElement('script'); t.src = src; t.onload = ok; t.onerror = bad; document.head.appendChild(t); }); }
(async () => {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || window.claude) return;
  try {
    for (const m of ['app', 'auth', 'firestore']) await loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-${m}-compat.js`);
    firebase.initializeApp(cfg);
    fbAuth = firebase.auth();
    const fs = firebase.firestore();
    fbAuth.getRedirectResult().catch(() => {});
    fbAuth.onAuthStateChanged(u => {
      if (u) {
        const ref = fs.collection('progress').doc(u.uid);
        cloud = {kind:'firebase', get: async () => { const s = await ref.get(); return s.exists ? s.data() : null; }, set: d => ref.set(d)};
        syncUser = u.email || 'your Google account';
        syncNow();
      } else { cloud = null; syncUser = ''; syncState = 'local'; }
      if (current === 'quiz' && Q.state === 'setup') renderQuiz();
    });
  } catch(e) { console.warn('Sync could not start', e); }
})();
function signIn() {
  if (!fbAuth) return;
  const p = new firebase.auth.GoogleAuthProvider();
  fbAuth.signInWithPopup(p).catch(e => {
    if (e && /popup/.test(e.code || '')) fbAuth.signInWithRedirect(p);
    else alert('Sign-in failed: ' + (e && e.message ? e.message : e));
  });
}
function signOut() { if (fbAuth) fbAuth.signOut(); }

// Option C: backup file (no setup; move it between devices by AirDrop, Zalo, email...)
function exportProgress() {
  const blob = new Blob([JSON.stringify(S, null, 1)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gre-brain-lag-progress-' + new Date().toLocaleDateString('en-CA') + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function importProgress(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || typeof d.stats !== 'object') throw new Error('not a progress file');
      S = mergeState(S, d); save(); syncNow(); renderQuiz();
      alert('Progress loaded and merged with this device.');
    } catch(e) { alert('That file is not a GRE Brain Lag progress backup.'); }
  };
  r.readAsText(file);
}
function syncPanelHTML() {
  const fbReady = !!fbAuth, signedIn = cloud && cloud.kind === 'firebase';
  let top;
  if (cloud && cloud.kind === 'claude') top = `<p style="margin:0 0 10px">Synced with your Claude account.</p>`;
  else if (signedIn) top = `<p style="margin:0 0 10px">${syncState === 'error' ? '⚠️ Last sync failed. ' : '✅ '}Synced with <b>${esc(syncUser)}</b>. Sign in with the same account on your other devices.</p>
      <div class="row"><button class="btn small" id="syNow">Sync now</button><button class="btn small" id="syOut">Sign out</button></div>`;
  else if (fbReady) top = `<p style="margin:0 0 10px">Sign in to keep your phone and laptop in sync.</p>
      <div class="row"><button class="btn small primary" id="syIn">Sign in with Google</button></div>`;
  else top = `<p class="muted" style="margin:0 0 10px;font-size:15px">Cloud sync isn't set up on this site yet (see the README). You can still move progress with a backup file.</p>`;
  return `<div class="panel"><h2>Sync &amp; backup</h2>${top}
    <div class="row" style="margin-top:12px"><button class="btn small" id="bkOut">Download backup</button><button class="btn small" id="bkIn">Load backup</button>
    <input type="file" id="bkFile" accept="application/json,.json" hidden></div>
    <p class="muted" style="font-size:14px;margin:10px 0 0">Loading a backup merges it with this device, so nothing is lost.</p></div>`;
}
function wireSyncPanel() {
  const on = (id, f) => { const el = $('#' + id); if (el) el.onclick = f; };
  on('syIn', signIn); on('syOut', signOut); on('syNow', syncNow); on('bkOut', exportProgress);
  on('bkIn', () => $('#bkFile').click());
  const f = $('#bkFile'); if (f) f.onchange = () => { if (f.files[0]) importProgress(f.files[0]); };
}

/* ---------- illustration ---------- */
const seg = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter(undefined, {granularity:'grapheme'}) : null;
const graphemes = s => (seg ? Array.from(seg.segment(s), x => x.segment) : Array.from(s)).filter(x => x.trim());
const TINTS = ['var(--t1)','var(--t2)','var(--t3)','var(--t4)'];
function hash(s){ let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
function scene(em, sfx, opts={}) {
  const g = graphemes(em).slice(0, 5);
  const crowd = g.length >= 3 && g.every(x => x === g[0]);
  const bg = TINTS[hash(em + (sfx||'')) % 4];
  const cls = ['scene', opts.mini ? 'mini' : '', crowd ? 'crowd' : '', opts.still ? '' : 'wobble'].join(' ');
  const items = crowd ? g.map(x => `<span class="e">${x}</span>`).join('')
    : g.map((x, i) => `<span class="e ${i ? 's' + i : 'hero'}">${x}</span>`).join('');
  const burst = sfx ? `<span class="burst-wrap"><span class="burst">${esc(sfx)}</span></span>` : '';
  return `<div class="${cls}" style="--bg:${bg}" role="img" aria-label="Cartoon: ${esc(g.join(' '))}">${items}${burst}</div>`;
}
const pronHTML = p => esc(p).replace(/([A-Z]{2,})/g, '<b>$1</b>');
function exampleHTML(x) {
  const re = new RegExp('\\b(' + stem(x.w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-z]*)', 'i');
  return esc(x.ex).replace(re, '<mark>$1</mark>');
}
function mnemHTML(m) { return esc(m).replace(/^([^:]+):/, '<b>$1:</b>'); }
function detailHTML(x, opts = {}) {
  const pic = opts.pic !== false;
  return `<div class="detail">
    <p class="def">${esc(x.d)}</p>
    <p class="vn" lang="vi">${VNFLAG}<span>${esc(x.vn)}</span></p>
    ${pic ? wordPic(x) : ''}
    <div><p class="lbl">Example</p><p class="ex">${exampleHTML(x)}</p></div>
    <p class="mnem">${mnemHTML(x.mn)}</p>
    ${synHTML(x)}
  </div>`;
}
function say(w) { try { const u = new SpeechSynthesisUtterance(w); u.lang = 'en-US'; u.rate = .85; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch(e) {} }
function todayBox() {
  const d = new Date().toLocaleDateString('en-CA');
  if (!S.today || S.today.d !== d) S.today = {d, miss:{}};
  return S.today;
}
const todayMissKeys = () => Object.keys(todayBox().miss).filter(k => BYKEY[k] && todayBox().miss[k] > 0);
function missCount(x) { const s = S.stats[x.key]; return s ? s.w : 0; }

/* ---------- dialog ---------- */
const dlg = $('#dlg');
function openWord(key) {
  const x = BYKEY[key]; if (!x) return;
  $('#dlgBody').innerHTML = `<div class="dlg-head"><div>
      <div class="back-word" style="font-size:32px">${wl(x)}</div>
      <div class="pron">${pronHTML(x.pr)}</div>
      <span class="gtag">Group ${x.g}</span></div>
    <div class="row" style="flex:none"><button class="speak" data-say="${esc(x.w)}" aria-label="Hear ${esc(x.w)}">🔊</button>
    <button class="x" aria-label="Close" data-close>✕</button></div></div>${detailHTML(x)}`;
  dlg.showModal();
}
dlg.addEventListener('click', e => {
  if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
  const s = e.target.closest('[data-say]'); if (s) say(s.dataset.say);
});
document.addEventListener('click', e => {
  const t = e.target.closest('.syn-tog');
  if (t) { const open = t.getAttribute('aria-expanded') !== 'true'; t.setAttribute('aria-expanded', open); t.nextElementSibling.hidden = !open; return; }
  const b = e.target.closest('[data-word]'); if (b) openWord(b.dataset.word);
});

/* ---------- navigation ---------- */
let current = 'cards';
function show(v) {
  current = v;
  document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-current', t.dataset.view === v ? 'page' : 'false'));
  ['cards','groups','syn','quiz','comics'].forEach(n => $('#v-' + n).hidden = n !== v);
  ({cards:renderCards, groups:renderGroups, syn:renderSyn, quiz:renderQuiz, comics:renderComics})[v]();
  window.scrollTo({top:0});
}
document.querySelectorAll('.tab').forEach(t => t.onclick = () => show(t.dataset.view));
function rerender() { show(current); }
const groupOptions = (sel, withAll) => (withAll ? `<option value="all"${sel==='all'?' selected':''}>All ${ALL.length} words</option>` +
  (todayMissKeys().length ? `<option value="today"${sel==='today'?' selected':''}>Missed today (${todayMissKeys().length})</option>` : '') : '') +
  SETS.map(s => `<option value="${s.n}"${String(sel)===String(s.n)?' selected':''}>Group ${s.n}</option>`).join('');

/* ---------- flashcards ---------- */
const FC = {deck:[], idx:0, flipped:false};
function buildDeck(shuf) {
  const g = S.fcGroup;
  FC.deck = (g === 'today' ? todayMissKeys().map(k => BYKEY[k]) : g === 'all' ? ALL : String(g).startsWith('c:') ? clusterItems(String(g).slice(2)) : ALL.filter(x => String(x.g) === String(g))).map(x => x.key);
  if (!FC.deck.length) { S.fcGroup = 'all'; FC.deck = ALL.map(x => x.key); }
  if (shuf) FC.deck = shuffle(FC.deck);
  FC.idx = 0; FC.flipped = false;
}
function renderCards() {
  if (!FC.deck.length) buildDeck(false);
  const x = BYKEY[FC.deck[FC.idx]];
  const mc = missCount(x);
  $('#v-cards').innerHTML = `
    <div class="fc-head">
      <div class="row"><label for="fcG" class="flabel">Study</label><select id="fcG" class="sel">${groupOptions(S.fcGroup, true)}${String(S.fcGroup).startsWith("c:") && CMAP[S.fcGroup.slice(2)] ? `<option value="${S.fcGroup}" selected>Same meaning: ${esc(CMAP[S.fcGroup.slice(2)].t)}</option>` : ""}</select></div>
      <div class="count" aria-live="polite">${FC.idx + 1} / ${FC.deck.length}</div>
    </div>
    <div class="card-wrap">
      <div class="card${FC.flipped ? ' flipped' : ''}" id="card" role="button" tabindex="0" aria-label="Flashcard for ${esc(x.w)}. Tap to flip.">
        <div class="face front"${FC.flipped ? ' inert' : ''}>
          <div class="front-top"><span class="gtag">Group ${x.g}</span>${mc ? `<span class="miss-badge">missed ${mc}×</span>` : ''}</div>
          <div class="word-big">${esc(x.w)}${posTag(x)}</div>
          <div class="pron-row"><span class="pron">${pronHTML(x.pr)}</span><button class="speak" data-say="${esc(x.w)}" aria-label="Hear it">🔊</button></div>
          ${wordPic(x, false, true)}
          <div class="hint">Tap to flip for the meaning</div>
        </div>
        <div class="face back"${FC.flipped ? '' : ' inert'}>
          <div class="back-top"><span class="back-word">${wl(x)}</span><span class="pron">${pronHTML(x.pr)}</span></div>
          ${detailHTML(x, {pic:false})}
        </div>
      </div>
    </div>
    <div class="fc-controls">
      <button class="btn" id="prev">Previous</button>
      <button class="btn sun" id="shuf">Shuffle</button>
      <button class="btn primary" id="next">Next</button>
    </div>`;
  $('#fcG').onchange = e => { S.fcGroup = e.target.value; save(); buildDeck(false); renderCards(); };
  const card = $('#card');
  const flip = () => { FC.flipped = !FC.flipped; card.classList.toggle('flipped', FC.flipped);
    card.querySelector('.front').inert = FC.flipped; card.querySelector('.back').inert = !FC.flipped; };
  card.onclick = e => { const s = e.target.closest('[data-say]'); if (s) { e.stopPropagation(); say(s.dataset.say); return; }
    if (e.target.closest('.syn-tog, .syn-box')) return; flip(); };
  card.onkeydown = e => { if (e.target !== card) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } };
  $('#prev').onclick = () => step(-1);
  $('#next').onclick = () => step(1);
  $('#shuf').onclick = () => { buildDeck(true); renderCards(); };
  let sx = null;
  card.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive:true});
  card.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 60) { e.preventDefault(); step(dx < 0 ? 1 : -1); } });
}
function step(d) { FC.idx = (FC.idx + d + FC.deck.length) % FC.deck.length; FC.flipped = false; renderCards(); }
document.addEventListener('keydown', e => {
  if (current !== 'cards' || dlg.open || e.target.tagName === 'SELECT') return;
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});

/* ---------- word groups ---------- */
function chipClass(x) { const s = S.stats[x.key]; if (!s) return ''; return s.w > s.r ? 'missed' : (s.r >= 2 && s.r > s.w ? 'solid' : ''); }
function renderGroups() {
  $('#v-groups').innerHTML = `
    <h1 style="font-size:32px">Word groups</h1>
    <div class="legend"><span><i style="background:var(--t3)"></i>missed more than right</span><span><i style="background:var(--t4)"></i>getting it right</span><span>Tap a word to open its card</span></div>
    <div class="groups">${SETS.map(s => `
      <article class="group" id="g${s.n}">
        <h2><span class="gnum">${s.n}</span>Group ${s.n}</h2>
        <p class="sum">${esc(s.sum)}</p>
        <div class="chips">${s.w.map(a => { const x = BYKEY[s.n + ':' + a[0]]; return `<button class="chip ${chipClass(x)}" data-word="${esc(x.key)}">${wl(x)}</button>`; }).join('')}</div>
        <div class="row"><button class="btn small" data-study="${s.n}">Flashcards</button><button class="btn small sun" data-comic="${s.n}">Read the comic</button></div>
      </article>`).join('')}</div>`;
  $('#v-groups').onclick = e => {
    const st = e.target.closest('[data-study]'); if (st) { S.fcGroup = st.dataset.study; save(); buildDeck(false); show('cards'); }
    const cm = e.target.closest('[data-comic]'); if (cm) { C.g = +cm.dataset.comic; show('comics'); }
  };
}

/* ---------- quiz ---------- */
const Q = {state:'setup', qs:[], i:0, score:0, missed:[], answered:false, full:false, total:0, retries:{}, label:''};
const FULL_MAX = 120;
const prevOf = n => n === 1 ? null : n - 1;
function rotGroups() { const n = S.rot.newG, p = prevOf(n), c = S.rot.cycle; return [...new Set([n, p, c].filter(Boolean))]; }
function poolFor() {
  if (S.mode === 'rot') { const gs = rotGroups(); return ALL.filter(x => gs.includes(x.g)); }
  if (S.mode === 'one') return ALL.filter(x => x.g === +S.one);
  return ALL;
}
function weight(x) {
  const s = S.stats[x.key];
  const today = 1 + 3 * ((todayBox().miss[x.key]) || 0);
  if (!s) return 1.5 * today;
  return Math.max(0.35, 1 + 2.5 * s.w - 0.6 * s.r) * today;
}
function pickWeighted(pool, n) {
  const out = [], arr = pool.slice();
  while (out.length < n && arr.length) {
    const tot = arr.reduce((a, x) => a + weight(x), 0);
    let r = Math.random() * tot, k = 0;
    for (; k < arr.length; k++) { r -= weight(arr[k]); if (r <= 0) break; }
    out.push(arr.splice(Math.min(k, arr.length - 1), 1)[0]);
  }
  return out;
}
function blankOf(x) {
  const re = new RegExp('\\b' + stem(x.w) + '[a-z]*', 'i');
  return re.test(x.ex) ? esc(x.ex).replace(re, '_____') : null;
}
function makeQ(x) {
  const kinds = ['d2w','w2d','syn','vn','vn2w'];
  const blank = blankOf(x); if (blank) kinds.push('blank');
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  const others = shuffle(ALL.filter(o => o.w !== x.w));
  const pick = (f) => { const seen = new Set([f(x).toLowerCase()]), res = [];
    for (const o of others) { const v = f(o).toLowerCase(); if (!seen.has(v) && o.syn.toLowerCase() !== x.syn.toLowerCase()) { seen.add(v); res.push(o); } if (res.length === 3) break; }
    return res; };
  let prompt, label, opts;
  if (kind === 'd2w') { label = 'Which word means…'; prompt = esc(x.d); opts = [x, ...pick(o => o.w)].map(o => ({t:wTxt(o), ok:o === x})); }
  if (kind === 'w2d') { label = 'What does this word mean?'; prompt = `<span class="w">${wl(x)}</span>`; opts = [x, ...pick(o => o.d)].map(o => ({t:o.d, ok:o === x})); }
  if (kind === 'syn') { label = 'Pick the closest synonym for'; prompt = `<span class="w">${wl(x)}</span>`; opts = [x, ...pick(o => o.syn)].map(o => ({t:o.syn, ok:o === x})); }
  if (kind === 'vn') { label = 'Nghĩa tiếng Việt là gì?'; prompt = `<span class="w">${wl(x)}</span>`; opts = [x, ...pick(o => o.vn)].map(o => ({t:o.vn, ok:o === x})); }
  if (kind === 'vn2w') { label = 'Từ nào có nghĩa là…'; prompt = `<span class="vn-prompt" lang="vi">${VNFLAG}<span>${esc(x.vn)}</span></span>`; opts = [x, ...pick(o => o.w)].map(o => ({t:wTxt(o), ok:o === x})); }
  if (kind === 'blank') { label = 'Fill in the blank'; prompt = blank; opts = [x, ...pick(o => o.w)].map(o => ({t:wTxt(o), ok:o === x})); }
  return {key:x.key, kind, label, prompt, opts:shuffle(opts)};
}
function fullOK() { return poolFor().length <= FULL_MAX; }
function startQuiz(kind) {
  let pool = poolFor(), n;
  Q.full = false; Q.label = quizModeLabel();
  if (kind === 'missed') { pool = todayMissKeys().map(k => BYKEY[k]); n = pool.length; Q.full = true; Q.label = "Today's missed words"; }
  else if (S.len === 'full' && fullOK()) { n = pool.length; Q.full = true; Q.label = 'Full review · ' + quizModeLabel(); }
  else n = Math.min(S.len === 'full' ? 20 : S.len, pool.length);
  if (!n) return;
  Q.qs = pickWeighted(pool, n).map(makeQ);
  Q.total = Q.qs.length; Q.retries = {};
  Q.i = 0; Q.score = 0; Q.missed = []; Q.answered = false; Q.state = 'q';
  renderQuiz();
}
function quizModeLabel() {
  if (S.mode === 'rot') { const g = rotGroups(); return 'Rotation: group' + (g.length > 1 ? 's ' : ' ') + g.join(', '); }
  if (S.mode === 'one') return 'Group ' + S.one;
  return 'All groups';
}
function renderQuiz() {
  const v = $('#v-quiz');
  if (Q.state === 'setup') {
    const n = S.rot.newG, p = prevOf(n);
    const worst = ALL.filter(x => S.stats[x.key] && S.stats[x.key].w > 0)
      .sort((a, b) => (S.stats[b.key].w - S.stats[b.key].r) - (S.stats[a.key].w - S.stats[a.key].r)).slice(0, 16);
    v.innerHTML = `
      <div class="panel">
        <h2>Daily quiz</h2>
        <div class="field"><span class="flabel">Words from</span>
          <div class="seg" role="group" aria-label="Quiz scope">
            <button data-mode="rot" aria-pressed="${S.mode==='rot'}">My rotation</button>
            <button data-mode="all" aria-pressed="${S.mode==='all'}">All groups</button>
            <button data-mode="one" aria-pressed="${S.mode==='one'}">One group</button>
          </div></div>
        ${S.mode === 'rot' ? `
          <div class="row">
            <div class="field"><label for="rN">New group today</label><select id="rN" class="sel">${groupOptions(n)}</select></div>
            <div class="field"><label for="rC">Cycling review group</label><select id="rC" class="sel">${groupOptions(S.rot.cycle)}</select></div>
          </div>
          <div class="rot-sum">Today's quiz mixes <b>Group ${n}</b> (new)${p ? `, <b>Group ${p}</b> (yesterday)` : ''}${(S.rot.cycle !== n && S.rot.cycle !== p) ? ` and <b>Group ${S.rot.cycle}</b> (cycling review)` : ''}.</div>` : ''}
        ${S.mode === 'one' ? `<div class="field"><label for="oG">Group</label><select id="oG" class="sel">${groupOptions(S.one)}</select></div>` : ''}
        <div class="field"><span class="flabel">Questions</span>
          <div class="seg" role="group" aria-label="Number of questions">${[10,15,20].map(k => `<button data-len="${k}" aria-pressed="${S.len===k}">${k}</button>`).join('')}${fullOK() ? `<button data-len="full" aria-pressed="${S.len==='full'}">All ${poolFor().length}</button>` : ''}</div></div>
        ${S.len === 'full' && fullOK() ? `<div class="rot-sum">Full review: every word ${S.mode === 'rot' ? 'from all ' + rotGroups().length + ' of today\'s groups' : 'in this group'} once. Miss one and it comes back a few questions later, then shows up more often for the rest of the day.</div>` : ''}
        <div class="row" style="margin-top:14px"><button class="btn primary" id="go">Start quiz</button></div>
        <p class="muted" style="font-size:14px;margin:12px 0 0">Words you miss come back more often. ${cloud && syncState === 'synced' ? 'Progress syncs to ' + esc(syncUser) + ', so it follows you between phone and laptop.' : 'Progress is saved on this device. Turn on sync below to share it with your other devices.'}</p>
      </div>
      ${todayMissKeys().length ? `<div class="panel"><h2>Missed today</h2>
        <p class="muted" style="margin:0 0 10px;font-size:15px">These come up more often in every quiz today. Get each one right twice to clear it.</p>
        <div class="chips">${todayMissKeys().map(k => { const x = BYKEY[k]; return `<button class="chip missed" data-word="${esc(k)}">${wl(x)}</button>`; }).join('')}</div>
        <div class="row" style="margin-top:12px"><button class="btn sun" id="tmGo">Quiz me on these (${todayMissKeys().length})</button></div></div>` : ''}
      <div class="panel"><h2>Words to watch</h2>
        ${worst.length ? `<div class="chips">${worst.map(x => `<button class="chip missed" data-word="${esc(x.key)}">${wl(x)} <span class="muted">×${S.stats[x.key].w}</span></button>`).join('')}</div>`
          : '<p class="muted" style="margin:0">Take a quiz and the words you miss will collect here.</p>'}
      </div>
      <div class="panel"><h2>Quiz history</h2>
        ${S.history.length ? `<ul class="hist">${S.history.slice().reverse().slice(0, 15).map(h => `<li><span>${new Date(h.t).toLocaleDateString(undefined,{month:'short',day:'numeric'})} · ${esc(h.m)}</span><b>${h.s}/${h.n}</b></li>`).join('')}</ul>`
          : '<p class="muted" style="margin:0">No quizzes yet.</p>'}
        <p style="margin:14px 0 0"><button class="linkish" id="reset">Reset all progress</button></p>
      </div>
      ${syncPanelHTML()}`;
    v.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; save(); renderQuiz(); });
    v.querySelectorAll('[data-len]').forEach(b => b.onclick = () => { S.len = b.dataset.len === 'full' ? 'full' : +b.dataset.len; save(); renderQuiz(); });
    const tm = $('#tmGo'); if (tm) tm.onclick = () => startQuiz('missed');
    const rN = $('#rN'), rC = $('#rC'), oG = $('#oG');
    if (rN) rN.onchange = () => { S.rot.newG = +rN.value; save(); renderQuiz(); };
    if (rC) rC.onchange = () => { S.rot.cycle = +rC.value; save(); renderQuiz(); };
    if (oG) oG.onchange = () => { S.one = +oG.value; save(); };
    $('#go').onclick = () => startQuiz();
    wireSyncPanel();
    $('#reset').onclick = () => { if (confirm('Erase all quiz stats and history?')) { S.stats = {}; S.history = []; save(); renderQuiz(); } };
    return;
  }
  if (Q.state === 'q') {
    const q = Q.qs[Q.i], x = BYKEY[q.key];
    v.innerHTML = `<div class="panel">
      <div class="q-meta"><span>Question ${Q.i + 1} of ${Q.qs.length}${Q.qs.length > Q.total ? ` <span class="muted" style="font-size:14px">(${Q.qs.length - Q.total} comebacks)</span>` : ''}</span><span>Score ${Q.score}/${Q.total}</span></div>
      <div class="progress"><div style="width:${(Q.i / Q.qs.length) * 100}%"></div></div>
      <p class="q-kind">${q.retry ? '🔁 Comeback · ' : ''}${q.label}</p>
      <p class="q-prompt">${q.prompt}</p>
      <div class="opts">${q.opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>
      <div id="fb"></div>
    </div>`;
    v.querySelectorAll('.opt').forEach(b => b.onclick = () => answer(+b.dataset.k));
    return;
  }
  // done
  const pct = Math.round(Q.score / Q.total * 100);
  const msg = pct === 100 ? 'Perfect run. Every single one.' : pct >= 80 ? 'Strong work. A few to tidy up.' : pct >= 50 ? 'Halfway there. The missed words will come back more often.' : 'Tough round. Flip through the missed words below, then try again.';
  v.innerHTML = `<div class="panel" style="text-align:center">
      <p class="q-kind">${esc(Q.label)}</p>
      <div class="score">${Q.score}/${Q.total}</div>
      <p style="font-size:19px;font-weight:700">${msg}</p>
      <div class="row" style="justify-content:center">
        <button class="btn primary" id="again">New quiz</button>
        ${todayMissKeys().length ? `<button class="btn" id="tmAgain">Practice today's misses (${todayMissKeys().length})</button>` : ''}
        ${S.mode === 'rot' ? `<button class="btn sun" id="adv">Move on to tomorrow's groups</button>` : ''}
      </div>
    </div>
    ${Q.missed.length ? `<div class="panel"><h2>Missed this round</h2><div class="groups">${Q.missed.map(k => { const x = BYKEY[k]; return `
      <div><div class="row" style="justify-content:space-between"><button class="vw" style="font-family:var(--display);font-size:22px" data-word="${esc(k)}">${wl(x)}</button><span class="muted">Group ${x.g}</span></div>
      <p style="margin:4px 0">${esc(x.d)}</p><p class="vn" lang="vi">${VNFLAG}<span>${esc(x.vn)}</span></p><p class="mnem">${mnemHTML(x.mn)}</p></div>`; }).join('')}</div></div>` : ''}`;
  $('#again').onclick = () => { Q.state = 'setup'; renderQuiz(); };
  const tma = $('#tmAgain'); if (tma) tma.onclick = () => startQuiz('missed');
  const adv = $('#adv');
  if (adv) adv.onclick = () => {
    S.rot.newG = S.rot.newG % SETS.length + 1;
    S.rot.cycle = S.rot.cycle % SETS.length + 1;
    save(); Q.state = 'setup'; renderQuiz();
  };
}
function answer(k) {
  if (Q.answered) return; Q.answered = true;
  const q = Q.qs[Q.i], x = BYKEY[q.key], ok = q.opts[k].ok;
  const s = S.stats[q.key] || {r:0, w:0};
  const tb = todayBox();
  if (ok) {
    s.r++; if (!q.retry) Q.score++;
    if (tb.miss[q.key]) { tb.miss[q.key]--; if (tb.miss[q.key] <= 0) delete tb.miss[q.key]; }
  } else {
    s.w++; if (!q.retry && !Q.missed.includes(q.key)) Q.missed.push(q.key);
    tb.miss[q.key] = Math.min(6, (tb.miss[q.key] || 0) + 2);
    // full review: bring a missed word back a few questions later (up to twice per round)
    if (Q.full && (Q.retries[q.key] || 0) < 2) {
      Q.retries[q.key] = (Q.retries[q.key] || 0) + 1;
      const nq = makeQ(x); nq.retry = true;
      Q.qs.splice(Math.min(Q.qs.length, Q.i + 4 + Math.floor(Math.random() * 5)), 0, nq);
    }
  }
  s.t = Date.now(); S.stats[q.key] = s;
  document.querySelectorAll('.opt').forEach((b, i) => { b.disabled = true; if (q.opts[i].ok) b.classList.add('right'); else if (i === k) b.classList.add('wrong'); });
  const last = Q.i === Q.qs.length - 1;
  if (last) {
    S.history.push({t:Date.now(), m:Q.label, s:Q.score, n:Q.total});
    if (S.history.length > 60) S.history = S.history.slice(-60);
  }
  save();
  $('#fb').innerHTML = `<div class="fb">
    <div class="verdict" style="color:${ok ? 'var(--mint)' : 'var(--pop)'}">${ok ? 'Correct!' : 'Not this time.'}</div>
    <div><span class="back-word">${wl(x)}</span> <span class="pron">${pronHTML(x.pr)}</span><p class="def" style="font-size:18px">${esc(x.d)}</p><p class="vn" lang="vi">${VNFLAG}<span>${esc(x.vn)}</span></p></div>
    ${wordPic(x, true)}
    <p class="mnem">${mnemHTML(x.mn)}</p>
    ${!ok && Q.full && Q.retries[q.key] && !q.retry ? '<p class="muted" style="margin:0;font-size:15px">🔁 This one will come back in a few questions.</p>' : ''}
    <div class="row"><button class="btn primary" id="nx">${last ? 'See my score' : 'Next question'}</button></div></div>`;
  const nx = $('#nx'); nx.focus({preventScroll:true}); nx.scrollIntoView({block:'nearest', behavior:'smooth'});
  nx.onclick = () => { Q.answered = false; if (last) Q.state = 'done'; else Q.i++; renderQuiz(); window.scrollTo({top:0}); };
}

/* ---------- same-meaning clusters ---------- */
const VNFLAG = '<svg class="flag" viewBox="0 0 30 20" role="img" aria-label="Tiếng Việt"><rect width="30" height="20" rx="2" fill="#DA251D"/><path d="M15 4.3l1.45 4.47h4.7l-3.8 2.76 1.45 4.47L15 13.24 11.2 16l1.45-4.47-3.8-2.76h4.7z" fill="#FFFF00"/></svg>';
const CMAP = Object.fromEntries(CLUSTERS.map(c => [c.k, c]));
const W2C = {};
CLUSTERS.forEach(c => c.w.forEach(w => (W2C[w] = W2C[w] || []).push(c.k)));
function clusterItems(k) { const c = CMAP[k]; if (!c) return []; return c.w.flatMap(w => ALL.filter(x => x.w === w)); }
function similarHTML(x) {
  const ks = W2C[x.w] || []; if (!ks.length) return '';
  return ks.map(k => { const c = CMAP[k]; const others = clusterItems(k).filter(o => o.w !== x.w);
    return `<div class="sim"><p class="lbl">Same meaning: ${esc(c.t)}</p><div class="chips">${others.map(o => `<button class="chip small" data-word="${esc(o.key)}">${wl(o)}</button>`).join('')}</div></div>`; }).join('');
}
/* synonyms, hidden behind a tap-to-open button */
const clOf = w => W2C[w] || [];
function synHTML(x) {
  const seen = new Set([x.w.toLowerCase()]);
  const fams = clOf(x.w).map(k => ({t: CMAP[k].t, items: clusterItems(k).filter(o => {
    const w = o.w.toLowerCase(); if (seen.has(w)) return false; seen.add(w); return true; })}));
  const extra = x.syn && !seen.has(x.syn.toLowerCase()) ? x.syn : null;
  const count = (extra ? 1 : 0) + fams.reduce((a, f) => a + f.items.length, 0);
  if (!count) return '';
  const extraChip = extra ? (WFIRST[extra] ? `<button class="chip small" data-word="${esc(WFIRST[extra])}">${wl(extra)}</button>` : `<span class="syn">≈ ${esc(extra)}</span>`) : '';
  return `<div><button type="button" class="syn-tog" aria-expanded="false">Same meaning (${count})</button><div class="syn-box" hidden>
    ${extra ? `<p class="lbl">Closest synonym</p><div class="chips">${extraChip}</div>` : ''}
    ${fams.filter(f => f.items.length).map(f => `<p class="lbl">${esc(f.t)}</p><div class="chips">${f.items.map(o => `<button class="chip small" data-word="${esc(o.key)}">${wl(o)}</button>`).join('')}</div>`).join('')}
  </div></div>`;
}

/* ---------- same meaning view: drills + browse ---------- */
const SYN = {q:'', tab:'play'};
function renderSyn() {
  const v = $('#v-syn');
  v.innerHTML = `
    <div class="syn-head"><h1 style="font-size:32px">Same meaning</h1>
      <div class="seg" role="group" aria-label="Same meaning section">
        <button data-stab="play" aria-pressed="${SYN.tab === 'play'}">Synonym drills</button>
        <button data-stab="browse" aria-pressed="${SYN.tab === 'browse'}">Browse groups</button>
      </div></div>
    <div id="synBody"></div>`;
  v.querySelectorAll('[data-stab]').forEach(b => b.onclick = () => { SYN.tab = b.dataset.stab; renderSyn(); });
  v.onclick = e => { const d = e.target.closest('[data-cdeck]'); if (d) { S.fcGroup = 'c:' + d.dataset.cdeck; save(); buildDeck(false); show('cards'); } };
  if (SYN.tab === 'browse') renderBrowse(); else renderDrill();
}
function renderBrowse() {
  const q = SYN.q.trim().toLowerCase();
  const list = CLUSTERS.filter(c => !q || c.t.toLowerCase().includes(q) || c.w.some(w => w.includes(q)));
  $('#synBody').innerHTML = `
    <p class="muted" style="margin:0 0 12px">All ${ALL.length} words sorted into ${CLUSTERS.length} meaning groups. Know one, and you know the family. Tap a word to open its card.</p>
    <div class="row" style="margin-bottom:16px"><input id="synQ" class="sel" type="search" placeholder="Find a word or meaning…" value="${esc(SYN.q)}" style="flex:1;min-width:200px;font-weight:400" aria-label="Search meaning groups"></div>
    <div class="groups">${list.length ? list.map(c => {
      const items = clusterItems(c.k);
      return `<article class="group">
        <h2 style="font-size:22px">${esc(c.t)} <span class="muted" style="font-size:15px;font-weight:600">${items.length} words</span></h2>
        <div class="chips" style="margin-top:10px">${items.map(x => `<button class="chip ${chipClass(x)}${q && x.w.includes(q) ? ' hit' : ''}" data-word="${esc(x.key)}">${wl(x)} <span class="gn">${x.g}</span></button>`).join('')}</div>
        <div class="row"><button class="btn small" data-cdeck="${c.k}">Flashcards for this group</button></div>
      </article>`; }).join('') : '<p class="muted">No meaning group matches that search. Try a shorter word.</p>'}</div>`;
  const inp = $('#synQ');
  inp.oninput = () => { SYN.q = inp.value; const pos = inp.selectionStart; renderBrowse(); const n = $('#synQ'); n.focus(); n.setSelectionRange(pos, pos); };
}

/* ---------- drill engine ---------- */
let MG = {state:'setup'};
const mmSet = () => (S.mm && S.mm.kind) ? S.mm : (S.mm = {kind:'match', scope:'rot', pairs:6, len:10});
const wx = w => BYKEY[WFIRST[w]];
function mmPool() {
  const o = mmSet();
  const gs = rotGroups();
  return (o.scope === 'rot' ? ALL.filter(x => gs.includes(x.g)) : ALL).filter(x => clOf(x.w).length);
}
// find two words from one meaning group; nothing on the board may share a group with them
function pickTwin(pool, used, usedW, prefer) {
  for (const a of pool) {
    if (usedW.has(a.w) || clOf(a.w).some(k => used.has(k))) continue;
    for (const k of shuffle(clOf(a.w))) {
      const mates = shuffle(CMAP[k].w.filter(w => w !== a.w && WFIRST[w] && !usedW.has(w) && !clOf(w).some(c => used.has(c))));
      const b = mates.find(w => prefer.has(w)) || mates[0];
      if (b) return {a:a.w, b, k};
    }
  }
  return null;
}
function claimPair(p, used, usedW) { [...clOf(p.a), ...clOf(p.b)].forEach(k => used.add(k)); usedW.add(p.a); usedW.add(p.b); }
function bump(w, ok) {
  const key = WFIRST[w]; if (!key) return;
  const s = S.stats[key] || {r:0, w:0}; ok ? s.r++ : s.w++; s.t = Date.now(); S.stats[key] = s;
}
const wordLine = w => { const x = wx(w); return `<b>${wl(w)}</b> <span class="vt" lang="vi">${esc(x ? x.vn : '')}</span>`; };
const scopeLabel = () => mmSet().scope === 'rot' ? 'Rotation: groups ' + rotGroups().join(', ') : 'All groups';

function startMatch() {
  const n = mmSet().pairs, pool = shuffle(mmPool()), prefer = new Set(pool.map(x => x.w));
  const backup = shuffle(ALL.filter(x => clOf(x.w).length));
  const used = new Set(), usedW = new Set(), pairs = [];
  while (pairs.length < n) {
    const p = pickTwin(pool, used, usedW, prefer) || pickTwin(backup, used, usedW, prefer);
    if (!p) break; claimPair(p, used, usedW); pairs.push(p);
  }
  const tiles = shuffle(pairs.flatMap((p, i) => [{w:p.a, p:i, st:''}, {w:p.b, p:i, st:''}]));
  MG = {state:'match', pairs, tiles, sel:null, found:0, slips:0, slipW:new Set(), fb:'', lock:false, t0:Date.now()};
  renderDrill();
}
function tapTile(i) {
  if (MG.lock) return;
  const t = MG.tiles[i]; if (t.st === 'ok') return;
  if (MG.sel === null) { MG.sel = i; t.st = 'sel'; return renderDrill(); }
  if (MG.sel === i) { MG.sel = null; t.st = ''; return renderDrill(); }
  const s = MG.tiles[MG.sel];
  if (s.p === t.p) {
    s.st = t.st = 'ok'; MG.sel = null; MG.found++;
    const P = MG.pairs[t.p];
    MG.fb = `Match! ${wordLine(P.a)} + ${wordLine(P.b)}<br><span class="vt">Both mean: ${esc(CMAP[P.k].t.toLowerCase())}</span>`;
    if (MG.found === MG.pairs.length) {
      MG.pairs.forEach(p => [p.a, p.b].forEach(w => bump(w, !MG.slipW.has(w))));
      const clean = MG.pairs.filter(p => !MG.slipW.has(p.a) && !MG.slipW.has(p.b)).length;
      MG.clean = clean; MG.secs = Math.round((Date.now() - MG.t0) / 1000);
      S.history.push({t:Date.now(), m:'Match pairs · ' + scopeLabel(), s:clean, n:MG.pairs.length});
      if (S.history.length > 60) S.history = S.history.slice(-60);
      save();
      renderDrill(); MG.lock = true;
      setTimeout(() => { MG.state = 'mdone'; MG.lock = false; renderDrill(); }, 700);
      return;
    }
    return renderDrill();
  }
  s.st = t.st = 'bad'; MG.slips++; MG.slipW.add(s.w); MG.slipW.add(t.w); MG.lock = true;
  const sx = wx(s.w), tx = wx(t.w);
  MG.fb = `Not twins. <b>${wl(s.w)}</b>: ${esc(sx ? sx.d : '')}. <b>${wl(t.w)}</b>: ${esc(tx ? tx.d : '')}.`;
  renderDrill();
  setTimeout(() => { s.st = t.st = ''; MG.sel = null; MG.lock = false; renderDrill(); }, 750);
}

function startTwins() {
  const pool = mmPool(), prefer = new Set(pool.map(x => x.w));
  const backup = ALL.filter(x => clOf(x.w).length), done = new Set(), qs = [];
  for (let i = 0; i < mmSet().len; i++) {
    const used = new Set(), usedW = new Set(done);
    const p = pickTwin(shuffle(pool), used, usedW, prefer) || pickTwin(shuffle(backup), used, usedW, prefer);
    if (!p) break;
    claimPair(p, used, usedW); done.add(p.a); done.add(p.b);
    const ds = [];
    for (const x of shuffle(ALL)) {
      if (ds.length === 4) break;
      if (usedW.has(x.w) || clOf(x.w).some(k => used.has(k))) continue;
      ds.push(x.w); usedW.add(x.w); clOf(x.w).forEach(k => used.add(k));
    }
    qs.push({p, opts:shuffle([p.a, p.b, ...ds]), picked:[], done:false, ok:false});
  }
  MG = {state:'twins', qs, i:0, score:0, missed:[]};
  renderDrill();
}
function tapTwin(k) {
  const q = MG.qs[MG.i]; if (q.done) return;
  const w = q.opts[k], at = q.picked.indexOf(w);
  if (at >= 0) q.picked.splice(at, 1); else q.picked.push(w);
  if (q.picked.length === 2) {
    q.done = true; q.ok = q.picked.includes(q.p.a) && q.picked.includes(q.p.b);
    if (q.ok) MG.score++; else MG.missed.push(q.p);
    bump(q.p.a, q.ok); bump(q.p.b, q.ok);
    if (MG.i === MG.qs.length - 1) {
      S.history.push({t:Date.now(), m:'Pick 2 of 6 · ' + scopeLabel(), s:MG.score, n:MG.qs.length});
      if (S.history.length > 60) S.history = S.history.slice(-60);
    }
    save();
  }
  renderDrill();
  if (q.done) { const nx = $('#twNext'); if (nx) { nx.focus({preventScroll:true}); nx.scrollIntoView({block:'nearest', behavior:'smooth'}); } }
}
const pairRow = p => `<li><button class="chip" data-word="${esc(WFIRST[p.a])}">${wl(p.a)}</button><span class="eq">≈</span><button class="chip" data-word="${esc(WFIRST[p.b])}">${wl(p.b)}</button><span class="mt">${esc(CMAP[p.k].t)}</span></li>`;

function renderDrill() {
  const body = $('#synBody'); if (!body) return;
  const o = mmSet();
  body.onclick = e => {
    const t = e.target.closest('[data-tile]'); if (t) return tapTile(+t.dataset.tile);
    const w = e.target.closest('[data-tw]'); if (w) return tapTwin(+w.dataset.tw);
  };
  if (MG.state === 'setup') {
    const gs = rotGroups();
    body.innerHTML = `<div class="panel">
      <h2>Synonym drills</h2>
      <p class="muted" style="margin:0 0 4px">Short rounds for GRE Sentence Equivalence, where the two right answers are words that mean the same thing.</p>
      <div class="field"><span class="flabel">Game</span>
        <div class="seg" role="group" aria-label="Game">
          <button data-kind="match" aria-pressed="${o.kind === 'match'}">Match pairs</button>
          <button data-kind="twins" aria-pressed="${o.kind === 'twins'}">Pick 2 of 6</button>
        </div></div>
      <p class="muted" style="margin:0;font-size:15px">${o.kind === 'match' ? 'A board of words. Tap two that mean the same thing until the board is clear.' : 'Six words, one pair of twins. Tap the two that mean the same, like a real Sentence Equivalence question.'}</p>
      <div class="field"><span class="flabel">Words from</span>
        <div class="seg" role="group" aria-label="Words from">
          <button data-scope="rot" aria-pressed="${o.scope === 'rot'}">My rotation</button>
          <button data-scope="all" aria-pressed="${o.scope === 'all'}">All groups</button>
        </div></div>
      ${o.scope === 'rot' ? `<div class="rot-sum">Starts from Group${gs.length > 1 ? 's' : ''} <b>${gs.join(', ')}</b>, paired with same-meaning words from any group. Change the rotation in the Quiz tab.</div>` : ''}
      <div class="field"><span class="flabel">${o.kind === 'match' ? 'Pairs per board' : 'Questions'}</span>
        <div class="seg" role="group" aria-label="Round size">${(o.kind === 'match' ? [4, 6, 8] : [5, 10, 15]).map(k =>
          `<button data-size="${k}" aria-pressed="${(o.kind === 'match' ? o.pairs : o.len) === k}">${k}</button>`).join('')}</div></div>
      <div class="row" style="margin-top:14px"><button class="btn primary" id="mmGo">${o.kind === 'match' ? 'Start matching' : 'Start drill'}</button></div>
      <p class="muted" style="font-size:14px;margin:12px 0 0">Slips count as misses, so those words show up more in your daily quiz.</p>
    </div>`;
    body.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { o.kind = b.dataset.kind; save(); renderDrill(); });
    body.querySelectorAll('[data-scope]').forEach(b => b.onclick = () => { o.scope = b.dataset.scope; save(); renderDrill(); });
    body.querySelectorAll('[data-size]').forEach(b => b.onclick = () => { o[o.kind === 'match' ? 'pairs' : 'len'] = +b.dataset.size; save(); renderDrill(); });
    $('#mmGo').onclick = () => o.kind === 'match' ? startMatch() : startTwins();
    return;
  }
  if (MG.state === 'match') {
    const n = MG.pairs.length;
    body.innerHTML = `<div class="panel">
      <div class="q-meta"><span>Pairs ${MG.found} of ${n}</span><span>Slips ${MG.slips}</span></div>
      <div class="progress"><div style="width:${MG.found / n * 100}%"></div></div>
      <p class="q-kind">Tap two words that mean the same thing</p>
      <div class="tiles">${MG.tiles.map((t, i) => `<button class="tile ${t.st}" data-tile="${i}" ${t.st === 'ok' ? 'aria-disabled="true"' : ''} aria-pressed="${t.st === 'sel'}">${wl(t.w)}</button>`).join('')}</div>
      <div class="mm-fb" aria-live="polite">${MG.fb || 'Pick any word, then find its twin.'}</div>
      <div class="row"><button class="btn small" id="mmQuit">End round</button></div>
    </div>`;
    $('#mmQuit').onclick = () => { MG = {state:'setup'}; renderDrill(); };
    return;
  }
  if (MG.state === 'mdone') {
    const n = MG.pairs.length, m = Math.floor(MG.secs / 60), sec = String(MG.secs % 60).padStart(2, '0');
    const msg = MG.clean === n ? 'Clean board. Every pair on the first try.' : MG.clean >= n - 1 ? 'Nearly clean. One pair tripped you up.' : 'Board cleared. The slipped words will come back more often.';
    body.innerHTML = `<div class="panel" style="text-align:center">
        <p class="q-kind">Match pairs</p>
        <div class="score">${MG.clean}/${n}</div>
        <p style="font-size:19px;font-weight:700;margin:8px 0">${msg}</p>
        <p class="muted" style="margin:0 0 14px">Cleared in ${m}:${sec}</p>
        <div class="row" style="justify-content:center"><button class="btn primary" id="mmAgain">New board</button><button class="btn" id="mmSetup">Change settings</button></div>
      </div>
      <div class="panel"><h2>This board's pairs</h2><ul class="pairs">${MG.pairs.map(pairRow).join('')}</ul></div>`;
    $('#mmAgain').onclick = startMatch;
    $('#mmSetup').onclick = () => { MG = {state:'setup'}; renderDrill(); };
    return;
  }
  if (MG.state === 'twins') {
    const q = MG.qs[MG.i], last = MG.i === MG.qs.length - 1;
    const cls = w => !q.done ? (q.picked.includes(w) ? 'pick' : '') : ([q.p.a, q.p.b].includes(w) ? 'right' : q.picked.includes(w) ? 'wrong' : '');
    body.innerHTML = `<div class="panel">
      <div class="q-meta"><span>Question ${MG.i + 1} of ${MG.qs.length}</span><span>Score ${MG.score}</span></div>
      <div class="progress"><div style="width:${(MG.i + (q.done ? 1 : 0)) / MG.qs.length * 100}%"></div></div>
      <p class="q-kind">Pick the 2 words that mean the same thing</p>
      <div class="opts six">${q.opts.map((w, k) => `<button class="opt ${cls(w)}" data-tw="${k}" aria-pressed="${q.picked.includes(w)}" ${q.done ? 'disabled' : ''}>${wl(w)}</button>`).join('')}</div>
      ${q.done ? `<div class="fb">
        <div class="verdict" style="color:${q.ok ? 'var(--mint)' : 'var(--pop)'}">${q.ok ? 'Twins found!' : 'Not this pair.'}</div>
        <p style="margin:0"><b>${wl(q.p.a)}</b> and <b>${wl(q.p.b)}</b> both mean: ${esc(CMAP[q.p.k].t.toLowerCase())}</p>
        ${[q.p.a, q.p.b].map(w => { const x = wx(w); return `<div><button class="vw" style="font-family:var(--display);font-size:20px" data-word="${esc(WFIRST[w])}">${wl(w)}</button>
          <p style="margin:2px 0">${esc(x.d)}</p><p class="vn" lang="vi">${VNFLAG}<span>${esc(x.vn)}</span></p></div>`; }).join('')}
        <div class="row"><button class="btn primary" id="twNext">${last ? 'See my score' : 'Next question'}</button></div>
      </div>` : ''}
    </div>`;
    const nx = $('#twNext');
    if (nx) nx.onclick = () => { if (last) MG.state = 'tdone'; else MG.i++; renderDrill(); window.scrollTo({top:0}); };
    return;
  }
  // twins done
  const n = MG.qs.length, pct = Math.round(MG.score / n * 100);
  const msg = pct === 100 ? 'Perfect. Every pair spotted.' : pct >= 80 ? 'Strong. A few pairs to tidy up.' : pct >= 50 ? 'Halfway there. Missed pairs are listed below.' : 'Tough round. Read the pairs below, then go again.';
  body.innerHTML = `<div class="panel" style="text-align:center">
      <p class="q-kind">Pick 2 of 6</p>
      <div class="score">${MG.score}/${n}</div>
      <p style="font-size:19px;font-weight:700">${msg}</p>
      <div class="row" style="justify-content:center"><button class="btn primary" id="twAgain">New drill</button><button class="btn" id="twSetup">Change settings</button></div>
    </div>
    ${MG.missed.length ? `<div class="panel"><h2>Pairs you missed</h2><ul class="pairs">${MG.missed.map(pairRow).join('')}</ul></div>` : ''}`;
  $('#twAgain').onclick = startTwins;
  $('#twSetup').onclick = () => { MG = {state:'setup'}; renderDrill(); };
}
/* ---------- word illustrations ---------- */
const PIC = typeof IMG !== 'undefined' ? IMG : {};   // images are optional: delete js/data/images.js to use emoji scenes
function picFail(img) { const x = BYKEY[img.dataset.k]; const box = img.closest('.pic'); if (x && box) box.outerHTML = scene(x.em, x.sfx, {mini: box.classList.contains('mini')}); }
function wordPic(x, mini, fit) {
  const cls = 'pic' + (mini ? ' mini' : '') + (fit ? ' fit' : '');
  if (WORD_ART[x.w] && (!PIC[x.key] || ['tortuous','clamorous'].includes(x.w)))
    return `<div class="${cls}">${WORD_ART[x.w]()}</div>`;
  if (PIC[x.key]) return `<div class="${cls}"><img src="${PIC[x.key]}" data-k="${esc(x.key)}" onerror="picFail(this)" alt="Illustration for ${esc(x.w)}" loading="lazy" decoding="async"></div>`;
  return scene(x.em, x.sfx, {mini});
}
/* ---------- comics ---------- */
const C = {g:null};
function castStrip() {
  const who = [['mai','Mai','studying for the GRE'],['bao','Bảo','her data-nerd best friend'],['ba','Bà','grandma, final boss'],['kevin','Kevin','chaotic cousin'],['mochi','Mochi','the cat']];
  const xs = [40, 120, 200, 280, 360];
  const art = `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The cast: Mai, Bảo, Bà, Kevin and Mochi the cat"><rect width="400" height="200" fill="#FFF3C4"/><rect width="400" height="200" fill="url(#ht)" opacity=".35"/>` +
    person('mai', 40, 196, 'happy', 'wave', false, .72) + person('bao', 120, 196, 'smug', 'stand', false, .72) + person('ba', 200, 196, 'happy', 'hips', false, .72) + person('kevin', 280, 196, 'smug', 'point', false, .72) + cat(352, 196, 'happy', false, .8) + `</svg>`;
  return `<details class="cast"><summary>Meet the cast</summary><div class="art">${art}</div><div class="cast-names">${who.map(w => `<span><b>${w[1]}</b> ${w[2]}</span>`).join('')}</div></details>`;
}
function renderComics() {
  if (!C.g) C.g = S.mode === 'rot' ? S.rot.newG : 1;
  const s = SETS[C.g - 1], cm = COMICS[C.g - 1];
  const used = new Set();
  $('#v-comics').innerHTML = `
    <div class="comic-head"><div class="row"><label for="cG" class="flabel">Comic for</label><select id="cG" class="sel">${groupOptions(C.g)}</select></div>
      <span class="muted" style="font-size:14px">Tap a bold word in a bubble to see its card</span></div>
    ${castStrip()}
    <h1 class="comic-title">Ep. ${s.n}: ${esc(cm.title)}</h1>
    <p class="muted" style="margin:0">Group ${s.n}: all ${s.w.length} words in one ${cm.p.length}-panel story.</p>
    <div class="strip">${cm.p.map((p, i) => {
      const label = 'Panel ' + (i + 1) + '. ' + [p.cap, ...(p.bub || []).map(b => b[1])].filter(Boolean).map(plainText).join(' ');
      return `<div class="pnl"><span class="pnl-n">${i + 1}</span><div class="art">${comicPanel(p, s, label)}</div></div>`; }).join('')}</div>
    <div class="panel" style="margin-top:22px"><h2 style="font-size:20px">Words in this episode</h2>
      <div class="chips">${s.w.map(a => { const x = BYKEY[s.n + ':' + a[0]]; return `<button class="chip small ${chipClass(x)}" data-word="${esc(x.key)}">${wl(x)}</button>`; }).join('')}</div></div>
    <div class="comic-nav">
      <button class="btn" id="cPrev" ${C.g === 1 ? 'disabled' : ''}>Previous episode</button>
      <button class="btn primary" id="cNext" ${C.g === SETS.length ? 'disabled' : ''}>Next episode</button>
    </div>`;
  $('#cG').onchange = e => { C.g = +e.target.value; renderComics(); };
  $('#cPrev').onclick = () => { C.g--; renderComics(); window.scrollTo({top:0}); };
  $('#cNext').onclick = () => { C.g++; renderComics(); window.scrollTo({top:0}); };
}
// bubble text is measured with the real font, so lay the comic out again once the font has loaded
if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('600 13px "Be Vietnam Pro"'), document.fonts.load('800 13px "Be Vietnam Pro"')]).then(() => { if (current === 'comics') renderComics(); }).catch(() => {});

show('cards');
