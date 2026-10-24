/* ===== 遊戲傳送門（v37）：把橫向卷軸、垂直卷軸兩個小遊戲接進小行星 =====
   傳送門在小舖南側。按 E 選擇遊戲 → 以全螢幕視窗(iframe)開啟 games/ 內的遊戲。
   遊戲透過 postMessage 回報：tongle:close（回小行星）、tongle:result（結果→gpReward 發同樂幣／道具並存檔，第二階段）。 */
const GP = { x: 14.5, z: 12.5, t: 0, ring: null, disc: null, runes: [], last: null, label: '' };
(function () {
  const g = new T.Group(), glow = c => new T.MeshBasicMaterial({ color: c });
  g.add(cym(1.9, 2.1, 0.18, 0, 0.09, 0, 0x4b3f7a, 28), cym(1.5, 1.7, 0.1, 0, 0.22, 0, 0x6c5fb0, 28));
  [-1.55, 1.55].forEach(x => g.add(bxm(0.34, 2.9, 0.34, x, 1.65, 0, 0x7a6cc4), spm(0.28, x, 3.2, 0, 0xffe27a)));
  const ring = new T.Mesh(new T.TorusGeometry(1.55, 0.14, 10, 40), glow(0x9fe8ff)); ring.position.y = 1.95; g.add(ring);
  const disc = new T.Mesh(new T.CircleGeometry(1.42, 36), new T.MeshBasicMaterial({ color: 0x7a6bff, transparent: true, opacity: 0.55, side: T.DoubleSide, depthWrite: false }));
  disc.position.y = 1.95; g.add(disc);
  for (let i = 0; i < 6; i++) { const s = spm(0.1, 0, 0, 0, i % 2 ? 0xffe27a : 0xffffff); s.material = glow(i % 2 ? 0xffe27a : 0xffffff); g.add(s); GP.runes.push(s); }
  const sign = new T.Mesh(new T.PlaneGeometry(2.8, 0.7), new T.MeshBasicMaterial({ map: canvasTex(320, 80, (c, w, h) => { c.fillStyle = '#1b2550'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffd166'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = '#ffd166'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('遊戲傳送門', w / 2, h / 2 + 2); }) }));
  sign.position.set(0, 3.95, 0.05); g.add(sign);
  placeOnPlanet(g, GP.x, GP.z, -Math.PI / 2); scene.add(g); g.traverse(o => { o.matrixAutoUpdate = true; });
  GP.ring = ring; GP.disc = disc; GP.g = g;
})();
// 目前版本對應的節慶（沒有對應就交給遊戲依日期自動選）
function gpTheme() { if (typeof bsFest === 'function' && FEST_THEME[bsFest()]) return FEST_THEME[bsFest()]; return ({ halloween: 'halloween', teacher: 'teacher', lunar: 'newyear' })[G.edition] || ''; }
function gpOpen(file, extra) {
  closePanels(); GP.last = null; const f = $('gmF');
  f.src = 'games/' + file + '?from=planet&embed=1' + (extra || ''); openPanel('gmp'); setTimeout(() => { try { f.focus(); } catch (e) {} }, 300);
}
// ---- 第二階段：獎勵與存檔 ----
// 首次通關：一次性獎勵；之後重玩：依分數給少量同樂幣，每天最多 5 次，避免一直刷。
function gpReward(r) {
  if (!r) return '';
  const gp = G.gp, today = new Date().toISOString().slice(0, 10); if (gp.day !== today) { gp.day = today; gp.n = 0; }
  const key = r.game === 'side' ? 'side' : 'shooter_' + (r.theme || 'x'), won = !!r.win, first = won && !gp.clear[key];
  const lines = []; let coins = 0;
  if (r.game === 'shooter') { const b = gp.best[key] || 0; if (r.score > b) { gp.best[key] = r.score; lines.push('新紀錄！最高分 ' + r.score); } else lines.push('分數 ' + r.score + '（最高 ' + b + '）'); }
  if (first) {
    gp.clear[key] = 1;
    if (r.game === 'side') { coins += 150 + 20 * Math.max(0, r.stars | 0); addItem('sapling', 1); lines.push('首次通關：樹苗 ×1'); }
    else { coins += 200; if (r.theme === 'halloween') { addItem('candy', 3); lines.push('首次通關：萬聖節糖果 ×3'); } else lines.push('首次通關獎勵'); }
  } else if (gp.n < 5) {
    gp.n++; coins += r.game === 'side' ? (won ? 40 : 0) : Math.min(60, Math.floor((r.score | 0) / 100) + (won ? 20 : 0));
    if (!coins) lines.push('這次沒有獎勵，再接再厲！'); else lines.push('今天第 ' + gp.n + '/5 次重玩獎勵');
  } else lines.push('今天的重玩獎勵已領完，明天再來！');
  if (coins) { addCoins(coins); lines.unshift('同樂幣 +' + coins); }
  saveGame(); return lines.join('\n');
}
async function gpClose() {
  if ($('gmp').hidden) return; closePanels(); const r = GP.last; GP.last = null;
  if (!r) { toast('已回到同樂小行星'); return; }
  const head = r.game === 'side' ? (r.win ? '橫向卷軸：任務完成！' : '橫向卷軸') : '垂直卷軸：' + (r.win ? '守護成功！' : '再接再厲！');
  let txt = head + '\n' + gpReward(r);
  const dmg = r.game === 'side' ? (r.win ? 150 + 50 * Math.max(0, r.stars | 0) : 0) : Math.min(3000, Math.floor((r.score | 0) / 10) + (r.win ? 300 : 0));
  if (dmg > 0 && typeof bsHit === 'function' && bsLive()) {                       // 第三階段：把傷害加進全班 Boss
    const name = BS.st.boss_name, b = await bsHit(dmg);
    if (b && b.ok) txt += '\n\n對「' + name + '」造成 ' + b.dmg + ' 傷害' + (BS.mode === 'demo' ? '（示範）' : '') + '，全班 Boss 剩 ' + bsPct() + '%' + (BS.st.boss_hp <= 0 ? '\n全班打倒 Boss 了！到傳送門領討伐獎勵' : '');
    else if (b && b.err === 'login') txt += '\n\n登入多人版才能把傷害加進全班 Boss。';
    else if (b && b.err === 'fast') txt += '\n\n距離上次出擊不到 20 秒，這次傷害沒有計入。';
    else txt += '\n\n連線失敗，傷害沒有計入。';
  }
  openDlg('遊戲傳送門', txt, [{ t: '收下獎勵', go: true, fn: closePanels }]);
}
function gpTalk() {
  const th = gpTheme(), nm = { halloween: '萬聖節', teacher: '教師節', dragon: '端午節', newyear: '農曆春節' }[th];
  openDlg('遊戲傳送門', '傳送門連到同樂國小的另一個維度。' + (nm ? '\n現在是' + nm + '，節慶版的校園正需要幫忙！' : '\n想去哪裡冒險？'), [
    { t: '橫向卷軸：教學區西樓大冒險', go: true, fn: () => gpOpen('side_scroller.html') },
    { t: '垂直卷軸：保衛校園' + (nm ? '（' + nm + '）' : ''), go: true, fn: () => gpOpen('shooter.html', th ? '&theme=' + th : '') },
    { t: '遊戲館選單', fn: () => gpOpen('index.html') },
    ...(typeof bsLive === 'function' && bsLive() ? [{ t: '全班共同 Boss：' + BS.st.boss_name + ' ' + bsPct() + '%', go: true, fn: () => bsPanel() }] : []),
    { t: '先不要', fn: closePanels }]);
}
function gtInteract(cand, ds) { const d = ds(GP.x, GP.z, 0); if (d < 3.6) cand(d, '進入遊戲傳送門', gpTalk); }
function gtMini(g, mp) { const p = mp(GP.x, GP.z); g.fillStyle = '#7a6bff'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(p[0], p[1], 6, 0, 7); g.fill(); g.stroke(); }
function gtTick(dt) {
  GP.t += dt; const t = GP.t;
  if (GP.ring) { GP.ring.rotation.z = t * 0.6; GP.disc.material.opacity = 0.45 + Math.sin(t * 2) * 0.12; GP.disc.rotation.z = -t * 0.9; }
  GP.runes.forEach((s, i) => { const a = t * 0.8 + i * Math.PI / 3; s.position.set(Math.cos(a) * 1.55, 1.95 + Math.sin(a) * 1.55, 0.05); });
  const f = $('gmF'); if ($('gmp').hidden && f.getAttribute('src')) { f.removeAttribute('src'); }   // 關閉後停止遊戲
}
addEventListener('message', e => {
  const f = $('gmF'); if (!f || e.source !== f.contentWindow) return; const d = e.data; if (!d || d.source !== 'tongle-games') return;
  if (d.type === 'tongle:close') gpClose(); else if (d.type === 'tongle:result') GP.last = d;
});
$('gmX').onclick = gpClose;
window.__gp = { GP, gpReward, gpOpen, gpClose, gpTalk };
