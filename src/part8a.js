/* ===== 同樂小行星：遊戲系統（A）資料、存檔、介面工具、家具模型 ===== */
const SAVE_KEY = 'tongle_planet_v1';
const ITEMS = {
  apple: { n: '蘋果', k: 'fruit', sell: 40, c: '#e0402e', d: '清脆多汁，果園樹上摘的。' },
  orange: { n: '橘子', k: 'fruit', sell: 40, c: '#f29a1f', d: '酸酸甜甜，剛剛好。' },
  pear: { n: '梨子', k: 'fruit', sell: 48, c: '#c8d255', d: '宜蘭的梨，水分很多。' },
  shell1: { n: '扇貝', k: 'shell', sell: 70, c: '#f2b6a0', d: '沙灘上的粉色貝殼。' },
  shell2: { n: '海螺', k: 'shell', sell: 90, c: '#e8d6b8', d: '貼在耳邊像有海聲。' },
  star: { n: '海星', k: 'shell', sell: 160, c: '#f08a3c', d: '五個角，很少見。' },
  butterfly: { n: '蝴蝶', k: 'bug', sell: 220, c: '#7ab8ff', d: '白天在草地上飛。' },
  dragonfly: { n: '蜻蜓', k: 'bug', sell: 150, c: '#52c8a8', d: '白天飛得很快。' },
  stag: { n: '鍬形蟲', k: 'bug', sell: 480, c: '#4a3326', d: '夜晚才會出現的大傢伙。' },
  tilapia: { n: '吳郭魚', k: 'fish', sell: 120, c: '#9aa8b0', d: '最常釣到的魚。' },
  bass: { n: '鱸魚', k: 'fish', sell: 320, c: '#6f8ea0', d: '力氣不小。' },
  tuna: { n: '鮪魚', k: 'fish', sell: 900, c: '#3a5f9a', d: '大魚！很值錢。' },
  chair: { n: '木椅', k: 'furn', buy: 240, c: '#b88c5a', d: '簡單的小木椅。' },
  bench: { n: '長椅', k: 'furn', buy: 480, c: '#a37a48', d: '可以坐兩個人。' },
  table: { n: '圓桌', k: 'furn', buy: 560, c: '#d2a86a', d: '放在草地上野餐。' },
  lamp: { n: '路燈', k: 'furn', buy: 700, c: '#f2d06a', d: '晚上會亮。' },
  umbrella: { n: '海灘傘', k: 'furn', buy: 640, c: '#e8553d', d: '紅白相間，很有夏天味道。' },
  sapling: { n: '樹苗', k: 'plant', buy: 300, c: '#4f9a48', d: '一棵小樹。' },
  palm: { n: '椰子樹', k: 'plant', buy: 520, c: '#7bb04a', d: '海邊風情。' },
  sunflower: { n: '向日葵', k: 'plant', buy: 120, c: '#f2c230', d: '三朵一叢。' },
  candy: { n: '萬聖節糖果', k: 'hw', sell: 30, c: '#ff8a1f', d: '萬聖節限定，甜甜的南瓜口味。' },
  pumpkin: { n: '小南瓜', k: 'hw', sell: 60, c: '#f28a1c', d: '圓滾滾、笑咪咪的南瓜。' },
  skull: { n: '可愛骷髏糖', k: 'hw', sell: 100, c: '#f4efe2', d: '白白胖胖的小骷髏，一點都不可怕。' },
  rose: { n: '玫瑰花叢', k: 'plant', buy: 160, c: '#d8404f', d: '紅色小花。' }
};
const KIND_ORDER = ['fruit', 'shell', 'bug', 'fish', 'furn', 'plant', 'hw'];
const G = { coins: 0, inv: {}, placed: [], q: {}, resp: {}, timeMode: 'auto', edition: 'normal', hw: { done: {}, seen: 0 }, pos: null, t: 0 };
let STARTED = false;
function newGame() { G.coins = 300; G.inv = { chair: 1, sapling: 1 }; G.placed = []; G.q = {}; G.resp = {}; G.timeMode = 'auto'; G.edition = 'normal'; G.hw = { done: {}, seen: 0 }; G.pos = null; }
function loadSave() { try { const r = localStorage.getItem(SAVE_KEY); if (!r) return false; const o = JSON.parse(r); if (!o || o.v !== 1) return false; G.coins = o.coins | 0; G.inv = o.inv || {}; G.placed = o.placed || []; G.q = o.q || {}; G.resp = o.resp || {}; G.timeMode = o.timeMode || 'auto'; G.edition = o.edition || 'normal'; G.hw = o.hw || { done: {}, seen: 0 }; G.pos = o.pos || null; return true; } catch (e) { return false; } }
function saveGame() {
  if (!STARTED) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, coins: G.coins, inv: G.inv, placed: G.placed, q: G.q, resp: G.resp, timeMode: G.timeMode, edition: G.edition, hw: G.hw, pos: [+PL.x.toFixed(2), +PL.z.toFixed(2), +PL.yaw.toFixed(2)], at: Date.now() })); } catch (e) {}
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
const have = id => G.inv[id] | 0;
function addItem(id, n) { G.inv[id] = have(id) + (n || 1); if (G.inv[id] <= 0) delete G.inv[id]; refreshHud(); }
function takeItem(id, n) { if (have(id) < n) return false; G.inv[id] -= n; if (G.inv[id] <= 0) delete G.inv[id]; refreshHud(); return true; }
function addCoins(n) { G.coins += n; refreshHud(); }

// ---- 介面工具 ----
let toastT = 0;
function toast(msg, ms) { const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2200); }
function refreshHud() {
  $('hCoin').textContent = G.coins; ['shopCoin', 'bagCoin'].forEach(i => { const e = $(i); if (e) e.textContent = G.coins; });
  const h = GT.hour, hh = Math.floor(h), mm = Math.floor((h - hh) * 60); $('hClock').textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + (GT.night ? '　夜晚' : '　白天');
}
const PANELS = ['shop', 'bag', 'qst', 'dlg', 'hwp', 'edp'];
function anyPanel() { return PANELS.some(p => !$(p).hidden); }
function syncBlock() { GAME.block = anyPanel() || !STARTED; document.body.classList.toggle('gamedlg', anyPanel()); }
function openPanel(id) { PANELS.forEach(p => { if (p !== id) $(p).hidden = true; }); $(id).hidden = false; syncBlock(); }
function closePanels() { PANELS.forEach(p => { $(p).hidden = true; }); syncBlock(); if (dlgNpc) { const n = dlgNpc; dlgNpc = null; n.gt = 0.4; } }
let dlgNpc = null;
function openDlg(name, text, btns, npc) {
  openPanel('dlg'); $('dlgN').textContent = name; $('dlgT').textContent = text; const b = $('dlgB'); b.innerHTML = '';
  btns.forEach(x => { const e = document.createElement('button'); e.type = 'button'; e.textContent = x.t; if (x.go) e.className = 'go'; e.onclick = x.fn; b.appendChild(e); });
  if (npc) { dlgNpc = npc; npc.state = 'greet'; npc.gt = 1e9; npc.prev = 'wait'; npc.path = null; }
}
function itemCard(id, extra) {
  const it = ITEMS[id], d = document.createElement('div'); d.className = 'it';
  d.innerHTML = '<div class="sw" style="background:' + it.c + '"></div><div class="nm">' + it.n + (extra && extra.cnt !== undefined ? ' ×' + extra.cnt : '') + '</div><div class="ds">' + it.d + '</div>';
  return d;
}
function mkBtn(t, fn, go, dis) { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; if (go) b.className = 'go'; if (dis) b.disabled = true; b.onclick = fn; return b; }

// ---- 背包 ----
function bagOpen() {
  openPanel('bag'); const L = $('bagList'); L.innerHTML = ''; let n = 0;
  KIND_ORDER.forEach(k => Object.keys(G.inv).filter(id => ITEMS[id] && ITEMS[id].k === k).forEach(id => {
    n++; const c = itemCard(id, { cnt: G.inv[id] });
    if (ITEMS[id].buy) c.appendChild(mkBtn('擺放到星球', () => placeStart(id), true)); else { const s = document.createElement('div'); s.className = 'ds'; s.textContent = '小舖收購價 ' + ITEMS[id].sell + ' 幣'; c.appendChild(s); }
    L.appendChild(c);
  }));
  if (!n) L.innerHTML = '<div class="emp">背包是空的。去果園摘水果、在沙灘撿貝殼、抓蝴蝶、釣魚吧！</div>';
}
// ---- 小舖 ----
let shopTab = 'buy';
function shopOpen(tab) {
  shopTab = tab || shopTab; openPanel('shop'); $('shopBuy').classList.toggle('on', shopTab === 'buy'); $('shopSell').classList.toggle('on', shopTab === 'sell');
  const L = $('shopList'); L.innerHTML = ''; refreshHud();
  if (shopTab === 'buy') Object.keys(ITEMS).filter(id => ITEMS[id].buy).forEach(id => {
    const c = itemCard(id), p = ITEMS[id].buy; const d = document.createElement('div'); d.className = 'ds'; d.textContent = p + ' 幣（持有 ' + have(id) + '）'; c.appendChild(d);
    c.appendChild(mkBtn('購買', () => { if (G.coins < p) { toast('同樂幣不夠'); return; } addCoins(-p); addItem(id); toast('買了 ' + ITEMS[id].n); shopOpen(); saveGame(); }, true, G.coins < p)); L.appendChild(c);
  });
  else { let n = 0; KIND_ORDER.forEach(k => Object.keys(G.inv).filter(id => ITEMS[id] && ITEMS[id].k === k && ITEMS[id].sell).forEach(id => {
    n++; const c = itemCard(id, { cnt: G.inv[id] }), p = ITEMS[id].sell; const d = document.createElement('div'); d.className = 'ds'; d.textContent = '每個 ' + p + ' 幣'; c.appendChild(d);
    const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:6px'; row.appendChild(mkBtn('賣 1 個', () => { takeItem(id, 1); addCoins(p); shopOpen(); saveGame(); }, false)); if (G.inv[id] > 1) row.appendChild(mkBtn('全部賣出', () => { const q = have(id); takeItem(id, q); addCoins(p * q); toast('賣出 ' + q + ' 個，得到 ' + p * q + ' 幣'); shopOpen(); saveGame(); }, true)); c.appendChild(row); L.appendChild(c);
  })); if (!n) L.innerHTML = '<div class="emp">沒有可以賣的東西。水果、貝殼、昆蟲、魚都可以賣。</div>'; }
}
$('shopBuy').onclick = () => shopOpen('buy'); $('shopSell').onclick = () => shopOpen('sell'); $('shopX').onclick = closePanels; $('bagX').onclick = closePanels; $('qstX').onclick = closePanels;

// ---- 家具與植物的模型（用積木組成，原點在地面） ----
const _lm = {}; const LM = c => _lm[c] || (_lm[c] = new T.MeshLambertMaterial({ color: c }));
function bxm(w, h, d, x, y, z, c) { const m = new T.Mesh(new T.BoxGeometry(w, h, d), LM(c)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function cym(r1, r2, h, x, y, z, c, seg) { const m = new T.Mesh(new T.CylinderGeometry(r1, r2, h, seg || 10), LM(c)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function spm(r, x, y, z, c, sy) { const m = new T.Mesh(new T.SphereGeometry(r, 10, 8), LM(c)); m.position.set(x, y, z); if (sy) m.scale.y = sy; m.castShadow = true; return m; }
const PROPS = {
  chair: g => { g.add(bxm(0.5, 0.07, 0.5, 0, 0.45, 0, 0xb88c5a), bxm(0.5, 0.5, 0.06, 0, 0.74, -0.22, 0xa57a4a)); [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]].forEach(p => g.add(bxm(0.06, 0.43, 0.06, p[0], 0.215, p[1], 0x8a6038))); },
  bench: g => { g.add(bxm(1.7, 0.09, 0.5, 0, 0.5, 0, 0xa37a48), bxm(1.7, 0.4, 0.07, 0, 0.82, -0.23, 0x94693a)); [-.75, .75].forEach(x => g.add(bxm(0.08, 0.5, 0.45, x, 0.25, 0, 0x6e4a28))); },
  table: g => { g.add(cym(0.85, 0.85, 0.08, 0, 0.78, 0, 0xd2a86a, 20), cym(0.09, 0.12, 0.76, 0, 0.38, 0, 0x8a6038), cym(0.4, 0.45, 0.06, 0, 0.03, 0, 0x8a6038, 14)); },
  lamp: g => { g.add(cym(0.07, 0.1, 3.2, 0, 1.6, 0, 0x3a4048), cym(0.25, 0.25, 0.1, 0, 0.05, 0, 0x3a4048, 12)); const h = new T.Mesh(new T.SphereGeometry(0.28, 12, 10), PROP_GLOW); h.position.y = 3.3; g.add(h); },
  umbrella: g => { g.add(cym(0.04, 0.05, 2.5, 0, 1.25, 0, 0xf4f0e6)); const c = new T.Mesh(new T.ConeGeometry(1.7, 0.7, 12, 1, true), LM(0xe8553d)); c.material = new T.MeshLambertMaterial({ color: 0xe8553d, side: T.DoubleSide }); c.position.y = 2.5; c.castShadow = true; g.add(c); const c2 = new T.Mesh(new T.ConeGeometry(1.72, 0.72, 12, 1, true, 0, Math.PI / 3), new T.MeshLambertMaterial({ color: 0xffffff, side: T.DoubleSide })); c2.position.y = 2.5; g.add(c2); },
  sapling: g => { g.add(cym(0.1, 0.16, 1.3, 0, 0.65, 0, 0x6b4f33, 7), spm(0.95, 0, 1.9, 0, 0x4f9a48), spm(0.6, 0.35, 2.4, 0.1, 0x62ae52)); },
  palm: g => { g.add(cym(0.14, 0.22, 3.4, 0, 1.7, 0, 0x8a6a40, 8)); for (let i = 0; i < 6; i++) { const l = new T.Mesh(new T.ConeGeometry(0.22, 1.9, 4), LM(0x5ea63a)); const a = i / 6 * Math.PI * 2; l.position.set(Math.cos(a) * 0.8, 3.5, Math.sin(a) * 0.8); l.rotation.z = -Math.cos(a) * 1.15; l.rotation.x = Math.sin(a) * 1.15; l.castShadow = true; g.add(l); } g.add(spm(0.17, 0.12, 3.35, 0.1, 0x6b4a20), spm(0.17, -0.1, 3.3, -0.1, 0x6b4a20)); },
  sunflower: g => { [[0, 0], [0.5, 0.2], [-0.35, 0.4]].forEach((p, i) => { const h = 1.0 + i * 0.22; g.add(cym(0.03, 0.04, h, p[0], h / 2, p[1], 0x3d8a3a, 5)); const d = cym(0.2, 0.2, 0.05, p[0], h + 0.02, p[1], 0xf2c230, 14); d.rotation.x = 0.5; g.add(d); const c = cym(0.1, 0.1, 0.07, p[0], h + 0.04, p[1], 0x5a3a1a, 10); c.rotation.x = 0.5; g.add(c); }); },
  rose: g => { g.add(spm(0.65, 0, 0.5, 0, 0x3f8a3c, 0.8)); for (let i = 0; i < 6; i++) { const a = i * 1.1; g.add(spm(0.11, Math.cos(a) * 0.45, 0.65 + (i % 3) * 0.1, Math.sin(a) * 0.45, 0xd8404f)); } }
};
const PROP_GLOW = new T.MeshBasicMaterial({ color: 0xcfc7a0 });
function makeProp(id) { const g = new T.Group(); PROPS[id](g); return g; }
const PROP_R = { chair: 0.4, bench: 0.9, table: 0.9, lamp: 0.3, umbrella: 0.5, sapling: 0.6, palm: 0.5, sunflower: 0.7, rose: 0.7 };
