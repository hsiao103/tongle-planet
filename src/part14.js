/* ===== 聖誕節限定版：聖誕樹與彩燈、飄雪、禮物與薑餅人、雪人／聖誕老公公／小麋鹿三關問答、接禮物小遊戲 ===== */
window.XM = { on: false, k: 0, tint: new T.Color(0x4a78b8), root: null, built: false, mons: [], gifts: [], cookies: [], trees: [], snow: null, t: 0, chk: 0, bl: 0 };
const XMM = {
  green: new T.MeshLambertMaterial({ color: 0x2f8a4a }), trunk: new T.MeshLambertMaterial({ color: 0x7a4a2a }), red: new T.MeshLambertMaterial({ color: 0xd8303c }),
  white: new T.MeshLambertMaterial({ color: 0xffffff }), gold: new T.MeshLambertMaterial({ color: 0xf2c230 }), star: new T.MeshBasicMaterial({ color: 0xffe066 }),
  carrot: new T.MeshLambertMaterial({ color: 0xf28a1c }), dark: new T.MeshBasicMaterial({ color: 0x20243a }), brown: new T.MeshLambertMaterial({ color: 0x9a6a3c }),
  skin: new T.MeshLambertMaterial({ color: 0xf6d2b0 }), gb: new T.MeshLambertMaterial({ color: 0xb9733a }), nose: new T.MeshBasicMaterial({ color: 0xff3b3b }),
  belt: new T.MeshLambertMaterial({ color: 0x2a2630 }), snowcap: new T.MeshLambertMaterial({ color: 0xf6f9fd }), icing: new T.MeshBasicMaterial({ color: 0xfff6e6 }),
  gift: [0xd8404f, 0x3a8fe0, 0x3fb86a, 0xb06ad8].map(c => new T.MeshLambertMaterial({ color: c })),
  lt: [[0xff4d4d, 0x5a1c1c], [0xffd23a, 0x5a4a14], [0x4dd2ff, 0x163a4a], [0x7dff6b, 0x1c4a18]].map(a => new T.MeshBasicMaterial({ color: a[0] }))
};
const XG = {};
function xmGeos() {
  if (XG.tree) return;
  const cone = (r, h, y) => [new T.ConeGeometry(r, h, 10), hwM4(0, y, 0, 1)];
  XG.trunk = hwMerge([[new T.CylinderGeometry(0.13, 0.17, 0.55, 8), hwM4(0, 0.27, 0, 1)]]);
  XG.tree = hwMerge([cone(1.0, 1.25, 1.05), cone(0.78, 1.1, 1.75), cone(0.55, 1.0, 2.4)]);
  XG.star = hwMerge([[new T.IcosahedronGeometry(0.18, 0), hwM4(0, 3.0, 0, 1, 1.2, 1)]]);
  const L = [[], [], [], []]; [[0.62, 0.62, 7], [0.5, 1.28, 6], [0.36, 1.95, 5]].forEach(([r, y, n], ti) => { for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + ti * 0.7; L[(i + ti) % 4].push([new T.SphereGeometry(0.075, 6, 4), hwM4(Math.cos(a) * r, y + 0.02, Math.sin(a) * r, 1)]); } });
  XG.lights = L.map(a => hwMerge(a));
  XG.gbody = new T.BoxGeometry(0.5, 0.4, 0.5); XG.gbody.translate(0, 0.2, 0);
  XG.gribbon = hwMerge([[new T.BoxGeometry(0.54, 0.43, 0.1), hwM4(0, 0.2, 0, 1)], [new T.BoxGeometry(0.1, 0.43, 0.54), hwM4(0, 0.2, 0, 1)], [new T.SphereGeometry(0.1, 8, 6), hwM4(0, 0.46, 0, 1, 0.7, 1)]]);
  XG.snowman = hwMerge([[new T.SphereGeometry(0.5, 16, 12), hwM4(0, 0.5, 0, 1)], [new T.SphereGeometry(0.38, 16, 12), hwM4(0, 1.1, 0, 1)], [new T.SphereGeometry(0.28, 14, 10), hwM4(0, 1.58, 0, 1)]]);
  XG.sm = hwMerge([[new T.ConeGeometry(0.06, 0.34, 6), hwM4(0, 1.56, 0.32, 1, 1, 1, 0, Math.PI / 2)]]);
  XG.smDark = hwMerge([[new T.SphereGeometry(0.035, 6, 4), hwM4(-0.1, 1.64, 0.25, 1)], [new T.SphereGeometry(0.035, 6, 4), hwM4(0.1, 1.64, 0.25, 1)], [new T.SphereGeometry(0.04, 6, 4), hwM4(0, 1.15, 0.37, 1)], [new T.SphereGeometry(0.04, 6, 4), hwM4(0, 0.95, 0.43, 1)], [new T.CylinderGeometry(0.2, 0.2, 0.3, 10), hwM4(0, 1.95, 0, 1)], [new T.CylinderGeometry(0.32, 0.32, 0.04, 12), hwM4(0, 1.8, 0, 1)]]);
  XG.smRed = hwMerge([[new T.TorusGeometry(0.27, 0.07, 6, 14), hwM4(0, 1.36, 0, 1, 1, 1, 0, Math.PI / 2)], [new T.BoxGeometry(0.1, 0.3, 0.07), hwM4(0.15, 1.2, 0.27, 1, 1, 1, 0, 0, 0.2)]]);
  XG.cookie = hwMerge([[new T.SphereGeometry(0.22, 12, 8), hwM4(0, 0.42, 0, 1, 1.25, 0.4)], [new T.SphereGeometry(0.17, 12, 8), hwM4(0, 0.78, 0, 1, 1, 0.45)], [new T.SphereGeometry(0.075, 8, 6), hwM4(-0.28, 0.5, 0, 1, 1.5, 0.5, 0, 0, 0.9)], [new T.SphereGeometry(0.075, 8, 6), hwM4(0.28, 0.5, 0, 1, 1.5, 0.5, 0, 0, -0.9)], [new T.SphereGeometry(0.08, 8, 6), hwM4(-0.1, 0.12, 0, 1, 1.6, 0.5)], [new T.SphereGeometry(0.08, 8, 6), hwM4(0.1, 0.12, 0, 1, 1.6, 0.5)]]);
  XG.cookieDot = hwMerge([[new T.SphereGeometry(0.03, 6, 4), hwM4(-0.06, 0.82, 0.08, 1)], [new T.SphereGeometry(0.03, 6, 4), hwM4(0.06, 0.82, 0.08, 1)], [new T.SphereGeometry(0.035, 6, 4), hwM4(0, 0.5, 0.09, 1)], [new T.SphereGeometry(0.035, 6, 4), hwM4(0, 0.38, 0.09, 1)], [new T.SphereGeometry(0.035, 6, 4), hwM4(0, 0.26, 0.09, 1)]]);
}
function xmTree(sc) {
  const g = new T.Group(); hwMesh(XG.trunk, XMM.trunk, g); hwMesh(XG.tree, XMM.green, g); hwMesh(XG.star, XMM.star, g); XG.lights.forEach((l, i) => hwMesh(l, XMM.lt[i], g)); g.scale.setScalar(sc); g.userData.sc = sc; return g;
}
function xmGift() { const g = new T.Group(); hwMesh(XG.gbody, XMM.gift[(rr() * 4) | 0], g); hwMesh(XG.gribbon, XMM.gold, g); return g; }
function xmCookie() { const g = new T.Group(); hwMesh(XG.cookie, XMM.gb, g); hwMesh(XG.cookieDot, XMM.icing, g); return g; }
function xmSnowman(sc) { const g = new T.Group(); hwMesh(XG.snowman, XMM.white, g); hwMesh(XG.sm, XMM.carrot, g); hwMesh(XG.smDark, XMM.dark, g); hwMesh(XG.smRed, XMM.red, g); g.userData.sc = sc; g.scale.setScalar(sc); return g; }
// ---- 三位會說話的角色 ----
function xmChar(kind) {
  const g = new T.Group(), body = new T.Group(); g.add(body); g.userData.body = body;
  if (kind === 'snow') { const s = xmSnowman(1.15); body.add(s); s.scale.setScalar(1); }
  else if (kind === 'santa') {
    hwMesh(hwMerge([[new T.SphereGeometry(0.56, 16, 12), hwM4(0, 0.62, 0, 1, 1.15, 1)], [new T.SphereGeometry(0.1, 8, 6), hwM4(-0.2, 0.08, 0.1, 1, 0.8, 1.3)], [new T.SphereGeometry(0.1, 8, 6), hwM4(0.2, 0.08, 0.1, 1, 0.8, 1.3)]]), XMM.red, body);
    hwMesh(hwMerge([[new T.TorusGeometry(0.5, 0.06, 6, 18), hwM4(0, 0.6, 0, 1, 1, 1, 0, Math.PI / 2)]]), XMM.belt, body);
    hwMesh(hwMerge([[new T.SphereGeometry(0.28, 14, 10), hwM4(0, 1.42, 0, 1)]]), XMM.skin, body);
    hwMesh(hwMerge([[new T.SphereGeometry(0.27, 12, 8), hwM4(0, 1.2, 0.14, 1, 0.85, 0.8)], [new T.SphereGeometry(0.09, 8, 6), hwM4(0, 1.97, -0.12, 1)], [new T.TorusGeometry(0.28, 0.07, 6, 14), hwM4(0, 1.58, 0, 1, 1, 1, 0, Math.PI / 2)]]), XMM.white, body);
    hwMesh(hwMerge([[new T.ConeGeometry(0.3, 0.55, 10), hwM4(0, 1.88, 0, 1, 1, 1, 0, 0.15)]]), XMM.red, body);
    hwMesh(hwMerge([[new T.SphereGeometry(0.035, 6, 4), hwM4(-0.1, 1.46, 0.25, 1)], [new T.SphereGeometry(0.035, 6, 4), hwM4(0.1, 1.46, 0.25, 1)]]), XMM.dark, body);
  } else {
    hwMesh(hwMerge([[new T.SphereGeometry(0.5, 14, 10), hwM4(0, 0.78, 0, 1.15, 0.85, 1.4)], [new T.SphereGeometry(0.3, 12, 10), hwM4(0, 1.45, 0.6, 1)], [new T.CylinderGeometry(0.07, 0.07, 0.62, 6), hwM4(-0.28, 0.3, 0.45, 1)], [new T.CylinderGeometry(0.07, 0.07, 0.62, 6), hwM4(0.28, 0.3, 0.45, 1)], [new T.CylinderGeometry(0.07, 0.07, 0.62, 6), hwM4(-0.28, 0.3, -0.45, 1)], [new T.CylinderGeometry(0.07, 0.07, 0.62, 6), hwM4(0.28, 0.3, -0.45, 1)],
      [new T.CylinderGeometry(0.035, 0.035, 0.5, 5), hwM4(-0.17, 1.82, 0.55, 1, 1, 1, 0, 0, 0.5)], [new T.CylinderGeometry(0.035, 0.035, 0.5, 5), hwM4(0.17, 1.82, 0.55, 1, 1, 1, 0, 0, -0.5)], [new T.SphereGeometry(0.08, 6, 4), hwM4(0, 0.86, -0.7, 1)]]), XMM.brown, body);
    hwMesh(hwMerge([[new T.SphereGeometry(0.1, 8, 6), hwM4(0, 1.4, 0.88, 1)]]), XMM.nose, body);
    hwMesh(hwMerge([[new T.SphereGeometry(0.04, 6, 4), hwM4(-0.12, 1.55, 0.84, 1)], [new T.SphereGeometry(0.04, 6, 4), hwM4(0.12, 1.55, 0.84, 1)]]), XMM.dark, body);
    hwMesh(hwMerge([[new T.TorusGeometry(0.3, 0.06, 6, 14), hwM4(0, 1.2, 0.58, 1, 1, 1, 0, Math.PI / 2.2)]]), XMM.red, body);
  }
  return g;
}
const XMCH = [
  { id: 'snow', name: '雪人小白', at: ['梅花廣場', 6, 4], col: '#9fd8ff', kind: 'snow',
    intro: '（雪人小白搓著圓圓的手：）\n\n「好冷好冷！可是我一點也不怕冷。你呢？回答我兩個問題，我就送你聖誕拐杖糖。」',
    steps: [{ t: '天氣很冷，出門前要怎麼穿才對？', ok: '一層一層穿，外面再加外套、圍巾和帽子', bad: ['只穿短袖，跑一跑就會熱', '全部脫掉，讓身體自己習慣'], no: '雪人皺眉：「這樣會著涼喔！再想一想。」' },
      { t: '同學感冒、一直咳嗽，你可以怎麼做？', ok: '提醒他戴口罩、多喝水，也記得勤洗手', bad: ['靠過去跟他一起玩，不要洗手', '大聲取笑他的咳嗽聲'], no: '雪人搖搖頭：「這樣不是關心人的方法。」' }],
    win: '雪人小白開心地轉了一圈：「對！保暖又關心別人，你就是冬天的小英雄！」', again: '雪人小白：「今天也要穿暖暖喔，不要忘了圍巾！」' },
  { id: 'santa', name: '聖誕老公公', at: ['集合場', -5, 4], col: '#ff9a9a', kind: 'santa',
    intro: '（聖誕老公公拍拍他的大口袋：）\n\n「呵呵呵，我的禮物袋好像少了幾個，幫我回答問題，我就知道你是不是個好孩子。」',
    steps: [{ t: '聖誕節是每年的哪一天？', ok: '12 月 25 日', bad: ['1 月 1 日', '10 月 31 日'], no: '「呵呵，那天不是喔，再想想看。」' },
      { t: '聖誕老公公送禮物，最重要的精神是什麼？', ok: '分享、關心別人，讓大家都開心', bad: ['比誰收到的禮物最多', '只把禮物留給自己'], no: '「呵呵呵……送禮物的重點不在這裡喔。」' }],
    win: '聖誕老公公笑得鬍子都在抖：「分享就是最好的禮物！這袋給你，要記得也分給別人喔。」', again: '聖誕老公公：「呵呵呵，聖誕快樂！今年你是個好孩子。」' },
  { id: 'deer', name: '小麋鹿', at: ['涼亭・遊戲區', 2, 3], col: '#e0b078', kind: 'deer',
    intro: '（小麋鹿的紅鼻子一閃一閃：）\n\n「我是拉雪橇的小麋鹿！先考考你，答對了我就載你去撿禮物。」',
    steps: [{ t: '聖誕老公公的雪橇是誰拉的？', ok: '麋鹿', bad: ['小綿羊', '大水牛'], no: '小麋鹿鼓著臉：「是我們啦！再猜一次。」' },
      { t: '聖誕節常見的顏色是哪三種？', ok: '紅色、綠色、白色', bad: ['黑色、灰色、咖啡色', '紫色、粉紅色、橘色'], no: '小麋鹿搖搖耳朵：「想想聖誕樹和聖誕帽的顏色。」' }],
    win: '小麋鹿的紅鼻子亮得像小燈泡：「答對囉！雪橇準備好了，禮物就交給你囉。」', again: '小麋鹿甩甩尾巴：「聖誕夜我會很忙，現在先讓我休息一下。」' }
];
const xmDone = () => XMCH.filter(m => G.xm && G.xm.done[m.id]).length;
function xmBuild() {
  if (XM.built) return; XM.built = true; xmGeos(); hwGeos(); const root = XM.root = new T.Group(); scene.add(root);
  const pl = n => NPLACES.find(p => p.name === n && !p.room), put = (g, s, hy) => { const p = pl(s[0]); if (!p) return null; const q = hwFindOpen(p.x + s[1], p.z + s[2]); g.position.set(q[0], q[2] + (hy || 0), q[1]); root.add(g); dynAdd(g); return q; };
  // 大聖誕樹 3 棵（第一棵可玩小遊戲）＋小樹 6 棵
  [['梅花廣場', 0, -2, 1.9], ['校門', -6, -3, 1.4], ['風雨球場', 0, 9, 1.4], ['集合場', 8, 0, 0.8], ['接送區', 6, -1, 0.8], ['後門', -4, 2, 0.8], ['停車場', -6, 2, 0.8], ['操場', 4, 10, 0.8], ['涼亭・遊戲區', -5, -3, 0.8]].forEach((s, i) => {
    const g = xmTree(s[3]), q = put(g, s); if (q) XM.trees.push({ id: i, x: q[0], z: q[1], y: q[2], g, big: i === 0 });
  });
  // 雪人 6 個（裝飾）
  [['校門', 5, -3], ['集合場', 4, 5], ['涼亭・遊戲區', 6, 0], ['接送區', -3, 3], ['梅花廣場', -7, 3], ['操場', -3, 9]].forEach(s => { const g = xmSnowman(0.85 + rr() * 0.2); g.rotation.y = rr() * 6.28; put(g, s); });
  // 禮物 14 個、薑餅人 6 個
  [['校門', -3, -2], ['校門', 3, 1], ['接送區', 3, 1], ['梅花廣場', -5, 1], ['梅花廣場', 7, -1], ['集合場', 2, 1], ['集合場', 8, 3], ['停車場', 2, 3], ['涼亭・遊戲區', 4, 3], ['涼亭・遊戲區', -4, -2], ['穿堂樓層區', 2, 1], ['風雨球場', -8, 5], ['後門', -2, 2], ['操場', -5, 11]].forEach((s, i) => {
    const g = xmGift(), q = put(g, s); if (q) { g.rotation.y = rr() * 6.28; g.userData.sc = 0.85 + rr() * 0.3; XM.gifts.push({ id: i, x: q[0], z: q[1], g, on: true, kind: 'gift' }); }
  });
  [['梅花廣場', 8, 3], ['集合場', -6, 2], ['涼亭・遊戲區', 1, -4], ['後門', 3, 1], ['停車場', -4, -2], ['接送區', -4, 2]].forEach((s, i) => {
    const g = xmCookie(), q = put(g, s); if (q) { g.rotation.y = rr() * 6.28; g.userData.sc = 1; XM.cookies.push({ id: i, x: q[0], z: q[1], g, on: true, kind: 'cookie' }); }
  });
  // 三位角色
  XMCH.forEach(m => {
    const g = xmChar(m.kind), p = pl(m.at[0]); if (!p) return; const q = hwFindOpen(p.x + m.at[1], p.z + m.at[2]); g.position.set(q[0], q[2], q[1]); root.add(g); dynAdd(g);
    const lab = hwSprite(m.name, m.col); lab.position.set(0, 2.5, 0); g.add(lab); m.g = g; m.lab = lab; m.x = q[0]; m.z = q[1]; m.y = q[2]; m.place = p; m.ph = rr() * 6; XM.mons.push(m);
  });
  // 飄雪：小白點圍著主角（本地座標，繪製時由 DYN 轉到球面）
  const N = 700, pos = new Float32Array(N * 3), vel = new Float32Array(N * 2); for (let i = 0; i < N; i++) { pos[i * 3] = (rr() - 0.5) * 50; pos[i * 3 + 1] = rr() * 24; pos[i * 3 + 2] = (rr() - 0.5) * 50; vel[i * 2] = 0.6 + rr() * 1.4; vel[i * 2 + 1] = rr() * 6; }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  const pts = new T.Points(geo, new T.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.9, depthWrite: false })); pts.frustumCulled = false;
  const sg = new T.Group(); sg.add(pts); scene.add(sg); dynAdd(sg); XM.snow = { g: sg, pts, pos, vel };
  if (window.STY && STY.on && typeof styScan === 'function') styScan();
}

// ---- 白雪覆蓋：屋頂與地面變白（改已烘焙網格材質的顏色＋星球地形頂點色），並在屋簷掛聖誕燈串 ----
const XSM = { 0x7fa05e: 0xf3f8fd, 0x8fb26a: 0xeef5fb, 0xc2582f: 0xe9eff6, 0x3b3f43: 0xdfe6ee, 0xbdbdb6: 0xe9eff4, 0xd9d4c6: 0xeef2f6,
  0x2f8266: 0xf6f9fd, 0x7f9fb8: 0xf6f9fd, 0xa8aba8: 0xf6f9fd, 0x93a4b8: 0xf6f9fd, 0x98a6b4: 0xf6f9fd, 0xa9c4dc: 0xeaf3fb, 0x8fd0f5: 0xf6f9fd,
  0xb4472f: 0xf6f9fd, 0x3f7fb8: 0xf6f9fd, 0x7e9b86: 0xf6f9fd, 0x9a9187: 0xf6f9fd, 0xc8c2b6: 0xf6f9fd, 0x8aa0ad: 0xf6f9fd };
const XSN = { sol: [], list: null, last: -1, land: null, col0: null, w: null };
function xsInit() {
  if (XSN.list || !PWG.children.length) return; const seen = new Set(), L = XSN.list = [];
  scene.traverse(o => { if (!o.isMesh) return; let m = o.material; if (!m || Array.isArray(m)) return; if (m.userData && m.userData.src) m = m.userData.src; if (seen.has(m) || !m.color || m.vertexColors || m.isMeshBasicMaterial) return; if (m.map) { if (m.map === solarTex) { seen.add(m); XSN.sol.push(m); L.push({ m, c0: m.color.clone(), c1: new T.Color(0xeef4fa) }); } return; } seen.add(m); const h = m.color.getHex(); if (XSM[h] !== undefined) L.push({ m, c0: m.color.clone(), c1: new T.Color(XSM[h]) }); });
  const land = TERR.land; if (land && land.geometry.attributes.color) { const g = land.geometry, P = g.attributes.position, n = P.count; XSN.land = g; XSN.col0 = g.attributes.color.array.slice(); XSN.w = new Float32Array(n); for (let i = 0; i < n; i++) { const th = Math.acos(Math.max(-1, Math.min(1, P.getY(i) / (Math.hypot(P.getX(i), P.getY(i), P.getZ(i)) || 1)))); XSN.w[i] = th < 2.1 ? 1 : th < 2.3 ? 1 - (th - 2.1) / 0.2 : 0; } }
  XSN.last = -1;
}
function xsApply(k) {
  if (!XSN.list) xsInit(); if (!XSN.list) return; if (Math.abs(k - XSN.last) < 0.004 && !(k === 0 && XSN.last !== 0)) return; XSN.last = k;
  XSN.list.forEach(o => o.m.color.copy(o.c0).lerp(o.c1, k)); { const on = k > 0.5; XSN.sol.forEach(m => { const mp = on ? null : solarTex; if (m.map !== mp) { m.map = mp; m.needsUpdate = true; } }); }
  if (XSN.land) { const a = XSN.land.attributes.color, c0 = XSN.col0, w = XSN.w, A = a.array; for (let i = 0; i < w.length; i++) { const t = w[i] * k; A[i * 3] = c0[i * 3] + (0.95 - c0[i * 3]) * t; A[i * 3 + 1] = c0[i * 3 + 1] + (0.97 - c0[i * 3 + 1]) * t; A[i * 3 + 2] = c0[i * 3 + 2] + (1 - c0[i * 3 + 2]) * t; } a.needsUpdate = true; }
}
function xmLights() {
  if (XM.lg) return; const lg = XM.lg = new T.Group(); scene.add(lg); const sp = new T.SphereGeometry(0.17, 6, 4), G = [[], [], [], []]; let n = 0;
  const strings = (f, y) => {
    const tf = f.tf, W = (x, z) => toWorld(tf, x, z), e = 0.25, C = [W(f.x0 - e, f.z0 - e), W(f.x1 + e, f.z0 - e), W(f.x1 + e, f.z1 + e), W(f.x0 - e, f.z1 + e)];
    for (let i = 0; i < 4; i++) { const a = C[i], b = C[(i + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]), N = Math.max(2, Math.round(len / 1.3));
      for (let j = 0; j < N; j++) { const u = j / N, sag = 0.28 * Math.sin(Math.PI * ((u * len) % 4.5) / 4.5); G[(n++) % 4].push([sp, hwM4(a[0] + (b[0] - a[0]) * u, y - sag, a[1] + (b[1] - a[1]) * u, 1)]); } }
  };
  FOOT.forEach(f => { if (!f.id || f.track || f.gym || f.x0 === undefined) return; const fl = f.fl || 3; strings(f, fl * H + 0.45); strings(f, H - 0.1); });
  { const S = [], bx = new T.BoxGeometry(1, 1, 1); FOOT.forEach(f => { if (!f.id || f.track || f.gym || f.x0 === undefined) return; const fl = f.fl || 3, tf = f.tf, c = toWorld(tf, (f.x0 + f.x1) / 2, (f.z0 + f.z1) / 2), rot = tf ? Math.atan2(tf.s, tf.c) : 0; S.push([bx, hwM4(c[0], fl * H + 0.07, c[1], Math.abs(f.x1 - f.x0) - 0.5, 0.14, Math.abs(f.z1 - f.z0) - 0.5, rot)]); });
    if (S.length) { const geo = planetBakeGeo(hwMerge(S), null, 5), m = new T.Mesh(geo, XMM.snowcap); m.frustumCulled = false; m.userData.noOutline = true; m.matrixAutoUpdate = false; lg.add(m); } }
  G.forEach((a, i) => { if (!a.length) return; const geo = planetBakeGeo(hwMerge(a), null, 5), m = new T.Mesh(geo, XMM.lt[i]); m.frustumCulled = false; m.userData.noOutline = true; m.matrixAutoUpdate = false; lg.add(m); });
}
function xmApply(ed, quiet) {
  const on = ed === 'christmas'; XM.on = on; if (on) { xmBuild(); xmLights(); } if (XM.root) XM.root.visible = on; if (XM.lg) XM.lg.visible = on; if (XM.snow) XM.snow.g.visible = on;
  const b = $('bXm'); if (b) { b.hidden = !on; xmBtn(); }
  if (on && !quiet) { toast('聖誕節限定版開啟！去找雪人、聖誕老公公和小麋鹿，順便撿禮物和薑餅人', 4200); saveGame(); }
  if (!on) XM.k = Math.min(XM.k, 1);
}
function xmBtn() { const b = $('bXm'); if (b) b.textContent = '聖誕任務 ' + xmDone() + '/3'; }
function xmTick(dt) {
  XM.k += ((XM.on ? 1 : 0) - XM.k) * Math.min(1, dt * 1.6); if (!XM.on && XM.k < 0.01) XM.k = 0; if (XM.k > 0 || XSN.last > 0) xsApply(XM.k);
  if (!XM.on || !XM.built) return;
  XM.t += dt; const t = XM.t, cs = charScale(), pk = 1 + (cs - 1) * 0.6;
  XM.bl -= dt; if (XM.bl <= 0) { XM.bl = 0.45; const ph = Math.floor(t / 0.45); XMM.lt.forEach((m, i) => { m.color.setHex(((ph + i) % 2) ? [0xff4d4d, 0xffd23a, 0x4dd2ff, 0x7dff6b][i] : [0x7a2a2a, 0x7a6a1e, 0x1e5a70, 0x2c6a26][i]); }); }
  XM.mons.forEach(m => {
    const done = G.xm.done[m.id], s = (done ? 0.88 : 1) * cs * 0.95, d = Math.hypot(m.x - PL.x, m.z - PL.z), bd = m.g.userData.body;
    m.g.scale.setScalar(s); bd.position.y = Math.abs(Math.sin(t * 2 + m.ph)) * 0.1; bd.rotation.z = Math.sin(t * 1.5 + m.ph) * 0.05;
    if (d < 14) m.g.rotation.y += angd(Math.atan2(PL.x - m.x, PL.z - m.z), m.g.rotation.y) * Math.min(1, dt * 3);
    m.lab.visible = d > 3.5 && d < 30 && cs < 4;
  });
  XM.trees.forEach(o => o.g.scale.setScalar(o.g.userData.sc * pk));
  [...XM.gifts, ...XM.cookies].forEach(o => { if (o.on) { o.g.scale.setScalar(o.g.userData.sc * pk); o.g.rotation.y += dt * 0.6; } });
  const S = XM.snow; if (S) {
    const p = S.pos, v = S.vel, n = p.length / 3; for (let i = 0; i < n; i++) { let y = p[i * 3 + 1] - v[i * 2] * dt, x = p[i * 3] + Math.sin(t * 0.8 + v[i * 2 + 1]) * 0.25 * dt, z = p[i * 3 + 2] + Math.cos(t * 0.6 + v[i * 2 + 1]) * 0.2 * dt; if (y < 0) { y += 24; } p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z; }
    S.pts.geometry.attributes.position.needsUpdate = true; S.g.position.set(PL.x, PL.y, PL.z); S.g.scale.setScalar(Math.min(cs, 3)); S.pts.material.opacity = 0.9 * Math.min(1, XM.k); S.pts.material.size = 0.3 * Math.min(cs, 3);
  }
  XM.chk -= dt; if (XM.chk <= 0) { XM.chk = 0.5; const now = nowMs(); [...XM.gifts, ...XM.cookies].forEach(o => { const key = 'x' + o.kind[0] + o.id; if (!o.on && !(G.resp[key] > now)) { o.on = true; o.g.visible = true; } }); }
}
function xmInteract(cand, ds) {
  if (!XM.on || !XM.built) return;
  XM.mons.forEach(m => { const d = ds(m.x, m.z, m.y); if (d < 3.4) cand(d, G.xm.done[m.id] ? '和 ' + m.name + ' 聊聊' : '和 ' + m.name + ' 說話（聖誕挑戰）', () => xmTalk(m)); });
  XM.trees.forEach(o => { if (!o.big) return; const d = ds(o.x, o.z, o.y); if (d < 4.2) cand(d, '玩「接禮物」小遊戲', xmGameOpen); });
  [...XM.gifts, ...XM.cookies].forEach(o => { if (!o.on) return; const d = ds(o.x, o.z, 0); if (d < 2.2) cand(d, o.kind === 'gift' ? '撿起聖誕禮物' : '撿起薑餅人餅乾', () => { addItem(o.kind); toast('撿到 ' + ITEMS[o.kind].n + '！'); o.on = false; o.g.visible = false; G.resp['x' + o.kind[0] + o.id] = nowMs() + (o.kind === 'gift' ? 4 : 7) * 60000; saveGame(); }); });
}
function xmMini(g, mp) {
  if (!XM.on) return;
  XM.mons.forEach(m => { const p = mp(m.x, m.z); g.fillStyle = G.xm.done[m.id] ? '#46b86a' : '#e0405a'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(p[0], p[1], 5, 0, 7); g.fill(); g.stroke(); });
  g.fillStyle = '#3fb86a'; XM.gifts.forEach(o => { if (!o.on) return; const p = mp(o.x, o.z); g.beginPath(); g.arc(p[0], p[1], 2.4, 0, 7); g.fill(); });
  const b = XM.trees[0]; if (b) { const p = mp(b.x, b.z); g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(p[0], p[1], 3.2, 0, 7); g.fill(); }
}
// ---- 問答 ----
function xmTalk(m) {
  if (G.xm.done[m.id]) { openDlg(m.name, m.again, [{ t: '再見', fn: closePanels }]); return; }
  openDlg(m.name, m.intro, [{ t: '接受挑戰', go: true, fn: () => xmAsk(m, 0) }, { t: '下次再來', fn: closePanels }]);
}
function xmAsk(m, i) {
  const st = m.steps[i], opts = [[st.ok, true], [st.bad[0], false], [st.bad[1], false]].sort(() => Math.random() - 0.5);
  openDlg(m.name, st.t, opts.map(o => ({ t: o[0], fn: () => o[1] ? (i + 1 < m.steps.length ? xmOk(m, i) : xmWin(m)) : xmNo(m, i) })).concat([{ t: '先離開', fn: closePanels }]));
}
function xmOk(m, i) { openDlg(m.name, '答對了！', [{ t: '下一題', go: true, fn: () => xmAsk(m, i + 1) }]); }
function xmNo(m, i) { openDlg(m.name, m.steps[i].no, [{ t: '再試一次', go: true, fn: () => xmAsk(m, i) }, { t: '先離開', fn: closePanels }]); }
function xmWin(m) {
  G.xm.done[m.id] = 1; addItem('xcandy', 5); addCoins(80); xmBtn(); const all = xmDone() === 3; let txt = m.win + '\n\n獲得：聖誕拐杖糖 ×5、同樂幣 80';
  if (all) { addItem('cookie', 1); addItem('gift', 3); addCoins(200); txt += '\n\n三位聖誕朋友都開心了！額外獲得「聖誕守護小隊」獎勵：薑餅人餅乾 ×1、聖誕禮物 ×3、同樂幣 200'; }
  saveGame(); openDlg(m.name, txt, [{ t: '太好了！', go: true, fn: closePanels }]);
}
function xmPanel() {
  openPanel('xmp'); const L = $('xmpList'); L.innerHTML = '';
  const s = document.createElement('p'); s.className = 'sm'; s.textContent = '聖誕節到了！找到三位聖誕朋友，答對問題就能拿到禮物。　禮物 ×' + have('gift') + '　薑餅人 ×' + have('cookie') + '　拐杖糖 ×' + have('xcandy') + '　（梅花廣場的大聖誕樹可以玩「接禮物」，最高 ' + (G.xm.best | 0) + ' 分）'; L.appendChild(s);
  const gr = document.createElement('div'); gr.className = 'grid'; L.appendChild(gr);
  XMCH.forEach(m => {
    const c = document.createElement('div'); c.className = 'it'; const d = G.xm.done[m.id];
    c.innerHTML = '<div class="sw" style="background:' + m.col + '"></div><div class="nm">' + m.name + (d ? '　✔ 已完成' : '') + '</div><div class="ds">' + (m.place ? (m.place.sub.indexOf(m.place.name) === 0 ? m.place.sub : m.place.name + '（' + m.place.sub + '）') : m.at[0]) + '</div>';
    if (m.place) c.appendChild(mkBtn('前往', () => { closePanels(); navStart(m.place); }, true)); gr.appendChild(c);
  });
}
// ---- 接禮物小遊戲：20 秒，左右移動籃子接住掉下來的禮物（+1）、金星星（+3），閃避煤炭（−2）----
const XMG = { run: false, t: 0, score: 0, bx: 160, items: [], sp: 0, raf: 0, last: 0, keys: {} };
function xmGameOpen() { openPanel('xmg'); xmGameReset(); }
function xmGameReset() { XMG.run = false; XMG.score = 0; XMG.items = []; XMG.t = 20; $('xmgS').textContent = '左右移動（滑鼠、手指拖曳，或 ← →／A D）籃子，接住禮物！禮物 +1、金星星 +3、煤炭 −2。'; $('xmgGo').textContent = '開始（20 秒）'; $('xmgGo').hidden = false; xmGameDraw(); }
function xmGameDraw() {
  const c = $('xmgC'), g = c.getContext('2d'), W = c.width, H = c.height; const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#16305a'); bg.addColorStop(1, '#3a6aa8'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = '#fff'; for (let i = 0; i < 30; i++) g.fillRect((i * 97 + XMG.t * 20) % W, (i * 53 + XMG.t * 40) % H, 2, 2);
  g.fillStyle = '#eaf4ff'; g.fillRect(0, H - 22, W, 22);
  XMG.items.forEach(o => { g.font = '28px sans-serif'; g.textAlign = 'center'; g.fillStyle = o.k === 'gift' ? ['#d8404f', '#3a8fe0', '#3fb86a', '#b06ad8'][o.c] : o.k === 'star' ? '#ffd23a' : '#3a3a44'; if (o.k === 'gift') { g.fillRect(o.x - 13, o.y - 13, 26, 26); g.fillStyle = '#f2c230'; g.fillRect(o.x - 3, o.y - 13, 6, 26); g.fillRect(o.x - 13, o.y - 3, 26, 6); } else if (o.k === 'star') { g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 14, a = i * Math.PI / 5 - Math.PI / 2; g.lineTo(o.x + Math.cos(a) * r, o.y + Math.sin(a) * r); } g.closePath(); g.fill(); } else { g.beginPath(); g.arc(o.x, o.y, 12, 0, 7); g.fill(); } });
  g.fillStyle = '#b9733a'; g.fillRect(XMG.bx - 32, H - 52, 64, 30); g.fillStyle = '#8a5428'; g.fillRect(XMG.bx - 32, H - 52, 64, 6); g.fillStyle = '#fff'; g.font = '700 20px sans-serif'; g.textAlign = 'left'; g.fillText('分數 ' + XMG.score, 10, 26); g.textAlign = 'right'; g.fillText(Math.max(0, Math.ceil(XMG.t)) + ' 秒', W - 10, 26);
}
function xmGameStep(now) {
  if (!XMG.run) return; if ($('xmg').hidden) { XMG.run = false; return; }
  const dt = Math.min(0.05, (now - XMG.last) / 1000); XMG.last = now; XMG.t -= dt; const W = 320, H = 400;
  const dir = (XMG.keys.ArrowRight || XMG.keys.KeyD ? 1 : 0) - (XMG.keys.ArrowLeft || XMG.keys.KeyA ? 1 : 0); XMG.bx = Math.max(32, Math.min(W - 32, XMG.bx + dir * 260 * dt));
  XMG.sp -= dt; if (XMG.sp <= 0) { XMG.sp = 0.38 + Math.random() * 0.25; const r = Math.random(); XMG.items.push({ x: 20 + Math.random() * (W - 40), y: -14, v: 120 + Math.random() * 80 + (20 - XMG.t) * 4, k: r < 0.12 ? 'star' : r < 0.32 ? 'coal' : 'gift', c: (Math.random() * 4) | 0 }); }
  XMG.items.forEach(o => { o.y += o.v * dt; if (o.y > H - 58 && o.y < H - 20 && Math.abs(o.x - XMG.bx) < 38 && !o.hit) { o.hit = 1; XMG.score = Math.max(0, XMG.score + (o.k === 'gift' ? 1 : o.k === 'star' ? 3 : -2)); } });
  XMG.items = XMG.items.filter(o => !o.hit && o.y < H + 20); xmGameDraw();
  if (XMG.t <= 0) { XMG.run = false; xmGameEnd(); return; } XMG.raf = requestAnimationFrame(xmGameStep);
}
function xmGameEnd() {
  const sc = XMG.score, now = nowMs(); G.xm.best = Math.max(G.xm.best | 0, sc); let msg = '時間到！你接到 ' + sc + ' 分。';
  if (sc >= 5) { if (!(G.resp.xmg > now)) { const c = Math.min(120, sc * 6); addCoins(c); G.resp.xmg = now + 3 * 60000; msg += ' 獲得同樂幣 ' + c + '！'; if (sc >= 18) { addItem('xcandy', 1); msg += '（高分獎勵：聖誕拐杖糖 ×1）'; } } else msg += '（同樂幣每 3 分鐘可以領一次，這次先練習。）'; } else msg += ' 再試一次吧！';
  $('xmgS').textContent = msg + '　最高 ' + G.xm.best + ' 分'; $('xmgGo').textContent = '再玩一次'; $('xmgGo').hidden = false; saveGame(); xmGameDraw();
}
function xmGameStart() { XMG.run = true; XMG.t = 20; XMG.score = 0; XMG.items = []; XMG.sp = 0.3; XMG.bx = 160; $('xmgGo').hidden = true; $('xmgS').textContent = '接住禮物！'; XMG.last = performance.now(); cancelAnimationFrame(XMG.raf); XMG.raf = requestAnimationFrame(xmGameStep); }
$('xmgGo').onclick = xmGameStart; $('xmgX').onclick = () => { XMG.run = false; closePanels(); };
{ const c = $('xmgC'), mv = e => { const r = c.getBoundingClientRect(); XMG.bx = Math.max(32, Math.min(320 - 32, (e.clientX - r.left) / r.width * 320)); }; c.addEventListener('pointermove', mv); c.addEventListener('pointerdown', e => { mv(e); try { c.setPointerCapture(e.pointerId); } catch (x) { } }); }
addEventListener('keydown', e => { if (!$('xmg').hidden) { XMG.keys[e.code] = true; if (e.code.startsWith('Arrow')) e.preventDefault(); } }); addEventListener('keyup', e => { XMG.keys[e.code] = false; });
$('bXm').onclick = () => { if (STARTED) { if (!$('xmp').hidden) closePanels(); else xmPanel(); } };
$('xmpX').onclick = closePanels;
// ---- 依日期建議切換版本（每個節日每年只問一次；仍是手動決定）----
function edSeasonNow() { const d = window.__edDate ? new Date(window.__edDate) : new Date(), m = d.getMonth() + 1, day = d.getDate(); if ((m === 10 && day >= 15) || (m === 11 && day <= 1)) return 'halloween'; if (m === 12 && day <= 26) return 'christmas'; if (typeof lnSeason === 'function' && lnSeason()) return 'lunar'; return null; }
function edHint() {
  const s = edSeasonNow(); if (!s || G.edition !== 'normal' || anyPanel()) return; const key = 'tongle_edhint_' + s + '_' + (new Date().getFullYear()); try { if (localStorage.getItem(key)) return; localStorage.setItem(key, '1'); } catch (e) { return; }
  const nm = { christmas: '聖誕節', lunar: '農曆年' }[s] || '萬聖節';
  openDlg('版本建議', ({ christmas: '聖誕節快到了！', lunar: '新年快到了！' }[s] || '萬聖節快到了！') + '要換成「' + nm + '限定版」嗎？\n（之後隨時可以在上方「版本」選單切換。）', [{ t: '換成' + nm + '版', go: true, fn: () => { closePanels(); hwApply(s); } }, { t: '先不要', fn: closePanels }]);
}
{ const iv = setInterval(() => { if (!STARTED) return; clearInterval(iv); setTimeout(edHint, 3500); }, 500); }
window.__xm = { XM, xmApply, xmBuild, XMCH, XMG, edSeasonNow, edHint, xmGameEnd };
