const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:480,height:320}}); await ctx.addInitScript(fs.readFileSync('mocksb.js','utf8'));
 const mk=async(nick,x,z,kind)=>{const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.addInitScript(([n,k])=>{try{localStorage.setItem('tongle_nick',n);localStorage.setItem('tl3d_char',k)}catch(e){}},[nick,kind]);
  await p.goto('http://127.0.0.1:8765/test.html',{waitUntil:'domcontentloaded',timeout:200000}); await p.waitForFunction(()=>window.__npcs&&__npcs.length>8&&window.__mp,null,{timeout:300000}); await p.waitForTimeout(1500);
  await p.evaluate(([x,z])=>{document.getElementById('iGo').click();__school.GT.mode='day';__school.teleport(x,0.1,z,0,-20);},[x,z]); p.errs=errs; return p;};
 const A=await mk('小明',27,-24,'boy'); const B=await mk('阿花',29,-22,'girl');
 for(const p of [A,B]){ console.log('btn',await p.evaluate(()=>{const e=document.getElementById('bOnline');return [e.hidden,e.textContent]})); await p.evaluate(()=>document.getElementById('bOnline').click()); }
 await A.waitForTimeout(5000);
 console.log(await A.evaluate(()=>JSON.stringify({n:__mp.MP.n,rem:[...__mp.MP.rem.values()].map(r=>[r.nm,r.kind,+r.x.toFixed(1),+r.z.toFixed(1)]),txt:document.getElementById('hOnline').textContent,btn:document.getElementById('bOnline').textContent})));
 console.log('Bbefore',await B.evaluate(()=>JSON.stringify({ch:!!__mp.SB.ch,mine:__mp.SB.mine}))); await B.evaluate(()=>document.getElementById('bOnline').click()); await B.waitForTimeout(3000);
 console.log(await A.evaluate(()=>JSON.stringify({n:__mp.MP.n,rem:__mp.MP.rem.size})));
 console.log(await B.evaluate(()=>JSON.stringify({ch:!!__mp.SB.ch,busy:__mp.SB.busy,mine:__mp.SB.mine,mproom:!!__mp.MP.room,key:__mp.SB.key})));console.log(await A.evaluate(()=>JSON.stringify({rm:__mp.SB.remote.size,mine:__mp.SB.mine,key:__mp.SB.key}))); console.log(A.errs,B.errs); await b.close();})();
