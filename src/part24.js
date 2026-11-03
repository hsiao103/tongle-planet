/* ===== 聊天室安全與管理（移植自同樂3D校園 Tlps-live 的聊天機制）=====
   ① 禁用語：內建約 600 個詞（諧音、拆字、英文縮寫、台語、暴力威脅、性霸凌…），忽略大小寫與全半形，字中間夾空白／符號也抓得到；另有「不誤遮」的正常用語清單
   ② 跨訊息偵測：同一人 20 秒內最近 6 則合起來湊成禁用語，也會遮
   ③ 雲端禁用語（管理頁新增，進遊戲載入、每 5 分鐘更新）＋ config.js 的 chatBannedWords
   ④ 禁言：管理者在管理頁禁言某帳號後，該帳號不能送出聊天（client 檢查＋資料表寫入被擋）
   ⑤ 聊天介面：放大、常用短句、聊天守則 */
  const CH_BADW = [   // 內建禁用語（含常見諧音、拆字、英文縮寫變體；空白與符號夾在中間也會被抓到）
    '幹你', '幹您', '幹妳', '幹林', '幹拎', '幹爆', '幹死', '幹譙', '干你', '干您', '肏', '操你', '操他', '操妳', '靠北', '靠杯', '靠邀', '靠腰', '靠夭', '靠爸', '靠悲',
    '雞掰', '機掰', '雞巴', '機巴', '雞八', '機八', '幾八', '幾掰', '雞歪', '三小', '啥小', '沙小', '殺小', '蝦小', '他媽', '他馬', '他嗎', '他瑪', '特嬤', '塔嗎', '塔媽', '妳媽', '你媽', '你娘', '妳娘', '嘰掰',
    '白痴', '白癡', '白吃', '柏吃', '智障', '智章', '智商低', '低能', '腦殘', '腦癱', '弱智', '去死', '去屎', '死一死', '死全家', '全家死', '死肥豬', '死胖子', '醜八怪', '肥豬', '賤人', '賤貨', '賤種', '婊', '妓女', '王八', '混蛋', '廢物', '垃圾人', '人渣', '畜生', '禽獸',
    '屌', '屌你', '懶叫', '懶覺', '龜頭', '陰莖', '陰道', '打炮', '約砲', '做愛', '性交', '口交', '強暴', '強姦', '色情', '成人影片', 'a片', '裸照', '裸體', '援交',
    '娘炮', '娘娘腔', '娘們', '人妖', '死同性戀', '死gay', '死基佬', '死玻璃', '男人婆', '三八婆', '死三八', '八婆', '肥婆', '臭女人', '賤女人', '死女人', '臭男人', '母豬', '查某', '女人就該', '女人就是', '女生就是', '女人只會', '女人不能', '女生不能', '男人都是', '女人都是', '女生都是', '男生都是', '女的都', '女人比不上', '女生比不上', '男尊女卑', '女人活該', '女生活該',
    '奶子', '咪咪', '巨乳', '大波妹', '乳頭', '小穴', '蜜穴', '淫蕩', '淫穢', '淫', '騷貨', '精液', '射精', '自慰', '手淫', '打手槍', '打飛機', '勃起', '陰蒂', '陰戶', '陰唇', '肉棒', '啪啪啪', '上床', '脫光', '全裸', '露點', '無碼', '女優', '色圖', '黃片', '黃色網站', '色色', '性愛', '性行為', '性騷擾他', '亂倫', '輪姦', '迷姦', '獸交', '人獸',
    'porn', 'porno', 'sexy', 'nsfw', 'hentai', 'blowjob', 'handjob', 'boobs', 'penis', 'vagina', 'whore', 'dildo', 'masturbat', 'nude', 'faggot', 'tranny', 'rape', 'sex',
    ...['射', '打', '砍', '殺', '捅', '勒', '淹', '燒', '摔', '踹', '毒', '弄', '斃', '宰', '掐'].flatMap(v => ['死', '了', '掉'].flatMap(r => ['你', '妳', '您', '他', '她', '祢'].map(o => v + r + o))),   // 暴力威脅：射死你、打死他、殺了你…（單講「打死怪物」不遮）
    '殺你', '殺妳', '殺他', '殺她', '殺全家', '殺光', '殺了全', '宰了你', '宰了他', '爆你頭', '爆頭你', '砍你', '砍妳', '打爆你', '打爆他', '轟爆你', '射你', '射妳', '開槍殺', '拿刀砍', '捅你', '燒死你', '找死', '該死', '怎麼不去死', '怎麼不死', '去自殺', '自殺吧', '跳樓吧', '去上吊', '尋死', '死掉算了', '消失吧', '滾蛋', '滾開',
    '性霸凌', '嘿咻', '嘿休', '黑咻', '黑休', '嘿咻咻', '哩咻', '嘿嘿咻', 'heixiu', '摸你', '摸妳', '摸他', '摸她', '亂摸', '摸胸', '摸奶', '摸屁股', '摸下面', '摸私處', '捏胸', '捏屁股', '抓胸', '脫褲子', '脫你褲', '脫妳褲', '脫他褲', '脫你衣', '脫妳衣', '脫他衣', '脫她衣', '扒褲', '扒光', '掀裙子', '掀你裙', '掀妳裙', '偷拍裙', '偷拍內', '偷看內褲', '看你內褲', '看妳內褲', '內褲顏色', '裸聊', '傳裸照', '傳私密照', '私密照', '光屁股', '露鳥', '露屌', '強吻', '強抱', '強脫', '性暗示', '約炮', '開房間', '開房',
    '姦夫', '奸夫', '淫婦', '蕩婦', '盪婦', '賤婦', '潑婦', '悍婦', '毒婦', '妖婦', '浪婦', '騷婦', '姦婦', '奸婦', '姘頭', '偷情', '通姦', '通奸', '搞外遇', '當小三', '做小三', '你是小三', '妳是小三', '狐狸精', '騷狐狸', '破鞋', '蕩女', '浪女', '淫娃', '淫女', '嫖客', '嫖妓', '召妓', '雞婆妹', '賣淫', '賣春', '色狼', '色魔', '色胚', '變態狂',
    '性騷擾', '性侵', '性騷', '性霸', '性騷擾他',
    '小三', '外遇',
    /* 台語髒話（國字、同音字、羅馬拼音） */
    '幹恁', '幹拎', '幹你老', '幹您老', '幹妳老', '幹伊', '幹七', '幹撟', '幹樵', '幹蕭', '幹噍', '幹娘', '幹他', '幹她', '駛恁', '駛你', '駛妳', '駛林', '駛拎', '駛伊', '駛娘', '駛啥', '使恁娘', '恁娘', '恁祖嬤', '恁祖媽', '拎北', '林北', '林杯', '拎杯', '拎娘', '拎祖',
    '啥潲', '啥洨', '三洨', '三潲', '三瀟', '啥瀟', '洨', '小洨洨', '賭爛', '賭濫', '賭瀾', '睹爛', '督爛', '肖仔', '肖查某', '肖話', '肖欸', '俗辣', '懶趴', '懶趴火', '老雞掰', '臭雞掰', '嘰哩', '嘰歪', '機歪', '雞歪', '北七', '白目仔', '賤胚', '破麻', '死老猴', '死囡仔', '死查某', '死查埔', '夭壽死', '乎你死', '哭爸', '哭母', '哭夭', '乞丐命', '龜孫', '龜子', '王八蛋', '烏龜王八', '靠木', '靠么', '靠母', '靠父', '靠爸', '靠北邊', '擱靠',
    'gan lin niang', 'ganlinniang', 'gan lin nai', 'ganlinnai', 'kao bei', 'kaobei', 'lan jiao', 'lanjiao',
    '小3', '小參', '小叁', '3小', '３小',
    'tmd', 'wtf', 'wdnmd', 'nmsl', 'cnm', 'cnmb', 'mdzz', 'fuck', 'fuk', 'fck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'slut', 'bastard', 'stfu', 'gtfo', 'nigger', 'nigga', 'retard'
  ];
  const CH_OKW = ['三小時', '三小朋友', '三小隻', '三小組', '四小時', '兩小時', '幾小時', '半小時', '全家死機', '色狼蛛', '防範色狼', '孕婦', '婦女', '主婦', '家庭主婦', '婦幼', '國小三', '小3個', '小3隻', '小3顆', '小3條', '小3公', '小3倍', '小3分', '小3元', '小3塊', '國小3', '小3年', '小3班', '小3生', '小3學', '小3的同', '小3的學', '小3的導', '小3的老', '小3的教', '小3導', '小3上', '小3下', '小3課', '小3小朋友', '升小3', '讀小3', '念小3', '上小3', '3小時', '三小時', '3小朋友', '三小朋友', '3小隻', '三小隻', '3小組', '三小組', '3小節', '三小節', '3小段', '三小段', '3小袋', '三小袋', '3小包', '三小包', '3小瓶', '三小瓶', '3小顆', '三小顆', '3小塊', '三小塊', '3小匙', '三小匙', '3小杯', '三小杯', '3小碗', '三小碗', '3小份', '三小份', '3小條', '三小條', '3小張', '三小張', '3小盒', '三小盒', '小三年', '小三班', '小三生', '小三學', '小三的同', '小三的學', '小三的導', '小三的老', '小三的教', '小三導', '小三上', '小三下', '小三課', '小三小朋友', '升小三', '讀小三', '念小三', '上小三', '靠北邊', '靠北京', '靠北方', '林北路', '林北區', '你老師好', '你老師說', '你老師教', '你老師有', '你老師是', '幹老師節', '幹部老師', '性侵害防治', '性騷擾防治', '性平', '脫褲子放屁', '摸摸你的頭', '摸你的頭', '開房間門', '開房門', '強吻不', 'heixiuxx', '打死不', '殺光怪', '殺光敵', '殺光所有怪', '滾開關', '滾蛋吧小', 'essex', 'middlesex', 'unisex', 'sussex', 'wessex', '上床鋪', '上床睡', '上床單', '八婆山', '八婆婆'];   // 含上述字詞但屬正常用語者，不遮蔽
const CHS = { cloud: [], muted: false, hist: {}, t: 0, big: false, admin: false, adminOn: false };
const chMid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const chBadList = () => CH_BADW.concat(CHS.cloud, (window.TONGLE_SUPABASE && window.TONGLE_SUPABASE.chatBannedWords) || []).map(x => String(x || '').trim()).filter(x => x.length > 0);
const CH_SEP = /[\s.\-_*·。，,、~!！?？|\/\\'"`^+=:;：；()（）\[\]【】<>＜＞]/;
function chNorm(str) { const ns = [], idx = []; for (let i = 0; i < str.length; i++) { for (const c of str[i].normalize('NFKC').toLowerCase()) { if (CH_SEP.test(c)) continue; ns.push(c); idx.push(i); } } return { s: ns.join(''), idx }; }
function chMask(t) {                                   // 忽略大小寫、全半形，並略過夾在字中間的空白／符號（例：「幹 你 娘」「f.u.c.k」）
  t = String(t == null ? '' : t); const N = chNorm(t), m = [], ok = [];
  CH_OKW.forEach(w => { const wn = chNorm(w).s; let p = 0, k; while (wn && (k = N.s.indexOf(wn, p)) >= 0) { for (let j = k; j < k + wn.length; j++) ok[j] = true; p = k + wn.length; } });
  chBadList().forEach(w => { const wn = chNorm(w).s; if (!wn) return; let p = 0, k; while ((k = N.s.indexOf(wn, p)) >= 0) { let skip = false; for (let j = k; j < k + wn.length; j++) if (ok[j]) skip = true; if (!skip) for (let j = N.idx[k]; j <= N.idx[k + wn.length - 1]; j++) m[j] = true; p = k + wn.length; } });
  return t.split('').map((c, i) => m[i] ? '＊' : c).join('');
}
function chChain(uid, t) {                             // 跨訊息偵測：回傳遮蔽後的最新這則
  const L = CHS.hist[uid] = (CHS.hist[uid] || []), now = Date.now();
  while (L.length && (now - L[0].t > 20000 || L.length >= 6)) L.shift();
  const prev = L.map(x => x.s).join(''), out = chMask(prev + t).slice(prev.length); L.push({ t: now, s: t }); return out;
}
const chNick = s => chMask(mpClean(s)) || '旅人';
/* ---- 雲端：禁用語、禁言名單 ---- */
async function chsLoad() {
  if (!SB.client || !SB.ch) return;
  try { const r = await SB.client.from('mp_badwords').select('word').limit(2000); if (r && r.data) CHS.cloud = r.data.map(x => x.word); } catch (e) { }
  try { const r = await SB.client.rpc('is_tongle_admin'); CHS.admin = !!(r && r.data === true); const b = document.getElementById('chAdm'); if (b) b.hidden = !CHS.admin; } catch (e) { }
  try { const s = await SB.client.auth.getSession(), uid = s && s.data && s.data.session && s.data.session.user.id; if (uid) { const r = await SB.client.from('mp_mutes').select('user_id').eq('user_id', uid); CHS.muted = !!(r && r.data && r.data.length); } } catch (e) { }
}
/* ---- 聊天介面：放大、短句、守則 ---- */
(function chUiInit() {
  const st = document.createElement('style');
  st.textContent = '#chp.chbig{position:fixed!important;left:4vw!important;top:12vh!important;width:92vw!important;max-width:none!important;height:72vh!important;max-height:none!important;z-index:30;display:flex;flex-direction:column}#chp.chbig #chLog{max-height:none;flex:1}'
    + '#chTools{display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap}#chTools button{padding:4px 10px;border:1px solid #c9a560;border-radius:999px;background:#fff8e8;color:#5a4320;font-size:13px;cursor:pointer}'
    + '#chQuick{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}#chQuick[hidden]{display:none}#chQuick button{padding:5px 10px;border:1px solid #d9c9a0;border-radius:999px;background:#fff;font-size:14px;cursor:pointer}.chm.sys{color:#8a6a2a;font-size:13px}';
  document.head.appendChild(st); const p = document.getElementById('chp'); if (!p) return;
  const tools = document.createElement('div'); tools.id = 'chTools';
  const bBig = document.createElement('button'); bBig.type = 'button'; bBig.textContent = '⤢ 放大'; bBig.onclick = () => { CHS.big = !CHS.big; p.classList.toggle('chbig', CHS.big); bBig.textContent = CHS.big ? '⤡ 縮小' : '⤢ 放大'; const l = document.getElementById('chLog'); if (l) l.scrollTop = l.scrollHeight; };
  const bQ = document.createElement('button'); bQ.type = 'button'; bQ.textContent = '😊 短句';
  const bR = document.createElement('button'); bR.type = 'button'; bR.textContent = '聊天守則'; bR.onclick = () => { if (typeof chAddSys === 'function') chAddSys('聊天守則：請友善交談；不說髒話、不嘲笑別人；不分享姓名、電話、住址；看到不舒服的內容可以「靜音」，也請告訴老師。聊天內容會保留 90 天供校方管理。'); };
  const bA = document.createElement('button'); bA.type = 'button'; bA.id = 'chAdm'; bA.hidden = true; bA.textContent = '🛠 管理'; bA.onclick = () => { CHS.adminOn = !CHS.adminOn; bA.style.background = CHS.adminOn ? '#ffd9a0' : ''; chRenderLog(); toast(CHS.adminOn ? '管理模式開啟：每則留言旁可刪除、修改、禁言' : '管理模式關閉', 2400); };
  tools.append(bBig, bQ, bR, bA); p.insertBefore(tools, p.firstChild);
  const qk = document.createElement('div'); qk.id = 'chQuick'; qk.hidden = true;
  ['大家好！', '一起玩～', '謝謝！', '好棒喔！', '等等我', '加油！', '哈哈哈', '我在這裡', '再見囉'].forEach(s => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s; b.onclick = () => { if (chSend(s)) qk.hidden = true; }; qk.appendChild(b); });
  bQ.onclick = () => { qk.hidden = !qk.hidden; }; const f = document.getElementById('chF'); p.insertBefore(qk, f);
  setInterval(() => { if (typeof SB !== 'undefined' && SB.ch) chsLoad(); }, 300000);
})();
function chAddSys(text) { CHAT.log.push({ id: '', nm: '系統', text, me: false, sys: true, t: Date.now() }); if (CHAT.log.length > 50) CHAT.log.shift(); chRenderLog(); }

/* ---- 管理者：在遊戲內刪除／修改留言、禁言（經資料庫函式驗證身分；其他玩家收到廣播後會向資料庫核對，偽造的指令無效）---- */
function chAdminBtns(row, m) {
  const mk = (t, fn, cls) => { const x = document.createElement('a'); x.textContent = t; x.style.cssText = 'margin-left:8px;color:' + (cls || '#c0392b'); x.onclick = fn; row.appendChild(x); };
  mk('刪除', () => chModDo('mp_mod_delete', { p_mid: m.mid }, m, '已刪除這則留言'));
  mk('修改', () => { const v = prompt('把這則留言改成（留空＝用＊遮掉）：', ''); if (v === null) return; chModDo('mp_mod_edit', { p_mid: m.mid, p_text: (v.trim() || '＊'.repeat(Math.min(6, Array.from(m.text).length))).slice(0, 80) }, m, '已修改這則留言'); }, '#1f6fd1');
  mk('禁言', () => { if (confirm('確定禁言「' + m.nm + '」？他之後不能發言。')) chModDo('mp_mod_mute', { p_mid: m.mid }, m, '已禁言「' + m.nm + '」'); }, '#8a4b00');
}
async function chModDo(fn, args, m, okMsg) {
  try {
    const r = await SB.client.rpc(fn, args);
    if (r.error) { toast('操作失敗：' + r.error.message, 3600); return; }
    const k = r.data; if (k != null && SB.ch) { try { SB.ch.send({ type: 'broadcast', event: 'mod', payload: { k } }); } catch (e) { } }
    chModApply({ action: fn.replace('mp_mod_', ''), mid: args.p_mid, text: args.p_text }); toast(okMsg, 2000);
  } catch (e) { toast('操作失敗', 2400); }
}
function chModApply(a) {
  if (!a || typeof a.mid !== 'string') return;
  if (a.action === 'delete') { CHAT.log = CHAT.log.filter(x => x.mid !== a.mid); const i = CHAT.bub.findIndex(b => b.mid === a.mid); if (i >= 0) chKill(CHAT.bub[i], i); }
  else if (a.action === 'edit') { CHAT.log.forEach(x => { if (x.mid === a.mid) { x.text = String(a.text || '').slice(0, 80); x.edited = true; } }); }
  else if (a.action === 'mute') { if (CHAT.mine.has(a.mid)) { CHS.muted = true; toast('你被管理者禁言了，不能再發言', 3200); } }
  chRenderLog();
}
async function chModIn(payload) {                       // 收到別人廣播的管理指令：向資料庫核對這筆指令是否真的存在（只有管理者的函式寫得進去）
  const k = payload && payload.k; if (k == null || !SB.client || !/^\d{1,12}$/.test(String(k))) return;
  try { const r = await SB.client.from('mp_mod_actions').select('action,mid,text').eq('id', k).limit(1); const a = r && r.data && r.data[0]; if (a) chModApply(a); } catch (e) { }
}
