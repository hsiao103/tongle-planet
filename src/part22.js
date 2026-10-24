/* ===== 全班共同 Boss 與節慶開關（v38，第三階段）=====
   後端有兩種：
   - 'sb'  ：Supabase 資料表（supabase/setup_event.sql），全班即時共用；寫入都走伺服器函式。
   - 'demo'：沒有設定或資料表還沒建立時，用這台裝置的 localStorage 模擬，方便先試玩（管理功能全開）。
   傷害來源：垂直卷軸分數／10＋通關 300（單次上限 3000）；橫向卷軸通關 150＋每顆愛心 50。 */
const FEST = { auto: ['依日期自動', '🗓️'], halloween: ['萬聖節', '🎃'], teacher: ['教師節', '📚'], dragon: ['端午節', '🐉'], newyear: ['農曆春節', '🧧'], christmas: ['聖誕節', '🎄'] };
const FEST_BOSS = { auto: '校園大魔王', halloween: '南瓜魔王', teacher: '期末考魔王', dragon: '五毒蛇王', newyear: '年獸', christmas: '暴風雪魔王' };
const FEST_ED = { halloween: 'halloween', newyear: 'lunar', christmas: 'christmas' };            // 節慶 → 小行星版本
const FEST_ED_N = { halloween: '萬聖節', lunar: '農曆年', christmas: '聖誕節' };
const FEST_THEME = { halloween: 'halloween', teacher: 'teacher', dragon: 'dragon', newyear: 'newyear' };   // 節慶 → 垂直卷軸主題
const BS = { st: null, hits: [], admin: false, mode: 'none', note: '', uid: '', busy: false, ch: null, started: false };
const bsPct = () => BS.st && BS.st.boss_max ? Math.max(0, Math.ceil(BS.st.boss_hp / BS.st.boss_max * 100)) : 0;
const bsLive = () => !!(BS.st && BS.st.boss_hp > 0);
const bsFest = () => (BS.st && FEST[BS.st.festival]) ? BS.st.festival : 'auto';
// ---- 示範後端（localStorage）----
function bsDemoLoad() {
  let o = null; try { o = JSON.parse(localStorage.getItem('tongle_boss_demo') || 'null'); } catch (e) { }
  if (!o || !o.st) o = { st: { festival: 'auto', boss_name: FEST_BOSS.auto, boss_max: 20000, boss_hp: 20000, round: 1, defeated_at: null, last_hitter: null }, hits: [] };
  return o;
}
const bsDemoSave = o => { try { localStorage.setItem('tongle_boss_demo', JSON.stringify(o)); } catch (e) { } };
function bsDemoApply(o, uid, nick, dmg) {
  const st = o.st; if (st.boss_hp <= 0 || dmg <= 0) return 0; const v = Math.min(dmg, st.boss_hp);
  let h = o.hits.find(x => x.uid === uid); if (!h) { h = { uid, nick, dmg: 0 }; o.hits.push(h); } h.dmg += v; h.nick = nick;
  o.hits.sort((a, b) => b.dmg - a.dmg); st.boss_hp -= v; if (st.boss_hp <= 0) { st.defeated_at = new Date().toISOString(); st.last_hitter = nick; } return v;
}
function bsUseDemo(note) { const o = bsDemoLoad(); BS.mode = 'demo'; BS.note = note; BS.st = o.st; BS.hits = o.hits; BS.uid = 'me'; BS.admin = true; }
// ---- 讀取與訂閱 ----
async function bsRefresh() {
  if (BS.busy) return; BS.busy = true;
  try {
    const cfg = sbCfg();
    if (!cfg || window.claude) { bsUseDemo('示範模式：這裡沒有連到全班伺服器，資料只存在這台裝置'); return; }
    await sbLoad(); if (!SB.client) SB.client = supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' } });
    const c = SB.client, r = await c.from('tongle_event').select('*').eq('id', 'main').maybeSingle();
    if (r.error || !r.data) throw r.error || new Error('no event row');
    BS.mode = 'sb'; BS.note = ''; BS.st = r.data;
    const h = await c.from('tongle_hits').select('uid,nick,dmg').eq('round', r.data.round).order('dmg', { ascending: false }).limit(50); BS.hits = h.data || [];
    const s = await c.auth.getSession(); BS.uid = s.data && s.data.session ? s.data.session.user.id : '';
    BS.admin = false; if (BS.uid) { const a = await c.rpc('tongle_is_admin'); BS.admin = a.data === true; }
    if (!BS.ch) { try { BS.ch = c.channel('tongle-event').on('postgres_changes', { event: '*', schema: 'public', table: 'tongle_event' }, () => bsRefresh()).subscribe(); } catch (e) { } }
  } catch (e) { console.warn('boss', e); bsUseDemo('示範模式：全班資料表還沒建立（請執行 supabase/setup_event.sql）'); }
  finally { BS.busy = false; bsAfter(); }
}
// ---- 出擊與管理 ----
async function bsHit(dmg) {
  if (!bsLive()) return null;
  if (BS.mode === 'demo') { const o = bsDemoLoad(); const v = bsDemoApply(o, 'me', MP.nick || '我', dmg); bsDemoSave(o); BS.st = o.st; BS.hits = o.hits; bsAfter(); return { ok: true, dmg: v }; }
  if (!BS.uid) return { err: 'login' };
  const r = await SB.client.rpc('tongle_boss_hit', { p_dmg: dmg, p_nick: MP.nick || '旅人' });
  if (r.error) return { err: /too fast/.test(r.error.message) ? 'fast' : 'fail' };
  await bsRefresh(); return { ok: true, dmg };
}
async function bsAdmin(kind, fest, name, max) {
  if (BS.mode === 'demo') { const o = bsDemoLoad(), st = o.st; st.festival = fest;
    if (kind === 'new') { st.boss_name = name; st.boss_max = max; st.boss_hp = max; st.round++; st.defeated_at = null; st.last_hitter = null; o.hits = []; } bsDemoSave(o); await bsRefresh(); return true; }
  const r = kind === 'new' ? await SB.client.rpc('tongle_boss_new', { p_festival: fest, p_name: name, p_max: max }) : await SB.client.rpc('tongle_festival_set', { p_festival: fest });
  if (r.error) { toast('操作失敗：' + (/admin/.test(r.error.message) ? '這個帳號不是管理者' : '連線錯誤'), 3500); return false; }
  await bsRefresh(); return true;
}
// ---- 畫面：HUD 小標、節慶提示 ----
function bsAfter() {
  const e = $('hBoss'); if (e) { e.hidden = !bsLive(); if (bsLive()) e.textContent = FEST[bsFest()][1] + ' ' + BS.st.boss_name + ' ' + bsPct() + '%'; }
  if (!$('bsp').hidden) bsPanel(true);
  bsOffer();
}
function bsOffer() {
  if (!STARTED || anyPanel() || !BS.st || !G.gp) return; const f = bsFest(), seen = G.gp.festSeen; if (f === seen) return; G.gp.festSeen = f; saveGame();
  if (seen === undefined && f === 'auto') return; if (f === 'auto') { toast('節慶活動結束了，回到依日期自動', 3000); return; }
  const ed = FEST_ED[f];
  if (!ed || G.edition === ed) { toast('老師開啟了「' + FEST[f][0] + '」活動！傳送門的 Boss 出現了', 4000); return; }
  openDlg('同樂小行星廣播', '老師開啟了「' + FEST[f][0] + '」活動！\n要切換成「' + FEST_ED_N[ed] + '限定版」嗎？（之後可在上方「版本」切換）', [{ t: '切換', go: true, fn: () => { closePanels(); hwApply(ed); } }, { t: '先不要', fn: closePanels }]);
}
// ---- 面板 ----
const bsMine = () => { const h = BS.hits.find(x => x.uid === BS.uid); return h ? h.dmg : 0; };
function bsClaimKey() { return (BS.mode === 'demo' ? 'd' : 's') + BS.st.round; }
function bsClaim() {
  const st = BS.st; if (!st || st.boss_hp > 0 || bsMine() <= 0) return; const c = G.gp.claimed = G.gp.claimed || {}, k = bsClaimKey(); if (c[k]) return; c[k] = 1;
  const top = BS.hits[0] && BS.hits[0].uid === BS.uid, coins = 300 + (top ? 200 : 0); addCoins(coins); if (ITEMS.lamp) addItem('lamp', 1); saveGame();
  openDlg('討伐獎勵', '全班一起打倒了「' + st.boss_name + '」！\n同樂幣 +' + coins + (ITEMS.lamp ? '、路燈 ×1' : '') + (top ? '\n你是本輪傷害最高的人，額外 +200 幣！' : ''), [{ t: '太棒了', go: true, fn: closePanels }]);
}
function bsPanel(keep) {
  if (!keep) { openPanel('bsp'); bsRefresh(); }
  if (!BS.st) { $('bspList').innerHTML = '<p class="sm">讀取中…</p>'; return; }
  const L = $('bspList'), st = BS.st, f = bsFest(), live = st.boss_hp > 0, claimed = (G.gp.claimed || {})[bsClaimKey()]; L.innerHTML = '';
  const add = (tag, html, cls) => { const d = document.createElement(tag); if (cls) d.className = cls; d.innerHTML = html; L.appendChild(d); return d; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  if (BS.note) add('p', esc(BS.note), 'sm');
  add('p', '<b>' + FEST[f][1] + ' ' + esc(st.boss_name) + '</b>　第 ' + st.round + ' 輪　目前節慶：' + FEST[f][0], 'sm');
  add('div', '<i style="width:' + bsPct() + '%"></i>', 'bsbar'); add('p', live ? 'Boss 血量 ' + st.boss_hp + ' / ' + st.boss_max + '（' + bsPct() + '%）' : '已被全班打倒！最後一擊：' + esc(st.last_hitter || '？'), 'sm');
  add('p', '我的傷害：' + bsMine() + (BS.uid ? '' : '　（登入多人版才能把傷害加進全班）'), 'sm');
  const row = document.createElement('div'); row.className = 'bsrow'; L.appendChild(row);
  if (live) row.appendChild(mkBtn('直接出擊（垂直卷軸）', () => gpOpen('shooter.html', FEST_THEME[f] ? '&theme=' + FEST_THEME[f] : ''), true));
  if (!live && bsMine() > 0 && !claimed) row.appendChild(mkBtn('領取討伐獎勵', bsClaim, true));
  if (!live && claimed) add('p', '這一輪的獎勵已領取。', 'sm');
  if (BS.mode === 'sb' && !BS.uid) row.appendChild(mkBtn('登入多人版', () => { closePanels(); mpMode('multi', true); }, false));
  add('p', '排行榜', 'sm'); const g = add('div', '', 'bslist');
  if (!BS.hits.length) g.textContent = '還沒有人出擊，當第一個！';
  BS.hits.slice(0, 8).forEach((h, i) => { const r = document.createElement('div'); r.textContent = (i + 1) + '. ' + h.nick + (h.uid === BS.uid ? '（我）' : '') + '　' + h.dmg; g.appendChild(r); });
  if (BS.admin) {
    add('p', '<b>管理（老師）</b>' + (BS.mode === 'demo' ? '　示範模式：任何人都能試用' : ''), 'sm');
    const bx = add('div', '', 'bsadm'), sel = document.createElement('select'); sel.id = 'bsFest'; Object.keys(FEST).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = FEST[k][1] + ' ' + FEST[k][0]; if (k === f) o.selected = true; sel.appendChild(o); });
    const hp = document.createElement('select'); hp.id = 'bsHp'; [10000, 20000, 50000, 100000].forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = 'Boss 血量 ' + v; if (v === 20000) o.selected = true; hp.appendChild(o); });
    bx.appendChild(sel); bx.appendChild(hp);
    const r2 = document.createElement('div'); r2.className = 'bsrow'; bx.appendChild(r2);
    r2.appendChild(mkBtn('只切換節慶', () => bsAdmin('fest', sel.value), false));
    r2.appendChild(mkBtn('開新的 Boss', () => bsAdmin('new', sel.value, FEST_BOSS[sel.value], +hp.value).then(ok => ok && toast('新的 Boss 出現了！', 2500)), true));
    if (BS.mode === 'demo') r2.appendChild(mkBtn('模擬 5 位同學出擊', () => { const o = bsDemoLoad(); ['小安', '阿哲', '小美', '阿樂', '小宇'].forEach((n, i) => bsDemoApply(o, 'sim' + i, n, 600 + ((Math.random() * 1800) | 0))); bsDemoSave(o); bsRefresh(); }, false));
  }
}
$('bspX').onclick = closePanels; $('hBoss').onclick = () => { if (STARTED && !GAME.block) bsPanel(); };
// 開始遊戲後讀取一次，之後每 30 秒更新
{ const iv = setInterval(() => { if (!STARTED) return; clearInterval(iv); bsRefresh(); setInterval(() => { if (!document.hidden) bsRefresh(); }, 30000); }, 500); }
window.__boss = { BS, bsRefresh, bsHit, bsPanel, bsDemoLoad, bsAdmin, bsClaim };
