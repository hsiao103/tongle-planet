/* ---- 多人：線上名單＋聊天（全頻道、頭上氣泡、基本過濾、可靜音）----
   聊天走 Supabase Broadcast 的 'c' 事件；Claude 內的預覽（room）只提供名單，不提供聊天。
   過濾：控制字元、連結、長數字（電話）、重複字、常見辱罵字；每 1.5 秒最多送一句；每人可靜音（只在本次連線有效）。 */
const CHAT = { log: [], mute: new Set(), lastSend: 0, lastIn: new Map(), unread: 0, bub: [], open: null, accT: 0 };
const CH_BAD = ['幹你', '幹您', '靠北', '靠腰', '他媽的', '他媽', '媽的', '白癡', '白痴', '智障', '去死', '王八蛋', '操你', '機掰', '雞掰', '北七', '三小', '死肥', '低能', '賤人', '婊'];
function chFilter(s) {
  s = String(s == null ? '' : s).replace(MP_BAD, '').replace(/\s+/g, ' ').trim();
  s = s.replace(/(https?:\/\/|www\.)\S+/gi, '（連結已隱藏）').replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '（信箱已隱藏）').replace(/\d[\d\s-]{6,}\d/g, '（數字已隱藏）');
  s = s.replace(/(.)\1{3,}/gu, '$1$1$1');
  for (const w of CH_BAD) s = s.split(w).join('＊'.repeat(w.length));
  return Array.from(s).slice(0, 60).join('');
}
function chCanChat() { return !!(MP.room && MP.on && SB.ch); }
function chBubble(text) {
  const W = 420, F = '"Noto Sans TC","Microsoft JhengHei",sans-serif', cv = document.createElement('canvas'), g0 = cv.getContext('2d');
  g0.font = 'bold 30px ' + F; const lines = []; let cur = '';
  for (const ch of Array.from(text)) { if (g0.measureText(cur + ch).width > W - 44) { lines.push(cur); cur = ch; } else cur += ch; } if (cur) lines.push(cur);
  const L = lines.slice(0, 3), H = 40 + L.length * 40 + 24; cv.width = W; cv.height = H; const g = cv.getContext('2d');
  g.fillStyle = '#fff'; g.strokeStyle = '#285467'; g.lineWidth = 5; g.beginPath(); g.moveTo(22, 5); g.lineTo(W - 22, 5); g.quadraticCurveTo(W - 5, 5, W - 5, 22); g.lineTo(W - 5, H - 40); g.quadraticCurveTo(W - 5, H - 24, W - 22, H - 24);
  g.lineTo(W / 2 + 14, H - 24); g.lineTo(W / 2, H - 5); g.lineTo(W / 2 - 14, H - 24); g.lineTo(22, H - 24); g.quadraticCurveTo(5, H - 24, 5, H - 40); g.lineTo(5, 22); g.quadraticCurveTo(5, 5, 22, 5); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#285467'; g.font = 'bold 30px ' + F; g.textAlign = 'center'; g.textBaseline = 'middle'; L.forEach((t, i) => g.fillText(t, W / 2, 28 + i * 40 + 14));
  const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  const k = 0.0062; s.scale.set(W * k, H * k, 1); s.frustumCulled = false; s.renderOrder = 20; s.userData.bubble = true; s.userData.sh = H * k; scene.add(s); dynAdd(s); return s;
}
function chShow(id, text) {
  const old = CHAT.bub.findIndex(b => b.id === id); if (old >= 0) chKill(CHAT.bub[old], old);
  const s = chBubble(text); CHAT.bub.push({ id, s, t: 0, life: Math.min(9, 4.5 + text.length * 0.06) });
}
function chKill(b, i) { scene.remove(b.s); b.s.material.map.dispose(); b.s.material.dispose(); CHAT.bub.splice(i, 1); }
function chAdd(id, nm, text, me) {
  CHAT.log.push({ id, nm, text, me, t: Date.now() }); if (CHAT.log.length > 50) CHAT.log.shift();
  if (CHAT.open !== 'chat' && !me) { CHAT.unread++; chBadge(); }
  chRenderLog(); chShow(me ? '' : id, text);
}
function mpChatIn(p) {
  if (!p || typeof p.id !== 'string' || typeof p.t !== 'string' || p.id === SB.key || CHAT.mute.has(p.id)) return;
  const now = performance.now(), last = CHAT.lastIn.get(p.id) || 0; if (now - last < 800) return; CHAT.lastIn.set(p.id, now);
  const text = chFilter(p.t); if (!text) return; const r = MP.rem.get(p.id), nm = mpClean(p.nm) || (r && r.nm) || '旅人';
  chAdd(p.id, nm, text, false);
}
function chSend(raw) {
  if (!chCanChat()) { toast('聊天只能在 GitHub 網頁版的多人模式使用', 2600); return false; }
  const text = chFilter(raw); if (!text) return false; const now = Date.now();
  if (now - CHAT.lastSend < 1500) { toast('說慢一點喔，等一下再送', 1500); return false; } CHAT.lastSend = now;
  try { SB.ch.send({ type: 'broadcast', event: 'c', payload: { id: SB.key, nm: MP.nick, t: text } }); } catch (e) { return false; }
  sbLog('mp_chat_log', { nick: MP.nick, msg: text }); chAdd('', MP.nick, text, true); return true;
}
function chBadge() { const b = $('hChat'); if (b) b.textContent = CHAT.unread ? '聊天 ●' + (CHAT.unread > 9 ? '9+' : CHAT.unread) : '聊天'; }
function chRenderLog() {
  const el = $('chLog'); if (!el) return; el.textContent = '';
  if (!CHAT.log.length) { const e = document.createElement('div'); e.className = 'mpe'; e.textContent = '還沒有人說話，打個招呼吧！'; el.appendChild(e); return; }
  for (const m of CHAT.log) {
    const row = document.createElement('div'); row.className = 'chm' + (m.me ? ' me' : ''); const n = document.createElement('b'); n.textContent = m.nm + '：'; const t = document.createElement('span'); t.textContent = m.text; row.appendChild(n); row.appendChild(t);
    if (!m.me) { const x = document.createElement('a'); x.textContent = '靜音'; x.onclick = () => { CHAT.mute.add(m.id); CHAT.log = CHAT.log.filter(q => q.id !== m.id); chRenderLog(); toast('已靜音「' + m.nm + '」，本次連線不再顯示他的訊息', 2600); }; row.appendChild(x); }
    el.appendChild(row);
  }
  el.scrollTop = el.scrollHeight;
}
function olRender() {
  const el = $('olp'); if (!el) return; el.textContent = '';
  const h = document.createElement('div'); h.className = 'mph'; h.textContent = '線上同學（' + MP.n + ' / ' + MP.max + '）'; el.appendChild(h);
  const peers = MP.room ? MP.room.peers().filter(p => p.kind === 'viewer') : [];
  for (const p of peers) {
    const row = document.createElement('div'); row.className = 'olr'; const r = p.isMe ? null : MP.rem.get(p.peer), nm = p.isMe ? MP.nick : (r && r.nm) || mpClean(p.presence && p.presence.nm) || '旅人';
    const n = document.createElement('span'); n.className = 'oln'; n.textContent = nm + (p.isMe ? '（我）' : ''); row.appendChild(n);
    if (!p.isMe) {
      if (r) { const b = document.createElement('a'); b.textContent = '到他身邊'; b.onclick = () => { teleport(r.tx + 1.1, r.ty, r.tz + 1.1, r.tx, r.tz); toast('已傳送到「' + nm + '」身邊', 1800); }; row.appendChild(b); }
      if (SB.ch) { const m = CHAT.mute.has(p.peer), b = document.createElement('a'); b.textContent = m ? '解除靜音' : '靜音'; b.onclick = () => { if (m) CHAT.mute.delete(p.peer); else { CHAT.mute.add(p.peer); CHAT.log = CHAT.log.filter(q => q.id !== p.peer); chRenderLog(); } olRender(); }; row.appendChild(b); }
    }
    el.appendChild(row);
  }
  if (!peers.length) { const e = document.createElement('div'); e.className = 'mpe'; e.textContent = '目前只有你'; el.appendChild(e); }
}
function chToggle(which) {
  const a = $('olp'), b = $('chp'); const next = CHAT.open === which ? null : which; CHAT.open = next;
  a.hidden = next !== 'ol'; b.hidden = next !== 'chat'; if (next === 'ol') olRender();
  if (next === 'chat') { CHAT.unread = 0; chBadge(); chRenderLog(); const i = $('chIn'); if (i) { i.placeholder = chCanChat() ? '說句話…（Enter 送出）' : '聊天需在 GitHub 網頁版的多人模式使用'; i.disabled = !chCanChat(); if (chCanChat() && !matchMedia('(pointer:coarse)').matches) setTimeout(() => i.focus(), 30); } }
}
function chUI() { const on = MP.mode === 'multi' && MP.on, hc = $('hChat'); if (hc) hc.hidden = !on; if (!on && CHAT.open) chToggle(CHAT.open); }
function mpChatTick(dt) {
  chUI();
  if (!MP.on) { while (CHAT.bub.length) chKill(CHAT.bub[0], 0); return; }
  CHAT.accT -= dt; if (CHAT.accT <= 0) { CHAT.accT = 1; if (CHAT.open === 'ol') olRender(); }
  const cs = charScale();
  for (let i = CHAT.bub.length - 1; i >= 0; i--) {
    const b = CHAT.bub[i]; b.t += dt; const r = b.id ? MP.rem.get(b.id) : null; if (b.t > b.life || (b.id && !r)) { chKill(b, i); continue; }
    const x = r ? r.x : PL.x, y = r ? r.y : PL.y, z = r ? r.z : PL.z, hs = b.s.userData.sh * Math.min(cs, 3) * 0.5;
    b.s.scale.set(b.s.scale.x, b.s.scale.y, 1); b.s.position.set(x, y + GLB_H * cs + (r ? 0.95 : 0.55) * cs + hs, z); b.s.material.opacity = Math.max(0, Math.min(1, (b.life - b.t) / 0.6)); b.s.visible = r ? r.ch.node.visible : true;
  }
}
{
  const hc = $('hChat'), ho = $('hOnline'), f = $('chF');
  if (ho) ho.onclick = () => chToggle('ol'); if (hc) hc.onclick = () => chToggle('chat');
  if (f) f.onsubmit = e => { e.preventDefault(); const i = $('chIn'); if (chSend(i.value)) i.value = ''; };
  addEventListener('keydown', e => { if (e.code === 'Enter' && !e.isComposing && STARTED && MP.on && SB.ch && !(e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) && !GAME.block) { chToggle('chat'); if (CHAT.open !== 'chat') return; e.preventDefault(); } });
  addEventListener('keydown', e => { if (e.code === 'Escape' && CHAT.open) { chToggle(CHAT.open); const i = $('chIn'); if (i) i.blur(); } });
}
window.__chat = { CHAT, chFilter, mpChatIn, chSend };
