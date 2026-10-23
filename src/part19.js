// ===== 校園教職員：6 位自動走動的骨架角色（頭大身小、露出手臂） =====
const STF = { built: false, t: 0, list: [] };
const STF_DEF = [
  { id: 'ting', name: '霆霆校長', role: '校長', kind: 'boy', h: 1.5, home: '梅花廣場', off: [4, 5], col: '#ffe08a', sp: 0.9, R: 9,
    c: { skin: 0xf2c9a4, hair: 0x2a2220, 'school-shirt': 0x27406b, 'school-shorts': 0x2c3342, collar: 0xffffff, shoes: 0x2a2020 }, acc: 'tie',
    lines: ['歡迎來到同樂！這裡的每一位孩子，都是校園裡最亮的星星。', '走一走、看一看，校園裡藏著很多有趣的角落喔。', '遇到困難別擔心，老師和同學都會幫你。'] },
  { id: 'ye', name: 'YAYA主任', role: '主任', kind: 'boy', h: 1.45, home: '校門', off: [3, 6], col: '#9fd0ff', sp: 1.0, R: 9,
    c: { skin: 0xeeba94, hair: 0x7a4a28, 'school-shirt': 0x9a6338, 'school-shorts': 0x7a4a28, collar: 0xf0d9b0, shoes: 0x5a3418 }, acc: 'bear',
    lines: ['我是YAYA主任～穿著熊熊裝，抱一下就不怕啦！', '校園安全最重要，進出校門請放慢腳步喔。', '今天的行政事務滿滿，不過看到你們精神好，就有力氣了。'] },
  { id: 'qi', name: '琪琪主任', role: '主任', kind: 'girl', h: 1.42, home: '集合場', off: [3, -4], col: '#ffc0d8', sp: 1.0, R: 9,
    c: { skin: 0xf6d2b0, hair: 0x4a2c20, 'school-shirt': 0xc0506a, 'school-shorts': 0x4a3a46, collar: 0xffffff, shoes: 0x5a2a30, 'hair-band': 0xf2c230 }, acc: 'bun',
    lines: ['活動前先熱身，運動才不會受傷。', '集合的時候要快、靜、齊，今天的隊伍看起來很棒！', '記得多喝水，補充水分很重要。'] },
  { id: 'yan', name: '彥彥組長', role: '組長', kind: 'boy', h: 1.45, home: '操場', off: [-4, 7], col: '#9fe8b0', sp: 1.15, R: 11,
    c: { skin: 0xe8b48c, hair: 0x201a16, 'school-shirt': 0x2a5fc0, 'school-shorts': 0xf4f4f4, collar: 0xe03a2c, shoes: 0xf0f0f0 }, acc: 'pe',
    lines: ['跑操場前先暖身，一起來動一動吧！', '運動不是比誰快，是比誰願意持續。', '想挑戰操場跑道嗎？我幫你計時！'] },
  { id: 'min', name: '敏敏老師', role: '老師', kind: 'girl', h: 1.38, home: '涼亭・遊戲區', off: [4, 3], col: '#ffd9a0', sp: 0.9, R: 8,
    c: { skin: 0xf4cfae, hair: 0x2c1f1a, 'school-shirt': 0xe8935a, 'school-shorts': 0x5a4636, collar: 0xffffff, shoes: 0x7a4a2a, 'hair-band': 0xffffff }, acc: 'book',
    lines: ['你看過今天的課表了嗎？好好把握學習的時間。', '好奇心是最棒的老師，有問題就大膽問！', '我最喜歡看到孩子們發現新東西的表情。'] },
  { id: 'ning', name: '寧寧老師', role: '老師', kind: 'girl', h: 1.38, home: '風雨球場', off: [5, 5], col: '#d9c0ff', sp: 1.0, R: 9,
    c: { skin: 0xf2c9a4, hair: 0x3a2a3a, 'school-shirt': 0x8a6cc8, 'school-shorts': 0x3c3a5a, collar: 0xffffff, shoes: 0x3a2a4a, 'hair-band': 0xff9ac0 }, acc: 'flower',
    lines: ['下課時間到球場玩，記得注意安全喔。', '合作比競爭更有趣，找朋友一起玩吧！', '今天也要笑一個，心情會變好～'] }
];
async function stfBuild() {
  if (STF.built) return; const pl = n => NPLACES.find(p => p.name === n && !p.room); if (!pl('梅花廣場') || !pl('操場')) return; STF.built = true; hwGeos();
  const root = STF.root = new T.Group(); scene.add(root); const A = { boy: await loadGLB('boy'), girl: await loadGLB('girl') };
  STF_DEF.forEach(D => {
    const p = pl(D.home) || pl('梅花廣場'), q = hwFindOpen(p.x + D.off[0], p.z + D.off[1]), g = new T.Group(); g.position.set(q[0], q[2], q[1]); root.add(g); dynAdd(g);
    const ch = pxMake(A, D.kind, D.h, D.c), { r, cy } = pxHead(ch), G = new T.Group(), H = D.h;
    if (D.acc === 'glasses') { const m = new T.TorusGeometry(0.3 * r, 0.05 * r, 6, 12), a = pxM2(m, 0x202028, -0.38 * r, cy + 0.1 * r, -0.98 * r), b = a.clone(); b.position.x = 0.38 * r; G.add(a, b, pxM2(new T.BoxGeometry(0.4 * r, 0.05 * r, 0.05 * r), 0x202028, 0, cy + 0.1 * r, -0.98 * r)); }
    if (D.acc === 'bear') {                                                                           // 熊熊裝：熊耳、口鼻、鼻頭、尾巴
      [-1, 1].forEach(sx => { G.add(pxM2(new T.SphereGeometry(0.34 * r, 10, 8), 0x8a5230, sx * 0.72 * r, cy + 0.88 * r, 0.02 * r), pxM2(new T.SphereGeometry(0.2 * r, 8, 6), 0xf0c8a0, sx * 0.72 * r, cy + 0.88 * r, -0.2 * r)); });
      G.add(pxM2(new T.SphereGeometry(0.34 * r, 10, 8), 0xf0d9b0, 0, cy - 0.28 * r, -0.9 * r), pxM2(new T.SphereGeometry(0.11 * r, 8, 6), 0x2a1a14, 0, cy - 0.12 * r, -1.2 * r)); }
    if (D.acc === 'pe') {                                                                              // 體育老師：藍色運動帽
      G.add(pxM2(new T.SphereGeometry(1.08 * r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x1f4fa8, 0, cy + 0.15 * r, 0), pxM2(new T.CylinderGeometry(0.95 * r, 0.95 * r, 0.1 * r, 14, 1, false, Math.PI, Math.PI), 0xe03a2c, 0, cy + 0.2 * r, -0.62 * r)); }
    if (D.acc === 'bun') G.add(pxM2(new T.SphereGeometry(0.4 * r, 10, 8), D.c.hair, 0, cy + 0.95 * r, 0.1 * r));
    if (D.acc === 'flower') { G.add(pxM2(new T.SphereGeometry(0.2 * r, 8, 6), 0xff7aa8, 0.75 * r, cy + 0.65 * r, -0.2 * r), pxM2(new T.SphereGeometry(0.1 * r, 6, 4), 0xffe070, 0.75 * r, cy + 0.65 * r, -0.36 * r)); }
    if (G.children.length) addProp(ch, 'Head', G);
    const ny = ch.head ? ch.head.ny : 0.7 * H, B = new T.Group();
    if (D.acc === 'tie') B.add(pxM2(new T.BoxGeometry(0.035 * H, 0.14 * H, 0.012 * H), 0xc4202c, 0, ny * 0.62, -0.1 * H));
    if (D.acc === 'whistle' || D.acc === 'pe') B.add(pxM2(new T.CylinderGeometry(0.014 * H, 0.014 * H, 0.04 * H, 8), 0xe0e0e0, 0.015 * H, ny * 0.64, -0.1 * H));
    B.add(pxM2(new T.BoxGeometry(0.06 * H, 0.04 * H, 0.008 * H), 0xffffff, -0.05 * H, ny * 0.56, -0.102 * H));          // 名牌
    if (D.acc === 'book') { const bk = new T.Group(); bk.add(pxM2(new T.BoxGeometry(0.09 * H, 0.012 * H, 0.12 * H), 0x2f6fb0, 0, 0, 0), pxM2(new T.BoxGeometry(0.085 * H, 0.01 * H, 0.115 * H), 0xfdf6e0, 0, 0.011 * H, 0)); pxHand(ch, 'FistR', bk); }
    if (D.acc === 'bear') B.add(pxM2(new T.SphereGeometry(0.06 * H, 8, 6), 0xf0d9b0, 0, ny * 0.3, 0.12 * H));
    if (D.acc === 'pe') { const sw = new T.Group(); sw.add(pxM2(new T.CylinderGeometry(0.03 * H, 0.03 * H, 0.015 * H, 12), 0xd0d0d8, 0, 0, 0), pxM2(new T.SphereGeometry(0.008 * H, 6, 4), 0xe03a2c, 0, 0.012 * H, 0)); pxHand(ch, 'FistR', sw); }
    addProp(ch, 'Torso', B); pxPose(ch, [null, null]); g.add(ch.node);
    const lab = hwSprite(D.name, D.col); lab.position.set(0, H * 1.2 + 0.25, 0); g.add(lab);
    STF.list.push({ D, g, ch, lab, x: q[0], z: q[1], y: q[2], hx: q[0], hz: q[1], tx: q[0], tz: q[1], wait: 1 + Math.random() * 4, walking: false });
  });
  STF.ready = true; if (window.STY && STY.on && typeof styScan === 'function') styScan();
}
function stfTick(dt) {
  if (!STF.built) { if (typeof STARTED !== 'undefined' && STARTED && PWG.children.length) try { stfBuild().catch(e => console.warn('stf', e)); } catch (e) { STF.built = true; console.error(e); } return; }
  if (!STF.ready) return; STF.t += dt; const cs = charScale();
  STF.list.forEach(S => {
    const D = S.D, d = Math.hypot(S.x - PL.x, S.z - PL.z), near = d < 3.4 || (typeof anyPanel === 'function' && anyPanel() && d < 8);
    S.ch.mixer.update(dt); S.g.scale.setScalar(cs);
    if (near) { S.walking = false; S.g.rotation.y += angd(Math.atan2(PL.x - S.x, PL.z - S.z) + Math.PI, S.g.rotation.y) * Math.min(1, dt * 4); }
    else if (S.walking) { const dx = S.tx - S.x, dz = S.tz - S.z, L = Math.hypot(dx, dz), step = D.sp * dt;
      if (L < step + 0.05) { S.walking = false; S.wait = 2 + Math.random() * 5; }
      else { S.x += dx / L * step; S.z += dz / L * step; const gy = groundAt(S.x, S.y + 2.2, S.z); if (isFinite(gy)) S.y = gy; S.g.position.set(S.x, S.y, S.z); S.g.rotation.y += angd(Math.atan2(dx, dz) + Math.PI, S.g.rotation.y) * Math.min(1, dt * 6); } }
    else { S.wait -= dt; if (S.wait <= 0) { const a = Math.random() * 6.283, r = 2 + Math.random() * D.R * 0.7, o = hwFindOpen(S.hx + Math.cos(a) * r, S.hz + Math.sin(a) * r); if (Math.hypot(o[0] - S.hx, o[1] - S.hz) < D.R + 2) { S.tx = o[0]; S.tz = o[1]; S.walking = true; } else S.wait = 1; } }
    const w = S.walking && !near; play(S.ch, w ? 'Walk' : 'Idle', 0.2); if (w && S.ch.act.Walk) S.ch.act.Walk.timeScale = 0.75 * D.sp;
    S.lab.visible = d > 3.2 && d < 30 && cs < 4;
  });
}
function stfInteract(cand, ds) { if (!STF.ready) return; STF.list.forEach(S => { const d = ds(S.x, S.z, S.y); if (d < 3.4) cand(d, '和 ' + S.D.name + ' 說話', () => stfTalk(S)); }); }
function stfMini(g, mp) { if (!STF.ready) return; STF.list.forEach(S => { const p = mp(S.x, S.z); g.fillStyle = S.D.col; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(p[0], p[1], 3.8, 0, 7); g.fill(); g.stroke(); }); }
function stfTalk(S) {
  const D = S.D, done = () => closePanels(), pick = () => D.lines[Math.floor(Math.random() * D.lines.length)];
  const menu = first => openDlg(D.name + '（' + D.role + '）', first ? '（' + D.name + '笑著向你揮揮手：）\n\n「你好呀！」' : '「' + pick() + '」', [{ t: '再聊聊', go: true, fn: () => menu(false) }, { t: '謝謝，再見', fn: done }]);
  menu(true);
}
