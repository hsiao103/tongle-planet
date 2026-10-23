// ===== 兒童遊戲區：遊戲器材（盪鞦韆×2 組、溜滑梯、蹺蹺板、旋轉木馬、彈簧搖搖馬、沙坑、單槓、長椅、告示牌）=====
// 可以「坐上去」的：鞦韆（4 個座位）、蹺蹺板（兩端）、旋轉木馬（4 個座位）；溜滑梯：爬上去再滑下來。
const PGE = { built: false, t: 0, root: null, sit: null, ride: null, seats: [], sw: [], seesaw: null, merry: null, springs: [], slide: null, base: 0.05 };
const pgV = (x, y, z) => new T.Vector3(x, y, z), pgUp = pgV(0, 1, 0);
function pgBox(g, w, h, d, c, x, y, z, ry) { const m = pxM2(new T.BoxGeometry(w, h, d), c, x, y, z); if (ry) m.rotation.y = ry; m.castShadow = true; g.add(m); return m; }
function pgCyl(g, r, h, c, x, y, z, seg) { const m = pxM2(new T.CylinderGeometry(r, r, h, seg || 12), c, x, y, z); m.castShadow = true; g.add(m); return m; }
function pgRod(g, a, b, r, c) { const d = pgV(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(), m = pxM2(new T.CylinderGeometry(r, r, L, 8), c, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.quaternion.setFromUnitVectors(pgUp, d.normalize()); m.castShadow = true; g.add(m); return m; }
function pgGrp(x, z, yaw, y) { const g = new T.Group(), gy = groundAt(x, 3, z); g.position.set(x, (isFinite(gy) ? gy : PGE.base) + (y || 0), z); g.rotation.y = yaw || 0; g.userData.gx = x; g.userData.gz = z; g.userData.gy = isFinite(gy) ? gy : PGE.base; g.userData.yaw = yaw || 0; PGE.root.add(g); dynAdd(g); return g; }
const pgW = (g, lx, lz) => { const u = g.userData, c = Math.cos(u.yaw), s = Math.sin(u.yaw); return [u.gx + lx * c + lz * s, u.gz - lx * s + lz * c]; };   // 局部 → 平面世界座標
function pgWall(g, lx, lz, hw, hd, h) { const u = g.userData, c = pgW(g, lx, lz), r = 0.0; WALLS.push({ x0: c[0] - hw, x1: c[0] + hw, z0: c[1] - hd, z1: c[1] + hd, y0: u.gy - 0.1, y1: u.gy + h }); }
function pgMat(x, z, w, d, col) { const g = pgGrp(x, z, 0); pgBox(g, w, 0.16, d, col, 0, -0.04, 0); }
function pgSwingSet(x, z, col1, col2, ph) {
  const g = pgGrp(x, z, 0), H = 2.5, L = 2.0, X = 2.1;
  [-X, X].forEach(sx => { pgRod(g, [sx, 0, -0.95], [sx, H, 0], 0.07, col1); pgRod(g, [sx, 0, 0.95], [sx, H, 0], 0.07, col1); pgWall(g, sx, -0.5, 0.12, 0.5, H); pgWall(g, sx, 0.5, 0.12, 0.5, H); });
  pgRod(g, [-X - 0.1, H, 0], [X + 0.1, H, 0], 0.09, col2);
  [-0.95, 0.95].forEach((sx, i) => {
    const pv = new T.Group(); pv.position.set(sx, H, 0); g.add(pv);
    [-0.22, 0.22].forEach(cz => pgRod(pv, [0, 0, cz], [0, -L, cz], 0.015, 0x9aa0a8));
    pgBox(pv, 0.55, 0.06, 0.3, i ? 0xf2a02c : 0xe0483c, 0, -L - 0.02, 0);
    const S = { g, pv, sx, H, L, ph: ph + i * 1.7, A: 0.15, th: 0, name: '鞦韆', kind: 'swing' }; PGE.sw.push(S);
    PGE.seats.push({ S, name: '鞦韆', pos() { const th = S.th, w = pgW(g, sx, -L * Math.sin(th)); return [w[0], g.userData.gy + H - L * Math.cos(th) - 0.5, w[1]]; } });
  });
  return g;
}
function pgBuildSlide() {
  const g = pgGrp(-3.2, -78.5, 0), TH = 1.9, c1 = 0x2f7fd0, c2 = 0xf2c230;
  [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]].forEach(p => pgRod(g, [p[0], 0, p[1]], [p[0], TH + 0.9, p[1]], 0.06, c1));
  pgBox(g, 1.3, 0.1, 1.3, c2, 0, TH, 0); pgBox(g, 1.4, 0.08, 1.4, 0xe0483c, 0, TH + 0.95, 0);                    // 平台與小屋頂
  [-0.6, 0.6].forEach(z => pgBox(g, 0.06, 0.55, 1.3, c1, 0, TH + 0.35, 0).position.set(-0.6 + 0.0, TH + 0.35, z) || 0);
  pgBox(g, 1.3, 0.5, 0.06, c1, 0, TH + 0.3, -0.62); pgBox(g, 1.3, 0.5, 0.06, c1, 0, TH + 0.3, 0.62);
  for (let i = 0; i < 6; i++) pgBox(g, 0.05, 0.05, 0.6, 0xc4c8d0, -0.95 - i * 0.06, 0.3 + i * 0.3, 0);               // 爬梯橫桿
  pgRod(g, [-0.88, 0, -0.32], [-0.6, TH, -0.32], 0.035, c1); pgRod(g, [-0.88, 0, 0.32], [-0.6, TH, 0.32], 0.035, c1);
  const a = [0.65, TH - 0.02], b = [3.9, 0.22], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
  const sl = new T.Group(); sl.position.set(a[0], a[1], 0); sl.rotation.z = ang; g.add(sl);
  const bd = pxM2(new T.BoxGeometry(L, 0.06, 0.72), 0xe0483c, L / 2, 0, 0); bd.castShadow = true; sl.add(bd);
  [-0.37, 0.37].forEach(z => { const r = pxM2(new T.BoxGeometry(L, 0.16, 0.05), 0xc2362c, L / 2, 0.09, z); sl.add(r); });
  pgRod(g, [3.5, 0.22, -0.3], [3.5, 0, -0.3], 0.03, 0x9aa0a8); pgRod(g, [3.5, 0.22, 0.3], [3.5, 0, 0.3], 0.03, 0x9aa0a8);
  pgWall(g, 0, 0, 0.7, 0.7, TH + 0.9);
  PGE.slide = { g, a, b, TH, ladder: pgW(g, -1.5, 0), top: pgW(g, 0, 0), s0: pgW(g, 0.7, 0), s1: pgW(g, 3.9, 0), out: pgW(g, 4.6, 0), L0: pgW(g, -1.25, 0) };
}
function pgBuildSeesaw() {
  const g = pgGrp(0.2, -84.5, 0), PH = 0.55, bd = new T.Group(); bd.position.set(0, PH, 0); g.add(bd);
  pgBox(bd, 3.2, 0.1, 0.4, 0x2f9a6a, 0, 0, 0); [-1.2, 1.2].forEach(x => { pgBox(bd, 0.5, 0.05, 0.42, 0xf2c230, x, 0.07, 0); pgRod(bd, [x * 1.1, 0.07, -0.2], [x * 1.1, 0.4, -0.2], 0.025, 0xc4c8d0); pgRod(bd, [x * 1.1, 0.4, -0.2], [x * 1.1, 0.4, 0.2], 0.025, 0xc4c8d0); });
  pgBox(g, 0.18, 0.5, 0.5, 0x2a6ad0, 0, 0.25, 0); pgBox(g, 0.18, 0.5, 0.5, 0x2a6ad0, 0, 0.25, 0).scale.set(1, 1, 1);
  PGE.seesaw = { g, bd, PH, a: 0.18, A: 0.2 };
  [1, -1].forEach(s => PGE.seats.push({ S: PGE.seesaw, name: '蹺蹺板', pos() { const a = PGE.seesaw.a, w = pgW(g, s * 1.2 * Math.cos(a), 0); return [w[0], g.userData.gy + PH + s * 1.2 * Math.sin(a) - 0.4, w[1]]; } }));
  pgWall(g, 0, 0, 0.2, 0.3, 0.6);
}
function pgBuildMerry() {
  const g = pgGrp(2.0, -74.0, 0), R = 1.5, d = new T.Group(); d.position.y = 0.28; g.add(d);
  const cols = [0xe0483c, 0x2f7fd0, 0xf2c230, 0x2f9a6a];
  cols.forEach((c, i) => { const m = pxM2(new T.CylinderGeometry(R, R, 0.1, 16, 1, false, i * Math.PI / 2, Math.PI / 2), c, 0, 0, 0); m.castShadow = true; d.add(m); });
  pgCyl(d, 0.08, 1.1, 0xc4c8d0, 0, 0.55, 0); pgCyl(g, 0.14, 0.28, 0x9aa0a8, 0, 0.14, 0);
  const seats = [];
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, px = Math.cos(a) * 1.0, pz = -Math.sin(a) * 1.0;
    pgBox(d, 0.5, 0.05, 0.3, 0xf2f2f2, px, 0.22, pz, a + Math.PI / 2 - 0 * 1).rotation.y = a + Math.PI / 2;
    pgRod(d, [px * 1.0, 0.1, pz * 1.0], [px * 1.0, 0.6, pz * 1.0], 0.025, 0xc4c8d0); seats.push(a); }
  PGE.merry = { g, d, rot: 0, sp: 0.2 };
  seats.forEach(a => PGE.seats.push({ S: PGE.merry, name: '旋轉木馬', pos() { const ang = a + PGE.merry.rot, w = pgW(g, Math.cos(ang) * 1.0, -Math.sin(ang) * 1.0); return [w[0], g.userData.gy + 0.28 + 0.22 - 0.42, w[1]]; } }));
}
function pgSpring(x, z, yaw, kind) {
  const g = pgGrp(x, z, yaw), b = new T.Group(); g.add(b); pgCyl(g, 0.3, 0.06, 0x9aa0a8, 0, 0.03, 0); pgCyl(g, 0.07, 0.4, 0xc4c8d0, 0, 0.25, 0);
  b.position.y = 0.45; if (kind === 'duck') { pgBox(b, 0.5, 0.35, 0.7, 0xf2d230, 0, 0.25, 0); const h = pxM2(new T.SphereGeometry(0.25, 10, 8), 0xf2d230, 0, 0.6, -0.28); b.add(h); pgBox(b, 0.18, 0.08, 0.22, 0xf08a28, 0, 0.58, -0.58); }
  else { pgBox(b, 0.34, 0.4, 0.8, 0x9a5a30, 0, 0.3, 0); pgBox(b, 0.26, 0.4, 0.26, 0x9a5a30, 0, 0.6, -0.4).rotation.x = -0.4; pgBox(b, 0.14, 0.08, 0.3, 0x5a3418, 0, 0.9, -0.5); pgBox(b, 0.38, 0.06, 0.34, 0xe0483c, 0, 0.55, 0); }
  PGE.springs.push({ g, b, ph: Math.random() * 6 }); pgWall(g, 0, 0, 0.3, 0.3, 1.0); return g;
}
function pgSandbox(x, z) {
  const g = pgGrp(x, z, 0); pgBox(g, 3.0, 0.14, 2.4, 0xd8bf8a, 0, 0.05, 0);
  [[0, -1.2, 3.2, 0.1], [0, 1.2, 3.2, 0.1], [-1.5, 0, 0.1, 2.5], [1.5, 0, 0.1, 2.5]].forEach(p => pgBox(g, p[2], 0.28, p[3], 0xa8683a, p[0], 0.14, p[1]));
  pgCyl(g, 0.16, 0.2, 0xe0483c, -0.7, 0.22, 0.3); pgBox(g, 0.05, 0.3, 0.05, 0x2f7fd0, 0.3, 0.3, -0.2).rotation.z = 0.5; pgBox(g, 0.5, 0.18, 0.4, 0xe8d09a, 0.6, 0.2, 0.4);
}
function pgBars(x, z) {
  const g = pgGrp(x, z, 0), cs = [0xe0483c, 0x2f7fd0, 0xf2c230];
  [[-1.2, 1.15], [0.1, 1.45], [1.4, 1.75]].forEach((p, i) => { [-0.4, 0.4].forEach(zz => pgRod(g, [p[0], 0, zz], [p[0], p[1], zz], 0.04, 0xc4c8d0)); pgRod(g, [p[0], p[1], -0.45], [p[0], p[1], 0.45], 0.04, cs[i]); });
  pgWall(g, 0.1, 0, 1.6, 0.5, 1.8);
}
function pgBench(x, z, yaw) { const g = pgGrp(x, z, yaw); pgBox(g, 1.5, 0.08, 0.45, 0xb0733c, 0, 0.45, 0); pgBox(g, 1.5, 0.4, 0.07, 0xb0733c, 0, 0.75, 0.22); [-0.65, 0.65].forEach(lx => pgBox(g, 0.07, 0.45, 0.4, 0x4a5058, lx, 0.22, 0)); }
function pgSign(x, z) {
  const g = pgGrp(x, z, 0); pgRod(g, [-0.9, 0, 0], [-0.9, 1.7, 0], 0.05, 0x4a5058); pgRod(g, [0.9, 0, 0], [0.9, 1.7, 0], 0.05, 0x4a5058);
  pgBox(g, 2.2, 0.8, 0.08, 0x2f9a6a, 0, 1.55, 0); const s = hwSprite('兒童遊戲區 請注意安全', '#9fe8b0'); s.scale.set(2.3, 0.58, 1); s.position.set(0, 1.55, 0.12); g.add(s);
}
function pgBuild() {
  if (PGE.built) return; if (!NPLACES.find(p => p.name === '涼亭・遊戲區' && !p.room)) return; PGE.built = true; hwGeos();
  PGE.root = new T.Group(); scene.add(PGE.root);
  pgMat(0.4, -95, 6.2, 8.4, 0xd84a3c); pgMat(0.2, -84.5, 5.2, 3.6, 0x2f8a5a); pgMat(-1.2, -78.5, 9, 3.6, 0x2f6fb8); pgMat(2.0, -74.0, 4.0, 4.0, 0xe0a030);
  pgSwingSet(0.4, -98.0, 0x2f7fd0, 0xf2c230, 0); pgSwingSet(0.4, -91.0, 0xe0483c, 0x2f9a6a, 1.2);
  pgBuildSlide(); pgBuildSeesaw(); pgBuildMerry();
  pgSpring(-2.6, -71.5, 0.3, 'duck'); pgSpring(-1.4, -71.0, -0.2, 'horse');
  pgSandbox(-6.0, -70.0); pgBars(-6.9, -75.8); pgBench(3.7, -79.5, -Math.PI / 2); pgBench(3.7, -88, -Math.PI / 2); pgBench(-3.2, -68.0, 0);
  pgSign(-0.4, -66.2);
  if (window.STY && STY.on && typeof styScan === 'function') styScan();
}
function pgOff() {
  const S = PGE.sit; PGE.sit = null; if (!S) return; const p = S.pos(), a = PL.yaw; PL.x = p[0] + 2.0 * Math.sin(a); PL.z = p[2] + 2.0 * Math.cos(a); const gy = groundAt(PL.x, p[1] + 3, PL.z); PL.y = isFinite(gy) ? gy : PGE.base; PL.vy = 0; fwTransport();
  for (let i = 0; i < 6 && blocked(PL.x, PL.z, PL.y); i++) { PL.x = p[0] + 2.0 * Math.sin(a + i * 1.05); PL.z = p[2] + 2.0 * Math.cos(a + i * 1.05); }
}
function pgOn(S) { if (PGE.sit || PGE.ride) return; PGE.sit = S; toast('坐上' + S.name + '了！移動或按 E 就能下來', 3000); }
function pgSlideGo() {
  const s = PGE.slide; if (PGE.sit || PGE.ride) return; PGE.ride = { t: 0 }; GAME.block = true; toast('爬上去囉！', 1500);
}
function pgRideTick(dt) {
  const R = PGE.ride, s = PGE.slide, by = s.g.userData.gy, T1 = 2.4, T2 = 0.4, T3 = 1.5; R.t += dt; const t = R.t;
  let x, z, y;
  if (t < T1) { const k = t / T1; x = s.L0[0] + (s.top[0] - s.L0[0]) * k; z = s.L0[1] + (s.top[1] - s.L0[1]) * k; y = by + 0.05 + (s.TH + 0.05) * k; }
  else if (t < T1 + T2) { x = s.top[0]; z = s.top[1]; y = by + s.TH + 0.05; }
  else if (t < T1 + T2 + T3) { const k = (t - T1 - T2) / T3, e = k * k * 0.6 + k * 0.4; x = s.s0[0] + (s.s1[0] - s.s0[0]) * e; z = s.s0[1] + (s.s1[1] - s.s0[1]) * e; y = by + (s.a[1] + (s.b[1] - s.a[1]) * e) - 0.38; }
  else { PGE.ride = null; GAME.block = false; PL.x = s.out[0]; PL.z = s.out[1]; const gy = groundAt(PL.x, by + 3, PL.z); PL.y = isFinite(gy) ? gy : by; PL.vy = 0; fwTransport(); toast('好好玩！再來一次？', 1800); return; }
  PL.x = x; PL.z = z; PL.y = y; PL.vy = 0; avatar.position.set(PL.x, PL.y, PL.z); fwTransport();
}
function pgTick(dt) {
  if (!PGE.built) { if (typeof STARTED !== 'undefined' && STARTED && PWG.children.length) try { pgBuild(); } catch (e) { PGE.built = true; console.error(e); } return; }
  PGE.t += dt; const t = PGE.t, sit = PGE.sit;
  PGE.sw.forEach(S => { const mine = sit && sit.S === S, tgt = mine ? 0.75 : 0.12; S.A += (tgt - S.A) * Math.min(1, dt * (mine ? 0.5 : 0.8)); S.th = S.A * Math.sin(t * 1.7 + S.ph); S.pv.rotation.x = S.th; });
  { const Z = PGE.seesaw, mine = sit && sit.S === Z; Z.A += ((mine ? 0.3 : 0.05) - Z.A) * Math.min(1, dt * 1.2); Z.a = mine ? Z.A * Math.sin(t * 1.6) : Z.a + (0.12 - Z.a) * Math.min(1, dt * 1.5); Z.bd.rotation.z = Z.a; }
  { const M = PGE.merry, mine = sit && sit.S === M; M.sp += ((mine ? 0.9 : 0.2) - M.sp) * Math.min(1, dt * 0.8); M.rot += M.sp * dt; M.d.rotation.y = M.rot; }
  PGE.springs.forEach(p => { const d = Math.hypot(p.g.userData.gx - PL.x, p.g.userData.gz - PL.z), a = d < 2.6 ? 0.22 : 0.03; p.b.rotation.z += (Math.sin(t * 5 + p.ph) * a - p.b.rotation.z) * Math.min(1, dt * 6); });
  if (PGE.ride) { pgRideTick(dt); return; }
  if (sit) { if (PL.want > 0.5 || keys.Space) { pgOff(); return; } const p = sit.pos(); PL.x = p[0]; PL.z = p[2]; PL.y = p[1]; PL.vy = 0; avatar.position.set(PL.x, PL.y, PL.z); fwTransport(); if (typeof CH !== 'undefined' && CH.hero) { } }
}
function pgInteract(cand, ds) {
  if (!PGE.built) return; if (PGE.ride) return;
  if (PGE.sit) { cand(0, '從' + PGE.sit.name + '下來', pgOff); return; }
  PGE.seats.forEach(S => { const p = S.pos(), d = ds(p[0], p[2], p[1]); if (d < 2.3) cand(d, '坐上' + S.name, () => pgOn(S)); });
  const s = PGE.slide, d = ds(s.ladder[0], s.ladder[1], s.g.userData.gy); if (d < 2.6) cand(d, '玩溜滑梯', pgSlideGo);
}
