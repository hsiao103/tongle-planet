/* ===== 2D 動漫線條畫風（可切換）：卡通色階材質 + 反向外殼描邊；全部用內建材質，不用自訂著色器 ===== */
const STY = { thickOn: false, tq: [], on: false, toon: new Map(), list: [], q: [], ol: null, olSk: null, grad: null, geo: new Map(), t: 0, total: 0, done: 0 };
(function () {
  const d = new Uint8Array([125, 190, 240, 255]);
  STY.grad = new T.DataTexture(d, 4, 1, T.LuminanceFormat); STY.grad.minFilter = STY.grad.magFilter = T.NearestFilter; STY.grad.needsUpdate = true;
  STY.ol = new T.MeshBasicMaterial({ color: 0x2b1d1a, side: T.BackSide });
  STY.olSk = new T.MeshBasicMaterial({ color: 0x2b1d1a, side: T.BackSide, skinning: true });
})();
function styToon(m) {
  if (!m || !m.color || (m.map && m.alphaTest) || m.isMeshBasicMaterial || m.isMeshToonMaterial || m.isSpriteMaterial || m.isPointsMaterial || m.isLineBasicMaterial) return m;
  let t = STY.toon.get(m); if (t) return t;
  t = new T.MeshToonMaterial({ color: m.color.clone(), map: m.map || null, vertexColors: m.vertexColors, transparent: m.transparent, opacity: m.opacity, side: m.side, alphaTest: m.alphaTest, polygonOffset: m.polygonOffset, polygonOffsetFactor: m.polygonOffsetFactor, polygonOffsetUnits: m.polygonOffsetUnits, depthWrite: m.depthWrite, skinning: !!m.skinning, gradientMap: STY.grad });
  if (m.emissive) { t.emissive.copy(m.emissive); t.emissiveIntensity = m.emissiveIntensity; }
  t.userData.src = m; STY.toon.set(m, t); STY.list.push(t); return t;
}
function styleSync() {
  for (const t of STY.list) { const m = t.userData.src; t.color.copy(m.color); t.opacity = m.opacity; if (m.emissive) { t.emissive.copy(m.emissive); t.emissiveIntensity = m.emissiveIntensity; } }
}
const _sb9 = new T.Box3();
function styHull(g, w) {
  const key = g.uuid + '|' + w.toFixed(4); let h = STY.geo.get(key); if (h) return h;
  const P = g.attributes.position, n = P.count, idx = g.index;
  g.computeBoundingBox(); const bb = g.boundingBox, diag = bb.min.distanceTo(bb.max) || 1, step = diag / 40000;
  const slot = new Int32Array(n), mp = new Map(); let ns = 0;
  for (let i = 0; i < n; i++) {
    const ix = Math.round((P.getX(i) - bb.min.x) / step), iy = Math.round((P.getY(i) - bb.min.y) / step), iz = Math.round((P.getZ(i) - bb.min.z) / step);
    const k = (ix * 40003 + iy) * 40003 + iz; let s = mp.get(k); if (s === undefined) { s = ns++; mp.set(k, s); } slot[i] = s;
  }
  const sum = new Float32Array(ns * 3), tc = idx ? idx.count : n;
  for (let t = 0; t < tc; t += 3) {
    const a = idx ? idx.getX(t) : t, b = idx ? idx.getX(t + 1) : t + 1, c = idx ? idx.getX(t + 2) : t + 2;
    const ax = P.getX(a), ay = P.getY(a), az = P.getZ(a), ux = P.getX(b) - ax, uy = P.getY(b) - ay, uz = P.getZ(b) - az, vx = P.getX(c) - ax, vy = P.getY(c) - ay, vz = P.getZ(c) - az;
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const q of [a, b, c]) { const s = slot[q] * 3; sum[s] += nx; sum[s + 1] += ny; sum[s + 2] += nz; }
  }
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const s = slot[i] * 3, x = sum[s], y = sum[s + 1], z = sum[s + 2], L = Math.hypot(x, y, z) || 1;
    out[i * 3] = P.getX(i) + x / L * w; out[i * 3 + 1] = P.getY(i) + y / L * w; out[i * 3 + 2] = P.getZ(i) + z / L * w;
  }
  h = new T.BufferGeometry(); h.setAttribute('position', new T.BufferAttribute(out, 3));
  if (idx) h.setIndex(idx);
  if (g.attributes.skinIndex) { h.setAttribute('skinIndex', g.attributes.skinIndex); h.setAttribute('skinWeight', g.attributes.skinWeight); }
  STY.geo.set(key, h); return h;
}
function styOutline(m) {
  const g = m.geometry; if (!g || !g.attributes.position) return;
  m.updateWorldMatrix(true, false);
  _sb9.setFromObject(m); const diag = _sb9.isEmpty() ? 1 : _sb9.min.distanceTo(_sb9.max);
  const sc = Math.max(1e-4, m.matrixWorld.getMaxScaleOnAxis() / (m.isInstancedMesh ? 1 : 1));
  const wW = Math.min(0.08, Math.max(0.025, diag * 0.012)), h = styHull(g, wW / sc);
  let o;
  if (m.isSkinnedMesh) { o = new T.SkinnedMesh(h, STY.olSk); o.bind(m.skeleton, m.bindMatrix); o.frustumCulled = false; }
  else if (m.isInstancedMesh) { o = new T.InstancedMesh(h, STY.ol, m.count); o.instanceMatrix = m.instanceMatrix; o.frustumCulled = false; }
  else { o = new T.Mesh(h, STY.ol); o.frustumCulled = m.frustumCulled; }
  o.raycast = function () { }; o.castShadow = false; o.receiveShadow = false; o.userData.isOutline = true; o.renderOrder = m.renderOrder;
  o.userData.m = m; o.userData.thin = h; o.userData.wW = wW; o.userData.sc = sc; o.userData.sk = !!m.isSkinnedMesh;
  if (STY.thickOn && !o.userData.sk) STY.tq.push(o);
  m.add(o); m.userData._ol = o; o.visible = STY.on;
}
function styNeedsOutline(m) {
  const mt = m.material; if (!mt || Array.isArray(mt)) return false;
  if (m.userData.noOutline || mt.transparent || mt.polygonOffset || mt.alphaTest || mt.depthWrite === false || mt.isMeshBasicMaterial) return false;
  return !!m.geometry && m.geometry.attributes.position && m.geometry.attributes.position.count < 400000;
}
// 掃描場景：換材質、排隊建立描邊
function styScan() {
  const seen = [];
  scene.traverse(o => {
    if (!(o.isMesh) || o.userData.isOutline) return;
    if (!o.visible) return;
    const u = o.userData;
    if (!Array.isArray(o.material) && u._tm !== o.material) { const t = styToon(o.material); if (t !== o.material) { u._om = o.material; u._tm = t; o.material = t; } }
    if (u._ol === undefined && !u._qd) { u._qd = true; if (styNeedsOutline(o)) STY.q.push(o); else u._ol = null; }
  });
}
function styRestoreAll() {
  scene.traverse(o => {
    if (o.isMesh && !o.userData.isOutline && o.userData._tm && o.material === o.userData._tm) { o.material = o.userData._om; }
    if (o.userData._ol) o.userData._ol.visible = false;
  });
  STY.q.length = 0; scene.traverse(o => { if (o.userData && o.userData._qd && o.userData._ol === undefined) o.userData._qd = false; });
}
function styShowAll() {
  scene.traverse(o => { if (o.userData && o.userData._ol) o.userData._ol.visible = true; });
}
function styleTick(dt) {
  if (!STY.on) return;
  styleSync();
  STY.t -= dt; if (STY.t <= 0) { STY.t = 1.0; styScan(); }
  // 拉遠成完整星球時：線條加粗（另外建一組較粗的外殼，來回切換）
  const wantThick = STY.thickOn ? cam.curD > 50 : cam.curD > 75;
  if (wantThick !== STY.thickOn) {
    STY.thickOn = wantThick;
    scene.traverse(o => { const u = o.userData; if (u && u.isOutline && !u.sk) { if (wantThick) { if (u.thick) o.geometry = u.thick; else if (STY.tq.indexOf(o) < 0) STY.tq.push(o); } else o.geometry = u.thin; } });
  }
  if (STY.tq.length) {
    const t1 = performance.now();
    while (STY.tq.length && performance.now() - t1 < 6) {
      const o = STY.tq.shift(), u = o.userData; if (!u.m || !u.m.parent) continue;
      try { u.thick = styHull(u.m.geometry, Math.min(0.9, Math.max(0.45, u.wW * 9)) / u.sc); if (STY.thickOn) o.geometry = u.thick; } catch (e) { }
    }
  }
  if (STY.q.length) {
    const t0 = performance.now();
    while (STY.q.length && performance.now() - t0 < 8) { const m = STY.q.shift(); try { styOutline(m); } catch (e) { m.userData._ol = null; } STY.done++; }
    if (!STY.q.length && STY.total) { toast('動漫線條已就緒', 1600); STY.total = 0; }
  }
}
function setStyle(on, quiet) {
  STY.on = !!on; try { localStorage.setItem('tongle_style', on ? 'anime' : 'real'); } catch (e) { }
  const b = $('bStyle'); b.textContent = on ? '畫風：動漫線條' : '畫風：寫實'; b.classList.toggle('on', !!on);
  if (on) {
    styScan(); styShowAll(); STY.total = STY.q.length; STY.done = 0;
    if (STY.total && !quiet) toast('正在畫線條…（' + STY.total + ' 個區塊）', 2600);
  } else styRestoreAll();
  styleSync();
}
$('bStyle').onclick = () => setStyle(!STY.on);
window.__style = { STY, setStyle, styScan };
try { if (localStorage.getItem('tongle_style') === 'anime') setTimeout(() => setStyle(true, true), 600); } catch (e) { }
