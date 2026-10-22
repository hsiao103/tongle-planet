/* ===== 多人上線（最多 25 人）：用 Artifact 的 room 功能同步位置，不需要自己的伺服器 =====
   - 每個人把「自己的狀態」放進 presence（位置、朝向、速度、角色、暱稱），約每 0.15 秒更新一次
   - 其他人收到後在自己的畫面上補間顯示成角色；離開或斷線的人會被移除
   - 沒有連線能力（單機開啟、未受邀的人）時，整個模組不作用，遊戲照常單人玩 */
const MP = { mode: 'solo', art: null, artReady: false, fromIntro: false, room: null, on: false, rem: new Map(), max: 25, sendT: 0, last: '', nick: '', hue: 0, assets: null, n: 1 };
const MP_COLORS = [0xe0402e, 0x2b7cff, 0x8a5cd6, 0x1fa8a0, 0xf2b01e, 0xd8559a, 0x4f9a48, 0x6b7a8f];
const MP_HAIR = [0x2b1f18, 0x5b3a24, 0x8a5a2e, 0x1d2430, 0xc89a5a];
const MP_BAD = new RegExp('[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u202a-\\u202e\\u2060-\\u206f\\ufeff\\ue000-\\uf8ff]', 'g');
const mpClean = s => String(s == null ? '' : s).replace(MP_BAD, '').trim().slice(0, 8);
(function () {
  let n = ''; try { n = localStorage.getItem('tongle_nick') || ''; } catch (e) { }
  MP.nick = mpClean(n) || ('旅人' + String(10 + ((Math.random() * 90) | 0)));
})();
function mpSetNick(v) { const n = mpClean(v) || MP.nick; MP.nick = n; try { localStorage.setItem('tongle_nick', n); } catch (e) { } MP.last = ''; if (MP.room) MP.room.presence({ nm: n }).catch(() => { }); toast('暱稱：' + n); }
function mpNickRow(L) {
  const d = document.createElement('div'); d.className = 'it'; d.innerHTML = '<div class="nm">我的暱稱（多人上線時顯示）</div><div class="ds">最多 8 個字，請不要用真實全名。</div>';
  const i = document.createElement('input'); i.type = 'text'; i.maxLength = 8; i.value = MP.nick; i.style.cssText = 'width:100%;box-sizing:border-box;margin:6px 0;padding:8px;border:1px solid #c9a560;border-radius:8px;font-size:16px';
  d.appendChild(i); d.appendChild(mkBtn('儲存暱稱', () => mpSetNick(i.value), true)); L.appendChild(d);
}
function mpHash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
async function mpInit() {
  try {
    if (!window.claude || !claude.use) return; const room = await claude.use('room'); MP.artReady = true; if (!room) return;
    MP.art = room; MP.assets = { boy: await loadGLB('boy'), girl: await loadGLB('girl') };
    room.onPeers(() => { }, () => { if (MP.room === room) { MP.on = false; } });
    if (MP.mode === 'multi' && STARTED) mpMode('multi', false);
  } catch (e) { MP.artReady = true; console.warn('room', e); }
}
// ---- 單人版／多人版：選擇會記在這台裝置；單人版完全不連線、不送出任何資料 ----
(function () { try { if (localStorage.getItem('tongle_mode') === 'multi') MP.mode = 'multi'; } catch (e) { } })();
function mpUI() {
  const multi = MP.mode === 'multi'; document.querySelectorAll('#iMode button').forEach(b => b.classList.toggle('on', b.dataset.m === MP.mode));
  const h = $('iModeHint'); if (h) h.textContent = multi ? '多人版：和同學一起在同一顆星球（需要 Google 帳號登入，最多 25 人）。' : '單人版：自己一個人玩，不需要登入。';
  const b = $('bOnline'); if (b) { b.textContent = multi ? '模式：多人' : '模式：單人'; b.classList.toggle('on', multi); }
}
function mpSaveMode(m) { MP.mode = m; try { localStorage.setItem('tongle_mode', m); } catch (e) { } mpUI(); }
async function mpMode(m, interactive) {
  if (m === 'solo') {
    mpSaveMode('solo');
    if (MP.art && MP.room === MP.art) { try { MP.art.presence({ x: null, y: null, z: null, f: null, s: null, a: null }).catch(() => { }); } catch (e) { } MP.room = null; MP.on = false; MP.last = ''; }
    if (SB.ch) await sbStop();
    return;
  }
  mpSaveMode('multi');
  if (window.claude) {                                                       // 在 Claude Artifact 內：用 room
    if (!MP.artReady) return;
    if (!MP.art) { toast('這個連結目前不能使用多人（需用有權限的帳號開啟）', 4500); mpSaveMode('solo'); return; }
    MP.room = MP.art; MP.on = true; MP.last = ''; MP.art.presence({ nm: MP.nick, k: CH.kind === 'girl' ? 1 : 0 }).catch(() => { }); toast('多人版已開啟', 2000); return;
  }
  await sbStart(!!interactive);                                              // 一般網頁（GitHub Pages）：用 Supabase + Google 登入
}
function mpSend(dt) {
  MP.sendT -= dt; if (MP.sendT > 0 || !MP.room) return; MP.sendT = 0.15;
  const air = PL.vy > 0.8 || PL.vy < -3.2 ? 1 : 0, o = { x: +PL.x.toFixed(2), y: +PL.y.toFixed(2), z: +PL.z.toFixed(2), f: +CH.face.toFixed(2), s: +Math.min(CH.speed, 9).toFixed(1), a: air, k: CH.kind === 'girl' ? 1 : 0, nm: MP.nick };
  const key = [o.x, o.y, o.z, o.f, o.s, o.a, o.k, o.nm].join('|'); if (key === MP.last) return; MP.last = key; MP.room.presence(o).catch(() => { });
}
function mpMake(peer) {
  const id = peer.peer, h = mpHash(id), kind = peer.presence.k === 1 ? 'girl' : 'boy';
  const colors = Object.assign({}, UNI, { 'school-shirt': MP_COLORS[h % 8], 'school-sleeve': MP_COLORS[(h >> 3) % 8], 'school-shorts': MP_COLORS[(h >> 5) % 8], hair: MP_HAIR[h % 5], 'hair-band': MP_COLORS[(h >> 2) % 8] });
  const ch = makeChar(MP.assets[kind], { h: GLB_H, colors }); const r = { id, ch, kind, x: 0, y: 0, z: 0, f: 0, tx: 0, ty: 0, tz: 0, tf: 0, sp: 0, nm: '', first: true, lab: null };
  scene.add(ch.node); dynAdd(ch.node); if (window.STY && STY.on && typeof styScan === 'function') setTimeout(styScan, 50); return r;
}
function mpDrop(r) { scene.remove(r.ch.node); r.ch.mixer.stopAllAction(); if (r.lab) { r.lab.material.map.dispose(); r.lab.material.dispose(); } MP.rem.delete(r.id); }
function mpTick(dt) {
  if (!MP.room || !MP.on) { MP.n = 1; if (MP.rem.size) [...MP.rem.values()].forEach(mpDrop); const e = $('hOnline'); if (e && !e.hidden) e.hidden = true; return; } if (STARTED) mpSend(dt);
  const peers = MP.room.peers(), seen = new Set(), cs = charScale(); let count = 0;
  for (const p of peers) {
    if (p.kind !== 'viewer') continue; count++; if (p.isMe) continue;
    const q = p.presence; if (!q || typeof q.x !== 'number' || typeof q.z !== 'number') continue;
    if (!isFinite(q.x) || !isFinite(q.z) || Math.abs(q.x) > 400 || Math.abs(q.z) > 400) continue;
    seen.add(p.peer); let r = MP.rem.get(p.peer);
    if (!r) { if (MP.rem.size >= MP.max - 1 || !MP.assets) continue; r = mpMake(p); MP.rem.set(p.peer, r); }
    if ((q.k === 1 ? 'girl' : 'boy') !== r.kind) { mpDrop(r); continue; }
    r.tx = q.x; r.ty = typeof q.y === 'number' ? q.y : 0; r.tz = q.z; r.tf = typeof q.f === 'number' ? q.f : 0; r.air = q.a === 1; r.psp = typeof q.s === 'number' ? q.s : 0;
    const nm = mpClean(q.nm) || '旅人'; if (nm !== r.nm) { r.nm = nm; if (r.lab) { r.ch.node.remove(r.lab); r.lab.material.map.dispose(); r.lab.material.dispose(); } r.lab = hwSprite(nm, '#7fd1ff'); r.lab.material.depthTest = true; r.lab.position.y = GLB_H + 0.42; r.ch.node.add(r.lab); }
  }
  for (const r of [...MP.rem.values()]) if (!seen.has(r.id)) mpDrop(r);
  MP.n = Math.max(1, count); const el = $('hOnline'); if (el) { el.hidden = false; const t = '線上 ' + MP.n; if (el.textContent !== t) el.textContent = t; }
  const k = 1 - Math.exp(-dt * 9);
  MP.rem.forEach(r => {
    if (r.first) { r.x = r.tx; r.y = r.ty; r.z = r.tz; r.f = r.tf; r.first = false; }
    const ox = r.x, oz = r.z, jump = Math.hypot(r.tx - r.x, r.tz - r.z) > 8;
    if (jump) { r.x = r.tx; r.z = r.tz; r.y = r.ty; } else { r.x += (r.tx - r.x) * k; r.z += (r.tz - r.z) * k; r.y += (r.ty - r.y) * k; }
    r.f += angd(r.tf, r.f) * k;
    const d = Math.hypot(PL.x - r.x, PL.z - r.z), far = d > 90, n = r.ch.node;
    n.visible = !far; if (far) return;
    n.position.set(r.x, r.y, r.z); n.rotation.y = r.f; n.scale.setScalar(cs);
    const sp = Math.min(Math.hypot(r.x - ox, r.z - oz) / Math.max(dt, 1e-3), 12); r.sp += (Math.max(sp, r.psp * 0.8) - r.sp) * Math.min(1, dt * 8);
    const name = r.air ? 'Jump' : r.sp > (r.ch.cur === 'Run' ? 4.6 : 5.2) ? 'Run' : r.sp > (r.ch.cur === 'Walk' || r.ch.cur === 'Run' ? 0.35 : 0.6) ? 'Walk' : 'Idle';
    play(r.ch, name, r.air ? 0.08 : 0.18); if (name === 'Walk' || name === 'Run') r.ch.act[name].timeScale = Math.max(0.5, r.sp * 0.24);
    if (d < 60) r.ch.mixer.update(dt);
    if (r.lab) r.lab.visible = d < 40 && cs < 3.5;
  });
}
function mpMini(g, mp) {
  if (!MP.room) return; g.fillStyle = '#19b6ff'; g.strokeStyle = '#fff'; g.lineWidth = 1.5;
  MP.rem.forEach(r => { const p = mp(r.x, r.z); g.beginPath(); g.arc(p[0], p[1], 3.4, 0, 7); g.fill(); g.stroke(); });
}
/* ---- GitHub Pages 版：Supabase（Google 登入 + Realtime Broadcast/Presence）----
   - 設定放在專案根目錄的 config.js（window.TONGLE_SUPABASE = { url, key }）；key 是 anon／publishable 金鑰（公開用，不是 service_role）
   - 未登入也能單機玩；按「多人：關」才會跳 Google 登入，登入成功才加入頻道
   - 頻道為 private，需在 Supabase 設定 realtime.messages 的 RLS 政策（見 docs/SUPABASE.md 與 supabase/setup.sql）
   - 位置用 Broadcast（約每 0.25 秒一次，其他人補間），Presence 只用來偵測加入與離開 */
const SB = { client: null, ch: null, key: '', remote: new Map(), mine: {}, sentAt: 0, timer: 0, busy: false, wantOn: false };
const sbCfg = () => { const c = window.TONGLE_SUPABASE; return c && c.url && c.key && !/PASTE|貼上/i.test(c.key) ? c : null; };
const sbLoad = () => window.supabase ? Promise.resolve() : new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js'; s.onload = ok; s.onerror = () => no(new Error('supabase script')); document.head.appendChild(s); });
const sbRoom = {
  presence(patch) { Object.assign(SB.mine, patch); sbFlush(); return Promise.resolve(); },
  peers() {
    const now = Date.now(), out = [{ peer: SB.key, by: null, isMe: true, sameTab: true, kind: 'viewer', guest: false, presence: SB.mine, updatedAt: now }];
    SB.remote.forEach((v, k) => { if (now - v.t > 8000) { SB.remote.delete(k); return; } out.push({ peer: k, by: null, isMe: false, sameTab: false, kind: 'viewer', guest: false, presence: v.p, updatedAt: v.t }); });
    return out;
  }
};
function sbSend() { if (!SB.ch) return; SB.sentAt = Date.now(); const m = SB.mine; if (typeof m.x !== 'number') return; try { SB.ch.send({ type: 'broadcast', event: 'p', payload: Object.assign({ id: SB.key }, m) }); } catch (e) { } }
function sbFlush() {
  if (!SB.ch || SB.timer) return; const c = window.TONGLE_SUPABASE || {}, ms = Math.max(100, Math.min(2000, c.sendMs | 0 || 250)), wait = Math.max(0, ms - (Date.now() - SB.sentAt));
  SB.timer = setTimeout(() => { SB.timer = 0; sbSend(); }, wait);
}
function sbBtn() { mpUI(); }
function sbNum(v, lim) { return typeof v === 'number' && isFinite(v) && Math.abs(v) <= lim ? v : 0; }
async function sbJoin() {
  SB.key = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'u' + String(Math.random()).slice(2); SB.mine = { nm: MP.nick, k: CH.kind === 'girl' ? 1 : 0 }; SB.remote.clear();
  const ch = SB.client.channel('tongle-planet', { config: { private: true, broadcast: { self: false }, presence: { key: SB.key } } });
  ch.on('broadcast', { event: 'p' }, msg => { const p = msg && msg.payload; if (!p || typeof p.id !== 'string' || p.id === SB.key || p.id.length > 64) return;
    SB.remote.set(p.id, { t: Date.now(), p: { x: sbNum(p.x, 400), y: sbNum(p.y, 60), z: sbNum(p.z, 400), f: sbNum(p.f, 20), s: sbNum(p.s, 30), a: p.a === 1 ? 1 : 0, k: p.k === 1 ? 1 : 0, nm: mpClean(p.nm) } }); });
  ch.on('presence', { event: 'leave' }, e => { (e.leftPresences || []).forEach(() => { }); if (e.key) SB.remote.delete(e.key); });
  ch.on('presence', { event: 'join' }, e => { if (e.key && e.key !== SB.key) sbFlush(); });                 // 有人加入：馬上讓對方看到自己
  ch.on('presence', { event: 'sync' }, () => { try { const st = ch.presenceState(); [...SB.remote.keys()].forEach(k => { if (!(k in st)) SB.remote.delete(k); }); } catch (e) { } });
  await new Promise((ok, no) => { ch.subscribe(async (status, err) => {
    if (status === 'SUBSCRIBED') { SB.ch = ch; try { await ch.track({ nm: MP.nick }); } catch (e) { } if (!MP.assets) MP.assets = { boy: await loadGLB('boy'), girl: await loadGLB('girl') }; MP.room = sbRoom; MP.on = true; clearInterval(SB.ka); SB.ka = setInterval(sbSend, 2000); sbBtn(); ok(); }
    else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') { if (!SB.ch) no(err || new Error(status)); else { toast('多人連線中斷，已切回單人版', 3500); sbStop(); mpSaveMode('solo'); } }
  }); });
}
async function sbStop() {
  const ch = SB.ch; SB.ch = null; clearInterval(SB.ka); MP.room = null; MP.on = false; SB.remote.clear(); clearTimeout(SB.timer); SB.timer = 0;
  if (ch) { try { await ch.unsubscribe(); } catch (e) { } } sbBtn();
}
async function sbStart(interactive) {
  if (SB.busy) return; const cfg = sbCfg(); if (!cfg) { toast('尚未設定多人連線（請編輯 config.js 貼上 Supabase 金鑰），先使用單人版', 5000); mpSaveMode('solo'); return; }
  SB.busy = true; if (interactive) toast('連線中…', 1800);
  try {
    await sbLoad(); if (!SB.client) SB.client = supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' } });
    const r = await SB.client.auth.getSession();
    if (!r.data || !r.data.session) {
      if (!interactive) { toast('登入已過期，已切回單人版；要多人請重新選擇多人版', 4500); mpSaveMode('solo'); return; }
      await SB.client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } }); return;
    }
    await sbJoin(); toast('已連線：和同學一起玩', 2600);
  } catch (e) { console.warn('supabase', e); toast('多人連線失敗，已切回單人版', 3500); sbStop(); mpSaveMode('solo'); }
  finally { SB.busy = false; }
}
mpUI();
document.querySelectorAll('#iMode button').forEach(b => { b.onclick = () => { MP.fromIntro = b.dataset.m === 'multi'; mpSaveMode(b.dataset.m); }; });
{ const b = $('bOnline'); if (b) { b.hidden = false; b.onclick = () => { if (!STARTED) return; if (MP.mode === 'multi') { mpMode('solo'); toast('已切換為單人版', 1800); } else mpMode('multi', true); }; } }
mpInit();
{ const iv = setInterval(() => { if (!STARTED) return; clearInterval(iv); if (MP.mode === 'multi') mpMode('multi', MP.fromIntro); }, 400); }     // 開始遊戲後，依所選模式連線
window.__mpMock && window.__mpMock();
window.__mp = { MP, mpTick, SB, sbStart };
