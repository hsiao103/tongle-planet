/* ===== 同樂小行星：遊戲系統（B）採集、小舖、居民委託、擺設、互動、主迴圈 ===== */
const _fq = new T.Quaternion(), _fp = new T.Vector3(), _fs = new T.Vector3(1, 1, 1), _fm = new T.Matrix4(), _fh = new T.Matrix4().makeScale(0, 0, 0);
const rr = (() => { let s = 777; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
const nowMs = () => Date.now();

// ---- 果樹：從校外的樹挑 16 棵，會長出水果，搖一搖掉下來，隔一段時間再長 ----
const FRUIT = [];
(function () {
  const ft = (window.__farTrees || []).map((t, i) => ({ t, i, d: pdist(t[0], t[1]) })).filter(o => o.d < 175).sort((a, b) => a.d - b.d).slice(0, 16);
  const types = ['apple', 'orange', 'pear'], cols = [0xe0402e, 0xf29a1f, 0xc8d255], geo = new T.SphereGeometry(0.17, 8, 6);
  const IM = cols.map(c => { const im = new T.InstancedMesh(geo, new T.MeshLambertMaterial({ color: c }), ft.length * 5); im.frustumCulled = false; im.castShadow = true; scene.add(im); return im; });
  ft.forEach((o, n) => {
    const kind = n % 3, x = o.t[0], z = o.t[1], s = o.t[2] || 1, f = { id: n, x, z, kind, type: types[kind], fr: [] };
    for (let j = 0; j < 5; j++) { const a = j * 1.26 + n, ox = Math.cos(a) * 1.25 * s, oz = Math.sin(a) * 1.25 * s; f.fr.push([x + ox * 0.9, 2.6 * s + (j % 2) * 0.5 * s, z + oz * 0.9]); }
    f.im = IM[kind]; f.base = n * 5; FRUIT.push(f);
  });
  FRUIT.forEach(f => fruitShow(f, !(G.resp['f' + f.id] > nowMs())));
})();
function fruitShow(f, on) {
  f.on = on;
  f.fr.forEach((p, j) => { if (on) { frameQuat(p[0], p[2], _fq); sph(p[0], p[1], p[2], _fp); _fm.compose(_fp, _fq, _fs); } else _fm.copy(_fh); f.im.setMatrixAt(f.base + j, _fm); });
  f.im.instanceMatrix.needsUpdate = true;
}
// ---- 貝殼：沙灘上 36 個，撿起後 5 分鐘再出現 ----
const SHELLS = [];
(function () {
  const g1 = new T.SphereGeometry(0.2, 8, 5); g1.scale(1, 0.4, 1); const g2 = new T.ConeGeometry(0.13, 0.36, 7); g2.rotateZ(Math.PI / 2); g2.translate(0, 0.1, 0);
  const g3 = new T.CylinderGeometry(0.28, 0.1, 0.06, 5); g3.translate(0, 0.03, 0);
  const cfg = [['shell1', g1, 0xf2b6a0], ['shell2', g2, 0xe8d6b8], ['star', g3, 0xf08a3c]], per = 12;
  const IM = cfg.map(c => { const im = new T.InstancedMesh(c[1], new T.MeshLambertMaterial({ color: c[2] }), per); im.frustumCulled = false; scene.add(im); return im; });
  for (let k = 0; k < 3; k++) for (let i = 0; i < per; i++) {
    const az = rr() * 6.283, d = PWALK - 3 - rr() * 18, x = PC.x + Math.cos(az) * d, z = PC.z + Math.sin(az) * d;
    SHELLS.push({ id: k * per + i, x, z, type: cfg[k][0], im: IM[k], idx: i, yaw: rr() * 6.28 });
  }
  SHELLS.forEach(s => shellShow(s, !(G.resp['s' + s.id] > nowMs())));
})();
function shellShow(s, on) { s.on = on; if (on) { frameQuat(s.x, s.z, _fq); _fq.multiply(new T.Quaternion().setFromAxisAngle(_ey, s.yaw)); sph(s.x, 0.03, s.z, _fp); _fm.compose(_fp, _fq, _fs); } else _fm.copy(_fh); s.im.setMatrixAt(s.idx, _fm); s.im.instanceMatrix.needsUpdate = true; }

// ---- 昆蟲：在玩家附近飄；白天蝴蝶／蜻蜓，夜晚鍬形蟲 ----
const BUGS = [];
function bugModel(type) {
  const g = new T.Group(), col = { butterfly: 0x7ab8ff, dragonfly: 0x52c8a8, stag: 0x4a3326 }[type];
  if (type === 'stag') { const b = new T.Mesh(new T.SphereGeometry(0.16, 8, 6), LM(0x4a3326)); b.scale.set(1, 0.55, 1.5); b.position.y = 0.1; g.add(b); [-1, 1].forEach(s => { const h = bxm(0.03, 0.03, 0.18, s * 0.07, 0.12, -0.26, 0x2a1c12); h.rotation.y = s * 0.4; g.add(h); }); return g; }
  const body = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, type === 'dragonfly' ? 0.4 : 0.16, 5), LM(0x2b2b2b)); body.rotation.x = Math.PI / 2; g.add(body);
  const wm = new T.MeshBasicMaterial({ color: col, side: T.DoubleSide, transparent: true, opacity: 0.9 }), wg = new T.PlaneGeometry(type === 'dragonfly' ? 0.34 : 0.24, type === 'dragonfly' ? 0.08 : 0.2); g.wings = [];
  [-1, 1].forEach(s => { const piv = new T.Group(); const w = new T.Mesh(wg, wm); w.rotation.x = -Math.PI / 2; w.position.x = s * (type === 'dragonfly' ? 0.17 : 0.12); piv.add(w); piv.userData.s = s; g.add(piv); g.wings.push(piv); });
  return g;
}
function bugSpawn(b) {
  const night = GT.night, type = night ? 'stag' : (rr() < 0.65 ? 'butterfly' : 'dragonfly');
  for (let t = 0; t < 12; t++) {
    const a = rr() * 6.283, d = 7 + rr() * 18, x = PL.x + Math.cos(a) * d, z = PL.z + Math.sin(a) * d;
    if (pdist(x, z) > PWALK - 6 || blocked(x, z, 0.1) || playerBldAt(x, z) || Math.abs(groundAt(x, 0.5, z)) > 0.25) continue;
    if (b.g) { scene.remove(b.g); }
    b.type = type; b.g = bugModel(type); b.x = x; b.z = z; b.y = type === 'stag' ? 0.02 : 0.9 + rr() * 1.2; b.h = rr() * 6.28; b.ph = rr() * 6; b.t = 0; scene.add(b.g); dynAdd(b.g); return true;
  } return false;
}
function playerBldAt(x, z) { for (const f of FOOT) if (f.id) { let px = x, pz = z; if (f.tf) { const dx = x - f.tf.x, dz = z - f.tf.z; px = dx * f.tf.c - dz * f.tf.s; pz = dx * f.tf.s + dz * f.tf.c; } if (px > f.x0 - 1 && px < f.x1 + 1 && pz > f.z0 - 1 && pz < f.z1 + 1) return true; } return false; }
for (let i = 0; i < 6; i++) BUGS.push({ g: null, type: '', x: 0, z: 0, y: 0, h: 0, ph: 0, t: 0 });
function bugTick(dt) {
  BUGS.forEach(b => {
    if (!b.g || (b.type === 'stag') !== GT.night || Math.hypot(b.x - PL.x, b.z - PL.z) > 48) { if (!bugSpawn(b) && b.g) { b.g.visible = false; } return; }
    b.g.visible = true; b.ph += dt * 9; const dp = Math.hypot(b.x - PL.x, b.z - PL.z), flee = dp < 3.2 && b.type !== 'stag';
    b.t -= dt; if (b.t <= 0) { b.t = 1 + rr() * 2.5; b.h += (rr() - 0.5) * 2.2; }
    if (flee) b.h = Math.atan2(b.z - PL.z, b.x - PL.x) + (rr() - 0.5) * 0.6;
    const sp = b.type === 'stag' ? 0.12 : flee ? 2.6 : b.type === 'dragonfly' ? 1.7 : 0.9, nx = b.x + Math.cos(b.h) * sp * dt, nz = b.z + Math.sin(b.h) * sp * dt;
    if (pdist(nx, nz) < PWALK - 5 && !blocked(nx, nz, 0.1)) { b.x = nx; b.z = nz; } else b.h += 2.4;
    if (b.type !== 'stag') b.y += Math.sin(b.ph * 0.45) * 0.4 * dt;
    b.g.position.set(b.x, b.y, b.z); b.g.rotation.y = -b.h - Math.PI / 2;
    if (b.g.wings) b.g.wings.forEach(w => { w.rotation.z = Math.sin(b.ph * (b.type === 'dragonfly' ? 2.2 : 1)) * 0.9 * w.userData.s; });
  });
}

// ---- 釣魚 ----
const FISH = { st: 'idle', t: 0, bob: null };
FISH.bob = (() => { const g = new T.Group(); g.add(spm(0.1, 0, 0, 0, 0xe8402e), spm(0.1, 0, -0.1, 0, 0xffffff)); g.visible = false; scene.add(g); return g; })();
function nearShore() { return pdist(PL.x, PL.z) > PWALK - 9 && PL.y < 1; }
function fishCast() {
  const dx = PL.x - PC.x, dz = PL.z - PC.z, d = Math.hypot(dx, dz), ux = dx / d, uz = dz / d;
  PL.yaw = Math.atan2(-ux, -uz); fwFromYaw();
  const bx = PC.x + ux * (PWALK + 3.5), bz = PC.z + uz * (PWALK + 3.5); placeOnPlanet(FISH.bob, bx, bz, 0, -0.42); FISH.bob.visible = true; FISH.bx = bx; FISH.bz = bz;
  FISH.st = 'wait'; FISH.t = 2 + rr() * 4; toast('拋竿！等魚上鉤…', 1500);
}
function fishEnd() { FISH.st = 'idle'; FISH.bob.visible = false; }
function fishPress() {
  if (FISH.st === 'idle') fishCast();
  else if (FISH.st === 'wait') { toast('太早拉了，魚跑掉了'); fishEnd(); }
  else if (FISH.st === 'bite') {
    const r = rr(), id = GT.night ? (r < 0.25 ? 'tuna' : r < 0.65 ? 'bass' : 'tilapia') : (r < 0.08 ? 'tuna' : r < 0.38 ? 'bass' : 'tilapia');
    addItem(id); toast('釣到 ' + ITEMS[id].n + '！'); fishEnd(); saveGame();
  }
}
function fishTick(dt) {
  if (FISH.st === 'idle') return;
  if (!nearShore() || GAME.block) { fishEnd(); return; }
  FISH.t -= dt;
  const y = -0.42 + Math.sin(performance.now() / 300) * (FISH.st === 'bite' ? 0.12 : 0.03); placeOnPlanet(FISH.bob, FISH.bx, FISH.bz, 0, y);
  if (FISH.st === 'wait' && FISH.t <= 0) { FISH.st = 'bite'; FISH.t = 1.5; toast('有魚上鉤！快按 E', 1400); }
  else if (FISH.st === 'bite' && FISH.t <= 0) { toast('魚跑掉了…'); fishEnd(); }
}

// ---- 小舖（固定在校門東側）與老闆 ----
const SHOP = { x: 14.5, z: 4, yaw: -Math.PI / 2 };
(function () {
  const g = new T.Group();
  g.add(bxm(4.2, 0.12, 3.2, 0, 0.06, 0, 0xcdb78a));                             // 地台
  g.add(bxm(4, 1.05, 0.9, 0, 0.62, 1.1, 0xb8844e), bxm(4.1, 0.1, 1.0, 0, 1.17, 1.1, 0xe6cf9a));        // 櫃台
  g.add(bxm(4, 2.8, 0.2, 0, 1.5, -1.4, 0xd8c9a4));                               // 後牆
  g.add(bxm(0.2, 2.6, 2.4, -2, 1.4, -0.1, 0xc9b888), bxm(0.2, 2.6, 2.4, 2, 1.4, -0.1, 0xc9b888));     // 兩側
  for (let i = 0; i < 8; i++) { const a = bxm(0.5, 0.12, 3.0, -1.75 + i * 0.5, 2.78 + (i % 2) * 0.0, 0.1, i % 2 ? 0xffffff : 0xe8553d); a.rotation.x = 0.18; g.add(a); }
  [[-1.6, 0xe0402e], [-1.0, 0xf29a1f], [1.0, 0xc8d255], [1.6, 0xe0402e]].forEach(p => g.add(bxm(0.5, 0.28, 0.5, p[0], 1.36, 1.1, 0x9a6a3a), spm(0.2, p[0] - 0.08, 1.58, 1.1, p[1]), spm(0.2, p[0] + 0.1, 1.55, 1.15, p[1])));
  const sign = new T.Mesh(new T.PlaneGeometry(2.8, 0.7), new T.MeshBasicMaterial({ map: canvasTex(320, 80, (c, w, h) => { c.fillStyle = '#fff4d0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c4601a'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = '#b3470f'; c.font = 'bold 46px "Noto Sans TC",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('同樂小舖', w / 2, h / 2 + 3); }) }));
  sign.position.set(0, 3.5, 1.5); g.add(sign);
  placeOnPlanet(g, SHOP.x, SHOP.z, SHOP.yaw); scene.add(g); g.traverse(o => { o.matrixAutoUpdate = true; });
  WALLS.push({ x0: SHOP.x - 2.1, x1: SHOP.x + 1.2, z0: SHOP.z - 2.2, z1: SHOP.z + 2.2, y0: -1, y1: 4 });
})();
let CLERK = null;
(async function () {
  try { const a = await loadGLB('girl'); CLERK = makeChar(a, { h: 1.55, q: 0, arm: 0.98, colors: { skin: 0xf0c9a4, hair: 0x4a3426, 'school-shirt': 0xf4f1ea, 'school-sleeve': 0xf4f1ea, 'school-shorts': 0xe8553d, shoes: 0x2b3340, collar: 0xe8553d, 'hair-band': 0xf2c230 } });
    CLERK.node.position.set(SHOP.x + 0.5, 0, SHOP.z); CLERK.node.rotation.y = Math.PI / 2; scene.add(CLERK.node); dynAdd(CLERK.node); } catch (e) { console.warn('clerk', e); }
})();

// ---- 居民：對話與委託 ----
const TALK = {
  '阿哲': { g: ['我查過了，這顆星球半徑大約一百公尺。', '要不要一起研究這顆星球的地圖？'], gift: 'lamp', q: [['apple', 2, 120, '我想做蘋果的觀察報告，可以幫我摘兩顆蘋果嗎？'], ['shell1', 1, 150, '我想研究貝殼的紋路，海邊的扇貝可以給我一個嗎？'], ['butterfly', 1, 320, '昆蟲圖鑑還缺一隻蝴蝶，你能抓一隻給我嗎？']] },
  '米米': { g: ['哈！你今天看起來很有精神。', '我跟你說，海邊的風超舒服。'], gift: 'bench', q: [['orange', 3, 160, '班上要辦水果派對，橘子還缺三顆，幫我摘好嗎？'], ['pear', 2, 130, '我想吃梨子，可以幫我找兩顆嗎？'], ['tilapia', 1, 200, '我想看看魚長什麼樣子，幫我釣一條吳郭魚吧！']] },
  '鼓鼓': { g: ['氣勢！氣勢不能輸！', '練完鼓肚子好餓……'], gift: 'umbrella', q: [['pear', 2, 140, '練鼓後想吃兩顆梨子補充體力，可以嗎？'], ['shell2', 1, 180, '我想把海螺當樂器試試看，幫我撿一個。'], ['stag', 1, 750, '聽說晚上有鍬形蟲！我想看，幫我抓一隻好嗎？']] },
  '小綠': { g: ['地球需要你，這顆星球也需要你！', '今天要不要一起撿海邊的垃圾？'], gift: 'palm', q: [['star', 1, 260, '我在做海岸生態調查，想看看海星，你能找一個嗎？'], ['dragonfly', 2, 330, '小蜻蜓是水質的指標，幫我抓兩隻來記錄好嗎？'], ['orange', 2, 120, '環保市集要用橘子做果醋，幫我摘兩顆。']] },
  '小戲': { g: ['唱做念打樣樣行！', '今天的主角，是你！'], gift: 'table', q: [['butterfly', 2, 480, '戲服要用蝴蝶當裝飾靈感，幫我抓兩隻來看看！'], ['apple', 1, 70, '劇裡有個蘋果的橋段，借我一顆當道具吧。'], ['bass', 1, 520, '舞台劇需要一條大魚當道具，鱸魚可以嗎？']] },
  '踢踢': { g: ['禮義廉恥，一起加油！', '運動前要先暖身喔。'], gift: 'chair', q: [['tilapia', 2, 260, '訓練完想吃魚，幫我釣兩條吳郭魚好嗎？'], ['pear', 3, 190, '補充水分，我需要三顆梨子。'], ['tuna', 1, 1500, '我想挑戰最大的魚，幫我釣一條鮪魚吧！']] },
  '王老師': { g: ['同學，在星球上要注意安全喔。', '歡迎來到同樂，慢慢逛。'], gift: 'sunflower', q: [['orange', 4, 220, '今天是水果日，我想請全班吃橘子，需要四顆。'], ['shell1', 3, 300, '自然課要觀察貝殼，可以幫我收集三個扇貝嗎？'], ['butterfly', 1, 300, '課堂標本缺一隻蝴蝶，麻煩你了。']] },
  '李老師': { g: ['學習不只在教室，整顆星球都是教室。', '有問題隨時問我。'], gift: 'rose', q: [['apple', 4, 260, '老師想做蘋果派，需要四顆蘋果。'], ['bass', 1, 480, '社團活動需要鱸魚，幫我釣一條吧。'], ['shell2', 2, 330, '美勞課要做貝殼畫，幫我找兩個海螺。']] },
  '警衛伯伯': { g: ['歡迎來同樂國小，注意安全。', '放學的時候路上要小心。'], gift: 'lamp', q: [['tilapia', 1, 150, '晚餐想加菜，你能釣一條吳郭魚給伯伯嗎？'], ['orange', 2, 110, '巡邏口渴了，想吃兩顆橘子。'], ['dragonfly', 1, 180, '孫子想看蜻蜓，你可以抓一隻嗎？']] }
};
function npcName(n) {
  if (n.pname) return n.pname; if (n.nm) return n.nm;
  const t = NPCS.filter(x => !x.pname); const i = t.indexOf(n); n.nm = n.role === 'guard' ? '警衛伯伯' : ['王老師', '李老師'][Math.max(0, t.filter(x => x.role === 'teacher').indexOf(n))] || '老師'; return n.nm;
}
function qState(nm) { return G.q[nm] || (G.q[nm] = { st: 'none', done: 0 }); }
function qCur(nm) { const T0 = TALK[nm], s = qState(nm); return T0.q[s.done % T0.q.length]; }
function talk(n) {
  const nm = npcName(n), T0 = TALK[nm]; if (!T0) { openDlg(nm, '你好！', [{ t: '再見', fn: closePanels }], n); return; }
  const s = qState(nm), q = qCur(nm), greet = T0.g[(Math.random() * T0.g.length) | 0] + (s.done >= 3 ? '\n（我們已經是好朋友了！）' : '');
  const btns = [];
  if (s.st === 'none') btns.push({ t: '有什麼委託嗎？', go: true, fn: () => { s.st = 'active'; openDlg(nm, q[3] + '\n\n需要：' + ITEMS[q[0]].n + ' ×' + q[1] + '　報酬：' + q[2] + ' 幣', [{ t: '沒問題！', go: true, fn: () => { closePanels(); toast('接下委託：' + ITEMS[q[0]].n + ' ×' + q[1]); saveGame(); } }, { t: '我考慮一下', fn: () => { s.st = 'none'; closePanels(); } }], n); } });
  else btns.push({ t: have(q[0]) >= q[1] ? '交付委託（' + ITEMS[q[0]].n + ' ×' + q[1] + '）' : '委託進度：' + have(q[0]) + '/' + q[1] + ' ' + ITEMS[q[0]].n, go: have(q[0]) >= q[1], fn: () => {
    if (have(q[0]) < q[1]) { closePanels(); toast('還差 ' + (q[1] - have(q[0])) + ' 個 ' + ITEMS[q[0]].n); return; }
    takeItem(q[0], q[1]); addCoins(q[2]); s.st = 'none'; s.done++; let extra = '';
    if (s.done === 3 && T0.gift) { addItem(T0.gift); extra = '\n\n我們成了好朋友，送你一個「' + ITEMS[T0.gift].n + '」當禮物！'; }
    openDlg(nm, '太感謝了！\n獲得 ' + q[2] + ' 幣。' + extra, [{ t: '不客氣', go: true, fn: closePanels }], n); saveGame();
  } });
  btns.push({ t: '再見', fn: closePanels });
  openDlg(nm, greet, btns, n);
}
function clerkTalk() { openDlg('小舖老闆', '歡迎光臨同樂小舖！\n我們收購水果、貝殼、昆蟲和魚，也賣家具與植物。', [{ t: '我要買東西', go: true, fn: () => shopOpen('buy') }, { t: '我要賣東西', fn: () => shopOpen('sell') }, { t: '再見', fn: closePanels }]); }
function qstOpen() {
  openPanel('qst'); const L = $('qstList'); L.innerHTML = ''; let n = 0;
  Object.keys(TALK).forEach(nm => { const s = G.q[nm]; if (!s) return; const q = qCur(nm); n++;
    const d = document.createElement('div'); d.className = 'q' + (s.st === 'active' ? '' : ' done');
    d.innerHTML = '<b>' + nm + '</b>　' + (s.st === 'active' ? '需要 ' + ITEMS[q[0]].n + ' ×' + q[1] + '（目前 ' + Math.min(have(q[0]), q[1]) + '/' + q[1] + '）　報酬 ' + q[2] + ' 幣' : '目前沒有委託') + '　已完成 ' + s.done + ' 件' + (s.done >= 3 ? '（好朋友）' : '');
    L.appendChild(d); });
  if (!n) L.innerHTML = '<div class="emp">還沒有委託。靠近居民按 E 說話，問問有什麼委託。</div>';
}

// ---- 擺設：把家具與植物放在星球上 ----
const PLACED = [];
let PLACING = null;
function placedAdd(rec, fromLoad) {
  const g = makeProp(rec.id); placeOnPlanet(g, rec.x, rec.z, rec.yaw); scene.add(g); g.traverse(o => { o.matrixAutoUpdate = true; });
  const r = PROP_R[rec.id] || 0.5, w = { x0: rec.x - r, x1: rec.x + r, z0: rec.z - r, z1: rec.z + r, y0: -1, y1: 2 };
  WALLS.push(w); PLACED.push({ rec, g, w }); if (!fromLoad) G.placed.push(rec);
}
function placedRemove(p) { scene.remove(p.g); const i = WALLS.indexOf(p.w); if (i >= 0) WALLS.splice(i, 1); PLACED.splice(PLACED.indexOf(p), 1); G.placed.splice(G.placed.indexOf(p.rec), 1); }
function placeStart(id) {
  closePanels(); const g = makeProp(id), gm = new T.MeshBasicMaterial({ color: 0x66ff88, transparent: true, opacity: 0.55, depthWrite: false });
  g.traverse(o => { if (o.isMesh) { o.material = gm; o.castShadow = false; } }); scene.add(g);
  PLACING = { id, g, gm, x: PL.x, z: PL.z, yaw: PL.yaw, ok: false }; $('place').hidden = false; $('placeN').textContent = '擺放：' + ITEMS[id].n;
}
function placeCancel() { if (!PLACING) return; scene.remove(PLACING.g); PLACING = null; $('place').hidden = true; }
function placeValid(x, z) {
  if (pdist(x, z) > PWALK - 5 || blocked(x, z, 0.1) || playerBldAt(x, z)) return false;
  if (Math.abs(groundAt(x, 0.5, z)) > 0.3) return false;
  for (const p of PLACED) if (Math.hypot(p.rec.x - x, p.rec.z - z) < 0.9) return false;
  if (Math.hypot(SHOP.x - x, SHOP.z - z) < 4.5) return false;
  return true;
}
function placeTick() {
  if (!PLACING) return; const P = PLACING, a = [0, 0]; sphUp(PL.x, PL.z, _U); sphUnJac(PL.x, PL.z, _W.copy(cam.fw).multiplyScalar(2.4), a);
  P.x = PL.x + a[0]; P.z = PL.z + a[1]; P.ok = placeValid(P.x, P.z); P.gm.color.set(P.ok ? 0x66ff88 : 0xff6666);
  placeOnPlanet(P.g, P.x, P.z, P.yaw);
}
function placeConfirm() {
  const P = PLACING; if (!P) return; if (!P.ok) { toast('這裡不能放（有東西擋住或不是平地）'); return; }
  if (!takeItem(P.id, 1)) { placeCancel(); return; }
  placedAdd({ id: P.id, x: +P.x.toFixed(2), z: +P.z.toFixed(2), yaw: +P.yaw.toFixed(3) }); toast('放好了：' + ITEMS[P.id].n); saveGame();
  if (have(P.id) <= 0) placeCancel(); else P.yaw += 0;
}
$('pOk').onclick = placeConfirm; $('pRot').onclick = () => { if (PLACING) PLACING.yaw += Math.PI / 4; }; $('pNo').onclick = placeCancel;

// ---- 互動：找最近、可做的事 ----
let CUR = null;
function findInteract() {
  let best = null, bd = 1e9; const cand = (d, lab, fn) => { if (d < bd) { bd = d; best = { lab, fn, d }; } };
  if (PLACING) return null;
  const ds = (x, z, y) => Math.abs((y === undefined ? PL.y : y) - PL.y) > 1.6 ? 1e9 : Math.hypot(x - PL.x, z - PL.z);
  const dsp = ds(SHOP.x - 2.4, SHOP.z); if (dsp < 3.4) cand(dsp, '和小舖老闆說話', clerkTalk);
  NPCS.forEach(n => { const d = ds(n.x, n.z, n.y); if (d < 2.7 && n.state !== 'dead') cand(d, '和 ' + npcName(n) + ' 說話', () => talk(n)); });
  FRUIT.forEach(f => { if (!f.on) return; const d = ds(f.x, f.z, 0); if (d < 2.4) cand(d, '搖一搖果樹（' + ITEMS[f.type].n + '）', () => { const n = 1 + ((Math.random() * 3) | 0); addItem(f.type, n); toast('+' + n + ' ' + ITEMS[f.type].n); fruitShow(f, false); G.resp['f' + f.id] = nowMs() + 8 * 60000; saveGame(); }); });
  SHELLS.forEach(s => { if (!s.on) return; const d = ds(s.x, s.z, 0); if (d < 1.7) cand(d, '撿起' + ITEMS[s.type].n, () => { addItem(s.type); toast('撿到 ' + ITEMS[s.type].n); shellShow(s, false); G.resp['s' + s.id] = nowMs() + 5 * 60000; saveGame(); }); });
  BUGS.forEach(b => { if (!b.g || !b.g.visible) return; const d = Math.hypot(b.x - PL.x, b.z - PL.z); if (d < 2.0 && Math.abs(b.y - PL.y) < 2.8) cand(d, '用網子抓' + ITEMS[b.type].n, () => { if (b.type !== 'stag' && Math.random() < 0.25) { toast('哎呀，被牠逃走了！'); b.h += 3; return; } addItem(b.type); toast('抓到 ' + ITEMS[b.type].n + '！'); scene.remove(b.g); b.g = null; saveGame(); }); });
  PLACED.forEach(p => { const d = Math.hypot(p.rec.x - PL.x, p.rec.z - PL.z); if (d < (PROP_R[p.rec.id] || 0.5) + 1.7) cand(d + 0.2, '收回' + ITEMS[p.rec.id].n, () => { addItem(p.rec.id); placedRemove(p); toast('收回 ' + ITEMS[p.rec.id].n); saveGame(); }); });
  if (nearShore()) cand(FISH.st === 'idle' ? 6 : 0.1, FISH.st === 'idle' ? '在這裡釣魚' : FISH.st === 'wait' ? '等待魚上鉤…（現在拉會嚇跑）' : '拉竿！', fishPress);
  if (typeof hwInteract === 'function') hwInteract(cand, ds);
  return best;
}
function interactNow() { if (CUR) CUR.fn(); }
$('prompt').onclick = () => { if (!GAME.block) interactNow(); };

// ---- 鍵盤、按鈕 ----
function gameKey(code) {
  if (!STARTED) return;
  if (code === 'Escape') { if (PLACING) placeCancel(); else closePanels(); return; }
  if (code === 'KeyB') { if (!$('bag').hidden) closePanels(); else { placeCancel(); bagOpen(); } return; }
  if (code === 'KeyQ') { if (!$('qst').hidden) closePanels(); else { placeCancel(); qstOpen(); } return; }
  if (PLACING) { if (code === 'KeyE') placeConfirm(); else if (code === 'KeyR') PLACING.yaw += Math.PI / 4; else if (code === 'KeyX') placeCancel(); return; }
  if (code === 'KeyE' && !anyPanel()) interactNow();
}
$('bBag').onclick = () => { if (!STARTED) return; if (!$('bag').hidden) closePanels(); else { placeCancel(); bagOpen(); } };
$('bQuest').onclick = () => { if (!STARTED) return; if (!$('qst').hidden) closePanels(); else { placeCancel(); qstOpen(); } };
const TM = ['auto', 'day', 'night'], TMN = { auto: '時間：自動', day: '時間：白天', night: '時間：夜晚' };
function setTimeMode(m) { GT.mode = m; G.timeMode = m; $('bTime').textContent = TMN[m]; $('bTime').classList.toggle('on', m !== 'auto'); saveGame(); }
$('bTime').onclick = () => setTimeMode(TM[(TM.indexOf(GT.mode) + 1) % 3]);
function gameMini(g, mp) {
  if (typeof hwMini === 'function') hwMini(g, mp); if (typeof mpMini === 'function') mpMini(g, mp);
  const s = mp(SHOP.x, SHOP.z); g.fillStyle = '#f2b01e'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.fillRect(s[0] - 6, s[1] - 6, 12, 12); g.strokeRect(s[0] - 6, s[1] - 6, 12, 12);
  g.fillStyle = '#2b7cff'; NPCS.forEach(n => { const p = mp(n.x, n.z); g.beginPath(); g.arc(p[0], p[1], 3.2, 0, 7); g.fill(); });
}

// ---- 每幀 ----
let hudT = 0, shopAnim = 0;
function gameTick(dt) {
  placeTick(); fishTick(dt); bugTick(dt); styleTick(dt); flyTick(dt); lblTick(); if (typeof hwTick === 'function') hwTick(dt); if (typeof mpTick === 'function') mpTick(dt);
  PROP_GLOW.color.set(GT.night ? 0xffe9a0 : 0xcfc7a0);
  if (CLERK) { CLERK.mixer.update(dt); CLERK.node.scale.setScalar(charScale()); }
  hudT -= dt; if (hudT <= 0) {
    hudT = 0.25; refreshHud();
    const now = nowMs(); FRUIT.forEach(f => { if (!f.on && !(G.resp['f' + f.id] > now)) fruitShow(f, true); }); SHELLS.forEach(s => { if (!s.on && !(G.resp['s' + s.id] > now)) shellShow(s, true); });
    CUR = STARTED && !GAME.block ? findInteract() : null; const p = $('prompt');
    if (CUR) { p.hidden = false; p.innerHTML = '<kbd>E</kbd>' + CUR.lab; } else p.hidden = true;
  }
  G.t += dt; if (G.t > 10) { G.t = 0; saveGame(); }
}
addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); }); addEventListener('beforeunload', saveGame);

// ---- 開場 ----
(function () {
  const intro = $('intro'), has = loadSave();
  GAME.block = true; document.body.classList.add('intro'); intro.classList.add('show');
  if (has) { $('iGo').textContent = '繼續冒險'; $('iNew').hidden = false; $('iSave').textContent = '找到這台電腦上的存檔：同樂幣 ' + G.coins + '，已擺放 ' + G.placed.length + ' 件。'; } else { newGame(); $('iSave').textContent = '進度會自動存在這個瀏覽器裡。'; }
  const begin = () => {
    intro.classList.remove('show'); document.body.classList.remove('intro'); STARTED = true;
    G.placed.slice().forEach(r => { G.placed.splice(G.placed.indexOf(r), 1); placedAdd(r, false); });
    FRUIT.forEach(f => fruitShow(f, !(G.resp['f' + f.id] > nowMs()))); SHELLS.forEach(s => shellShow(s, !(G.resp['s' + s.id] > nowMs())));
    setTimeMode(G.timeMode || 'auto'); if (typeof hwApply === 'function') hwApply(G.edition || 'normal', true);
    syncBlock(); refreshHud(); saveGame(); flyStart();
  };
  $('iGo').onclick = begin;
  $('iNew').onclick = () => { clearSave(); newGame(); begin(); };
  refreshHud();
})();
window.__game = { G, ITEMS, FRUIT, SHELLS, BUGS, FISH, TALK, SHOP, PLACED, talk, shopOpen, bagOpen, qstOpen, placeStart, findInteract, get CUR() { return CUR; }, get PLACING() { return PLACING; } };
