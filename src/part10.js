/* ===== 星球視角：遠景標註（地點、人物名、你在這裡）＋開場鏡頭 ===== */
const LBL = { el: document.getElementById('lbls'), items: [], ready: false, v: new T.Vector3(), n: new T.Vector3(), p: new T.Vector3() };
function lblBuild() {
  const add = (txt, x, z, h, cls, key) => { const e = document.createElement('div'); e.className = 'lb ' + (cls || ''); e.textContent = txt; LBL.el.appendChild(e); LBL.items.push({ e, x, z, h, key, flat: true }); };
  NPLACES.filter(p => !p.room).forEach(p => add(p.name.replace(/（.*）/, ''), p.x, p.z, 4, 'pl'));
  add('同樂小舖', SHOP.x, SHOP.z, 4.5, 'pl');
  if (typeof GP !== 'undefined') add('遊戲傳送門', GP.x, GP.z, 4.6, 'pl');
  NPCS.forEach(n => { if (n.pname) { const e = document.createElement('div'); e.className = 'lb np'; e.textContent = n.pname; LBL.el.appendChild(e); LBL.items.push({ e, npc: n, h: 0, dyn: true }); } });
  const me = document.createElement('div'); me.className = 'lb me'; me.textContent = '▼ 你在這裡'; LBL.el.appendChild(me); LBL.items.push({ e: me, me: true, h: 0, dyn: true });
  LBL.ready = true;
}
function lblTick() {
  if (!LBL.ready) { if (NPCS.length) lblBuild(); else return; }
  const k = Math.max(0, Math.min(1, (cam.curD - 18) / 30)); LBL.el.style.opacity = k;
  if (k <= 0.01) { if (LBL.on) { LBL.el.style.display = 'none'; LBL.on = false; } return; }
  if (!LBL.on) { LBL.el.style.display = 'block'; LBL.on = true; }
  const W = innerWidth, H = innerHeight, cs = charScale();
  for (const it of LBL.items) {
    let x, z, h;
    if (it.me) { x = PL.x; z = PL.z; h = 1.7 * cs + 0.8; } else if (it.npc) { x = it.npc.x; z = it.npc.z; h = it.npc.h * cs + 0.8; } else { x = it.x; z = it.z; h = it.h; }
    sph(x, h, z, LBL.p); sphUp(x, z, LBL.n); LBL.v.copy(camera.position).sub(LBL.p);
    let show = LBL.n.dot(LBL.v) > 0;
    if (show) { LBL.p.project(camera); show = LBL.p.z < 1 && Math.abs(LBL.p.x) < 1.05 && Math.abs(LBL.p.y) < 1.05; }
    if (!show) { if (it.vis) { it.e.style.display = 'none'; it.vis = false; } continue; }
    if (!it.vis) { it.e.style.display = 'block'; it.vis = true; }
    it.e.style.transform = 'translate(-50%,-100%) translate(' + ((LBL.p.x + 1) / 2 * W).toFixed(1) + 'px,' + ((1 - LBL.p.y) / 2 * H).toFixed(1) + 'px)';
  }
}
// 開場：先從遠處看整顆星球（人物放大），再飛向校門口
const FLY = { on: false, t: 0, exp: 0 };
(function () { cam.d = cam.curD = 170; cam.elev = 1.0; })();
function flyStart() { FLY.on = true; FLY.t = 0; FLY.exp = cam.d; }
function flyTick(dt) {
  if (!FLY.on) return;
  if (Math.abs(cam.d - FLY.exp) > 0.01) { FLY.on = false; return; }      // 使用者自己滾輪就停止
  FLY.t += dt; const u = Math.min(1, Math.max(0, (FLY.t - 1.2) / 4.5)), e = u * u * (3 - 2 * u);
  cam.d = FLY.exp = 170 + (9 - 170) * e; cam.elev = 1.0 + (0.42 - 1.0) * e; if (u >= 1) FLY.on = false;
}
