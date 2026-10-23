/* ===== 校園三位原創小角色：小飛行員（開小飛機繞校園）、小空拍員（地面操控空拍機）、玫瑰王子（角色扮演王子賣玫瑰花）===== */
const PX = { built: false, t: 0, root: null, plane: null, drone: null, kid: null, prince: null };
const PXM = {
  red: new T.MeshLambertMaterial({ color: 0xd8403a }), white: new T.MeshLambertMaterial({ color: 0xf6f4ee }), blue: new T.MeshLambertMaterial({ color: 0x2f5fb0 }), navy: new T.MeshLambertMaterial({ color: 0x1f3a78 }),
  gold: new T.MeshLambertMaterial({ color: 0xf2c230 }), skin: new T.MeshLambertMaterial({ color: 0xf6d2b0 }), hair: new T.MeshLambertMaterial({ color: 0x6a4428 }), black: new T.MeshLambertMaterial({ color: 0x2a2a30 }),
  gray: new T.MeshLambertMaterial({ color: 0x8a9098 }), dark: new T.MeshBasicMaterial({ color: 0x20180f }), green: new T.MeshLambertMaterial({ color: 0x3f9a58 }), leaf: new T.MeshLambertMaterial({ color: 0x2f7a3a }),
  rose: new T.MeshLambertMaterial({ color: 0xd81f3c }), wood: new T.MeshLambertMaterial({ color: 0xb48a56 }), hood: new T.MeshLambertMaterial({ color: 0x2fa6a0 }), cap: new T.MeshLambertMaterial({ color: 0xf0b020 }),
  rotor: new T.MeshBasicMaterial({ color: 0xcfd6de, transparent: true, opacity: 0.45, side: T.DoubleSide }), glass: new T.MeshLambertMaterial({ color: 0x9fd6f0, transparent: true, opacity: 0.7 }),
  led: new T.MeshBasicMaterial({ color: 0xff3030 }), pink: new T.MeshLambertMaterial({ color: 0xf59ab8 }), whiteRose: new T.MeshLambertMaterial({ color: 0xfff1f4 }), cheek: new T.MeshBasicMaterial({ color: 0xff9a9a })
};
const pxS = (r, x, y, z, a, b, c) => [new T.SphereGeometry(r, 12, 9), hwM4(x, y, z, a === undefined ? 1 : a, b === undefined ? 1 : b, c === undefined ? 1 : c)];
const pxB = (w, h, d, x, y, z, ry, rx, rz) => [new T.BoxGeometry(w, h, d), hwM4(x, y, z, 1, 1, 1, ry || 0, rx || 0, rz || 0)];
const pxM = (g, parts, mat) => hwMesh(hwMerge(parts), mat, g);
function pxPlane() {
  const g = new T.Group(), b = new T.Group(); g.add(b); g.userData.bank = b;
  pxM(b, [pxS(0.55, 0, 0, 0, 1, 0.95, 2.1), pxS(0.3, 0, 0, 1.45, 0.9, 0.9, 1.3)], PXM.red);
  pxM(b, [pxB(5.4, 0.1, 1.1, 0, 0.55, 0.2), pxB(5.4, 0.1, 1.1, 0, -0.25, 0.2), pxB(1.9, 0.08, 0.55, 0, 0.1, -1.9), pxB(0.08, 0.7, 0.6, 0, 0.45, -1.95)], PXM.white);
  pxM(b, [pxB(0.07, 0.8, 0.07, -1.3, 0.15, 0.2), pxB(0.07, 0.8, 0.07, 1.3, 0.15, 0.2), pxB(0.07, 0.8, 0.07, -2.4, 0.15, 0.2), pxB(0.07, 0.8, 0.07, 2.4, 0.15, 0.2)], PXM.gray);
  pxM(b, [pxS(0.18, -0.5, -0.7, 0.9), pxS(0.18, 0.5, -0.7, 0.9), pxB(1.1, 0.06, 0.06, 0, -0.55, 0.9)], PXM.black);
  const sc = pxM(b, [pxB(0.16, 0.08, 1.2, 0, 0.55, -0.9)], PXM.red);                               // 飄動的紅圍巾
  const pr = new T.Group(); pr.position.set(0, 0, 1.85); pxM(pr, [pxB(0.14, 2.1, 0.05, 0, 0, 0), pxS(0.12, 0, 0, 0.05, 1, 1, 1.6)], PXM.gray); b.add(pr); g.userData.prop = pr; g.userData.scarf = sc;
  return g;
}
function pxDrone() {
  const g = new T.Group(), rotors = [];
  pxM(g, [pxB(0.5, 0.14, 0.5, 0, 0, 0), pxB(0.9, 0.05, 0.08, 0, 0, 0, Math.PI / 4), pxB(0.9, 0.05, 0.08, 0, 0, 0, -Math.PI / 4)], PXM.gray);
  pxM(g, [pxS(0.1, 0, -0.14, 0.22)], PXM.black);
  pxM(g, [pxS(0.05, 0, 0.1, 0.25)], PXM.glass);
  [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]].forEach(p => { const r = new T.Group(); r.position.set(p[0], 0.09, p[1]); pxM(r, [[new T.CylinderGeometry(0.27, 0.27, 0.015, 14), hwM4(0, 0, 0, 1)]], PXM.rotor); pxM(r, [pxB(0.5, 0.02, 0.05, 0, 0.01, 0)], PXM.black); g.add(r); rotors.push(r); });
  const led = new T.Mesh(new T.SphereGeometry(0.05, 6, 4), PXM.led); led.position.set(0, 0.02, -0.27); g.add(led); g.userData.rotors = rotors; g.userData.led = led; return g;
}
function pxBucket(col, rcol) {
  const g = new T.Group(), M = (parts, m) => pxM(g, parts, m);
  M([[new T.CylinderGeometry(0.34, 0.27, 0.62, 14, 1, true), hwM4(0, 0.31, 0, 1)], [new T.CylinderGeometry(0.27, 0.27, 0.03, 14), hwM4(0, 0.02, 0, 1)]], col);
  M([[new T.TorusGeometry(0.34, 0.025, 5, 16), hwM4(0, 0.6, 0, 1, 1, 1, 0, Math.PI / 2)], [new T.TorusGeometry(0.3, 0.025, 5, 16), hwM4(0, 0.3, 0, 1, 1, 1, 0, Math.PI / 2)]], PXM.gray);
  const st = [], fl = []; for (let i = 0; i < 11; i++) { const a = i * 2.4, rr = 0.05 + (i % 4) * 0.045, x = Math.cos(a) * rr, z = Math.sin(a) * rr, h = 0.55 + (i % 3) * 0.12, lean = 0.22 + (i % 3) * 0.08; st.push([new T.CylinderGeometry(0.012, 0.012, h, 4), hwM4(x + Math.cos(a) * h * 0.4 * lean, 0.45 + h / 2, z + Math.sin(a) * h * 0.4 * lean, 1, 1, 1, 0, Math.sin(a) * lean, -Math.cos(a) * lean)]); fl.push(pxS(0.075, x + Math.cos(a) * h * lean, 0.45 + h, z + Math.sin(a) * h * lean, 1, 0.85, 1)); }
  M(st, PXM.leaf); M(fl, rcol);
  return g;
}

// ---- 三位角色都用遊戲的 Q 版骨架模型（大頭、小身體、露出手臂）----
const PXC = {};
function pxMake(A, kind, h, colors) { const c = Object.assign({ shoes: 0x2b3340, socks: 0xffffff }, colors); c['school-sleeve'] = c.skin; const ch = makeChar(A[kind], { h, colors: c }); ch.mixer.update(0.01); ch.node.updateMatrixWorld(true); return ch; }
function pxHead(ch) { const r = ch.head ? ch.head.r : 0.165 * ch.h, cy = ch.head ? ch.head.cy : 0.84 * ch.h; return { r, cy }; }
function pxM2(g, c, x, y, z, mat) { const m = new T.Mesh(g, mat || propMat(c)); m.position.set(x, y, z); return m; }
function pxHand(ch, bone, G) { const b = ch.node.getObjectByName(bone); if (!b) return; ch.node.updateMatrixWorld(true); const p = ch.node.worldToLocal(b.getWorldPosition(new T.Vector3())); G.position.copy(p); addProp(ch, bone, G); }
function pxPose(ch, arms) { ch._pose = ['L', 'R'].map((sd, i) => { const b = ch.node.getObjectByName('UpperArm' + sd); return b ? { b, q0: b.quaternion.clone(), ax: arms[i] } : null; }).filter(Boolean); }
function pxPoseApply(ch) { if (!ch || !ch._pose) return; const q = new T.Quaternion(); ch._pose.forEach(p => { if (!p.ax) return; q.setFromAxisAngle(new T.Vector3(p.ax[0], p.ax[1], p.ax[2]), p.ax[3]); p.b.quaternion.copy(p.q0).multiply(q); }); }
async function pxChars() {
  const A = { boy: await loadGLB('boy'), girl: await loadGLB('girl') };
  { // 小空拍員：反戴黃帽、青綠上衣、手拿遙控器
    const ch = PXC.kid = pxMake(A, 'boy', 1.3, { skin: 0xf2c9a4, hair: 0x2a2220, 'school-shirt': 0x2fa6a0, 'school-shorts': 0x34405a, collar: 0x2fa6a0 }), { r, cy } = pxHead(ch), G = new T.Group();
    G.add(pxM2(new T.SphereGeometry(1.1 * r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xf0b020, 0, cy + 0.2 * r, 0));
    G.add(pxM2(new T.CylinderGeometry(0.95 * r, 0.95 * r, 0.1 * r, 14, 1, false, 0, Math.PI), 0xd89a10, 0, cy + 0.24 * r, 0.62 * r));
    addProp(ch, 'Head', G);
    const rc = new T.Group(); rc.add(pxM2(new T.BoxGeometry(0.13 * ch.h, 0.04 * ch.h, 0.07 * ch.h), 0x2a2a30, 0, 0, 0), pxM2(new T.SphereGeometry(0.014 * ch.h, 6, 4), 0xd8403a, -0.03 * ch.h, 0.025 * ch.h, 0), pxM2(new T.SphereGeometry(0.014 * ch.h, 6, 4), 0xd8403a, 0.03 * ch.h, 0.025 * ch.h, 0)); pxHand(ch, 'FistR', rc);
    pxPose(ch, [[1, 0, 0, -0.9], [1, 0, 0, -0.9]]);
  }
  { // 玫瑰王子：金冠、紅披風、手拿一朵玫瑰
    const ch = PXC.prince = pxMake(A, 'boy', 1.3, { skin: 0xf6d2b0, hair: 0x6a4428, 'school-shirt': 0x2f5fb0, 'school-shorts': 0xf2efe6, collar: 0xffffff, shoes: 0x6a3a1c }), { r, cy } = pxHead(ch), G = new T.Group();
    G.add(pxM2(new T.CylinderGeometry(0.62 * r, 0.7 * r, 0.3 * r, 12), 0xf2c230, 0, cy + 0.78 * r, 0));
    for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; G.add(pxM2(new T.ConeGeometry(0.13 * r, 0.32 * r, 5), 0xf2c230, Math.cos(a) * 0.55 * r, cy + 1.07 * r, Math.sin(a) * 0.55 * r)); }
    G.add(pxM2(new T.SphereGeometry(0.12 * r, 8, 6), 0xd81f3c, 0, cy + 0.8 * r, -0.68 * r)); addProp(ch, 'Head', G);
    const ny = ch.head ? ch.head.ny : 0.7 * ch.h, cape = new T.Group(); cape.add(pxM2(new T.BoxGeometry(0.3 * ch.h, 0.34 * ch.h, 0.015 * ch.h), 0xc4202c, 0, ny * 0.55, 0.1 * ch.h)); cape.children[0].rotation.x = -0.08; addProp(ch, 'Torso', cape);
    const rose = new T.Group(); rose.add(pxM2(new T.CylinderGeometry(0.006 * ch.h, 0.006 * ch.h, 0.2 * ch.h, 5), 0x2f7a3a, 0, 0.06 * ch.h, 0), pxM2(new T.SphereGeometry(0.03 * ch.h, 8, 6), 0xd81f3c, 0, 0.17 * ch.h, 0)); pxHand(ch, 'FistR', rose);
    pxPose(ch, [null, null]);
  }
  { // 小飛行員：飛行帽、護目鏡、紅圍巾，坐在座艙裡
    const ch = PXC.pilot = pxMake(A, 'girl', 1.15, { skin: 0xf2c9a4, hair: 0x3a2a20, 'school-shirt': 0x8a5a36, 'school-shorts': 0x4a4038, collar: 0xc4403a, shoes: 0x2a2020, 'hair-band': 0x8a5a36 }), { r, cy } = pxHead(ch), G = new T.Group();
    G.add(pxM2(new T.SphereGeometry(1.1 * r, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), 0x8a5a36, 0, cy + 0.12 * r, 0));
    const gl = pxM2(new T.TorusGeometry(0.3 * r, 0.07 * r, 6, 12), 0x20180f, 0, cy + 0.38 * r, -0.98 * r); const gl2 = gl.clone(); gl.position.x = -0.38 * r; gl2.position.x = 0.38 * r; G.add(gl, gl2, pxM2(new T.BoxGeometry(2 * r, 0.1 * r, 0.06 * r), 0x20180f, 0, cy + 0.38 * r, -0.97 * r));
    addProp(ch, 'Head', G);
    ch.node.position.set(0, -0.48, 0.1); ch.node.rotation.y = Math.PI; pxPose(ch, [[1, 0, 0, -1.0], [1, 0, 0, -1.0]]); PXC.plane.g.userData.bank.add(ch.node);
  }
  PXC.ready = true;
  // 掛上骨架角色
  PX.kid.g.add(PXC.kid.node); PX.prince.g.add(PXC.prince.node);
  if (window.STY && STY.on && typeof styScan === 'function') styScan();
}
function pxBuild() {
  if (PX.built) return; const pl = n => NPLACES.find(p => p.name === n && !p.room); if (!pl('梅花廣場') || !pl('操場')) return; PX.built = true; hwGeos();
  const root = PX.root = new T.Group(); scene.add(root);
  const label = (txt, col, y) => { const s = hwSprite(txt, col); s.position.set(0, y, 0); return s; };
  // 小飛機
  const pg = PX.plane = pxPlane(), pw = new T.Group(); pw.add(pg); root.add(pw); dynAdd(pw); const lb = label('小飛行員 阿飛', '#ffb0a0', 2.4); pw.add(lb); PX.plane = PXC.plane = { w: pw, g: pg, lab: lb, th: 0.5 };
  // 小空拍員＋空拍機
  const p2 = pl('操場'), q2 = hwFindOpen(p2.x + 3, p2.z + 6), kg = new T.Group(); kg.position.set(q2[0], q2[2], q2[1]); root.add(kg); dynAdd(kg); const kl = label('小空拍員 阿翔', '#9fe0d8', 1.95); kg.add(kl);
  PX.kid = { g: kg, lab: kl, x: q2[0], z: q2[1], y: q2[2], place: p2, ph: 0 };
  const dg = pxDrone(); root.add(dg); dynAdd(dg); PX.drone = { g: dg, a: 0 };
  // 玫瑰王子與玫瑰花桶（王子會在花桶附近走動）
  const p3 = pl('梅花廣場'), q3 = hwFindOpen(p3.x + 5, p3.z + 7), pg2 = new T.Group(); pg2.position.set(q3[0], q3[2], q3[1]); root.add(pg2); dynAdd(pg2); const ll = label('玫瑰王子（角色扮演）', '#ffd0e0', 1.95); pg2.add(ll);
  const bks = [[1.6, 0.4, PXM.blue, PXM.rose], [2.6, -0.5, PXM.gray, PXM.pink], [2.4, 1.2, PXM.wood, PXM.whiteRose]].map(o => { const q = hwFindOpen(q3[0] + o[0], q3[1] + o[1]), bg = pxBucket(o[2], o[3]); bg.position.set(q[0], q[2], q[1]); root.add(bg); dynAdd(bg); return { g: bg, x: q[0], z: q[1] }; });
  PX.prince = { g: pg2, lab: ll, x: q3[0], z: q3[1], y: q3[2], hx: q3[0], hz: q3[1], tx: q3[0], tz: q3[1], wait: 2, place: p3, ph: 1, buckets: bks, walking: false };
  pxChars().catch(e => console.warn('px chars', e));
  if (window.STY && STY.on && typeof styScan === 'function') styScan();
}
function pxTick(dt) {
  if (!PX.built) { if (typeof STARTED !== 'undefined' && STARTED && PWG.children.length) try { pxBuild(); } catch (e) { PX.built = true; console.error(e); } return; }
  PX.t += dt; const t = PX.t, cs = charScale(), pk = 1 + (cs - 1) * 0.6, face = (o, rate) => { const d = Math.hypot(o.x - PL.x, o.z - PL.z); if (d < 12) o.g.rotation.y += angd(Math.atan2(PL.x - o.x, PL.z - o.z) + Math.PI, o.g.rotation.y) * Math.min(1, dt * rate); return d; };
  if (PXC.ready) ['kid', 'prince', 'pilot'].forEach(k => { const c = PXC[k]; c.mixer.update(dt); pxPoseApply(c); });
  // 小飛機：以校園中心為圓心繞圈，帶一點傾斜與上下起伏
  { const P = PX.plane; P.th += 0.2 * dt; const R = 42, th = P.th, x = PC.x + Math.cos(th) * R, z = PC.z + Math.sin(th) * R, y = (P.alt || 24) + Math.sin(t * 0.7) * 1.8;
    P.w.position.set(x, y, z); P.w.rotation.y = Math.atan2(-Math.sin(th), Math.cos(th)); P.w.scale.setScalar(1.5 * pk); P.g.userData.bank.rotation.z = 0.3 + Math.sin(t * 1.1) * 0.05; P.g.userData.bank.rotation.x = Math.sin(t * 0.7) * 0.04; P.g.userData.prop.rotation.z += dt * 40; P.g.userData.scarf.rotation.y = Math.sin(t * 9) * 0.12; P.lab.visible = cs < 4; }
  { const K = PX.kid, d = face(K, 3); K.g.scale.setScalar(cs); K.lab.visible = d > 3.5 && d < 30 && cs < 4;
    const D = PX.drone; D.a += dt * 0.8; const r = 3.4, hx = K.x + Math.cos(D.a) * r * cs, hz = K.z + Math.sin(D.a) * r * cs, hy = K.y + (5 + Math.sin(t * 1.6) * 0.6) * cs; D.g.position.set(hx, hy, hz); D.g.scale.setScalar(cs * 1.2);
    D.g.rotation.y = Math.atan2(-Math.sin(D.a), Math.cos(D.a)); D.g.rotation.x = 0.18; D.g.userData.rotors.forEach((r2, i) => { r2.rotation.y += dt * 60 * (i % 2 ? 1 : -1); }); D.g.userData.led.material.color.setHex(Math.floor(t * 3) % 2 ? 0xff3030 : 0x30ff60); }
  { const Pr = PX.prince, dp0 = Math.hypot(Pr.x - PL.x, Pr.z - PL.z), near = dp0 < 3.8 && !(typeof anyPanel === 'function' && anyPanel() && false);
    Pr.g.scale.setScalar(cs); Pr.buckets.forEach(b => b.g.scale.setScalar(Math.max(1, cs)));
    if (near || (typeof anyPanel === 'function' && anyPanel() && dp0 < 8)) { Pr.walking = false; face(Pr, 4); }                 // 有人靠近或正在對話：停下來面對玩家
    else if (Pr.walking) { const dx = Pr.tx - Pr.x, dz = Pr.tz - Pr.z, L = Math.hypot(dx, dz), step = 1.0 * dt;
      if (L < step + 0.05) { Pr.walking = false; Pr.wait = 2.5 + Math.random() * 4; }
      else { Pr.x += dx / L * step; Pr.z += dz / L * step; const gy = groundAt(Pr.x, Pr.y + 2.2, Pr.z); if (isFinite(gy)) Pr.y = gy; Pr.g.position.set(Pr.x, Pr.y, Pr.z); Pr.g.rotation.y += angd(Math.atan2(dx, dz) + Math.PI, Pr.g.rotation.y) * Math.min(1, dt * 6); } }
    else { Pr.wait -= dt; if (Pr.wait <= 0) { const a = Math.random() * 6.283, r = 1.5 + Math.random() * 3.2, o = hwFindOpen(Pr.hx + Math.cos(a) * r, Pr.hz + Math.sin(a) * r); if (Math.hypot(o[0] - Pr.hx, o[1] - Pr.hz) < 5.5) { Pr.tx = o[0]; Pr.tz = o[1]; Pr.walking = true; } else Pr.wait = 1; } }
    if (PXC.ready) { const ch = PXC.prince, w = Pr.walking && !near; play(ch, w ? 'Walk' : 'Idle', 0.2); if (w && ch.act.Walk) ch.act.Walk.timeScale = 0.7; }
    Pr.lab.visible = dp0 > 3.5 && dp0 < 30 && cs < 4; }
}
function pxInteract(cand, ds) {
  if (!PX.built) return;
  const K = PX.kid, P = PX.prince, dk = ds(K.x, K.z, K.y); let dp = ds(P.x, P.z, P.y); P.buckets.forEach(b => { dp = Math.min(dp, ds(b.x, b.z, P.y)); });
  if (dk < 3.4) cand(dk, '和 阿翔（小空拍員）說話', pxKidTalk);
  if (dp < 3.6) cand(dp, '向玫瑰王子買花', pxPrinceTalk);
}
function pxMini(g, mp) {
  if (!PX.built) return; const dot = (x, z, c, r) => { const p = mp(x, z); g.fillStyle = c; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(p[0], p[1], r, 0, 7); g.fill(); g.stroke(); };
  dot(PX.kid.x, PX.kid.z, '#2fa6a0', 4.5); dot(PX.prince.x, PX.prince.z, '#d81f3c', 4.5); const w = PX.plane.w.position; dot(w.x, w.z, '#f2c230', 3.2);
}
// ---- 對話 ----
function pxKidTalk() {
  const done = () => closePanels(), menu = () => openDlg('阿翔（小空拍員）', '（阿翔舉著遙控器，抬頭盯著天上的小空拍機：）\n\n「嗨！我的空拍機正在拍校園的全景喔。你想知道什麼？」', [
    { t: '空拍機怎麼飛起來的？', go: true, fn: () => openDlg('阿翔（小空拍員）', '「空拍機有四個螺旋槳，轉得越快，往上推的力量越大。四個轉速一點點不一樣，機身就會往前、後、左、右傾斜，往那個方向飛。」', [{ t: '還有呢？', go: true, fn: menu }, { t: '好酷！', fn: done }]) },
    { t: '空拍有哪些安全規則？', go: true, fn: () => openDlg('阿翔（小空拍員）', '「一、保持在視線範圍內；二、不要飛到人群上方；三、遠離機場和重要設施；四、高度大約不要超過 120 公尺；五、飛行前先確認天氣和電量。守規則，大家才安全！」', [{ t: '還有呢？', go: true, fn: menu }, { t: '記住了！', fn: done }]) },
    { t: '請他幫我空拍一張', go: true, fn: () => { const now = nowMs(); if (G.resp.pxdr > now) openDlg('阿翔（小空拍員）', '「剛剛才拍過囉，電池要休息一下，等一下再來！」', [{ t: '好', fn: done }]); else { G.resp.pxdr = now + 5 * 60000; addCoins(30); saveGame(); openDlg('阿翔（小空拍員）', '「笑一個～咔嚓！畫面超漂亮。這張照片送你，還有一點拍攝小費！」\n\n獲得：同樂幣 30', [{ t: '謝謝！', go: true, fn: done }]); } } },
    { t: '先不用了', fn: done }]);
  menu();
}
function pxPrinceTalk() {
  const done = () => closePanels(), buy = (id, n, price, nm) => { if (G.coins < price) { openDlg('玫瑰王子', '「哎呀，同樂幣好像不太夠喔。先去採集或完成委託，再回來找我吧！」', [{ t: '好的', fn: done }]); return; } addCoins(-price); addItem(id, n); saveGame(); openDlg('玫瑰王子', '「送給你，' + nm + '！要好好照顧它喔。」\n\n花費：同樂幣 ' + price + '　獲得：' + ITEMS[id].n + ' ×' + n, [{ t: '再看看', go: true, fn: menu }, { t: '謝謝', fn: done }]); },
    menu = () => openDlg('玫瑰王子', '（頭戴小皇冠的王子優雅地行了一個禮：）\n\n「歡迎光臨！我是角色扮演的玫瑰王子，今天在這裡賣花。每一朵玫瑰都是我親手照顧的。」\n\n你有 ' + G.coins + ' 同樂幣', [
      { t: '買一朵玫瑰（40 幣）', go: true, fn: () => buy('rosef', 1, 40, '一朵玫瑰') },
      { t: '買一束玫瑰（5 朵，160 幣）', go: true, fn: () => buy('rosebq', 1, 160, '一束玫瑰') },
      { t: '聊聊玫瑰', go: true, fn: () => openDlg('玫瑰王子', '「花要用心照顧，才會開得漂亮。澆水、曬太陽，還要有耐心。其實照顧朋友也一樣喔。」', [{ t: '說得真好', go: true, fn: menu }, { t: '再見', fn: done }]) },
      { t: '先不買', fn: done }]);
  menu();
}
