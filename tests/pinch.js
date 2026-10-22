const { chromium } = require('playwright-core');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']});
 const p=await b.newPage({viewport:{width:800,height:500}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/test.html'); await p.waitForFunction(()=>window.__npcs&&__npcs.length>8,null,{timeout:120000}); await p.waitForTimeout(2000);
 const r=await p.evaluate(()=>{document.getElementById('iGo').click(); const S=__school, c=document.querySelector('#stage canvas'); S.cam.d=S.cam.curD=10;
  const ev=(t,id,x,y)=>c.dispatchEvent(new PointerEvent(t,{pointerId:id,clientX:x,clientY:y,bubbles:true,pointerType:'touch'}));
  const out={}; out.d0=S.cam.d; const f0=S.cam.fw.clone();
  ev('pointerdown',1,300,250); ev('pointerdown',2,500,250);
  ev('pointermove',1,200,250); ev('pointermove',2,600,250); out.d1=S.cam.d;          // 張開 → 拉近
  ev('pointermove',1,300,250); ev('pointermove',2,500,250); out.d2=S.cam.d;          // 捏合 → 拉遠
  const f1=S.cam.fw.clone(); ev('pointermove',1,300,200); ev('pointermove',2,500,300); out.rot=f0.angleTo(S.cam.fw)*180/Math.PI;   // 扭轉
  ev('pointerup',1,0,0); ev('pointerup',2,0,0);
  const f2=S.cam.fw.clone(); ev('pointerdown',3,400,250); ev('pointermove',3,500,250); out.one=f2.angleTo(S.cam.fw)*180/Math.PI; ev('pointerup',3,0,0); return out;});
 console.log(JSON.stringify(r),errs); await b.close();})();
