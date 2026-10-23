/* ===== 萬聖節限定版：版本選單、南瓜、可愛骷髏頭、小蝙蝠、三隻老師變成的校園妖怪 ===== */
window.HW = { on: false, k: 0, tint: new T.Color(0x7b4aa0), root: null, built: false, mons: [], pumps: [], skulls: [], bats: [], t: 0, chk: 0 };
const HWM = {
  orange: new T.MeshLambertMaterial({ color: 0xf28a1c }), stem: new T.MeshLambertMaterial({ color: 0x4f7a2a }),
  glow: new T.MeshBasicMaterial({ color: 0xffd23a, side: T.DoubleSide }), dark: new T.MeshBasicMaterial({ color: 0x1e1630, side: T.DoubleSide }),
  bone: new T.MeshLambertMaterial({ color: 0xf4efe2 }), pink: new T.MeshBasicMaterial({ color: 0xff9db8 }), white: new T.MeshLambertMaterial({ color: 0xffffff }),
  bat: new T.MeshLambertMaterial({ color: 0x3a2a55, side: T.DoubleSide }), eye: new T.MeshBasicMaterial({ color: 0xffe27a })
};
function hwMerge(parts) {                                   // [[geometry, matrix]] → 單一幾何體（減少繪製次數）
  const P = [], N = [];
  parts.forEach(([g, m]) => { const q = g.clone().applyMatrix4(m); const n = q.index ? q.toNonIndexed() : q; P.push(...n.attributes.position.array); if (n.attributes.normal) N.push(...n.attributes.normal.array); else for (let i = 0; i < n.attributes.position.count; i++) N.push(0, 0, 1); });
  const o = new T.BufferGeometry(); o.setAttribute('position', new T.Float32BufferAttribute(P, 3)); o.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); return o;
}
const hwM4 = (x, y, z, sx, sy, sz, ry, rx, rz) => { const m = new T.Matrix4().compose(new T.Vector3(x, y, z), new T.Quaternion().setFromEuler(new T.Euler(rx || 0, ry || 0, rz || 0)), new T.Vector3(sx === undefined ? 1 : sx, sy === undefined ? sx === undefined ? 1 : sx : sy, sz === undefined ? (sx === undefined ? 1 : sx) : sz)); return m; };
const hwMesh = (g, m, parent) => { const o = new T.Mesh(g, m); o.castShadow = false; parent.add(o); return o; };

// ---- 南瓜（肋條用頂點位移做在同一顆球上，只需 3 個網格）----
const HWG = {};
function hwGeos() {
  if (HWG.pump) return;
  const sp = new T.SphereGeometry(0.5, 20, 14), p = sp.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + 0.09 * Math.cos(a * 8); p.setX(i, x * k); p.setZ(i, z * k); p.setY(i, p.getY(i) * 0.78); }
  sp.computeVertexNormals(); HWG.pump = sp;
  HWG.stem = hwMerge([[new T.CylinderGeometry(0.05, 0.08, 0.2, 6), hwM4(0, 0.42, 0, 1)], [new T.CylinderGeometry(0.04, 0.05, 0.12, 6), hwM4(0.07, 0.54, 0, 1, 1, 1, 0, 0, -0.5)]]);
  const tri = (cx, cy, s, up) => { const sh = new T.Shape(); if (up) { sh.moveTo(cx - s, cy - s); sh.lineTo(cx + s, cy - s); sh.lineTo(cx, cy + s); } else { sh.moveTo(cx - s, cy + s); sh.lineTo(cx + s, cy + s); sh.lineTo(cx, cy - s); } return new T.ShapeGeometry(sh); };
  const mouth = new T.Shape(); mouth.moveTo(-0.2, -0.05); mouth.lineTo(-0.12, -0.14); mouth.lineTo(-0.06, -0.06); mouth.lineTo(0, -0.14); mouth.lineTo(0.06, -0.06); mouth.lineTo(0.12, -0.14); mouth.lineTo(0.2, -0.05); mouth.lineTo(0.14, -0.2); mouth.lineTo(-0.14, -0.2);
  const zf = 0.455, T3 = (g) => [g, hwM4(0, 0, zf, 1)];
  HWG.face = hwMerge([T3(tri(-0.17, 0.1, 0.08, true)), T3(tri(0.17, 0.1, 0.08, true)), T3(new T.ShapeGeometry(mouth))].map(([g, m]) => [g, m]));
  // 可愛骷髏頭
  HWG.skBone = hwMerge([[new T.SphereGeometry(0.42, 18, 12), hwM4(0, 0.5, 0, 1, 0.92, 0.96)], [new T.BoxGeometry(0.46, 0.2, 0.34), hwM4(0, 0.14, 0.02, 1)], [new T.BoxGeometry(0.05, 0.12, 0.34), hwM4(-0.12, 0.05, 0.02, 1)], [new T.BoxGeometry(0.05, 0.12, 0.34), hwM4(0.12, 0.05, 0.02, 1)]]);
  HWG.skDark = hwMerge([[new T.SphereGeometry(0.13, 12, 8), hwM4(-0.16, 0.52, 0.33, 1, 1.15, 0.5)], [new T.SphereGeometry(0.13, 12, 8), hwM4(0.16, 0.52, 0.33, 1, 1.15, 0.5)], [new T.ConeGeometry(0.04, 0.08, 3), hwM4(0, 0.36, 0.4, 1, 1, 1, 0, 0, Math.PI)], [new T.TorusGeometry(0.1, 0.017, 6, 12, Math.PI), hwM4(0, 0.26, 0.37, 1, 1, 1, 0, 0, Math.PI)]]);
  HWG.skAcc = hwMerge([[new T.CircleGeometry(0.05, 10), hwM4(-0.27, 0.36, 0.34, 1, 1, 1, -0.6)], [new T.CircleGeometry(0.05, 10), hwM4(0.27, 0.36, 0.34, 1, 1, 1, 0.6)], [new T.ConeGeometry(0.1, 0.16, 8), hwM4(-0.11, 0.93, 0.02, 1, 1, 1, 0, 0, 1.57)], [new T.ConeGeometry(0.1, 0.16, 8), hwM4(0.11, 0.93, 0.02, 1, 1, 1, 0, 0, -1.57)], [new T.SphereGeometry(0.05, 8, 6), hwM4(0, 0.93, 0.02, 1)]]);
  // 小蝙蝠
  const w = new T.Shape(); w.moveTo(0, 0.05); w.lineTo(0.35, 0.3); w.lineTo(0.7, 0.12); w.lineTo(0.62, -0.02); w.lineTo(0.5, 0.06); w.lineTo(0.4, -0.12); w.lineTo(0.26, -0.02); w.lineTo(0.12, -0.16); w.lineTo(0, -0.08);
  HWG.wing = new T.ShapeGeometry(w); const wl = new T.Matrix4().makeScale(-1, 1, 1);
  HWG.wingL = HWG.wing.clone().applyMatrix4(wl); HWG.wingL.index && HWG.wingL.index.array.reverse();
  HWG.batBody = hwMerge([[new T.SphereGeometry(0.13, 10, 8), hwM4(0, 0, 0, 1, 0.95, 1.25)], [new T.ConeGeometry(0.04, 0.1, 4), hwM4(-0.07, 0.15, 0.06, 1)], [new T.ConeGeometry(0.04, 0.1, 4), hwM4(0.07, 0.15, 0.06, 1)]]);
  HWG.batEye = hwMerge([[new T.SphereGeometry(0.025, 6, 4), hwM4(-0.045, 0.03, 0.15, 1)], [new T.SphereGeometry(0.025, 6, 4), hwM4(0.045, 0.03, 0.15, 1)]]);
}
function hwPumpkin() { const g = new T.Group(); hwMesh(HWG.pump, HWM.orange, g); hwMesh(HWG.stem, HWM.stem, g); hwMesh(HWG.face, HWM.glow, g); return g; }
function hwSkull() { const g = new T.Group(); hwMesh(HWG.skBone, HWM.bone, g); hwMesh(HWG.skDark, HWM.dark, g); hwMesh(HWG.skAcc, HWM.pink, g); g.children[2].material = HWM.pink; return g; }
function hwBat() {
  const g = new T.Group(), b = new T.Group(); g.add(b); hwMesh(HWG.batBody, HWM.bat, b); hwMesh(HWG.batEye, HWM.eye, b);
  const l = new T.Group(), r = new T.Group(); l.position.x = -0.1; r.position.x = 0.1; hwMesh(HWG.wingL, HWM.bat, l); hwMesh(HWG.wing, HWM.bat, r); b.add(l, r); g.userData.l = l; g.userData.r = r; return g;
}
// ---- 妖怪 ----
function hwSprite(text, col) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 80; const x = c.getContext('2d'); x.font = '700 38px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = 'rgba(40,20,70,.85)'; const w = Math.min(310, x.measureText(text).width + 36); x.beginPath(); x.roundRect ? x.roundRect(160 - w / 2, 10, w, 60, 22) : x.rect(160 - w / 2, 10, w, 60); x.fill();
  x.lineWidth = 3; x.strokeStyle = col; x.stroke(); x.fillStyle = '#fff'; x.fillText(text, 160, 42);
  const t = new T.CanvasTexture(c), s = new T.Sprite(new T.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.scale.set(1.9, 0.48, 1); s.renderOrder = 20; return s;
}
function hwMonsterModel(kind) {
  const g = new T.Group(), body = new T.Group(); g.add(body);
  const col = { nag: 0x8a5cd6, tap: 0x3fa0e0, exam: 0x57b86a }[kind], bm = new T.MeshLambertMaterial({ color: col });
  const bb = new T.SphereGeometry(0.62, 20, 14); hwMesh(bb, bm, body).scale.set(1, 1.1, 1); body.children[0].position.y = 0.7;
  hwMesh(hwMerge([[new T.SphereGeometry(0.17, 12, 10), hwM4(-0.24, 1.0, 0.5, 1, 1.15, 0.7)], [new T.SphereGeometry(0.17, 12, 10), hwM4(0.24, 1.0, 0.5, 1, 1.15, 0.7)]]), HWM.white, body);
  hwMesh(hwMerge([[new T.SphereGeometry(0.075, 8, 6), hwM4(-0.22, 0.98, 0.62, 1)], [new T.SphereGeometry(0.075, 8, 6), hwM4(0.22, 0.98, 0.62, 1)]]), HWM.dark, body);
  hwMesh(hwMerge([[new T.SphereGeometry(0.1, 12, 8), hwM4(-0.16, 0.0, 0, 1)], [new T.SphereGeometry(0.1, 12, 8), hwM4(0.16, 0.0, 0, 1)]]), bm, g).position.set(0, 0.06, 0.15);  // 小腳
  const fx = new T.Group(); body.add(fx); g.userData.fx = fx;
  if (kind === 'nag') {                                                                    // 大嘴巴 + 碎碎念小點點 + 小角
    const mo = hwMesh(new T.SphereGeometry(0.2, 12, 8), HWM.dark, body); mo.scale.set(1.3, 0.8, 0.5); mo.position.set(0, 0.62, 0.55);
    hwMesh(hwMerge([[new T.ConeGeometry(0.09, 0.28, 6), hwM4(-0.3, 1.5, 0, 1, 1, 1, 0, 0, 0.35)], [new T.ConeGeometry(0.09, 0.28, 6), hwM4(0.3, 1.5, 0, 1, 1, 1, 0, 0, -0.35)]]), HWM.orange, body);
    const dg = new T.SphereGeometry(0.06, 6, 4); g.userData.dots = [0, 1, 2].map(i => { const d = hwMesh(dg, HWM.white, fx); d.position.set(0.55 + i * 0.18, 1.2 + i * 0.1, 0.3); return d; });
  } else if (kind === 'tap') {                                                              // 頭上長出水龍頭 + 一滴水
    const sil = new T.MeshLambertMaterial({ color: 0xc9d3dc });
    hwMesh(hwMerge([[new T.CylinderGeometry(0.08, 0.08, 0.4, 8), hwM4(0, 1.62, 0, 1)], [new T.CylinderGeometry(0.07, 0.07, 0.4, 8), hwM4(0.16, 1.84, 0, 1, 1, 1, 0, 0, Math.PI / 2)], [new T.BoxGeometry(0.2, 0.06, 0.06), hwM4(0, 1.88, 0, 1)]]), sil, body);
    const dp = hwMesh(new T.SphereGeometry(0.07, 8, 6), new T.MeshBasicMaterial({ color: 0x6fd0ff }), fx); dp.scale.set(0.8, 1.2, 0.8); g.userData.drop = dp;
  } else {                                                                                   // 戴眼鏡、頭上頂著考卷
    hwMesh(hwMerge([[new T.TorusGeometry(0.2, 0.025, 6, 16), hwM4(-0.24, 1.0, 0.58, 1)], [new T.TorusGeometry(0.2, 0.025, 6, 16), hwM4(0.24, 1.0, 0.58, 1)]]), HWM.dark, body);
    const c = document.createElement('canvas'); c.width = 128; c.height = 160; const x = c.getContext('2d'); x.fillStyle = '#fffdf2'; x.fillRect(0, 0, 128, 160); x.strokeStyle = '#9aa'; x.lineWidth = 3; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(14, 70 + i * 18); x.lineTo(114, 70 + i * 18); x.stroke(); }
    x.fillStyle = '#d83a3a'; x.font = '700 46px sans-serif'; x.textAlign = 'center'; x.fillText('59', 64, 56);
    const pp = hwMesh(new T.PlaneGeometry(0.62, 0.78), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), side: T.DoubleSide }), body); pp.position.set(0, 1.82, 0.05); pp.rotation.z = 0.2;
  }
  return g;
}
const HWMON = [
  { id: 'nag', name: '碎碎念妖怪', room: '1忠', col: '#b48cff', kind: 'nag',
    intro: '（這是老師變身成的碎碎念妖怪，只要好好回應，老師就會變回來。）\n\n「東西帶了沒？水壺呢？作業呢？外套呢？我再說一次喔，我再說一次喔……」',
    steps: [{ t: '「上課前再確認一次，你東西都帶齊了嗎？」你要怎麼回答？', ok: '「老師，我檢查過了，課本、水壺、鉛筆盒都帶了！」', bad: ['假裝沒聽到，轉頭就跑', '大喊「好煩喔！」'], no: '妖怪的嘴巴越張越大，念得更快了！「我再說一次喔——」' },
      { t: '「那聯絡簿呢？家長簽名了沒？」', ok: '「在這裡，爸媽已經簽好名字了。」', bad: ['「放在家裡忘記帶。」', '「簽名？那是什麼？」'], no: '妖怪的頭頂冒出一串「……」，念得更久了。' }],
    win: '碎碎念妖怪安靜下來，「……其實老師只是怕你忘記而已啦。」身上的紫色慢慢退去。', again: '碎碎念妖怪變回溫和的樣子：「今天有帶齊東西嗎？……好，那就不念了。」' },
  { id: 'tap', name: '水龍頭妖怪', room: '廚房', col: '#6fd0ff', kind: 'tap',
    intro: '（水龍頭妖怪頭上的水龍頭一直滴滴答答。）\n\n「滴答、滴答……沒有人理我，我就一直流、一直流……」',
    steps: [{ t: '水龍頭妖怪一直流水，你要怎麼辦？', ok: '把水龍頭關緊，並告訴它水很珍貴，要節約用水', bad: ['再轉開一點，讓它玩水', '不關它，反正水很多'], no: '妖怪嘩啦啦地流得更大聲，地板都濕了。' },
      { t: '「那洗手要怎麼洗才對？」', ok: '開水沖濕、關水、用肥皂搓二十秒，再沖乾淨', bad: ['沖一下水就好，很快', '用衣服擦一擦就算洗過'], no: '妖怪搖搖頭：「這樣細菌還在喔！」滴答、滴答。' }],
    win: '水龍頭妖怪終於把自己關緊了，「謝謝你，我想起來了，珍惜水，我就是你們的好老師。」', again: '水龍頭妖怪現在很乖，一滴水也不亂流。' },
  { id: 'exam', name: '愛考試妖怪', room: '2忠', col: '#7fe08a', kind: 'exam',
    intro: '（愛考試妖怪頭上頂著一張 59 分的考卷。）\n\n「來來來，隨堂小考！答對了才能過關喔！」',
    steps: [{ t: '第一題：3 × 4 + 5 = ？', ok: '17', bad: ['19', '12'], no: '「答錯了！先乘後加，再算一次！」' },
      { t: '第二題：同樂國小位在宜蘭縣的哪一個鄉鎮？', ok: '員山鄉', bad: ['冬山鄉', '三星鄉'], no: '「這題送分都會錯？再想想看！」' }],
    win: '愛考試妖怪看著你的滿分，開心地說：「你答得真棒！那張 59 分的考卷，我自己回去訂正。」', again: '愛考試妖怪笑嘻嘻：「下次我出更難的題目喔！」' }
];
const hwGround = (x, z) => { const g = groundAt(x, 2.2, z); return isFinite(g) ? g : 0; };
function hwFindOpen(x, z) {                                    // 找附近可站、沒被擋住的位置
  for (let r = 0; r < 6; r += 1.2) for (let a = 0; a < 6.3; a += 1.05) { const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r, g = hwGround(px, pz); if (!(typeof blocked === 'function' && blocked(px, pz, g + 0.4))) return [px, pz, g]; }
  return [x, z, hwGround(x, z)];
}
function hwBuild() {
  if (HW.built) return; HW.built = true; hwGeos(); const root = HW.root = new T.Group(); scene.add(root);
  const pl = n => NPLACES.find(p => p.name === n && !p.room), rm = n => NPLACES.find(p => p.name === n && p.room);
  // 小南瓜 14 顆
  [['校門', -4, -3], ['校門', 4, -2], ['接送區', 4, 0], ['梅花廣場', -5, 3], ['梅花廣場', 6, -2], ['集合場', 0, 0], ['集合場', 7, 4], ['停車場', 3, 2], ['涼亭・遊戲區', 3, 2], ['涼亭・遊戲區', -5, -3], ['穿堂樓層區', 3, 0], ['風雨球場', -9, 6], ['後門', -3, 3], ['操場', -6, 12]].forEach((s, i) => {
    const p = pl(s[0]); if (!p) return; const q = hwFindOpen(p.x + s[1], p.z + s[2]), g = hwPumpkin(), sc = 0.8 + rr() * 0.35; g.userData.sc = sc; g.position.set(q[0], q[2] + 0.35 * sc, q[1]); g.rotation.y = rr() * 6.28; root.add(g); dynAdd(g);
    HW.pumps.push({ id: i, x: q[0], z: q[1], g, on: true, kind: 'pumpkin' });
  });
  // 可愛骷髏頭 6 個
  [['梅花廣場', 8, 2], ['集合場', -6, 3], ['涼亭・遊戲區', 0, -4], ['後門', 3, 0], ['停車場', -4, -3], ['接送區', -4, 1]].forEach((s, i) => {
    const p = pl(s[0]); if (!p) return; const q = hwFindOpen(p.x + s[1], p.z + s[2]), g = hwSkull(), sc = 0.9; g.userData.sc = sc; g.position.set(q[0], q[2], q[1]); g.rotation.y = rr() * 6.28; root.add(g); dynAdd(g);
    HW.skulls.push({ id: i, x: q[0], z: q[1], g, on: true, kind: 'skull' });
  });
  // 三隻妖怪
  HWMON.forEach(m => {
    const p = rm(m.room); if (!p) return; const q = hwFindOpen(p.x, p.z), g = hwMonsterModel(m.kind); g.position.set(q[0], q[2], q[1]); root.add(g); dynAdd(g);
    const lab = hwSprite(m.name, m.col); lab.position.set(0, 2.4, 0); g.add(lab); m.g = g; m.lab = lab; m.x = q[0]; m.z = q[1]; m.y = q[2]; m.place = p; m.ph = rr() * 6; HW.mons.push(m);
  });
  // 小蝙蝠 10 隻
  for (let i = 0; i < 10; i++) { const g = hwBat(); root.add(g); dynAdd(g); HW.bats.push({ g, a: rr() * 6.28, w: (0.35 + rr() * 0.35) * (i % 2 ? 1 : -1), r: 7 + rr() * 16, h: 3.2 + rr() * 2.8, ph: rr() * 6, fl: 10 + rr() * 5 }); }
  if (window.STY && STY.on && typeof styScan === 'function') styScan();
}
const hwDone = () => HWMON.filter(m => G.hw && G.hw.done[m.id]).length;
function hwApply(ed, quiet) {
  G.edition = ed; const on = ed === 'halloween'; HW.on = on; if (on) hwBuild();
  if (HW.root) HW.root.visible = on; $('bEd').textContent = '版本：' + ({ halloween: '萬聖節', christmas: '聖誕節', lunar: '農曆年' }[ed] || '一般'); $('bEd').classList.toggle('on', ed !== 'normal'); $('bHw').hidden = !on; hwBtn();
  if (typeof xmApply === 'function') xmApply(ed, quiet);
  if (typeof lnApply === 'function') lnApply(ed, quiet);
  if (!quiet) { if (on) toast('萬聖節限定版開啟！去找三隻校園妖怪，順便撿南瓜和骷髏糖', 3600); else if (ed === 'normal') toast('已切換回一般版', 3600); saveGame(); }
  if (!on) HW.k = Math.min(HW.k, 1);
}
function hwBtn() { $('bHw').textContent = '妖怪地圖 ' + hwDone() + '/3'; }
function hwTick(dt) {
  if (typeof cloudTick === 'function') cloudTick(dt);
  if (typeof pxTick === 'function') pxTick(dt);
  if (typeof stfTick === 'function') stfTick(dt);
  if (typeof seaTick === 'function') seaTick(dt);
  if (typeof xmTick === 'function') xmTick(dt);
  if (typeof lnTick === 'function') lnTick(dt);
  HW.k += ((HW.on ? 1 : 0) - HW.k) * Math.min(1, dt * 1.6); if (!HW.on && HW.k < 0.01) HW.k = 0;
  if (!HW.on || !HW.built) return;
  HW.t += dt; const t = HW.t, cs = charScale(), pk = 1 + (cs - 1) * 0.6;
  HW.mons.forEach(m => {
    const done = G.hw.done[m.id], s = (done ? 0.82 : 1) * cs * 0.95, d = Math.hypot(m.x - PL.x, m.z - PL.z);
    m.g.scale.setScalar(s); m.g.position.y = m.y + Math.abs(Math.sin(t * 2.2 + m.ph)) * 0.18 * s;
    if (d < 14) m.g.rotation.y += (Math.atan2(PL.x - m.x, PL.z - m.z) - m.g.rotation.y) * Math.min(1, dt * 3);
    m.lab.visible = d > 3.5 && d < 30 && cs < 4; const u = m.g.userData;
    if (u.dots) u.dots.forEach((q, i) => { q.visible = !done; q.position.y = 1.2 + i * 0.1 + Math.sin(t * 5 + i) * 0.06; });
    if (u.drop) { u.drop.visible = !done; const f = (t * 1.1 + m.ph) % 1; u.drop.position.set(0.34, 1.78 - f * 1.5, 0); u.drop.scale.setScalar(0.8 * (1 - f * 0.3)); }
  });
  [...HW.pumps, ...HW.skulls].forEach(o => { if (o.on) o.g.scale.setScalar(o.g.userData.sc * pk); });
  HW.bats.forEach((b, i) => {
    b.a += b.w * dt; const cx = PL.x + Math.sin(t * 0.07 + i) * 4, cz = PL.z + Math.cos(t * 0.05 + i * 2) * 4, x = cx + Math.cos(b.a) * b.r * Math.min(cs, 2.5), z = cz + Math.sin(b.a) * b.r * Math.min(cs, 2.5);
    b.g.position.set(x, PL.y + (b.h + Math.sin(t * 1.3 + b.ph) * 1.1) * Math.min(cs, 2.5), z);
    const sg = b.w > 0 ? 1 : -1; b.g.rotation.y = Math.atan2(-Math.sin(b.a) * sg, Math.cos(b.a) * sg); b.g.rotation.z = Math.sin(t * 1.3 + b.ph) * 0.12;
    const f = Math.sin(t * b.fl + b.ph) * 0.75; b.g.userData.l.rotation.z = f; b.g.userData.r.rotation.z = -f; b.g.scale.setScalar(1.5 * cs);
  });
  HW.chk -= dt; if (HW.chk <= 0) { HW.chk = 0.5; const now = nowMs(); [...HW.pumps, ...HW.skulls].forEach(o => { const key = 'h' + o.kind[0] + o.id; if (!o.on && !(G.resp[key] > now)) { o.on = true; o.g.visible = true; } }); }
}
function hwInteract(cand, ds) {
  if (typeof pxInteract === 'function') pxInteract(cand, ds);
  if (typeof stfInteract === 'function') stfInteract(cand, ds);
  if (typeof seaInteract === 'function') seaInteract(cand, ds);
  if (typeof xmInteract === 'function') xmInteract(cand, ds);
  if (typeof lnInteract === 'function') lnInteract(cand, ds);
  if (!HW.on || !HW.built) return;
  HW.mons.forEach(m => { const d = ds(m.x, m.z, m.y); if (d < 3.4) cand(d, G.hw.done[m.id] ? '和 ' + m.name + ' 聊聊' : '挑戰 ' + m.name + '（老師變成的妖怪）', () => hwTalk(m)); });
  [...HW.pumps, ...HW.skulls].forEach(o => { if (!o.on) return; const d = ds(o.x, o.z, 0); if (d < 2.2) cand(d, o.kind === 'pumpkin' ? '撿起小南瓜' : '撿起可愛骷髏糖', () => { addItem(o.kind); toast('撿到 ' + ITEMS[o.kind].n + '！'); o.on = false; o.g.visible = false; G.resp['h' + o.kind[0] + o.id] = nowMs() + (o.kind === 'pumpkin' ? 4 : 7) * 60000; saveGame(); }); });
}
function hwMini(g, mp) {
  if (typeof pxMini === 'function') pxMini(g, mp);
  if (typeof stfMini === 'function') stfMini(g, mp);
  if (typeof xmMini === 'function') xmMini(g, mp);
  if (typeof lnMini === 'function') lnMini(g, mp);
  if (!HW.on) return;
  HW.mons.forEach(m => { const p = mp(m.x, m.z); g.fillStyle = G.hw.done[m.id] ? '#46b86a' : '#a05cff'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(p[0], p[1], 5, 0, 7); g.fill(); g.stroke(); });
  g.fillStyle = '#f28a1c'; HW.pumps.forEach(o => { if (!o.on) return; const p = mp(o.x, o.z); g.beginPath(); g.arc(p[0], p[1], 2.4, 0, 7); g.fill(); });
}
// ---- 妖怪挑戰對話 ----
function hwTalk(m) {
  if (G.hw.done[m.id]) { openDlg(m.name, m.again, [{ t: '再見', fn: closePanels }]); return; }
  openDlg(m.name, m.intro, [{ t: '接受挑戰', go: true, fn: () => hwAsk(m, 0) }, { t: '下次再來', fn: closePanels }]);
}
function hwAsk(m, i) {
  const st = m.steps[i], opts = [[st.ok, true], [st.bad[0], false], [st.bad[1], false]].sort(() => Math.random() - 0.5);
  openDlg(m.name, st.t, opts.map(o => ({ t: o[0], fn: () => o[1] ? (i + 1 < m.steps.length ? hwOk(m, i) : hwWin(m)) : hwNo(m, i) })).concat([{ t: '先離開', fn: closePanels }]));
}
function hwOk(m, i) { openDlg(m.name, '答對了！妖怪身上的顏色變淡了一點。', [{ t: '下一題', go: true, fn: () => hwAsk(m, i + 1) }]); }
function hwNo(m, i) { openDlg(m.name, m.steps[i].no, [{ t: '再試一次', go: true, fn: () => hwAsk(m, i) }, { t: '先離開', fn: closePanels }]); }
function hwWin(m) {
  G.hw.done[m.id] = 1; addItem('candy', 5); addCoins(80); hwBtn(); const all = hwDone() === 3; let txt = m.win + '\n\n獲得：萬聖節糖果 ×5、同樂幣 80';
  if (all) { addItem('skull', 1); addItem('pumpkin', 3); addCoins(200); txt += '\n\n三隻妖怪都變回老師了！額外獲得「校園驅妖小隊」獎勵：可愛骷髏糖 ×1、小南瓜 ×3、同樂幣 200'; }
  saveGame(); openDlg(m.name, txt, [{ t: '太好了！', go: true, fn: closePanels }]);
}
// ---- 妖怪地圖面板、版本選單 ----
function hwPanel() {
  openPanel('hwp'); const L = $('hwpList'); L.innerHTML = '';
  const s = document.createElement('p'); s.className = 'sm'; s.textContent = '老師變成了校園妖怪！到各班教室找到他們，答對問題就能把老師變回來。　糖果 ×' + have('candy') + '　小南瓜 ×' + have('pumpkin') + '　骷髏糖 ×' + have('skull') + '　（天上有 10 隻小蝙蝠在巡邏）'; L.appendChild(s);
  const gr = document.createElement('div'); gr.className = 'grid'; L.appendChild(gr);
  HWMON.forEach(m => {
    const c = document.createElement('div'); c.className = 'it'; const d = G.hw.done[m.id];
    c.innerHTML = '<div class="sw" style="background:' + m.col + '"></div><div class="nm">' + m.name + (d ? '　✔ 已變回老師' : '') + '</div><div class="ds">' + (m.place ? (m.place.sub.indexOf(m.place.name) === 0 ? m.place.sub : m.place.name + '（' + m.place.sub + '）') : m.room) + '</div>';
    if (m.place) c.appendChild(mkBtn('前往', () => { closePanels(); navStart(m.place); }, true)); gr.appendChild(c);
  });
}
function edPanel() {
  openPanel('edp'); const L = $('edpList'); L.innerHTML = '';
  [['normal', '一般版', '平常的同樂小行星：採集、釣魚、擺設、居民委託。'], ['halloween', '萬聖節限定版', '紫色夜空、南瓜、可愛骷髏頭、小蝙蝠，還有三隻老師變成的校園妖怪。'], ['christmas', '聖誕節限定版', '飄雪的藍色夜空、聖誕樹與彩燈、禮物和薑餅人，還有雪人、聖誕老公公、小麋鹿三關問答，以及「接禮物」小遊戲。'], ['lunar', '農曆年限定版', '紅燈籠與春聯、煙火、紅包與年糕收集，還有年獸、財神爺、小福娃三關問答，以及「搶紅包」小遊戲。'], ['teacher', '教師節限定版', '破關解密，認識老師有多熟悉（規劃中，敬請期待）。']].forEach(([id, n, d]) => {
    const c = document.createElement('div'); c.className = 'it'; c.innerHTML = '<div class="nm">' + n + (G.edition === id ? '　（目前）' : '') + '</div><div class="ds">' + d + '</div>';
    c.appendChild(mkBtn(id === 'teacher' ? '規劃中' : '切換', () => { closePanels(); hwApply(id); }, true, id === 'teacher' || G.edition === id)); L.appendChild(c);
  });
  if (typeof mpNickRow === 'function') mpNickRow(L);
}
$('bEd').onclick = () => { if (STARTED) { if (!$('edp').hidden) closePanels(); else edPanel(); } };
$('bHw').onclick = () => { if (STARTED) { if (!$('hwp').hidden) closePanels(); else hwPanel(); } };
$('hwpX').onclick = closePanels; $('edpX').onclick = closePanels;
window.__hw = { HW, hwApply, hwBuild, HWMON };
