const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:480,height:320}}); await ctx.addInitScript(fs.readFileSync('mock.js','utf8'));
 const mk=async(nick,x,z,kind)=>{const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.addInitScript(([n,k])=>{try{localStorage.setItem('tongle_nick',n);localStorage.setItem('tl3d_char',k)}catch(e){}},[nick,kind]);
  await p.goto('http://127.0.0.1:8765/test.html',{waitUntil:'domcontentloaded',timeout:200000}); await p.waitForFunction(()=>window.__npcs&&__npcs.length>8&&window.__mp&&__mp.MP.assets,null,{timeout:300000}); await p.waitForTimeout(1000);
  await p.evaluate(([x,z])=>{document.getElementById('iGo').click();__school.GT.mode='day';const S=__school;S.teleport(x,0.1,z,0,-20);S.cam.d=9;S.cam.curD=9;S.cam.elev=0.3;},[x,z]); p.errs=errs; return p;};
 const A=await mk('小明',27,-24,'boy'), B=await mk('阿花',29,-22,'girl');
 await A.waitForTimeout(6000);
 console.log(await A.evaluate(()=>JSON.stringify({n:__mp.MP.n,rem:[...__mp.MP.rem.values()].map(r=>[r.nm,r.kind,+r.x.toFixed(1),+r.z.toFixed(1)]),txt:document.getElementById('hOnline').textContent})));
 await A.screenshot({path:'mp_A.png'});
 // C 走動
 await B.close(); await A.waitForTimeout(4000);
 console.log(await A.evaluate(()=>JSON.stringify({n:__mp.MP.n,rem:[...__mp.MP.rem.values()].map(r=>r.nm)})));
 console.log(A.errs,B.errs); await b.close();})();
