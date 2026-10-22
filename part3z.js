/* ===== 同樂小行星：球面數學、把校園一次烘成真球面、星球地形、天空與時間 =====
   做法：物理（走路、碰撞、導覽）仍用平面座標；畫面上的靜態物件在載入時用 CPU 一次彎到球面上，
   會動的角色在每幀繪製前暫時換成球面座標（見 DYN／planetSwapIn）。不使用任何客製著色器。 */
const PR = 100;                              // 星球半徑（公尺）
const PC = { x: -12, z: -60 };               // 校園中心：平面座標系的「北極」
const PSHORE = 2.33;                         // 可行走的最大球面角（弧度），之外是海
const PWALK = PR * PSHORE;                   // 可行走半徑（公尺）
const _a = new T.Vector3(), _b = new T.Vector3(), _c = new T.Vector3(), _d = new T.Vector3(), _e = new T.Vector3();
const _m4a = new T.Matrix4(), _m4b = new T.Matrix4(), _q1 = new T.Quaternion();

// 平面座標 → 球面位置
function sph(x, y, z, out) {
  const dx = x - PC.x, dz = z - PC.z, d = Math.hypot(dx, dz), th = d / PR, r = PR + y, k = d > 1e-6 ? Math.sin(th) / d : 1 / PR;
  return out.set(PC.x + r * k * dx, r * Math.cos(th) - PR, PC.z + r * k * dz);
}
// 球面上該點的「上」方向
function sphUp(x, z, out) {
  const dx = x - PC.x, dz = z - PC.z, d = Math.hypot(dx, dz), th = d / PR, k = d > 1e-6 ? Math.sin(th) / d : 1 / PR;
  return out.set(k * dx, Math.cos(th), k * dz);
}
// 平面標架 (徑向, 上, 切向) → 球面標架
function sphBasis(x, z, er2, u2, et) {
  const dx = x - PC.x, dz = z - PC.z, d = Math.hypot(dx, dz), th = d / PR, s = Math.sin(th), c = Math.cos(th);
  const ux = d > 1e-6 ? dx / d : 0, uz = d > 1e-6 ? dz / d : 1;
  er2.set(c * ux, -s, c * uz); u2.set(s * ux, c, s * uz); et.set(-uz, 0, ux);
  return { ux, uz };
}
// 平面方向（旋轉 q）→ 球面方向（四元數）：qFrame * q
const _er = new T.Vector3(), _er2 = new T.Vector3(), _u2 = new T.Vector3(), _et = new T.Vector3(), _ey = new T.Vector3(0, 1, 0);
function frameQuat(x, z, out) {
  const b = sphBasis(x, z, _er2, _u2, _et), ux = b.ux, uz = b.uz;
  _er.set(ux, 0, uz);
  _m4a.makeBasis(_er, _ey, _et); _m4b.makeBasis(_er2, _u2, _et);
  _m4a.transpose(); _m4b.multiply(_m4a);              // M = B' * B^T
  return out.setFromRotationMatrix(_m4b);
}
// 在 (x,z) 處，平面向量對應到球面的切向量（雅可比），回傳 [Jx, Jz]
const _Jx = new T.Vector3(), _Jz = new T.Vector3(), _P0 = new T.Vector3(), _P1 = new T.Vector3();
function sphJac(x, z) {
  const e = 0.05; sph(x, 0, z, _P0); sph(x + e, 0, z, _Jx).sub(_P0).multiplyScalar(1 / e); sph(x, 0, z + e, _Jz).sub(_P0).multiplyScalar(1 / e);
}
// 球面切向量 w → 平面向量 [a,b]（最小平方）
function sphUnJac(x, z, w, out) {
  sphJac(x, z);
  const A = _Jx.dot(_Jx), B = _Jx.dot(_Jz), C = _Jz.dot(_Jz), p = _Jx.dot(w), q = _Jz.dot(w), det = A * C - B * B || 1e-9;
  out[0] = (p * C - q * B) / det; out[1] = (q * A - p * B) / det; return out;
}
// 平面上一點離校園中心的距離與方向
const pdist = (x, z) => Math.hypot(x - PC.x, z - PC.z);

// ---------- 烘焙工具 ----------
const PWG = new T.Group(); PWG.name = 'planetWorld'; scene.add(PWG);
const DMAX = 232;                             // 超出此平面半徑的三角形捨棄（那裡是海）
function bendInPlace(pos, nor) {              // pos/nor: Float32Array，逐頂點彎曲
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], y = pos[i + 1], z = pos[i + 2];
    const dx = x - PC.x, dz = z - PC.z, d = Math.hypot(dx, dz), th = d / PR, s = Math.sin(th), c = Math.cos(th), r = PR + y;
    const ux = d > 1e-6 ? dx / d : 0, uz = d > 1e-6 ? dz / d : 1;
    pos[i] = PC.x + r * s * ux; pos[i + 1] = r * c - PR; pos[i + 2] = PC.z + r * s * uz;
    if (nor) {
      const nx = nor[i], ny = nor[i + 1], nz = nor[i + 2], a = nx * ux + nz * uz, cc = -nx * uz + nz * ux;
      nor[i] = a * c * ux + ny * s * ux - cc * uz; nor[i + 1] = -a * s + ny * c; nor[i + 2] = a * c * uz + ny * s * uz + cc * ux;
    }
  }
}
// 把一個幾何（可帶世界矩陣）細分長邊後彎到球面，回傳新幾何
function planetBakeGeo(g0, mw, maxE) {
  let g = g0.index ? g0.toNonIndexed() : g0.clone();
  if (mw) g.applyMatrix4(mw);
  const names = ['position', 'normal', 'uv', 'color'].filter(n => g.attributes[n]), sz = names.map(n => g.attributes[n].itemSize), stride = sz.reduce((a, b) => a + b, 0);
  const P = g.attributes.position.array, nv = g.attributes.position.count;
  let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9, mnz = 1e9, mxz = -1e9;
  for (let i = 0; i < P.length; i += 3) { mnx = Math.min(mnx, P[i]); mxx = Math.max(mxx, P[i]); mny = Math.min(mny, P[i + 1]); mxy = Math.max(mxy, P[i + 1]); mnz = Math.min(mnz, P[i + 2]); mxz = Math.max(mxz, P[i + 2]); }
  const big = Math.max(mxx - mnx, mxy - mny, mxz - mnz) > maxE;
  const attrs = names.map(n => g.attributes[n]);
  // 組成交錯頂點
  const vert = (i) => { const v = new Float32Array(stride); let o = 0; attrs.forEach((a, k) => { for (let j = 0; j < sz[k]; j++) v[o++] = a.array[i * a.itemSize + j]; }); return v; };
  const out = [];                                           // 交錯頂點（每個為 Float32Array）
  const el = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const mid = (a, b) => { const v = new Float32Array(stride); for (let i = 0; i < stride; i++) v[i] = (a[i] + b[i]) / 2; return v; };
  const stack = []; let guard = 0;
  for (let i = 0; i < nv; i += 3) {
    const t = [vert(i), vert(i + 1), vert(i + 2)];
    if (!big) { out.push(t[0], t[1], t[2]); continue; }
    stack.push(t);
    while (stack.length) {
      const q = stack.pop(), e0 = el(q[0], q[1]), e1 = el(q[1], q[2]), e2 = el(q[2], q[0]), m = Math.max(e0, e1, e2);
      if (m <= maxE || ++guard > 600000) { out.push(q[0], q[1], q[2]); continue; }
      const k = e0 === m ? 0 : e1 === m ? 1 : 2, a = q[k], b = q[(k + 1) % 3], c = q[(k + 2) % 3], h = mid(a, b);
      stack.push([a, h, c], [h, b, c]);
    }
  }
  // 丟掉超出海岸的三角形
  const keep = [];
  for (let i = 0; i < out.length; i += 3) {
    let ok = true; for (let j = 0; j < 3; j++) { const v = out[i + j]; if (pdist(v[0], v[2]) > DMAX) { ok = false; break; } }
    if (ok) keep.push(out[i], out[i + 1], out[i + 2]);
  }
  const N = keep.length, arr = attrs.map((a, k) => new Float32Array(N * sz[k]));
  for (let i = 0; i < N; i++) { let o = 0; for (let k = 0; k < arr.length; k++) for (let j = 0; j < sz[k]; j++) arr[k][i * sz[k] + j] = keep[i][o++]; }
  const G = new T.BufferGeometry();
  names.forEach((n, k) => G.setAttribute(n, new T.BufferAttribute(arr[k], sz[k], attrs[k].normalized)));
  const bi = names.indexOf('position'), ni = names.indexOf('normal');
  bendInPlace(arr[bi], ni >= 0 ? arr[ni] : null);
  if (N) { G.computeBoundingSphere(); G.computeBoundingBox(); }
  if (g !== g0) g.dispose();
  return G;
}
function planetBakeLine(o, maxE) {
  const g = o.geometry, P = g.attributes.position, pts = [];
  for (let i = 0; i < P.count; i++) pts.push(new T.Vector3().fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld));
  const arr = [];
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.ceil(a.distanceTo(b) / maxE)); for (let k = 0; k < n; k++) arr.push(a.x + (b.x - a.x) * k / n, a.y + (b.y - a.y) * k / n, a.z + (b.z - a.z) * k / n); }
  const l = pts[pts.length - 1]; arr.push(l.x, l.y, l.z);
  const f = new Float32Array(arr); bendInPlace(f, null);
  const G = new T.BufferGeometry(); G.setAttribute('position', new T.BufferAttribute(f, 3));
  return new (o.isLineSegments ? T.LineSegments : T.Line)(G, o.material);
}
function planetBakeInstanced(o) {
  const im = new T.InstancedMesh(o.geometry, o.material, o.count), m = new T.Matrix4(), W = new T.Matrix4(), p = new T.Vector3(), q = new T.Quaternion(), s = new T.Vector3(), fq = new T.Quaternion(), p2 = new T.Vector3();
  for (let i = 0; i < o.count; i++) {
    o.getMatrixAt(i, m); W.multiplyMatrices(o.matrixWorld, m); W.decompose(p, q, s);
    frameQuat(p.x, p.z, fq); q.premultiply(fq); sph(p.x, p.y, p.z, p2); m.compose(p2, q, s); im.setMatrixAt(i, m);
  }
  im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; return im;
}
// 合併：同材質、同投影設定、同區塊的烘焙幾何合成一個網格（大幅減少繪製呼叫）
function mergeGeos(list) {
  const names = Object.keys(list[0].attributes); let N = 0; list.forEach(g => { N += g.attributes.position.count; });
  const G = new T.BufferGeometry();
  names.forEach(n => {
    const a0 = list[0].attributes[n], arr = new Float32Array(N * a0.itemSize); let o = 0;
    list.forEach(g => { arr.set(g.attributes[n].array, o); o += g.attributes[n].array.length; });
    G.setAttribute(n, new T.BufferAttribute(arr, a0.itemSize, a0.normalized));
  });
  G.computeBoundingSphere(); G.computeBoundingBox(); return G;
}
// 一次烘焙整個場景（靜態物件）；原件隱藏但保留（供射線偵測地面用）
function planetBakeAll() {
  scene.updateMatrixWorld(true);
  // 平貼地面的薄板：依建立順序分成 16 層微小深度偏移（避免共面閃爍），同層同材質共用一個材質以便合併
  const offCache = new Map();
  { const flat = [];
    scene.traverse(o => {
      if (!o.isMesh || !o.geometry || o.isSkinnedMesh || o.isInstancedMesh || !o.material || Array.isArray(o.material) || o.material.transparent) return;
      if (o.geometry.type !== 'BoxGeometry' && o.geometry.type !== 'PlaneGeometry' && o.geometry.type !== 'CircleGeometry') return;
      o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
      if (bb.max.y - bb.min.y < 0.4 && bb.max.y < 0.6 && bb.max.x - bb.min.x > 0.4 && bb.max.z - bb.min.z > 0.4) flat.push(o);
    });
    flat.sort((a, b) => a.id - b.id);
    flat.forEach((o, i) => {
      const lvl = Math.floor(i / Math.max(1, flat.length) * 16), key = o.material.id + '|' + lvl;
      let m = offCache.get(key); if (!m) { m = o.material.clone(); m.polygonOffset = true; m.polygonOffsetFactor = -1; m.polygonOffsetUnits = -(1 + lvl); offCache.set(key, m); }
      o.userData._om = m;
    }); }
  const list = []; scene.traverse(o => { if (o !== PWG && o.parent !== PWG && (o.isMesh || o.isSprite || o.isLine)) list.push(o); });
  const wp = new T.Vector3(), t0 = performance.now(); let nm = 0, tri = 0;
  const buckets = new Map();
  list.forEach(o => {
    let b = null;
    if (o.isSkinnedMesh) return;
    if (o.isInstancedMesh) b = planetBakeInstanced(o);
    else if (o.isMesh) {
      const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox();
      const sz = g.boundingBox.getSize(_a), sc = o.matrixWorld.getMaxScaleOnAxis();
      if (Math.max(sz.x, sz.y, sz.z) * sc > 400) { o.visible = false; return; }               // 舊的巨大平地：由球面地形取代
      const bg = planetBakeGeo(g, o.matrixWorld, 5); if (!bg.attributes.position.count) { o.visible = false; return; }
      const mt = o.userData._om || o.material; tri += bg.attributes.position.count / 3;
      const bs = bg.boundingSphere, key = mt.id + '|' + (o.castShadow ? 1 : 0) + (o.receiveShadow ? 1 : 0) + '|' + o.renderOrder + '|' + Object.keys(bg.attributes).join() + '|' + Math.floor(bs.center.x / 45) + ',' + Math.floor(bs.center.z / 45);
      let bk = buckets.get(key); if (!bk) buckets.set(key, bk = { mt, cast: o.castShadow, recv: o.receiveShadow, ro: o.renderOrder, geos: [] });
      bk.geos.push(bg); o.visible = false; o.matrixAutoUpdate = false; nm++; return;
    } else if (o.isSprite) {
      o.getWorldPosition(wp); b = new T.Sprite(o.material); sph(wp.x, wp.y, wp.z, b.position); b.scale.copy(o.scale); b.center.copy(o.center);
    } else if (o.isLine) b = planetBakeLine(o, 2);
    if (!b) return;
    b.castShadow = o.castShadow; b.receiveShadow = o.receiveShadow; b.renderOrder = o.renderOrder; b.userData = Object.assign({}, o.userData); b.layers.mask = o.layers.mask; b.updateMatrix(); b.matrixAutoUpdate = false;
    if (o.isSprite) b.userData.flat = [wp.x, wp.y, wp.z];
    b.visible = o.visible; if (o.isSprite && o.userData.key && LABELS[o.userData.key] === o) LABELS[o.userData.key] = b;
    PWG.add(b); o.visible = false; o.matrixAutoUpdate = false; nm++;
  });
  let draws = 0;
  buckets.forEach(bk => {
    const G = bk.geos.length === 1 ? bk.geos[0] : mergeGeos(bk.geos), me = new T.Mesh(G, bk.mt);
    me.castShadow = bk.cast; me.receiveShadow = bk.recv; me.renderOrder = bk.ro; me.matrixAutoUpdate = false; PWG.add(me); draws++;
    if (bk.geos.length > 1) bk.geos.forEach(g => g.dispose());
  });
  PWG.updateMatrixWorld(true);
  window.__bake = { ms: Math.round(performance.now() - t0), meshes: nm, merged: draws, tri: Math.round(tri) };
}

// ---------- 星球地形：草地球、沙灘、海洋；遠方的樹、花、石 ----------
const MAT = {
  grass: new T.MeshLambertMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 }),
  water: new T.MeshLambertMaterial({ color: 0x4db6d8, transparent: true, opacity: 0.82, emissive: 0x0a3a52, emissiveIntensity: 0.35 }),
  trunk: new T.MeshLambertMaterial({ color: 0x6b4f33 }), leaf: new T.MeshLambertMaterial({ color: 0x3c8a44 }), leaf2: new T.MeshLambertMaterial({ color: 0x57a24b }),
  rock: new T.MeshLambertMaterial({ color: 0x9a9a92 }), fl1: new T.MeshLambertMaterial({ color: 0xf06a8a }), fl2: new T.MeshLambertMaterial({ color: 0xf6d34a }), fl3: new T.MeshLambertMaterial({ color: 0xffffff })
};
const TERR = { land: null, water: null };
function landRadius(th) {                                   // 陸地半徑：海岸外逐漸下沉成海盆
  if (th < 2.28) return PR - 0.03;
  const t = Math.min(1, (th - 2.28) / 0.28); return PR - 0.03 - 1.6 * t * t * (3 - 2 * t);
}
function buildPlanetTerrain() {
  const g = new T.SphereGeometry(1, 192, 128), P = g.attributes.position, col = new Float32Array(P.count * 3), c = new T.Color();
  const cG1 = new T.Color(0x7fa05e), cG2 = new T.Color(0x8fb26a), cG3 = new T.Color(0x6f9650), cSand = new T.Color(0xe9d9a6), cWet = new T.Color(0xc9b887), cSea = new T.Color(0x3b8fb0);
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i), th = Math.acos(Math.max(-1, Math.min(1, y))), r = landRadius(th), az = Math.atan2(z, x);
    P.setXYZ(i, x * r, y * r, z * r);
    const n = Math.sin(th * 9 + Math.sin(az * 5) * 2) * 0.5 + Math.sin(az * 7 + th * 4) * 0.5;
    c.copy(cG1).lerp(n > 0 ? cG2 : cG3, Math.abs(n) * 0.6);
    if (th > 2.12) c.lerp(cSand, Math.min(1, (th - 2.12) / 0.12));
    if (th > 2.3) c.lerp(cWet, Math.min(1, (th - 2.3) / 0.06));
    if (th > 2.4) c.lerp(cSea, Math.min(1, (th - 2.4) / 0.2));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new T.BufferAttribute(col, 3)); g.computeVertexNormals();
  const land = new T.Mesh(g, MAT.grass); land.position.set(PC.x, -PR, PC.z); land.receiveShadow = true; land.userData.noCut = true; scene.add(land); TERR.land = land;
  const wg = new T.SphereGeometry(PR - 0.5, 96, 64), water = new T.Mesh(wg, MAT.water); water.position.copy(land.position); water.renderOrder = 2; scene.add(water); TERR.water = water; water.userData.noOutline = true;
}
// 在平面座標 (x,z) 放一個面朝「上」的物件（球面標架）
function placeOnPlanet(obj, x, z, yaw, y) {
  sph(x, y || 0, z, obj.position); frameQuat(x, z, obj.quaternion);
  if (yaw) { _q1.setFromAxisAngle(_ey, yaw); obj.quaternion.multiply(_q1); } return obj;
}
function buildFarField() {
  const rnd2 = (() => { let s = 12345; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  const tr = new T.CylinderGeometry(0.18, 0.26, 1.6, 6); tr.translate(0, 0.8, 0);
  const lf = new T.ConeGeometry(1.5, 3.4, 7); lf.translate(0, 3.3, 0);
  const lf2 = new T.IcosahedronGeometry(1.7, 0); lf2.translate(0, 3.0, 0);
  const NT = 170, I1 = new T.InstancedMesh(tr, MAT.trunk, NT), I2 = new T.InstancedMesh(lf, MAT.leaf, NT), I3 = new T.InstancedMesh(lf2, MAT.leaf2, NT);
  const m = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), p = new T.Vector3(), q2 = new T.Quaternion();
  const TREES = [], hide = new T.Matrix4().makeScale(0, 0, 0);
  let n = 0, guard = 0;
  while (n < NT && guard++ < 5000) {
    const az = rnd2() * Math.PI * 2, d = 112 + Math.pow(rnd2(), 0.8) * 108;                 // 校外 112～220 公尺
    const x = PC.x + Math.cos(az) * d, z = PC.z + Math.sin(az) * d;
    if (TREES.some(t => Math.hypot(t[0] - x, t[1] - z) < 9)) continue;
    if (Math.abs(x - 0) < 12 && z > -10 && z < 120) continue;                         // 校門前的路徑留空
    TREES.push([x, z]); const s = 0.8 + rnd2() * 0.8, yaw = rnd2() * 6.28;
    frameQuat(x, z, q); q2.setFromAxisAngle(_ey, yaw); q.multiply(q2); sph(x, 0, z, p); sc.set(s, s, s); m.compose(p, q, sc);
    I1.setMatrixAt(n, m); const cone = rnd2() < 0.5; (cone ? I2 : I3).setMatrixAt(n, m); (cone ? I3 : I2).setMatrixAt(n, hide); TREES[n].push(s, cone); n++;
  }
  for (let i = n; i < NT; i++) { I1.setMatrixAt(i, hide); I2.setMatrixAt(i, hide); I3.setMatrixAt(i, hide); }
  [I1, I2, I3].forEach(I => { I.count = NT; I.instanceMatrix.needsUpdate = true; I.frustumCulled = false; I.castShadow = true; I.receiveShadow = true; scene.add(I); });
  TREES.forEach(t => { WALLS.push({ x0: t[0] - 0.5, x1: t[0] + 0.5, z0: t[1] - 0.5, z1: t[1] + 0.5, y0: -5, y1: 6 }); });
  window.__farTrees = TREES;
  // 小花與石頭
  const fg = new T.ConeGeometry(0.16, 0.34, 5); fg.translate(0, 0.17, 0);
  const NF = 420, F = [MAT.fl1, MAT.fl2, MAT.fl3].map(mt => new T.InstancedMesh(fg, mt, NF / 3 | 0));
  F.forEach((I, k) => { for (let i = 0; i < I.count; i++) { const az = rnd2() * 6.28, d = 105 + rnd2() * 118, x = PC.x + Math.cos(az) * d, z = PC.z + Math.sin(az) * d; frameQuat(x, z, q); sph(x, 0.02, z, p); sc.set(1, 1, 1); m.compose(p, q, sc); I.setMatrixAt(i, m); } I.frustumCulled = false; scene.add(I); });
  const rg = new T.DodecahedronGeometry(0.7, 0), RI = new T.InstancedMesh(rg, MAT.rock, 40);
  for (let i = 0; i < 40; i++) { const az = rnd2() * 6.28, d = 118 + rnd2() * 110, x = PC.x + Math.cos(az) * d, z = PC.z + Math.sin(az) * d, s = 0.5 + rnd2() * 1.1; frameQuat(x, z, q); sph(x, 0.1, z, p); sc.set(s, s * 0.7, s); m.compose(p, q, sc); RI.setMatrixAt(i, m); }
  RI.frustumCulled = false; RI.castShadow = true; scene.add(RI);
}
// 星空
const STARS = (() => {
  const n = 500, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 6.283, r = Math.sqrt(1 - u * u); pos.set([r * Math.cos(a) * 1500, u * 1500, r * Math.sin(a) * 1500], i * 3); }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
  const p = new T.Points(g, new T.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false })); p.frustumCulled = false; p.renderOrder = -1; scene.add(p); return p;
})();

// ---------- 時間與天空：依「玩家所在位置的當地時間」決定日夜（隨時鐘或手動切換） ----------
const GT = { mode: 'auto', hour: 12, night: false };
function gameHour() { if (GT.mode === 'day') return 12; if (GT.mode === 'night') return 0; const d = new Date(); return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600; }
const SKY = { day: new T.Color(0xaed6f0), dusk: new T.Color(0xf3a66a), night: new T.Color(0x0d1626), cur: new T.Color() };
const _sp2 = new T.Vector3(), _space = new T.Color(), _sunD = new T.Vector3(), _up = new T.Vector3(), _east = new T.Vector3(), _col = new T.Color();
function skyTick(px, py, pz) {
  const h = gameHour(); GT.hour = h;
  const a = (h - 6) / 12 * Math.PI, el = Math.sin(a);                                  // 太陽仰角（-1～1）
  sphUp(px, pz, _up); sphBasis(px, pz, _a, _b, _east);
  _sunD.copy(_east).multiplyScalar(Math.cos(a)).addScaledVector(_up, Math.sin(a)).addScaledVector(_a, -0.18).normalize();
  const day = Math.max(0, Math.min(1, (el + 0.12) / 0.4)), dusk = Math.max(0, 1 - Math.abs(el) / 0.28);
  SKY.cur.copy(SKY.night).lerp(SKY.day, day).lerp(SKY.dusk, dusk * 0.55 * (day > 0.02 ? 1 : 0.4));
  if (window.HW && HW.k > 0.01) SKY.cur.lerp(HW.tint, HW.k * (0.5 + 0.25 * (1 - day)));
  if (window.XM && XM.k > 0.01) SKY.cur.lerp(XM.tint, XM.k * (0.4 + 0.3 * (1 - day)));
  if (window.LN && LN.k > 0.01) SKY.cur.lerp(LN.tint, LN.k * (0.25 + 0.4 * (1 - day)));
  scene.background = SKY.cur; if (scene.fog) { scene.fog.color.copy(SKY.cur); }
  sph(px, py, pz, _a);
  const gl = Math.max(0, Math.min(1, (cam.curD - 30) / 70));                                                  // 拉遠成球：太陽固定照一半星球，顯示日夜交界
  if (el > -0.06) { sun.color.set(0xfff1d2).lerp(_col.set(0xffa860), dusk * 0.7); sun.intensity = 0.1 + 0.7 * day; sun.position.copy(_a).addScaledVector(_sunD, 160); }
  else { sun.color.set(0x8fa8ff); sun.intensity = 0.22; sun.position.copy(_a).addScaledVector(_up, 120).addScaledVector(_east, 60); }     // 夜晚：月光
  if (gl > 0) { _sp2.copy(_a).addScaledVector(_sunD, 160); sun.position.lerp(_sp2, gl); if (el <= -0.06) sun.color.lerp(_col.set(0xfff1d2), gl); sun.intensity += (0.95 - sun.intensity) * gl; }
  SKY.cur.lerp(_space.set(0x050914), gl * 0.9); if (scene.fog) scene.fog.color.copy(SKY.cur);
  sun.target.position.copy(_a); sun.target.updateMatrixWorld();
  hemi.intensity = (0.24 + 0.5 * day) * (1 - 0.6 * gl); hemi.color.set(0xdfeaff).lerp(_col.set(0xffd9b0), dusk * 0.4); if (window.HW && HW.k > 0.01) hemi.color.lerp(_col.set(0xc9a2ff), 0.45 * HW.k); if (window.XM && XM.k > 0.01) hemi.color.lerp(_col.set(0xcfe6ff), 0.4 * XM.k); if (window.LN && LN.k > 0.01) hemi.color.lerp(_col.set(0xffc9a0), 0.4 * LN.k);
  STARS.material.opacity = Math.max(Math.max(0, 1 - day * 1.6), gl) * 0.9; STARS.position.copy(camera.position);
  const night = day < 0.05; if (night !== GT.night) { GT.night = night; isNight = night; classLights(night); const b = document.getElementById('bTime'); if (b) b.classList.toggle('on', night); }
  return day;
}
function sunShadowFollow() { const s = sun.shadow.camera; s.left = -48; s.right = 48; s.top = 48; s.bottom = -48; s.near = 20; s.far = 420; s.updateProjectionMatrix(); sun.shadow.mapSize.set(2048, 2048); }

// ---------- 會動的物件：繪製前暫時換成球面座標，繪製後還原 ----------
const DYN = [], _sv = [];
function dynAdd(o) { if (DYN.indexOf(o) < 0) DYN.push(o); }
const _pp = new T.Vector3(), _pq = new T.Quaternion();
function planetSwapIn() {
  _sv.length = 0;
  if (DYN.length > 120) for (let i = DYN.length - 1; i >= 0; i--) if (!DYN[i].parent) DYN.splice(i, 1);
  for (const o of DYN) {
    if (!o.parent) continue;
    _sv.push(o, o.position.x, o.position.y, o.position.z, o.quaternion.x, o.quaternion.y, o.quaternion.z, o.quaternion.w, o.rotation.x, o.rotation.y, o.rotation.z);
    const x = o.position.x, y = o.position.y, z = o.position.z;
    frameQuat(x, z, _pq); sph(x, y, z, _pp); o.position.copy(_pp); o.quaternion.premultiply(_pq); o.updateMatrixWorld(true);
  }
}
function planetSwapOut() {
  for (let i = 0; i < _sv.length; i += 11) { const o = _sv[i]; o.position.set(_sv[i + 1], _sv[i + 2], _sv[i + 3]); o.quaternion.set(_sv[i + 4], _sv[i + 5], _sv[i + 6], _sv[i + 7]);
    o.rotation.set(_sv[i + 8], _sv[i + 9], _sv[i + 10]);          // 還原「原本的歐拉角」：否則四元數被拆回歐拉角時，偏航超過 ±90° 會變成 (π, y, π)，下一幀只改 rotation.y 就整個人翻面（站著不動來回翻、抖動的原因）
    o.updateMatrixWorld(true); }
  _sv.length = 0;
}

// ===== 執行 =====
planetBakeAll();
buildPlanetTerrain();
buildFarField();
sunShadowFollow();
scene.fog = new T.Fog(0xaed6f0, 400, 1400);
