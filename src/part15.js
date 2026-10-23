/* ===== 農曆年限定版：燈籠、春聯、紅包與年糕、年獸／財神爺／小福娃三關問答、搶紅包小遊戲、煙火 ===== */
window.LN = { on: false, k: 0, tint: new T.Color(0xc4604a), root: null, built: false, mons: [], reds: [], cakes: [], lants: [], coups: [], fw: null, t: 0, chk: 0 };
const LNM = {
  red: new T.MeshLambertMaterial({ color: 0xd8222c }), lant: new T.MeshBasicMaterial({ color: 0xf0343a }), gold: new T.MeshLambertMaterial({ color: 0xf2c230 }), goldB: new T.MeshBasicMaterial({ color: 0xffd45a }),
  pole: new T.MeshLambertMaterial({ color: 0x6a3a22 }), dark: new T.MeshBasicMaterial({ color: 0x20180f }), white: new T.MeshBasicMaterial({ color: 0xffffff }), skin: new T.MeshLambertMaterial({ color: 0xf6d2b0 }),
  black: new T.MeshLambertMaterial({ color: 0x1c1c24 }), cake: new T.MeshLambertMaterial({ color: 0xb8742e }), cakeTop: new T.MeshLambertMaterial({ color: 0xffe8b8 }), cheek: new T.MeshBasicMaterial({ color: 0xff8a8a }),
  mane: new T.MeshLambertMaterial({ color: 0xf0b020 }), teeth: new T.MeshBasicMaterial({ color: 0xfffff0 })
};
const LG = {};
function lnGeos() {
  if (LG.lant) return; hwGeos();
  LG.lant = hwMerge([[new T.SphereGeometry(0.36, 14, 10), hwM4(0, 0, 0, 1, 0.88, 1)]]);
  LG.lantGold = hwMerge([[new T.CylinderGeometry(0.2, 0.2, 0.07, 10), hwM4(0, 0.33, 0, 1)], [new T.CylinderGeometry(0.2, 0.2, 0.07, 10), hwM4(0, -0.33, 0, 1)], [new T.CylinderGeometry(0.012, 0.012, 0.5, 4), hwM4(0, -0.6, 0, 1)], [new T.SphereGeometry(0.06, 6, 4), hwM4(0, -0.85, 0, 1, 1.2, 1.6, 1)], [new T.TorusGeometry(0.3, 0.02, 4, 14), hwM4(0, 0, 0, 1, 1, 1, Math.PI / 2)]]);
  LG.pole = hwMerge([[new T.CylinderGeometry(0.07, 0.1, 3.0, 6), hwM4(0, 1.5, 0, 1)], [new T.CylinderGeometry(0.04, 0.04, 0.9, 5), hwM4(0.45, 2.95, 0, 1, 1, 1, 0, 0, Math.PI / 2)]]);
  LG.hb = hwMerge([[new T.BoxGeometry(0.34, 0.5, 0.05), hwM4(0, 0.4, 0, 1)]]);
  LG.hbGold = hwMerge([[new T.CylinderGeometry(0.09, 0.09, 0.06, 10), hwM4(0, 0.46, 0, 1, 1, 1, Math.PI / 2)], [new T.BoxGeometry(0.34, 0.03, 0.06), hwM4(0, 0.6, 0, 1)]]);
  LG.cake = hwMerge([[new T.CylinderGeometry(0.3, 0.3, 0.16, 14), hwM4(0, 0.1, 0, 1)], [new T.CylinderGeometry(0.26, 0.26, 0.14, 14), hwM4(0, 0.25, 0, 1)]]);
  LG.cakeTop = hwMerge([[new T.CylinderGeometry(0.24, 0.24, 0.03, 14), hwM4(0, 0.335, 0, 1)]]);
  LG.cakeRed = hwMerge([[new T.BoxGeometry(0.2, 0.01, 0.2), hwM4(0, 0.355, 0, 1, 1, 1, 0, 0.78)]]);
}
function lnTex(chars, vertical, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = '#c8161e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f2c230'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#ffd45a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (vertical) { const n = chars.length, step = (h - 24) / n; g.font = '700 ' + Math.min(w * 0.7, step * 0.8) + 'px "Noto Sans TC","Microsoft JhengHei",sans-serif'; for (let i = 0; i < n; i++) g.fillText(chars[i], w / 2, 12 + step * (i + 0.5)); }
  else { const n = chars.length, step = (w - 24) / n; g.font = '700 ' + Math.min(h * 0.72, step * 0.85) + 'px "Noto Sans TC","Microsoft JhengHei",sans-serif'; for (let i = 0; i < n; i++) g.fillText(chars[i], 12 + step * (i + 0.5), h / 2 + 2); }
  const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
}
function lnCouplet(up, down, top) {
  const g = new T.Group(), mk = (w, h, tex, x, y) => { const m = new T.Mesh(new T.BoxGeometry(w, h, 0.05), new T.MeshBasicMaterial({ map: tex })); m.position.set(x, y, 0); g.add(m); };
  mk(0.62, 2.3, lnTex(up, true, 96, 360), -0.95, 1.55); mk(0.62, 2.3, lnTex(down, true, 96, 360), 0.95, 1.55); mk(2.5, 0.55, lnTex(top, false, 400, 84), 0, 2.95);
  hwMesh(hwMerge([[new T.CylinderGeometry(0.06, 0.06, 2.5, 6), hwM4(-1.5, 1.25, 0, 1)], [new T.CylinderGeometry(0.06, 0.06, 2.5, 6), hwM4(1.5, 1.25, 0, 1)]]), LNM.pole, g); return g;
}
function lnLantern(sc) { const g = new T.Group(), p = new T.Group(); hwMesh(LG.pole, LNM.pole, g); p.position.set(0.9, 2.9, 0); hwMesh(LG.lant, LNM.lant, p); hwMesh(LG.lantGold, LNM.gold, p); p.position.y = 2.55; g.add(p); g.userData.sw = p; g.userData.sc = sc; g.scale.setScalar(sc); return g; }
function lnRed() { const g = new T.Group(); hwMesh(LG.hb, LNM.red, g); hwMesh(LG.hbGold, LNM.goldB, g); return g; }
function lnCake() { const g = new T.Group(); hwMesh(LG.cake, LNM.cake, g); hwMesh(LG.cakeTop, LNM.cakeTop, g); hwMesh(LG.cakeRed, LNM.red, g); return g; }
function lnChar(kind) {
  const g = new T.Group(), b = new T.Group(); g.add(b); g.userData.body = b; const M = (parts, m) => hwMesh(hwMerge(parts), m, b), S = (r, x, y, z, a, c, d) => [new T.SphereGeometry(r, 12, 9), hwM4(x, y, z, a || 1, c || 1, d || 1)];
  if (kind === 'nian') {
    M([S(0.62, 0, 0.7, 0, 1.15, 0.9, 1.25), S(0.12, -0.3, 0.1, 0.3, 1, 0.8, 1.3), S(0.12, 0.3, 0.1, 0.3, 1, 0.8, 1.3), S(0.12, -0.28, 0.1, -0.35, 1, 0.8, 1.3), S(0.12, 0.28, 0.1, -0.35, 1, 0.8, 1.3), S(0.5, 0, 1.5, 0.45, 1.1, 1, 1)], LNM.red);
    const mane = []; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; mane.push([new T.ConeGeometry(0.12, 0.5, 5), hwM4(Math.cos(a) * 0.62, 1.5 + Math.sin(a) * 0.62, 0.15, 1, 1, 1, 0, 0, a - Math.PI / 2)]); } M(mane, LNM.mane);
    M([[new T.ConeGeometry(0.07, 0.34, 5), hwM4(-0.22, 2.08, 0.5, 1, 1, 1, 0, 0, 0.35)], [new T.ConeGeometry(0.07, 0.34, 5), hwM4(0.22, 2.08, 0.5, 1, 1, 1, 0, 0, -0.35)]], LNM.goldB);
    M([S(0.13, -0.2, 1.62, 0.88), S(0.13, 0.2, 1.62, 0.88), S(0.07, 0, 1.32, 0.98, 1.7, 0.5, 0.5)], LNM.white);
    M([S(0.06, -0.2, 1.62, 0.99), S(0.06, 0.2, 1.62, 0.99), S(0.17, 0, 1.28, 0.9, 1.4, 0.5, 0.6)], LNM.dark);
    M([S(0.03, -0.1, 1.31, 1.05), S(0.03, 0.1, 1.31, 1.05)], LNM.teeth);
  } else if (kind === 'god') {
    M([S(0.58, 0, 0.62, 0, 1, 1.15, 1), S(0.1, -0.2, 0.06, 0.1, 1, 0.8, 1.3), S(0.1, 0.2, 0.06, 0.1, 1, 0.8, 1.3)], LNM.red);
    M([[new T.TorusGeometry(0.5, 0.06, 6, 18), hwM4(0, 0.55, 0, 1, 1, 1, Math.PI / 2)], [new T.BoxGeometry(0.16, 0.5, 0.05), hwM4(0, 0.6, 0.57, 1)]], LNM.gold);
    M([S(0.28, 0, 1.42, 0)], LNM.skin);
    M([[new T.CylinderGeometry(0.22, 0.26, 0.34, 10), hwM4(0, 1.82, 0, 1)], [new T.BoxGeometry(0.5, 0.06, 0.1), hwM4(-0.4, 1.9, 0, 1, 1, 1, 0, 0, 0.1)], [new T.BoxGeometry(0.5, 0.06, 0.1), hwM4(0.4, 1.9, 0, 1, 1, 1, 0, 0, -0.1)]], LNM.black);
    M([S(0.24, 0, 1.2, 0.13, 0.9, 0.9, 0.55)], LNM.black); M([S(0.035, -0.1, 1.46, 0.25), S(0.035, 0.1, 1.46, 0.25)], LNM.dark); M([S(0.06, -0.15, 1.38, 0.24, 1, 0.7, 0.5), S(0.06, 0.15, 1.38, 0.24, 1, 0.7, 0.5)], LNM.cheek);
    M([[new T.CylinderGeometry(0.12, 0.2, 0.14, 8), hwM4(0, 0.95, 0.5, 1)]], LNM.goldB);
  } else {
    M([S(0.46, 0, 0.5, 0, 1, 1.1, 1), S(0.09, -0.16, 0.05, 0.1, 1, 0.8, 1.3), S(0.09, 0.16, 0.05, 0.1, 1, 0.8, 1.3)], LNM.red);
    M([S(0.3, 0, 1.22, 0)], LNM.skin); M([S(0.2, -0.26, 1.5, 0), S(0.2, 0.26, 1.5, 0), S(0.29, 0, 1.28, -0.04, 1, 0.9, 0.95)], LNM.black);
    M([S(0.035, -0.1, 1.25, 0.27), S(0.035, 0.1, 1.25, 0.27)], LNM.dark); M([S(0.06, -0.17, 1.15, 0.25, 1, 0.7, 0.5), S(0.06, 0.17, 1.15, 0.25, 1, 0.7, 0.5)], LNM.cheek);
    M([[new T.TorusGeometry(0.22, 0.04, 5, 12), hwM4(0, 0.78, 0.4, 1)]], LNM.gold);
    const l = new T.Group(); hwMesh(LG.lant, LNM.lant, l); hwMesh(LG.lantGold, LNM.gold, l); l.scale.setScalar(0.5); l.position.set(0.6, 0.9, 0.2); b.add(l);
  }
  return g;
}
const LNCH = [
  { id: 'nian', name: '年獸小年', at: ['集合場', -5, 4], col: '#ff8f8f', kind: 'nian',
    intro: '（年獸小年探出頭來，其實有點害羞：）\n\n「傳說我每年除夕都會出來嚇人……可是我也想交朋友啦！回答兩個問題，我就不再嚇你。」',
    steps: [{ t: '傳說中年獸最怕什麼？', ok: '紅色、鞭炮聲和火光', bad: ['軟綿綿的棉花糖', '安安靜靜的睡覺聲'], no: '年獸抖了抖鬃毛：「才不是呢！再想一想。」' },
      { t: '除夕夜全家人坐在一起吃的飯叫什麼？', ok: '年夜飯（團圓飯）', bad: ['營養早餐', '下午茶點心'], no: '年獸歪著頭：「那天吃的是更豐盛的一餐喔。」' }],
    win: '年獸小年開心地甩甩鬃毛：「你好厲害！以後我不嚇人了，只負責陪大家過年！」', again: '年獸小年：「新年快樂！我現在是看家的好獸喔。」' },
  { id: 'god', name: '財神爺', at: ['梅花廣場', 6, 4], col: '#ffd45a', kind: 'god',
    intro: '（財神爺笑呵呵地摸著鬍子：）\n\n「新年到，恭喜發財！不過我最看重的是品德。答對兩題，福氣就分你一份。」',
    steps: [{ t: '長輩給晚輩的紅包，代表什麼意思？', ok: '祝福，希望新的一年平安健康', bad: ['一定要馬上全部花光', '比誰收到的紅包比較厚'], no: '財神爺搖搖頭：「紅包的心意不是這樣喔。」' },
      { t: '春聯通常是什麼時候貼上的？', ok: '過年前（約除夕前後）', bad: ['端午節的時候', '放暑假的時候'], no: '財神爺笑著說：「想想看，是迎接新年的時候喔。」' }],
    win: '財神爺哈哈大笑：「懂得感恩分享，福氣才會長長久久！」', again: '財神爺：「恭喜發財，平安快樂！」' },
  { id: 'kid', name: '小福娃', at: ['涼亭・遊戲區', 2, 3], col: '#ffb3c9', kind: 'kid',
    intro: '（小福娃提著紅燈籠跑過來：）\n\n「過年好！我有兩個問題要考你，答對我就請你吃年糕！」',
    steps: [{ t: '農曆新年是農曆的哪一天？', ok: '正月初一', bad: ['五月初五', '八月十五'], no: '小福娃拍拍手：「那是別的節日啦，再猜一次！」' },
      { t: '元宵節（正月十五）大家習慣吃什麼？', ok: '湯圓', bad: ['粽子', '月餅'], no: '小福娃笑：「圓圓的、甜甜的，團圓的象徵喔。」' }],
    win: '小福娃開心地轉圈：「答對啦！恭喜發財，紅包拿來～」', again: '小福娃：「新年快樂！我的紅燈籠亮不亮？」' }
];
const lnDone = () => LNCH.filter(m => G.ln && G.ln.done[m.id]).length;
function lnBuild() {
  if (LN.built) return; LN.built = true; lnGeos(); const root = LN.root = new T.Group(); scene.add(root);
  const pl = n => NPLACES.find(p => p.name === n && !p.room), put = (g, s, hy) => { const p = pl(s[0]); if (!p) return null; const q = hwFindOpen(p.x + s[1], p.z + s[2]); g.position.set(q[0], q[2] + (hy || 0), q[1]); root.add(g); dynAdd(g); return q; };
  // 燈籠杆 12 支（梅花廣場的 2 支較大；第一支可玩小遊戲）
  [['梅花廣場', 0, -2, 1.5], ['校門', -6, -3, 1.2], ['校門', 6, -3, 1.2], ['風雨球場', 0, 9, 1.1], ['集合場', 8, 0, 1], ['集合場', -8, 0, 1], ['接送區', 6, -1, 1], ['後門', -4, 2, 1], ['停車場', -6, 2, 1], ['操場', 4, 10, 1], ['涼亭・遊戲區', -5, -3, 1], ['梅花廣場', -8, 5, 1]].forEach((s, i) => {
    const g = lnLantern(s[3]); g.rotation.y = rr() * 6.28; const q = put(g, s); if (q) LN.lants.push({ id: i, x: q[0], z: q[1], y: q[2], g, big: i === 0, ph: rr() * 6 });
  });
  // 春聯 3 組
  [['校門', 0, 3, '新春納福迎吉祥', '平安喜樂過好年', '同樂迎春'], ['集合場', 0, -6, '書香滿園春意濃', '笑語盈門福氣來', '萬象更新'], ['梅花廣場', -3, 7, '龍馬精神添喜氣', '花團錦簇慶團圓', '福滿同樂']].forEach(s => { const g = lnCouplet(s[3], s[4], s[5]); g.rotation.y = Math.PI * rr(); const q = put(g, s); if (q) LN.coups.push({ g }); });
  // 紅包 14、年糕 6
  [['校門', -3, -2], ['校門', 3, 1], ['接送區', 3, 1], ['梅花廣場', -5, 1], ['梅花廣場', 7, -1], ['集合場', 2, 1], ['集合場', 8, 3], ['停車場', 2, 3], ['涼亭・遊戲區', 4, 3], ['涼亭・遊戲區', -4, -2], ['穿堂樓層區', 2, 1], ['風雨球場', -8, 5], ['後門', -2, 2], ['操場', -5, 11]].forEach((s, i) => {
    const g = lnRed(), q = put(g, s); if (q) { g.rotation.y = rr() * 6.28; g.userData.sc = 0.9 + rr() * 0.3; LN.reds.push({ id: i, x: q[0], z: q[1], g, on: true, kind: 'hongbao' }); }
  });
  [['梅花廣場', 8, 3], ['集合場', -6, 2], ['涼亭・遊戲區', 1, -4], ['後門', 3, 1], ['停車場', -4, -2], ['接送區', -4, 2]].forEach((s, i) => {
    const g = lnCake(), q = put(g, s); if (q) { g.rotation.y = rr() * 6.28; g.userData.sc = 1; LN.cakes.push({ id: i, x: q[0], z: q[1], g, on: true, kind: 'nian' }); }
  });
  // 三位角色
  LNCH.forEach(m => {
    const g = lnChar(m.kind), p = pl(m.at[0]); if (!p) return; const q = hwFindOpen(p.x + m.at[1], p.z + m.at[2]); g.position.set(q[0], q[2], q[1]); root.add(g); dynAdd(g);
    const lab = hwSprite(m.name, m.col); lab.position.set(0, 2.5, 0); g.add(lab); m.g = g; m.lab = lab; m.x = q[0]; m.z = q[1]; m.y = q[2]; m.place = p; m.ph = rr() * 6; LN.mons.push(m);
  });
  // 煙火：6 組、每組 44 點，以玩家為中心（加亮混合，顏色漸暗＝淡出）
  const NB = 6, NP = 44, N = NB * NP, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3));
  const pts = new T.Points(geo, new T.PointsMaterial({ size: 0.55, vertexColors: true, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); pts.frustumCulled = false;
  const fg = new T.Group(); fg.add(pts); scene.add(fg); dynAdd(fg); LN.fw = { g: fg, pts, pos, col, NB, NP, b: [], nx: 0.5 };
  for (let i = 0; i < NB; i++) LN.fw.b.push({ life: -1, dir: new Float32Array(NP * 3), c: [1, 1, 1], x: 0, y: 0, z: 0 });
  if (window.STY && STY.on && typeof styScan === 'function') styScan();
}
const LNC = [[1, 0.25, 0.25], [1, 0.85, 0.25], [0.4, 0.85, 1], [0.6, 1, 0.5], [1, 0.5, 0.9]];
function lnBurst(F, b) {
  const a = rr() * 6.283, r = 9 + rr() * 11; b.x = Math.cos(a) * r; b.z = Math.sin(a) * r; b.y = 11 + rr() * 8; b.life = 2.2; b.c = LNC[(rr() * LNC.length) | 0];
  for (let i = 0; i < F.NP; i++) { const u = rr() * 2 - 1, th = rr() * 6.283, s = Math.sqrt(1 - u * u), v = 3 + rr() * 3; b.dir[i * 3] = s * Math.cos(th) * v; b.dir[i * 3 + 1] = u * v; b.dir[i * 3 + 2] = s * Math.sin(th) * v; }
}
function lnApply(ed, quiet) {
  const on = ed === 'lunar'; LN.on = on; if (on) lnBuild(); if (LN.root) LN.root.visible = on; if (LN.fw) LN.fw.g.visible = on;
  const b = $('bLn'); if (b) { b.hidden = !on; lnBtn(); }
  if (on && !quiet) { toast('農曆年限定版開啟！去找年獸、財神爺和小福娃，順便撿紅包和年糕', 4200); saveGame(); }
  if (!on) LN.k = Math.min(LN.k, 1);
}
function lnBtn() { const b = $('bLn'); if (b) b.textContent = '新春任務 ' + lnDone() + '/3'; }
function lnTick(dt) {
  LN.k += ((LN.on ? 1 : 0) - LN.k) * Math.min(1, dt * 1.6); if (!LN.on && LN.k < 0.01) LN.k = 0;
  if (!LN.on || !LN.built) return;
  LN.t += dt; const t = LN.t, cs = charScale(), pk = 1 + (cs - 1) * 0.6;
  LN.lants.forEach(o => { o.g.scale.setScalar(o.g.userData.sc * pk); o.g.userData.sw.rotation.z = Math.sin(t * 1.3 + o.ph) * 0.09; });
  LN.coups.forEach(o => { o.g.scale.setScalar(pk); const dx = PL.x - o.g.position.x, dz = PL.z - o.g.position.z; if (dx * dx + dz * dz < 900) o.g.rotation.y += angd(Math.atan2(dx, dz), o.g.rotation.y) * Math.min(1, dt * 2); });
  LN.mons.forEach(m => {
    const done = G.ln.done[m.id], s = (done ? 0.9 : 1) * cs * 0.95, d = Math.hypot(m.x - PL.x, m.z - PL.z), bd = m.g.userData.body;
    m.g.scale.setScalar(s); bd.position.y = Math.abs(Math.sin(t * 2 + m.ph)) * 0.1; bd.rotation.z = Math.sin(t * 1.5 + m.ph) * 0.05;
    if (d < 14) m.g.rotation.y += angd(Math.atan2(PL.x - m.x, PL.z - m.z), m.g.rotation.y) * Math.min(1, dt * 3);
    m.lab.visible = d > 3.5 && d < 30 && cs < 4;
  });
  [...LN.reds, ...LN.cakes].forEach(o => { if (o.on) { o.g.scale.setScalar(o.g.userData.sc * pk); o.g.rotation.y += dt * 0.6; } });
  const F = LN.fw; if (F) {
    F.nx -= dt; if (F.nx <= 0) { F.nx = 0.8 + rr() * 1.4; const b = F.b.find(x => x.life <= 0); if (b) lnBurst(F, b); }
    F.b.forEach((b, bi) => { if (b.life > 0) b.life -= dt; for (let i = 0; i < F.NP; i++) { const k = (bi * F.NP + i) * 3, age = 2.2 - b.life, f = b.life > 0 ? Math.max(0, b.life / 2.2) : 0; F.pos[k] = b.x + b.dir[i * 3] * age * 0.8; F.pos[k + 1] = b.y + b.dir[i * 3 + 1] * age * 0.8 - 2.2 * age * age; F.pos[k + 2] = b.z + b.dir[i * 3 + 2] * age * 0.8; const q = f * f; F.col[k] = b.c[0] * q; F.col[k + 1] = b.c[1] * q; F.col[k + 2] = b.c[2] * q; } });
    F.pts.geometry.attributes.position.needsUpdate = true; F.pts.geometry.attributes.color.needsUpdate = true; F.g.position.set(PL.x, PL.y, PL.z); F.g.scale.setScalar(Math.min(cs, 3)); F.pts.material.size = 0.55 * Math.min(cs, 3);
  }
  LN.chk -= dt; if (LN.chk <= 0) { LN.chk = 0.5; const now = nowMs(); [...LN.reds, ...LN.cakes].forEach(o => { const key = 'l' + o.kind[0] + o.id; if (!o.on && !(G.resp[key] > now)) { o.on = true; o.g.visible = true; } }); }
}
function lnInteract(cand, ds) {
  if (!LN.on || !LN.built) return;
  LN.mons.forEach(m => { const d = ds(m.x, m.z, m.y); if (d < 3.4) cand(d, G.ln.done[m.id] ? '和 ' + m.name + ' 聊聊' : '和 ' + m.name + ' 說話（新春挑戰）', () => lnTalk(m)); });
  LN.lants.forEach(o => { if (!o.big) return; const d = ds(o.x, o.z, o.y); if (d < 4.2) cand(d, '玩「搶紅包」小遊戲', lnGameOpen); });
  [...LN.reds, ...LN.cakes].forEach(o => { if (!o.on) return; const d = ds(o.x, o.z, 0); if (d < 2.2) cand(d, o.kind === 'hongbao' ? '撿起紅包' : '撿起年糕', () => { addItem(o.kind); toast('撿到 ' + ITEMS[o.kind].n + '！'); o.on = false; o.g.visible = false; G.resp['l' + o.kind[0] + o.id] = nowMs() + (o.kind === 'hongbao' ? 4 : 7) * 60000; saveGame(); }); });
}
function lnMini(g, mp) {
  if (!LN.on) return;
  LN.mons.forEach(m => { const p = mp(m.x, m.z); g.fillStyle = G.ln.done[m.id] ? '#46b86a' : '#e0405a'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(p[0], p[1], 5, 0, 7); g.fill(); g.stroke(); });
  g.fillStyle = '#e8283a'; LN.reds.forEach(o => { if (!o.on) return; const p = mp(o.x, o.z); g.beginPath(); g.arc(p[0], p[1], 2.4, 0, 7); g.fill(); });
  const b = LN.lants[0]; if (b) { const p = mp(b.x, b.z); g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(p[0], p[1], 3.2, 0, 7); g.fill(); }
}
// ---- 問答 ----
function lnTalk(m) {
  if (G.ln.done[m.id]) { openDlg(m.name, m.again, [{ t: '再見', fn: closePanels }]); return; }
  openDlg(m.name, m.intro, [{ t: '接受挑戰', go: true, fn: () => lnAsk(m, 0) }, { t: '下次再來', fn: closePanels }]);
}
function lnAsk(m, i) {
  const st = m.steps[i], opts = [[st.ok, true], [st.bad[0], false], [st.bad[1], false]].sort(() => Math.random() - 0.5);
  openDlg(m.name, st.t, opts.map(o => ({ t: o[0], fn: () => o[1] ? (i + 1 < m.steps.length ? lnOk(m, i) : lnWin(m)) : lnNo(m, i) })).concat([{ t: '先離開', fn: closePanels }]));
}
function lnOk(m, i) { openDlg(m.name, '答對了！', [{ t: '下一題', go: true, fn: () => lnAsk(m, i + 1) }]); }
function lnNo(m, i) { openDlg(m.name, m.steps[i].no, [{ t: '再試一次', go: true, fn: () => lnAsk(m, i) }, { t: '先離開', fn: closePanels }]); }
function lnWin(m) {
  G.ln.done[m.id] = 1; addItem('ingot', 2); addCoins(80); lnBtn(); const all = lnDone() === 3; let txt = m.win + '\n\n獲得：金元寶 ×2、同樂幣 80';
  if (all) { addItem('nian', 1); addItem('hongbao', 3); addCoins(200); txt += '\n\n三位新春朋友都開心了！額外獲得「新春福氣」獎勵：年糕 ×1、紅包 ×3、同樂幣 200'; }
  saveGame(); openDlg(m.name, txt, [{ t: '太好了！', go: true, fn: closePanels }]);
}
function lnPanel() {
  openPanel('lnp'); const L = $('lnpList'); L.innerHTML = '';
  const s = document.createElement('p'); s.className = 'sm'; s.textContent = '新年到了！找到三位新春朋友，答對問題就能拿到福氣。　紅包 ×' + have('hongbao') + '　年糕 ×' + have('nian') + '　金元寶 ×' + have('ingot') + '　（梅花廣場的大燈籠可以玩「搶紅包」，最高 ' + (G.ln.best | 0) + ' 分）'; L.appendChild(s);
  const gr = document.createElement('div'); gr.className = 'grid'; L.appendChild(gr);
  LNCH.forEach(m => {
    const c = document.createElement('div'); c.className = 'it'; const d = G.ln.done[m.id];
    c.innerHTML = '<div class="sw" style="background:' + m.col + '"></div><div class="nm">' + m.name + (d ? '　✔ 已完成' : '') + '</div><div class="ds">' + (m.place ? (m.place.sub.indexOf(m.place.name) === 0 ? m.place.sub : m.place.name + '（' + m.place.sub + '）') : m.at[0]) + '</div>';
    if (m.place) c.appendChild(mkBtn('前往', () => { closePanels(); navStart(m.place); }, true)); gr.appendChild(c);
  });
}
// ---- 搶紅包小遊戲：20 秒，左右移動福袋接紅包（+1）、金元寶（+3），閃避鞭炮（−2）----
const LNG = { run: false, t: 0, score: 0, bx: 160, items: [], sp: 0, raf: 0, last: 0, keys: {} };
function lnGameOpen() { openPanel('lng'); lnGameReset(); }
function lnGameReset() { LNG.run = false; LNG.score = 0; LNG.items = []; LNG.t = 20; $('lngS').textContent = '左右移動（滑鼠、手指拖曳，或 ← →／A D）福袋，接住紅包！紅包 +1、金元寶 +3、鞭炮 −2。'; $('lngGo').textContent = '開始（20 秒）'; $('lngGo').hidden = false; lnGameDraw(); }
function lnGameDraw() {
  const c = $('lngC'), g = c.getContext('2d'), W = c.width, H = c.height; const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#5a0f1c'); bg.addColorStop(1, '#a8302c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = '#ffd45a'; for (let i = 0; i < 26; i++) g.fillRect((i * 97 + LNG.t * 14) % W, (i * 53 + LNG.t * 30) % H, 2, 2);
  g.fillStyle = '#7a1a20'; g.fillRect(0, H - 22, W, 22);
  LNG.items.forEach(o => { if (o.k === 'hb') { g.fillStyle = '#e8283a'; g.fillRect(o.x - 11, o.y - 16, 22, 32); g.fillStyle = '#ffd45a'; g.beginPath(); g.arc(o.x, o.y, 6, 0, 7); g.fill(); g.fillRect(o.x - 11, o.y - 16, 22, 4); } else if (o.k === 'gold') { g.fillStyle = '#ffd45a'; g.beginPath(); g.ellipse(o.x, o.y + 3, 16, 9, 0, 0, 7); g.fill(); g.fillStyle = '#f0a81c'; g.beginPath(); g.ellipse(o.x, o.y - 3, 10, 8, 0, Math.PI, 0); g.fill(); } else { g.fillStyle = '#c4161e'; g.fillRect(o.x - 6, o.y - 14, 12, 28); g.fillStyle = '#ffd45a'; g.fillRect(o.x - 6, o.y - 4, 12, 4); g.strokeStyle = '#ffd45a'; g.lineWidth = 2; g.beginPath(); g.moveTo(o.x, o.y - 14); g.lineTo(o.x + 4, o.y - 20); g.stroke(); } });
  g.fillStyle = '#f2c230'; g.beginPath(); g.moveTo(LNG.bx - 34, H - 54); g.lineTo(LNG.bx + 34, H - 54); g.lineTo(LNG.bx + 26, H - 22); g.lineTo(LNG.bx - 26, H - 22); g.closePath(); g.fill(); g.fillStyle = '#c4161e'; g.font = '700 18px sans-serif'; g.textAlign = 'center'; g.fillText('福', LNG.bx, H - 30);
  g.fillStyle = '#fff'; g.font = '700 20px sans-serif'; g.textAlign = 'left'; g.fillText('分數 ' + LNG.score, 10, 26); g.textAlign = 'right'; g.fillText(Math.max(0, Math.ceil(LNG.t)) + ' 秒', W - 10, 26);
}
function lnGameStep(now) {
  if (!LNG.run) return; if ($('lng').hidden) { LNG.run = false; return; }
  const dt = Math.min(0.05, (now - LNG.last) / 1000); LNG.last = now; LNG.t -= dt; const W = 320, H = 400;
  const dir = (LNG.keys.ArrowRight || LNG.keys.KeyD ? 1 : 0) - (LNG.keys.ArrowLeft || LNG.keys.KeyA ? 1 : 0); LNG.bx = Math.max(34, Math.min(W - 34, LNG.bx + dir * 260 * dt));
  LNG.sp -= dt; if (LNG.sp <= 0) { LNG.sp = 0.36 + Math.random() * 0.25; const r = Math.random(); LNG.items.push({ x: 20 + Math.random() * (W - 40), y: -16, v: 120 + Math.random() * 80 + (20 - LNG.t) * 4, k: r < 0.12 ? 'gold' : r < 0.32 ? 'fc' : 'hb' }); }
  LNG.items.forEach(o => { o.y += o.v * dt; if (o.y > H - 60 && o.y < H - 20 && Math.abs(o.x - LNG.bx) < 38 && !o.hit) { o.hit = 1; LNG.score = Math.max(0, LNG.score + (o.k === 'hb' ? 1 : o.k === 'gold' ? 3 : -2)); } });
  LNG.items = LNG.items.filter(o => !o.hit && o.y < H + 20); lnGameDraw();
  if (LNG.t <= 0) { LNG.run = false; lnGameEnd(); return; } LNG.raf = requestAnimationFrame(lnGameStep);
}
function lnGameEnd() {
  const sc = LNG.score, now = nowMs(); G.ln.best = Math.max(G.ln.best | 0, sc); let msg = '時間到！你搶到 ' + sc + ' 分。';
  if (sc >= 5) { if (!(G.resp.lng > now)) { const c = Math.min(120, sc * 6); addCoins(c); G.resp.lng = now + 3 * 60000; msg += ' 獲得同樂幣 ' + c + '！'; if (sc >= 18) { addItem('ingot', 1); msg += '（高分獎勵：金元寶 ×1）'; } } else msg += '（同樂幣每 3 分鐘可以領一次，這次先練習。）'; } else msg += ' 再試一次吧！';
  $('lngS').textContent = msg + '　最高 ' + G.ln.best + ' 分'; $('lngGo').textContent = '再玩一次'; $('lngGo').hidden = false; saveGame(); lnGameDraw();
}
function lnGameStart() { LNG.run = true; LNG.t = 20; LNG.score = 0; LNG.items = []; LNG.sp = 0.3; LNG.bx = 160; $('lngGo').hidden = true; $('lngS').textContent = '搶紅包！'; LNG.last = performance.now(); cancelAnimationFrame(LNG.raf); LNG.raf = requestAnimationFrame(lnGameStep); }
$('lngGo').onclick = lnGameStart; $('lngX').onclick = () => { LNG.run = false; closePanels(); };
{ const c = $('lngC'), mv = e => { const r = c.getBoundingClientRect(); LNG.bx = Math.max(34, Math.min(320 - 34, (e.clientX - r.left) / r.width * 320)); }; c.addEventListener('pointermove', mv); c.addEventListener('pointerdown', e => { mv(e); try { c.setPointerCapture(e.pointerId); } catch (x) { } }); }
addEventListener('keydown', e => { if (!$('lng').hidden) { LNG.keys[e.code] = true; if (e.code.startsWith('Arrow')) e.preventDefault(); } }); addEventListener('keyup', e => { LNG.keys[e.code] = false; });
$('bLn').onclick = () => { if (STARTED) { if (!$('lnp').hidden) closePanels(); else lnPanel(); } };
$('lnpX').onclick = closePanels;
// ---- 農曆日期：臘月初一到正月十五之間建議切換（用瀏覽器內建農曆；不支援時改用 1/15–2/28）----
function lnSeason() {
  const d = window.__edDate ? new Date(window.__edDate) : new Date();
  try { const p = new Intl.DateTimeFormat('zh-TW-u-ca-chinese', { month: 'numeric', day: 'numeric', timeZone: 'Asia/Taipei' }).formatToParts(d), m = parseInt(p.find(x => x.type === 'month').value, 10), dd = parseInt(p.find(x => x.type === 'day').value, 10); if (m && dd) return m === 12 || (m === 1 && dd <= 15); } catch (e) { }
  const m = d.getMonth() + 1, day = d.getDate(); return (m === 1 && day >= 15) || m === 2;
}
window.__ln = { LN, lnApply, lnBuild, LNCH, LNG, lnSeason, lnGameEnd };
