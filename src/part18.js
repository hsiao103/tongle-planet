/* ===== 海上龜山島（烏龜造型）、校園港與龜山島港、渡船（自動航行／直接傳送）、海鷗 =====
   座標：以「海上座標」(u, v, y) 蓋在球面上：u＝由校園往外（徑向）的公尺數，v＝沿海岸（切向）的公尺數，皆為球面上的真實公尺；
   由 seaFlat() 轉回遊戲用的平面座標（走路、碰撞、導覽仍是平面座標），畫面上的島與碼頭則直接用球面座標建模。 */
const SEA = { TH0: 2.8, PHI0: 0, R: 13, built: false, t: 0, ride: null, gulls: [], root: null, slot: { A: [-38, 0], B: [-24.2, 0] }, pierA: [-50, -40], pierB: [-22, -12], hw: 1.6 };
const seaFlat = (u, v) => { const th = SEA.TH0 + u / PR, phi = SEA.PHI0 + v / (PR * Math.sin(th)), r = th * PR; return [PC.x + r * Math.cos(phi), PC.z + r * Math.sin(phi)]; };
const seaUV = (x, z) => { const dx = x - PC.x, dz = z - PC.z, th = Math.hypot(dx, dz) / PR; let dp = Math.atan2(dz, dx) - SEA.PHI0; dp = Math.atan2(Math.sin(dp), Math.cos(dp)); return [(th - SEA.TH0) * PR, dp * PR * Math.sin(th)]; };
const seaPhi = (x, z) => Math.atan2(z - PC.z, x - PC.x);
// ---- 碰撞與位置判斷（供 part4 的 blocked／moveStep／whereText 使用）----
function seaPier(u, v, w) { return (u > SEA.pierA[0] - 0.5 && u < SEA.pierA[1] + 0.4 && Math.abs(v) < (w || SEA.hw) - 0.05) ? 'A' : (u > SEA.pierB[0] - 0.4 && u < SEA.pierB[1] + 0.5 && Math.abs(v) < (w || SEA.hw) - 0.05) ? 'B' : null; }
function xtraWalk(x, z) { const [u, v] = seaUV(x, z); return u * u + v * v < (SEA.R - 0.3) * (SEA.R - 0.3) || !!seaPier(u, v); }
function xtraNear(x, z) { const [u, v] = seaUV(x, z); return (u > -55 && u < -35 && Math.abs(v) < 8) || u * u + v * v < (SEA.R + 6) * (SEA.R + 6) || (u > -27 && u < -10 && Math.abs(v) < 8); }
function xtraBlock(x, z, y) {
  if (y > 8) return false; const [u, v] = seaUV(x, z); if (u * u + v * v > 20 * 20) return false;
  if ((u / 6.9) ** 2 + (v / 5.5) ** 2 < 1) return true;                         // 龜殼
  if (Math.hypot(u + 9.4, v) < 2.3 || Math.hypot(u + 6.9, v) < 1.5) return true;  // 龜頭、脖子
  if (Math.hypot(u - 8.3, v) < 1.4) return true;                                 // 尾巴
  for (const a of [-4.8, 4.8]) for (const b of [-6.1, 6.1]) if (Math.hypot(u - a, v - b) < 2.3) return true;   // 四隻腳
  return false;
}
function xtraWhere(x, z) { const [u, v] = seaUV(x, z); const p = seaPier(u, v, 3); if (p === 'A') return '校園港'; if (p === 'B') return '龜山島港'; if (u * u + v * v < (SEA.R + 0.5) ** 2) return '龜山島'; return null; }
// ---- 建模工具：參數曲面（海上座標 → 球面）----
const _seaV = new T.Vector3();
function seaSurf(nA, nB, fn, color, opts) {
  opts = opts || {}; const pos = [], col = [], idx = [], c = new T.Color();
  for (let i = 0; i <= nA; i++) for (let j = 0; j <= nB; j++) { const p = fn(i / nA, j / nB), f = seaFlat(p[0], p[1]); sph(f[0], p[2], f[1], _seaV); pos.push(_seaV.x, _seaV.y, _seaV.z); c.set(typeof color === 'function' ? color(i / nA, j / nB) : color); col.push(c.r, c.g, c.b); }
  for (let i = 0; i < nA; i++) for (let j = 0; j < nB; j++) { const a = i * (nB + 1) + j, b = a + 1, d = a + nB + 1, e = d + 1; idx.push(a, d, b, b, d, e); }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new T.Mesh(g, opts.mat || new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide })); m.frustumCulled = false; m.userData.noOutline = !!opts.noOutline; return m;
}
const seaEll = (cu, cv, cy, ru, rv, ry, color) => seaSurf(12, 18, (a, b) => { const al = a * Math.PI, be = b * 2 * Math.PI; return [cu + ru * Math.sin(al) * Math.cos(be), cv + rv * Math.sin(al) * Math.sin(be), cy + ry * Math.cos(al)]; }, color);
function seaFlatGrid(nA, nB, fn) {                                  // 平面座標的走路面（不顯示，只供射線偵測地面）
  const pos = [], idx = []; for (let i = 0; i <= nA; i++) for (let j = 0; j <= nB; j++) { const p = fn(i / nA, j / nB), f = seaFlat(p[0], p[1]); pos.push(f[0], p[2], f[1]); }
  for (let i = 0; i < nA; i++) for (let j = 0; j < nB; j++) { const a = i * (nB + 1) + j, b = a + 1, d = a + nB + 1, e = d + 1; idx.push(a, d, b, b, d, e); }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new T.Mesh(g, new T.MeshBasicMaterial({ side: T.DoubleSide })); m.visible = false; m.matrixAutoUpdate = false; scene.add(m); m.updateMatrixWorld(true); walk.push(m); return m;
}
function seaPlace(o, u, v, y, hdg) { const f = seaFlat(u, v), phi = seaPhi(f[0], f[1]); placeOnPlanet(o, f[0], f[1], -phi - (hdg || 0), y || 0); }   // hdg：在海上座標裡的朝向（0＝朝外、向 u 增加）
// ---- 渡船、碼頭 ----
const SM = { wood: new T.MeshLambertMaterial({ color: 0xb48a56 }), dark: new T.MeshLambertMaterial({ color: 0x6a4a2c }), hull: new T.MeshLambertMaterial({ color: 0x2f6aa8 }), white: new T.MeshLambertMaterial({ color: 0xf6f4ee }), red: new T.MeshLambertMaterial({ color: 0xd8403a }), gold: new T.MeshLambertMaterial({ color: 0xf2c230 }) };
function seaBoat() {
  const g = new T.Group(), M = (parts, m) => hwMesh(hwMerge(parts), m, g);
  M([[new T.SphereGeometry(1, 16, 10), hwM4(0, 0.35, 0, 2.2, 0.62, 0.95)]], SM.hull);
  M([[new T.BoxGeometry(3.4, 0.06, 1.3), hwM4(0, 0.58, 0, 1)], [new T.BoxGeometry(0.9, 0.7, 0.9), hwM4(-0.7, 0.95, 0, 1)]], SM.white);
  M([[new T.BoxGeometry(1.1, 0.08, 1.1), hwM4(-0.7, 1.33, 0, 1)], [new T.BoxGeometry(0.05, 0.9, 0.05), hwM4(1.0, 1.0, 0, 1)], [new T.BoxGeometry(0.45, 0.28, 0.03), hwM4(1.22, 1.35, 0, 1)]], SM.red);
  M([[new T.BoxGeometry(3.6, 0.1, 0.06), hwM4(0, 0.62, 0.62, 1)], [new T.BoxGeometry(3.6, 0.1, 0.06), hwM4(0, 0.62, -0.62, 1)]], SM.gold);
  return g;
}
let SEG = null;
function seaPierMod() {
  if (SEG) return SEG; const P = [[new T.BoxGeometry(2, 0.12, 3.2), hwM4(0, 0.06, 0, 1)]], Q = [], R = [];
  [-1.4, 1.4].forEach(z => { [-0.9, 0.9].forEach(x => Q.push([new T.CylinderGeometry(0.09, 0.09, 2.6, 6), hwM4(x, -1.2, z, 1)])); R.push([new T.BoxGeometry(2, 0.06, 0.06), hwM4(0, 0.85, z, 1)], [new T.BoxGeometry(0.06, 0.8, 0.06), hwM4(0, 0.45, z, 1)]); });
  return SEG = { top: hwMerge(P), post: hwMerge(Q), rail: hwMerge(R) };
}
function seaSign(u, v, text, col) {
  const g = new T.Group(); hwMesh(hwMerge([[new T.CylinderGeometry(0.07, 0.07, 2.2, 6), hwM4(0, 1.1, 0, 1)], [new T.BoxGeometry(1.4, 0.5, 0.06), hwM4(0, 2.2, 0, 1)]]), SM.dark, g);
  const s = hwSprite(text, col); s.position.set(0, 2.9, 0); g.add(s); seaPlace(g, u, v, 0, 0); SEA.root.add(g);
}
function seaBuild() {
  if (SEA.built) return; SEA.built = true; hwGeos(); const root = SEA.root = new T.Group(); scene.add(root); const add = o => { root.add(o); return o; };
  // 龜山島：沙灘底座＋岩壁＋泡沫圈
  const sand = 0xe9d9a6, R = SEA.R;
  add(seaSurf(6, 40, (a, b) => { const r = a * R, t = b * 2 * Math.PI; return [r * Math.cos(t), r * Math.sin(t), 0.05]; }, sand));
  add(seaSurf(4, 40, (a, b) => { const t = b * 2 * Math.PI, r = R + a * 0.9; return [r * Math.cos(t), r * Math.sin(t), 0.05 - 3.4 * a]; }, a => (a < 0.2 ? 0xd8c690 : 0x8a826e)));
  add(seaSurf(3, 40, (a, b) => { const t = b * 2 * Math.PI, r = R + 0.9 + a * 2.6; return [r * Math.cos(t), r * Math.sin(t), -0.44]; }, 0xffffff, { mat: new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.4, depthWrite: false, side: T.DoubleSide }), noOutline: true }));
  // 烏龜：龜殼（六角龜甲花紋）、頭、脖子、四肢、尾巴；頭朝向校園（u 負向）
  add(seaSurf(10, 36, (a, b) => { const al = a * Math.PI / 2, be = b * 2 * Math.PI, k = Math.sin(al); return [6.9 * k * Math.cos(be), 5.5 * k * Math.sin(be), 0.05 + 5.6 * Math.pow(Math.cos(al), 0.8)]; }, (a, b) => a > 0.93 ? 0x5a4a2a : (((Math.floor(b * 9) + Math.floor(a * 4)) % 2) ? 0x4f8a3f : 0x3f6f34)));
  const skin = 0x9bbf6a; add(seaEll(-9.4, 0, 2.0, 2.4, 1.9, 1.8, skin)); add(seaEll(-6.9, 0, 1.3, 2.2, 1.7, 1.4, skin)); add(seaEll(8.3, 0, 0.7, 1.9, 0.7, 0.6, skin));
  [[-4.8, -6.1], [-4.8, 6.1], [4.8, -6.1], [4.8, 6.1]].forEach(p => add(seaEll(p[0], p[1], 1.1, 2.4, 2.0, 1.4, skin)));
  add(seaEll(-11.3, -1.0, 2.9, 0.38, 0.38, 0.38, 0x1c1c22)); add(seaEll(-11.3, 1.0, 2.9, 0.38, 0.38, 0.38, 0x1c1c22)); add(seaEll(-11.5, 0, 1.3, 0.4, 0.9, 0.18, 0xd86a5a));   // 眼睛、嘴
  // 碼頭：校園港（A）、龜山島港（B）
  const G = seaPierMod(), mod = (u0, u1) => { for (let u = u0 + 1; u < u1; u += 2) { const g = new T.Group(); hwMesh(G.top, SM.wood, g); hwMesh(G.post, SM.dark, g); hwMesh(G.rail, SM.dark, g); seaPlace(g, u, 0, 0, 0); root.add(g); } };
  mod(SEA.pierA[0], SEA.pierA[1]); mod(SEA.pierB[0], SEA.pierB[1]);
  seaFlatGrid(10, 2, (a, b) => [SEA.pierA[0] - 0.4 + a * (SEA.pierA[1] - SEA.pierA[0] + 0.4), (b - 0.5) * 2 * 1.6, 0.12]); seaFlatGrid(10, 2, (a, b) => [SEA.pierB[0] + a * (SEA.pierB[1] - SEA.pierB[0] + 0.5), (b - 0.5) * 2 * 1.6, 0.12]);
  seaFlatGrid(6, 40, (a, b) => { const r = a * (R - 0.3), t = b * 2 * Math.PI; return [r * Math.cos(t), r * Math.sin(t), 0.05]; });
  seaSign(SEA.pierA[0] + 2, 2.4, '校園港', '#9fe0ff'); seaSign(SEA.pierB[0] + 2, 2.4, '龜山島港', '#ffe08a');
  { const s = hwSprite('龜山島', '#ffe08a'); const f = new T.Group(); f.add(s); s.position.set(0, 9, 0); seaPlace(f, 0, 0, 0, 0); root.add(f); }
  // 船：兩岸各停一艘，出發時換成會航行的那艘
  SEA.bA = seaBoat(); SEA.bB = seaBoat(); SEA.bF = seaBoat(); [SEA.bA, SEA.bB, SEA.bF].forEach(b => root.add(b)); SEA.bF.visible = false;
  // 海鷗
  const mk = () => { const g = new T.Group(), b = new T.Group(); g.add(b); const W = new T.MeshLambertMaterial({ color: 0xffffff }), GY = new T.MeshLambertMaterial({ color: 0x9aa4ac }), OR = new T.MeshLambertMaterial({ color: 0xf0a020 });
    hwMesh(hwMerge([[new T.SphereGeometry(0.2, 8, 6), hwM4(0, 0, 0, 1.7, 0.8, 0.8)], [new T.SphereGeometry(0.1, 8, 6), hwM4(0.33, 0.07, 0, 1)], [new T.BoxGeometry(0.3, 0.03, 0.16), hwM4(-0.42, 0.02, 0, 1)]]), W, b);
    hwMesh(hwMerge([[new T.ConeGeometry(0.035, 0.16, 5), hwM4(0.5, 0.05, 0, 1, 1, 1, 0, 0, -Math.PI / 2)]]), OR, b);
    const wing = s => { const p = new T.Group(); p.position.set(0, 0.05, s * 0.1); hwMesh(hwMerge([[new T.BoxGeometry(0.32, 0.025, 0.55), hwM4(0, 0, s * 0.27, 1)]]), W, p); hwMesh(hwMerge([[new T.BoxGeometry(0.2, 0.026, 0.3), hwM4(-0.04, 0, s * 0.64, 1)]]), GY, p); b.add(p); return p; };
    g.userData.wl = wing(-1); g.userData.wr = wing(1); g.userData.b = b; return g; };
  for (let i = 0; i < 9; i++) { const g = mk(); root.add(g); dynAdd(g); const th = 2.18 + Math.random() * 0.55; SEA.gulls.push({ g, th, phi: Math.random() * 6.283, h: 5 + Math.random() * 7, hd: Math.random() * 6.28, tth: th, tphi: 0, th2: 0, sp: 4 + Math.random() * 2.5, ph: Math.random() * 6, bank: 0, new: 0 }); }
  if (window.STY && STY.on && typeof styScan === 'function') styScan();
  seaBoatsIdle();
}
function seaBoatsIdle() {
  if (!SEA.built) return; const t = SEA.t, bob = Math.sin(t * 1.6) * 0.05 - 0.25, ride = !!SEA.ride;
  if (!ride) { SEA.bA.visible = SEA.bB.visible = true; SEA.bF.visible = false; }
  if (!(ride && SEA.ride.from === 'A')) seaPlace(SEA.bA, SEA.slot.A[0], 0, bob, 0);
  if (!(ride && SEA.ride.from === 'B')) seaPlace(SEA.bB, SEA.slot.B[0], 0, bob + Math.sin(t * 1.3) * 0.02, Math.PI);
}
// ---- 航行 ----
function seaStand(p) { return p === 'A' ? [SEA.pierA[1] - 0.8, 0, -80] : [SEA.pierB[0] + 0.8, 0, 0]; }
function seaTp(to) {                                            // 直接傳送：站到對岸碼頭、面向陸地／島心
  closePanels(); const s = seaStand(to), f = seaFlat(s[0], s[1]), l = seaFlat(s[2], 0); teleport(f[0], 0.15, f[1], l[0], l[1]); toast(to === 'B' ? '抵達龜山島港' : '回到校園港', 2600);
}
function seaSail(to) {                                          // 自動航行：船載著主角從一座碼頭開到另一座
  closePanels(); const from = to === 'B' ? 'A' : 'B', a = SEA.slot[from], b = SEA.slot[to];
  SEA.ride = { t: 0, T: 11, from, to, a, b, sw: to === 'B' ? 7 : -7 }; GAME.block = true; (from === 'A' ? SEA.bA : SEA.bB).visible = false; SEA.bF.visible = true;
  const f = seaFlat(a[0], 0), l = seaFlat(b[0], 0); teleport(f[0], 0.2, f[1], l[0], l[1]); toast('出發囉！自動航行中…', 2400);
}
function seaTick(dt) {
  if (!SEA.built) { if (typeof STARTED !== 'undefined' && STARTED && PWG.children.length) try { seaBuild(); } catch (e) { SEA.built = true; console.error(e); } return; }
  SEA.t += dt; const t = SEA.t, cs = charScale(), pk = 1 + (cs - 1) * 0.6; seaBoatsIdle();
  const R = SEA.ride; if (R) {
    R.t += dt; const s = Math.min(1, R.t / R.T), e = s < 0.5 ? 2 * s * s : 1 - 2 * (1 - s) * (1 - s), uu = (a, b) => a + (b - a) * e, pos = k => { const ee = Math.min(1, Math.max(0, k)); return [R.a[0] + (R.b[0] - R.a[0]) * ee, R.sw * Math.sin(Math.PI * ee) * 1.0]; };
    const p0 = pos(e), p1 = pos(e + 0.02), hdg = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), by = -0.2 + Math.sin(t * 2.2) * 0.05;
    seaPlace(SEA.bF, p0[0], p0[1], by, hdg + Math.sin(t * 1.4) * 0.03); const f = seaFlat(p0[0], p0[1]); PL.x = f[0]; PL.z = f[1]; PL.y = by + 0.45; PL.vy = 0; fwTransport();
    if (s >= 1) { SEA.ride = null; GAME.block = false; const to = R.to; SEA.bF.visible = false; seaBoatsIdle(); const st = seaStand(to), ff = seaFlat(st[0], st[1]), ll = seaFlat(st[2], 0); teleport(ff[0], 0.15, ff[1], ll[0], ll[1]); toast(to === 'B' ? '抵達龜山島！' : '回到校園港', 2800); }
  }
  // 海鷗：在海岸帶隨機繞飛，翅膀拍動
  SEA.gulls.forEach(G => {
    G.new -= dt; if (G.new <= 0) { G.new = 4 + Math.random() * 6; G.tth = 2.12 + Math.random() * 0.66; G.tphi = G.phi + (Math.random() - 0.5) * 2.2; G.th2 = 5 + Math.random() * 8; }
    const du = (G.tth - G.th) * PR, dv = Math.atan2(Math.sin(G.tphi - G.phi), Math.cos(G.tphi - G.phi)) * PR * Math.sin(G.th), want = Math.atan2(dv, du);
    let dh = want - G.hd; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); const turn = Math.max(-1.3, Math.min(1.3, dh * 1.5)); G.hd += turn * dt; G.bank += (-turn * 0.5 - G.bank) * Math.min(1, dt * 3);
    G.th += Math.cos(G.hd) * G.sp * dt / PR; G.phi += Math.sin(G.hd) * G.sp * dt / (PR * Math.sin(G.th)); G.h += (G.th2 - G.h) * Math.min(1, dt * 0.5);
    const x = PC.x + G.th * PR * Math.cos(G.phi), z = PC.z + G.th * PR * Math.sin(G.phi), g = G.g; g.position.set(x, G.h + Math.sin(t * 0.9 + G.ph) * 0.6, z); g.rotation.set(G.bank, -(G.phi + G.hd), 0, 'YXZ'); g.scale.setScalar(1.2 * pk);
    const fl = Math.sin(t * (8 + G.sp) + G.ph) * 0.55; g.userData.wl.rotation.x = fl; g.userData.wr.rotation.x = -fl;
  });
}
function seaInteract(cand, ds) {
  if (!SEA.built || SEA.ride) return; const [u, v] = seaUV(PL.x, PL.z);
  const dA = Math.hypot(u - (SEA.pierA[1] - 0.8), v), dB = Math.hypot(u - (SEA.pierB[0] + 0.8), v);
  if (dA < 3.6) cand(dA, '搭船前往龜山島', () => openDlg('渡船', '（船靠在校園港的碼頭邊，隨著海浪輕輕搖晃。）\n\n想去海上的龜山島嗎？可以搭船慢慢欣賞海景，也可以直接傳送。', [{ t: '自動航行（約 11 秒）', go: true, fn: () => seaSail('B') }, { t: '直接傳送', fn: () => seaTp('B') }, { t: '先不要', fn: closePanels }]));
  if (dB < 3.6) cand(dB, '搭船回校園港', () => openDlg('渡船', '（龜山島的港口，遠遠可以看到校園。）\n\n要回校園港嗎？', [{ t: '自動航行（約 11 秒）', go: true, fn: () => seaSail('A') }, { t: '直接傳送', fn: () => seaTp('A') }, { t: '再逛逛', fn: closePanels }]));
}
// 傳送選單：校園港、龜山島港
{ const f = seaFlat(SEA.pierA[1] - 0.8, 0), l = seaFlat(-80, 0), f2 = seaFlat(SEA.pierB[0] + 0.8, 0), l2 = seaFlat(0, 0); TP.portA = [f[0], 0.15, f[1], l[0], l[1]]; TP.portB = [f2[0], 0.15, f2[1], l2[0], l2[1]]; }
window.__sea = { SEA, seaFlat, seaUV, seaSail, seaTp };
