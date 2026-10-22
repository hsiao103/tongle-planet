const { chromium } = require('playwright-core');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1000,height:620}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/test.html'); await p.waitForFunction(()=>window.__npcs&&__npcs.length>8,null,{timeout:120000}); await p.waitForTimeout(1500);
 await p.evaluate(()=>{document.getElementById('iGo').click();__hw.hwApply('halloween');}); await p.waitForTimeout(600);
 await p.evaluate(()=>{ const m=__hw.HWMON[2]; const S=__school; S.teleport(m.x,0.1,m.z+1.8,0,-20); });
 await p.waitForTimeout(4000);
 console.log(await p.evaluate(()=>document.getElementById('prompt').innerText));
 await p.keyboard.press('KeyE'); await p.waitForTimeout(300); await p.screenshot({path:'hw_d1.png'});
 // 走完對話：每次點「正確」答案
 const ok=['17','員山鄉'];
 for(let i=0;i<8;i++){ const done=await p.evaluate((ok)=>{const bs=[...document.querySelectorAll('#dlgB button')]; const t=bs.map(b=>b.textContent); let b=bs.find(b=>ok.includes(b.textContent))||bs.find(b=>['接受挑戰','下一題','再試一次','太好了！'].includes(b.textContent)); if(!b)return 'none:'+t; const lbl=b.textContent; b.click(); return lbl;},ok); if(i==1) await p.screenshot({path:'hw_d2.png'}); if(done==='太好了！')break; await p.waitForTimeout(150);}
 console.log(await p.evaluate(()=>JSON.stringify({done:__game.G.hw.done,inv:__game.G.inv,coins:__game.G.coins,btn:document.getElementById('bHw').textContent})));
 await p.evaluate(()=>{document.getElementById('bHw').click();}); await p.waitForTimeout(300); await p.screenshot({path:'hw_panel.png'});
 await p.evaluate(()=>{document.getElementById('hwpX').click();});
 // 存檔與還原
 const sv=await p.evaluate(()=>{const o=JSON.parse(localStorage.getItem('tongle_planet_v1'));return [o.edition,JSON.stringify(o.hw)]}); console.log(sv);
 await p.evaluate(()=>{__hw.hwApply('normal');}); await p.waitForTimeout(2500);
 console.log(await p.evaluate(()=>[__hw.HW.root.visible,__hw.HW.k.toFixed(2),document.getElementById('bEd').textContent,document.getElementById('bHw').hidden]));
 console.log(errs); await b.close();})();
