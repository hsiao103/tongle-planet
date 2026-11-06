// ===== 校園教職員：6 位自動走動的骨架角色（頭大身小、露出手臂） =====
const STF = { built: false, t: 0, list: [] };
const STF_DEF = [
  { id: 'ting', name: '霆霆校長', role: '校長', kind: 'boy', h: 1.5, home: '梅花廣場', off: [4, 5], col: '#ffe08a', sp: 0.9, R: 9,
    c: { skin: 0xf2c9a4, hair: 0x2a2220, 'school-shirt': 0x27406b, 'school-shorts': 0x2c3342, collar: 0xffffff, shoes: 0x2a2020 }, acc: 'tie',
    lines: ['歡迎來到同樂！這裡的每一位孩子，都是校園裡最亮的星星。', '走一走、看一看，校園裡藏著很多有趣的角落喔。', '遇到困難別擔心，老師和同學都會幫你。'] },
  { id: 'ye', name: '總務主任 YAYA', role: '', kind: 'boy', h: 1.45, home: '校門', off: [3, 6], col: '#9fd0ff', sp: 1.0, R: 9,
    c: { skin: 0xeeba94, hair: 0x7a4a28, 'school-shirt': 0x9a6338, 'school-shorts': 0x7a4a28, collar: 0xf0d9b0, shoes: 0x5a3418 }, acc: 'bear',
    lines: ['我是YAYA主任～穿著熊熊裝，抱一下就不怕啦！', '校園安全最重要，進出校門請放慢腳步喔。', '今天的行政事務滿滿，不過看到你們精神好，就有力氣了。'] },
  { id: 'qi', name: '教導主任 小琪', role: '', kind: 'girl', h: 1.42, home: '集合場', off: [3, -4], col: '#ffc0d8', sp: 1.0, R: 9,
    c: { skin: 0xf6d2b0, hair: 0x4a2c20, 'school-shirt': 0xc0506a, 'school-shorts': 0x4a3a46, collar: 0xffffff, shoes: 0x5a2a30, 'hair-band': 0xf2c230 }, acc: 'bun',
    lines: ['活動前先熱身，運動才不會受傷。', '集合的時候要快、靜、齊，今天的隊伍看起來很棒！', '記得多喝水，補充水分很重要。'] },
  { id: 'yan', name: '彥彥組長', role: '組長', kind: 'boy', h: 1.45, home: '操場', off: [-4, 7], col: '#9fe8b0', sp: 1.15, R: 11,
    c: { skin: 0xe8b48c, hair: 0x201a16, 'school-shirt': 0x2a5fc0, 'school-shorts': 0xf4f4f4, collar: 0xe03a2c, shoes: 0xf0f0f0 }, acc: 'pe',
    lines: ['跑操場前先暖身，一起來動一動吧！', '運動不是比誰快，是比誰願意持續。', '想挑戰操場跑道嗎？我幫你計時！'] },
  { id: 'min', name: '小敏老師', role: '三忠導師', kind: 'girl', h: 1.38, home: '涼亭・遊戲區', off: [4, 3], col: '#ffd9a0', sp: 0.9, R: 8,
    c: { skin: 0xf4cfae, hair: 0x2c1f1a, 'school-shirt': 0xe8935a, 'school-shorts': 0x5a4636, collar: 0xffffff, shoes: 0x7a4a2a, 'hair-band': 0xffffff }, acc: 'book',
    lines: ['你看過今天的課表了嗎？好好把握學習的時間。', '好奇心是最棒的老師，有問題就大膽問！', '我最喜歡看到孩子們發現新東西的表情。'] },
  { id: 'ning', name: '小寧老師', role: '二忠導師', kind: 'girl', h: 1.38, home: '風雨球場', off: [5, 5], col: '#d9c0ff', sp: 1.0, R: 9,
    c: { skin: 0xf2c9a4, hair: 0x3a2a3a, 'school-shirt': 0x8a6cc8, 'school-shorts': 0x3c3a5a, collar: 0xffffff, shoes: 0x3a2a4a, 'hair-band': 0xff9ac0 }, acc: 'flower',
    lines: ['下課時間到球場玩，記得注意安全喔。', '合作比競爭更有趣，找朋友一起玩吧！', '今天也要笑一個，心情會變好～'] },
  { id: 'nurse', name: '校護 林老師', role: '校護', kind: 'girl', h: 1.42, at: [18.4, -3.2], lv: 0, col: '#ff9a96', sp: 0.8, R: 2.2,
    c: { skin: 0xf2c9a4, 'school-shirt': 0xf6f4ee, 'school-sleeve': 0xf6f4ee, 'school-shorts': 0xe7ecef, collar: 0xd9534f, hair: 0x2c2225, shoes: 0xf2f2f2, 'hair-band': 0xd9534f }, acc: 'nurse', accs: ['kit'],
    lines: ['哪裡不舒服？先坐下來，跟我說說看。', '運動完要記得補充水分，也別忘了伸展喔。', '健康中心隨時歡迎你，受傷了不要硬撐！'] },
  { id: 'vol', name: '愛心志工 王媽媽', role: '愛心志工', kind: 'girl', h: 1.4, at: [4.4, -9.5], lv: 0, col: '#7fe09a', sp: 0.8, R: 2.2,
    c: { skin: 0xf2c9a4, 'school-shirt': 0x3fae5a, 'school-sleeve': 0xf4f1ea, 'school-shorts': 0x3b4252, collar: 0xf2c230, hair: 0x5b5650, shoes: 0x2b3340, 'hair-band': 0x3fae5a }, acc: 'volcap', accs: ['heart'],
    lines: ['我是愛心志工王媽媽，每天在校門口陪孩子們上下學。', '看到你們平安快樂，我就很開心。', '過馬路要先停、看、聽，大人在旁邊也會幫忙看著喔。'] },
  { id: 'jan', name: '工友 阿伯', role: '工友', kind: 'boy', h: 1.5, at: [-32.5, -2.2], lv: 0, col: '#8fbcff', sp: 0.7, R: 3.5,
    c: { skin: 0xf2c9a4, 'school-shirt': 0x3b6fb6, 'school-sleeve': 0x3b6fb6, 'school-shorts': 0x3b4252, collar: 0x3b6fb6, hair: 0x6f6a66, shoes: 0x1b1b1e }, acc: 'workcap', accs: ['broom'],
    lines: ['校園乾乾淨淨，大家讀書才舒服呀。', '水龍頭用完要關緊，不要浪費水喔。', '有東西壞掉了就跟我說，阿伯幫你修。'] },
  { id: 'cook', name: '廚工 阿美姨', role: '廚工', kind: 'girl', h: 1.42, at: [-40.5, -17], lv: 0, col: '#ffb877', sp: 0.8, R: 2.6,
    c: { skin: 0xf2c9a4, 'school-shirt': 0xffffff, 'school-sleeve': 0xffffff, 'school-shorts': 0xcfd6dd, collar: 0xe07a1f, hair: 0x3a2e2a, shoes: 0x2b3340, 'hair-band': 0xe07a1f }, acc: 'chef', accs: ['apron'],
    lines: ['今天的菜色是阿美姨特別準備的，要吃光光喔！', '青菜、肉、飯都要吃，才會長高高。', '餐盤收好、桌子擦乾淨，就是最棒的小幫手。'] },
  { id: 'yuzu', name: '幼兒園主任 柚子', role: '幼兒園主任', kind: 'girl', h: 1.4, at: [-15, -69], lv: 0, col: '#ffd066', sp: 0.8, R: 3,
    c: { skin: 0xf2c9a4, 'school-shirt': 0xf7b733, 'school-sleeve': 0xf7b733, 'school-shorts': 0xf4f1ea, collar: 0xffffff, hair: 0x4a3426, shoes: 0x2b3340, 'hair-band': 0xf2a900 }, acc: 'yuzu', accs: [],
    lines: ['小小朋友們最可愛了，每一天都有新發現！', '幼兒園就像小小的家，大家在這裡學會分享和照顧彼此。', '大哥哥大姊姊來參觀，要輕輕的、溫柔的喔。'] },
  { id: 'hua', name: '小華老師', role: '一忠導師', kind: 'girl', h: 1.42, at: [18, -17], lv: 0, col: '#7bb4ff', sp: 0.8, R: 2.2,
    c: { skin: 0xf2c9a4, 'school-shirt': 0x5aa0e0, 'school-sleeve': 0x5aa0e0, 'school-shorts': 0x3b4252, collar: 0xffffff, hair: 0x3a2a22, shoes: 0x2b3340, 'hair-band': 0x2f80ed }, acc: 'glasses', accs: ['book'],
    lines: ['一年忠班的孩子們剛入學，每天都在學新的事情。', '慢慢來，每一點進步都值得開心。', '今天的功課寫完了嗎？'] },
  { id: 'zhen', name: '小珍老師', role: '四忠導師', kind: 'girl', h: 1.4, at: [36, -28], lv: 1, col: '#ff9a96', sp: 0.8, R: 2.2,
    c: { skin: 0xf2c9a4, 'school-shirt': 0xe5776f, 'school-sleeve': 0xe5776f, 'school-shorts': 0x3b4252, collar: 0xffffff, hair: 0x2c2225, shoes: 0x2b3340, 'hair-band': 0xd9534f }, acc: 'ponytail', accs: ['book'],
    lines: ['四年級開始要學著獨立，也要學著幫助別人。', '遇到不懂的地方，舉手問就對了。', '我們班的團隊精神，是全校最強的！'] },
  { id: 'yu', name: '小瑜老師', role: '五忠導師', kind: 'girl', h: 1.42, at: [18, -26], lv: 1, col: '#ffb877', sp: 0.8, R: 2.2,
    c: { skin: 0xf2c9a4, 'school-shirt': 0xf59a4a, 'school-sleeve': 0xf59a4a, 'school-shorts': 0x3b4252, collar: 0xffffff, hair: 0x3a2e2a, shoes: 0x2b3340, 'hair-band': 0xf5821f }, acc: 'pigtails', accs: ['book'],
    lines: ['五年級的你們已經是學弟妹的好榜樣囉。', '做事情先想一想，再慢慢做好。', '努力的人，運氣都不會太差～'] },
  { id: 'ying', name: '小英老師', role: '六忠導師', kind: 'girl', h: 1.4, at: [36, -18], lv: 1, col: '#7fd6e3', sp: 0.8, R: 2.2,
    c: { skin: 0xf2c9a4, 'school-shirt': 0x4fb7c9, 'school-sleeve': 0x4fb7c9, 'school-shorts': 0x3b4252, collar: 0xffffff, hair: 0x2a2024, shoes: 0x2b3340, 'hair-band': 0x17a2b8 }, acc: 'bow', accs: ['book'],
    lines: ['六年級是小學最後一年，要好好把握每一天。', '畢業旅行、畢業典禮，都是最珍貴的回憶。', '即將上國中，不用怕，我們都會陪著你。'] },
  { id: 'cindy', name: '英語 Cindy 老師', role: '英語老師', kind: 'girl', h: 1.43, at: [18, -10], lv: 1, col: '#c3a8f5', sp: 0.8, R: 2.2,
    c: { skin: 0xf2c9a4, 'school-shirt': 0x9d7be0, 'school-sleeve': 0x9d7be0, 'school-shorts': 0x3b4252, collar: 0xffffff, hair: 0x8a6a3a, shoes: 0x2b3340, 'hair-band': 0x7a4fd1 }, acc: 'bow', accs: ['glasses', 'book'],
    lines: ['Hello! How are you today?', 'Practice makes perfect. 每天多說一點英文，就會進步！', 'Do not be shy. 勇敢開口說說看吧！'] }
];
function stfOpen(x, z, lv, ref) {                              // 室內／樓上也能用的「找附近可站位置」（lv：樓層，0＝1 樓）
  const y0 = lv * H + 2.2, gr = (px, pz) => { const g = groundAt(px, y0, pz); return isFinite(g) ? g : lv * H; };
  for (let r = 0; r < 3.6; r += 0.9) for (let a = 0; a < 6.3; a += 1.05) { const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r, g = gr(px, pz); if (!(typeof blocked === 'function' && blocked(px, pz, g + 0.4)) && Math.abs(g - (ref !== undefined ? ref : lv * H)) < (ref !== undefined ? 0.2 : 0.6)) return [px, pz, g]; }
  return [x, z, gr(x, z)];
}
function stfClear(x0, z0, x1, z1, y) {                    // 直線路徑上沒有牆（避免穿牆走進隔壁教室）
  if (typeof blocked !== 'function') return true;
  for (let i = 1; i <= 6; i++) { const t = i / 6; if (blocked(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, y + 0.4)) return false; }
  return true;
}
async function stfBuild() {
  if (STF.built) return; const pl = n => NPLACES.find(p => p.name === n && !p.room); if (!pl('梅花廣場') || !pl('操場')) return; STF.built = true; hwGeos();
  const root = STF.root = new T.Group(); scene.add(root); const A = { boy: await loadGLB('boy'), girl: await loadGLB('girl') };
  STF_DEF.forEach(D => {
    const has = k => D.acc === k || (D.accs || []).includes(k), p = D.at ? { x: D.at[0], z: D.at[1] } : (pl(D.home) || pl('梅花廣場')), q = D.at ? stfOpen(D.at[0], D.at[1], D.lv || 0) : hwFindOpen(p.x + D.off[0], p.z + D.off[1]), g = new T.Group(); g.position.set(q[0], q[2], q[1]); root.add(g); dynAdd(g);
    const ch = pxMake(A, D.kind, D.h, D.c), { r, cy } = pxHead(ch), G = new T.Group(), H = D.h;
    if (has('glasses')) { const m = new T.TorusGeometry(0.3 * r, 0.05 * r, 6, 12), a = pxM2(m, 0x202028, -0.38 * r, cy + 0.1 * r, -0.98 * r), b = a.clone(); b.position.x = 0.38 * r; G.add(a, b, pxM2(new T.BoxGeometry(0.4 * r, 0.05 * r, 0.05 * r), 0x202028, 0, cy + 0.1 * r, -0.98 * r)); }
    if (has('bear')) {                                                                           // 熊熊裝：熊耳、口鼻、鼻頭、尾巴
      [-1, 1].forEach(sx => { G.add(pxM2(new T.SphereGeometry(0.34 * r, 10, 8), 0x8a5230, sx * 0.72 * r, cy + 0.88 * r, 0.02 * r), pxM2(new T.SphereGeometry(0.2 * r, 8, 6), 0xf0c8a0, sx * 0.72 * r, cy + 0.88 * r, -0.2 * r)); });
      G.add(pxM2(new T.SphereGeometry(0.34 * r, 10, 8), 0xf0d9b0, 0, cy - 0.28 * r, -0.9 * r), pxM2(new T.SphereGeometry(0.11 * r, 8, 6), 0x2a1a14, 0, cy - 0.12 * r, -1.2 * r)); }
    if (has('pe')) {                                                                              // 體育老師：藍色運動帽
      G.add(pxM2(new T.SphereGeometry(1.08 * r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x1f4fa8, 0, cy + 0.15 * r, 0), pxM2(new T.CylinderGeometry(0.95 * r, 0.95 * r, 0.1 * r, 14, 1, false, Math.PI, Math.PI), 0xe03a2c, 0, cy + 0.2 * r, -0.62 * r)); }
    if (has('bun')) G.add(pxM2(new T.SphereGeometry(0.4 * r, 10, 8), D.c.hair, 0, cy + 0.95 * r, 0.1 * r));
    if (has('flower')) { G.add(pxM2(new T.SphereGeometry(0.2 * r, 8, 6), 0xff7aa8, 0.75 * r, cy + 0.65 * r, -0.2 * r), pxM2(new T.SphereGeometry(0.1 * r, 6, 4), 0xffe070, 0.75 * r, cy + 0.65 * r, -0.36 * r)); }
    if (has('nurse')) { G.add(pxM2(new T.CylinderGeometry(0.62 * r, 0.7 * r, 0.34 * r, 12), 0xffffff, 0, cy + 0.95 * r, 0.05 * r), pxM2(new T.BoxGeometry(0.3 * r, 0.09 * r, 0.04 * r), 0xd9302c, 0, cy + 0.97 * r, -0.68 * r), pxM2(new T.BoxGeometry(0.09 * r, 0.3 * r, 0.04 * r), 0xd9302c, 0, cy + 0.97 * r, -0.68 * r)); }   // 護士帽（紅十字）
    if (has('volcap')) G.add(pxM2(new T.SphereGeometry(1.06 * r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x2e9b45, 0, cy + 0.15 * r, 0), pxM2(new T.CylinderGeometry(0.95 * r, 0.95 * r, 0.1 * r, 14, 1, false, Math.PI, Math.PI), 0x24803a, 0, cy + 0.2 * r, -0.62 * r));   // 志工綠帽
    if (has('workcap')) G.add(pxM2(new T.SphereGeometry(1.06 * r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x2f5fa8, 0, cy + 0.15 * r, 0), pxM2(new T.CylinderGeometry(0.95 * r, 0.95 * r, 0.1 * r, 14, 1, false, Math.PI, Math.PI), 0x24497f, 0, cy + 0.2 * r, -0.62 * r));   // 工友藍色工作帽
    if (has('chef')) G.add(pxM2(new T.CylinderGeometry(0.66 * r, 0.7 * r, 0.4 * r, 14), 0xffffff, 0, cy + 0.95 * r, 0.02 * r), pxM2(new T.SphereGeometry(0.82 * r, 12, 8), 0xffffff, 0, cy + 1.42 * r, 0.02 * r));   // 廚師帽
    if (has('yuzu')) { [-1, 1].forEach(sx => G.add(pxM2(new T.SphereGeometry(0.3 * r, 10, 8), 0xf2a900, sx * 0.68 * r, cy + 0.85 * r, 0.05 * r))); G.add(pxM2(new T.BoxGeometry(0.28 * r, 0.05 * r, 0.14 * r), 0x4fa84a, 0, cy + 1.02 * r, -0.2 * r)); }   // 柚子橘髮髻與小葉
    if (has('ponytail')) G.add(pxM2(new T.SphereGeometry(0.3 * r, 10, 8), 0x2c2225, 0, cy + 0.2 * r, 0.98 * r), pxM2(new T.CylinderGeometry(0.1 * r, 0.16 * r, 0.7 * r, 8), 0x2c2225, 0, cy - 0.15 * r, 1.05 * r), pxM2(new T.TorusGeometry(0.15 * r, 0.04 * r, 6, 10), 0xd9534f, 0, cy + 0.25 * r, 0.9 * r));   // 馬尾
    if (has('pigtails')) [-1, 1].forEach(sx => G.add(pxM2(new T.SphereGeometry(0.3 * r, 10, 8), 0x3a2e2a, sx * 0.85 * r, cy + 0.35 * r, 0.3 * r), pxM2(new T.SphereGeometry(0.1 * r, 6, 4), 0xf5821f, sx * 0.85 * r, cy + 0.55 * r, 0.3 * r)));   // 雙馬尾
    if (has('bow')) { const bc = D.c['hair-band'] || 0xff7aa8; [-1, 1].forEach(sx => { const w = pxM2(new T.BoxGeometry(0.42 * r, 0.26 * r, 0.1 * r), bc, sx * 0.3 * r, cy + 0.98 * r, -0.1 * r); w.rotation.z = sx * 0.5; G.add(w); }); G.add(pxM2(new T.SphereGeometry(0.1 * r, 8, 6), bc, 0, cy + 0.98 * r, -0.1 * r)); }   // 蝴蝶結
    if (G.children.length) addProp(ch, 'Head', G);
    const ny = ch.head ? ch.head.ny : 0.7 * H, B = new T.Group();
    if (has('tie')) B.add(pxM2(new T.BoxGeometry(0.035 * H, 0.14 * H, 0.012 * H), 0xc4202c, 0, ny * 0.62, -0.1 * H));
    if (has('whistle') || has('pe')) B.add(pxM2(new T.CylinderGeometry(0.014 * H, 0.014 * H, 0.04 * H, 8), 0xe0e0e0, 0.015 * H, ny * 0.64, -0.1 * H));
    B.add(pxM2(new T.BoxGeometry(0.06 * H, 0.04 * H, 0.008 * H), 0xffffff, -0.05 * H, ny * 0.56, -0.102 * H));          // 名牌
    if (has('book')) { const bk = new T.Group(); bk.add(pxM2(new T.BoxGeometry(0.09 * H, 0.012 * H, 0.12 * H), 0x2f6fb0, 0, 0, 0), pxM2(new T.BoxGeometry(0.085 * H, 0.01 * H, 0.115 * H), 0xfdf6e0, 0, 0.011 * H, 0)); pxHand(ch, 'FistR', bk); }
    if (has('bear')) B.add(pxM2(new T.SphereGeometry(0.06 * H, 8, 6), 0xf0d9b0, 0, ny * 0.3, 0.12 * H));
    if (has('pe')) { const sw = new T.Group(); sw.add(pxM2(new T.CylinderGeometry(0.03 * H, 0.03 * H, 0.015 * H, 12), 0xd0d0d8, 0, 0, 0), pxM2(new T.SphereGeometry(0.008 * H, 6, 4), 0xe03a2c, 0, 0.012 * H, 0)); pxHand(ch, 'FistR', sw); }
    if (has('heart')) { [-1, 1].forEach(sx => B.add(pxM2(new T.SphereGeometry(0.018 * H, 8, 6), 0xe03a4a, -0.06 * H + sx * 0.013 * H, ny * 0.62, -0.104 * H))); const hd = pxM2(new T.BoxGeometry(0.03 * H, 0.03 * H, 0.01 * H), 0xe03a4a, -0.06 * H, ny * 0.6, -0.104 * H); hd.rotation.z = Math.PI / 4; B.add(hd); }   // 愛心別針
    if (has('apron')) { B.add(pxM2(new T.BoxGeometry(0.15 * H, 0.2 * H, 0.012 * H), 0xffffff, 0, ny * 0.46, -0.108 * H), pxM2(new T.BoxGeometry(0.15 * H, 0.03 * H, 0.014 * H), 0xe07a1f, 0, ny * 0.58, -0.109 * H)); }   // 廚工圍裙
    if (has('kit')) { const k = new T.Group(); k.add(pxM2(new T.BoxGeometry(0.1 * H, 0.07 * H, 0.04 * H), 0xffffff, 0, 0, 0), pxM2(new T.BoxGeometry(0.05 * H, 0.014 * H, 0.042 * H), 0xd9302c, 0, 0, 0), pxM2(new T.BoxGeometry(0.014 * H, 0.05 * H, 0.042 * H), 0xd9302c, 0, 0, 0)); pxHand(ch, 'FistR', k); }   // 急救箱
    if (has('broom')) { const b = new T.Group(); b.add(pxM2(new T.CylinderGeometry(0.008 * H, 0.008 * H, 0.5 * H, 6), 0x8a6a3a, 0, 0.06 * H, 0), pxM2(new T.BoxGeometry(0.09 * H, 0.04 * H, 0.03 * H), 0xc9a96a, 0, -0.2 * H, 0)); pxHand(ch, 'FistR', b); }   // 掃把
    addProp(ch, 'Torso', B); pxPose(ch, [null, null]); g.add(ch.node);
    const lab = hwSprite(D.name, D.col); lab.position.set(0, H * 1.2 + 0.25, 0); g.add(lab);
    STF.list.push({ D, g, ch, lab, x: q[0], z: q[1], y: q[2], hx: q[0], hz: q[1], hy: q[2], tx: q[0], tz: q[1], wait: 1 + Math.random() * 4, walking: false });
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
      else { S.x += dx / L * step; S.z += dz / L * step; const gy = groundAt(S.x, S.y + 2.2, S.z); if (isFinite(gy) && Math.abs(gy - S.y) < 0.6) S.y = gy; S.g.position.set(S.x, S.y, S.z); S.g.rotation.y += angd(Math.atan2(dx, dz) + Math.PI, S.g.rotation.y) * Math.min(1, dt * 6); } }
    else { S.wait -= dt; if (S.wait <= 0) { const a = Math.random() * 6.283, r = 2 + Math.random() * D.R * 0.7, o = D.at ? stfOpen(S.hx + Math.cos(a) * r, S.hz + Math.sin(a) * r, D.lv || 0, S.hy) : hwFindOpen(S.hx + Math.cos(a) * r, S.hz + Math.sin(a) * r); if (Math.hypot(o[0] - S.hx, o[1] - S.hz) < D.R + 2 && stfClear(S.x, S.z, o[0], o[1], S.y)) { S.tx = o[0]; S.tz = o[1]; S.walking = true; } else S.wait = 1; } }
    const w = S.walking && !near; play(S.ch, w ? 'Walk' : 'Idle', 0.2); if (w && S.ch.act.Walk) S.ch.act.Walk.timeScale = 0.75 * D.sp;
    S.lab.visible = d > 3.2 && d < 30 && cs < 4;
  });
}
function stfInteract(cand, ds) { if (!STF.ready) return; STF.list.forEach(S => { const d = ds(S.x, S.z, S.y); if (d < 3.4) cand(d, '和 ' + S.D.name + ' 說話', () => stfTalk(S)); }); }
function stfMini(g, mp) { if (!STF.ready) return; STF.list.forEach(S => { const p = mp(S.x, S.z); g.fillStyle = S.D.col; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(p[0], p[1], 3.8, 0, 7); g.fill(); g.stroke(); }); }
function stfTalk(S) {
  const D = S.D, done = () => closePanels(), pick = () => D.lines[Math.floor(Math.random() * D.lines.length)];
  const menu = first => openDlg(D.role ? D.name + '（' + D.role + '）' : D.name, first ? '（' + D.name + '笑著向你揮揮手：）\n\n「你好呀！」' : '「' + pick() + '」', [{ t: '再聊聊', go: true, fn: () => menu(false) }, { t: '謝謝，再見', fn: done }]);
  menu(true);
}
