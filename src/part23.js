// ===== 第一人稱視角（F 鍵切換）：滑鼠控制視線（指標鎖定）、WASD 相對視線移動、角色跟著視線轉向 =====
const FPM = { sens: 0.0023, hint: 0, btn: null, dot: null };
function fpLocked() { return document.pointerLockElement === renderer.domElement; }
function fpToggle(force) {
  const want = force === undefined ? !FPV.on : !!force; if (want === FPV.on) return;
  if (want) {
    if (typeof FLY !== 'undefined' && FLY.on) return;
    FPV.on = true; FPV.d0 = cam.d; FPV.e0 = cam.elev; cam.d = 0.02; cam.elev = 0.05;
    try { const p = renderer.domElement.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (e) { }
    toast('第一人稱：滑鼠轉視角，Esc 釋放滑鼠，F 切回', 3200);
  } else {
    FPV.on = false; FPV.lock = false; cam.d = Math.max(2.5, FPV.d0 || 7.5); cam.elev = Math.max(0.02, Math.min(1.5, FPV.e0 || 0.42));
    try { if (fpLocked()) document.exitPointerLock(); } catch (e) { }
  }
  if (FPM.dot) FPM.dot.style.display = FPV.on ? 'block' : 'none'; if (FPM.btn) FPM.btn.classList.toggle('on', FPV.on);
}
(function fpInit() {
  const st = document.createElement('style'); st.textContent = '#fpDot{position:fixed;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:rgba(255,255,255,.85);box-shadow:0 0 0 1.5px rgba(0,0,0,.55);z-index:6;pointer-events:none;display:none}';
  document.head.appendChild(st); const d = document.createElement('div'); d.id = 'fpDot'; document.body.appendChild(d); FPM.dot = d;
  const bo = document.getElementById('bOnline'); if (bo && bo.parentNode) { const b = document.createElement('button'); b.type = 'button'; b.id = 'bFp'; b.title = '第一人稱視角（快速鍵 F）'; b.textContent = '視角：第三人稱'; b.onclick = () => { if (STARTED && !GAME.block) fpToggle(); }; bo.parentNode.insertBefore(b, bo); FPM.btn = b; }
  addEventListener('keydown', e => { if (e.code !== 'KeyF' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return; const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return; if (!STARTED || (typeof anyPanel === 'function' && anyPanel()) || GAME.block) return; fpToggle(); });
  document.addEventListener('pointerlockchange', () => { FPV.lock = fpLocked(); });
  document.addEventListener('mousemove', e => { if (!FPV.on || !FPV.lock) return; fwRotate(-e.movementX * FPM.sens); cam.elev = Math.max(-1.45, Math.min(1.45, cam.elev + e.movementY * FPM.sens)); });
  renderer.domElement.addEventListener('pointerdown', e => { if (FPV.on && !FPV.lock && e.pointerType === 'mouse') { try { const p = renderer.domElement.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (x) { } } });
})();
function fpTick(dt) {
  if (FPM.btn) { const t = FPV.on ? '視角：第一人稱' : '視角：第三人稱'; if (FPM.btn.textContent !== t) FPM.btn.textContent = t; }
  if (!FPV.on) return;
  if ((typeof anyPanel === 'function' && anyPanel()) && FPV.lock) { try { document.exitPointerLock(); } catch (e) { } }
  if (typeof FLY !== 'undefined' && FLY.on) { fpToggle(false); return; }
  CH.face = PL.yaw; avatar.rotation.y = PL.yaw;
}
