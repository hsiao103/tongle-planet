const { chromium } = require('playwright-core'); const fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1000,height:620}}); await ctx.addInitScript(fs.readFileSync('mock.js','utf8'));
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8765/test.html',{waitUntil:'domcontentloaded',timeout:200000}); await p.waitForFunction(()=>window.__npcs&&__npcs.length>8&&window.__mp&&__mp.MP.assets,null,{timeout:300000}); await p.waitForTimeout(1000);
 await p.evaluate(()=>{document.getElementById('iGo').click();__school.GT.mode='day';const S=__school;S.teleport(27,0.1,-15,0,-20);S.PL.yaw=0;S.cam.d=10;S.cam.curD=10;S.cam.elev=0.15;
  const names=['小明','阿花','小宇','美美','大雄','靜香','胖虎','小夫','哈利','妙麗','榮恩','柯南','小蘭','毛利','灰原','步美','光彥','元太','路飛','娜美','索隆','喬巴','魯夫2','香吉士'];
  window.__t0=0; const fake=names.map((n,i)=>({peer:'f'+i,by:null,isMe:false,sameTab:false,kind:'viewer',guest:false,updatedAt:0,presence:{}}));
  const real=__mp.MP.room; __mp.MP.room={presence:async()=>{},peers:()=>{const t=performance.now()/1000; fake.forEach((f,i)=>{const a=t*0.4+i*0.26,r=1.5+(i%4)*1.6; f.presence={x:27+Math.cos(a)*r,y:0.05,z:-22+Math.sin(a)*r,f:-a,s:i%3?2.2:0,a:0,k:i%2,nm:names[i]};}); return [{peer:'me',isMe:true,kind:'viewer',presence:{}},...fake];}};});
 await p.waitForTimeout(6000); await p.screenshot({path:'mp_25c.png'});
 console.log(await p.evaluate(()=>{const f=[];const t0=performance.now();for(let i=0;i<60;i++)__mp.mpTick(0.016);return JSON.stringify({rem:__mp.MP.rem.size,n:__mp.MP.n,msPerTick:((performance.now()-t0)/60).toFixed(2),draw:__school.renderer?__school.renderer.info.render.calls:null});}));
 console.log(errs); await b.close();})();
