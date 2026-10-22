/* ===== 玩家、球面相機、控制、主迴圈 ===== */
const $ = id => document.getElementById(id);
const touchDev = (('ontouchstart' in window) || navigator.maxTouchPoints > 0) && (window.matchMedia('(pointer:coarse)').matches || !window.matchMedia('(hover:hover)').matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
if (touchDev) document.body.classList.add('touch');
// 保險：第一次真的收到手指觸控（pointerType 為 touch）就切成手機操作；收到滑鼠移動且不是觸控裝置時恢復電腦版
addEventListener('pointerdown', e => { if (e.pointerType === 'touch') document.body.classList.add('touch'); }, true);
const PL = { x: 0, y: 0.1, z: 6, vy: 0, yaw: 0, pitch: -0.05, r: 0.35 };
const view = { mode: 'walk', third: true };                 // 舊程式相容用（part5/part7 仍會讀取）
const iso = { az: 0 }, orbit = { tx: 0, tz: 0 }, DQ = { hide: [] };
function setMode() {}
const keys = {};
const joy = { lx: 0, ly: 0, rx: 0, ry: 0 };
const ray = new T.Raycaster(), DOWN = new T.Vector3(0, -1, 0), tmp = new T.Vector3();
const lamp = new T.PointLight(0xffe6b0, 0, 26); scene.add(lamp);
const avatar = new T.Group();
{ const b = new T.Mesh(new T.CylinderGeometry(0.28, 0.3, 1.1, 12), M.orange); b.position.y = 0.75;
  const h = new T.Mesh(new T.SphereGeometry(0.24, 12, 10), mat(0xf2c9a0)); h.position.y = 1.55;
  const l = new T.Mesh(new T.BoxGeometry(0.4, 0.4, 0.2), M.blue); l.position.y = 0.2;
  [b, h, l].forEach(m => { m.castShadow = true; avatar.add(m); }); scene.add(avatar); }
dynAdd(avatar);
const GAME = { block: false };                                // 開著面板／對話時，暫停移動輸入

function groundAt(x, y, z) {
  ray.set(tmp.set(x, y + 0.7, z), DOWN); ray.far = 8;
  const hit = ray.intersectObjects(walk, false);
  return hit.length ? hit[0].point.y : -Infinity;
}
function blocked(x, z, y, noEdge) {
  if (!noEdge && pdist(x, z) > PWALK) return true;                        // 海岸外是海
  const r = PL.r;
  for (let i = 0; i < WALLS.length; i++) {
    const w = WALLS[i];
    if (!(y + 0.45 < w.y1 && y + 1.6 > w.y0)) continue;
    let px = x, pz = z;
    if (w.tf) { const dx = x - w.tf.x, dz = z - w.tf.z; px = dx * w.tf.c - dz * w.tf.s; pz = dx * w.tf.s + dz * w.tf.c; }
    if (px > w.x0 - r && px < w.x1 + r && pz > w.z0 - r && pz < w.z1 + r) return true;
  }
  return false;
}

// ---- 球面相機：視線方向 fw 是玩家腳下的切平面向量，隨移動平行傳送 ----
const cam = { d: 7.5, curD: 7.5, elev: 0.42, fw: new T.Vector3(0, 0, -1), indoor: 0 };
const _U = new T.Vector3(), _R = new T.Vector3(), _P = new T.Vector3(), _T = new T.Vector3(), _D = new T.Vector3(), _W = new T.Vector3(), _fa = [0, 0];
function fwFromYaw() {
  const hx = -Math.sin(PL.yaw), hz = -Math.cos(PL.yaw);
  sphJac(PL.x, PL.z); cam.fw.copy(_Jx).multiplyScalar(hx).addScaledVector(_Jz, hz);
  sphUp(PL.x, PL.z, _U); cam.fw.addScaledVector(_U, -cam.fw.dot(_U)).normalize();
}
function yawFromFw() { sphUnJac(PL.x, PL.z, cam.fw, _fa); if (Math.hypot(_fa[0], _fa[1]) > 1e-9) PL.yaw = Math.atan2(-_fa[0], -_fa[1]); }
function fwTransport() { sphUp(PL.x, PL.z, _U); cam.fw.addScaledVector(_U, -cam.fw.dot(_U)); if (cam.fw.lengthSq() < 1e-8) fwFromYaw(); else cam.fw.normalize(); }
function fwRotate(a) { sphUp(PL.x, PL.z, _U); cam.fw.applyAxisAngle(_U, a); }
// 平面方向 → 實際面向（切向被球面壓縮，面向要跟著修正）
function sphFace(x, z, dx, dz, out) {
  const ddx = x - PC.x, ddz = z - PC.z, d = Math.hypot(ddx, ddz), th = d / PR, ux = d > 1e-6 ? ddx / d : 0, uz = d > 1e-6 ? ddz / d : 1, k = th > 1e-5 ? Math.sin(th) / th : 1;
  const a = dx * ux + dz * uz, b = (-dx * uz + dz * ux) * k; out[0] = a * ux - b * uz; out[1] = a * uz + b * ux; return out;
}
function teleport(x, y, z, lookX, lookZ) {
  PL.x = x; PL.y = y + 0.05; PL.z = z; PL.vy = 0;
  if (lookX !== undefined) PL.yaw = Math.atan2(-(lookX - x), -(lookZ - z));
  fwFromYaw();
}
fwFromYaw();

// 傳送按鈕
const TP = { gate: [0, 0, -12, 0, -40], track: [TX, 0, TZ + 10, TX, TZ - 20], gym: (() => { const a = gW((GX0 + GX1) / 2, GZ1 - 2), b = gW((GX0 + GX1) / 2, GZ0); return [a[0], 0.1, a[1], b[0], b[1]]; })(), park: [-74, 0, -24, -74, -45] };
$('bMenu').onclick = () => { const h = $('floors').classList.toggle('hide'); $('bMenu').classList.toggle('on', !h); };
document.querySelectorAll('[data-tp]').forEach(b => b.onclick = () => { const t = TP[b.dataset.tp]; teleport(t[0], t[1], t[2], t[3], t[4]); });
BUILDINGS.forEach(b => {
  const row = document.createElement('div'); row.className = 'row';
  const lab = document.createElement('span'); lab.className = 'lab'; lab.textContent = b.short || (b.id + ' 棟'); lab.title = b.name; row.appendChild(lab);
  for (let k = 0; k < b.floors; k++) {
    const bt = document.createElement('button'); bt.type = 'button'; bt.textContent = (k + 1) + 'F';
    bt.onclick = () => { const p = b.tp(k); teleport(p.x, p.y, p.z, p.look[0], p.look[1]); };
    row.appendChild(bt);
  }
  $('floors').appendChild(row);
});
$('floorRow').remove();

// 鍵盤
const KT = {};                                                                   // 各鍵按下時間：相反方向同時按住時，以「較晚按的」為準（不互相抵消）
function axisKey(a1, a2, b1, b2) {       // 相反方向同時按住：先按的繼續；後按的要按滿 0.4 秒才算數（短點按忽略，避免人物倒退走或一直轉身）
  const A = keys[a1] || keys[a2], B = keys[b1] || keys[b2]; if (!(A && B)) return A ? 1 : B ? -1 : 0;
  const ta = Math.max(keys[a1] ? KT[a1] || 0 : 0, keys[a2] ? KT[a2] || 0 : 0), tb = Math.max(keys[b1] ? KT[b1] || 0 : 0, keys[b2] ? KT[b2] || 0 : 0), now = performance.now();
  return ta >= tb ? (now - ta > 400 ? 1 : -1) : (now - tb > 400 ? -1 : 1);
}
addEventListener('keydown', e => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (!keys[e.code]) KT[e.code] = performance.now();
  keys[e.code] = true;
  if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
  if (typeof gameKey === 'function' && !e.repeat) gameKey(e.code, e);
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

// 指標：單指拖曳轉視角／傾斜；雙指捏合縮放、雙指扭轉旋轉、雙指上下拖傾斜（滑鼠：拖曳＋滾輪）
const PTR = new Map(); let pinch = null; const cv = renderer.domElement;
const pinchState = () => { const [a, b] = [...PTR.values()]; return { d: Math.hypot(b.x - a.x, b.y - a.y) || 1, ang: Math.atan2(b.y - a.y, b.x - a.x), my: (a.y + b.y) / 2 }; };
cv.addEventListener('pointerdown', e => { PTR.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { cv.setPointerCapture(e.pointerId); } catch (_) {} pinch = PTR.size === 2 ? pinchState() : null; });
cv.addEventListener('pointermove', e => {
  const q = PTR.get(e.pointerId); if (!q) return;
  const dx = e.clientX - q.x, dy = e.clientY - q.y; q.x = e.clientX; q.y = e.clientY;
  if (PTR.size >= 2 && pinch) {
    const n = pinchState(), k = pinch.d / n.d;
    cam.d = Math.min(175, Math.max(2.5, cam.d * k));
    let da = n.ang - pinch.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); fwRotate(-da);
    cam.elev = Math.max(0.02, Math.min(1.5, cam.elev + (n.my - pinch.my) * 0.004));
    pinch = n; return;
  }
  fwRotate(-dx * 0.0042); cam.elev = Math.max(0.02, Math.min(1.5, cam.elev + dy * 0.004));
});
const dragEnd = e => { PTR.delete(e.pointerId); pinch = PTR.size === 2 ? pinchState() : null; };
cv.addEventListener('pointerup', dragEnd); cv.addEventListener('pointercancel', dragEnd);
['gesturestart', 'gesturechange'].forEach(t => document.addEventListener(t, e => e.preventDefault()));   // iOS Safari：避免整頁被捏合縮放
renderer.domElement.addEventListener('wheel', e => { e.preventDefault(); cam.d = Math.min(175, Math.max(2.5, cam.d * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });

// 虛擬搖桿（手機）
function stick(el, onMove) {
  const knob = el.firstElementChild; let id = null;
  const set = (e) => { const r = el.getBoundingClientRect(); let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const m = Math.hypot(dx, dy), lim = 40; if (m > lim) { dx *= lim / m; dy *= lim / m; }
    knob.style.transform = `translate(${dx}px,${dy}px)`; const dz = 0.2, mm = Math.hypot(dx, dy) / lim, sc = mm < dz ? 0 : (mm - dz) / (1 - dz) / (mm || 1);   // 死區 20%：手指輕放時的微小抖動不算輸入
    onMove(dx / lim * sc, dy / lim * sc); };
  const rel = () => { if (id === null && !knob.style.transform) return; id = null; knob.style.transform = ''; onMove(0, 0); };
  el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (id !== null && el.hasPointerCapture && el.hasPointerCapture(id)) return; id = e.pointerId; try { el.setPointerCapture(id); } catch (x) { } set(e); });
  el.addEventListener('contextmenu', e => e.preventDefault());
  // 保險：手指放開事件漏掉（搖桿被隱藏、對話框彈出、系統手勢、來電）時，主動歸零
  ['pointerup', 'pointercancel'].forEach(t => addEventListener(t, e => { if (e.pointerId === id) rel(); }, true));
  ['touchend', 'touchcancel'].forEach(t => addEventListener(t, e => { if (id !== null && !e.touches.length) rel(); }, true));
  document.addEventListener('visibilitychange', rel); addEventListener('pagehide', rel);
  setInterval(() => { if (id === null) return; if (!el.getClientRects().length || (el.hasPointerCapture && !el.hasPointerCapture(id))) rel(); }, 200);
  el.addEventListener('pointermove', e => { if (e.pointerId === id) set(e); });
  const end = e => { if (e.pointerId === id) rel(); };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
  addEventListener('blur', rel);   // 切走視窗／來電：搖桿歸零，避免卡住不放
}
stick($('joyL'), (x, y) => { joy.lx = x; joy.ly = y; });
// 右側不再有搖桿：左上「跑」＝點一下開／關跑步，右下「跳」＝按住跳；轉視角用單指拖曳畫面
{ const br = $('bRun'), bj = $('bJump');
  br.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); joy.run = !joy.run; br.classList.toggle('on', joy.run); });
  let jid = null; bj.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); keys.Space = true; jid = e.pointerId; try { bj.setPointerCapture(e.pointerId); } catch (x) { } });
  setInterval(() => { if (jid !== null && keys.Space && (!bj.getClientRects().length || (bj.hasPointerCapture && !bj.hasPointerCapture(jid)))) { keys.Space = false; jid = null; } }, 200);
  const jEnd = () => { keys.Space = false; }; bj.addEventListener('pointerup', jEnd); bj.addEventListener('pointercancel', jEnd); bj.addEventListener('lostpointercapture', jEnd);
  addEventListener('blur', () => { keys.Space = false; }); }

// 小地圖（校園範圍；校外時標記停在邊緣）
const mc = $('miniC'), mg = mc.getContext('2d'), MX0 = -95, MZ0 = -142, MS = 300 / 165;
const mp = (x, z) => [(x - MX0) * MS, (z - MZ0) * MS];
function drawMini() {
  mg.clearRect(0, 0, 300, 300); mg.fillStyle = 'rgba(127,160,94,.25)'; mg.fillRect(0, 0, 300, 300);
  mg.strokeStyle = '#7d8187'; mg.lineCap = 'round'; ROADS.forEach(r => { mg.lineWidth = r.w * MS; mg.beginPath(); r.pts.forEach((p, i) => { const m = mp(p[0], p[1]); i ? mg.lineTo(m[0], m[1]) : mg.moveTo(m[0], m[1]); }); mg.stroke(); });
  FOOT.forEach(f => {
    if (f.track) { const c = mp(f.x, f.z); mg.save(); mg.translate(c[0], c[1]); mg.rotate(-f.rot); mg.strokeStyle = '#c2582f'; mg.lineWidth = 8; mg.beginPath();
      const w = f.hw * MS, l = f.hl * MS; mg.roundRect ? mg.roundRect(-w + 4, -l + 4, 2 * w - 8, 2 * l - 8, w - 4) : mg.rect(-w, -l, 2 * w, 2 * l); mg.stroke(); mg.restore(); return; }
    mg.fillStyle = f.c;
    if (f.tf) { const o = mp(f.tf.x, f.tf.z); mg.save(); mg.translate(o[0], o[1]); mg.rotate(-Math.atan2(f.tf.s, f.tf.c)); mg.fillRect(f.x0 * MS, f.z0 * MS, (f.x1 - f.x0) * MS, (f.z1 - f.z0) * MS); mg.restore(); return; }
    const a = mp(f.x0, f.z0), b = mp(f.x1, f.z1); mg.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
  });
  if (typeof navDrawMini === 'function') navDrawMini(mg, mp);
  if (typeof gameMini === 'function') gameMini(mg, mp);
  let p = mp(PL.x, PL.z); p = [Math.max(8, Math.min(292, p[0])), Math.max(8, Math.min(292, p[1]))];
  mg.save(); mg.translate(p[0], p[1]); mg.rotate(-PL.yaw);
  mg.fillStyle = '#ff5a1f'; mg.strokeStyle = '#fff'; mg.lineWidth = 2; mg.beginPath(); mg.moveTo(0, -9); mg.lineTo(6, 7); mg.lineTo(-6, 7); mg.closePath(); mg.fill(); mg.stroke(); mg.restore();
}
function playerBld() {
  for (const f of FOOT) if (f.id) {
    let px = PL.x, pz = PL.z; if (f.tf) { const dx = PL.x - f.tf.x, dz = PL.z - f.tf.z; px = dx * f.tf.c - dz * f.tf.s; pz = dx * f.tf.s + dz * f.tf.c; }
    if (px > f.x0 && px < f.x1 && pz > f.z0 && pz < f.z1) return f.id;
  } return null;
}
const BNAME = { A: '行政大樓', AW: '廚房', B: '教學區西樓', BC: '教學區南樓', C: '教學區東樓', D: '科任及幼兒園區', DS: '科任及幼兒園區' };   // 介面顯示名稱（程式代碼 id 不變）
let hereName = '戶外';
function whereText() {
  let s = '校園戶外';
  const id = playerBld(); if (id) s = BNAME[id] || (id + ' 棟');
  if (!id && (() => { const dx = PL.x - GOX, dz = PL.z - GOZ, lx = dx * GTF.c - dz * GTF.s, lz = dx * GTF.s + dz * GTF.c; return lx > GX0 && lx < GX1 && lz > GZ0 && lz < GZ1; })()) s = '風雨球場';
  if (s === '校園戶外' && Math.hypot((PL.x - TX) / TR, (PL.z - TZ) / (TS + TR)) < 1) s = '操場';
  if (s === '校園戶外') { const d = pdist(PL.x, PL.z); if (d > PWALK - 14) s = '海灘'; else if (d > 112) s = '校外草原'; }
  hereName = s;
  const fl = Math.round(PL.y / H) + 1;
  $('where').textContent = `${s}${id ? ' · ' + fl + ' 樓' : ''}`;
}

function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

function moveStep(f, s, sp, len) {
  sphUp(PL.x, PL.z, _U); _R.crossVectors(cam.fw, _U);
  _W.copy(cam.fw).multiplyScalar(f / Math.max(1, len) * sp).addScaledVector(_R, s / Math.max(1, len) * sp);
  sphUnJac(PL.x, PL.z, _W, _fa);
  PL.ix = _fa[0]; PL.iz = _fa[1];                                                  // 本幀「想走」的方向（供朝向使用，不受碰撞滑動影響）
  if (!blocked(PL.x + _fa[0], PL.z, PL.y, true)) PL.x += _fa[0];
  if (!blocked(PL.x, PL.z + _fa[1], PL.y, true)) PL.z += _fa[1];
  const d = pdist(PL.x, PL.z);                                  // 海岸邊界：沿圓周順著滑，不來回抖
  if (d > PWALK - 0.01) { const k = (PWALK - 0.01) / d; PL.x = PC.x + (PL.x - PC.x) * k; PL.z = PC.z + (PL.z - PC.z) * k; }
  fwTransport();
}
let indoorT = 0;
function charScale() { return Math.min(11, Math.max(1, 1 + (cam.curD - 10) / 12)); }
function camUpdate(dt) {
  indoorT -= dt; if (indoorT <= 0) { indoorT = 0.12; cam.indoorTarget = playerBld() !== null && PL.y < 12 ? 1 : 0; }
  cam.indoor += ((cam.indoorTarget || 0) - cam.indoor) * (1 - Math.exp(-dt * 6));
  const wantD = cam.d * (1 - cam.indoor) + 0.02 * cam.indoor; cam.curD += (wantD - cam.curD) * (1 - Math.exp(-dt * 10));
  sph(PL.x, PL.y, PL.z, _P); sphUp(PL.x, PL.z, _U);
  const fpv = Math.max(0, Math.min(1, 1 - cam.curD / 1.6)), eff = cam.elev * (1 - cam.indoor) + (cam.elev - 0.42) * 0.9 * cam.indoor;
  _T.copy(_P).addScaledVector(_U, 1.25 + 0.3 * fpv);                                    // 目標：胸口／眼睛
  const ce = Math.cos(eff), se = Math.sin(eff);
  _D.copy(cam.fw).multiplyScalar(ce).addScaledVector(_U, -se);                           // 視線方向
  camera.position.copy(_T).addScaledVector(_D, -cam.curD);
  camera.up.copy(_U); camera.lookAt(_P.copy(camera.position).addScaledVector(_D, 10));
  const near = Math.max(0.1, Math.min(2.5, cam.curD * 0.03)); if (Math.abs(camera.near - near) > 0.02) { camera.near = near; camera.updateProjectionMatrix(); }
  avatar.visible = cam.curD > 1.1; avatar.scale.setScalar(charScale());
}

let last = performance.now(), mAcc = 0, sunAcc = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const blockIn = GAME.block;
  const f0 = blockIn ? 0 : axisKey('KeyW', 'ArrowUp', 'KeyS', 'ArrowDown') - joy.ly;
  const s0 = blockIn ? 0 : axisKey('KeyD', 'KeyD', 'KeyA', 'KeyA') + joy.lx;
  const AU = autoStep(dt, f0, s0);                            // 自動前往（part7）
  if (AU) fwFromYaw();
  else {
    fwRotate(((keys.ArrowLeft ? 1 : 0) - (keys.ArrowRight ? 1 : 0)) * 1.8 * dt - joy.rx * 2.2 * dt);
    cam.elev = Math.max(0.02, Math.min(1.5, cam.elev + joy.ry * 1.2 * dt));
  }
  const f = AU ? AU.f : f0, s = AU ? AU.s : s0;
  const sp = (AU ? AU.sp : keys.ShiftLeft || keys.ShiftRight || joy.run ? 6.5 : 3.4) * dt, len = Math.hypot(f, s) || 1;
  PL.want = (f || s) ? Math.min(1, len) * sp / Math.max(dt, 1e-3) : 0;
  if (f || s) moveStep(f, s, sp, len);
  const g = groundAt(PL.x, PL.y, PL.z);
  if (!blockIn && keys.Space && PL.vy === 0 && PL.y <= g + 0.06) PL.vy = 6.2;
  PL.vy -= 18 * dt; PL.y += PL.vy * dt;
  if (PL.y <= g) { PL.y = g; PL.vy = 0; } else if (PL.y < -20) { PL.y = 0.1; PL.vy = 0; }
  if (!AU) yawFromFw();
  avatar.position.set(PL.x, PL.y, PL.z);
  camUpdate(dt);
  charTick(dt);
  if (typeof gameTick === 'function') gameTick(dt);
  mAcc += dt; if (mAcc > 0.1) { mAcc = 0; drawMini(); whereText(); }
  skyTick(PL.x, PL.y, PL.z);
  sph(PL.x, PL.y + 2.4, PL.z, lamp.position); lamp.intensity = GT.night ? 1.0 : 0;
  planetSwapIn(); renderer.render(scene, camera); planetSwapOut();
}
scene.updateMatrixWorld(true);
$('loading').hidden = true;
renderer.setAnimationLoop(frame);
window.__school = { camera, frameQuat, sph, sphFace, fwFromYaw, sphUp, PC, moveStep, yawFromFw, scene, PL, teleport, cam, GAME, GT };
if (touchDev) setTimeout(() => { try { if (!localStorage.getItem('tongle_tip')) { localStorage.setItem('tongle_tip', '1'); toast('單指拖曳＝轉視角　雙指捏合＝縮放　雙指扭轉＝旋轉', 5000); } } catch (e) { } }, 9000);
